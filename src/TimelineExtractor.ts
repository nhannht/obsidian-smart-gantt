import {Chrono, ParsedResult} from "chrono-node";

import {NodeFromParseTree, TokenWithFile} from "./MarkdownProcesser";
import {Token} from "marked";
import {TFile} from "obsidian";
import {Node} from "unist"


export type SmartGanttParsedResults = {
	parsedResults: ParsedResult[]|null,
	rawText:string

}
export type TimelineExtractorResult = {
	token:Token,
	file:TFile,
	parsedResultsAndRawText: SmartGanttParsedResults,

}

export type TimelineExtractorResultNg = {
	id: string,
	node:Node,
	file:TFile,
	parsedResult: ParsedResult|null

}

export default class TimelineExtractor {
	get countResultWithChrono(): number {
		return this.#countResultWithChrono;
	}

	get customChrono(): Chrono {
		return this._customChrono;
	}


	private readonly _customChrono: Chrono;

	#countResultWithChrono = 0

	constructor(customChrono: Chrono) {
		this._customChrono = customChrono;
	}


	private makeTextCompatibleWithTaskPlugin(text: string) {
		const hourGlass = text.replace(/⏳/g, " due in "),
			airPlain = hourGlass.replace(/🛫/g, " start from "),
			heavyPlus = airPlain.replace(/➕/g, " created in "),
			checkMark = heavyPlus.replace(/✅/g, " done in "),
			crossMark = checkMark.replace(/❌/g, " cancelled in "),

			createdIn = crossMark.replace(/\[created::\s+(.*)]/g, " created in $1 "),
			scheduledIn = createdIn.replace(/\[scheduled::\s+(.*)]/g, " scheduled in $1 "),
			startFrom = scheduledIn.replace(/\[start::\s+(.*)]/g, " start from $1 "),
			dueTo = startFrom.replace(/\[due::\s+(.*)]/g, " due to $1 "),
			completionIn = dueTo.replace(/\[completion::\s+(.*)]/g, " completion in $1 "),
			cancelledIn = completionIn.replace(/\[cancelled::\s(.*)]/g, " cancelled in $1 "),

			calendarMark = cancelledIn.replace("/📅/g", " to ")

		return calendarMark

	}


	async GetTimelineDataFromNodes(nodes:NodeFromParseTree[]):Promise<TimelineExtractorResultNg[]> {
		let results:TimelineExtractorResultNg[] = []
		nodes.forEach(((node,nodeId)=>{
			//@ts-ignore
			let rawText = node.node.children[0].children[0].value
			let transformedText = this.makeTextCompatibleWithTaskPlugin(rawText)
			const parsedResults = this.customChrono.parse(transformedText)
			if (parsedResults && parsedResults.length > 0 ){
				parsedResults.forEach((r,rId) =>{
					results.push({
						id: `${nodeId}-${rId}`,
						node:node.node,
						file:node.file,
						parsedResult:r
					})

				})
			} else {
				results.push({
					id: `${nodeId}`,
					node:node.node,
					file:node.file,
					parsedResult:null
				})
			}
		}))
		return results

	}


	async GetTimelineDataFromDocumentArrayWithChrono(tokens: TokenWithFile[] | null,
	): Promise<TimelineExtractorResult[]> {
		// let timelineData: TimelineEntryChrono[] = []
		let extractorResultList: TimelineExtractorResult[] = []
		// let documents: Document[] = []
		// console.log(tokens)
		tokens?.forEach((token) => {
			let parsedResult:ParsedResult[] = []
			if ("text" in token.token) {
				const taskPluginCompatibleText = this.makeTextCompatibleWithTaskPlugin(token.token.text)
				 parsedResult = this.customChrono.parse(taskPluginCompatibleText)
			}
			if (parsedResult && parsedResult.length > 0) {
				this.#countResultWithChrono = this.#countResultWithChrono + 1
				const smartGanttParsedResults:SmartGanttParsedResults = {
					parsedResults: parsedResult,
					//@ts-ignore
					rawText: token.token.text
				}
				 extractorResultList.push({
					...token,
					parsedResultsAndRawText: smartGanttParsedResults
				})
			} else if (parsedResult.length === 0){
				const smartGanttParsedResults: SmartGanttParsedResults = {
					parsedResults:null,
					//@ts-ignore
					rawText:token.token.text
				}
				 extractorResultList.push({
					...token,
					parsedResultsAndRawText: smartGanttParsedResults,
				})
			}
		})

		return  extractorResultList
	}
}
