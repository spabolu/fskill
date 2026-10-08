#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.argv[2] ?? 'src';
if (!existsSync(root)) {
	console.log(`No ${root} directory. Pass the app's source folder, as in: node check.mjs src`);
	process.exit(2);
}

const sizeProps =
	/\b(width|height|minWidth|maxWidth|minHeight|maxHeight|flexBasis|inlineSize|blockSize|top|left|right|bottom|inset|gridTemplateColumns|gridTemplateRows)\s*:\s*(['"`])[^'"`]*\2/g;
const otherUi =
	/^(@mui\/|@material-ui\/|antd|@ant-design\/|@chakra-ui\/|@mantine\/|bootstrap|react-bootstrap|tailwindcss|styled-components|@emotion\/|framer-motion|motion|@headlessui\/|@radix-ui\/|semantic-ui|@fluentui\/react$|office-ui-fabric-react|lucide-react|react-icons|@heroicons\/|@fortawesome\/|classnames|clsx)|\.(s?css|less|sass)$/;

const lineRules = [
	{ id: 'raw-color', test: (l) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(l), fix: 'Use a tokens.color* value' },
	{ id: 'gradient', test: (l) => /gradient\(/.test(l), fix: 'Remove the gradient. Use a flat tokens.colorNeutralBackground* or colorBrandBackground' },
	{
		id: 'raw-px',
		test: (l) => /\b\d+(\.\d+)?px\b/.test(l.replace(sizeProps, '').replace(/matchMedia\([^)]*\)|@media[^'"`]*/g, '')),
		fix: 'Use a tokens.spacing*, borderRadius*, fontSize*, or lineHeight* value. Raw px is only for layout sizes such as maxWidth',
	},
	{ id: 'raw-font', test: (l) => /fontFamily\s*:\s*['"`]|fontWeight\s*:\s*['"`]?\d/.test(l), fix: 'Use tokens.fontFamily* and tokens.fontWeight*, or a typography component' },
	{ id: 'inline-style', test: (l) => /style=\{\{/.test(l), fix: 'Move the style into makeStyles' },
	{ id: 'native-control', test: (l) => /<(button|input|select|textarea)\b/.test(l) && !/<input\b[^>]*type=["']file["']/.test(l), fix: 'Use the Fluent component: Button, Input, Dropdown, or Textarea' },
	{ id: 'raw-heading', test: (l) => /<h[1-6]\b/.test(l), fix: 'Use a Fluent typography component with as="h1", such as <Title3 as="h1">' },
	{ id: 'emoji', test: (l) => /\p{Extended_Pictographic}/u.test(l.replace(/[©®™]/g, '')), fix: 'Use an icon from @fluentui/react-icons or plain text' },
	{ id: 'teams-theme', test: (l) => /\bteams(Light|Dark|HighContrast)Theme\b/.test(l), fix: 'Use webLightTheme and webDarkTheme. The Teams themes give a web app the Teams purple' },
	{
		id: 'label-period',
		test: (l) => /\b(label|placeholder|aria-label|content)=["'][^"']*[^.]\.["']/.test(l),
		fix: 'Drop the period. Labels, placeholders, and tooltips take no period',
	},
	{
		id: 'title-case',
		warn: true,
		test: (l) => /<(Button|ToolbarButton|MenuItem|Tab|Title\d|Subtitle\d|DialogTitle|Label)\b[^>]*>\s*([A-Z][a-z]+(\s+[A-Z][a-z]+)+)\s*</.test(l),
		fix: 'Check the case. Use sentence case, as in "Add task", unless the words are a proper noun such as a product name',
	},
	{
		id: 'import',
		test: (l) => {
			const m = l.match(/^\s*import\b.*from\s+['"]([^'"]+)['"]/) ?? l.match(/^\s*import\s+['"]([^'"]+)['"]/);
			return m && otherUi.test(m[1]);
		},
		fix: 'Remove this UI, styling, icon, or animation library. Fluent covers it. Keep routers, data, and other non-UI libraries',
	},
];

function walk(dir) {
	return readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? (f === 'node_modules' ? [] : walk(p)) : [p];
	});
}

const files = walk(root);
const code = files.filter((f) => /\.(t|j)sx?$/.test(f));
const problems = [];
const warnings = [];
for (const f of files) {
	if (extname(f) === '.css') problems.push(`${relative('.', f)}: css-file. Move these styles into makeStyles and delete the file.`);
}
for (const f of code) {
	const text = readFileSync(f, 'utf8');
	for (const m of text.matchAll(/<FluentProvider\b[^>]*?\b(className|style)=/g)) {
		const line = text.slice(0, m.index).split('\n').length;
		problems.push(
			`${relative('.', f)}:${line}: provider-class. Remove ${m[1]} from FluentProvider. Fluent copies it onto every tooltip, menu, and toast layer, and a size rule blanks the page. Size an inner element instead.`,
		);
	}
	for (const m of text.matchAll(/<Badge\b[^>]*>/g)) {
		if (!/color=["']subtle["']/.test(m[0]) || /appearance=["']tint["']/.test(m[0])) continue;
		const line = text.slice(0, m.index).split('\n').length;
		problems.push(
			`${relative('.', f)}:${line}: badge-subtle. Use color="informative" for a neutral badge. color="subtle" is a white badge for dark surfaces and disappears on a white page.`,
		);
	}
	text.split('\n').forEach((line, i) => {
		const src = line.replace(/\/\/.*$/, '');
		for (const r of lineRules) if (r.test(src)) (r.warn ? warnings : problems).push(`${relative('.', f)}:${i + 1}: ${r.id}. ${r.fix}.\n    ${line.trim()}`);
	});
}
const all = code.map((f) => readFileSync(f, 'utf8')).join('\n');
if (!/<FluentProvider\b/.test(all) && !/<Root\b/.test(all)) problems.push('no-provider. Wrap the app in the Root template or FluentProvider with webLightTheme.');

if (warnings.length) console.log(warnings.map((w) => 'warning ' + w).join('\n') + '\n');
if (problems.length) {
	console.log(problems.join('\n'));
	console.log(`\n${problems.length} problem(s). Fix each one. Keep one only if no Fluent token or component can express it.`);
	process.exit(1);
}
console.log(`fskill check passed for ${code.length} file(s).`);
