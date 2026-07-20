import {TFile} from "obsidian";
import SmartGanttPlugin from "../main";
import {SmartGanttSettings} from "./SettingManager";
import {Processor, unified} from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"

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

	private async recursiveGetListItemFromParseTree(node: Node
		, file: TFile
		, settings: SmartGanttSettings) {

		if (node.type == "listItem") {
			//@ts-ignore
			if (settings.doneShowQ && node.checked === true || settings.todoShowQ && node.checked === false) {
				this.nodes.push({
					node,
					file
				})
			}
		}
		if ("children" in node) {
			//@ts-ignore
			node.children.forEach((childNode: Node) => {
				this.recursiveGetListItemFromParseTree(childNode, file, settings)
			})
		}
	}

	private async parseFilesAndUpdateTokensNg(file: TFile, settings: SmartGanttSettings) {
		if (!file) return
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)
		const parseTree: Node = this._remarkProcessor.parse(fileContent)
		// console.log(parseTree)
		await this.recursiveGetListItemFromParseTree(parseTree, file, settings)

	}


	async parseAllFilesNg(settings: SmartGanttSettings) {
		const pathFilterSettings = settings.pathListFilter
		await Promise.all(this._files.map(async (file) => {
			// console.log(file)
			if (pathFilterSettings.indexOf("AllFiles") !== -1) {
			} else if (pathFilterSettings.indexOf("CurrentFile") !== -1) {
				if (this._currentPlugin.app.workspace.getActiveFile()?.name !== file.name) return
			} else if (
				(pathFilterSettings.indexOf("AllFiles") === -1) &&
				(pathFilterSettings.indexOf("CurrentFile") === -1) &&
				(pathFilterSettings.indexOf(file.parent?.path!) === -1)
			) return
			// console.log(file)
			await this.parseFilesAndUpdateTokensNg(file, settings)
		}))
	}


}
