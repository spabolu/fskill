import { FluentProvider, teamsLightTheme, makeStyles, Badge, Button, Input, Title3 } from '@fluentui/react-components';
import { motion } from 'framer-motion';
const useStyles = makeStyles({
	root: { height: '100%' },
	card: { padding: '12px', color: '#333', background: 'linear-gradient(red, blue)', fontWeight: 600, maxWidth: '960px' },
});
export function App() {
	const s = useStyles();
	return (
		<FluentProvider
			theme={teamsLightTheme}
			className={s.root}
		>
			<h1>Tasks</h1>
			<Title3>My Tasks</Title3>
			<button style={{ margin: 0 }}>Add</button>
			<Input placeholder="Add a task." />
			<Button>Add New Task</Button>
			<span>🎉</span>
			<Badge
				appearance="outline"
				color="subtle"
			>
				Owner
			</Badge>
		</FluentProvider>
	);
}
