import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from './runtime/node_modules/playwright-core/index.mjs';

const [round, onlyIds] = process.argv.slice(2);
const evalDir = new URL('.', import.meta.url).pathname;
const repoChecker = join(evalDir, '..', 'skills', 'fskill', 'scripts', 'check.mjs');
const runDir = join(evalDir, 'runs', round);
const manifest = JSON.parse(readFileSync(join(runDir, 'manifest.json'), 'utf8'));
const shots = join(runDir, 'shots');
const gates = join(runDir, 'gates');
mkdirSync(shots, { recursive: true });
mkdirSync(gates, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };

function serve(dir) {
	return new Promise((resolve) => {
		const server = createServer((req, res) => {
			let p = join(dir, decodeURIComponent(req.url.split('?')[0]));
			if (!existsSync(p) || statSync(p).isDirectory()) p = join(dir, 'index.html');
			res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
			res.end(readFileSync(p));
		});
		server.listen(0, () => resolve(server));
	});
}

const runCheck = (checker, dir) => {
	if (!existsSync(checker)) return null;
	const r = spawnSync('node', [checker, 'src'], { cwd: dir, encoding: 'utf8' });
	const ids = [...r.stdout.matchAll(/^(?!warning).*?: ([a-z-]+)\. /gm)].map((m) => m[1]);
	return { pass: r.status === 0, problems: ids.length, ids: [...new Set(ids)] };
};

async function pageHealth(page) {
	return page.evaluate(() => {
		const vh = window.innerHeight;
		const bigPortals = [...document.querySelectorAll('[data-portal-node]')].filter((p) => p.getBoundingClientRect().height > vh * 0.4).length;
		const text = document.body.innerText.trim().length;
		return { bigPortals, text };
	});
}

