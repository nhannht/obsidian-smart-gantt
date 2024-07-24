import {SmartGanttSettings} from "./SettingManager";
import {useState} from "react";
// import {usePlugin} from "./ReactContext";
import {Checkbox} from "@/component/Checkbox";
import {Label} from "@/component/Label";
import {RadioGroup, RadioGroupItem} from "@/component/RadioGroup";
import SmartGanttPlugin from "../main";
import {ScrollArea} from "@/component/ScrollableList";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/component/Select";
import {ViewMode} from "gantt-task-react";
import {Button} from "@/component/Button";



const SettingViewComponent = (props: {
	inputS: SmartGanttSettings,
	saveSettings: (s: SmartGanttSettings) => void,
	isSettingsQ: boolean,
	isSettingsQHandle: (b: boolean) => void,
	updateBlockSettingHandle: (s: SmartGanttSettings) => void,
	thisPlugin: SmartGanttPlugin

}) => {

	const [s, setS] = useState<SmartGanttSettings>(structuredClone(props.inputS))
	// const thisPlugin = usePlugin()

	const allFileFilterRadio = <div className={"flex items-center space-x-2"}>
		<RadioGroupItem

			id={"allFiles"}
			value={"AllFiles"}
			checked={s.pathListFilter.indexOf("AllFiles") !== -1}
		></RadioGroupItem>
		<Label htmlFor={"allFiles"}>All files</Label></div>;

	const currentFileFilterRadio = <div className={"flex items-center space-x-2"}>
		<RadioGroupItem

			id={"currentFile"}
			value={"CurrentFile"}
			checked={s.pathListFilter.indexOf("CurrentFile") !== -1}
		>

		</RadioGroupItem>
		<Label htmlFor={"currentFile"}>Current file</Label></div>;
	const customPathFilterRadio = <div className={"flex items-center space-x-2"}>
		<RadioGroupItem

			value={"CustomPath"}
			id={"customPath"}
			checked={s.pathListFilter.indexOf("AllFiles") === -1 &&
				s.pathListFilter.indexOf("CurrentFile") === -1
			}>

		</RadioGroupItem>
		<Label htmlFor={"customPath"}>Custom path</Label>
	</div>;
	const customPathListCheckboxs = <div
		className={"flex justify-center"}
		hidden={
			s.pathListFilter.indexOf("AllFiles") !== -1 ||
			s.pathListFilter.indexOf("CurrentFile") !== -1
		}
	>
		<ScrollArea className={"h-72 w-48 rounded-md m-2"}>
			<div className={" space-y-2 px-4"}>
				<div className={"mb-4 text-sm font-medium leading-none sticky top-0 bg-gray-200 p-2"}>List of
					directories
				</div>

				{props.thisPlugin.helper.getAllParentPath().map((path: string, pathIndex: number) => {
					// console.log(path)
					return <div
						className={"flex items-center space-x-2"}
						key={path}
					>
						<Checkbox
							onCheckedChange={(e) => {
								let paths = {...s}.pathListFilter
								// console.log(paths)
								if (Boolean(e)) {
									paths.push(path)
									setS({...s, pathListFilter: paths})
								} else {
									paths.remove(path)
									setS({...s, pathListFilter: paths})
								}
							}}
							id={`pathFilterRadioGanttBlock-${pathIndex}`}
							checked={s.pathListFilter.indexOf(path) !== -1}
						></Checkbox>
						<Label htmlFor={`pathFilterRadioGanttBlock-${pathIndex}`}>{path}</Label>
					</div>
				})}</div>
		</ScrollArea>
	</div>;


	const filterBaseOnStatusCheckbox = <div
		className={"flex flex-col space-y-2"}
	>
		<div className={"flex items-center space-x-2"}>
			<Checkbox
				onCheckedChange={(e) => {
					setS({...s, todoShowQ: Boolean(e)})

				}}
				id={"TodoQ"}
				checked={s.todoShowQ}

			></Checkbox>
			<Label
				htmlFor={"TodoQ"}>Todo</Label>
		</div>
		<div className={"space-x-2"}>
			<Checkbox
				onCheckedChange={(e) => {
					setS({...s, doneShowQ: Boolean(e)})
				}}
				id={"DoneQ"}
				checked={s.doneShowQ}

			></Checkbox>
			<label htmlFor={"DoneQ"}>Done</label>
		</div>
	</div>;

	let settingButton = <Button/>
	if (props.isSettingsQ) {
		settingButton = <Button
			onClick={async () => {
				props.isSettingsQHandle(false)
				props.saveSettings(s)
				props.updateBlockSettingHandle(s)
			}}
		>
			Save
		</Button>
	} else {
		settingButton = <Button
			onClick={() => {
				props.isSettingsQHandle(false)
			}}
		>
			Settings
		</Button>


	}
	const cancelButton = <Button
		variant={"secondary"}
		onClick={() => {
			props.isSettingsQHandle(false)
		}}>
		Cancel
	</Button>
	const buttonsPanel = <div className={"flex flex-row justify-around p-2"}>
		{settingButton}
		{props.isSettingsQ ? cancelButton : null}
	</div>

	const viewModeSelect = () => {
		return <Select
			value={s.viewMode}
			onValueChange={e => {
				 if (e === "Month"){
					setS({...s,viewMode:ViewMode.Month})
				} else if (e === "Day"){
					setS({...s,viewMode:ViewMode.Day})
				} else if (e === "Week"){
					setS({...s,viewMode:ViewMode.Week})
				} else if (e === "Year"){
					setS({...s,viewMode:ViewMode.Year})
				}
			}}
		>
			<SelectTrigger className={"w-[180px]"}>
				<SelectValue placeholder={"Select view mode of chart"}/>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={"Day"}>Day</SelectItem>
				<SelectItem value={"Week"}>Week</SelectItem>
				<SelectItem value={"Month"}>Month</SelectItem>
				<SelectItem value={"Year"}>Year</SelectItem>
			</SelectContent>

		</Select>
	}

	const showTaskListInChartCheckbox = ()=>{
		return <div className={"flex space-x-2 items-center"}>
			<Checkbox
			onCheckedChange={e=>{
				setS({...s,leftBarChartDisplayQ: Boolean(e)})
			}}
			checked={s.leftBarChartDisplayQ}
			id={"showtasklistinchartcheckbox"}
			/>
			<Label htmlFor={"showtasklistinchartcheckbox"}>Show the left task list in chart</Label>
		</div>
	}


	const settingView = <>
		{buttonsPanel}
		<div className={"flex flex-row justify-around"}><RadioGroup onValueChange={e => {
			if (e === "AllFiles" || e === "CurrentFile") {
				setS({...s, pathListFilter: [e]})

			} else if (e === "CustomPath") {
				setS({...s, pathListFilter: []})
			}
		}}>
			{allFileFilterRadio}
			{currentFileFilterRadio}
			{customPathFilterRadio}
		</RadioGroup>
			{filterBaseOnStatusCheckbox}
			{viewModeSelect()}
			{showTaskListInChartCheckbox()}

		</div>


		{customPathListCheckboxs}

	</>
	return <>
		{settingView}

	</>
}

export default SettingViewComponent
