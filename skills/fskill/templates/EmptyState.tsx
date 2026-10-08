import { Body1, makeStyles, Subtitle2, tokens } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
	root: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: tokens.spacingVerticalS,
		padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXXL}`,
		textAlign: 'center',
		color: tokens.colorNeutralForeground2,
	},
	icon: { fontSize: tokens.fontSizeHero900, color: tokens.colorNeutralForeground3 },
	action: { marginTop: tokens.spacingVerticalS },
});

export function EmptyState(props: { icon?: ReactNode; title: string; body: string; action?: ReactNode }) {
	const styles = useStyles();
	return (
		<div className={styles.root}>
			{props.icon && <span className={styles.icon}>{props.icon}</span>}
			<Subtitle2 as="h2">{props.title}</Subtitle2>
			<Body1>{props.body}</Body1>
			{props.action && <div className={styles.action}>{props.action}</div>}
		</div>
	);
}
