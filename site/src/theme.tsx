import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
	theme: "dark",
	toggle: () => {},
});

/* The pre-paint script in index.html stamps the attribute before React
   mounts; state is seeded from it so there is never a wrong-theme flash. */
function current(): Theme {
	return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(current);

	const apply = useCallback((t: Theme, persist: boolean) => {
		document.documentElement.dataset.theme = t;
		setTheme(t);
		if (persist) {
			try {
				localStorage.setItem("theme", t);
			} catch {
				/* private mode */
			}
		}
	}, []);

	const toggle = useCallback(() => {
		apply(current() === "dark" ? "light" : "dark", true);
	}, [apply]);

	/* Follow live system changes only while no explicit choice is stored. */
	useEffect(() => {
		const mq = matchMedia("(prefers-color-scheme: light)");
		const onChange = () => {
			let stored: string | null = null;
			try {
				stored = localStorage.getItem("theme");
			} catch {
				/* private mode */
			}
			if (stored === "light" || stored === "dark") return;
			apply(mq.matches ? "light" : "dark", false);
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [apply]);

	return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}
