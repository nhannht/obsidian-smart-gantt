import {addIcon, Plugin, WorkspaceLeaf} from 'obsidian';
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
		// Brand mark: the three staggered gantt bars from the website favicon,
		// monochrome so it follows the theme like any built-in icon.
		addIcon("smart-gantt", `<rect x="21.9" y="26.6" width="42.2" height="12.5" rx="6.25" fill="currentColor"/><rect x="35.9" y="43.75" width="42.2" height="12.5" rx="6.25" fill="currentColor" opacity="0.85"/><rect x="21.9" y="60.9" width="29.7" height="12.5" rx="6.25" fill="currentColor" opacity="0.7"/>`)
		await this.settingManager.loadSettings()
		this.registerView(SMART_GANTT_ITEM_VIEW_TYPE,(leaf)=> new SmartGanttItemView(leaf, this))
		this.registerExtensions(["smartgantt"],SMART_GANTT_ITEM_VIEW_TYPE)

		this.addCommand({
			id: 'reload',
			name: 'Reload',
			callback: () => {
				void this.helper.reloadView()
			}
		})


		this.registerView("smart-gantt", (leaf) => {
			return new SmartGanttSibeBarView(leaf, this);
		})

		this.addRibbonIcon('smart-gantt', 'Smart Gantt', () => {

			let leafs = this.app.workspace.getLeavesOfType("smart-gantt");
			if (leafs.length > 0) {
				// this.app.workspace.detachLeavesOfType("smart-gantt")
				let leaf = leafs[0];
				// console.log(leaf.getEphemeralState())
				if (this.app.workspace.rightSplit.collapsed) {
					void this.app.workspace.revealLeaf(leaf)
				} else {
					this.app.workspace.rightSplit.collapse()
				}
			} else {
				let leaf = this.app.workspace.getRightLeaf(false);

				void leaf?.setViewState({
					type: "smart-gantt",
					active: true
				}).then(() => {
					if (leaf instanceof WorkspaceLeaf) {
						return this.app.workspace.revealLeaf(leaf)
					}
				})
			}

		})

		await this.ganttBlockManager.registerGanttBlockNg()
		await this.ganttBlockManager.registerTaskListBlock()


	}

}
