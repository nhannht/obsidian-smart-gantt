import {useEffect, useState} from "react";
import {MarkdownPostProcessorContext} from "obsidian";
import SmartGanttPlugin from "../main";
import {SmartGanttSettings} from "./SettingManager";
import MarkdownProcesser from "./MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResultNg} from "./TimelineExtractor";
import {Chrono, ParsedComponents} from "chrono-node";
// import {useMeasure} from "react-use";
import {Gantt, Task} from 'gantt-task-react';
import SettingViewComponent from "./SettingViewComponent";


export const SmartGanttBlockReactComponentNg = (props: {
	ctx: MarkdownPostProcessorContext,
	src: string,
	thisPlugin: SmartGanttPlugin,
	settings: SmartGanttSettings
}) => {
	const [internalSettings, setInternalSettings] =
		useState<SmartGanttSettings>(structuredClone(props.settings))
	const [isSettingQ, setIsSettingQ] = useState(false)
	// const [resultWithChronoCount, setResultWithChronoCount] = useState(0)
	const [timelineResults, setTimelineResults] = useState<TimelineExtractorResultNg[]>([])
	const [tasks, setTasks] = useState<Task[]>([])


	const updateBlockSettingWithInternalSetting = (settingObject: SmartGanttSettings,
												   context: MarkdownPostProcessorContext) => {

		const sourcePath = context.sourcePath
		//@ts-ignore
		const elInfo = context.getSectionInfo(context.el)
		// console.log(elInfo)
		if (elInfo) {
			// console.log(elInfo.text)
			let linesFromFile = elInfo.text.split(/(.*?\n)/g)
			linesFromFile.forEach((e, i) => {
				if (e === "") linesFromFile.splice(i, 1)
			})
			// console.log(linesFromFile)
			linesFromFile.splice(elInfo.lineStart + 1,
				elInfo.lineEnd - elInfo.lineStart - 1,
				JSON.stringify(settingObject, null, "\t"), "\n")
			// console.log(linesFromFile)
			const newSettingsString = linesFromFile.join("")
			const file = props.thisPlugin.app.vault.getFileByPath(sourcePath)
			if (file) {
				props.thisPlugin.app.vault.modify(file, newSettingsString)
			}
		}

	}

	const reupdateData = async () => {
		const allMarkdownFiles = props.thisPlugin.app.vault.getMarkdownFiles();
		const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, props.thisPlugin)
		await markdownProcesser.parseAllFilesNg(internalSettings)
		const allNodes = markdownProcesser.nodes
		// console.log(allNodes)
		const timelineExtractor = new TimelineExtractor(new Chrono())
		const timelineExtractorResults = await timelineExtractor.GetTimelineDataFromNodes(allNodes)
		// console.log(timelineExtractorResults)
		setTimelineResults(timelineExtractorResults)
		// console.log(tasks)
	}
	const createDateFromKnownValues = (p: ParsedComponents) => {
		//@ts-ignore
		const knownValues = p.knownValues
		const date = new Date(knownValues.year, knownValues.month, knownValues.day)
		// console.log(date)
		return date
	}

	useEffect(() => {
		reupdateData().then(_r => null)
	}, [internalSettings]);

	useEffect(() => {
		let tempTasks: Task[] = []
		timelineResults.forEach((timelineResult, tIndex) => {
			if (timelineResult.parsedResult) {
				// console.log(timelineResult.parsedResult.start)
				const startComponent = timelineResult.parsedResult.start
				const endComponent = timelineResult.parsedResult.end
				let task: Task = {
					start: createDateFromKnownValues(startComponent),
					end: endComponent ? createDateFromKnownValues(endComponent) : createDateFromKnownValues(startComponent),
					//@ts-ignore
					name: timelineResult.node.children[0].children[0].value,
					id: `${tIndex}`,
					type: 'task',
					progress: 50,
					isDisabled: true,
					styles: {progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d'},
				}
				// console.log(task)
				// console.log(task)
				tempTasks.push(task)
			}
		})
		setTasks(tempTasks)
	}, [timelineResults])

	let mainComponent = <></>



	if (isSettingQ) {
		mainComponent = <main>
			<SettingViewComponent
			isSettingsQ={isSettingQ}
			isSettingsQHandle={ (is)=>{
				setIsSettingQ(is)
			}}
			inputS={internalSettings}
			saveSettings={(s)=>{
				setInternalSettings(s)

			}}
			updateBlockSettingHandle={(s)=>{
				updateBlockSettingWithInternalSetting(s,props.ctx)
			}}
			/>
		</main>
	} else {
		if (tasks.length > 0) {
			mainComponent = <main
			onContextMenu={()=> setIsSettingQ(true)}>
				{/*<button onClick={() => reupdateData()}>Update data</button>*/}
				<Gantt
					ganttHeight={400}
					tasks={tasks}></Gantt>
			</main>

		} else {
			mainComponent = <main
				onContextMenu={()=> setIsSettingQ(true)}>
				<button onClick={() => reupdateData()}>Update data</button>
			</main>
		}
	}

	return <>
		{mainComponent}
	</>
};
