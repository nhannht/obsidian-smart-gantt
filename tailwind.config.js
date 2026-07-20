import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight';


/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{ts,tsx,html}",
		"./main.{ts,tsx}"
	],
	safelist: [
		"opacity-50"
	],
	important: true,
	plugins: [
		require("tailwindcss-animate"),
		scopedPreflightStyles({
			isolationStrategy: isolateInsideOfContainer('.twp')
		})

	],
	darkMode: ["selector", ".theme-dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "var(--sg-hairline)",
				input: "var(--sg-hairline)",
				ring: "var(--sg-accent)",
				background: "var(--sg-surface)",
				foreground: "var(--sg-label)",
				primary: {
					DEFAULT: "var(--sg-accent)",
					foreground: "var(--sg-on-accent)",
				},
				secondary: {
					DEFAULT: "var(--sg-surface-2)",
					foreground: "var(--sg-label)",
				},
				destructive: {
					DEFAULT: "var(--sg-overdue)",
					foreground: "var(--sg-on-accent)",
				},
				muted: {
					DEFAULT: "var(--sg-surface-2)",
					foreground: "var(--sg-label-2)",
				},
				accent: {
					DEFAULT: "var(--sg-hover)",
					foreground: "var(--sg-label)",
				},
				popover: {
					DEFAULT: "var(--sg-surface)",
					foreground: "var(--sg-label)",
				},
				card: {
					DEFAULT: "var(--sg-surface-2)",
					foreground: "var(--sg-label)",
				},
			},
			borderRadius: {
				lg: `var(--radius)`,
				md: `calc(var(--radius) - 2px)`,
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: {height: "0"},
					to: {height: "var(--radix-accordion-content-height)"},
				},
				"accordion-up": {
					from: {height: "var(--radix-accordion-content-height)"},
					to: {height: "0"},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
};

