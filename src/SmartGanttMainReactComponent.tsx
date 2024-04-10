// import {useApp} from "./AppContext";
import mermaid from "mermaid";
import {useEffect} from "react";


mermaid.initialize({
	startOnLoad: true,
	theme: 'default',
	securityLevel: 'loose',
	fontFamily: 'monospace',
});

export const SmartGanttMainReactComponent = (props: {
	mermaidCraft: string,
}) => {
	useEffect(() => {
		mermaid.contentLoaded();
	}, [])



	return <>
		<main>

			<div className={"mermaid"}>
				{props.mermaidCraft}
			</div>
		</main>


	</>
};
