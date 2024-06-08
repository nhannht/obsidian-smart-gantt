import {SmartGanttParsesResult} from "./TimelineExtractor";
import * as AES from "crypto-js/aes";
import SmartGanttPlugin from "../main";

export default class MermaidCrafter {
	private _thisPlugin: SmartGanttPlugin;
	get thisPlugin(): SmartGanttPlugin {
		return this._thisPlugin;
	}

	set thisPlugin(value: SmartGanttPlugin) {
		this._thisPlugin = value;
	}

	constructor(thisPlugin: SmartGanttPlugin) {
		this._thisPlugin = thisPlugin;
	}

	craftMermaid(results: SmartGanttParsesResult[]) {
		let craft = ""
		craft += "gantt\n"
		// craft += "title Gantt diagram\n"
		craft += "dateFormat YYYY-MM-DD\n"
		let taskIdMap = new Map();

		results.forEach(result => {
			craft += `\tsection ${result.file.basename}\n`
			if (result.parsedResults){
							result.parsedResults.forEach(parseResult => {
				const startDateString = parseResult.start.date().toDateString()
				const taskId = AES.encrypt(parseResult.start.date().toDateString(), "secret")
				taskIdMap.set(taskId, {
					file: result.file.basename,
					vault: result.file.vault.getName()
				})
				let checked = false
				if ("checked" in result.token) {
					 checked = result.token.checked
				}

				let diff = 1
				if (parseResult.end) {
					diff = Math.round(Math.abs(parseResult.end.date().getTime() - parseResult.start.date().getTime()) / 86400000)
				}

				if ("text" in result.token) {
					let text = result.token.text.trim().split("\n")[0]
					text = text.replace(parseResult.text, "").trim()
					text = text.replace(":","🐱")
					craft += `\t\t${text}:\t ${checked? "done ," : "active ,"}  ${taskId},${startDateString}, ${diff}d\n`
				}
			})

			}

		})

		taskIdMap.forEach((value, key) => {
			const urlWhenClick = encodeURI("obsidian://open?vault=" + value.vault + "&file=" + value.file)
			craft += `\tclick ${key} href "${urlWhenClick}"\n`
		})
		return craft

	}

}
