import {memo} from "react";
import {GanttGeometry} from "./useGanttGeometry";

const TimeAxis = memo((props: {
	geometry: GanttGeometry
	fromX: number
	toX: number
}) => {
	const {geometry, fromX, toX} = props;
	const groups = geometry.groupsIn(fromX, toX);
	const cells = geometry.cellsIn(fromX, toX);

	return <div className={"sg-axis"}>
		<div className={"sg-axis__groups"}>
			{groups.map(g =>
				<div key={g.x} className={"sg-axis__group"} style={{left: g.x, width: g.width}}>
					<span className={"sg-axis__group-label"}>{g.label}</span>
				</div>
			)}
		</div>
		<div className={"sg-axis__cells"}>
			{cells.map(c =>
				<div
					key={c.x}
					className={[
						"sg-axis__cell",
						c.isWeekend ? "sg-axis__cell--weekend" : "",
						c.isToday ? "sg-axis__cell--today" : "",
					].join(" ")}
					style={{left: c.x, width: c.width}}
				>
					{c.label}
				</div>
			)}
		</div>
	</div>;
});
TimeAxis.displayName = "TimeAxis";

export default TimeAxis;
