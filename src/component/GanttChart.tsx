import {TimelineExtractorResultNg} from "@/TimelineExtractor";
import {Gantt, Task} from "gantt-task-react";
import SmartGanttPlugin from "../../main";
import {SmartGanttSettings} from "@/SettingManager";

const GanttChart = (props:{
	tasks:Task[],
	results:TimelineExtractorResultNg[]
	thisPlugin:SmartGanttPlugin
	settings:SmartGanttSettings
})=>{

	let listCellWidthAttr = null
	if (!props.settings.leftBarChartDisplayQ){
		listCellWidthAttr = {
			listCellWidth: ""
		}
	} else {
		listCellWidthAttr = {}
	}

	return <Gantt tasks={props.tasks}
				  // listCellWidth=""
				  viewMode={props.settings.viewMode}
				  {...listCellWidthAttr}

				  onClick={props.thisPlugin.helper.jumpToPositionOfNode}
	/>


}

export default GanttChart
