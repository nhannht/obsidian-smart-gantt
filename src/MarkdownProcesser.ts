import {TFile} from "obsidian";
import SmartGanttPlugin from "../main";
import {SmartGanttSettings} from "./SettingManager";
import {Processor, unified} from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node, Parent} from "unist"
import {ListItem} from "mdast"

export type NodeFromParseTree = {
	node: Node,
	file: TFile
}

export default class MarkdownProcesser {
	get nodes(): NodeFromParseTree[] {
		return this._nodes;
	}

	private _remarkProcessor: Processor;

	get currentPlugin(): SmartGanttPlugin {
		return this._currentPlugin;
	}

	private _files: TFile[];
	private _currentPlugin: SmartGanttPlugin;

	private _nodes: NodeFromParseTree[] = [];

	constructor(files: TFile[],
				currentPlugin: SmartGanttPlugin
	) {
		this._files = files;
		this._currentPlugin = currentPlugin;
		//@ts-ignore
		this._remarkProcessor = unified().use(remarkGfm).use(remarkParse)
	}

	private recursiveGetListItemFromParseTree(node: Node
		, file: TFile
		, settings: SmartGanttSettings) {

		if (node.type == "listItem") {
			const checked = (node as ListItem).checked
			if (settings.doneShowQ && checked === true || settings.todoShowQ && checked === false) {
				this.nodes.push({
					node,
					file
				})
			}
		}
		if ("children" in node) {
			(node as Parent).children.forEach((childNode) => {
				this.recursiveGetListItemFromParseTree(childNode, file, settings)
			})
		}
	}

	private async parseFilesAndUpdateTokensNg(file: TFile, settings: SmartGanttSettings) {
		if (!file) return
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)
		const parseTree: Node = this._remarkProcessor.parse(fileContent)
		this.recursiveGetListItemFromParseTree(parseTree, file, settings)

	}


	async parseAllFilesNg(settings: SmartGanttSettings) {
		const pathFilterSettings = settings.pathListFilter
		await Promise.all(this._files.map(async (file) => {
			if (pathFilterSettings.includes("CurrentFile")) {
				if (this._currentPlugin.app.workspace.getActiveFile()?.name !== file.name) return
			} else if (!pathFilterSettings.includes("AllFiles") &&
				!pathFilterSettings.includes(file.parent?.path ?? "")) {
				return
			}
			await this.parseFilesAndUpdateTokensNg(file, settings)
		}))
	}


}
