// import {useApp} from "./AppContext";
import {loadMermaid, MarkdownPostProcessorContext} from "obsidian";
import SmartGanttPlugin from "../../main";
import {useMeasure} from "react-use";

/**
 * Very old component, not exposed anymore and better not touch this sh*t
 * @param props
 * @constructor
 */
export const SmartGanttSideBarReactComponent = (props: {
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

	const [mainContainerRef , mainContainerMeasure] = useMeasure()


	const mermaidSvgComponent = ()=>{
		if (mainContainerMeasure.width <=0){
			return <></>
		}

		loadMermaid().then((mermaid) => {
				mermaid.initialize({
					startOnLoad: true,
					maxTextSize: 99999999,
				});
				mermaid.contentLoaded();
			})

		return (
			<main>
			<pre   className={"mermaid"}>
				{props.mermaidCraft}
			</pre>
			</main>
		)
	}


	let mainComponent = () => {
		// @ts-ignore
		return <div ref={mainContainerRef} id={"mainContainer"}>
			{mermaidSvgComponent()}
		</div>

	}



	return <>
			{mainComponent()}
	</>


}
