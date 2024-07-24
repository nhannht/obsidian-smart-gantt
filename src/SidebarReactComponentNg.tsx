import SmartGanttPlugin from "../main";
import {useLocalStorage, useMeasure} from "react-use";
import {SmartGanttSettings} from "./SettingManager";
import {useEffect, useState} from "react";
import MarkdownProcesser, {TokenWithFile} from "./MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResult} from "./TimelineExtractor";
import {Chrono} from "chrono-node";
import MermaidCrafter from "./MermaidCrafter";
import {loadMermaid, MarkdownView, TFile} from "obsidian";
import {JSX} from "react/jsx-runtime";
import {escapeRegExp} from "lodash";
import {ViewMode} from "gantt-task-react";

const SidebarReactComponentNg = (props: {
	thisPlugin: SmartGanttPlugin
}) => {

	const [resultWithChronoCount, setResultWithChronoCount] = useState(0)
	const [timelineResults, setTimelineResults] = useState<TimelineExtractorResult[]>([])
	const [craft, setCraft] = useState("")
	const [isSettingQ, setIsSettingQ] = useState(false)
	const [mermaidSvgRef, mermaidSvgRefMeasure] = useMeasure()
	const [appStyle,_setAppStyle] = useState(getComputedStyle(document.body))

	const countResultWithChrono = (results: TimelineExtractorResult[]) => {
		setResultWithChronoCount(0)
		results.forEach(r => {
			if (r.parsedResultsAndRawText.parsedResults) {
				setResultWithChronoCount(resultWithChronoCount + 1)

			}
		})


	}


	const [settings,
		saveSettings
	] =
		useLocalStorage<SmartGanttSettings>
		(`smart-gantt-sidebar-settings-${props.thisPlugin.app.vault.getName()}`,
			{
				doneShowQ: true,
				todoShowQ: true,
				pathListFilter: ["AllFiles"],
				leftBarChartDisplayQ:true,
				viewMode:ViewMode.Day
			})

	const [tempSettings, setTempSettings] = useState<SmartGanttSettings>(structuredClone(settings))

	async function extractedSentencesTokenFromFiles(allMarkdownFiles: TFile[]) {
		if (settings) {
			// console.log(settings)
			// let s = settings
			const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, props.thisPlugin)
			await markdownProcesser.parseAllFiles(settings)
			return markdownProcesser.documents;
		}
		return []
	}

	async function getResultsWithChrono(allSentences: TokenWithFile[] | any[]) {
		const timelineExtractor = new TimelineExtractor(new Chrono())
		return await timelineExtractor.GetTimelineDataFromDocumentArrayWithChrono(allSentences);
	}



	function initMermaid() {
		// console.log(appStyle.getPropertyValue("--text-normal"))

		loadMermaid()
			.then((mermaid: any) => {
				mermaid.initialize({
					// security: 'loose',
					startOnLoad: true,
					maxTextSize: 99999,
					theme: "forest",
					themeCSS:`
.grid .tick {
  stroke: lightgrey;
  opacity: 0.3;
  shape-rendering: crispEdges;
}


.taskText.clickable {
  fill: ${appStyle.getPropertyValue("--text-normal")} !important; 
  text-anchor: middle;
}

.taskTextOutsideRight.clickable  {
fill: ${appStyle.getPropertyValue("--text-normal")} !important;

}
.taskTextOutsideLeft.clickable {
  fill: ${appStyle.getPropertyValue("--text-normal")} !important ; 
  text-anchor: end;
}


.sectionTitle {
fill: ${appStyle.getPropertyValue("--text-muted")} !important;
}

text {
fill: ${appStyle.getPropertyValue("--text-normal")} !important;
}
					`,
				});
				mermaid.contentLoaded();
			})
	}


	const getAllParentPath = () => {
		if (props.thisPlugin) {
			let allParentPath: Set<string> = new Set()
			props.thisPlugin?.app.vault.getMarkdownFiles().forEach(r => {
				r.parent?.path ? allParentPath.add(r.parent.path) : null
			})
			return Array.from(allParentPath)
		}
		return []
	}


	useEffect(() => {
		const allMarkdownFiles = props.thisPlugin.app.vault.getMarkdownFiles();
		extractedSentencesTokenFromFiles(allMarkdownFiles).then((allSentences) => {
				getResultsWithChrono(allSentences).then((parsedResults) => {
					// console.log(parsedResult)
					countResultWithChrono(parsedResults)
					// console.log(resultWithChronoCount)
					setTimelineResults(parsedResults)
					// const timelineData = timelineExtractor.timelineData
					const mermaidCrafter = new MermaidCrafter(props.thisPlugin)
					setCraft(mermaidCrafter.craftMermaid(parsedResults))
					// console.log(craft)
					// console.log(settings)
					// console.log(craft)
				})
			}
		)
		// console.log(allSentences)


	}, [settings]);
	const statusCheckboxFilterPanel = <div>
		<div>
			<input
				className={"cursor-pointer"}
				onChange={(e) => {
					if (e.target.checked) {
						setTempSettings(({...tempSettings,todoShowQ:true}))
					} else {
						setTempSettings({...tempSettings,todoShowQ:false})
					}
				}}
				type={"checkbox"} id={"smart-gantt-sidebar-todoq"}
				checked={tempSettings.todoShowQ}

			/>
			<label htmlFor={"smart-gantt-sidebar-todoq"}>TodoQ</label>
		</div>
		<div>
			<input
				className={"cursor-pointer"}
				onChange={(e) => {
					if (e.target.checked) {
						setTempSettings({...tempSettings,doneShowQ:true})
					} else {
						setTempSettings({...tempSettings,doneShowQ:false})
					}
				}}
				type={"checkbox"} id={"smart-gantt-sidebar-doneq"}
				checked={tempSettings.doneShowQ}
			/>
			<label htmlFor={"smart-gantt-sidebar-doneq"}>Done</label>
		</div>
	</div>


	const settingsViewButtonPanel = () => {
		if (isSettingQ) {
			return <div
				className={"flex flex-row justify-around items-center"}
			>
				<div
					className={"cursor-pointer"}
					onClick={() => {
						saveSettings(tempSettings)
						setIsSettingQ(false)
						props.thisPlugin.helper.reloadView()
					}}
				>Save
				</div>
				<div

					className={"cursor-pointer"}
					onClick={() => {
						setIsSettingQ(false)
						// props.thisPlugin.helper.reloadView()
					}}
				>Cancel
				</div>
				{statusCheckboxFilterPanel}

			</div>
		} else {
			return (
				<div className={"flex flex-row  justify-around"}>
					<div
						className={"cursor-pointer"}
						onClick={() => {
							setIsSettingQ(true)
						}}
					>
						Settings
					</div>
					<div className={"cursor-pointer"}
						 onClick={async () => {
							 await props.thisPlugin.helper.reloadView()
						 }}
					>
						Reload
					</div>
				</div>
			)
		}
	}

	const customPathListCheckboxs = <div
		hidden={
			tempSettings.pathListFilter.indexOf("AllFiles") !== -1 ||
			tempSettings.pathListFilter.indexOf("CurrentFile") !== -1
		}
	>
		{getAllParentPath().map((path, pathIndex) => {
			return <div
				key={path}
			>
				<input
					onChange={(e) => {
						const temp: SmartGanttSettings = structuredClone(tempSettings)
						if (e.target instanceof HTMLInputElement && e.target.checked) {
							temp.pathListFilter.push(path)
							setTempSettings(temp)
						} else {
							temp.pathListFilter.remove(path)
							setTempSettings(temp)
						}
					}}
					type={"checkbox"}
					id={`pathFilterRadioGanttBlock-${pathIndex}`}
					checked={tempSettings.pathListFilter.indexOf(path) !== -1}
				></input>
				<label htmlFor={`pathFilterRadioGanttBlock-${pathIndex}`}>{path}</label>
			</div>
		})}
	</div>;


	const pathFilterSettingsPanel = () => {
		return <div className={"flex flex-row justify-around"}>
			<div>
				<input type={"radio"} id={"smart-gantt-sidebar-radio-all-files-settings"}
					   name={"smart-gantt-sidebar-radio-filter-path"}
					   onChange={(e) => {
						   if (e.target.checked) {
							   setTempSettings({...tempSettings,pathListFilter:["AllFiles"]})
						   }
					   }}
					   checked={tempSettings?.pathListFilter.indexOf("AllFiles") !== -1}
				></input>
				<label htmlFor={"smart-gantt-sidebar-radio-all-files-settings"}>All Files</label>
			</div>

			<div>
				<input type={"radio"} id={"smart-gantt-sidebar-radio-current-file-settings"}
					   name={"smart-gantt-sidebar-radio-filter-path"}
					   onChange={(e) => {
						   if (e.target.checked) {
							   setTempSettings({...tempSettings,pathListFilter:["CurrentFile"]})
						   }
					   }}
					   checked={tempSettings?.pathListFilter.indexOf("CurrentFile") !== -1}
				></input>
				<label htmlFor={"smart-gantt-sidebar-radio-current-file-settings"}>Current File</label>
			</div>

			<div>
				<input type={"radio"} id={"smart-gantt-sidebar-radio-custom-path-settings"}
					   name={"smart-gantt-sidebar-radio-filter-path"}
					   onChange={(e) => {
						   if (e.target.checked) {
							   setTempSettings({...tempSettings,pathListFilter:[]})
						   }
					   }}
					   checked={tempSettings?.pathListFilter.indexOf("CurrentFile") === -1 &&
						   tempSettings?.pathListFilter.indexOf("AllFiles") === -1}
				></input>
				<label htmlFor={"smart-gantt-sidebar-radio-custom-path-settings"}>Custom Directory</label>
			</div>
		</div>
	}

	const settingView = () => {
		return <>
			{/*<div>hello world</div>*/}
			{pathFilterSettingsPanel()}
			{customPathListCheckboxs}

		</>
	}

	async function searchAndJumpToTask(text: string, file: TFile) {
		const leaf = props.thisPlugin.app.workspace.getLeaf(false);
		await leaf.openFile(file)
		const view = leaf.view as MarkdownView
		const fileContent = await props.thisPlugin.app.vault.read(file)
		const regex = new RegExp(escapeRegExp(text))
		const lines = fileContent.split("\n")
		// console.log(smartGanttTask.getText())
		// console.log(lines)
		for (let i = 0; i < lines.length; i++) {
			const match = lines[i].trim().search(regex)
			// console.log(match)
			if (match !== -1) {
				// console.log(lines[i])
				view.editor.setCursor({
					line: i,
					ch: 0
				})
				view.editor.setSelection({
						line: i,
						ch: match
					},
					{
						line: i,
						ch: match + text.length
					})
				view.editor.scrollTo(i)
				break
			}

		}
	}

	async function switchCheckBoxHandler(timelineR: TimelineExtractorResult, _index: number, checkbox: HTMLInputElement) {
		// console.log(text)
		// console.log(file)
		if (checkbox.checked) {

			// console.log(taskRawText)
			const taskRawTextSwitch = timelineR.token.raw.replace("[ ]", "[x]")

			let fileContent = await props.thisPlugin.app.vault.read(timelineR.file)
			await props.thisPlugin.app.vault.modify(timelineR.file, fileContent.replace(timelineR.token.raw.trim(), taskRawTextSwitch.trim()))


		} else if (!checkbox.checked) {
			// console.log(taskRawText)
			const taskRawTextSwitch = timelineR.token.raw.replace("[x]", "[ ]")
			// console.log(taskRawTextSwitch)

			let fileContent = await props.thisPlugin.app.vault.read(timelineR.file)
			// console.log(fileContent)
			await props.thisPlugin.app.vault.modify(timelineR.file, fileContent.replace(timelineR.token.raw.trim(), taskRawTextSwitch.trim()))


		}
		props.thisPlugin.helper.reloadView()


	}

	const listTaskView = () => {
		// console.log(timelineResults)
		let o: JSX.Element[] = []
		timelineResults.forEach((timelineR, timelineRIndex) => {
			if (timelineR.parsedResultsAndRawText.parsedResults) {
				timelineR.parsedResultsAndRawText.parsedResults.forEach((_r, rIndex) => {
					o.push(
						<div key={`smart-gantt-sidebar-task-list-${timelineRIndex}-${rIndex}`}>
							<input
								onChange={async (e) => {
									await switchCheckBoxHandler(timelineR, timelineRIndex, e.target)
								}}
								type={"checkbox"} id={`smart-gantt-sidebar-task-list-${timelineRIndex}-${rIndex}`}
								//@ts-ignore
								checked={timelineResults[timelineRIndex].token.checked}

							></input>

							<label
								onClick={async (e) => {
									e.preventDefault()
									await searchAndJumpToTask(timelineR.parsedResultsAndRawText.rawText, timelineR.file)

								}}
								htmlFor={`smart-gantt-sidebar-task-list-${timelineRIndex}-${rIndex}`}>{timelineR.parsedResultsAndRawText.rawText}</label>
						</div>
					)
				})
			} else {
				o.push(
					<div key={`smart-gantt-sidebar-task-list-${timelineRIndex}`}>
						<input
							onChange={async (e) => {
								await switchCheckBoxHandler(timelineR, timelineRIndex, e.target)
							}}
							type={"checkbox"} id={`smart-gantt-sidebar-task-list-${timelineRIndex}`}
							//@ts-ignore
							checked={timelineResults[timelineRIndex].token.checked}
						></input>
						<label
							onClick={async (e) => {
								e.preventDefault()
								await searchAndJumpToTask(timelineR.parsedResultsAndRawText.rawText, timelineR.file)
							}}
							htmlFor={`smart-gantt-sidebar-task-list-${timelineRIndex}`}>{timelineR.parsedResultsAndRawText.rawText}</label>
					</div>
				)
			}
		})
		return o

	}


	const mermaidSvgComponent = () => {
		return (
			// @ts-ignore
			<main ref={mermaidSvgRef}>
				{
					mermaidSvgRefMeasure.width > 0
						? <pre className={"mermaid"} id={"mermaidHolder"}>{craft}</pre> : <></>
				}
			</main>
		)
	}

	const mainComponent = () => {
		initMermaid()
		if (isSettingQ) {
			return settingView()
		} else {
			return <main
				onContextMenu={() => {
					setIsSettingQ(true)
				}}>
				{mermaidSvgComponent()}
				{listTaskView()}

			</main>
		}
	}


	return <div className={"h-screen"}>
		{/*<button onClick={()=>setCount(count + 1)}>click</button>*/}
		{/*<div>{count}</div>*/}
		{mainComponent()}
		<div
			className={" fixed p-2  bottom-8 left-1/2 w-[360px] max-w-[92%] z-50 -translate-x-1/2 rounded-xl bg-[--text-normal] text-[--background-primary] mb-safe mb-5  backdrop-blur-lg"}
		>
			{settingsViewButtonPanel()}

		</div>
	</div>


}

export default SidebarReactComponentNg
