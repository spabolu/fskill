import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';

const [round, arm, skillDir, models, onlyTasks, count] = process.argv.slice(2);
if (!round || !arm || !skillDir || !models) {
	console.log('usage: node make-workspaces.mjs <round> <arm> <skill dir or none> <model,model> [task,task]');
	process.exit(2);
}
const evalDir = new URL('.', import.meta.url).pathname;
const runtime = join(evalDir, 'runtime');
const projectsRoot = '/private/var/folders/46/76my2cwn7y1c628h0j7xms180000gn/T/opencode/projects';
const tasks = JSON.parse(readFileSync(join(evalDir, 'tasks.json'), 'utf8')).filter((t) => !onlyTasks || onlyTasks.split(',').includes(t.id));
const runDir = join(evalDir, 'runs', round);
mkdirSync(runDir, { recursive: true });
const manifestPath = join(runDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];

const files = {
	'package.json': (name) =>
		JSON.stringify(
			{
				name,
				private: true,
				type: 'module',
				scripts: { dev: 'vite', build: 'tsc --noEmit && vite build', preview: 'vite preview' },
				dependencies: {
					'@fluentui/react-components': '9.74.9',
					'@fluentui/react-icons': '2.0.343',
					react: '^18.3.1',
					'react-dom': '^18.3.1',
				},
				devDependencies: { '@types/react': '^18.3.12', '@types/react-dom': '^18.3.1', '@vitejs/plugin-react': '^5.0.0', typescript: '^5.6.3', vite: '^7.1.0' },
			},
			null,
			2,
		) + '\n',
	'tsconfig.json': () =>
		JSON.stringify(
			{
				compilerOptions: {
					target: 'ES2022',
					lib: ['ES2022', 'DOM', 'DOM.Iterable'],
					module: 'ESNext',
					moduleResolution: 'bundler',
					jsx: 'react-jsx',
					strict: true,
					noEmit: true,
					skipLibCheck: true,
				},
				include: ['src'],
			},
			null,
			2,
		) + '\n',
	'vite.config.ts': () => "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({ plugins: [react()], base: './' });\n",
	'index.html': (name) =>
		`<!doctype html>\n<html lang="en">\n\t<head>\n\t\t<meta charset="UTF-8" />\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n\t\t<title>${name}</title>\n\t</head>\n\t<body>\n\t\t<div id="root"></div>\n\t\t<script type="module" src="/src/main.tsx"></script>\n\t</body>\n</html>\n`,
	'src/main.tsx': () =>
		"import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { App } from './App';\n\ncreateRoot(document.getElementById('root')!).render(\n\t<StrictMode>\n\t\t<App />\n\t</StrictMode>,\n);\n",
	'src/App.tsx': () => 'export function App() {\n\treturn <div>Hello</div>;\n}\n',
};

for (const task of tasks) {
	for (const model of models.split(',')) {
		for (let seed = 1; seed <= (count ? Number(count) : task.seeds); seed++) {
			const id = `${task.project}-${randomBytes(2).toString('hex')}`;
			const dir = join(projectsRoot, id);
			mkdirSync(join(dir, 'src'), { recursive: true });
			for (const [f, make] of Object.entries(files)) writeFileSync(join(dir, f), make(task.project));
			symlinkSync(join(runtime, 'node_modules'), join(dir, 'node_modules'));
			if (skillDir !== 'none') cpSync(skillDir, join(dir, '.opencode', 'skills', 'fskill'), { recursive: true });
			manifest.push({ id, dir, task: task.id, hidden: task.hidden, arm, model, seed });
		}
	}
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(manifest.filter((m) => m.arm === arm).map((m) => `${m.id}\t${m.task}\t${m.model}\t${m.seed}`).join('\n'));
