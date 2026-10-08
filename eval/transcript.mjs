import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const sessionID = process.argv[2];
const tmp = `/private/var/folders/46/76my2cwn7y1c628h0j7xms180000gn/T/opencode/transcript-${sessionID}.json`;
const get = (path) => {
	execSync(`opencode api get '${path}' > ${tmp}`, { cwd: '/tmp' });
	return JSON.parse(readFileSync(tmp, 'utf8'));
};
let page = get(`/api/session/${sessionID}/message`);
const messages = [...page.data];
for (let i = 0; i < 20 && page.cursor?.next && page.data.length; i++) {
	page = get(`/api/session/${sessionID}/message?cursor=${page.cursor.next}`);
	messages.push(...page.data);
}
const seen = new Set();
const calls = [];
for (const m of messages.sort((a, b) => a.time.created - b.time.created)) {
	for (const p of m.content ?? []) {
		if (p.type !== 'tool' || seen.has(p.id)) continue;
		seen.add(p.id);
		const input = p.state?.input ?? {};
		const what = input.path ?? input.command ?? input.pattern ?? '';
		calls.push(`${p.name}\t${String(what).replace(/\s+/g, ' ').slice(0, 140)}`);
	}
}
console.log(calls.join('\n'));
