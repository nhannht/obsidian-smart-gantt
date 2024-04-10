import SmartGanttPlugin from "../main";
export interface SmartGanttSettings {
	mySetting: string;
}
export default class SettingManager {
	get plugin(): SmartGanttPlugin {
		return this._plugin;
	}

	set plugin(value: SmartGanttPlugin) {
		this._plugin = value;
	}

	get settings(): SmartGanttSettings {
		return this._settings;
	}

	set settings(value: SmartGanttSettings) {
		this._settings = value;
	}
    private _plugin: SmartGanttPlugin;
	private _settings: SmartGanttSettings;
	constructor(plugin:SmartGanttPlugin,settings:SmartGanttSettings) {
		this._plugin = plugin;
		this._settings = settings;

	}

	async loadSettings(){
		this.settings = Object.assign({}, this._settings, await this.plugin.loadData())

	}
	async saveSettings(newSettings:SmartGanttSettings){
		await this.plugin.saveData(newSettings)
	}

}
