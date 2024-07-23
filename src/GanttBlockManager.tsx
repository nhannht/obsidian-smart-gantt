import SmartGanttPlugin from "../main";
import {createRoot} from "react-dom/client";
import {AppContext} from "./AppContext";
import {SmartGanttSettings} from "./SettingManager";
import {SmartGanttBlockReactComponent} from "./SmartGanttBlockReactComponent";
import {SmartGanttBlockReactComponentNg} from "./SmartGanttBlockReactComponentNg";
// import {StrictMode} from "react";



export default class GanttBlockManager {
	constructor(public thisPlugin: SmartGanttPlugin) {
	}

	async registerGanttBlockNg() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt-ng", async (source, el, ctx) => {
			const settings: SmartGanttSettings = source.trim() !== "" ? JSON.parse(source) : {
				doneShowQ: true,
				todoShowQ: true,
				pathListFilter: ["CurrentFile"]
			}



			let root = el.createEl("div", {
				cls: "root"
			})
			let reactRoot = createRoot(root)
			reactRoot.render(
				// <StrictMode>
					<AppContext.Provider value={this.thisPlugin}>
						<SmartGanttBlockReactComponentNg
							src={source}
							ctx={ctx}
							thisPlugin={this.thisPlugin}
							settings={settings}
						/>

					</AppContext.Provider>
				// </StrictMode>
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
				<AppContext.Provider value={{
					app: this.thisPlugin.app,
				}}>
					<SmartGanttBlockReactComponent
						src={source}
						ctx={_ctx}
						thisPlugin={this.thisPlugin}
						settings={settings}

					/>
				</AppContext.Provider>
			)
		})

	}

}
