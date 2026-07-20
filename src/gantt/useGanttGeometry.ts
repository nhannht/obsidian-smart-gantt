import {useMemo} from "react";
import {GanttTask, GanttZoom} from "./types";

const DAY_MS = 86_400_000;

/** Noon-UTC anchor for a local calendar date; immune to DST hour shifts. */
export function dayAnchor(d: Date): number {
	return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12);
}

export function anchorToDate(anchor: number): Date {
	const u = new Date(anchor);
	return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());
}

export function addDays(d: Date, days: number): Date {
	return anchorToDate(dayAnchor(d) + days * DAY_MS);
}

export function daysBetween(a: Date, b: Date): number {
	return Math.round((dayAnchor(b) - dayAnchor(a)) / DAY_MS);
}

export function isWeekend(d: Date): boolean {
	const wd = d.getDay();
	return wd === 0 || wd === 6;
}

export function sameDay(a: Date, b: Date): boolean {
	return dayAnchor(a) === dayAnchor(b);
}

export interface ZoomSpec {
	pxPerDay: number
	/** Bottom axis cell span in days ("unit"). */
	unitDays: number
	/** Range padding, in days, on each side of the task span. */
	padDays: number
	showWeekend: boolean
}

export const ZOOMS: Record<GanttZoom, ZoomSpec> = {
	day: {pxPerDay: 40, unitDays: 1, padDays: 10, showWeekend: true},
	week: {pxPerDay: 12, unitDays: 7, padDays: 21, showWeekend: true},
	month: {pxPerDay: 4, unitDays: 0, padDays: 45, showWeekend: false},
	quarter: {pxPerDay: 1.6, unitDays: 0, padDays: 120, showWeekend: false},
};

export interface AxisCell {
	x: number
	width: number
	label: string
	isWeekend: boolean
	isToday: boolean
}

export interface AxisGroup {
	x: number
	width: number
	label: string
}

export interface GanttGeometry {
	zoom: GanttZoom
	spec: ZoomSpec
	rangeStart: Date
	rangeEnd: Date
	totalWidth: number
	dateToX: (d: Date) => number
	xToDate: (x: number) => Date
	barX: (t: GanttTask) => number
	barWidth: (t: GanttTask) => number
	/** Bottom axis cells clipped to a visible px window. */
	cellsIn: (fromX: number, toX: number) => AxisCell[]
	/** Top axis groups (months, or years in quarter zoom) in a px window. */
	groupsIn: (fromX: number, toX: number) => AxisGroup[]
	todayX: number | null
}

function startOfWeek(d: Date): Date {
	return addDays(d, -((d.getDay() + 6) % 7)); // Monday
}

function startOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

const MONTH_FMT = new Intl.DateTimeFormat(undefined, {month: "short"});
const MONTH_YEAR_FMT = new Intl.DateTimeFormat(undefined, {month: "long", year: "numeric"});

export function buildGeometry(tasks: GanttTask[], zoom: GanttZoom, today: Date): GanttGeometry {
	const spec = ZOOMS[zoom];

	let min = today, max = today;
	for (const t of tasks) {
		if (dayAnchor(t.start) < dayAnchor(min)) min = t.start;
		if (dayAnchor(t.end) > dayAnchor(max)) max = t.end;
	}
	const rangeStart = startOfWeek(addDays(min, -spec.padDays));
	const rangeEnd = addDays(max, spec.padDays);
	const totalDays = daysBetween(rangeStart, rangeEnd) + 1;
	const totalWidth = totalDays * spec.pxPerDay;

	const dateToX = (d: Date) => daysBetween(rangeStart, d) * spec.pxPerDay;
	const xToDate = (x: number) => addDays(rangeStart, Math.round(x / spec.pxPerDay));

	const cellsIn = (fromX: number, toX: number): AxisCell[] => {
		const cells: AxisCell[] = [];
		if (spec.unitDays > 0) {
			const firstIdx = Math.max(0, Math.floor(fromX / (spec.pxPerDay * spec.unitDays)));
			let d = zoom === "week"
				? startOfWeek(addDays(rangeStart, firstIdx * spec.unitDays))
				: addDays(rangeStart, firstIdx * spec.unitDays);
			while (dateToX(d) < toX && dayAnchor(d) <= dayAnchor(rangeEnd)) {
				cells.push({
					x: dateToX(d),
					width: spec.pxPerDay * spec.unitDays,
					label: zoom === "day" ? String(d.getDate()) : String(d.getDate()),
					isWeekend: zoom === "day" && isWeekend(d),
					isToday: zoom === "day" && sameDay(d, today),
				});
				d = addDays(d, spec.unitDays);
			}
		} else {
			// Month-sized cells (month + quarter zoom)
			let d = startOfMonth(xToDate(Math.max(0, fromX)));
			while (dateToX(d) < toX && dayAnchor(d) <= dayAnchor(rangeEnd)) {
				const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
				cells.push({
					x: dateToX(d),
					width: dateToX(next) - dateToX(d),
					label: MONTH_FMT.format(d),
					isWeekend: false,
					isToday: false,
				});
				d = next;
			}
		}
		return cells;
	};

	const groupsIn = (fromX: number, toX: number): AxisGroup[] => {
		const groups: AxisGroup[] = [];
		if (zoom === "quarter") {
			let y = xToDate(Math.max(0, fromX)).getFullYear();
			for (; ; y++) {
				const start = new Date(y, 0, 1);
				const x = Math.max(0, dateToX(start));
				if (x > toX || dayAnchor(start) > dayAnchor(rangeEnd)) break;
				const end = Math.min(dateToX(new Date(y + 1, 0, 1)), totalWidth);
				groups.push({x, width: end - x, label: String(y)});
			}
		} else {
			let d = startOfMonth(xToDate(Math.max(0, fromX)));
			while (dateToX(d) < toX && dayAnchor(d) <= dayAnchor(rangeEnd)) {
				const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
				const x = Math.max(0, dateToX(d));
				groups.push({
					x,
					width: Math.min(dateToX(next), totalWidth) - x,
					label: MONTH_YEAR_FMT.format(d),
				});
				d = next;
			}
		}
		return groups;
	};

	const todayInRange = dayAnchor(today) >= dayAnchor(rangeStart) && dayAnchor(today) <= dayAnchor(rangeEnd);

	return {
		zoom,
		spec,
		rangeStart,
		rangeEnd,
		totalWidth,
		dateToX,
		xToDate,
		barX: (t) => dateToX(t.start),
		barWidth: (t) => (daysBetween(t.start, t.end) + 1) * spec.pxPerDay,
		cellsIn,
		groupsIn,
		todayX: todayInRange ? dateToX(today) + spec.pxPerDay / 2 : null,
	};
}

export function useGanttGeometry(tasks: GanttTask[], zoom: GanttZoom): GanttGeometry {
	return useMemo(() => buildGeometry(tasks, zoom, new Date()), [tasks, zoom]);
}
