// import {useApp} from "./AppContext";
import {useEffect} from "react";
import {loadMermaid} from "obsidian";


export const SmartGanttMainReactComponent = (props: {
	mermaidCraft: string,
}) => {


	useEffect(() => {
		loadMermaid()
			.then(mermaid => {
				mermaid.initialize({
					startOnLoad: true,
					// theme: 'default',
					// securityLevel: 'loose',
					// fontFamily: 'monospace',
					maxTextSize:99999999,
				});
			mermaid.contentLoaded();
		})

	}, [])
	if (props.mermaidCraft === ""){
		return <>
			<div>Oops, you need at least one task with time can be parse for the Gantt chart being show</div>
			<div>Trying add a task like: "- [ ] feed my kitty tomorrow" in your editing file</div>
		</>
	}

	return <>
		<main>

			<pre className={"mermaid"}>
				{props.mermaidCraft}
			</pre>
		</main>


	</>
};
