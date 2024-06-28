import {IconName, ItemView, MarkdownView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import {SmartGanttMainReactComponent} from "./SmartGanttMainReactComponent";
import {AppContext} from "./AppContext";
import MarkdownProcesser from "./MarkdownProcesser";
import TimelineExtractor, {SmartGanttParsesResult} from "./TimelineExtractor";
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

	renderCheckBox(parsedResult: SmartGanttParsesResult, checkbox: HTMLInputElement) {
		if ("checked" in parsedResult.token && parsedResult.token.checked) {
			checkbox.setAttr("checked", "checked")
		}
		checkbox.addEventListener("change", async () => {
			if (checkbox.checked) {
				const taskRawText = parsedResult.token.raw
				// console.log(taskRawText)
				const taskRawTextSwitch = taskRawText.replace("[ ]", "[x]")

				let fileContent = await this.thisPlugin.app.vault.read(parsedResult.file)
				await this.thisPlugin.app.vault.modify(parsedResult.file, fileContent.replace(taskRawText.trim(), taskRawTextSwitch.trim()))
				await this.thisPlugin.helper.reloadView()


			} else if (!checkbox.checked) {
				const taskRawText = parsedResult.token.raw
				// console.log(taskRawText)
				const taskRawTextSwitch = taskRawText.replace("[x]", "[ ]")
				// console.log(taskRawTextSwitch)

				let fileContent = await this.thisPlugin.app.vault.read(parsedResult.file)
				// console.log(fileContent)
				await this.thisPlugin.app.vault.modify(parsedResult.file, fileContent.replace(taskRawText.trim(), taskRawTextSwitch.trim()))
				await this.thisPlugin.helper.reloadView()

			}

		})
	}

	createCheckboxTaskHandle(smartGanttTask: HTMLLabelElement, parsedResult: SmartGanttParsesResult) {
		smartGanttTask.addEventListener('click', async (e) => {
			e.preventDefault()
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

	createFileTypeFilterCheckboxes(el:HTMLDivElement){
		const todoCheckBoxContainer = el.createEl("div",{
			cls: "smart-gantt-checkbox-element-container"
		})
		const todoCheckbox = todoCheckBoxContainer.createEl("input",{
			cls: "smart-gantt-task-checkbox",
			type:"checkbox",
			attr:{
				id: "todo-checkbox-id"
			}
		})
		const doneCheckBoxContainer = el.createEl("div",{
			cls: "smart-gantt-checkbox-element-container"
		})
		const doneCheckbox = doneCheckBoxContainer.createEl("input", {
			cls: "smart-gantt-task-checkbox",
			type:"checkbox",
			attr:{
				id:"done-checkbox-id"
			}
		})

		todoCheckbox.checked = this.thisPlugin.settingManager.settings.todoShowQ
		doneCheckbox.checked = this.thisPlugin.settingManager.settings.doneShowQ

		 todoCheckBoxContainer.createEl("label",{
			cls: "smart-gantt-task-element",
			text: "Todo",
			attr:{
				for: "todo-checkbox-id"
			}
		})

		 doneCheckBoxContainer.createEl("label",{
			cls: "smart-gantt-task-element",
			text: "Done",
			attr:{
				for: "done-checkbox-id"
			}
		})

		todoCheckbox.addEventListener("change", async () =>{
			if (todoCheckbox.checked){
				await this.thisPlugin.settingManager.setTodoShowQ(true)
			} else {
				await this.thisPlugin.settingManager.setTodoShowQ(false)
			}

			await this.thisPlugin.helper.reloadView()
		})

		doneCheckbox.addEventListener("change",async ()=>{
			if (doneCheckbox.checked){
				await this.thisPlugin.settingManager.setDoneShowQ(true)
			} else {
				await this.thisPlugin.settingManager.setDoneShowQ(false)
			}

			await this.thisPlugin.helper.reloadView()
		})


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
		const mermaidCrafter = new MermaidCrafter(this.thisPlugin)


		const craft = mermaidCrafter.craftMermaid(parsedResult)
		// console.log(craft)

		this.root = createRoot(this.containerEl.children[1]);
		const secondContainer = this.containerEl.createEl("div", {
			cls: "smart-gantt-second-container"
		})
		const buttonContainer = secondContainer.createEl("div", {
			cls: "smart-gantt-button-container"
		})


		const refreshButton = buttonContainer.createEl("button", {
			text: "Refresh",
			cls: "smart-gantt-button"
		})

		refreshButton.addEventListener("click", async () => {
			await this.thisPlugin.helper.reloadView()
		})

		const filterButton = buttonContainer.createEl("button", {
			text: "Filter",
			cls: "smart-gantt-button"
		})

		filterButton.addEventListener("click", async () => {
			await this.thisPlugin.helper.renderFilterBox(parsedResult)
		})

		const taskTypeFilterContainer = buttonContainer.createEl("div",{
			cls:"smart-gantt-file-filter-checkbox-container"
		})

		this.createFileTypeFilterCheckboxes(taskTypeFilterContainer)



		const smartGanttTaskBoard = secondContainer.createEl("div", {
			cls: "smart-gantt-task-board"
		})

		parsedResult.forEach((parsedResult, parsedResultIndex) => {
				// console.log(this.app.workspace.getActiveFile()?.name)
				// console.log(parsedResult)
				// if (this.thisPlugin.settingManager.settings.pathListFilter.indexOf("AllFiles") !== -1) {
				//
				// } else if (this.thisPlugin.settingManager.settings.pathListFilter.indexOf("CurrentFile") !== -1) {
				// 	if (parsedResult.file.name !== this.app.workspace.getActiveFile()?.name) {
				// 		return
				// 	}
				// } else if (
				// 	this.thisPlugin.settingManager.settings.pathListFilter.indexOf("AllFiles") === -1 &&
				// 	this.thisPlugin.settingManager.settings.pathListFilter.indexOf("CurrentFile") === -1 &&
				// 	this.thisPlugin.settingManager.settings.pathListFilter.indexOf(parsedResult.file.parent?.path!) === -1) {
				// 	return
				// }
				// console.log(parsedResult)
				if (parsedResult.parsedResults) {
					parsedResult.parsedResults.forEach((_result, resultIndex) => {
						const smartGanttTaskElementContainer = smartGanttTaskBoard.createEl("div", {
							cls: "smart-gantt-checkbox-element-container"
						})
						if ("text" in parsedResult.token) {
							if ("checked" in parsedResult.token) {
								let checkbox = smartGanttTaskElementContainer.createEl("input", {
									type: "checkbox",
									cls: "smart-gantt-task-checkbox",
									attr: {
										id: `smart-gantt-task-checkbox-${parsedResultIndex}-${resultIndex}`
									}

								})
								if (parsedResult.token.checked) {
									checkbox.setAttr("checked", "checked")
								}
								this.renderCheckBox(parsedResult, checkbox)
							}

							const smartGanttTask = smartGanttTaskElementContainer.createEl("label", {
								cls: "smart-gantt-task-element",
								text: parsedResult.token.text.split("\n")[0].trim(),
								attr: {
									for: `smart-gantt-task-checkbox-${parsedResultIndex}-${resultIndex}`
								}
							})
							this.createCheckboxTaskHandle(smartGanttTask, parsedResult)
						}
					})

				} else {
					const smartGanttTaskElementContainer = smartGanttTaskBoard.createEl("div", {
						cls: "smart-gantt-task-element-container"
					})
					if ("text" in parsedResult.token) {
						if ("checked" in parsedResult.token) {
							let checkbox = smartGanttTaskElementContainer.createEl("input", {
								type: "checkbox",
								cls: "smart-gantt-task-checkbox",
								attr: {
									id: `smart-gantt-task-checkbox-${parsedResultIndex}-non-chrono}`
								}

							})
							if (parsedResult.token.checked) {
								checkbox.setAttr("checked", "checked")
							}
							this.renderCheckBox(parsedResult, checkbox)
						}

						const smartGanttTask = smartGanttTaskElementContainer.createEl("label", {
							cls: "smart-gantt-task-element",
							text: parsedResult.token.text.split("\n")[0].trim(),
							attr: {
								for: `smart-gantt-task-checkbox-${parsedResultIndex}-non-chrono}`
							}
						})

						this.createCheckboxTaskHandle(smartGanttTask, parsedResult)

					}


				}
			}
		)


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
