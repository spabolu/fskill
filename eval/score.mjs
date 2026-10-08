import { tmpdir } from 'node:os';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const [round, armUnderTest = 'v1', baseArm = 'base'] = process.argv.slice(2);
const evalDir = new URL('.', import.meta.url).pathname;
const judging = join(evalDir, 'runs', round, 'judging');
const reviewRoot = join(process.env.FSKILL_EVAL_DIR ?? join(tmpdir(), 'fskill-eval'), 'review');
const gateOf = (r, id) => {
	const p = join(evalDir, 'runs', r, 'gates', `${id}.json`);
	return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
};

const rows = [];
for (const f of readdirSync(judging).filter((f) => f.endsWith('.key.json'))) {
	const slug = f.replace('.key.json', '');
	const scoresPath = join(reviewRoot, slug, 'scores.json');
	if (!existsSync(scoresPath)) {
		console.log(`missing scores for ${slug}`);
		continue;
	}
	const key = JSON.parse(readFileSync(join(judging, f), 'utf8'));
	const scores = JSON.parse(readFileSync(scoresPath, 'utf8'));
	const task = slug.split('-')[1];
	const model = slug.split('-').slice(2).join('-');
	for (const [label, k] of Object.entries(key)) {
		const s = scores[label];
		if (!s) continue;
		const gate = gateOf(k.round, k.id);
		rows.push({ slug, task, model, label, arm: k.arm, id: k.id, m365: s.m365, restraint: s.restraint, broken: !!s.broken, pass: gate?.pass ?? null, failures: gate?.failures ?? [] });
	}
}

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const fmt = (a) => `${mean(a).toFixed(1)} [${Math.min(...a)}-${Math.max(...a)}]`;
const groups = [...new Set(rows.map((r) => r.task))];
const summary = [];
for (const task of groups) {
	const t = rows.filter((r) => r.task === task);
	const v = t.filter((r) => r.arm === armUnderTest);
	const b = t.filter((r) => r.arm === baseArm);
	let wins = 0;
	let pairs = 0;
	for (const slug of new Set(t.map((r) => r.slug))) {
		for (const x of v.filter((r) => r.slug === slug))
			for (const y of b.filter((r) => r.slug === slug)) {
				pairs++;
				const d = x.m365 + x.restraint - (y.m365 + y.restraint);
				wins += d > 0 ? 1 : d === 0 ? 0.5 : 0;
			}
	}
	summary.push({
		task,
		[`${armUnderTest} m365`]: v.length ? fmt(v.map((r) => r.m365)) : '-',
		[`${armUnderTest} restraint`]: v.length ? fmt(v.map((r) => r.restraint)) : '-',
		[`${baseArm} m365`]: b.length ? fmt(b.map((r) => r.m365)) : '-',
		[`${baseArm} restraint`]: b.length ? fmt(b.map((r) => r.restraint)) : '-',
		'pair wins': pairs ? `${wins}/${pairs} (${Math.round((100 * wins) / pairs)}%)` : '-',
		[`${armUnderTest} gates`]: `${v.filter((r) => r.pass).length}/${v.length}`,
		[`${baseArm} gates`]: `${b.filter((r) => r.pass).length}/${b.length}`,
		[`${armUnderTest} judged broken`]: `${v.filter((r) => r.broken).length}/${v.length}`,
		[`${baseArm} judged broken`]: `${b.filter((r) => r.broken).length}/${b.length}`,
	});
}
console.table(summary);
for (const r of rows.filter((r) => r.pass === false)) console.log(`gate fail\t${r.arm}\t${r.task}\t${r.model}\t${r.id}\t${r.failures.join('; ')}`);
