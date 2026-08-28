import {Chrono, ParsedResult} from "chrono-node";

import {NodeFromParseTree} from "./MarkdownProcesser";
import {
	extractTaskDates,
	GanttDateSpan,
	listItemText,
	spanFromTaskDates,
	stripTaskDateTokens,
} from "./lib/taskDates";
import {TFile} from "obsidian";
import {Node} from "unist";


export type {GanttDateSpan} from "./lib/taskDates";

export type TimelineExtractorResultNg = {
	id: string,
	node: Node,
	file: TFile,
	span: GanttDateSpan | null,
	parsedResult: ParsedResult | null,
	rawText: string,
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


	private spanFromChrono(text: string): { span: GanttDateSpan; parsedResult: ParsedResult } | null {
		const cleaned = stripTaskDateTokens(text);
		if (!cleaned) return null;
		const parsedResults = this.customChrono.parse(cleaned);
		if (!parsedResults || parsedResults.length === 0) return null;
		// One bar per task: prefer the parse that carries an explicit end (a range).
		const best = parsedResults.find(r => r.end) ?? parsedResults[0];
		let start = best.start.date();
		let end = best.end ? best.end.date() : start;
		const dayAnchor = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
		if (dayAnchor(end) < dayAnchor(start)) [start, end] = [end, start];
		return {
			span: {start, end, source: "chrono"},
			parsedResult: best,
		};
	}


	async GetTimelineDataFromNodes(nodes: NodeFromParseTree[]): Promise<TimelineExtractorResultNg[]> {
		const results: TimelineExtractorResultNg[] = []
		nodes.forEach(((node, nodeId) => {
			const rawText = listItemText(node.node);
			const taskDates = extractTaskDates(rawText);
			const taskSpan = taskDates ? spanFromTaskDates(taskDates) : null;

			if (taskSpan) {
				results.push({
					id: `${nodeId}`,
					node: node.node,
					file: node.file,
					span: taskSpan,
					parsedResult: null,
					rawText,
				});
				return;
			}

			const chronoResult = this.spanFromChrono(rawText);
			if (chronoResult) {
				this.#countResultWithChrono += 1;
				results.push({
					id: `${nodeId}`,
					node: node.node,
					file: node.file,
					span: chronoResult.span,
					parsedResult: chronoResult.parsedResult,
					rawText,
				});
				return;
			}

			results.push({
				id: `${nodeId}`,
				node: node.node,
				file: node.file,
				span: null,
				parsedResult: null,
				rawText,
			});
		}))
		return results

	}


}
