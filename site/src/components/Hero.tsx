import Reveal from "./Reveal";

const STORE_URL = "https://community.obsidian.md/plugins/smart-gantt";

export default function Hero() {
	return (
		<section className="hero" id="top">
			<Reveal>
				<a className="eyebrow" href={STORE_URL} target="_blank" rel="noreferrer">
					Now on the Obsidian community store
				</a>
			</Reveal>
			<Reveal delay={60}>
				<h1 className="hero-title">
					Every task in your vault.
					<br />
					<span className="grad">One timeline.</span>
				</h1>
			</Reveal>
			<Reveal delay={120}>
				<p className="hero-sub">
					Smart Gantt reads the dates you already write - plain language, Tasks-style emoji,
					Dataview fields - and turns them into an interactive Gantt chart. Drag a bar, and your
					note is rewritten for you.
				</p>
			</Reveal>
			<Reveal delay={180}>
				<div className="hero-ctas">
					<a className="btn btn-primary" href="obsidian://show-plugin?id=smart-gantt">
						Add to Obsidian
					</a>
					<a className="btn btn-secondary" href={STORE_URL} target="_blank" rel="noreferrer">
						View on the store
					</a>
				</div>
				<p className="hero-note">Free and open source. MIT licensed. Desktop and mobile.</p>
			</Reveal>
			<Reveal delay={240}>
				<div className="hero-shot">
					<img
						className="shot-dark"
						src="/shots/sidebar-dark.png"
						alt="Smart Gantt sidebar view in Obsidian, dark theme"
						width={2560}
						height={1498}
					/>
					<img
						className="shot-light"
						src="/shots/block-light.png"
						alt="Smart Gantt code block in Obsidian, light theme"
						width={2560}
						height={1498}
					/>
				</div>
			</Reveal>
			<Reveal>
				<div className="stats">
					<div className="stat">
						<b>9k+</b>
						<span>downloads</span>
					</div>
					<div className="stat">
						<b>0</b>
						<span>new syntax to learn</span>
					</div>
					<div className="stat">
						<b>MIT</b>
						<span>open source</span>
					</div>
				</div>
			</Reveal>
		</section>
	);
}
