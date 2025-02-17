import {FileView, TFile, ViewStateResult, WorkspaceLeaf} from "obsidian";
import SmartGanttPlugin from "../main";
import HelperNg from "@/HelperNg";
import {Node} from "unist"
import {v4} from "uuid";
import moment from "moment";
import {Gantt, Task} from "gantt-task-react";
import {createRoot, Root} from "react-dom/client";
import {createContext, StrictMode, useContext, useState} from "react";


export const DATE_FORMAT = "YYYY-MM-DD"

export interface SmartGanttTask extends Task {
	id: string,
	name: string,
	start: Date,
	end: Date,
	created: Date,
	completion?: Date,
	dependencies: string[],
	progress: number,
	duration?: string,
	important?: boolean,
	lineIndex: number

}

export interface GanttOptions {
	infinite_padding: boolean,
	view_mode_select: boolean,
	container_height: number

}

export interface SmartGanttItemViewState extends Record<string, unknown> {
	projectId: string,
	projectName: string,
	taskMarkDownItems: Node[]

	tasks: any[],
	file: TFile | null
}


const useCustomContext = () => {
	const context = useContext(Context)
	if (!context) {
		throw new Error("useCustomContext must be used within a Provider")
	}
	return useContext(Context)
}

export function MainComponent() {
	const {view} = useCustomContext() as { view: SmartGanttItemView }
	const [tasks, setTasks] = useState(view.tasks)

	const updateTaskInComponentAndView = (tasks: SmartGanttTask[]) => {
		setTasks(tasks)
		view.tasks = tasks
	}

	const onDateChange = (task: Task) => {
		const newTasks: SmartGanttTask[] = tasks.map(t => {
			if (t.id === task.id) {
				return {
					...t,
					start: task.start,
					end: task.end
				}
			}
			return t
		})
		updateTaskInComponentAndView(newTasks)
	}

	const onProgressChange = (task: Task, children: Task[]) => {
		const newTasks: SmartGanttTask[] = tasks.map(t => {
			if (t.id === task.id) {
				return {
					...t,
					progress: task.progress
				}
			}
			return t
		})
		updateTaskInComponentAndView(newTasks)
	}


	return <div>
		{/*<button onClick={() => {*/}
		{/*	updateTaskInComponentAndView([...tasks, {*/}
		{/*		id: v4(),*/}
		{/*		name: "Absolute hillarious",*/}
		{/*		progress: 0,*/}
		{/*		start: new Date(),*/}
		{/*		end: new Date(),*/}
		{/*		created: new Date(),*/}
		{/*		dependencies: [],*/}
		{/*		type: "task",*/}
		{/*		lineIndex: 0*/}
		{/*	}])*/}

		{/*	console.log(view.tasks.length)*/}


		{/*}*/}

		{/*}>test add more tasks*/}
		{/*</button>*/}
		<Gantt tasks={tasks}
			   onDateChange={onDateChange}
			   onProgressChange={onProgressChange}
		/>
	</div>
}

const Context = createContext<null | {
	view: SmartGanttItemView
}>(null)
export const SMART_GANTT_ITEM_VIEW_TYPE = "smart-gantt-item-view";

export default class SmartGanttItemView extends FileView implements SmartGanttItemViewState {
	root: Root | null = null;

	taskMarkDownItems: Node[] = []

	getViewType(): string {
		// console.log("Get view type called")
		return SMART_GANTT_ITEM_VIEW_TYPE;
	}

	constructor(leaf: WorkspaceLeaf, public plugin: SmartGanttPlugin) {
		console.log("Contructor called")
		super(leaf);
	}

	[x: string]: unknown;


	override getState(): SmartGanttItemViewState {
		console.log("Get state called")
		return {
			tasks: this.tasks,
			projectId: this.projectId,
			projectName: this.projectName,
			file: this.file?.path as unknown as TFile ?? "", // yeah, it is trick to silent ts checker
			taskMarkDownItems: this.taskMarkDownItems

		}
	}


