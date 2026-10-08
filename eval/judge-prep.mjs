import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [round, task, model, ...sources] = process.argv.slice(2);
const evalDir = new URL('.', import.meta.url).pathname;
const reviewRoot = '/private/var/folders/46/76my2cwn7y1c628h0j7xms180000gn/T/opencode/review';
const modelShort = model.split('/').pop().replace(/[^a-z0-9]+/gi, '-');
const slug = `${round}-${task}-${modelShort}`;
const reviewDir = join(reviewRoot, slug);
mkdirSync(reviewDir, { recursive: true });

const builds = sources.flatMap((s) => {
	const [r, arm] = s.split(':');
	const manifest = JSON.parse(readFileSync(join(evalDir, 'runs', r, 'manifest.json'), 'utf8'));
	return manifest.filter((m) => !m.excluded && m.task === task && m.model === model && m.arm === arm).map((m) => ({ ...m, round: r }));
});
for (let i = builds.length - 1; i > 0; i--) {
	const j = Math.floor(Math.random() * (i + 1));
	[builds[i], builds[j]] = [builds[j], builds[i]];
}
const key = {};
builds.forEach((b, i) => {
	const label = String.fromCharCode(65 + i);
	key[label] = { id: b.id, arm: b.arm, round: b.round };
	for (const kind of ['desktop', 'mobile', 'after-delete']) {
		const src = join(evalDir, 'runs', b.round, 'shots', `${b.id}-${kind}.png`);
		if (existsSync(src)) copyFileSync(src, join(reviewDir, `${label}-${kind}.png`));
	}
});
mkdirSync(join(evalDir, 'runs', round, 'judging'), { recursive: true });
writeFileSync(join(evalDir, 'runs', round, 'judging', `${slug}.key.json`), JSON.stringify(key, null, 2));
console.log(`${reviewDir}\t${Object.keys(key).join('')}`);
