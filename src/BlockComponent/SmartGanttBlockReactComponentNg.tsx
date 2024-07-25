import {useCallback, useEffect, useState} from "react";
import {MarkdownPostProcessorContext} from "obsidian";
import SmartGanttPlugin from "../../main";
import {SmartGanttSettings} from "@/SettingManager";
import MarkdownProcesser from "../MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResultNg} from "../TimelineExtractor";
import {Chrono, ParsedComponents} from "chrono-node";
import {Task} from 'gantt-task-react';
import SettingViewComponent from "../component/SettingViewComponent";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle
} from "@/component/NavMenu";
import SmartGanttChart from "../component/SmartGanttChart";
import {ListItem} from "mdast";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/component/Tooltip";

export const NavBar = (props: {
	setIsSettingQFn: (status: boolean) => void
	thisPlugin?: SmartGanttPlugin,
	reloadViewButtonQ?: boolean,
}) => {
	let reloadButton: JSX.Element
	if ("reloadViewButtonQ" in props && "thisPlugin" in props && props.reloadViewButtonQ === true) {
		reloadButton = <NavigationMenuItem>
			<TooltipProvider>
				<Tooltip >
					<TooltipTrigger asChild>
						<NavigationMenuLink
							className={navigationMenuTriggerStyle()}
							onClick={() => {
								props.thisPlugin?.helper.reloadView()
							}}>
							Reload
						</NavigationMenuLink>
					</TooltipTrigger>
					<TooltipContent side={"bottom"}>
						<div >
							<br/>
							The change from inside this plugin (sidebar/block) will affect outside.<br/>
							But any change from the outside (eg. you edit the file) will not auto trigger the update.<br/>
							So please click this button to manual update
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

		</NavigationMenuItem>
	} else {
		reloadButton = <></>
	}

	return <NavigationMenu>
		<NavigationMenuList>
			<NavigationMenuItem>
				<NavigationMenuLink
					onClick={() => props.setIsSettingQFn(true)}
					className={navigationMenuTriggerStyle()}>Settings</NavigationMenuLink>
			</NavigationMenuItem>
			{reloadButton}

		</NavigationMenuList>
	</NavigationMenu>
}

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
				// console.log(task)
				tempTasks.push(task)
			}
		})
		setTasks(tempTasks)
	}, [timelineResults])

	let mainComponent: JSX.Element


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
			mainComponent = <main>
				<div className={"w-full flex justify-center"}>
					<NavBar
						setIsSettingQFn={setIsSettingQ}/>
				</div>
				<SmartGanttChart
					tasks={tasks}
					thisPlugin={props.thisPlugin}
					settings={internalSettings}
					results={timelineResults}
				/>
				{/*<TaskList results={timelineResults}*/}
				{/*		  thisPlugin={props.thisPlugin}*/}
				{/*		  changeResultStatusFn={modifyResultsStatus}*/}
				{/*/>*/}
			</main>
		} else {
			mainComponent = <main>
				<div className={"w-full flex justify-center"}>
					<NavBar
						setIsSettingQFn={setIsSettingQ}/>
				</div>
			</main>
		}
	}

	return <>
		{mainComponent}
	</>
};
