
export interface SmartGanttSettings {
	pathListFilter: String[]
}

export default class SettingManager {
	get settings(): SmartGanttSettings {
		return this._settings;
	}

	set settings(value: SmartGanttSettings) {
		this._settings = value;
	}

	constructor(private _settings: SmartGanttSettings) {

	}

	async loadSettings() {
		if (localStorage.getItem("smart-gantt-settings")){
			this._settings = Object.assign(
				{},
				this._settings,
				//@ts-ignore
				JSON.parse(localStorage.getItem("smart-gantt-settings")))
		}
	}

	async saveSettings(newSettings: SmartGanttSettings) {
		localStorage.setItem("smart-gantt-settings", JSON.stringify(newSettings))
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
}
