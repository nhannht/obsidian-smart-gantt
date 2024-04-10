import {IconName, ItemView, MarkdownView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import {SmartGanttMainReactComponent} from "./SmartGanttMainReactComponent";
import {AppContext} from "./AppContext";
import MarkdownProcesser from "./MarkdownProcesser";
import TimelineExtractor from "./TimelineExtractor";
import {Chrono} from "chrono-node";
import MermaidCrafter from "./MermaidCrafter";
import SmartGanttPlugin from "../main";
import "styles.css"
import {escapeRegExp} from "lodash";

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

	async reloadView() {
		this.thisPlugin.app.workspace.detachLeavesOfType("smart-gantt")
		let leaf = this.thisPlugin.app.workspace.getRightLeaf(false);

		leaf?.setViewState({
			type: "smart-gantt",
			active: true,
		})
		if (leaf instanceof WorkspaceLeaf) {
			this.thisPlugin.app.workspace.revealLeaf(leaf);
		}


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
		const secondContainer = this.containerEl.createEl("div", {
			cls: "smart-gantt-second-container"
		})
		const smartGanttTaskBoard = secondContainer.createEl("div", {
			cls: "smart-gantt-task-board"
		})

		parsedResult.forEach(parsedResult => {
				parsedResult.parsedResults.forEach(_result => {
					if ("text" in parsedResult.token) {
						if ("checked" in parsedResult.token) {
							let checkbox = smartGanttTaskBoard.createEl("input", {
								type: "checkbox",
								cls: "smart-gank-task-checkbox",

							})
							if (parsedResult.token.checked) {
								checkbox.setAttr("checked", "checked")
							}
							checkbox.addEventListener("change", async () => {
								if (checkbox.checked) {
									const taskRawText = parsedResult.token.raw
									// console.log(taskRawText)
									const taskRawTextSwitch = taskRawText.replace("[ ]", "[x]")

									let fileContent = await this.thisPlugin.app.vault.read(parsedResult.file)
									await this.thisPlugin.app.vault.modify(parsedResult.file, fileContent.replace(taskRawText.trim(), taskRawTextSwitch.trim()))
									await this.reloadView()


								} else if (!checkbox.checked) {
									const taskRawText = parsedResult.token.raw
									// console.log(taskRawText)
									const taskRawTextSwitch = taskRawText.replace("[x]", "[ ]")
									// console.log(taskRawTextSwitch)

									let fileContent = await this.thisPlugin.app.vault.read(parsedResult.file)
									// console.log(fileContent)
									await this.thisPlugin.app.vault.modify(parsedResult.file, fileContent.replace(taskRawText.trim(), taskRawTextSwitch.trim()))
									await this.reloadView()


								}

							})
						}

						const smartGanttTask = smartGanttTaskBoard.createEl("div", {
							cls: "smart-gank-task-element",
							text: parsedResult.token.text.split("\n")[0].trim()
						})

						smartGanttTask.addEventListener('click', async () => {
							const leaf = this.thisPlugin.app.workspace.getLeaf(false);
							await leaf.openFile(parsedResult.file)
							const view = leaf.view as MarkdownView
							const fileContent = await this.thisPlugin.app.vault.read(parsedResult.file)
							const regex = new RegExp(escapeRegExp(smartGanttTask.getText()))
							const lines = fileContent.split("\n")
							// console.log(smartGanttTask.getText())
							// console.log(lines)
							for (let i = 0; i < lines.length; i++) {
								const match = lines[i].trim().search(regex)
								// console.log(match)
								if (match !== -1) {
									// console.log(lines[i])
									view.editor.setCursor({
										line: i,
										ch: 0
									})
									view.editor.setSelection({
											line: i,
											ch: match
										},
										{
											line: i,
											ch: match + smartGanttTask.getText().length
										})
									view.editor.scrollTo(i)
									break
								}

							}

						})
					}


				})
			}
		)


		const buttonContainer = secondContainer.createEl("div", {
			cls: "smart-gantt-button-container"
		})

		const refreshButton = buttonContainer.createEl("button", {
			text: "Refresh",
			cls: "smart-gantt-refresh-button"
		})

		refreshButton.addEventListener("click", async () => {
			await this.reloadView()

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
