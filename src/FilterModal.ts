import {App, Modal} from "obsidian";
import SmartGanttPlugin from "../main";
import {TimelineExtractorResult} from "./TimelineExtractor";

export class FilterModal extends Modal {
	override onOpen() {
		const {contentEl} = this
		let allParentPath: Set<string> = new Set()
		this.parsedResults.forEach(r => {
			r.file.parent?.path ? allParentPath.add(r.file.parent.path) : null
		})
		let fieldSetAllFilesOrCurrentFile = contentEl.createEl("div", {
				cls: "smart-gantt-filter-modal-fieldset"
			}
		)

		const directoryContainer = contentEl.createEl("div", {
			cls: "smart-gantt-filter-modal-directory-container"
		})


		let allFileCheckBoxContainer = fieldSetAllFilesOrCurrentFile.createEl("div", {
			cls: "smart-gantt-checkbox-element-container"
		})

		let currentFileCheckBoxContainer = fieldSetAllFilesOrCurrentFile.createEl("div", {
			cls: "smart-gantt-checkbox-element-container"
		})

		let customPathCheckBoxContainer = fieldSetAllFilesOrCurrentFile.createEl("div", {
			cls: "smart-gantt-checkbox-element-container"
		})

		let allFileCheckBox = allFileCheckBoxContainer.createEl("input", {
			type: "radio",
			attr: {
				id: `smart-gantt-path-filter-AllFile`,
				name: "all-or-current"
			}
		})
		allFileCheckBoxContainer.createEl("label", {
			text: "All Files in Vault",
			attr: {
				for: `smart-gantt-path-filter-AllFile`
			}
		})

		allFileCheckBox.addEventListener("change", async () => {
			const customPathCheckboxs = document.getElementsByClassName("smart-gantt-custom-path-checkbox")
			if (allFileCheckBox.checked) {
				await this.thisPlugin.settingManager.setToAllFiles()
				Array.from(customPathCheckboxs).forEach(element => {
					//@ts-ignore
					element.disabled = true

				})
				directoryContainer.hidden = true
				directoryContainer.addClass("opacity-50")
			}
			await this.thisPlugin.helper.reloadView()
		})

		if (this.thisPlugin.settingManager.settings.pathListFilter.indexOf("AllFiles") !== -1) {
			allFileCheckBox.checked = true
			directoryContainer.hidden = true
			directoryContainer.addClass("opacity-50")
		}


		let currentFileCheckBox = currentFileCheckBoxContainer.createEl("input", {
			type: "radio",
			attr: {
				id: `smart-gantt-path-filter-CurrentFile`,
				name: "all-or-current"
			}
		})
		currentFileCheckBoxContainer.createEl("label", {
			text: "Current File",
			attr: {
				for: `smart-gantt-path-filter-CurrentFile`
			}
		})
		currentFileCheckBox.addEventListener("change", async () => {
			const customPathCheckboxs = document.getElementsByClassName("smart-gantt-custom-path-checkbox")
			if (currentFileCheckBox.checked) {
				await this.thisPlugin.settingManager.setToCurrentFiles()
				Array.from(customPathCheckboxs).forEach(element => {
					// @ts-ignore
					element.disabled = true
				})
				directoryContainer.hidden = true
				directoryContainer.addClass("opacity-50")
			}
			await this.thisPlugin.helper.reloadView()
		})

		if (this.thisPlugin.settingManager.settings.pathListFilter.indexOf("CurrentFile") !== -1) {
			currentFileCheckBox.checked = true
			directoryContainer.hidden = true
			directoryContainer.addClass("opacity-50")
		}

		let customSelectedPathsCheckBox = customPathCheckBoxContainer.createEl("input", {
			type: "radio",
			attr: {
				id: "smart-gantt-filter-custom-paths",
				name: "all-or-current"
			}

		})
		customPathCheckBoxContainer.createEl("label", {
			text: "Custom parent directories",
			attr: {
				for: "smart-gantt-filter-custom-paths"
			}
		})

		customSelectedPathsCheckBox.addEventListener("change", async () => {
			const customPathCheckboxs = document.getElementsByClassName("smart-gantt-custom-path-checkbox")
			if (customSelectedPathsCheckBox.checked) {
				await this.thisPlugin.settingManager.clearAllPath()
				Array.from(customPathCheckboxs).forEach(e => {
					//@ts-ignore
					e.removeAttribute("disabled")
				})
				directoryContainer.hidden = false
				directoryContainer.removeClass("opacity-50")
			}
			await this.thisPlugin.helper.reloadView()
		})


		if (
			this.thisPlugin.settingManager.settings.pathListFilter.indexOf("CurrentFile") === -1 &&
			this.thisPlugin.settingManager.settings.pathListFilter.indexOf("AllFiles") === -1) {
			customSelectedPathsCheckBox.checked = true
			directoryContainer.hidden = false
			directoryContainer.removeClass("opacity-50")
		}

		Array.from(allParentPath).forEach((path, pathIndex) => {
			let singlePathContainer = directoryContainer.createEl("div", {
				cls: "smart-gantt-checkbox-element-container"
			})
			let singlePathCheckbox = singlePathContainer.createEl("input", {
				type: "checkbox",
				cls: "smart-gantt-custom-path-checkbox",
				attr: {
					id: `smart-gantt-path-filter-${pathIndex}`
				}
			})

			singlePathContainer.createEl("label", {
				text: path,
				attr: {
					for: `smart-gantt-path-filter-${pathIndex}`
				}
			})

			singlePathCheckbox.addEventListener("change", async () => {
				if (singlePathCheckbox.checked) {
					await this.thisPlugin.settingManager.addPath(path)
				} else {
					await this.thisPlugin.settingManager.removePath(path)
				}
				await this.thisPlugin.helper.reloadView()
				// console.log(this.thisPlugin.settingManager.settings)
			})

			if (this.thisPlugin.settingManager.settings.pathListFilter.indexOf("CurrentFile") !== -1 ||
				this.thisPlugin.settingManager.settings.pathListFilter.indexOf("AllFiles") !== -1) {
				singlePathCheckbox.disabled = true
			} else if (customSelectedPathsCheckBox.checked) {
				singlePathCheckbox.disabled = false
			}
			if (this.thisPlugin.settingManager.settings.pathListFilter.indexOf(path) !== -1) {
				singlePathCheckbox.setAttr("checked", "checked")
			}

		})

	}

	constructor(app: App,
				private thisPlugin: SmartGanttPlugin,
				private parsedResults: TimelineExtractorResult[]
	) {
		super(app)
	}


}
