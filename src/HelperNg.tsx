import SmartGanttPlugin from "../main";
import {remark} from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {TFile} from "obsidian";
import wikiLinkPlugin from "remark-wiki-link";


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
		// console.log("we are in the helper")
		// console.log("before read file")
		// console.log(file)

		const fileContent = await this.plugin.app.vault.read(file)
		// console.log("after read file conent")
		let results: { lineContent: string; lineIndex: number; }[] = []
		const lines = fileContent.split("\n")
		const regexForTask = /^- \[([ |x])] (.+)$/
		lines.forEach((line,index)=>{
			if (line.trim().match(regexForTask)){
				results.push({
					'lineContent': line,
					'lineIndex': index
				})

			}
		})


		return results
	}

	async extractLineWithCheckboxToTaskWithMetaData(task:{lineContent:string,lineIndex:number}) {
		const regex = /- \[(x| )\] (.*?)(\[.*\])/
		const matches = task.lineContent.match(regex);
		// console.log(matches)

		if (matches) {
			const checkbox = matches[1] === 'x';
			const name = matches[2].trim();
			const keyValueRegex = /\[([^\[\]]*?)::([^\[\]]*?)]/g;
			const keyValuePairs:{[key:string]:string} = {}

			let match;
			while ((match = keyValueRegex.exec(matches[3])) !== null) {
				keyValuePairs[match[1].trim()] = match[2].trim()

			}

			return {
				checkbox,
				name,
				metadata: keyValuePairs,
				lineIndex: task.lineIndex
			} as TaskWithMetaData
		}
	}


}
