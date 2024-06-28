import {Chrono, ParsedResult} from "chrono-node";

import {TokenWithFile} from "./MarkdownProcesser";
import {Token} from "marked";
import {TFile} from "obsidian";

// export interface TimelineEntry {
// 	dateString: string;
// 	dateStringCompact: string,
// 	unixTime: number;
// 	sentence: string;
//
// }
//
// export interface TimelineEntryChrono extends TimelineEntry {
// 	stringThatParseAsDate: string,
// }

export type SmartGanttParsedResults = {
	parsedResults: ParsedResult[]|null,
	rawText:string

}
export type TimelineExtractorResult = {
	token:Token,
	file:TFile,
	parsedResultsAndRawText: SmartGanttParsedResults,

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
		const hourGlass = text.replace(/⏳/g, "due in "),
			airPlain = hourGlass.replace(/🛫/g, "start from "),
			heavyPlus = airPlain.replace(/➕/g, "created in "),
			checkMark = heavyPlus.replace(/✅/g, "done in "),
			crossMark = checkMark.replace(/❌/g, "cancelled in "),

			createdIn = crossMark.replace(/\[created::\s+(.*)]/g, "created in $1"),
			scheduledIn = createdIn.replace(/\[scheduled::\s+(.*)]/g, "scheduled in $1"),
			startFrom = scheduledIn.replace(/\[start::\s+(.*)]/g, "start from $1"),
			dueTo = startFrom.replace(/\[due::\s+(.*)]/g, "due to $1"),
			completionIn = dueTo.replace(/\[completion::\s+(.*)]/g, "completion in $1"),
			cancelledIn = completionIn.replace(/\[cancelled::\s(.*)]/g, "cancelled in $1 "),

			calendarMark = cancelledIn.replace("/📅/g", " to ")

		return calendarMark


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

		// @ts-ignore
		// documents?.forEach((doc) => {
		// 	// console.log(text)
		// 	let parseResults;
		//
		// 	parseResults = this.customChrono.parse(doc.raw)
		// 	// console.log(parseResults)
		//
		// 	// console.log(parseResults)
		// 	// console.log(parseResults)
		// 	if (!parseResults || parseResults.length === 0) {
		// 		return
		// 	}
		// 	parseResults.forEach((parseResult) => {
		// 		const [startData, endData] = this.extractDataToParseResult(parseResult, doc.raw)
		// 		if (startData) {
		// 			timelineData.push(startData)
		// 		}
		// 		if (endData) {
		// 			timelineData.push(endData)
		// 		}
		// 	})
		//
		//
		// })
		//
		// timelineData.sort((a, b) => {
		// 	return a.unixTime - b.unixTime
		// })
		//
		//
		// // console.log(parsedUserQueryArray)
		//
		// // sort filterTimelineData
		//
		// this.timelineData = timelineData
		this.smartGanttParsedResults =  extractorResultList


		return  extractorResultList
	}
}
