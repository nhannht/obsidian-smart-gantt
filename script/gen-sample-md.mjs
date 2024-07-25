#!/usr/bin/env zx
import 'zx/globals'
import {mkdirSync, writeFileSync} from "fs";
import {existsSync, rm, rmdirSync} from "node:fs";
import {faker} from '@faker-js/faker'

const vaultName = argv.vault ? argv.vault : (() => {
	// console.log("need --vault name argument")
	process.exit(0)
})()

if (!existsSync((vaultName))) {
	mkdirSync(vaultName)
} else {
	rmdirSync(vaultName, {recursive: true})
	mkdirSync(vaultName)
}

const numberOfFiles = argv.fileN ? argv.fileN : 1
const numberOfEl = argv.elN ? argv.elN : 10



const filePaths = faker.helpers.uniqueArray(()=>{
	return path.join(vaultName,faker.system.directoryPath(),faker.system.commonFileName("md"))
},numberOfFiles)



function generateOneTaskOrParagraphs(){
	return faker.helpers.weightedArrayElement([
		{
			weight: 3,
			value: `- [ ] ${faker.lorem.slug()}\n`
		},
		{
			weight: 3,
			value: `${faker.lorem.paragraphs({min: 1, max: 5}, "\n")}\n`
		},
		{
			weight: 2,
			value: (()=> {
				let r = faker.date.recent().toLocaleString()
				// console.log(r)
				let s = faker.date.soon().toLocaleString()

				return `\n- [ ] ${faker.lorem.slug()} from ${r} to ${s}\n`
			})()
		},
		{
			weight: 2,
			value: `- [ ] ${faker.lorem.slug()} at ${faker.date.soon().toLocaleString()}\n`
		}
	])

}

filePaths.forEach((f, i) => {
	let element = []
	for (let i = 0; i< numberOfEl;i++){
		element.push(generateOneTaskOrParagraphs())
	}
	const fileDir = path.dirname(f)
	if (!existsSync(fileDir)) mkdirSync(fileDir,{recursive:true})
	writeFileSync(`${f}`,element.join("\n"))

})

