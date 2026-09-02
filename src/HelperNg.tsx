import SmartGanttPlugin from "../main";
import {remark} from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {TFile} from "obsidian";
import wikiLinkPlugin from "remark-wiki-link";
import {listItemText} from "./lib/taskDates";
import {taskStatusFromListItem, walkListItems} from "./lib/taskStatus";


export type TaskWithMetaData = {
	name: string,
	checkbox: boolean,
	metadata: {
		[key: string]: string

	},
	lineIndex: number|null
}

export default class HelperNg {
	private remarkProcessor;

	constructor(public plugin: SmartGanttPlugin) {
		this.remarkProcessor = remark().use(remarkGfm).use(remarkParse).use(wikiLinkPlugin)
	}

	async getAllLinesContainCheckboxInMarkdown(file: TFile) {
		const fileContent = await this.plugin.app.vault.read(file)
		let results: { lineContent: string; lineIndex: number; }[] = []
		const lines = fileContent.split("\n")
		const tree = this.remarkProcessor.parse(fileContent)
		walkListItems(tree, (listItem) => {
			if (taskStatusFromListItem(listItem) === null) return
			const lineIndex = (listItem.position?.start.line ?? 0) - 1
			if (lineIndex < 0 || lines[lineIndex] === undefined) return
			results.push({
				lineContent: lines[lineIndex],
				lineIndex,
			})
		})

		return results
	}

	async extractLineWithCheckboxToTaskWithMetaData(task:{lineContent:string,lineIndex:number}) {
		const tree = this.remarkProcessor.parse(task.lineContent)
		let result: TaskWithMetaData | undefined

		walkListItems(tree, (listItem) => {
			if (result !== undefined) return
			const status = taskStatusFromListItem(listItem)
			if (status === null) return

			const keyValueRegex = /\[([^[\]]*?)::([^[\]]*?)]/g;
			const keyValuePairs: {[key:string]:string} = {}
			let match;
			while ((match = keyValueRegex.exec(task.lineContent)) !== null) {
				keyValuePairs[match[1].trim()] = match[2].trim()
			}

			result = {
				checkbox: status === "done",
				name: listItemText(listItem).trim(),
				metadata: keyValuePairs,
				lineIndex: task.lineIndex,
			}
		})

		return result
	}


}
