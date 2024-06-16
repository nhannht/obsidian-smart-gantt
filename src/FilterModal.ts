import {App, Modal} from "obsidian";
import SmartGanttPlugin from "../main";
import {SmartGanttParsesResult} from "./TimelineExtractor";

export class FilterModal extends Modal {
	override onOpen() {
		const {contentEl} = this
		let allParentPath:Set<string> = new Set()
		this.parsedResults.forEach(r =>{
			r.file.parent?.path ? allParentPath.add(r.file.parent.path) : null
		})
		const directoryContainer = contentEl.createEl("div")
		Array.from(allParentPath).forEach((path,pathIndex) => {
			let checkbox = directoryContainer.createEl("input", {
				type: "checkbox",
				attr: {
					id: `smart-gantt-path-filter-${pathIndex}`
				}
			})

			directoryContainer.createEl("label",{
				text: path,
				attr: {
					for: `smart-gantt-path-filter-${pathIndex}`
				}
			})
			checkbox.addEventListener("change", async ()=>{
				if (checkbox.checked){
					await this.thisPlugin.settingManager.addPath(path)
				} else {
					await this.thisPlugin.settingManager.removePath(path)
				}
				await this.thisPlugin.helper.reloadView()
				// console.log(this.thisPlugin.settingManager.settings)
			})

			if (this.thisPlugin.settingManager.settings.pathListFilter.indexOf(path) !== -1){
				checkbox.setAttr("checked","checked")
			}

		})

	}
	constructor(app: App,
				private thisPlugin: SmartGanttPlugin,
				private parsedResults: SmartGanttParsesResult[]
	){
		super(app)
	}


}
