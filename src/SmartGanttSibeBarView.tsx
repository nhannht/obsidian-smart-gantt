import {IconName, ItemView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import SmartGanttPlugin from "../main";
import "styles.css"
import SidebarReactComponentNg from "./SidebarReactComponentNg";


/**
 * The api of obsidian about custom view is a bit complicated to use.
 * View and leaf is two different term. View must be regist via a "ViewCreator" function that return a view and everyview must be assicate with a type.
 * That type act like an id that other term, like leaf, will bind the view state using that id
 */
export default class SmartGanttSibeBarView extends ItemView {


	root: Root | null = null;


	constructor(leaf: WorkspaceLeaf,
				private thisPlugin: SmartGanttPlugin
	) {
		super(leaf);

	}

	getViewType() {
		return "smart-gantt"
	}

	getDisplayText() {
		return "Smart Gantt";
	}




	override async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);


		this.root.render(
				// <SmartGanttSideBarReactComponent mermaidCraft={craft}/>
			<SidebarReactComponentNg thisPlugin={this.thisPlugin}/>
		)

	}

	override async onClose() {
		this.root?.unmount()

	}

	override getIcon(): IconName {
		return 'gantt-chart'
	}


}
