import {Plugin, WorkspaceLeaf} from 'obsidian';
import SmartGanttSibeBarView from "@/sidebar/SmartGanttSibeBarView";
import {Helper} from "@/lib/Helper";
import SettingManager, {SmartGanttSettings} from "./src/SettingManager";
import GanttBlockManager from "./src/GanttBlockManager";
import {ViewMode} from "gantt-task-react";
import './src/lib/codemirror';
import './src/mode/gantt/gantt'
import './src/mode/gantt/gantt-list'
import SmartGanttItemView, {SMART_GANTT_ITEM_VIEW_TYPE, SmartGanttItemViewState} from "@/GanttItemView";
import HelperNg from "@/HelperNg";
// import "frappe-gantt/dist/frappe-gantt.css"

const DEFAULT_SETTINGS: SmartGanttSettings = {
	pathListFilter: ["AllFiles"],
	todoShowQ: true,
	doneShowQ: true,
	leftBarChartDisplayQ: true,
	viewMode: ViewMode.Day

}


export default class SmartGanttPlugin extends Plugin {
	settingManager = new SettingManager(this, DEFAULT_SETTINGS);
	public helper = new Helper(this)
	ganttBlockManager = new GanttBlockManager(this)
	modesToKeep = ["hypermd", "markdown", "null", "xml"];


	refreshLeaves = () => {
		// re-set the editor mode to refresh the syntax highlighting
		//@ts-ignore
		this.app.workspace.iterateCodeMirrors(cm => cm.setOption("mode", cm.getOption("mode")))
	}

	darkModeAdapt = () => {
		if (document.body.hasClass("theme-dark")) {
			document.body.addClass("dark")
		} else {
			document.body.removeClass("dark")
		}
	}


	override async onload() {
		this.darkModeAdapt()

		await this.settingManager.loadSettings()
		this.registerView(SMART_GANTT_ITEM_VIEW_TYPE,(leaf)=> new SmartGanttItemView(leaf, this))
		this.registerExtensions(["smartgantt"],SMART_GANTT_ITEM_VIEW_TYPE)


		this.addRibbonIcon("shell", "Debug, open Gantt view",async ()=>{
			// let leaf = this.app.workspace.getLeaf(false)
			// leaf.setViewState({
			// 	type:SMART_GANTT_ITEM_VIEW_TYPE,
			// 	active:true,
			// 	state:{
			// 		projectId: "default",
			// 		projectName: "default"
			// 	}as SmartGanttItemViewState
			// })
			//
			const currentFile = this.app.workspace.getActiveFile()
			if (currentFile){
				// console.log(currentFile)
				// const helper = new HelperNg(this)
				// const tree = await helper.getParseTree(currentFile)
				// console.log(tree)
				const view = this.app.workspace.getActiveViewOfType(SmartGanttItemView)
				if (view){
					console.log(view.getState())
				}

			}
		})

		this.app.workspace.onLayoutReady(() => {
			this.refreshLeaves()

		})

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


		this.registerEvent(this.app.workspace.on('css-change', this.darkModeAdapt))


		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	override async onunload() {
		// this.app.workspace.detachLeavesOfType("gantt-chart")
		await this.settingManager.saveSettings(this.settingManager.settings)
		//@ts-ignore
		for (const key in CodeMirror.modes) {
			// @ts-ignore
			if (CodeMirror.modes.hasOwnProperty(key) && !this.modesToKeep.includes(key)) {
				// @ts-ignore
				delete CodeMirror.modes[key];
			}
			this.refreshLeaves()

		}
		this.app.workspace.off('css-change', this.darkModeAdapt)

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
