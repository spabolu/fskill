import { FluentProvider, makeStaticStyles, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useEffect, useState, type ReactNode } from 'react';

const useReset = makeStaticStyles({
	body: { margin: 0 },
});

const query = window.matchMedia('(prefers-color-scheme: dark)');

/**
 * Never pass a className or style to FluentProvider. Fluent copies them onto every
 * tooltip, menu, and toast layer, so a height rule turns each layer into a blank sheet.
 */
export function Root({ children }: { children: ReactNode }) {
	useReset();
	const [dark, setDark] = useState(query.matches);
	useEffect(() => {
		const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	}, []);
	return <FluentProvider theme={dark ? webDarkTheme : webLightTheme}>{children}</FluentProvider>;
}
