import SmartGanttPlugin from "../main";
import {GanttZoom} from "@/gantt/types";
import {zoomFromSetting} from "@/gantt/adapters";

export interface SmartGanttSettings {
	pathListFilter: string[],
	todoShowQ: boolean,
	doneShowQ: boolean,
	viewMode: GanttZoom,
	leftBarChartDisplayQ :boolean,
}

export default class SettingManager {
	get settings(): SmartGanttSettings {
		return this._settings;
	}

	set settings(value: SmartGanttSettings) {
		this._settings = value;
	}

	constructor(private thisPlugin: SmartGanttPlugin,
				private _settings: SmartGanttSettings) {

	}

	async loadSettings() {
		const data = await this.thisPlugin.loadData() as Partial<SmartGanttSettings> | null
		if (data) {
			this._settings = {...this._settings, ...data}
		}
		// Legacy persisted values used gantt-task-react ViewMode strings.
		this._settings.viewMode = zoomFromSetting(this._settings.viewMode)
	}

	async saveSettings(newSettings: SmartGanttSettings) {
		this._settings = newSettings
		await this.thisPlugin.saveData(newSettings)
	}

	async addPath(path: string) {
		if (this.settings.pathListFilter.indexOf(path) === -1) {
			this.settings.pathListFilter.push(path)
			await this.saveSettings(this._settings)

		}
	}

	async removePath(path: string) {
		if (this.settings.pathListFilter.indexOf(path) !== -1) {
			this.settings.pathListFilter.remove(path)
			await this.saveSettings(this._settings)

		}
	}

	async setToAllFiles() {
		if (this.settings.pathListFilter.indexOf("AllFiles") === -1) {
			this.settings.pathListFilter = []
			this.settings.pathListFilter.push("AllFiles")
			await this.saveSettings(this._settings)
		}
	}

	async setToCurrentFiles() {
		if (this.settings.pathListFilter.indexOf("CurrentFile") === -1) {
			this.settings.pathListFilter = []
			this.settings.pathListFilter.push("CurrentFile")
		}
		await this.saveSettings(this._settings)
	}

	async clearAllPath(){
		this.settings.pathListFilter = []
		await this.saveSettings(this._settings)
	}

	async setTodoShowQ(choice: boolean){
		this.settings.todoShowQ = choice
		await this.saveSettings(this._settings)
	}

	async setDoneShowQ(choice:boolean){
		this.settings.doneShowQ = choice
		await this.saveSettings(this._settings)
	}
}
