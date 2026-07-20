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
	modifyCheckboxFn: (t: TimelineExtractorResultNg, status: boolean) => void | Promise<void>
	changeResultStatusFn: (rId: string, status: boolean) => void
	jumpToResultPositionFn: (t: TimelineExtractorResultNg) => void | Promise<void>
}) => {


	return <ScrollArea className={"h-72 w-full rounded-md border p-2"}>
		<div
			className="mb-3 rounded-md bg-secondary p-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground sticky top-0">Unchecked
		</div>
		{props.todos.map((t, id) => (
			<div key={id} className={"space-x-2 "}>
				<div className={"flex items-center space-x-2"}><Checkbox
					id={t.id}
					onCheckedChange={e => {
						void props.modifyCheckboxFn(t, Boolean(e))
						props.changeResultStatusFn(t.id, Boolean(e))
					}}
					checked={Boolean((props.todos.find(e => e.id === t.id)?.node as ListItem).checked)}
				/>
					<Label
						htmlFor={t.id}
					>
						{/*@ts-ignore*/}
						{t.node.children[0].children[0].value}
						<p className={"text-xs text-muted-foreground hover:text-foreground hover:cursor-pointer"}
						   onClick={() => {
							   void props.jumpToResultPositionFn(t)
						   }}
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
	modifyCheckboxFn: (t: TimelineExtractorResultNg, status: boolean) => void | Promise<void>,
	changeResultStatusFn: (rId: string, status: boolean) => void
	jumpToResultPositionFn: (t: TimelineExtractorResultNg) => void | Promise<void>;
}) => {
	return <ScrollArea className={"h-72 w-full rounded-md border p-2"}>
		<div
			className="mb-3 rounded-md bg-secondary p-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground sticky top-0">Checked
		</div>
		{props.dones.map((d, id) => (
			<div key={id} className={"space-x-2 "}>
				<div className={"flex items-center space-x-2"}><Checkbox
					id={d.id}
					onCheckedChange={e => {
						void props.modifyCheckboxFn(d, Boolean(e))
						props.changeResultStatusFn(d.id, Boolean(e))
					}}
					checked={Boolean((props.dones.find(e => e.id === d.id)?.node as ListItem).checked)}
				/>
					<Label htmlFor={d.id}>
						{/*@ts-ignore*/}
						{d.node.children[0].children[0].value}
						<p className={"text-xs text-muted-foreground hover:text-foreground hover:cursor-pointer"}
						   onClick={() => {
							   void props.jumpToResultPositionFn(d)
						   }}
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
	}, [props.results, classifyResults])

	const modifyCheckboxFn = useCallback(async (r: TimelineExtractorResultNg, checkedQ: boolean) => {
			const lineIndex = Number(r.node.position?.start.line) - 1
			if (Number.isNaN(lineIndex) || lineIndex < 0) return
			await props.thisPlugin.app.vault.process(r.file, (content) => {
				const lines = content.split("\n")
				const line = lines[lineIndex]
				if (line === undefined) return content
				lines[lineIndex] = checkedQ
					? line.replace("[ ]", "[x]")
					: line.replace("[x]", "[ ]")
				return lines.join("\n")
			})
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
