import SmartGanttPlugin from "../../main";
import {EditorPosition, MarkdownPostProcessorContext, MarkdownView, WorkspaceLeaf} from "obsidian";
import {FilterModal} from "../FilterModal";
import {Task} from "gantt-task-react";
import {TimelineExtractorResultNg} from "@/TimelineExtractor";
import {Node} from "mdast"
import {SmartGanttSettings} from "@/SettingManager";
export class Helper {
	constructor(private thisPlugin: SmartGanttPlugin) {
	}

	async reloadView() {
		this.thisPlugin.app.workspace.detachLeavesOfType("smart-gantt")
		let leaf = this.thisPlugin.app.workspace.getRightLeaf(false);

		leaf?.setViewState({
			type: "smart-gantt",
			active: true,
		})
		if (leaf instanceof WorkspaceLeaf && !this.thisPlugin.app.workspace.rightSplit.collapsed) {
			this.thisPlugin.app.workspace.revealLeaf(leaf);

		}
	}

	async renderFilterBox() {
		new FilterModal(this.thisPlugin.app,
			this.thisPlugin,
		).open()

	}

	getComputedStyleOfVault() {
		return getComputedStyle(document.body)

	}

	getAllParentPath = () => {
		let allParentPath: Set<string> = new Set()
		this.thisPlugin.app.vault.getMarkdownFiles().forEach(r => {
			r.parent?.path ? allParentPath.add(r.parent.path) : null
		})
		return Array.from(allParentPath)
	}

	jumpToPositionOfResult = async (result:TimelineExtractorResultNg)=>{
		const leaf = this.thisPlugin.app.workspace.getLeaf(true)
		await leaf.openFile(result.file)
		const view = leaf.view as MarkdownView
		const node:Node = result.node
		// console.log(node)

		view.editor.setSelection({
			line:  Number(node.position?.start.line) - 1,
			ch: Number(node.position?.start.column) - 1,
		} as EditorPosition,
			{
			line:Number(node.position?.end.line) - 1,
			ch: Number(node.position?.end.column) - 1
		} as EditorPosition)

	}

	jumpToPositionOfNode= async (task:Task,results:TimelineExtractorResultNg[])=>{
		const result = results.find(r => r.id === task.id) as TimelineExtractorResultNg
		const leaf = this.thisPlugin.app.workspace.getLeaf(true)
		await leaf.openFile(result.file)
		const view = leaf.view as MarkdownView
		const node:Node = result.node
		// console.log(node)

		view.editor.setSelection({
			line:  Number(node.position?.start.line) - 1,
			ch: Number(node.position?.start.column) - 1,
		} as EditorPosition,
			{
			line:Number(node.position?.end.line) - 1,
			ch: Number(node.position?.end.column) - 1
		} as EditorPosition)
	}

	updateBlockSettingWithInternalSetting = (settingObject: SmartGanttSettings,
												   context: MarkdownPostProcessorContext) => {

		const sourcePath = context.sourcePath
		//@ts-ignore
		const elInfo = context.getSectionInfo(context.el)
		// console.log(elInfo)
		if (elInfo) {
			// console.log(elInfo.text)
			let linesFromFile = elInfo.text.split(/(.*?\n)/g)
			linesFromFile.forEach((e, i) => {
				if (e === "") linesFromFile.splice(i, 1)
			})
			// console.log(linesFromFile)
			linesFromFile.splice(elInfo.lineStart + 1,
				elInfo.lineEnd - elInfo.lineStart - 1,
				JSON.stringify(settingObject, null, "\t"), "\n")
			// console.log(linesFromFile)
			const newSettingsString = linesFromFile.join("")
			const file = this.thisPlugin.app.vault.getFileByPath(sourcePath)
			if (file) {
				this.thisPlugin.app.vault.modify(file, newSettingsString)
			}
		}

	}



}
