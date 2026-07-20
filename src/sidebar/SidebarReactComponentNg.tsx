import SmartGanttPlugin from "../../main";
import {SmartGanttSettings} from "@/SettingManager";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import MarkdownProcesser from "../MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResultNg} from "../TimelineExtractor";
import {Chrono} from "chrono-node";
import SettingViewComponent from "@/component/SettingViewComponent";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/component/ResizablePanel";
import TaskList from "@/component/TaskList";
import GlassSurface from "@/component/GlassSurface";
import Pressable from "@/component/Pressable";
import {GanttChart, ZoomControl, GanttTask, GanttZoom} from "@/gantt";
import {resultsToGanttTasks, zoomFromSetting} from "@/gantt/adapters";
import {CalendarRange, RotateCw, Settings2} from "lucide-react";

const DEFAULT_SIDEBAR_SETTINGS: SmartGanttSettings = {
	doneShowQ: true,
	todoShowQ: true,
	pathListFilter: ["CurrentFile"],
	leftBarChartDisplayQ: false,
	viewMode: "day",
};

/* Sidebar view preferences persist through Obsidian's vault-scoped
 * localStorage wrappers, as the store guidelines require. */
const SIDEBAR_SETTINGS_KEY = "smart-gantt-sidebar-settings";

const loadSidebarSettings = (plugin: SmartGanttPlugin): SmartGanttSettings => {
	const raw = plugin.app.loadLocalStorage(SIDEBAR_SETTINGS_KEY) as Partial<SmartGanttSettings> | null;
	return {...DEFAULT_SIDEBAR_SETTINGS, ...(raw ?? {})};
};

const EmptyState = () => (
	<div className={"flex h-full flex-col items-center justify-center gap-3 px-6 text-center"}>
		<CalendarRange className={"h-10 w-10 text-muted-foreground opacity-60"} aria-hidden={true}/>
		<div className={"text-sm font-semibold"}>No dated tasks found</div>
		<div className={"max-w-[220px] text-xs text-muted-foreground"}>
			Give any task a date in plain language, like &quot;due next monday&quot;,
			and it appears here as a bar.
		</div>
	</div>
);

const SidebarReactComponentNg = (props: {
	thisPlugin: SmartGanttPlugin
}) => {
	const [settings, setSettings] = useState<SmartGanttSettings>(() => loadSidebarSettings(props.thisPlugin));
	const saveSettings = useCallback((s: SmartGanttSettings) => {
		props.thisPlugin.app.saveLocalStorage(SIDEBAR_SETTINGS_KEY, s);
		setSettings(s);
	}, [props.thisPlugin]);
	const [timelineResults, setTimelineResults] = useState<TimelineExtractorResultNg[]>([])
	const [isSettingQ, setIsSettingQ] = useState(false)
	const [refreshing, setRefreshing] = useState(false)

	const zoom = zoomFromSetting(settings.viewMode);
	const setZoom = (z: GanttZoom) => {
		saveSettings({...settings, viewMode: z});
	};

	const reupdateData = useCallback(async () => {
		const allMarkdownFiles = props.thisPlugin.app.vault.getMarkdownFiles();
		const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, props.thisPlugin)
		await markdownProcesser.parseAllFilesNg(settings)
		const allNodes = markdownProcesser.nodes
		const timelineExtractor = new TimelineExtractor(new Chrono())
		const timelineExtractorResults = await timelineExtractor.GetTimelineDataFromNodes(allNodes)
		setTimelineResults(timelineExtractorResults)
	}, [settings])

	useEffect(() => {
		void reupdateData()
	}, [settings, reupdateData])

	// Live refresh: any metadata change in the vault re-extracts, debounced.
	const debounceTimer = useRef<number | null>(null)
	useEffect(() => {
		const app = props.thisPlugin.app
		const schedule = () => {
			if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
			debounceTimer.current = window.setTimeout(() => {
				debounceTimer.current = null
				void reupdateData()
			}, 500)
		}
		const refs = [
			app.metadataCache.on("changed", schedule),
			app.vault.on("delete", schedule),
			app.vault.on("rename", schedule),
		]
		return () => {
			refs.forEach(r => app.metadataCache.offref(r))
			if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
		}
	}, [reupdateData])

	const tasks: GanttTask[] = useMemo(
		() => resultsToGanttTasks(timelineResults),
		[timelineResults],
	)

	const modifyResultsStatus = useCallback((resultId: string, status: boolean) => {
		let resultsClone = [...timelineResults]
		let resultFind = resultsClone.find(r => r.id === resultId)
		if (resultFind) {
			//@ts-ignore
			resultFind.node.checked = status
			setTimelineResults(resultsClone)
		}
	}, [timelineResults])

	const onTaskChange = useCallback(async (task: GanttTask, change: { start: Date; end: Date }) => {
		await props.thisPlugin.helper.updateResultDates(
			task.meta as TimelineExtractorResultNg, change.start, change.end)
		// The vault event listener re-extracts and confirms the new dates.
	}, [props.thisPlugin])

	const onOpenSource = useCallback((task: GanttTask) => {
		void props.thisPlugin.helper.jumpToPositionOfResult(task.meta as TimelineExtractorResultNg)
	}, [props.thisPlugin])

	if (isSettingQ) {
		return <main className={"h-full"}>
			<SettingViewComponent
				isSettingsQ={isSettingQ}
				isSettingsQHandle={setIsSettingQ}
				inputS={settings}
				saveSettings={saveSettings}
				thisPlugin={props.thisPlugin}
			/>
		</main>
	}

	return <main className={"relative flex h-full flex-col"}>
		<div className={"sg-float pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center"}>
			<GlassSurface
				width={"auto"}
				height={44}
				borderRadius={14}
				className={"pointer-events-auto"}
			>
				<div className={"flex items-center gap-2 px-3"}>
					<ZoomControl zoom={zoom} onChange={setZoom}/>
					<Pressable
						className={"sg-toolbar-icon"}
						aria-label={"Refresh"}
						onClick={() => {
							setRefreshing(true)
							void reupdateData().finally(() => setRefreshing(false))
						}}
					>
						<RotateCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}/>
					</Pressable>
					<Pressable
						className={"sg-toolbar-icon"}
						aria-label={"Settings"}
						onClick={() => setIsSettingQ(true)}
					>
						<Settings2 className={"h-4 w-4"}/>
					</Pressable>
				</div>
			</GlassSurface>
		</div>

		{tasks.length === 0
			? <EmptyState/>
			: <ResizablePanelGroup direction={"vertical"} className={"h-full pt-14"}>
				<ResizablePanel defaultSize={55} minSize={25}>
					<GanttChart
						tasks={tasks}
						zoom={zoom}
						onTaskChange={onTaskChange}
						onOpenSource={onOpenSource}
						showNames={settings?.leftBarChartDisplayQ}
						height={"100%"}
					/>
				</ResizablePanel>
				<ResizableHandle withHandle={true}/>
				<ResizablePanel defaultSize={45}>
					<TaskList
						results={timelineResults}
						thisPlugin={props.thisPlugin}
						changeResultStatusFn={modifyResultsStatus}
					/>
				</ResizablePanel>
			</ResizablePanelGroup>}
	</main>
}

export default SidebarReactComponentNg
