import {
	Avatar,
	Body1,
	Hamburger,
	makeStyles,
	mergeClasses,
	NavDrawer,
	NavDrawerBody,
	NavItem,
	SearchBox,
	Subtitle2,
	Title3,
	Toaster,
	tokens,
} from '@fluentui/react-components';
import { useEffect, useState, type ReactNode } from 'react';

const useStyles = makeStyles({
	shell: {
		display: 'flex',
		flexDirection: 'column',
		height: '100dvh',
		backgroundColor: tokens.colorNeutralBackground2,
		color: tokens.colorNeutralForeground1,
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		gap: tokens.spacingHorizontalM,
		height: '48px',
		flexShrink: 0,
		paddingInline: tokens.spacingHorizontalXXL,
		backgroundColor: tokens.colorNeutralBackground1,
		'@media (max-width: 639px)': { paddingInline: tokens.spacingHorizontalL },
		borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
	},
	brandTile: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '28px',
		height: '28px',
		flexShrink: 0,
		borderRadius: tokens.borderRadiusMedium,
		backgroundColor: tokens.colorBrandBackground,
		color: tokens.colorNeutralForegroundOnBrand,
		fontSize: tokens.fontSizeBase500,
	},
	appName: { whiteSpace: 'nowrap' },
	headerCenter: {
		flexGrow: 1,
		display: 'flex',
		justifyContent: 'center',
		minWidth: 0,
		'@media (max-width: 639px)': { display: 'none' },
	},
	headerSearch: { width: '100%', maxWidth: '480px' },
	spacer: { flexGrow: 1, '@media (min-width: 640px)': { display: 'none' } },
	pageSearch: { '@media (min-width: 640px)': { display: 'none' } },
	body: { display: 'flex', flexGrow: 1, minHeight: 0 },
	main: {
		flexGrow: 1,
		minWidth: 0,
		overflowY: 'auto',
		padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
		'@media (max-width: 639px)': { padding: tokens.spacingHorizontalL },
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalL,
		marginInline: 'auto',
		maxWidth: '1200px',
	},
	list: { maxWidth: '960px' },
	form: { maxWidth: '720px' },
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: tokens.spacingHorizontalM,
		flexWrap: 'wrap',
		minHeight: '32px',
	},
	description: { color: tokens.colorNeutralForeground2, marginTop: `calc(${tokens.spacingVerticalM} * -1)` },
});

export type Section = { value: string; label: string; icon: JSX.Element };

const narrowQuery = window.matchMedia('(max-width: 639px)');

export type ShellSearch = { placeholder: string; value: string; onChange: (value: string) => void };

/**
 * `title` names the view, such as "My tasks" or "Team members". Never repeat `appName` there.
 * `width`: "table" for data tables, "list" for lists and dashboards, "form" for settings and forms.
 * `search` filters the view's main list. It sits in the header on wide screens and above the content on phones.
 * Pass `sections` only when the app has two or more separate areas.
 */
export function AppShell(props: {
	appName: string;
	appIcon: ReactNode;
	search?: ShellSearch;
	userName?: string;
	title: string;
	description?: string;
	titleActions?: ReactNode;
	width: 'table' | 'list' | 'form';
	sections?: Section[];
	selected?: string;
	onSelect?: (value: string) => void;
	toasterId?: string;
	children: ReactNode;
}) {
	const styles = useStyles();
	const [narrow, setNarrow] = useState(narrowQuery.matches);
	const [navOpen, setNavOpen] = useState(!narrowQuery.matches);
	useEffect(() => {
		const onChange = (e: MediaQueryListEvent) => {
			setNarrow(e.matches);
			setNavOpen(!e.matches);
		};
		narrowQuery.addEventListener('change', onChange);
		return () => narrowQuery.removeEventListener('change', onChange);
	}, []);
	const sections = props.sections ?? [];
	const hasNav = sections.length > 1;

	return (
		<div className={styles.shell}>
			<header className={styles.header}>
				{hasNav && narrow && <Hamburger onClick={() => setNavOpen((o) => !o)} aria-label="Navigation" />}
				<span className={styles.brandTile}>{props.appIcon}</span>
				<Subtitle2 className={styles.appName}>{props.appName}</Subtitle2>
				<div className={styles.headerCenter}>
					{props.search && (
						<SearchBox
							className={styles.headerSearch}
							appearance="filled-darker"
							placeholder={props.search.placeholder}
							aria-label={props.search.placeholder}
							value={props.search.value}
							onChange={(_, d) => props.search?.onChange(d.value)}
						/>
					)}
				</div>
				<div className={styles.spacer} />
				{props.userName && <Avatar name={props.userName} size={32} />}
			</header>
			<div className={styles.body}>
				{hasNav && (
					<NavDrawer
						type={narrow ? 'overlay' : 'inline'}
						open={navOpen}
						onOpenChange={(_, d) => setNavOpen(d.open)}
						selectedValue={props.selected}
						onNavItemSelect={(_, d) => {
							props.onSelect?.(String(d.value));
							if (narrow) setNavOpen(false);
						}}
					>
						<NavDrawerBody>
							{sections.map((s) => (
								<NavItem key={s.value} value={s.value} icon={s.icon}>
									{s.label}
								</NavItem>
							))}
						</NavDrawerBody>
					</NavDrawer>
				)}
				<main className={styles.main}>
					<div className={mergeClasses(styles.column, props.width === 'list' && styles.list, props.width === 'form' && styles.form)}>
						<div className={styles.titleRow}>
							<Title3 as="h1">{props.title}</Title3>
							{props.titleActions}
						</div>
						{props.description && <Body1 className={styles.description}>{props.description}</Body1>}
						{props.search && narrow && (
							<SearchBox
								className={styles.pageSearch}
								placeholder={props.search.placeholder}
								aria-label={props.search.placeholder}
								value={props.search.value}
								onChange={(_, d) => props.search?.onChange(d.value)}
							/>
						)}
						{props.children}
					</div>
				</main>
			</div>
			<Toaster toasterId={props.toasterId} position="bottom-end" />
		</div>
	);
}
