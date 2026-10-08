import {
	makeStyles,
	mergeClasses,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	tokens,
} from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
	surface: {
		backgroundColor: tokens.colorNeutralBackground1,
		border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
		borderRadius: tokens.borderRadiusMedium,
		overflow: 'hidden',
	},
	table: { tableLayout: 'fixed', width: '100%' },
	numeric: { textAlign: 'end', justifyContent: 'flex-end' },
	numericHeader: { justifyContent: 'flex-end' },
	secondary: { '@media (max-width: 639px)': { display: 'none' } },
	wide: { width: '32%' },
	actions: { width: '96px', textAlign: 'end' },
	actionsInner: { display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalXS },
	cellText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export type Column<T> = {
	key: string;
	label: string;
	render: (item: T) => ReactNode;
	/** Right-align the header and the values, for amounts, counts, and dates. */
	numeric?: boolean;
	/** Hide this column below 640 px wide. Mark every column except the main one and the most important value. */
	secondary?: boolean;
	/** Give the main column, such as a name or description, about a third of the width. */
	wide?: boolean;
};

/**
 * A read-and-act table on a bordered surface. Cells truncate with an ellipsis instead of running into the next column.
 * Put row actions, such as a delete button with a tooltip, in `actions`.
 */
export function DataTable<T>(props: {
	label: string;
	items: T[];
	columns: Column<T>[];
	getKey: (item: T) => string;
	actions?: (item: T) => ReactNode;
	actionsLabel?: string;
}) {
	const styles = useStyles();
	return (
		<div className={styles.surface}>
			<Table aria-label={props.label} className={styles.table}>
				<TableHeader>
					<TableRow>
						{props.columns.map((c) => (
							<TableHeaderCell
								key={c.key}
								className={mergeClasses(c.numeric && styles.numeric, c.secondary && styles.secondary, c.wide && styles.wide)}
								button={{ className: c.numeric ? styles.numericHeader : undefined }}
							>
								{c.label}
							</TableHeaderCell>
						))}
						{props.actions && <TableHeaderCell className={styles.actions} aria-label={props.actionsLabel ?? 'Actions'} />}
					</TableRow>
				</TableHeader>
				<TableBody>
					{props.items.map((item) => (
						<TableRow key={props.getKey(item)}>
							{props.columns.map((c) => (
								<TableCell key={c.key} className={mergeClasses(c.numeric && styles.numeric, c.secondary && styles.secondary)}>
									<div className={mergeClasses(styles.cellText, c.numeric && styles.numeric)}>{c.render(item)}</div>
								</TableCell>
							))}
							{props.actions && (
								<TableCell className={styles.actions}>
									<div className={styles.actionsInner}>{props.actions(item)}</div>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
