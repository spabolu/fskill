import { tmpdir } from 'node:os';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [round, task, model, ...sources] = process.argv.slice(2);
const evalDir = new URL('.', import.meta.url).pathname;
const reviewRoot = join(process.env.FSKILL_EVAL_DIR ?? join(tmpdir(), 'fskill-eval'), 'review');
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
	const shotDir = join(evalDir, 'runs', b.round, 'shots');
	for (const f of readdirSync(shotDir).filter((f) => f.startsWith(`${b.id}-`) && f.endsWith('.png') && !f.endsWith('-focus.png'))) {
		copyFileSync(join(shotDir, f), join(reviewDir, `${label}-${f.slice(b.id.length + 1)}`));
	}
});
mkdirSync(join(evalDir, 'runs', round, 'judging'), { recursive: true });
writeFileSync(join(evalDir, 'runs', round, 'judging', `${slug}.key.json`), JSON.stringify(key, null, 2));
console.log(`${reviewDir}\t${Object.keys(key).join('')}`);
