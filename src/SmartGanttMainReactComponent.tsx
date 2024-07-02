// import {useApp} from "./AppContext";
import {loadMermaid, MarkdownPostProcessorContext} from "obsidian";
import SmartGanttPlugin from "../main";


export const SmartGanttMainReactComponent = (props: {
	mermaidCraft: string,
	ctx?: MarkdownPostProcessorContext,
	src?: string,
	thisPlugin?: SmartGanttPlugin,
}) => {

	if (props.mermaidCraft === "") {
		return <>
			<div>Oops, you need at least one task with time can be parse for the Gantt chart being show</div>
			<div>Trying add a task like: "- [ ] feed my kitty tomorrow" in your editing file</div>
		</>
	}


	let mainComponent = () => {
		loadMermaid()
			.then(mermaid => {
				mermaid.initialize({
					startOnLoad: true,
					maxTextSize: 99999999,
				});
				mermaid.contentLoaded();
			})

		return (
			<main>
			<pre className={"mermaid"}>
				{props.mermaidCraft}
			</pre>
			</main>
		)

	}

	return <>
		{mainComponent()}
	</>


}
