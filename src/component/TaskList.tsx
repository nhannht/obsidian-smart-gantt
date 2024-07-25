import {TimelineExtractorResultNg} from "@/TimelineExtractor";
import SmartGanttPlugin from "../../main";
import {useCallback, useEffect, useState} from "react";
import {ListItem} from "mdast";
import {ScrollArea} from "./ScrollableList";
import {Checkbox} from "./Checkbox";
import {Label} from "@/component/Label";
import {Separator} from "@/component/Separator";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/component/ResizablePanel";

const TodoList = (props: {
	todos: TimelineExtractorResultNg[],
	modifyCheckboxFn: (t: TimelineExtractorResultNg, status: boolean) => void
	changeResultStatusFn: (rId: string, status: boolean) => void
	jumpToResultPositionFn: (t:TimelineExtractorResultNg)=>void
}) => {
	return <ScrollArea className={"h-72 w-full rounded-md border p-2"}>
		<div className="mb-4 text-sm font-medium leading-none bg-gray-900 sticky top-0 text-white p-2 text-center">Unchecked</div>
		{props.todos.map((t, id) => (
			<div key={id} className={"space-x-2 "}>
				<div className={"flex items-center space-x-2"}><Checkbox
					id={t.id}
					onCheckedChange={async e => {
						props.modifyCheckboxFn(t, Boolean(e))
						//@ts-ignore
						props.changeResultStatusFn(t.id, Boolean(e))
					}}
					checked={Boolean((props.todos.find(e => e.id === t.id)?.node as ListItem).checked)}
				/>
					<Label
						htmlFor={t.id}
					>
						{/*@ts-ignore*/}
						{t.node.children[0].children[0].value}
						<p className={"text-gray-600 underline text-sm hover:cursor-pointer"}
						onClick={()=>{props.jumpToResultPositionFn(t)}}
						> {t.file.path} </p>
					</Label>
				</div>
				<Separator className={"my-2"}/>

			</div>

		))}
	</ScrollArea>
}

const DoneList = (props: {
	dones: TimelineExtractorResultNg[],
	modifyCheckboxFn: (t: TimelineExtractorResultNg, status: boolean) => void,
	changeResultStatusFn: (rId: string, status: boolean) => void
	jumpToResultPositionFn: (t: TimelineExtractorResultNg)=> void;
}) => {
	return <ScrollArea className={"h-72 w-full rounded-md border p-2"}>
		<div className="mb-4 text-sm font-medium leading-none bg-gray-900 sticky top-0 text-white p-2 text-center">Checked</div>
		{props.dones.map((d, id) => (
			<div key={id} className={"space-x-2 "}>
				<div className={"flex items-center space-x-2"}><Checkbox
					id={d.id}
					onCheckedChange={async e => {
						props.modifyCheckboxFn(d, Boolean(e))
						props.changeResultStatusFn(d.id, Boolean(e))

					}}
					checked={Boolean((props.dones.find(e => e.id === d.id)?.node as ListItem).checked)}
				/>
					<Label htmlFor={d.id}>
						{/*@ts-ignore*/}
						{d.node.children[0].children[0].value}
						<p className={"text-gray-600 underline text-sm hover:cursor-pointer"}
						onClick={()=>{props.jumpToResultPositionFn(d)}}
						> {d.file.path} </p>

					</Label></div>
				<Separator className={"my-2"}/>
			</div>

		))}
	</ScrollArea>
}
const TaskList = (props: {
	results: TimelineExtractorResultNg[]
	thisPlugin: SmartGanttPlugin,
	changeResultStatusFn: (rId: string, status: boolean) => void,
}) => {
	const [todos, setTodos] = useState<TimelineExtractorResultNg[]>([])
	const [dones, setDones] = useState<TimelineExtractorResultNg[]>([])

	const classifyResults = useCallback(() => {
		let ts: TimelineExtractorResultNg[] = []
		let ds: TimelineExtractorResultNg[] = []
		props.results.forEach((t) => {
			const node = t.node as ListItem
			if (node.checked) {
				ds.push(t)
			} else {
				ts.push(t)
			}
		})
		setTodos(ts)
		setDones(ds)
	}, [props.results])

	useEffect(() => {
		classifyResults()
	}, [props.results])

	const modifyCheckboxFn = useCallback(async (r: TimelineExtractorResultNg, checkedQ: boolean) => {
			let fileContent = await props.thisPlugin.app.vault.read(r.file)
			let lines = fileContent.split(/(.*?\n)/g)
			lines.forEach(((l, i) => {
				if (l.trim() === "") lines.splice(i, 1)
			}))
			// console.log(lines)
			let lI = Number(r.node.position?.start.line) - 1
			// console.log(lines[lI])
			let newLine = ""
			if (checkedQ) {
				newLine = lines[lI].replace("[ ]", "[x]")
			} else {
				newLine = lines[lI].replace("[x]", "[ ]")
			}
			// console.log(newLine)
			// console.log(lI)
			lines.splice(lI, 1, newLine)
			const newFileContent = lines.join("")
			await props.thisPlugin.app.vault.modify(r.file, newFileContent)
		}, []
	)

	// useEffect(() => {
	// 	console.log(todos)
	// }, [todos]);




	return <div>
		<ResizablePanelGroup
			direction={"horizontal"}
			className={"rounded-lg border"}
		>
			<ResizablePanel defaultSize={50}>
				<TodoList todos={todos}
						  modifyCheckboxFn={modifyCheckboxFn}
						  changeResultStatusFn={props.changeResultStatusFn}
						  jumpToResultPositionFn={props.thisPlugin.helper.jumpToPositionOfResult}
				/>
			</ResizablePanel>
			<ResizableHandle withHandle={true}/>
			<ResizablePanel defaultSize={50}>
				<DoneList dones={dones}
						  modifyCheckboxFn={modifyCheckboxFn}
						  changeResultStatusFn={props.changeResultStatusFn}
						  jumpToResultPositionFn={props.thisPlugin.helper.jumpToPositionOfResult}
				/>
			</ResizablePanel>
		</ResizablePanelGroup>
	</div>
}

export default TaskList
