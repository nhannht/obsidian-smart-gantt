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
		created: moment(faker.date.recent({days:60})).format("YYYY-MM-DD"),
		completion: moment(faker.date.recent()).format("YYYY-MM-DD"),
		dependences: faker.helpers.arrayElements(allTaskId),
		process: faker.number.int({min: 0, max: 10}),
	}
}
let results = []
allTaskId.forEach((id, index) => {
	const task = generateTask(id)
	results.push(task)
})

let markdownTaskString = []
results.forEach((task,id)=>{
	markdownTaskString.push(`- [ ] ${task.content} [smartGanttId :: ${task.id}] [start :: ${task.start}] [due :: ${task.due}] [created :: ${task.created}] [process:: ${task.process}] [dependencies :: ${task.dependences}]`)
})

writeFileSync("tasks_sample.json",JSON.stringify(results,null,"\t"))
writeFileSync("tasks_markdown.md",markdownTaskString.join("\n") + "\n")
