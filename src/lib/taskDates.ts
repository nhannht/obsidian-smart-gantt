import {Node, Parent} from "unist";

const ISO_DATE = /(\d{4}-\d{2}-\d{2})/;
const OPTIONAL_TIME = /(?:\s+\d{1,2}:\d{2})?/;

const TASKS_START = new RegExp(`🛫\\s*${ISO_DATE.source}${OPTIONAL_TIME.source}`);
const TASKS_DUE = new RegExp(`📅\\s*${ISO_DATE.source}${OPTIONAL_TIME.source}`);
const DATAVIEW_START = /\[start::\s*([^\]]+?)\s*]/i;
const DATAVIEW_DUE = /\[due::\s*([^\]]+?)\s*]/i;

export type TaskDateSource = "tasks" | "dataview" | "chrono";

export type TaskDateFields = {
	startDate: Date | null;
	dueDate: Date | null;
	source: Exclude<TaskDateSource, "chrono">;
};

export type GanttDateSpan = {
	start: Date;
	end: Date;
	source: TaskDateSource;
};

function dayAnchor(d: Date): number {
	return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseIsoDate(value: string): Date | null {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
	if (!m) return null;
	return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function parseDateToken(raw: string | undefined): Date | null {
	if (!raw) return null;
	const iso = ISO_DATE.exec(raw.trim());
	return iso ? parseIsoDate(iso[1]) : null;
}

function matchTasksDates(text: string): TaskDateFields | null {
	const startDate = parseDateToken(TASKS_START.exec(text)?.[1]);
	const dueDate = parseDateToken(TASKS_DUE.exec(text)?.[1]);
	if (!startDate && !dueDate) return null;
	return {startDate, dueDate, source: "tasks"};
}

function matchDataviewDates(text: string): TaskDateFields | null {
	const startDate = parseDateToken(DATAVIEW_START.exec(text)?.[1]);
	const dueDate = parseDateToken(DATAVIEW_DUE.exec(text)?.[1]);
	if (!startDate && !dueDate) return null;
	return {startDate, dueDate, source: "dataview"};
}

/** Pull Tasks emoji or Dataview start/due fields from a task line. */
export function extractTaskDates(text: string): TaskDateFields | null {
	return matchTasksDates(text) ?? matchDataviewDates(text);
}

/** Map Tasks start/due fields to an inclusive Gantt bar span. */
export function spanFromTaskDates(fields: TaskDateFields): GanttDateSpan | null {
	const anchor = fields.startDate ?? fields.dueDate;
	if (!anchor) return null;
	const endAnchor = fields.dueDate ?? fields.startDate ?? anchor;
	let start = anchor;
	let end = endAnchor;
	if (dayAnchor(end) < dayAnchor(start)) [start, end] = [end, start];
	return {start, end, source: fields.source};
}

/** Remove Tasks/Dataview date tokens so chrono does not pick them up. */
export function stripTaskDateTokens(text: string): string {
	return text
		.replace(/🛫\s*\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?/g, "")
		.replace(/📅\s*\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?/g, "")
		.replace(/⏳\s*\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?/g, "")
		.replace(/➕\s*\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?/g, "")
		.replace(/✅\s*\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?/g, "")
		.replace(/❌\s*\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?/g, "")
		.replace(/\[(start|due|scheduled|created|completion|cancelled)::[^\]]*]/gi, "")
		.replace(/\s{2,}/g, " ")
		.trim();
}

export function formatIsoDate(d: Date): string {
	const p = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function sameDay(a: Date, b: Date): boolean {
	return formatIsoDate(a) === formatIsoDate(b);
}

const TASKS_EMOJI_DATE =
	/[\u{1F6EB}\u{1F4C5}]️?\s*\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?/gu;

/** Persist a dragged/resized bar using Tasks emoji dates. */
export function applyTasksEmojiDates(line: string, start: Date, end: Date): string {
	let next = line.replace(TASKS_EMOJI_DATE, "").replace(/\s{2,}/g, " ").trimEnd();
	const startIso = formatIsoDate(start);
	const dueIso = formatIsoDate(end);

	if (sameDay(start, end)) {
		return `${next} 📅 ${dueIso}`.trim();
	}
	return `${next} 🛫 ${startIso} 📅 ${dueIso}`.trim();
}

/** Persist a dragged/resized bar using Dataview inline fields. */
export function applyDataviewDates(line: string, start: Date, end: Date): string {
	let next = line
		.replace(/\[(start|due)::[^\]]*]/gi, "")
		.replace(/\s{2,}/g, " ")
		.trimEnd();
	const startIso = formatIsoDate(start);
	const dueIso = formatIsoDate(end);

	if (sameDay(start, end)) {
		return `${next} [due:: ${dueIso}]`.trim();
	}
	return `${next} [start:: ${startIso}] [due:: ${dueIso}]`.trim();
}

/** Concatenate all inline text from the first paragraph of a list item. */
export function listItemText(node: Node): string {
	try {
		const listItem = node as Parent;
		const paragraph = listItem.children?.[0] as Parent | undefined;
		if (!paragraph?.children) return "";
		return paragraph.children
			.map((child) => {
				const textChild = child as { value?: unknown };
				return typeof textChild.value === "string" ? textChild.value : "";
			})
			.join("");
	} catch {
		return "";
	}
}
