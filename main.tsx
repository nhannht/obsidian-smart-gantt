import {Plugin, WorkspaceLeaf} from 'obsidian';
import SmartGanttSibeBarView from "@/sidebar/SmartGanttSibeBarView";
import {Helper} from "@/lib/Helper";
import SettingManager, {SmartGanttSettings} from "./src/SettingManager";
import GanttBlockManager from "./src/GanttBlockManager";
import {ViewMode} from "gantt-task-react";

const DEFAULT_SETTINGS: SmartGanttSettings = {
	pathListFilter: ["AllFiles"],
	todoShowQ: true,
	doneShowQ: true,
	leftBarChartDisplayQ:true,
	viewMode:ViewMode.Day

}

export default class SmartGanttPlugin extends Plugin {
	settingManager = new SettingManager(this, DEFAULT_SETTINGS);
	public helper = new Helper(this)
	ganttBlockManager = new GanttBlockManager(this)



	override async onload() {
		await this.settingManager.loadSettings()
		// console.log(this.settingManager.settings)
		this.addCommand({
			id: 'smart-gantt-reload',
			name: 'Reload',
			callback: () => {
				this.helper.reloadView()
			}
		})



		this.registerView("smart-gantt", (leaf) => {
			return new SmartGanttSibeBarView(leaf, this);
		})

		this.addRibbonIcon('egg', 'Smart Gantt', () => {

			let leafs = this.app.workspace.getLeavesOfType("smart-gantt");
			if (leafs.length > 0) {
				// this.app.workspace.detachLeavesOfType("smart-gantt")
				let leaf = leafs[0];
				// console.log(leaf.getEphemeralState())
				if (this.app.workspace.rightSplit.collapsed) {
					this.app.workspace.revealLeaf(leaf)
				} else {
					this.app.workspace.rightSplit.collapse()
				}
			} else {
				let leaf = this.app.workspace.getRightLeaf(false);

				leaf?.setViewState({
					type: "smart-gantt",
					active: true
				})
				if (leaf instanceof WorkspaceLeaf) {
					this.app.workspace.revealLeaf(leaf);
				}
			}

		})

		// await this.ganttBlockManager.registerGanttBlock()
		await this.ganttBlockManager.registerGanttBlockNg()
		await this.ganttBlockManager.registerTaskListBlock()




		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	override async onunload() {
		// this.app.workspace.detachLeavesOfType("gantt-chart")
		await this.settingManager.saveSettings(this.settingManager.settings)

	}


}


// class SampleSettingTab extends PluginSettingTab {
// 	plugin: SmartGanttPlugin;
//
// 	constructor(app: App, plugin: SmartGanttPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}
//
// 	display(): void {
// 		const {containerEl} = this;
//
// 		containerEl.empty();
//
// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settingManager.settings.mySetting)
// 				.onChange(async (value) => {
// 					this.plugin.settingManager.settings.mySetting = value;
// 					await this.plugin.settingManager.saveSettings(this.plugin.settingManager.settings)
// 				}));
// 	}
// }
