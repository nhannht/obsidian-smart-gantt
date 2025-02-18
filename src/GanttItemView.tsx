import {FileView, Modal, Notice, Setting, TFile, ViewStateResult, WorkspaceLeaf} from "obsidian";
import SmartGanttPlugin from "../main";
import HelperNg from "@/HelperNg";
import {Node} from "unist"
import {v4} from "uuid";
import moment from "moment";
import {Gantt, Task} from "gantt-task-react";
import {createRoot, Root} from "react-dom/client";
import {createContext, StrictMode, useContext, useState} from "react";

export class TaskCustomizeModal extends Modal {
	constructor(view: SmartGanttItemView, task: SmartGanttTask, onSubmit: (task: SmartGanttTask) => void) {
		super(view.plugin.app);
		this.setTitle("Customize tasks")
		let cloneTask = {...task}

		let nameSetting = new Setting(this.contentEl)
			.setName('Task name')

			.addText((text) => {
				text

					.setPlaceholder("Choose new name")
					.setValue(task.name)
					.onChange((value) => {
						cloneTask.name = value
					})
			})

		let startDateSetting = new Setting(this.contentEl)
			.setName("Start date")
			.addMomentFormat((com) => {
				com
					.setValue(moment(task.start).format("YYYY-MM-DD"))
					.onChange(value => {
						if (moment(value).isValid()) {
							cloneTask.start = moment(value).toDate()

						} else {
							new Notice("Invalid date", 5000)
						}
					})
			})

		let endDateSetting = new Setting(this.contentEl)
			.setName("End date")
			.addMomentFormat((com) => {
				com
					.setValue(moment(task.end).format("YYYY-MM-DD"))
					.onChange(value => {
						if (moment(value).isValid()) {
							cloneTask.end = moment(value).toDate()
						} else {
							new Notice("Invalid date", 5000)
						}

					})
			})

		let progressSetting = new Setting(this.contentEl)
			.setName("Progress")
			.addSlider((value) => {
				value.setValue(task.progress)
					.onChange(v => {
						cloneTask.progress = v
					})
					.setDynamicTooltip()
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

export interface SmartGanttTask extends Task {
	id: string,
	name: string,
	start: Date,
	end: Date,
	// created: Date,
	// completion?: Date,
	dependencies: string[],
	progress: number,
	duration?: string,
	// important?: boolean,
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
		setTasks(() => {
			if (view.file) {
				view.saveBackToFile(tasks, view.file)
				view.tasks = tasks
			}
			return tasks
		})
	}

	const createNewTask = () => {
		console.log("Yeah we create new task")
		let task: SmartGanttTask = {
			inventory: "",
			type: "task",
			id: v4(),
			start: moment().toDate(),
			end: moment().add(1, "day").toDate(),
			name: "New task",
			progress: 0,
			dependencies: [],
			lineIndex: -1
		}
		new TaskCustomizeModal(view, task, (task) => {
			updateTaskInComponentAndView([...tasks, task])
		}).open()
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

	return <div className={"twp"}>
		<div>
			<button onClick={createNewTask}>
				New task
			</button>
		</div>

		<Gantt tasks={tasks}
			   onDateChange={onDateChange}
			   onProgressChange={onProgressChange}
			   ganttHeight={view.containerEl.clientHeight * 0.8}
			   onDoubleClick={(task) => {
				   const taskToEdit = tasks.find(t => t.id === task.id)
				   if (taskToEdit) {
					   new TaskCustomizeModal(view, taskToEdit, (task) => {
							   updateTaskInComponentAndView(tasks.map(t => {
								   if (t.id === task.id) {
									   return task
								   }
								   return t
							   }))
						   }
					   ).open()
				   }

			   }
			   }
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
		// this.saveBackToFile(this.tasks, file)
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

	// we don't actua delete the task, just put a mark into it
	// markTaskAsDeleteInFile(task: SmartGanttTask, file: TFile) {
	// 	this.app.vault.read(file).then(content => {
	// 		let lines = content.split("\n")
	// 		task.inventory = "backlog"
	// 		lines[task.lineIndex] = `- [ ] ${task.name} [smartGanttId :: ${task.id}] [start::${moment(task.start).format(DATE_FORMAT)}] [due::${moment(task.end).format(DATE_FORMAT)}] [created::${moment(task.created).format(DATE_FORMAT)}] [dependencies::${task.dependencies.join(",")}] [type::${task.type}] [progress::${task.progress}] [inventory::${task.inventory}]`
	//
	// 		this.plugin.app.vault.modify(file, lines.join("\n"))
	// 	})
	// }

	convertSmartGanttTaskToMarkdownString(task: SmartGanttTask) {
		let output = ""
		task.progress === 100 ? output += `- [x] ` : output += `- [ ] `
		output += ` ${task.name} `
		for (let key of Object.keys(task)) {

			if (key === "id") {
				output += ` [smartGanttId :: ${task["id"]}] `

			} else if (key === "start") {
				const start = moment(task["start"]).format(DATE_FORMAT)
				output += ` [start :: ${start}] `

			} else if (key === "end") {
				const due = moment(task["end"]).format(DATE_FORMAT)
				output += ` [due :: ${due}] `
			} else if (key === "dependencies") {
				output += ` [dependencies :: ${task["dependencies"].join(",")}] `
			} else {
				// @ts-ignore
				output += ` [${key}::${task[key]}] `
			}
		}
		return output

	}

	saveBackToFile(tasks: SmartGanttTask[], file: TFile) {

		this.app.vault.read(file).then(content => {
			let lines = content.split("\n")

			for (const t of tasks) {
				if (t.lineIndex === -1) {
					t.lineIndex = lines.length
					lines.push(this.convertSmartGanttTaskToMarkdownString(t))
				} else {

					lines[t.lineIndex] = this.convertSmartGanttTaskToMarkdownString(t)
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
			if (taskWithMetaData && (!taskWithMetaData.metadata.inventory || taskWithMetaData.metadata.inventory !== "backlog")) {
				this.tasks.push({
					name: taskWithMetaData?.name ?? "No name",
					progress: Number(taskWithMetaData?.metadata.progress) ?? 0,
					id: taskWithMetaData?.metadata.smartGanttId ?? v4(),
					start: moment(taskWithMetaData?.metadata.start).toDate() ?? moment().toDate(),
					end: moment(taskWithMetaData?.metadata.due).toDate() ?? moment().add(1, "day").toDate(),
					// created: moment(taskWithMetaData?.metadata.created).toDate() ?? moment().toDate(),
					dependencies: taskWithMetaData?.metadata.dependencies.split(",") ?? [],
					type: taskWithMetaData?.metadata.type ?? "task",
					lineIndex: taskWithMetaData?.lineIndex ?? -1,
					inventory: taskWithMetaData?.metadata.inventory ?? "task"
				} as SmartGanttTask)
			}
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
