import {
	Avatar,
	Hamburger,
	makeStyles,
	mergeClasses,
	NavDrawer,
	NavDrawerBody,
	NavItem,
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
		paddingInline: tokens.spacingHorizontalL,
		backgroundColor: tokens.colorBrandBackground,
		color: tokens.colorNeutralForegroundOnBrand,
	},
	appIcon: { display: 'flex', fontSize: tokens.fontSizeBase500 },
	headerCenter: { flexGrow: 1, display: 'flex', justifyContent: 'center' },
	body: { display: 'flex', flexGrow: 1, minHeight: 0 },
	nav: { backgroundColor: tokens.colorNeutralBackground3 },
	main: {
		flexGrow: 1,
		minWidth: 0,
		overflowY: 'auto',
		padding: tokens.spacingHorizontalXXL,
		'@media (max-width: 639px)': { padding: tokens.spacingHorizontalL },
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalL,
		marginInline: 'auto',
		maxWidth: '1200px',
	},
	narrow: { maxWidth: '720px', marginInline: 0 },
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: tokens.spacingHorizontalM,
		flexWrap: 'wrap',
	},
});

export type Section = { value: string; label: string; icon: JSX.Element };

const narrowQuery = window.matchMedia('(max-width: 639px)');

/**
 * Pass `sections` only when the app has two or more separate sections.
 * `width="form"` keeps a settings or form page at a readable width.
 */
export function AppShell(props: {
	appName: string;
	appIcon?: ReactNode;
	headerCenter?: ReactNode;
	userName?: string;
	title: string;
	titleActions?: ReactNode;
	width?: 'full' | 'form';
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
				{props.appIcon && <span className={styles.appIcon}>{props.appIcon}</span>}
				<Subtitle2>{props.appName}</Subtitle2>
				<div className={styles.headerCenter}>{props.headerCenter}</div>
				{props.userName && <Avatar name={props.userName} size={28} />}
			</header>
			<div className={styles.body}>
				{hasNav && (
					<NavDrawer
						className={styles.nav}
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
					<div className={mergeClasses(styles.column, props.width === 'form' && styles.narrow)}>
						<div className={styles.titleRow}>
							<Title3 as="h1">{props.title}</Title3>
							{props.titleActions}
						</div>
						{props.children}
					</div>
				</main>
			</div>
			<Toaster toasterId={props.toasterId} position="bottom-end" />
		</div>
	);
}
