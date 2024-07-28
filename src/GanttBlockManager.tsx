import SmartGanttPlugin from "../main";
import {createRoot} from "react-dom/client";
import {SmartGanttSettings} from "./SettingManager";
import {SmartGanttBlockReactComponentNg} from "./BlockComponent/SmartGanttBlockReactComponentNg";
import {StrictMode} from "react";
import {ViewMode} from "gantt-task-react";
import {TaskListMdBlock} from "@/BlockComponent/TaskListMdBlock";
import {AppContext} from "@/lib/AppContext";



export default class GanttBlockManager {
	constructor(public thisPlugin: SmartGanttPlugin) {
	}

	async registerGanttBlockNg() {
		// this.thisPlugin.registerEvent(this.thisPlugin.app.vault.on('modify',(file) =>{
		// 	console.log(file)
		// }))

		this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt", async (source, el, ctx) => {
			const settings: SmartGanttSettings = source.trim() !== "" ? JSON.parse(source) : {
				doneShowQ: true,
				todoShowQ: true,
				pathListFilter: ["CurrentFile"],
				viewMode:ViewMode.Day,
				leftBarChartDisplayQ:true
			}

			let root = el.createEl("div", {
				cls: "root"
			})
			let reactRoot = createRoot(root)
			reactRoot.render(
				<StrictMode>
						<SmartGanttBlockReactComponentNg
							src={source}
							ctx={ctx}
							thisPlugin={this.thisPlugin}
							settings={settings}
						/>
				 </StrictMode>
			)
		})
	}

	async registerTaskListBlock() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt-list", async (source, el, _ctx) => {
			//@ts-ignore
			// console.log(_ctx.getSectionInfo(_ctx.el))
			// console.log(source)
			const settings: SmartGanttSettings = source.trim() !== "" ? JSON.parse(source) : {
				doneShowQ: true,
				todoShowQ: true,
				pathListFilter: ["CurrentFile"]
			}
			// console.log(settings)
			// console.log(allSentences)

			let root = el.createEl("div", {
				cls: "root"
			})
			let reactRoot = createRoot(root)
			reactRoot.render(
				<StrictMode>
					<AppContext.Provider value={this.thisPlugin.app}>
						<TaskListMdBlock
							ctx={_ctx}
							src={source}
							thisPlugin={this.thisPlugin}
							settings={settings}/>
					</AppContext.Provider>
				</StrictMode>

			)
		})

	}

	// async registerGanttBlock() {
	// 	this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt", async (source, el, _ctx) => {
	// 		//@ts-ignore
	// 		// console.log(_ctx.getSectionInfo(_ctx.el))
	// 		// console.log(source)
	// 		const settings: SmartGanttSettings = source.trim() !== "" ? JSON.parse(source) : {
	// 			doneShowQ: true,
	// 			todoShowQ: true,
	// 			pathListFilter: ["AllFiles"]
	// 		}
	// 		// console.log(settings)
	// 		// console.log(allSentences)
	//
	// 		let root = el.createEl("div", {
	// 			cls: "root"
	// 		})
	// 		let reactRoot = createRoot(root)
	// 		reactRoot.render(
	//
	// 				<SmartGanttBlockReactComponent
	// 					src={source}
	// 					ctx={_ctx}
	// 					thisPlugin={this.thisPlugin}
	// 					settings={settings}
	//
	// 				/>
	// 		)
	// 	})
	//
	// }

}
