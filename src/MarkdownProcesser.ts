import {TFile} from "obsidian";
import {marked, Token} from "marked";
import SmartGanttPlugin from "../main";
import {SmartGanttSettings} from "./SettingManager";

export interface TokenWithFile {
	token: Token,
	file: TFile,
}

export default class MarkdownProcesser {
	get currentPlugin(): SmartGanttPlugin {
		return this._currentPlugin;
	}

	get documents(): TokenWithFile[] {
		return this._documents;
	}

	private _files: TFile[];
	private _documents: TokenWithFile[] = [];
	private _currentPlugin: SmartGanttPlugin;

	constructor(files: TFile[], currentPlugin: SmartGanttPlugin) {
		this._files = files;
		this._currentPlugin = currentPlugin;
	}

	async parseAllFiles(settings:SmartGanttSettings) {
		const pathFilterSettings = settings.pathListFilter
		this._files.map(async (file) => {
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
			await this.parseFilesAndUpdateTokens(file,settings)
		})
	}

	// private filterHTMLAndEmphasis(text: string) {
	// 	const stripHTML = text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ""),
	// 		stripEm1 = stripHTML.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1"),
	// 		stripEm2 = stripEm1.replace(/_{1,3}(.*?)_{1,3}/g, "$1"),
	// 		stripStrike = stripEm2.replace(/~{1,2}(.*?)~{1,2}/g, "$1"),
	// 		stripLink = stripStrike.replace(/!?\[(.*?)]\((.*?)\)/g, "").replace(/!?\[\[(.*?)]]/g, "");
	//
	// 	return stripLink
	//
	// }



	private async parseFilesAndUpdateTokens(file: TFile,settings: SmartGanttSettings) {
		if (!file) {
			return
		}
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)


		// const fileContentStripHTML = this.filterHTMLAndEmphasis(fileContent)


		// console.log(fileContentStripHTML)

		const lexerResult = marked.lexer(fileContent);

		// console.log(lexerResult)


		lexerResult.map((token) => {

			this.recusiveGetToken(token, this._documents, file,settings)
		})
		// filter token which is the smallest modulo


	}

	private recusiveGetToken(document: Token,
							 tokens: TokenWithFile[],
							 file: TFile,
							 settings:SmartGanttSettings
							) {
		//@ts-ignore
		if ("type" in document && document.task === true && document.type === "list_item") {
			if (document.raw.search("\n") !== -1) {
				document.text = document.text.split("\n")[0]
				document.raw = document.raw.split("\n")[0]
			}
			// console.log(document)

			if (settings.doneShowQ && (document.checked === true)) {
				tokens.push({
					token: document,
					file: file

				})
			}

			if (settings.todoShowQ && (document.checked === false)) {
				tokens.push({
					token: document,
					file: file,

				})
			}


		}
		if ("tokens" in document && document.tokens) {

			document.tokens.map((t) => {
				this.recusiveGetToken(t, tokens, file,settings)
			})
			// table
		}
		if ("rows" in document && document.rows) {
			document.rows.map((row: any[]) => {
				row.map((cell) => {
					this.recusiveGetToken(cell, tokens, file,settings)
				})
			})
		}
		if ("header" in document && document.header) {


			document.header.map((header: any[]) => {
				// @ts-ignore
				this.recusiveGetToken(header, tokens)
			})
		}
		// for list
		if ("items" in document && document.items) {
			document.items.map((item: any) => {
				this.recusiveGetToken(item, tokens, file,settings)
			})
		}

		// filter only document which is the most module

	}


}
