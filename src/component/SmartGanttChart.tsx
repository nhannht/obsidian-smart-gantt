import {TimelineExtractorResultNg} from "@/TimelineExtractor";
import {Gantt, Task} from "gantt-task-react";
import SmartGanttPlugin from "../../main";
import {SmartGanttSettings} from "@/SettingManager";
// const CustomToolTip = (props:{
// 	task:Task,
// 	fontSize:string,
// 	fontFamily:string
// })=> {
// 	return <>
// 		<div>
// 			{props.task.name}
// 		</div>
// 	</>
// }

const SmartGanttChart = (props: {
	tasks: Task[],
	results: TimelineExtractorResultNg[]
	thisPlugin: SmartGanttPlugin
	settings: SmartGanttSettings | undefined
}) => {

	let listCellWidthAttr = null
	if (!props.settings?.leftBarChartDisplayQ) {
		listCellWidthAttr = {
			listCellWidth: ""
		}
	} else {
		listCellWidthAttr = {}
	}

	return <Gantt
		onDoubleClick={async (t: Task) => {
			await props.thisPlugin.helper.jumpToPositionOfNode(t, props.results)
		}}
		tasks={props.tasks}
		// listCellWidth=""
		viewMode={props.settings?.viewMode}
		{...listCellWidthAttr}
		ganttHeight={300}
		// TooltipContent={CustomToolTip}
	/>


}

export default SmartGanttChart
