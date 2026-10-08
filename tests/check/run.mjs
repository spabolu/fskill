import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
const check = new URL('../../skills/fskill/scripts/check.mjs', import.meta.url).pathname;
const run = (dir) => spawnSync('node', [check, dir], { encoding: 'utf8', cwd: new URL('.', import.meta.url).pathname });

const bad = run('bad/src');
assert.equal(bad.status, 1, 'bad fixture fails');
const expected = ['css-file', 'provider-class', 'teams-theme', 'raw-px', 'raw-color', 'gradient', 'raw-font', 'raw-heading', 'native-control', 'inline-style', 'label-period', 'badge-subtle', 'title-case', 'emoji', 'import'];
const missing = expected.filter((id) => !new RegExp(`: ${id}\\.`).test(bad.stdout));
assert.deepEqual(missing, [], 'every rule fires on the bad fixture');

const good = run('good/src');
assert.equal(good.status, 0, `good fixture passes:\n${good.stdout}`);

const templates = run('../../skills/fskill/templates');
assert.ok(!/: (raw-|native|inline|provider-class|css-file|emoji|teams|import|gradient)/.test(templates.stdout), `templates are clean:\n${templates.stdout}`);
console.log('check.mjs tests passed');
