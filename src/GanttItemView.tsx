import {FileView, TFile, ViewStateResult, WorkspaceLeaf} from "obsidian";
import SmartGanttPlugin from "../main";
import Gantt from "frappe-gantt"
import HelperNg from "@/HelperNg";
import {Node} from "unist"
import {Task,Options} from "frappe-gantt";
import { v4 } from "uuid";
import moment from "moment";

export const DATE_FORMAT = "YYYY-MM-DD"

export interface TaskForFrappeGantt extends Task {
	id: string,
	name: string,
	start: string,
	end: string,
	created: string,
	completion?: Date,
	dependencies: string,
	progress: number,
	duration?: string,
	important?: boolean

}

export interface FrappeGanttOptions extends Options {
	infinite_padding: boolean,
	view_mode_select: boolean,
	container_height: number

}

export interface SmartGanttItemViewState {
	projectId: string,
	projectName: string,
	taskMarkDownItems: Node[]

	tasks: any[],
	file: TFile | null
}

function daysSince(days: number) {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

function random() {
	return Math.floor(Math.random() * 100);
}


export const SMART_GANTT_ITEM_VIEW_TYPE = "smart-gantt-item-view";

export default class SmartGanttItemView extends FileView implements SmartGanttItemViewState {

	taskMarkDownItems: Node[] = []

	getViewType(): string {
		console.log("Get view type called")
		return SMART_GANTT_ITEM_VIEW_TYPE;
	}

	constructor(leaf: WorkspaceLeaf, public plugin: SmartGanttPlugin) {
		console.log("Contructor called")
		super(leaf);
	}


	override getState(): SmartGanttItemViewState {
		console.log("Get state called")
		return {
			tasks: this.tasks,
			projectId: this.projectId,
			projectName: this.projectName,
			file: this.file?.path as unknown as TFile, // yeah, it is trick to silent ts checker
			taskMarkDownItems: this.taskMarkDownItems

		}
	}

	async makeGanttChart(){
		const container = this.containerEl.children[1]
		container.createEl("div", {
			attr: {
				"id": "gantt-container"
			}
		})
		container.createEl("div", {
			attr: {
				"id": "gantt"
			}
		})
		let gantt = new Gantt("#gantt", this.tasks, {
			infinite_padding: false,
			view_mode_select: true,
			date_format: "MM-DD-YYYY",
			container_height: 500

		} as FrappeGanttOptions)
	}




	override async onLoadFile(file: TFile) {
		await super.onLoadFile(file);
		this.tasks = []
		console.log("On loaded file")


		const helper = new HelperNg(this.plugin)
		if (this.file) {
			const tasks = await helper.getAllLinesContainCheckboxInMarkdown(this.file)
			// console.log(tasks)
			for (const task of tasks){
				const taskWithMetaData = await helper.extractLineWithCheckboxToTaskWithMetaData(task.lineContent)
				console.log(taskWithMetaData)
				this.tasks.push({
					name: taskWithMetaData?.content ?? "No data",
					progress: Number(taskWithMetaData?.metadata.progress) ?? 0,
					id: taskWithMetaData?.metadata.smartGanttId ?? v4(),
					start: taskWithMetaData?.metadata.start ?? moment().format(DATE_FORMAT),
					end: taskWithMetaData?.metadata.due ?? moment().add(1,"day").format(DATE_FORMAT),
					created: taskWithMetaData?.metadata.created ?? moment().format(DATE_FORMAT),
					dependencies: taskWithMetaData?.metadata.dependencies ?? "",
				})
			}
			await this.makeGanttChart()
		}
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

	projectId: string = "";
	projectName: string = "";
	markdownSourceFilePath: string = "";
	tasks: TaskForFrappeGantt[] = [];

}
