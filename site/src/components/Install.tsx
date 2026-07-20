import Reveal from "./Reveal";

export default function Install() {
	return (
		<section className="section container" id="install">
			<Reveal>
				<h2 className="section-title">Installed in under a minute</h2>
			</Reveal>
			<div className="install-grid">
				<Reveal>
					<div>
						<ol className="steps">
							<li>
								<b>Open Community plugins</b>
								In Obsidian, go to Settings, choose Community plugins, then Browse.
							</li>
							<li>
								<b>Search for Smart Gantt</b>
								Install it, then enable it. That is the whole ceremony.
							</li>
							<li>
								<b>Open the timeline</b>
								Use the Smart Gantt view in the right sidebar, or drop a gantt code block into any
								note.
							</li>
						</ol>
						<div className="install-cta">
							<a className="btn btn-primary" href="obsidian://show-plugin?id=smart-gantt">
								Add to Obsidian
							</a>
							<span>opens directly in the app</span>
						</div>
					</div>
				</Reveal>
				<Reveal delay={80}>
					<div>
						<div className="code-card">
							<div className="code-card-bar">
								<span className="dot" />
								<span className="dot" />
								<span className="dot" />
								<span className="code-card-name">project.md</span>
							</div>
							<pre>
								<code>
									{"- [ ] Draft the launch post "}
									<span className="hl">due next monday</span>
									{"\n- [ ] Ship 1.0 "}
									<span className="hl">by Aug 1 2026</span>
									{"\n- [ ] Retro "}
									<span className="hl">[due:: 2026-08-08]</span>
									{"\n\n```gantt\n\n```"}
								</code>
							</pre>
						</div>
						<p className="code-note">
							Three tasks, one empty code block. That is the entire setup.
						</p>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
