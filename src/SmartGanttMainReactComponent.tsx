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


	return <>
		<main>

			<pre className={"mermaid"}>
				{props.mermaidCraft}
			</pre>
		</main>


	</>
};
