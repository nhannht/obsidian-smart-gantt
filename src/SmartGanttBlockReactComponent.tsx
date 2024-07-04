import {useEffect, useState} from "react";
import {loadMermaid, MarkdownPostProcessorContext} from "obsidian";
import SmartGanttPlugin from "../main";
import {SmartGanttSettings} from "./SettingManager";
import MarkdownProcesser from "./MarkdownProcesser";
import TimelineExtractor, {TimelineExtractorResult} from "./TimelineExtractor";
import {Chrono} from "chrono-node";
import MermaidCrafter from "./MermaidCrafter";


export const SmartGanttBlockReactComponent = (props: {
	ctx: MarkdownPostProcessorContext,
	src: string,
	thisPlugin: SmartGanttPlugin,
	settings: SmartGanttSettings
}) => {
	const [internalSettings, setInternalSettings] =
		useState<SmartGanttSettings>(structuredClone(props.settings))
	const [isSettingQ, setIsSettingQ] = useState(false)
	const [craft, setCraft] = useState("")
	const [resultWithChronoCount, setResultWithChronoCount] = useState(0)
	const [timelineResults, setTimelineResults] = useState<TimelineExtractorResult[]>([])

	const countResultWithChrono = (results: TimelineExtractorResult[]) => {
		setResultWithChronoCount(0)
		results.forEach(r => {
			if (r.parsedResultsAndRawText.parsedResults) {
				setResultWithChronoCount(resultWithChronoCount + 1)

			}
		})

	}

	const updateBlockSettingWithInternalSetting = (settingObject: SmartGanttSettings,
												   context: MarkdownPostProcessorContext) => {

		const sourcePath = context.sourcePath
		//@ts-ignore
		const elInfo = context.getSectionInfo(context.el)
		// console.log(elInfo)
		if (elInfo) {
			// console.log(elInfo.text)
			let linesFromFile = elInfo.text.split(/(.*?\n)/g)
			linesFromFile.forEach((e, i) => {
				if (e === "") linesFromFile.splice(i, 1)
			})
			// console.log(linesFromFile)
			linesFromFile.splice(elInfo.lineStart + 1,
				elInfo.lineEnd - elInfo.lineStart - 1,
				JSON.stringify(settingObject, null, "\t"), "\n")
			// console.log(linesFromFile)
			const newSettingsString = linesFromFile.join("")
			const file = props.thisPlugin.app.vault.getFileByPath(sourcePath)
			if (file) {
				props.thisPlugin.app.vault.modify(file, newSettingsString)
			}
		}

	}


	useEffect(() => {
		(async () => {
			const allMarkdownFiles = props.thisPlugin.app.vault.getMarkdownFiles();
			const markdownProcesser = new MarkdownProcesser(allMarkdownFiles, props.thisPlugin)
			await markdownProcesser.parseAllFiles(internalSettings)
			const allSentences = markdownProcesser.documents
			// console.log(allSentences)
			const timelineExtractor = new TimelineExtractor(new Chrono())
			const parsedResults = await timelineExtractor.GetTimelineDataFromDocumentArrayWithChrono(allSentences)
			// console.log(parsedResult)
			countResultWithChrono(parsedResults)
			// console.log(resultWithChronoCount)
			setTimelineResults(parsedResults)
			// const timelineData = timelineExtractor.timelineData
			const mermaidCrafter = new MermaidCrafter(props.thisPlugin)
			setCraft(mermaidCrafter.craftMermaid(parsedResults))
			// updateBlockSettingWithInternalSetting(internalSettings, props.ctx)

		})()
	}, [internalSettings]);


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

	let mainComponent = <></>

	const allFileFilterRadio = <div><input
		onChange={(e) => {
			if (e.target.checked) {
				let tempSetting: SmartGanttSettings = structuredClone(internalSettings)
				tempSetting.pathListFilter = ["AllFiles"]
				setInternalSettings(tempSetting)
			}
		}}
		name={"pathFilterRadio"}
		type={"radio"}
		id={"allFiles"}
		checked={internalSettings.pathListFilter.indexOf("AllFiles") !== -1}
	></input>
		<label htmlFor={"allFiles"}>All files</label></div>;
	const currentFileFilterRadio = <div>
		<input
			onChange={(e) => {
				if (e.target.checked) {
					let tempSetting: SmartGanttSettings = structuredClone(internalSettings)
					tempSetting.pathListFilter = ["CurrentFile"]
					setInternalSettings(tempSetting)
				}
			}}
			name={"pathFilterRadio"} type={"radio"} id={"currentFile"}
			checked={internalSettings.pathListFilter.indexOf("CurrentFile") !== -1}
		>

		</input>
		<label htmlFor={"currentFile"}>Current file</label></div>;

	const customPathFilterRadio = <div><input
		onChange={(e) => {
			if (e.target.checked) {
				const temp: SmartGanttSettings = structuredClone(internalSettings)
				temp.pathListFilter = []
				setInternalSettings(temp)
			}

		}}
		name={"pathFilterRadio"} type={"radio"} id={"customPath"}
		checked={internalSettings.pathListFilter.indexOf("AllFiles") === -1 &&
			internalSettings.pathListFilter.indexOf("CurrentFile") === -1
		}>

	</input>
		<label htmlFor={"customPath"}>Custom path</label>
	</div>;
	const customPathListCheckboxs = <div
		hidden={
			internalSettings.pathListFilter.indexOf("AllFiles") !== -1 ||
			internalSettings.pathListFilter.indexOf("CurrentFile") !== -1
		}
	>
		{getAllParentPath().map((path, pathIndex) => {
			return <div
				key={path}
			>
				<input
					onChange={(e) => {
						const temp: SmartGanttSettings = structuredClone(internalSettings)
						if (e.target instanceof HTMLInputElement && e.target.checked) {
							temp.pathListFilter.push(path)
							setInternalSettings(temp)
						} else {
							temp.pathListFilter.remove(path)
							setInternalSettings(temp)
						}
					}}
					type={"checkbox"}
					id={`pathFilterRadioGanttBlock-${pathIndex}`}
					checked={internalSettings.pathListFilter.indexOf(path) !== -1}
				></input>
				<label htmlFor={`pathFilterRadioGanttBlock-${pathIndex}`}>{path}</label>
			</div>
		})}
	</div>;
	const filterBaseOnStatusCheckbox = <div
		className={"flex flex-col"}
	>
		<div>
			<input
				onChange={(e) => {
					let temp: SmartGanttSettings = structuredClone(internalSettings)
					temp.todoShowQ = e.target.checked;
					setInternalSettings(temp)

				}}
				type={"checkbox"} id={"TodoQ"}
				checked={internalSettings.todoShowQ}

			></input>
			<label htmlFor={"TodoQ"}>Todo</label>
		</div>
		<div>
			<input
				onChange={(e) => {
					let temp: SmartGanttSettings = structuredClone(internalSettings)
					temp.doneShowQ = e.target.checked;
					setInternalSettings(temp)
				}}
				type={"checkbox"} id={"DoneQ"}
				checked={internalSettings.doneShowQ}

			></input>
			<label htmlFor={"DoneQ"}>Done</label>
		</div>
	</div>;


	let mermaidComponent = <></>
	if (resultWithChronoCount === 0) {
		// console.log(timelineResults)
		let taskStrings: string[] = []
		timelineResults.forEach(r => {
			taskStrings.push(r.token.raw)
		})

		mermaidComponent = <>We don't have any tasks that can extract time to plot
			<br/>
			{
				taskStrings.length !== 0 ?
					<> Current we have these task
						<br/>
						{
							taskStrings.join("\n")
						}
					</> :
					<>There is no line with checkbox in target files</>
			}
		</>
	} else {
		mermaidComponent = <pre className={"mermaid"}>
				{craft}
			</pre>

	}


	let settingButton = <button/>
	if (isSettingQ) {
		settingButton = <button
			onClick={() => {
				setIsSettingQ(!isSettingQ)
				updateBlockSettingWithInternalSetting(internalSettings, props.ctx)
			}}
		>
			Save
		</button>
	} else {
		settingButton = <button
			onClick={() => {
				setIsSettingQ(!isSettingQ)
			}}
		>
			Settings
		</button>
	}

	const cancelButton = <button
		onClick={() => {
			setIsSettingQ(false)
		}}>
		Cancel
	</button>

	const buttonsPanel = <div className={"flex flex-row justify-around p-2"}>
		{settingButton}
		{isSettingQ ? cancelButton : null}
	</div>

	const settingView = <>
		{buttonsPanel}
		<div className={"flex flex-row justify-around items-center"}>
			{allFileFilterRadio}
			{currentFileFilterRadio}
			{customPathFilterRadio}
			{filterBaseOnStatusCheckbox}
		</div>

		{customPathListCheckboxs}

	</>

	if (isSettingQ) {
		mainComponent = <main>
			{settingView}
		</main>
	} else {
		loadMermaid()
			.then(mermaid => {
				mermaid.initialize({
					startOnLoad: true,
					maxTextSize: 99999999,
				});
				mermaid.contentLoaded();
			})

		mainComponent = <main
			onContextMenu={() => {
				setIsSettingQ(true)
			}}
		>
			{mermaidComponent}
		</main>
	}

	return <>
		{mainComponent}
	</>
};
