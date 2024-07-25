import {TimelineExtractorResultNg} from "@/TimelineExtractor";
import {Gantt, Task} from "gantt-task-react";
import SmartGanttPlugin from "../../main";
import {SmartGanttSettings} from "@/SettingManager";

const SmartGanttChart = (props:{
	tasks:Task[],
	results:TimelineExtractorResultNg[]
	thisPlugin:SmartGanttPlugin
	settings:SmartGanttSettings|undefined
})=>{

	let listCellWidthAttr = null
	if (!props.settings?.leftBarChartDisplayQ){
		listCellWidthAttr = {
			listCellWidth: ""
		}
	} else {
		listCellWidthAttr = {}
	}


	return <Gantt
		onDoubleClick={(t:Task) => props.thisPlugin.helper.jumpToPositionOfNode(t,props.results)}
		tasks={props.tasks}
				  // listCellWidth=""
				  viewMode={props.settings?.viewMode}
				  {...listCellWidthAttr}

				  onClick={props.thisPlugin.helper.jumpToPositionOfNode}
		ganttHeight={300}
	/>


}

export default SmartGanttChart
