import {Plugin, WorkspaceLeaf} from 'obsidian';
import SmartGanttReactView from "./src/SmartGanttReactView";
import {createRoot} from "react-dom/client";
import {AppContext} from "./src/AppContext";
import {SmartGanttMainReactComponent} from "./src/SmartGanttMainReactComponent";
import MarkdownProcesser from "./src/MarkdownProcesser";
import {Chrono} from "chrono-node";
import TimelineExtractor from "./src/TimelineExtractor";
import MermaidCrafter from "./src/MermaidCrafter";
import {Helper} from "./src/Helper";

// const DEFAULT_SETTINGS: SmartGanttSettings = {
// 	mySetting: 'default'
// }

export default class SmartGanttPlugin extends Plugin {
	// settingManager = new SettingManager(this,DEFAULT_SETTINGS);
	public helper = new Helper(this)



	override async onload() {
		// await this.settingManager.loadSettings()
		this.addCommand({
			id: 'smart-gantt-reload',
			name: 'Reload',
			callback: ()=>{
				this.helper.reloadView()
			}
		})


		this.registerView("smart-gantt", (leaf) => {
			return new SmartGanttReactView(leaf,this);
		})

		this.addRibbonIcon('gantt-chart', 'Smart Gantt', () => {

			let leafs = this.app.workspace.getLeavesOfType("smart-gantt");
			if (leafs.length > 0) {
				// this.app.workspace.detachLeavesOfType("smart-gantt")
				let leaf = leafs[0];
				if (this.app.workspace.rightSplit.collapsed){
					this.app.workspace.revealLeaf(leaf)
				} else {
					this.app.workspace.rightSplit.collapse()
				}
			} else {
				let leaf = this.app.workspace.getRightLeaf(false);

				leaf?.setViewState({
					type: "smart-gantt",
					active: true
				})
				if (leaf instanceof WorkspaceLeaf) {
					this.app.workspace.revealLeaf(leaf);
				}
			}

		})

		this.registerMarkdownCodeBlockProcessor("gantt", async    (_source, el, _ctx) => {
			const allMarkdownFiles = this.app.vault.getMarkdownFiles();
			const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, this)
			await markdownProcesser.parseAllFiles()
			const allSentences = markdownProcesser.documents
			// console.log(allSentences)
			const timelineExtractor = new TimelineExtractor(new Chrono())
			const parsedResult = await timelineExtractor.GetTimelineDataFromDocumentArrayWithChrono(allSentences)
			// console.log(parsedResult)
			// const timelineData = timelineExtractor.timelineData
			const mermaidCrafter = new MermaidCrafter(this)
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
					app: this.app,
				}}>
					<SmartGanttMainReactComponent mermaidCraft={craft}/>
				</AppContext.Provider>
			)
		})


		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	override onunload() {
		// this.app.workspace.detachLeavesOfType("gantt-chart")

	}


}


// class SampleSettingTab extends PluginSettingTab {
// 	plugin: SmartGanttPlugin;
//
// 	constructor(app: App, plugin: SmartGanttPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}
//
// 	display(): void {
// 		const {containerEl} = this;
//
// 		containerEl.empty();
//
// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settingManager.settings.mySetting)
// 				.onChange(async (value) => {
// 					this.plugin.settingManager.settings.mySetting = value;
// 					await this.plugin.settingManager.saveSettings(this.plugin.settingManager.settings)
// 				}));
// 	}
// }
