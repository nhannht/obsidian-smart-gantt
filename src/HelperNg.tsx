import SmartGanttPlugin from "../main";
import {remark} from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {TFile} from "obsidian";
import wikiLinkPlugin from "remark-wiki-link";
import {Root} from "react-dom/client";
import {Node} from "unist"

export type TaskWithMetaData = {
	content: string,
	checkbox: boolean,
	metadata: {
		[key: string]: string

	}
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

	async extractLineWithCheckboxToTaskWithMetaData(task:string){
		const regex = /- \[(x| )\] (.*?)(\[.*\])/
		const matches = task.match(regex);
		// console.log(matches)

		if (matches) {
			const checkbox = matches[1] === 'x';
			const content = matches[2].trim();
			const keyValueRegex = /\[([^\[\]]*?)::([^\[\]]*?)]/g;
			let keyValuePairs:{[key:string]:string} = {}

			let match;
			while ((match = keyValueRegex.exec(matches[3])) !== null) {
				keyValuePairs[match[1].trim()] = match[2].trim()

			}

			return {
				checkbox,
				content,
				metadata: keyValuePairs
			} as TaskWithMetaData
		}
	}


}
