import {useCallback, useEffect, useMemo, useState} from "react";
import {App, MarkdownPostProcessorContext, TAbstractFile} from "obsidian";
import SmartGanttPlugin from "../../main";
import {SmartGanttSettings} from "@/SettingManager";
import MarkdownProcesser from "../MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResultNg} from "../TimelineExtractor";
import {Chrono, ParsedComponents} from "chrono-node";
import {Task} from 'gantt-task-react';
import SettingViewComponent from "../component/SettingViewComponent";
import TaskList from "../component/TaskList";

import {NavBar} from "@/BlockComponent/NavBar";
import {useApp} from "@/lib/AppContext";

export const TaskListMdBlock = (props: {
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
	const app = useApp() as App


	const consoleMyName = useCallback( (file:TAbstractFile)=>{
		console.log(file)
	},[])

	useEffect(() => {
		return ()=>{
			app.vault.off('modify',consoleMyName)
			app.vault.off('modify',consoleMyName)
		}
	});


	useMemo(()=>{
		props.thisPlugin.registerEvent(app.vault.on('modify',consoleMyName))
		// console.log("Memo memo")
	},[])

	const reupdateData = useCallback(async () => {
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
	}, [internalSettings])

	const createDateFromKnownValues = useCallback((p: ParsedComponents) => {
			//@ts-ignore
			const knownValues = p.knownValues
			return new Date(knownValues.year, knownValues.month, knownValues.day)
		}, []
	)

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


	const modifyResultsStatus = useCallback((resultId: string, status: boolean) => {
		let resultsClone = [...timelineResults]
		// console.log(resultsClone)
		// console.log(timelineResults)
		let resultFind = resultsClone.find(r => r.id === resultId)
		// console.log(resultId)
		// console.log(resultFind)
		if (resultFind) {
			//@ts-ignore
			resultFind.node.checked = status
			setTimelineResults(resultsClone)
		}

	}, [timelineResults])



	if (isSettingQ) {
		mainComponent = <main>
			<SettingViewComponent
				isSettingsQ={isSettingQ}
				isSettingsQHandle={(is) => {
					setIsSettingQ(is)
				}}
				inputS={internalSettings}
				saveSettings={(s) => {
					setInternalSettings(s)

				}}
				updateSettingInCodeBlockHandle={(s) => {
					props.thisPlugin.helper.updateBlockSettingWithInternalSetting(s, props.ctx)
				}}
				thisPlugin={props.thisPlugin}
			/>
		</main>
	} else {
		if (tasks.length > 0) {
			mainComponent = <main
			>

				{/*<GanttChart tasks={tasks}*/}
				{/*			thisPlugin={props.thisPlugin}*/}
				{/*			settings={internalSettings}*/}
				{/*			results={timelineResults}*/}
				{/*/>*/}
				<TaskList results={timelineResults}
						  thisPlugin={props.thisPlugin}
						  changeResultStatusFn={modifyResultsStatus}
				/>
				<div className={"flex justify-center"}><NavBar setIsSettingQFn={setIsSettingQ}/></div>
			</main>
		} else {
			mainComponent = <main
				onContextMenu={() => setIsSettingQ(true)}>
				<button onClick={() => reupdateData()}>Update data</button>
			</main>
		}
	}

	return <>
		{mainComponent}
	</>
};
