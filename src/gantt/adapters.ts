import {ListItem} from "mdast";
import type {TimelineExtractorResultNg} from "@/TimelineExtractor";
import {GanttTask, GanttZoom} from "./types";
import {dayAnchor} from "./useGanttGeometry";

export function nodeText(node: unknown): string {
	try {
		// list item -> paragraph -> text
		const value = (node as { children: { children: { value?: string }[] }[] })
			.children[0].children[0].value;
		return (value ?? "").trim() || "Untitled task";
	} catch {
		return "Untitled task";
	}
}

/** One extractor result with a parsed date becomes one bar. */
export function resultToGanttTask(r: TimelineExtractorResultNg): GanttTask | null {
	if (!r.parsedResult) return null;
	let start = r.parsedResult.start.date();
	let end = r.parsedResult.end ? r.parsedResult.end.date() : start;
	if (dayAnchor(end) < dayAnchor(start)) [start, end] = [end, start];
	return {
		id: r.id,
		name: nodeText(r.node),
		start,
		end,
		status: (r.node as ListItem).checked ? "done" : "open",
		sourcePath: r.file.path,
		meta: r,
	};
}

export function resultsToGanttTasks(results: TimelineExtractorResultNg[]): GanttTask[] {
	return results
		.map(resultToGanttTask)
		.filter((t): t is GanttTask => t !== null);
}

/** Normalizes persisted view modes, including legacy gantt-task-react values. */
export function zoomFromSetting(value: unknown): GanttZoom {
	const v = String(value ?? "").toLowerCase();
	if (v === "week" || v === "half day" || v === "quarter day" || v === "hour") return "week";
	if (v === "month") return "month";
	if (v === "quarter" || v === "year" || v === "quarter year") return "quarter";
	return "day";
}
