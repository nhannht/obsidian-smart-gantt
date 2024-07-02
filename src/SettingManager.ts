import SmartGanttPlugin from "../main";

export interface SmartGanttSettings {
	pathListFilter: String[],
	todoShowQ: boolean,
	doneShowQ: boolean

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
		const vaultName = this.thisPlugin.app.vault.getName()
		if (localStorage.getItem(`smart-gantt-settings-${vaultName}`)) {
			this._settings = Object.assign(
				{},
				this._settings,
				//@ts-ignore
				JSON.parse(localStorage.getItem(`smart-gantt-settings-${vaultName}`)))
		}
	}

	async saveSettings(newSettings: SmartGanttSettings) {
		const vaultName = this.thisPlugin.app.vault.getName()
		localStorage.setItem(`smart-gantt-settings-${vaultName}`, JSON.stringify(newSettings))
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
