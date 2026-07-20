import {Chrono, ParsedResult} from "chrono-node";

import {NodeFromParseTree} from "./MarkdownProcesser";
import {TFile} from "obsidian";
import {Node} from "unist"


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
				// One bar per task: prefer the parse that carries an explicit
				// end (a range), fall back to the first match.
				const best = parsedResults.find(r => r.end) ?? parsedResults[0]
				results.push({
					id: `${nodeId}`,
					node:node.node,
					file:node.file,
					parsedResult:best
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


}
