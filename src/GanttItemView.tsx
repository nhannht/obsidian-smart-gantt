import {FileView, IconName, Modal, Notice, Setting, TFile, ViewStateResult, WorkspaceLeaf} from "obsidian";
import SmartGanttPlugin from "../main";
import HelperNg from "@/HelperNg";
import {Node} from "unist"
import {v4} from "uuid";
import {createRoot, Root} from "react-dom/client";
import {createContext, StrictMode, useContext, useState} from "react";
import {GanttChart, ZoomControl, GanttTask, GanttZoom, GanttChangePayload} from "@/gantt";
import GlassSurface from "@/component/GlassSurface";
import Pressable from "@/component/Pressable";
import {Plus} from "lucide-react";

export class TaskCustomizeModal extends Modal {
	constructor(view: SmartGanttItemView, task: SmartGanttTask, onSubmit: (task: SmartGanttTask) => void) {
		super(view.plugin.app);
		this.setTitle("Customize tasks")
		let cloneTask = {...task}

		new Setting(this.contentEl)
			.setName('Task name')
			.addText((text) => {
				text

					.setPlaceholder("Choose new name")
					.setValue(task.name)
					.onChange((value) => {
						cloneTask.name = value
					})
			})

		new Setting(this.contentEl)
			.setName("Start date")
			.addText((com) => {
				com
					.setValue(formatDate(task.start))
					.onChange(value => {
						const parsed = parseDateInput(value)
						if (parsed) {
							cloneTask.start = parsed
						} else {
							new Notice("Invalid date, expected YYYY-MM-DD", 5000)
						}
					})
			})

		new Setting(this.contentEl)
			.setName("End date")
			.addText((com) => {
				com
					.setValue(formatDate(task.end))
					.onChange(value => {
						const parsed = parseDateInput(value)
						if (parsed) {
							cloneTask.end = parsed
						} else {
							new Notice("Invalid date, expected YYYY-MM-DD", 5000)
						}
					})
			})

		new Setting(this.contentEl)
			.setName("Progress")
			.addSlider((value) => {
				value.setValue(task.progress)
					.onChange(v => {
						cloneTask.progress = v
					})
			})

		new Setting(this.contentEl)
			.addButton((btn) => {
				btn.setButtonText("Save")
					.setCta()
					.onClick(() => {
						this.close()
						onSubmit(cloneTask)
					})
			})
			.addButton((btn) => {
				btn.setButtonText("Cancel")
					.onClick(() => {
						this.close()
					})
			})
			.addButton((btn) => {
				btn.setButtonText("Backlog")
					.setTooltip("Hide it from this chart but the task still stay in markdown file")
					.onClick(() => {
						cloneTask.inventory = "backlog"
						this.close()
						onSubmit(cloneTask)


					})
			})
	}
}

export const DATE_FORMAT = "YYYY-MM-DD"

