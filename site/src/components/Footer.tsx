import { LogoMark } from "./Icons";

const REPO_URL = "https://github.com/nhannht/obsidian-smart-gantt";

export default function Footer() {
	return (
		<footer className="footer">
			<div className="container footer-inner">
				<div className="footer-brand">
					<LogoMark size={18} />
					<span>Smart Gantt</span>
					<span className="footer-copy">MIT License. Copyright 2026 nhannht.</span>
				</div>
				<div className="footer-links">
					<a href={REPO_URL} target="_blank" rel="noreferrer">
						GitHub
					</a>
					<a
						href="https://community.obsidian.md/plugins/smart-gantt"
						target="_blank"
						rel="noreferrer"
					>
						Community store
					</a>
					<a href={`${REPO_URL}/blob/master/CHANGELOG.md`} target="_blank" rel="noreferrer">
						Changelog
					</a>
					<a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
						Report an issue
					</a>
				</div>
			</div>
			<p className="footer-fine container">
				Obsidian is a trademark of Dynalist Inc. Smart Gantt is an independent community plugin.
			</p>
		</footer>
	);
}
