import {SmartGanttSettings} from "./SettingManager";
import {useState} from "react";
import {usePlugin} from "./ReactContext";

const SettingViewComponent = (props: {
	inputS: SmartGanttSettings,
	saveSettings: (s:SmartGanttSettings) => void,
	isSettingsQ: boolean,
	isSettingsQHandle: (b:boolean) => void,
	updateBlockSettingHandle: (s:SmartGanttSettings) => void

}) => {

	const [s, setS] = useState<SmartGanttSettings>(structuredClone(props.inputS))
	const thisPlugin = usePlugin()

	const allFileFilterRadio = <div><input
		onChange={(e) => {
			if (e.target.checked) {
				setS({
					...s,
					pathListFilter: ["AllFiles"]
				})
			}
		}}
		name={"pathFilterRadio"}
		type={"radio"}
		id={"allFiles"}
		checked={s.pathListFilter.indexOf("AllFiles") !== -1}
	></input>
		<label htmlFor={"allFiles"}>All files</label></div>;

	const currentFileFilterRadio = <div>
		<input
			onChange={(e) => {
				if (e.target.checked) {
					setS({
						...s,
						pathListFilter: ["CurrentFile"]
					})
				}
			}}
			name={"pathFilterRadio"} type={"radio"} id={"currentFile"}
			checked={s.pathListFilter.indexOf("CurrentFile") !== -1}
		>

		</input>
		<label htmlFor={"currentFile"}>Current file</label></div>;
	const customPathFilterRadio = <div><input
		onChange={(e) => {
			if (e.target.checked) {
				setS({
					...s,
					pathListFilter: [],
				})
			}

		}}
		name={"pathFilterRadio"} type={"radio"} id={"customPath"}
		checked={s.pathListFilter.indexOf("AllFiles") === -1 &&
			s.pathListFilter.indexOf("CurrentFile") === -1
		}>

	</input>
		<label htmlFor={"customPath"}>Custom path</label>
	</div>;
	const customPathListCheckboxs = <div
		hidden={
			s.pathListFilter.indexOf("AllFiles") !== -1 ||
			s.pathListFilter.indexOf("CurrentFile") !== -1
		}
	>
		{thisPlugin?.helper.getAllParentPath().map((path:string, pathIndex:number) => {
			return <div
				key={path}
			>
				<input
					onChange={(e) => {
						let paths = {...s.pathListFilter}
						if (e.target instanceof HTMLInputElement && e.target.checked) {
							paths.push(path)
							setS({...s, pathListFilter: paths})
						} else {
							paths.remove(path)
							setS({...s, pathListFilter: paths})
						}
					}}
					type={"checkbox"}
					id={`pathFilterRadioGanttBlock-${pathIndex}`}
					checked={s.pathListFilter.indexOf(path) !== -1}
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
					setS({...s, todoShowQ: e.target.checked})

				}}
				type={"checkbox"} id={"TodoQ"}
				checked={s.todoShowQ}

			></input>
			<label htmlFor={"TodoQ"}>Todo</label>
		</div>
		<div>
			<input
				onChange={(e) => {
					setS({...s, doneShowQ: e.target.checked})
				}}
				type={"checkbox"} id={"DoneQ"}
				checked={s.doneShowQ}

			></input>
			<label htmlFor={"DoneQ"}>Done</label>
		</div>
	</div>;

	let settingButton = <button/>
	if (props.isSettingsQ) {
		settingButton = <button
			onClick={async () => {
				props.isSettingsQHandle(false)
				props.saveSettings(s)
				props.updateBlockSettingHandle(s)
			}}
		>
			Save
		</button>
	} else {
		settingButton = <button
			onClick={() => {
				props.isSettingsQHandle(false)
			}}
		>
			Settings
		</button>


	}
	const cancelButton = <button
		onClick={() => {
			props.isSettingsQHandle(false)
		}}>
		Cancel
	</button>
	const buttonsPanel = <div className={"flex flex-row justify-around p-2"}>
		{settingButton}
		{props.isSettingsQ ? cancelButton : null}
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
	return <>
		{settingView}

	</>
}

export default SettingViewComponent
