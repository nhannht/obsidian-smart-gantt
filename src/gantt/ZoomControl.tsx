import {GanttZoom} from "./types";
import Pressable from "@/component/Pressable";

const LEVELS: { key: GanttZoom; label: string }[] = [
	{key: "day", label: "Day"},
	{key: "week", label: "Week"},
	{key: "month", label: "Month"},
	{key: "quarter", label: "Quarter"},
];

const ZoomControl = (props: {
	zoom: GanttZoom
	onChange: (z: GanttZoom) => void
}) => {
	const index = Math.max(LEVELS.findIndex(l => l.key === props.zoom), 0);
	return <div className={"sg-zoom"} role={"tablist"} aria-label={"Timeline scale"}>
		<div
			className={"sg-zoom__thumb"}
			style={{transform: `translateX(${index * 100}%)`}}
		/>
		{LEVELS.map(l =>
			<Pressable
				key={l.key}
				role={"tab"}
				aria-selected={props.zoom === l.key}
				className={[
					"sg-zoom__segment",
					props.zoom === l.key ? "sg-zoom__segment--active" : "",
				].join(" ")}
				onClick={() => props.onChange(l.key)}
			>
				{l.label}
			</Pressable>
		)}
	</div>;
};

export default ZoomControl;
