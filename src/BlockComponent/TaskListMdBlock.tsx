import {useCallback, useEffect, useRef, useState} from "react";
import {MarkdownPostProcessorContext} from "obsidian";
import SmartGanttPlugin from "../../main";
import {SmartGanttSettings} from "@/SettingManager";
import MarkdownProcesser from "../MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResultNg} from "../TimelineExtractor";
import {Chrono} from "chrono-node";
import SettingViewComponent from "../component/SettingViewComponent";
import TaskList from "../component/TaskList";
import {Settings2} from "lucide-react";
import Pressable from "@/component/Pressable";

export const TaskListMdBlock = (props: {
	ctx: MarkdownPostProcessorContext,
	src: string,
	thisPlugin: SmartGanttPlugin,
	settings: SmartGanttSettings
}) => {
	const [internalSettings, setInternalSettings] =
		useState<SmartGanttSettings>(structuredClone(props.settings))
	const [isSettingQ, setIsSettingQ] = useState(false)
	const [timelineResults, setTimelineResults] = useState<TimelineExtractorResultNg[]>([])

	const reupdateData = useCallback(async () => {
		const allMarkdownFiles = props.thisPlugin.app.vault.getMarkdownFiles();
		const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, props.thisPlugin)
		await markdownProcesser.parseAllFilesNg(internalSettings)
		const timelineExtractor = new TimelineExtractor(new Chrono())
		setTimelineResults(await timelineExtractor.GetTimelineDataFromNodes(markdownProcesser.nodes))
	}, [internalSettings])

	useEffect(() => {
		reupdateData()
	}, [internalSettings]);

	// Live refresh on vault changes, debounced.
	const debounceTimer = useRef<number | null>(null)
	useEffect(() => {
		const app = props.thisPlugin.app
		const schedule = () => {
			if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
			debounceTimer.current = window.setTimeout(() => {
				debounceTimer.current = null
				reupdateData()
			}, 500)
		}
		const ref = app.metadataCache.on("changed", schedule)
		return () => {
			app.metadataCache.offref(ref)
			if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
		}
	}, [reupdateData])

	const modifyResultsStatus = useCallback((resultId: string, status: boolean) => {
		let resultsClone = [...timelineResults]
		let resultFind = resultsClone.find(r => r.id === resultId)
		if (resultFind) {
			//@ts-ignore
			resultFind.node.checked = status
			setTimelineResults(resultsClone)
		}
	}, [timelineResults])

	if (isSettingQ) {
		return <main>
			<SettingViewComponent
				isSettingsQ={isSettingQ}
				isSettingsQHandle={setIsSettingQ}
				inputS={internalSettings}
				saveSettings={setInternalSettings}
				updateSettingInCodeBlockHandle={(s) => {
					props.thisPlugin.helper.updateBlockSettingWithInternalSetting(s, props.ctx)
				}}
				thisPlugin={props.thisPlugin}
			/>
		</main>
	}

	return <main>
		<div className={"mb-2 flex justify-end"}>
			<Pressable
				className={"sg-toolbar-icon"}
				aria-label={"Settings"}
				onClick={() => setIsSettingQ(true)}
			>
				<Settings2 className={"h-4 w-4"}/>
			</Pressable>
		</div>
		{timelineResults.length === 0
			? <div className={"py-6 text-center text-sm text-muted-foreground"}>
				No tasks match this block&apos;s filter.
			</div>
			: <TaskList
				results={timelineResults}
				thisPlugin={props.thisPlugin}
				changeResultStatusFn={modifyResultsStatus}
			/>}
	</main>
};
