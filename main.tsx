import {Plugin, WorkspaceLeaf} from 'obsidian';
import SmartGanttSibeBarView from "@/sidebar/SmartGanttSibeBarView";
import {Helper} from "@/lib/Helper";
import SettingManager, {SmartGanttSettings} from "./src/SettingManager";
import GanttBlockManager from "./src/GanttBlockManager";
import SmartGanttItemView, {SMART_GANTT_ITEM_VIEW_TYPE} from "@/GanttItemView";

const DEFAULT_SETTINGS: SmartGanttSettings = {
	pathListFilter: ["AllFiles"],
	todoShowQ: true,
	doneShowQ: true,
	leftBarChartDisplayQ: true,
	viewMode: "day"

}


export default class SmartGanttPlugin extends Plugin {
	settingManager = new SettingManager(this, DEFAULT_SETTINGS);
	public helper = new Helper(this)
	ganttBlockManager = new GanttBlockManager(this)

	override async onload() {
		await this.settingManager.loadSettings()
		this.registerView(SMART_GANTT_ITEM_VIEW_TYPE,(leaf)=> new SmartGanttItemView(leaf, this))
		this.registerExtensions(["smartgantt"],SMART_GANTT_ITEM_VIEW_TYPE)

		this.addCommand({
			id: 'reload',
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

		await this.ganttBlockManager.registerGanttBlockNg()
		await this.ganttBlockManager.registerTaskListBlock()


	}

}
