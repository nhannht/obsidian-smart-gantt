import type { ReactNode } from "react";
import Reveal from "./Reveal";
import {
	DevicesIcon,
	DragIcon,
	LinkIcon,
	PanelIcon,
	SparkleIcon,
	ZoomIcon,
} from "./Icons";

const FEATURES: { icon: ReactNode; title: string; body: ReactNode }[] = [
	{
		icon: <SparkleIcon />,
		title: "Plain language in, timeline out",
		body: (
			<>
				Write "due next monday" like a human. Smart Gantt's chrono-powered parser reads the dates
				you already type. No new syntax, no front-matter ceremony.
			</>
		),
	},
	{
		icon: <LinkIcon />,
		title: "Friends with your other plugins",
		body: (
			<>
				Tasks-style emoji dates and Dataview <code>[due:: ]</code> fields are first-class citizens.
				If it is a checkbox with a date, it lands on the chart.
			</>
		),
	},
	{
		icon: <DragIcon />,
		title: "Drag it, and it is so",
		body: (
			<>
				Drag a bar to reschedule, resize an edge to change the range. The new date is written back
				into your markdown, not into a hidden database.
			</>
		),
	},
	{
		icon: <ZoomIcon />,
		title: "Zoom from sprint to year",
		body: (
			<>
				Day, Week, Month, and Quarter scales, with a today line to keep you honest. One click on a
				bar jumps to the task in its note.
			</>
		),
	},
	{
		icon: <PanelIcon />,
		title: "Sidebar view or code block",
		body: (
			<>
				Keep the timeline one click away in the right sidebar, or embed it in any note with a{" "}
				<code>gantt</code> code block. Block settings are stored as plain JSON.
			</>
		),
	},
	{
		icon: <DevicesIcon />,
		title: "Anywhere Obsidian runs",
		body: (
			<>
				Desktop and mobile, dark and light. The chart is built on Obsidian's own design tokens, so
				it always matches your theme.
			</>
		),
	},
];

export default function Features() {
	return (
		<section className="section container" id="features">
			<Reveal>
				<h2 className="section-title">Built for how you already write</h2>
			</Reveal>
			<Reveal delay={60}>
				<p className="section-lede">
					No separate database, no plugin-specific markup. Your tasks stay in your markdown; Smart
					Gantt just reads them well.
				</p>
			</Reveal>
			<div className="grid">
				{FEATURES.map((f, i) => (
					<Reveal key={f.title} delay={(i % 3) * 70}>
						<article className="card">
							<div className="card-icon">{f.icon}</div>
							<h3>{f.title}</h3>
							<p>{f.body}</p>
						</article>
					</Reveal>
				))}
			</div>
		</section>
	);
}
