import SmartGanttPlugin from "../main";
import {createRoot} from "react-dom/client";
import {AppContext} from "./AppContext";
import {SmartGanttSettings} from "./SettingManager";
import {SmartGanttBlockReactComponent} from "./SmartGanttBlockReactComponent";

export default class GanttBlockManager {
	constructor(private thisPlugin: SmartGanttPlugin) {
	}


	async registerGanttBlock() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt", async (source, el, _ctx) => {
			//@ts-ignore
			// console.log(_ctx.getSectionInfo(_ctx.el))
			const settings: SmartGanttSettings = JSON.parse(source)
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