const formatDate = (d: Date) => {
	const p = (n: number) => String(n).padStart(2, "0")
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const parseDateInput = (value: string): Date | null => {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
	if (!m) return null
	return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

const addDays = (d: Date, days: number) =>
	new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)

export interface SmartGanttTask {
	id: string,
	name: string,
	start: Date,
	end: Date,
	type: string,
	dependencies: string[],
	progress: number,
	duration?: string,
	lineIndex: number,
	inventory: string,
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

	tasks: SmartGanttTask[],
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
	const [zoom, setZoom] = useState<GanttZoom>("day")

	const updateTaskInComponentAndView = (tasks: SmartGanttTask[]) => {
		setTasks(() => {
			if (view.file) {
				void view.saveBackToFile(tasks, view.file)
				view.tasks = tasks
			}
			return tasks
		})
	}

	const createNewTask = () => {
		let task: SmartGanttTask = {
			inventory: "",
			type: "task",
			id: v4(),
			start: new Date(),
			end: addDays(new Date(), 1),
			name: "New task",
			progress: 0,
			dependencies: [],
			lineIndex: -1
		}
		new TaskCustomizeModal(view, task, (task) => {
			updateTaskInComponentAndView([...tasks, task])
		}).open()
	}

	const ganttTasks: GanttTask[] = tasks
		.filter(t => t.inventory !== "backlog")
		.map(t => ({
			id: t.id,
			name: t.name,
			start: t.start,
			end: t.end,
			status: t.progress === 100 ? "done" : "open",
			meta: t,
		}))

	const onTaskChange = (task: GanttTask, change: GanttChangePayload) => {
		updateTaskInComponentAndView(tasks.map(t =>
			t.id === task.id ? {...t, start: change.start, end: change.end} : t
		))
	}

	const editTask = (task: GanttTask) => {
		const taskToEdit = tasks.find(t => t.id === task.id)
		if (!taskToEdit) return
		new TaskCustomizeModal(view, taskToEdit, (edited) => {
			updateTaskInComponentAndView(tasks.map(t => t.id === edited.id ? edited : t))
		}).open()
	}

	return <div className={"twp relative flex h-full flex-col"}>
		<div className={"sg-float pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center"}>
			<GlassSurface
				width={"auto"}
				height={44}
				borderRadius={14}
				className={"pointer-events-auto"}
			>
				<div className={"flex items-center gap-2 px-3"}>
					<ZoomControl zoom={zoom} onChange={setZoom}/>
					<Pressable className={"sg-new-task"} onClick={createNewTask}>
						<Plus className={"h-3.5 w-3.5"}/>
						New task
					</Pressable>
				</div>
			</GlassSurface>
		</div>
		<div className={"h-full pt-14"}>
			<GanttChart
				tasks={ganttTasks}
				zoom={zoom}
				onTaskChange={onTaskChange}
				onOpenSource={editTask}
				showNames={true}
				height={"100%"}
			/>
		</div>
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

	override getIcon(): IconName {
		return 'smart-gantt'
	}

	constructor(leaf: WorkspaceLeaf, public plugin: SmartGanttPlugin) {
		// console.log("Contructor called")
		super(leaf);
	}

	[x: string]: unknown;


	override getState(): SmartGanttItemViewState {
		return {
			tasks: this.tasks,
			projectId: this.projectId,
			projectName: this.projectName,
			file: this.file,
			taskMarkDownItems: this.taskMarkDownItems

		}
	}


	onunload() {
		// this.saveBackToFile(this.tasks)
		// console.log("on unload triggered")
		if (this.root) {
			this.root.unmount()
		}
		super.onunload();
	}


	protected onClose(): Promise<void> {
		// this.saveBackToFile(this.tasks)
		// console.log("on close triggered")
		if (this.root) {
			this.root.unmount()
		}
		return super.onClose();
	}


	onUnloadFile(file: TFile): Promise<void> {
		// this.saveBackToFile(this.tasks, file)
		return super.onUnloadFile(file);
	}

	async makeGanttChart() {
		// console.log("Make gantt chart")
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

	convertSmartGanttTaskToMarkdownString(task: SmartGanttTask) {
		let output = ""
		task.progress === 100 ? output += `- [x] ` : output += `- [ ] `
		output += ` ${task.name} `
		for (let key of Object.keys(task)) {

			if (key === "id") {
				output += ` [smartGanttId :: ${task["id"]}] `

			} else if (key === "start") {
				output += ` [start :: ${formatDate(task["start"])}] `

			} else if (key === "end") {
				output += ` [due :: ${formatDate(task["end"])}] `
			} else if (key === "dependencies") {
				output += ` [dependencies :: ${task["dependencies"].join(",")}] `
			} else {
				// @ts-ignore
				output += ` [${key}::${task[key]}] `
			}
		}
		return output

	}

	async saveBackToFile(tasks: SmartGanttTask[], file: TFile) {
		await this.app.vault.process(file, (content) => {
			let lines = content.split("\n")
			for (const t of tasks) {
				if (t.lineIndex === -1) {
					t.lineIndex = lines.length
					lines.push(this.convertSmartGanttTaskToMarkdownString(t))
				} else {
					lines[t.lineIndex] = this.convertSmartGanttTaskToMarkdownString(t)
				}
			}
			return lines.join("\n")
		})
	}


	override async onLoadFile(file: TFile) {
		await super.onLoadFile(file);
		this.tasks = []
		// console.log("On loaded file")
		const helper = new HelperNg(this.plugin)
		// console.log("We are in the file")
		const tasks = await helper.getAllLinesContainCheckboxInMarkdown(file)
		if (tasks.length === 0){
			this.tasks.push({
				name: "In the beginning there is only darkness",
				id: v4(),
				start: new Date(),
				end: addDays(new Date(), 3),
				dependencies: [],
				progress: 0,
			lineIndex: -1,
				type: "task",
				inventory: "task",
			})

		} else {
			for (const task of tasks) {
				const taskWithMetaData = await helper.extractLineWithCheckboxToTaskWithMetaData(task)
				if (taskWithMetaData && taskWithMetaData.metadata.inventory !== "backlog") {
					const meta = taskWithMetaData.metadata
					const progress = Number(meta.progress)
					this.tasks.push({
						name: taskWithMetaData.name || "No name",
						progress: Number.isFinite(progress) ? progress : 0,
						id: meta.smartGanttId ?? v4(),
						start: (meta.start ? parseDateInput(meta.start) : null) ?? new Date(),
						end: (meta.due ? parseDateInput(meta.due) : null) ?? addDays(new Date(), 1),
						dependencies: meta.dependencies?.split(",") ?? [],
						type: meta.type ?? "task",
						lineIndex: taskWithMetaData.lineIndex ?? -1,
						inventory: meta.inventory ?? "task",
					})
				}
			}

		}
		// console.log(tasks)
		await this.makeGanttChart()
	}

	override setState(state: SmartGanttItemViewState, result: ViewStateResult): Promise<void> {
		// console.log("Set state")
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
