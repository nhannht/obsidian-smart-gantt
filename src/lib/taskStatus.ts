export type TaskBinaryStatus = "done" | "open";

/** Matches a GFM-style task checkbox with any marker character(s). */
const TASK_CHECKBOX_RE = /^\s*(?:[-*+]|\d+[.)])\s+\[([^\]]+)\]/;

/** Done (x/X) or cancelled (-) — both treated as finished. */
export function isDoneMarker(marker: string): boolean {
	const m = marker.trim();
	return m === "x" || m === "X" || m === "-";
}

/**
 * Classify a markdown list line as an open/done task, or null if it is not
 * a checkbox task.
 */
export function taskStatusFromLine(line: string): TaskBinaryStatus | null {
	const match = TASK_CHECKBOX_RE.exec(line);
	if (!match) return null;
	return isDoneMarker(match[1]) ? "done" : "open";
}
