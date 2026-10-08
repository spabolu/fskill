import { Badge, Button, Input, makeStyles, Title3, tokens } from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { Root } from './Root';
const useStyles = makeStyles({
	card: { padding: tokens.spacingHorizontalM, color: tokens.colorNeutralForeground1, maxWidth: '960px' },
});
export function App() {
	const s = useStyles();
	return (
		<Root>
			<div className={s.card}>
				<Title3 as="h1">My tasks</Title3>
				<Input aria-label="Task" placeholder="Add a task" />
				<Button appearance="primary" icon={<AddRegular />}>Add task</Button>
				<Button>To Do</Button>
				<Badge appearance="outline" color="informative">Owner</Badge>
				<Badge appearance="tint" color="subtle">Travel</Badge>
			</div>
		</Root>
	);
}
