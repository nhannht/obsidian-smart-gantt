import SmartGanttPlugin from "../../main";
import {EditorPosition, MarkdownPostProcessorContext, MarkdownView, WorkspaceLeaf} from "obsidian";
import {TimelineExtractorResultNg} from "@/TimelineExtractor";
import {
	applyDataviewDates,
	applyTasksEmojiDates,
	formatIsoDate,
} from "@/lib/taskDates";
import {Node} from "mdast"
import {SmartGanttSettings} from "@/SettingManager";
export class Helper {
	constructor(private thisPlugin: SmartGanttPlugin) {
	}

	async reloadView() {
		this.thisPlugin.app.workspace.detachLeavesOfType("smart-gantt")
		let leaf = this.thisPlugin.app.workspace.getRightLeaf(false);

		await leaf?.setViewState({
			type: "smart-gantt",
			active: true,
		})
		if (leaf instanceof WorkspaceLeaf && !this.thisPlugin.app.workspace.rightSplit.collapsed) {
			await this.thisPlugin.app.workspace.revealLeaf(leaf);

		}
	}

	getAllParentPath = () => {
		let allParentPath: Set<string> = new Set()
		this.thisPlugin.app.vault.getMarkdownFiles().forEach(r => {
			if (r.parent?.path) {
				allParentPath.add(r.parent.path)
			}
		})
		return Array.from(allParentPath)
	}

	jumpToPositionOfResult = async (result:TimelineExtractorResultNg)=>{
		const leaf = this.thisPlugin.app.workspace.getLeaf(true)
		await leaf.openFile(result.file)
		const view = leaf.view as MarkdownView
		const node:Node = result.node
		// console.log(node)

		const from: EditorPosition = {
			line: Number(node.position?.start.line) - 1,
			ch: Number(node.position?.start.column) - 1,
		}
		const to: EditorPosition = {
			line: Number(node.position?.end.line) - 1,
			ch: Number(node.position?.end.column) - 1,
		}
		view.editor.setSelection(from, to)

	}

	/**
	 * Persists a dragged/resized bar back into the source line. Tasks and
	 * Dataview dates are rewritten in their native syntax; chrono-matched
	 * natural language is replaced in place or canonicalized as a range.
	 */
	updateResultDates = async (result: TimelineExtractorResultNg, start: Date, end: Date) => {
		if (!result.span) return
		const lineIndex = Number(result.node.position?.start.line) - 1
		if (Number.isNaN(lineIndex) || lineIndex < 0) return
		await this.thisPlugin.app.vault.process(result.file, (content) => {
			const lines = content.split("\n")
			let line = lines[lineIndex]
			if (line === undefined) return content

			switch (result.span?.source) {
				case "tasks":
					line = applyTasksEmojiDates(line, start, end)
					break
				case "dataview":
					line = applyDataviewDates(line, start, end)
					break
				case "chrono": {
					const range = formatIsoDate(start) === formatIsoDate(end)
						? formatIsoDate(start)
						: `${formatIsoDate(start)} to ${formatIsoDate(end)}`
					const matched = result.parsedResult?.text
					if (matched && line.includes(matched)) {
						line = line.replace(matched, range)
					} else {
						line = line
							.replace(/[\u{1F6EB}\u{23F3}\u{2705}\u{2795}\u{274C}\u{1F4C5}]️?\s*\d{4}-\d{2}-\d{2}/gu, "")
							.replace(/\[(start|due|scheduled|created|completion|cancelled)::[^\]]*]/g, "")
							.replace(/\s+$/, "")
						line = `${line} ${range}`
					}
					break
				}
			}

			lines[lineIndex] = line
			return lines.join("\n")
		})
	}

	updateBlockSettingWithInternalSetting = async (settingObject: SmartGanttSettings,
												   context: MarkdownPostProcessorContext) => {

		const sourcePath = context.sourcePath
		const contextEl = (context as MarkdownPostProcessorContext & { el: HTMLElement }).el
		const elInfo = context.getSectionInfo(contextEl)
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
				await this.thisPlugin.app.vault.process(file, () => newSettingsString)
			}
		}

	}



}
