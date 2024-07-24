import SmartGanttPlugin from "../main";
import {createRoot} from "react-dom/client";
import {SmartGanttSettings} from "./SettingManager";
import {SmartGanttBlockReactComponent} from "./SmartGanttBlockReactComponent";
import {SmartGanttBlockReactComponentNg} from "./SmartGanttBlockReactComponentNg";
import {StrictMode} from "react";
import {ViewMode} from "gantt-task-react";



export default class GanttBlockManager {
	constructor(public thisPlugin: SmartGanttPlugin) {
	}

	async registerGanttBlockNg() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt-ng", async (source, el, ctx) => {
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


	async registerGanttBlock() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt", async (source, el, _ctx) => {
			//@ts-ignore
			// console.log(_ctx.getSectionInfo(_ctx.el))
			// console.log(source)
			const settings: SmartGanttSettings = source.trim() !== "" ? JSON.parse(source) : {
				doneShowQ: true,
				todoShowQ: true,
				pathListFilter: ["AllFiles"]
			}
			// console.log(settings)
			// console.log(allSentences)

			let root = el.createEl("div", {
				cls: "root"
			})
			let reactRoot = createRoot(root)
			reactRoot.render(

					<SmartGanttBlockReactComponent
						src={source}
						ctx={_ctx}
						thisPlugin={this.thisPlugin}
						settings={settings}

					/>
			)
		})

	}

}
