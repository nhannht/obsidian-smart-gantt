import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme";
import {
	BurgerIcon,
	CloseIcon,
	GitHubIcon,
	LogoMark,
	MoonIcon,
	SunIcon,
} from "./Icons";

const LINKS = [
	{ href: "#features", label: "Features" },
	{ href: "#screens", label: "Screens" },
	{ href: "#install", label: "Install" },
];

const REPO_URL = "https://github.com/nhannht/obsidian-smart-gantt";

export default function Nav() {
	const { theme, toggle } = useTheme();
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: PointerEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("pointerdown", onDown);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("pointerdown", onDown);
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<header className="nav-wrap" ref={wrapRef}>
			<nav className="nav-pill" aria-label="Main">
				<a className="nav-brand" href="#top">
					<LogoMark />
					<span>Smart Gantt</span>
				</a>
				<div className="nav-links">
					{LINKS.map((l) => (
						<a key={l.href} href={l.href}>
							{l.label}
						</a>
					))}
				</div>
				<div className="nav-actions">
					<a
						className="nav-icon-btn"
						href={REPO_URL}
						target="_blank"
						rel="noreferrer"
						aria-label="GitHub repository"
					>
						<GitHubIcon />
					</a>
					<button
						className="nav-icon-btn"
						type="button"
						onClick={toggle}
						aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
					>
						{theme === "dark" ? <SunIcon /> : <MoonIcon />}
					</button>
					<button
						className="nav-icon-btn nav-burger"
						type="button"
						aria-expanded={open}
						aria-label={open ? "Close menu" : "Open menu"}
						onClick={() => setOpen((v) => !v)}
					>
						{open ? <CloseIcon /> : <BurgerIcon />}
					</button>
				</div>
			</nav>
			{open && (
				<div className="nav-sheet">
					{LINKS.map((l) => (
						<a key={l.href} href={l.href} onClick={() => setOpen(false)}>
							{l.label}
						</a>
					))}
					<a href={REPO_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
						GitHub
					</a>
				</div>
			)}
		</header>
	);
}
