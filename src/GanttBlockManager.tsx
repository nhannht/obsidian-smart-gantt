import SmartGanttPlugin from "../main";
import MarkdownProcesser from "./MarkdownProcesser";
import TimelineExtractor from "./TimelineExtractor";
import {Chrono} from "chrono-node";
import MermaidCrafter from "./MermaidCrafter";
import {createRoot} from "react-dom/client";
import {AppContext} from "./AppContext";
import {SmartGanttMainReactComponent} from "./SmartGanttMainReactComponent";
import {SmartGanttSettings} from "./SettingManager";

export default class GanttBlockManager {
	constructor(private thisPlugin: SmartGanttPlugin) {
	}


	async registerGanttBlock() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("gantt", async (source, el, _ctx) => {
			console.log(_ctx.getSectionInfo(_ctx.el))
			const settings:SmartGanttSettings = JSON.parse(source)
			console.log(settings)
			const allMarkdownFiles = this.thisPlugin.app.vault.getMarkdownFiles();
			const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, this.thisPlugin)
			await markdownProcesser.parseAllFiles(settings)
			const allSentences = markdownProcesser.documents
			// console.log(allSentences)
			const timelineExtractor = new TimelineExtractor(new Chrono())
			const parsedResult = await timelineExtractor.GetTimelineDataFromDocumentArrayWithChrono(allSentences)
			// console.log(parsedResult)
			// const timelineData = timelineExtractor.timelineData
			const mermaidCrafter = new MermaidCrafter(this.thisPlugin)
			const craft = mermaidCrafter.craftMermaid(parsedResult)
			// console.log(craft)

			// console.log(timelineData)
			// console.log(mermaidCrafter.timelineData)
			// console.log(allSentencesWithTask)

			let root = el.createEl("div", {
				cls: "root"
			})
			let reactRoot = createRoot(root)
			reactRoot.render(
				<AppContext.Provider value={{
					app: this.thisPlugin.app,
				}}>
					<SmartGanttMainReactComponent mermaidCraft={craft}/>
				</AppContext.Provider>
			)
		})

	}

}
