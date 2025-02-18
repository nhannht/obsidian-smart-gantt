#!/usr/bin/env node
import {faker} from "@faker-js/faker";
import {writeFileSync} from "fs";
import {v4 as uuidv4} from "uuid"
import moment from "moment"

const allTaskId = faker.helpers.uniqueArray(uuidv4,20)
// console.log(allTaskId)

const dateFormat = "YYYY-MM-DD"

function generateTask (id){
	return {
		id: id,
		content:faker.word.words(10),
		start: moment(faker.date.recent({days:60})).format("YYYY-MM-DD"),
		due: moment(faker.date.soon()).format("YYYY-MM-DD"),
		dependences: faker.helpers.arrayElements(allTaskId,{min:0,max:3}),
		progress: faker.number.int({min: 0, max: 100}),
		type: faker.helpers.arrayElement(["task","milestone","project"]),
		inventory: faker.helpers.arrayElement(["task","backlog"])
	}
}
let results = []
allTaskId.forEach((id, index) => {
	const task = generateTask(id)
	results.push(task)
})

let markdownTaskString = []
results.forEach((task,id)=>{
	markdownTaskString.push(`- [ ] ${task.content} [smartGanttId :: ${task.id}] [start :: ${task.start}] [due :: ${task.due}] [progress:: ${task.progress}] [dependencies :: ${task.dependences}] [type :: ${task.type}]`)
})

writeFileSync("tasks_sample.json",JSON.stringify(results,null,"\t"))
writeFileSync("tasks_markdown.md",markdownTaskString.join("\n") + "\n")