async function gateOne(browser, m) {
	const result = { id: m.id, task: m.task, arm: m.arm, model: m.model, seed: m.seed, failures: [], notes: [] };
	const fail = (f) => result.failures.push(f);
	const touched = existsSync(join(m.dir, 'src', 'App.tsx')) && !/<div>Hello<\/div>/.test(readFileSync(join(m.dir, 'src', 'App.tsx'), 'utf8'));
	if (!touched) fail('app not built: src/App.tsx is still the starter');

	const build = spawnSync('npm', ['run', 'build', '--silent'], { cwd: m.dir, encoding: 'utf8', timeout: 240000 });
	result.build = build.status === 0;
	if (!result.build) {
		fail('build failed');
		result.notes.push((build.stdout + build.stderr).split('\n').filter((l) => /error/i.test(l)).slice(0, 5).join(' | '));
	}
	result.checkOwn = runCheck(join(m.dir, '.opencode', 'skills', 'fskill', 'scripts', 'check.mjs'), m.dir);
	result.checkRepo = runCheck(repoChecker, m.dir);
	if (m.arm !== 'base' && result.checkOwn && !result.checkOwn.pass) fail(`fskill check fails: ${result.checkOwn.ids.join(',')}`);
	if (!result.build) return result;

	const server = await serve(join(m.dir, 'dist'));
	const url = `http://localhost:${server.address().port}/`;
	const errors = [];
	try {
		for (const [label, viewport] of [
			['mobile', { width: 390, height: 844 }],
			['desktop', { width: 1280, height: 800 }],
		]) {
			const page = await browser.newPage({ viewport, colorScheme: 'light' });
			page.on('pageerror', (e) => errors.push(e.message));
			page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
			await page.goto(url);
			await page.waitForTimeout(900);
			await page.screenshot({ path: join(shots, `${m.id}-${label}.png`) });
			const load = await pageHealth(page);
			if (load.text < 40) fail(`${label}: page nearly empty at load`);
			if (load.bigPortals) fail(`${label}: a popup layer covers the page at load`);
			if (label === 'mobile') {
				const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
				if (overflow > 4) fail(`mobile: page scrolls sideways by ${overflow}px`);
				await page.close();
				continue;
			}

			const iconButtons = page.locator('button[aria-label]:visible');
			const n = Math.min(await iconButtons.count(), 4);
			for (let i = 0; i < n; i++) {
				await iconButtons.nth(i).hover({ timeout: 2000 }).catch(() => {});
				await page.waitForTimeout(700);
				const h = await pageHealth(page);
				if (h.bigPortals) {
					fail('desktop: a tooltip layer covers the page');
					break;
				}
			}
			await page.mouse.move(1, 1);
			await page.locator('body').click({ position: { x: 1, y: 799 } }).catch(() => {});
			for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
			await page.waitForTimeout(400);
			await page.screenshot({ path: join(shots, `${m.id}-focus.png`) });

			if (m.task === 'todo') {
				await page.keyboard.press('Escape');
				const box = page.getByRole('textbox').first();
				let added = false;
				if (await box.count()) {
					await box.fill('Book flights to Seattle');
					await box.press('Enter');
					await page.waitForTimeout(400);
					added = (await page.getByText('Book flights to Seattle').count()) > 0;
				}
				if (!added) fail('todo: typing a task and pressing Enter did not add it');
				const check = page.getByRole('checkbox').first();
				if (await check.count()) {
					const before = await check.getAttribute('aria-checked').catch(() => null) ?? String(await check.isChecked().catch(() => ''));
					await check.click({ timeout: 3000 }).catch(() => fail('todo: first checkbox could not be clicked'));
					await page.waitForTimeout(300);
					const after = await check.getAttribute('aria-checked').catch(() => null) ?? String(await check.isChecked().catch(() => ''));
					if (before === after) result.notes.push('first checkbox state did not change after click (may have moved)');
				} else fail('todo: no checkbox');
			}

			await page.close();

			for (let attempt = 1; attempt <= 3; attempt++) {
				const fresh = await browser.newPage({ viewport, colorScheme: 'light' });
				fresh.on('pageerror', (e) => errors.push(e.message));
				await fresh.goto(url);
				await fresh.waitForTimeout(900);
				const del = fresh.getByRole('button', { name: /delete|remove/i }).and(fresh.locator(':not([disabled]):not([aria-disabled="true"])'));
				const before = await del.count();
				if (!before) {
					result.notes.push('no delete or remove button found');
					await fresh.close();
					break;
				}
				let clickError = null;
				await del.first().click({ timeout: 3000 }).catch((e) => (clickError = e.message.split('\n')[0]));
				await fresh.mouse.move(5, 400);
				await fresh.bringToFront();
				result.toastShown = await fresh.locator('.fui-Toast').first().waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false);
				await fresh.waitForTimeout(700);
				const after = await del.count();
				const dialogs = (await fresh.getByRole('dialog').count()) + (await fresh.getByRole('alertdialog').count());
				result.deleteOutcome = dialogs ? 'dialog' : after < before ? 'removed' : 'nothing';
				await fresh.screenshot({ path: join(shots, `${m.id}-after-delete.png`) });
				const toastGone = result.toastShown && !(await fresh.locator('.fui-Toast').count());
				if (toastGone && attempt < 3) {
					await fresh.close();
					continue;
				}
				if (toastGone) result.notes.push('toast was gone before the screenshot on all 3 tries');
				if (result.deleteOutcome === 'nothing' && clickError) fail(`desktop: delete or remove button could not be clicked: ${clickError.slice(0, 120)}`);
				else if (result.deleteOutcome === 'nothing') result.notes.push('first delete or remove click changed nothing visible (may open a menu)');
				const h = await pageHealth(fresh);
				if (h.bigPortals) fail('desktop: a popup layer covers the page after delete');
				await fresh.close();
				break;
			}
		}
	} finally {
		server.close();
	}
	const real = errors.filter((e) => !/favicon/i.test(e));
	if (real.length) fail(`console errors: ${real.slice(0, 2).join(' | ').slice(0, 200)}`);
	return result;
}

const todo = manifest.filter((m) => !onlyIds || onlyIds.split(',').includes(m.id));
const launch = () => chromium.launch({
	executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
});
const queue = [...todo];
await Promise.all(
	Array.from({ length: 2 }, async () => {
		const browser = await launch();
		while (queue.length) {
			const m = queue.shift();
			let r;
			try {
				r = await gateOne(browser, m);
			} catch (e) {
				r = { id: m.id, task: m.task, arm: m.arm, model: m.model, seed: m.seed, failures: [`gate crashed: ${e.message.slice(0, 200)}`] };
			}
			r.pass = r.failures.length === 0;
			writeFileSync(join(gates, `${m.id}.json`), JSON.stringify(r, null, 2));
			console.log(`${r.pass ? 'PASS' : 'FAIL'}\t${m.arm}\t${m.task}\t${m.model}\t${m.id}\t${r.failures.join('; ')}`);
		}
		await browser.close();
	}),
);
