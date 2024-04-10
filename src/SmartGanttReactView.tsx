import {IconName, ItemView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import {SmartGanttMainReactComponent} from "./SmartGanttMainReactComponent";
import {AppContext} from "./AppContext";
import MarkdownProcesser from "./MarkdownProcesser";
import TimelineExtractor from "./TimelineExtractor";
import {Chrono} from "chrono-node";
import MermaidCrafter from "./MermaidCrafter";
import SmartGanttPlugin from "../main";
import "styles.css"

/**
 * The api of obsidian about custom view is a bit complicated to use.
 * View and leaf is two different term. View must be regist via a "ViewCreator" function that return a view and everyview must be assicate with a type.
 * That type act like an id that other term, like leaf, will bind the view state using that id
 */
export default class SmartGanttReactView extends ItemView {

	get thisPlugin(): SmartGanttPlugin {
		return this._thisPlugin;
	}

	get isJustResize(): boolean {
		return this._isJustResize;
	}

	set isJustResize(value: boolean) {
		this._isJustResize = value;
	}

	root: Root | null = null;
	private _isJustResize: boolean = false;
	private _thisPlugin: SmartGanttPlugin;


	constructor(leaf: WorkspaceLeaf, thisPlugin: SmartGanttPlugin) {
		super(leaf);
		this._thisPlugin = thisPlugin;

	}

	getViewType() {
		return "smart-gantt"
	}

	getDisplayText() {
		return "Smart Gantt View";
	}

	override async onOpen() {
		const allMarkdownFiles = this.app.vault.getMarkdownFiles();
		const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, this.thisPlugin)
		await markdownProcesser.parseAllFiles()
		const allSentences = markdownProcesser.documents
		// console.log(allSentences)
		const timelineExtractor = new TimelineExtractor(new Chrono())
		const parsedResult = await timelineExtractor.GetTimelineDataFromDocumentArrayWithChrono(allSentences)
		// console.log(parsedResult)
		// const timelineData = timelineExtractor.timelineData
		const mermaidCrafter = new MermaidCrafter(this.thisPlugin)
		const craft = mermaidCrafter.craftMermaid(parsedResult)

		this.root = createRoot(this.containerEl.children[1]);
		const buttonContainer = this.containerEl.createEl("div", {
			cls: "smart-gantt-button-container"
		})

		const refreshButton = buttonContainer.createEl("button", {
			text: "Refresh",
			cls: "smart-gantt-refresh-button"
		})

		refreshButton.addEventListener("click", () => {

			this.thisPlugin.app.workspace.detachLeavesOfType("smart-gantt")
			let leaf = this.thisPlugin.app.workspace.getRightLeaf(false);

			leaf?.setViewState({
				type: "smart-gantt",
				active: true
			})
			if (leaf instanceof WorkspaceLeaf) {
				this.thisPlugin.app.workspace.revealLeaf(leaf);
			}

		})


		this.root.render(
			<AppContext.Provider value={{
				app: this.app,
			}}>
				<SmartGanttMainReactComponent mermaidCraft={craft}

				/>
			</AppContext.Provider>
		)
	}

	override async onClose() {
		this.root?.unmount()

	}

	override getIcon(): IconName {
		return 'gantt-chart'
	}
}
