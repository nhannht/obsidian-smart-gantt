// import {useApp} from "./AppContext";
import {useEffect} from "react";
import {loadMermaid} from "obsidian";


export const SmartGanttMainReactComponent = (props: {
	mermaidCraft: string,
}) => {



	useEffect(() => {
		loadMermaid().then(mermaid => {
			mermaid.initialize({
				startOnLoad: true,
				theme: 'default',
				securityLevel: 'loose',
				fontFamily: 'monospace',
			});

			mermaid.contentLoaded();

		})

	}, [])


	return <>
		<main>

			<div className={"mermaid"}>
				{props.mermaidCraft}
			</div>
		</main>


	</>
};
