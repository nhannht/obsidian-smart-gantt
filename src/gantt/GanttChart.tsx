import {useCallback, useEffect, useRef, useState} from "react";
import {GanttChangePayload, GanttTask, GanttZoom} from "./types";
import {useGanttGeometry} from "./useGanttGeometry";
import TimeAxis from "./TimeAxis";
import TaskBar, {barTone} from "./TaskBar";

const AXIS_HEIGHT = 52;
const ROW_HEIGHT = 36;
const OVERSCAN_PX = 240;

export interface GanttChartProps {
	tasks: GanttTask[]
	zoom: GanttZoom
	/** Omit to make the chart read-only. */
	onTaskChange?: (task: GanttTask, change: GanttChangePayload) => void | Promise<void>
	onOpenSource?: (task: GanttTask) => void | Promise<void>
	/** Sticky left column with task names. */
	showNames?: boolean
	/** Fixed height; omit to fill the parent. */
	height?: number | string
}

const GanttChart = (props: GanttChartProps) => {
	const {tasks, zoom, onTaskChange, onOpenSource, showNames, height} = props;
	const geometry = useGanttGeometry(tasks, zoom);
	const scrollRef = useRef<HTMLDivElement>(null);
	const namesRef = useRef<HTMLDivElement>(null);
	const [window_, setWindow] = useState<{ fromX: number; toX: number }>({fromX: 0, toX: 1200});
	const rafPending = useRef(false);

	const updateWindow = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setWindow(prev => {
			const fromX = Math.max(0, el.scrollLeft - OVERSCAN_PX);
			const toX = el.scrollLeft + el.clientWidth + OVERSCAN_PX;
			return (Math.abs(prev.fromX - fromX) < 40 && Math.abs(prev.toX - toX) < 40)
				? prev : {fromX, toX};
		});
	}, []);

	const onScroll = useCallback(() => {
		const el = scrollRef.current;
		// Direct transform sync: the name pane follows vertical scroll with
		// no React re-render on the scroll path.
		if (el && namesRef.current) {
			namesRef.current.style.transform = `translateY(${-el.scrollTop}px)`;
		}
		if (rafPending.current) return;
		rafPending.current = true;
		window.requestAnimationFrame(() => {
			rafPending.current = false;
			updateWindow();
		});
	}, [updateWindow]);

	// Center today on first paint and when zoom changes.
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		if (geometry.todayX !== null) {
			el.scrollLeft = Math.max(0, geometry.todayX - el.clientWidth / 3);
		}
		updateWindow();
	}, [zoom]); // eslint-disable-line react-hooks/exhaustive-deps -- recenter on zoom change only, not on every geometry rebuild

	useEffect(() => {
		updateWindow();
		const el = scrollRef.current;
		if (!el || typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(updateWindow);
		ro.observe(el);
		return () => ro.disconnect();
	}, [updateWindow]);

	const today = new Date();
	const cells = geometry.cellsIn(window_.fromX, window_.toX);
	const bodyHeight = tasks.length * ROW_HEIGHT;

	return <div className={"sg-chart"} style={{height}}>
		{showNames ?
			<div className={"sg-names-pane"}>
				<div className={"sg-names-pane__header"}>Tasks</div>
				<div ref={namesRef}>
					{tasks.map(t =>
						<div
							key={t.id}
							className={[
								"sg-names__item",
								`sg-names__item--${barTone(t, today)}`,
							].join(" ")}
							style={{height: ROW_HEIGHT}}
							onClick={() => void onOpenSource?.(t)}
							title={t.name}
						>
							{t.name}
						</div>
					)}
				</div>
			</div>
			: null}

		<div className={"sg-chart__scroll"} ref={scrollRef} onScroll={onScroll}>
			<div
				className={"sg-canvas"}
				style={{width: geometry.totalWidth, height: AXIS_HEIGHT + bodyHeight}}
			>
				<TimeAxis geometry={geometry} fromX={window_.fromX} toX={window_.toX}/>

				<div className={"sg-grid"} style={{top: AXIS_HEIGHT, height: bodyHeight}}>
					{cells.map(c => <div key={c.x}>
						{c.isWeekend ?
							<div className={"sg-grid__weekend"} style={{left: c.x, width: c.width}}/>
							: null}
						<div className={"sg-grid__line"} style={{left: c.x}}/>
					</div>)}
					{geometry.todayX !== null ?
						<div className={"sg-grid__today"} style={{left: geometry.todayX}}/>
						: null}
				</div>

				<div className={"sg-rows"} style={{top: AXIS_HEIGHT}}>
					{tasks.map(t =>
						<div key={t.id} className={"sg-row"} style={{height: ROW_HEIGHT}}>
							<TaskBar
								task={t}
								geometry={geometry}
								onCommit={onTaskChange}
								onOpenSource={onOpenSource}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	</div>;
};

export default GanttChart;
