import {memo, useState} from "react";
import {GanttChangePayload, GanttTask} from "./types";
import {dayAnchor, daysBetween, GanttGeometry} from "./useGanttGeometry";
import {useDragInteraction} from "./useDragInteraction";
import GanttTooltip from "./GanttTooltip";

export type BarTone = "done" | "overdue" | "active" | "future"

export function barTone(task: GanttTask, today: Date): BarTone {
	if (task.status === "done") return "done";
	if (dayAnchor(task.end) < dayAnchor(today)) return "overdue";
	if (dayAnchor(task.start) <= dayAnchor(today)) return "active";
	return "future";
}

const TaskBar = memo((props: {
	task: GanttTask
	geometry: GanttGeometry
	onCommit?: (task: GanttTask, change: GanttChangePayload) => void
	onOpenSource?: (task: GanttTask) => void
}) => {
	const {task, geometry, onCommit, onOpenSource} = props;
	const [hover, setHover] = useState(false);
	const {drag, barHandlers, startHandleProps, endHandleProps} =
		useDragInteraction(task, geometry, onCommit);

	const today = new Date();
	const tone = barTone(task, today);
	const px = geometry.spec.pxPerDay;

	let left = geometry.barX(task);
	let width = Math.max(geometry.barWidth(task), 6);
	let translate = 0;
	if (drag) {
		const dx = drag.deltaDays * px;
		if (drag.mode === "move") translate = dx;
		if (drag.mode === "resize-start") {
			const clamped = Math.min(dx, width - px);
			translate = clamped;
			width -= clamped;
		}
		if (drag.mode === "resize-end") width = Math.max(width + dx, px);
	}

	const duration = daysBetween(task.start, task.end) + 1;
	const elapsed = tone === "active"
		? Math.min((daysBetween(task.start, today) + 0.5) / duration, 1)
		: null;

	const labelInside = width >= 90;

	return <div
		className={[
			"sg-bar",
			`sg-bar--${tone}`,
			drag ? "sg-bar--dragging sg-frost" : "",
			onCommit ? "sg-bar--editable" : "",
		].join(" ")}
		style={{
			left,
			width,
			transform: translate ? `translateX(${translate}px)` : undefined,
		}}
		onPointerEnter={() => setHover(true)}
		onPointerLeave={() => setHover(false)}
		onDoubleClick={() => onOpenSource?.(task)}
		{...barHandlers}
	>
		{elapsed !== null ?
			<div className={"sg-bar__elapsed"} style={{width: `${elapsed * 100}%`}}/>
			: null}
		{onCommit ? <>
			<div className={"sg-bar__handle sg-bar__handle--start"} {...startHandleProps}/>
			<div className={"sg-bar__handle sg-bar__handle--end"} {...endHandleProps}/>
		</> : null}
		{labelInside ?
			<span className={"sg-bar__label"}>{task.name}</span>
			: <span className={"sg-bar__label sg-bar__label--outside"}>{task.name}</span>}
		{hover && !drag ? <GanttTooltip task={task}/> : null}
	</div>;
});
TaskBar.displayName = "TaskBar";

export default TaskBar;
