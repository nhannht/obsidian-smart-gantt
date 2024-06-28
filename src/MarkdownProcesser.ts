import {TFile} from "obsidian";
import {marked, Token} from "marked";
import SmartGanttPlugin from "../main";

export interface TokenWithFile {
	token: Token,
	file: TFile
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

	async parseAllFiles() {
		const pathFilterSettings = this._currentPlugin.settingManager.settings.pathListFilter
		this._files.map(async (file) => {
			if (pathFilterSettings.indexOf("AllFiles") !== -1) {
			} else if (pathFilterSettings.indexOf("CurrentFile") !== -1) {
				if (this._currentPlugin.app.workspace.getActiveFile()?.name !== file.name) return
			} else if (
				(pathFilterSettings.indexOf("AllFiles") !== -1) &&
				(pathFilterSettings.indexOf("CurrentFile") !== -1) &&
				(pathFilterSettings.indexOf(file.parent?.path!) !== -1)
			) return
			// console.log(file)
			await this.parseFilesAndUpdateTokens(file)
		})
	}

	private filterHTMLAndEmphasis(text: string) {
		const stripHTML = text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ""),
			stripEm1 = stripHTML.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1"),
			stripEm2 = stripEm1.replace(/_{1,3}(.*?)_{1,3}/g, "$1"),
			stripStrike = stripEm2.replace(/~{1,2}(.*?)~{1,2}/g, "$1"),
			stripLink = stripStrike.replace(/!?\[(.*?)]\((.*?)\)/g, "").replace(/!?\[\[(.*?)]]/g, "");

		return stripLink

	}

	private transformWithTaskPlugin(text: string) {
		const hourGlass = text.replace(/⏳/g, "due in "),
			airPlain = hourGlass.replace(/🛫/g, "start from "),
			heavyPlus = airPlain.replace(/➕/g, "created in "),
			checkMark = heavyPlus.replace(/✅/g, "done in "),
			crossMark = checkMark.replace(/❌/g, "cancelled in "),

			createdIn = crossMark.replace(/\[created::\s+(.*)]/g, "created in $1"),
			scheduledIn = createdIn.replace(/\[scheduled::\s+(.*)]/g, "scheduled in $1"),
			startFrom = scheduledIn.replace(/\[start::\s+(.*)]/g, "start from $1"),
			dueTo = startFrom.replace(/\[due::\s+(.*)]/g, "due to $1"),
			completionIn = dueTo.replace(/\[completion::\s+(.*)]/g, "completion in $1"),
			cancelledIn = completionIn.replace(/\[cancelled::\s(.*)]/g, "cancelled in $1 "),

			calendarMark = cancelledIn.replace("/📅/g", " to ")

		return calendarMark


	}

	private async parseFilesAndUpdateTokens(file: TFile) {
		if (!file) {
			return
		}
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)


		const fileContentStripHTML = this.filterHTMLAndEmphasis(fileContent)
		const taskPluginReplacer = this.transformWithTaskPlugin(fileContentStripHTML)


		// console.log(fileContentStripHTML)
		const lexerResult = marked.lexer(taskPluginReplacer);

		// console.log(lexerResult)


		lexerResult.map((token) => {

			this.recusiveGetToken(token, this._documents, file)
		})
		// filter token which is the smallest modulo


	}

	private recusiveGetToken(document: Token, tokens: TokenWithFile[], file: TFile) {
		const settings = this._currentPlugin.settingManager.settings
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
					file: file

				})
			}


		}
		if ("tokens" in document && document.tokens) {

			document.tokens.map((t) => {
				this.recusiveGetToken(t, tokens, file)
			})
			// table
		}
		if ("rows" in document && document.rows) {
			document.rows.map((row: any[]) => {
				row.map((cell) => {
					this.recusiveGetToken(cell, tokens, file)
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
				this.recusiveGetToken(item, tokens, file)
			})
		}

		// filter only document which is the most module

	}


}
