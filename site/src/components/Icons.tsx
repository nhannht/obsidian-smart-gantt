import type { ReactNode } from "react";

export function LogoMark({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
			<defs>
				<linearGradient id="sg-logo-g" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#8b5cf6" />
					<stop offset="1" stopColor="#6d28d9" />
				</linearGradient>
			</defs>
			<rect width="64" height="64" rx="14" fill="url(#sg-logo-g)" />
			<rect x="14" y="17" width="27" height="8" rx="4" fill="#fff" />
			<rect x="23" y="28" width="27" height="8" rx="4" fill="#fff" opacity="0.85" />
			<rect x="14" y="39" width="19" height="8" rx="4" fill="#fff" opacity="0.7" />
		</svg>
	);
}

function Stroke({ children, size = 21 }: { children: ReactNode; size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{children}
		</svg>
	);
}

export function SunIcon() {
	return (
		<Stroke size={19}>
			<circle cx="12" cy="12" r="4.2" />
			<path d="M12 2.6v2.1M12 19.3v2.1M2.6 12h2.1M19.3 12h2.1M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5" />
		</Stroke>
	);
}

export function MoonIcon() {
	return (
		<Stroke size={19}>
			<path d="M20.6 13.2A8.5 8.5 0 1 1 10.8 3.4a6.8 6.8 0 0 0 9.8 9.8z" />
		</Stroke>
	);
}

export function GitHubIcon({ size = 19 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
		</svg>
	);
}

export function BurgerIcon() {
	return (
		<Stroke size={19}>
			<path d="M4 7.5h16M4 12h16M4 16.5h16" />
		</Stroke>
	);
}

export function CloseIcon() {
	return (
		<Stroke size={19}>
			<path d="M6 6l12 12M18 6L6 18" />
		</Stroke>
	);
}

export function SparkleIcon() {
	return (
		<Stroke>
			<path d="M11 4.5l1.5 4.2 4.2 1.5-4.2 1.5L11 15.9l-1.5-4.2-4.2-1.5 4.2-1.5z" />
			<path d="M18.3 14.8l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
		</Stroke>
	);
}

export function LinkIcon() {
	return (
		<Stroke>
			<path d="M9.5 14.5l5-5" />
			<path d="M8 12l-2.2 2.2a3.5 3.5 0 0 0 5 5L13 17" />
			<path d="M16 12l2.2-2.2a3.5 3.5 0 0 0-5-5L11 7" />
		</Stroke>
	);
}

export function DragIcon() {
	return (
		<Stroke>
			<path d="M8 9l-3 3 3 3M16 9l3 3-3 3M5.5 12h13" />
		</Stroke>
	);
}

export function ZoomIcon() {
	return (
		<Stroke>
			<circle cx="11" cy="11" r="6" />
			<path d="M19.8 19.8L15.4 15.4M8.7 11h4.6M11 8.7v4.6" />
		</Stroke>
	);
}

export function PanelIcon() {
	return (
		<Stroke>
			<rect x="3" y="4.5" width="18" height="15" rx="3" />
			<path d="M15.5 4.5v15" />
		</Stroke>
	);
}

export function DevicesIcon() {
	return (
		<Stroke>
			<rect x="2.5" y="5" width="13" height="9.5" rx="2" />
			<path d="M6 18h6" />
			<path d="M9 14.5V18" />
			<rect x="17.5" y="8.5" width="4.5" height="9.5" rx="1.5" />
		</Stroke>
	);
}
