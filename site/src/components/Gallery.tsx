import Reveal from "./Reveal";

export default function Gallery() {
	return (
		<section className="section container" id="screens">
			<Reveal>
				<h2 className="section-title">See it in a vault</h2>
			</Reveal>
			<Reveal delay={60}>
				<p className="section-lede">
					Two ways to look at the same truth: a dedicated sidebar view, or a chart embedded right
					inside a note.
				</p>
			</Reveal>
			<div className="frames">
				<Reveal>
					<figure className="frame">
						<img
							src="/shots/sidebar-dark.png"
							alt="Smart Gantt sidebar view in Obsidian, dark theme, showing a timeline with a today line next to a task note"
							width={2560}
							height={1498}
							loading="lazy"
						/>
						<figcaption>
							<b>The sidebar view.</b> Every dated task in the vault on one timeline, with zoom
							controls and a today line. Click a bar to jump to the task.
						</figcaption>
					</figure>
				</Reveal>
				<Reveal delay={80}>
					<figure className="frame">
						<img
							src="/shots/block-light.png"
							alt="Smart Gantt code block rendered in an Obsidian note, light theme"
							width={2560}
							height={1498}
							loading="lazy"
						/>
						<figcaption>
							<b>The gantt code block.</b> The chart embedded in a note. Right click it (hold on
							mobile) to open settings, which are stored as JSON inside the block itself.
						</figcaption>
					</figure>
				</Reveal>
			</div>
		</section>
	);
}
