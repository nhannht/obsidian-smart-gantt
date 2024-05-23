import {Chrono, ParsedResult} from "chrono-node";

import {TokenWithFile} from "./MarkdownProcesser";

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


export interface SmartGanttParsesResult extends TokenWithFile {
	parsedResults: ParsedResult[]|null,

}

export default class TimelineExtractor {
	get smartGanttParsedResults(): SmartGanttParsesResult[] {
		return this._smartGanttParsedResults;
	}

	set smartGanttParsedResults(value: SmartGanttParsesResult[]) {
		this._smartGanttParsedResults = value;
	}
	get customChrono(): Chrono {
		return this._customChrono;
	}

	set customChrono(value: Chrono) {
		this._customChrono = value;
	}

	private _smartGanttParsedResults: SmartGanttParsesResult[] = [];



	private _customChrono: Chrono;

	constructor(customChrono: Chrono) {
		this._customChrono = customChrono;
	}




	async GetTimelineDataFromDocumentArrayWithChrono(tokens: TokenWithFile[] | null,
	): Promise<SmartGanttParsesResult[]> {
		// let timelineData: TimelineEntryChrono[] = []
		let smartGanttParsedResults: SmartGanttParsesResult[] = []
		// let documents: Document[] = []
		// console.log(tokens)
		tokens?.forEach((token) => {
			let parsedResult:ParsedResult[] = []
			if ("text" in token.token) {
				 parsedResult = this.customChrono.parse(token.token.text)
			}
			if (parsedResult && parsedResult.length > 0) {
				smartGanttParsedResults.push({
					...token,
					parsedResults: parsedResult
				})
			} else if (parsedResult.length === 0){
				smartGanttParsedResults.push({
					...token,
					parsedResults: null,
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
		this.smartGanttParsedResults = smartGanttParsedResults


		return smartGanttParsedResults
	}
}
