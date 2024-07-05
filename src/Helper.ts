import SmartGanttPlugin from "../main";
import {WorkspaceLeaf} from "obsidian";
import {FilterModal} from "./FilterModal";

export class Helper {
	constructor(private thisPlugin: SmartGanttPlugin) {
	}

	async reloadView() {
		this.thisPlugin.app.workspace.detachLeavesOfType("smart-gantt")
		let leaf = this.thisPlugin.app.workspace.getRightLeaf(false);

		leaf?.setViewState({
			type: "smart-gantt",
			active: true,
		})
		if (leaf instanceof WorkspaceLeaf && !this.thisPlugin.app.workspace.rightSplit.collapsed) {
			this.thisPlugin.app.workspace.revealLeaf(leaf);

		}
	}

	async renderFilterBox() {
		new FilterModal(this.thisPlugin.app,
			this.thisPlugin,
		).open()

	}

	getComputedStyleOfVault(){
		return getComputedStyle(document.body)

	}
}
