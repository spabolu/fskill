import {
	Avatar,
	Button,
	Popover,
	PopoverSurface,
	PopoverTrigger,
	Body1,
	Hamburger,
	Link,
	makeStyles,
	mergeClasses,
	NavDrawer,
	NavDrawerBody,
	NavDrawerFooter,
	NavItem,
	SearchBox,
	Subtitle2,
	Tab,
	TabList,
	Title3,
	Toaster,
	tokens,
} from '@fluentui/react-components';
import { GridDots24Regular } from '@fluentui/react-icons';
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
	logo: { display: 'flex', alignItems: 'center', height: '28px', flexShrink: 0 },
	appName: { whiteSpace: 'nowrap' },
	launcher: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, minWidth: '240px' },
	launcherApp: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, color: tokens.colorNeutralForeground1 },
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
	navLabel: { display: 'flex', flexGrow: 1, justifyContent: 'space-between', gap: tokens.spacingHorizontalS },
	navCount: { color: tokens.colorNeutralForeground3 },
	phoneTabs: { marginInline: `calc(${tokens.spacingHorizontalM} * -1)`, overflowX: 'auto' },
	tabCount: { marginInlineStart: tokens.spacingHorizontalXS, color: tokens.colorNeutralForeground3 },
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
	mainFull: { display: 'flex', flexDirection: 'column', overflowY: 'hidden', padding: 0, '@media (max-width: 639px)': { padding: 0 } },
	full: { maxWidth: 'none', width: '100%', flexGrow: 1, minHeight: 0, gap: 0 },
	fullHead: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalS,
		padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
		borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
		backgroundColor: tokens.colorNeutralBackground1,
	},
	fullBody: { display: 'flex', flexGrow: 1, minHeight: 0 },
	phoneFooter: { paddingTop: tokens.spacingVerticalL },
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: tokens.spacingHorizontalM,
		flexWrap: 'wrap',
		minHeight: '32px',
	},
	visuallyHidden: { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' },
	description: { color: tokens.colorNeutralForeground2, marginTop: `calc(${tokens.spacingVerticalM} * -1)` },
});

export type Section = { value: string; label: string; icon: JSX.Element; count?: number };

const narrowQuery = typeof window === 'undefined' ? null : window.matchMedia('(max-width: 639px)');

export type ShellSearch = { placeholder: string; value: string; onChange: (value: string) => void };

/**
 * `logo` is the product's real logo, such as an <img>. Leave it out when the user has not supplied one.
 * `title` names the view, such as "My tasks" or "Team members". Never repeat `appName` there.
 * `width`: "table" for data tables, "list" for lists and dashboards, "form" for settings and forms,
 * and "full" for workspaces that fill the window, such as mail with a reading pane or a board. In "full", the children
 * fill the space under a compact title row as a flex row, so put panes side by side and give each its own scroll.
 * `navFooter` sits at the bottom of the left menu, such as a storage meter. On phones it follows the content.
 * `search` filters the view's main list. It sits in the header on wide screens and above the content on phones.
 * `sections` are the app's views: separate areas, the views of a personal list, or the groups of a settings page.
 * On phones, up to five sections show as tabs under the title, and more go in a menu.
 */
export function AppShell(props: {
	appName: string;
	logo?: ReactNode;
	search?: ShellSearch;
	userName?: string;
	title: string;
	description?: string;
	titleActions?: ReactNode;
	width: 'table' | 'list' | 'form' | 'full';
	navFooter?: ReactNode;
	sections?: Section[];
	selected?: string;
	onSelect?: (value: string) => void;
	toasterId?: string;
	children: ReactNode;
}) {
	const styles = useStyles();
	const [narrow, setNarrow] = useState(narrowQuery?.matches ?? false);
	const [navOpen, setNavOpen] = useState(!(narrowQuery?.matches ?? false));
	useEffect(() => {
		const onChange = (e: MediaQueryListEvent) => {
			setNarrow(e.matches);
			setNavOpen(!e.matches);
		};
		if (!narrowQuery) return;
		narrowQuery.addEventListener('change', onChange);
		return () => narrowQuery.removeEventListener('change', onChange);
	}, []);
	const sections = props.sections ?? [];
	const hasNav = sections.length > 1;
	const phoneTabs = hasNav && narrow && sections.length <= 5;
	const drawer = hasNav && !phoneTabs;
	const full = props.width === 'full';

	return (
		<div className={styles.shell}>
			<header className={styles.header}>
				{drawer && narrow && <Hamburger onClick={() => setNavOpen((o) => !o)} aria-label="Navigation" />}
				<Popover positioning="below-start">
					<PopoverTrigger disableButtonEnhancement>
						<Button appearance="subtle" icon={<GridDots24Regular />} aria-label="App launcher" />
					</PopoverTrigger>
					<PopoverSurface className={styles.launcher}>
						<Subtitle2>Apps</Subtitle2>
						<Link href="/" className={styles.launcherApp}>
							{props.logo && <span className={styles.logo}>{props.logo}</span>}
							<Body1>{props.appName}</Body1>
						</Link>
					</PopoverSurface>
				</Popover>
				{props.logo && <span className={styles.logo}>{props.logo}</span>}
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
				{props.userName && <Avatar name={props.userName} color="colorful" size={32} />}
			</header>
			<div className={styles.body}>
				{drawer && (
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
									<span className={styles.navLabel}>
										{s.label}
										{s.count !== undefined && <span className={styles.navCount}>{s.count}</span>}
									</span>
								</NavItem>
							))}
						</NavDrawerBody>
						{props.navFooter && <NavDrawerFooter>{props.navFooter}</NavDrawerFooter>}
					</NavDrawer>
				)}
				<main className={mergeClasses(styles.main, full && styles.mainFull)}>
					<div
						className={mergeClasses(
							styles.column,
							props.width === 'list' && styles.list,
							props.width === 'form' && styles.form,
							full && styles.full,
						)}
					>
						<div className={full ? styles.fullHead : undefined}>
						<div className={mergeClasses(styles.titleRow, phoneTabs && !props.titleActions && styles.visuallyHidden)}>
							<Title3 as="h1">{props.title}</Title3>
							{props.titleActions}
						</div>
						{props.description && <Body1 className={styles.description}>{props.description}</Body1>}
						{phoneTabs && (
							<TabList className={styles.phoneTabs} selectedValue={props.selected} onTabSelect={(_, d) => props.onSelect?.(String(d.value))}>
								{sections.map((s) => (
									<Tab key={s.value} value={s.value}>
										{s.label}
										{s.count !== undefined && <span className={styles.tabCount}>{s.count}</span>}
									</Tab>
								))}
							</TabList>
						)}
						{props.search && narrow && (
							<SearchBox
								className={styles.pageSearch}
								placeholder={props.search.placeholder}
								aria-label={props.search.placeholder}
								value={props.search.value}
								onChange={(_, d) => props.search?.onChange(d.value)}
							/>
						)}
						</div>
						{full ? <div className={styles.fullBody}>{props.children}</div> : props.children}
						{props.navFooter && !drawer && <div className={styles.phoneFooter}>{props.navFooter}</div>}
					</div>
				</main>
			</div>
			<Toaster toasterId={props.toasterId} position="bottom-end" />
		</div>
	);
}
