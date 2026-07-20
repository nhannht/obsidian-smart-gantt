export type GanttTaskStatus = "open" | "done"

export interface GanttTask {
	id: string
	name: string
	/** Inclusive first day of the bar. */
	start: Date
	/** Inclusive last day of the bar; always >= start. */
	end: Date
	status: GanttTaskStatus
	/** Vault path of the source line, when the task came from a note. */
	sourcePath?: string
	/** Surface-specific payload carried through untouched. */
	meta?: unknown
}

export type GanttZoom = "day" | "week" | "month" | "quarter"

export interface GanttChangePayload {
	start: Date
	end: Date
}
