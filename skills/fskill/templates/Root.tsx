import { FluentProvider, makeStaticStyles, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useEffect, useState, type ReactNode } from 'react';

const useReset = makeStaticStyles({
	body: { margin: 0 },
});

const query = typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)');

/**
 * Never pass a className or style to FluentProvider. Fluent copies them onto every
 * tooltip, menu, and toast layer, so a height rule turns each layer into a blank sheet.
 * `theme` follows the system by default. Pass the user's saved choice from an Appearance setting.
 */
export function Root({ children, theme = 'system' }: { children: ReactNode; theme?: 'light' | 'dark' | 'system' }) {
	useReset();
	const [systemDark, setSystemDark] = useState(query?.matches ?? false);
	useEffect(() => {
		if (!query) return;
		const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	}, []);
	const dark = theme === 'dark' || (theme === 'system' && systemDark);
	return <FluentProvider theme={dark ? webDarkTheme : webLightTheme}>{children}</FluentProvider>;
}