	onunload() {
		// this.saveBackToFile(this.tasks)
		console.log("on unload triggered")
		if (this.root) {
			this.root.unmount()
		}
		super.onunload();
	}


	protected onClose(): Promise<void> {
		// this.saveBackToFile(this.tasks)
		console.log("on close triggered")
		if (this.root) {
			this.root.unmount()
		}
		return super.onClose();
	}


	onUnloadFile(file: TFile): Promise<void> {
		this.saveBackToFile(this.tasks,file)
		return super.onUnloadFile(file);
	}

	async makeGanttChart() {
		console.log("Make gantt chart")
		if (this.root) {
			this.root.unmount()
		}
		const container = this.containerEl.children[1]
		this.root = createRoot(container)
		this.root.render(
			<StrictMode>
				<Context.Provider value={{
					view: this
				}}>
					<MainComponent/>
				</Context.Provider>
			</StrictMode>
		)

	}


	saveBackToFile(tasks: SmartGanttTask[],file:TFile) {

		this.app.vault.read(file).then(content => {
			let lines = content.split("\n")

			for (const t of tasks) {
				if (t.progress !== 100) {
					lines[t.lineIndex] = `- [ ] ${t.name} [smartGanttId :: ${t.id}] [start::${moment(t.start).format(DATE_FORMAT)}] [due::${moment(t.end).format(DATE_FORMAT)}] [created::${moment(t.created).format(DATE_FORMAT)}] [dependencies::${t.dependencies.join(",")}] [type::${t.type}] [progress::${t.progress}]`
				} else {
					lines[t.lineIndex] = `- [x] ${t.name} [smartGanttId :: ${t.id}][start::${moment(t.start).format(DATE_FORMAT)}][due::${moment(t.end).format(DATE_FORMAT)}][created::${moment(t.created).format(DATE_FORMAT)}][dependencies::${t.dependencies.join(",")}][type::${t.type}] [progress::${t.progress}]`
				}
			}
			this.plugin.app.vault.modify(file, lines.join("\n"))

		})
	}


	override async onLoadFile(file: TFile) {
		await super.onLoadFile(file);
		this.tasks = []
		console.log("On loaded file")
		const helper = new HelperNg(this.plugin)
		console.log("We are in the file")
		const tasks = await helper.getAllLinesContainCheckboxInMarkdown(file)
		// console.log(tasks)
		for (const task of tasks) {
			const taskWithMetaData = await helper.extractLineWithCheckboxToTaskWithMetaData(task)
			// console.log(taskWithMetaData)
			this.tasks.push({
				name: taskWithMetaData?.name ?? "No name",
				progress: Number(taskWithMetaData?.metadata.progress) ?? 0,
				id: taskWithMetaData?.metadata.smartGanttId ?? v4(),
				start: moment(taskWithMetaData?.metadata.start).toDate() ?? moment().toDate(),
				end: moment(taskWithMetaData?.metadata.due).toDate() ?? moment().add(1, "day").toDate(),
				created: moment(taskWithMetaData?.metadata.created).toDate() ?? moment().toDate(),
				dependencies: taskWithMetaData?.metadata.dependencies.split(",") ?? [],
				type: taskWithMetaData?.metadata.type ?? "task",
				lineIndex: taskWithMetaData?.lineIndex ?? 0
			} as SmartGanttTask)
		}
		await this.makeGanttChart()
	}

	override setState(state: SmartGanttItemViewState, result: ViewStateResult): Promise<void> {
		console.log("Set state")
		this.projectName = state.projectName;
		this.projectId = state.projectId
		this.tasks = state.tasks
		this.file = state.file
		this.taskMarkDownItems = state.taskMarkDownItems

		return super.setState(state, result);
	}

	projectId = "";
	projectName = "";

	tasks: SmartGanttTask[] = [];

}
