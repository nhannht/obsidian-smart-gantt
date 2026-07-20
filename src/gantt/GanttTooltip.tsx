import {GanttTask} from "./types";
import {daysBetween} from "./useGanttGeometry";

const RANGE_FMT = new Intl.DateTimeFormat(undefined, {month: "short", day: "numeric"});

const GanttTooltip = (props: { task: GanttTask }) => {
	const {task} = props;
	const days = daysBetween(task.start, task.end) + 1;
	return <div className={"sg-tooltip sg-frost"} role={"tooltip"}>
		<div className={"sg-tooltip__name"}>{task.name}</div>
		<div className={"sg-tooltip__dates"}>
			{RANGE_FMT.format(task.start)}
			{days > 1 ? <> &rarr; {RANGE_FMT.format(task.end)}</> : null}
			<span className={"sg-tooltip__span"}>{days} {days === 1 ? "day" : "days"}</span>
		</div>
		{task.sourcePath ?
			<div className={"sg-tooltip__source"}>{task.sourcePath}</div>
			: null}
	</div>;
};

export default GanttTooltip;
