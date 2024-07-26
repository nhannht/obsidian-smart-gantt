import SmartGanttPlugin from "../../main";
import {useLocalStorage} from "react-use";
import {SmartGanttSettings} from "@/SettingManager";
import {useCallback, useEffect, useState} from "react";
import MarkdownProcesser from "../MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResultNg} from "../TimelineExtractor";
import {Chrono, ParsedComponents} from "chrono-node";
import {Task, ViewMode} from "gantt-task-react";
import {ListItem} from "mdast";
import SmartGanttChart from "@/component/SmartGanttChart";
import SettingViewComponent from "@/component/SettingViewComponent";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/component/ResizablePanel";
import TaskList from "@/component/TaskList";
import {NavBar} from "@/BlockComponent/NavBar";

const SidebarReactComponentNg = (props: {
	thisPlugin: SmartGanttPlugin
}) => {


	const [settings,
		saveSettings
	] =
		useLocalStorage<SmartGanttSettings>
		(`smart-gantt-sidebar-settings-${props.thisPlugin.app.vault.getName()}`,
			{
				doneShowQ: true,
				todoShowQ: true,
				pathListFilter: ["CurrentFile"],
				leftBarChartDisplayQ: false,
				viewMode: ViewMode.Day
			})
	const [timelineResults, setTimelineResults] = useState<TimelineExtractorResultNg[]>([])

	const [isSettingQ, setIsSettingQ] = useState(false)
	const [tasks, setTasks] = useState<Task[]>([])
	const reupdateData = useCallback(async () => {
		const allMarkdownFiles = props.thisPlugin.app.vault.getMarkdownFiles();
		const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, props.thisPlugin)
		if (!settings) {
			console.log("settings is undefined")
			saveSettings({
				doneShowQ: true,
				todoShowQ: true,
				pathListFilter: ["CurrentFile"],
				leftBarChartDisplayQ: false,
				viewMode: ViewMode.Day
			})
		}
		//@ts-ignore
		await markdownProcesser.parseAllFilesNg(settings)
		const allNodes = markdownProcesser.nodes
		// console.log(allNodes)
		const timelineExtractor = new TimelineExtractor(new Chrono())
		const timelineExtractorResults = await timelineExtractor.GetTimelineDataFromNodes(allNodes)
		// console.log(timelineExtractorResults)
		setTimelineResults(timelineExtractorResults)
		// console.log(tasks)
	}, [settings])


	const createDateFromKnownValues = useCallback((p: ParsedComponents) => {
			//@ts-ignore
			const knownValues = p.knownValues
			return new Date(knownValues.year, knownValues.month, knownValues.day)
		}, []
	)

	useEffect(() => {
		reupdateData().then(_r => null)
	}, [settings])

	useEffect(() => {
		let tempTasks: Task[] = []
		timelineResults.forEach((timelineResult, _tIndex) => {
			if (timelineResult.parsedResult) {
				// console.log(timelineResult.parsedResult.start)
				const startComponent = timelineResult.parsedResult.start
				const endComponent = timelineResult.parsedResult.end
				let task: Task = {
					start: createDateFromKnownValues(startComponent),
					end: endComponent ? createDateFromKnownValues(endComponent) : createDateFromKnownValues(startComponent),
					//@ts-ignore
					name: timelineResult.node.children[0].children[0].value,
					id: `${timelineResult.id}`,
					type: 'task',
					progress: 50,
					isDisabled: true,
					styles: (timelineResult.node as ListItem).checked ? {
						progressColor: '#df1fc0',
						progressSelectedColor: '#20f323'
					} : {
						progressColor: '#ffffff',
						progressSelectedColor: '#000000'
					},
				}
				// console.log(task)
				tempTasks.push(task)
			}
		})
		setTasks(tempTasks)
	}, [timelineResults])
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


	let mainComponent = <></>


	if (isSettingQ) {
		mainComponent = <main>
			<SettingViewComponent
				isSettingsQ={isSettingQ}
				isSettingsQHandle={(is) => {
					setIsSettingQ(is)
				}}
				inputS={settings}
				saveSettings={(s) => {
					saveSettings(s)
				}}
				thisPlugin={props.thisPlugin}
			/>
		</main>
	} else {
		if (tasks.length > 0) {
			mainComponent = <main>
				<div className={"w-full flex justify-center p-2"}>
					<NavBar
						setIsSettingQFn={setIsSettingQ}
						thisPlugin={props.thisPlugin}
						reloadViewButtonQ={true}
					/>
				</div>
				<ResizablePanelGroup
					direction={"vertical"}
					className={"h-screen"}
				>
					<ResizablePanel defaultSize={50} minSize={30}>
						<SmartGanttChart
							tasks={tasks}
							thisPlugin={props.thisPlugin}
							settings={settings}
							results={timelineResults}
						/>
					</ResizablePanel>
					<ResizableHandle withHandle={true}/>
					<ResizablePanel defaultSize={50}>
						<TaskList results={timelineResults}
								  thisPlugin={props.thisPlugin}
								  changeResultStatusFn={modifyResultsStatus}/>
					</ResizablePanel>
				</ResizablePanelGroup>
				{/*<TaskList results={timelineResults}*/}
				{/*		  thisPlugin={props.thisPlugin}*/}
				{/*		  changeResultStatusFn={modifyResultsStatus}*/}
				{/*/>*/}

			</main>
		} else {
			mainComponent = <main>
				<div
				className={"flex justify-center w-full p-2"}
				><NavBar setIsSettingQFn={setIsSettingQ}
						 thisPlugin={props.thisPlugin}
						 reloadViewButtonQ={true}/></div>
			</main>
		}
	}

	return <>
		{mainComponent}
	</>


}

export default SidebarReactComponentNg
