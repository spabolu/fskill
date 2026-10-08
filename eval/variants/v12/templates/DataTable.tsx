import {
	Caption1,
	Checkbox,
	makeStyles,
	mergeClasses,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	TableSelectionCell,
	tokens,
} from '@fluentui/react-components';
import { useEffect, useState, type ReactNode } from 'react';

const useStyles = makeStyles({
	surface: {
		backgroundColor: tokens.colorNeutralBackground1,
		border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
		borderRadius: tokens.borderRadiusMedium,
		overflow: 'hidden',
	},
	table: { tableLayout: 'fixed', width: '100%' },
	numeric: { textAlign: 'end', justifyContent: 'flex-end' },
	numericWidth: { width: '128px' },
	numericHeader: { justifyContent: 'flex-end' },
	wide: { width: '36%' },
	actions: { width: '96px', textAlign: 'end' },
	actionsInner: { display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalXS },
	cellText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
	phoneRow: {
		display: 'flex',
		alignItems: 'center',
		gap: tokens.spacingHorizontalS,
		padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
		':not(:last-child)': { borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}` },
	},
	phoneMain: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXXS, flexGrow: 1, minWidth: 0 },
	phoneTop: { display: 'flex', alignItems: 'baseline', gap: tokens.spacingHorizontalS },
	phonePrimary: { flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
	phoneMeta: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		columnGap: tokens.spacingHorizontalS,
		rowGap: tokens.spacingVerticalXXS,
		color: tokens.colorNeutralForeground2,
	},
});

export type Column<T> = {
	key: string;
	label: string;
	render: (item: T) => ReactNode;
	/** Right-align the header and the values, for amounts and counts. Put numeric columns last, just before the actions. */
	numeric?: boolean;
	/** Leave this column out of the phone layout. Use it for values a phone user can skip, such as a last-active date. */
	secondary?: boolean;
	/** Give the column with the longest values, such as an email or description, more room. */
	wide?: boolean;
};

/** Pass `selected` and `onSelectionChange` when the user acts on several rows at once. Show the bulk commands in a `Toolbar` above the table while anything is selected. */
export type Selection = { selected: ReadonlySet<string>; onSelectionChange: (next: Set<string>) => void };

const phoneQuery = typeof window === 'undefined' ? null : window.matchMedia('(max-width: 639px)');

/**
 * A read-and-act table on a bordered surface. Cells truncate with an ellipsis instead of running into the next column.
 * Below 640 px wide it becomes a stacked list: the first column on top, the first numeric column on its right,
 * and the other columns in a caption line underneath. Put row actions, such as a delete button with a tooltip, in `actions`.
 * Cell text uses regular weight, with no bold.
 */
export function DataTable<T>(props: {
	label: string;
	items: T[];
	columns: Column<T>[];
	getKey: (item: T) => string;
	actions?: (item: T) => ReactNode;
	actionsLabel?: string;
	selection?: Selection;
}) {
	const styles = useStyles();
	const [phone, setPhone] = useState(phoneQuery?.matches ?? false);
	useEffect(() => {
		const onChange = (e: MediaQueryListEvent) => setPhone(e.matches);
		if (!phoneQuery) return;
		phoneQuery.addEventListener('change', onChange);
		return () => phoneQuery.removeEventListener('change', onChange);
	}, []);
	const sel = props.selection;
	const keys = props.items.map(props.getKey);
	const picked = keys.filter((k) => sel?.selected.has(k)).length;
	const toggle = (key: string) => {
		if (!sel) return;
		const next = new Set(sel.selected);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		sel.onSelectionChange(next);
	};
	const toggleAll = () => sel?.onSelectionChange(picked === keys.length ? new Set() : new Set(keys));

	if (phone) {
		const [primary, ...rest] = props.columns;
		const amount = rest.find((c) => c.numeric);
		const meta = rest.filter((c) => c !== amount && !c.secondary);
		return (
			<div className={styles.surface} role="list" aria-label={props.label}>
				{props.items.map((item) => (
					<div key={props.getKey(item)} role="listitem" className={styles.phoneRow}>
						{sel && (
							<Checkbox
								checked={sel.selected.has(props.getKey(item))}
								onChange={() => toggle(props.getKey(item))}
								aria-label={`Select ${props.label} row`}
							/>
						)}
						<div className={styles.phoneMain}>
							<div className={styles.phoneTop}>
								<span className={styles.phonePrimary}>{primary.render(item)}</span>
								{amount && <span>{amount.render(item)}</span>}
							</div>
							{meta.length > 0 && (
								<Caption1 className={styles.phoneMeta}>
									{meta.map((c) => (
										<span key={c.key}>{c.render(item)}</span>
									))}
								</Caption1>
							)}
						</div>
						{props.actions && <div className={styles.actionsInner}>{props.actions(item)}</div>}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className={styles.surface}>
			<Table aria-label={props.label} className={styles.table}>
				<TableHeader>
					<TableRow>
						{sel && (
							<TableSelectionCell
								checked={picked === 0 ? false : picked === keys.length ? true : 'mixed'}
								onClick={toggleAll}
								checkboxIndicator={{ 'aria-label': 'Select all rows' }}
							/>
						)}
						{props.columns.map((c) => (
							<TableHeaderCell
								key={c.key}
								className={mergeClasses(c.numeric && styles.numeric, c.wide && styles.wide, c.numeric && styles.numericWidth)}
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
						<TableRow
							key={props.getKey(item)}
							aria-selected={sel ? sel.selected.has(props.getKey(item)) : undefined}
							appearance={sel?.selected.has(props.getKey(item)) ? 'brand' : 'none'}
						>
							{sel && (
								<TableSelectionCell
									checked={sel.selected.has(props.getKey(item))}
									onClick={() => toggle(props.getKey(item))}
									checkboxIndicator={{ 'aria-label': 'Select row' }}
								/>
							)}
							{props.columns.map((c) => (
								<TableCell key={c.key} className={mergeClasses(c.numeric && styles.numeric)}>
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
