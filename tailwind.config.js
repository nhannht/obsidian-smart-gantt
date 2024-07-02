/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{ts,tsx,html}",
		"./main.{ts,tsx}"
	],
	theme: {
		extend: {},
	},
	plugins: [],
	safelist: [
		"opacity-50"
	]
}

