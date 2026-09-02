import assert from "node:assert/strict";
import {describe, it} from "node:test";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {ListItem} from "mdast";
import {unified} from "unified";
import {Parent} from "unist";

import {isDoneMarker, taskStatusFromListItem, walkListItems} from "./taskStatus";

const parseListItem = (markdown: string): ListItem => {
	const tree = unified().use(remarkGfm).use(remarkParse).parse(markdown);
	let item: ListItem | undefined;
	walkListItems(tree, (listItem) => {
		if (item === undefined) item = listItem;
	});
	if (!item) throw new Error(`no list item in ${markdown}`);
	return item;
};

const firstTextValue = (listItem: ListItem): string | undefined => {
	const paragraph = listItem.children?.[0] as Parent | undefined;
	const first = paragraph?.children?.[0];
	if (first?.type !== "text") return undefined;
	return (first as { value?: unknown }).value as string | undefined;
};

describe("isDoneMarker", () => {
	it("treats x/X and cancelled dash as done", () => {
		assert.equal(isDoneMarker("x"), true);
		assert.equal(isDoneMarker("X"), true);
		assert.equal(isDoneMarker("-"), true);
	});

	it("treats space, slash, and other markers as not done", () => {
		assert.equal(isDoneMarker(" "), false);
		assert.equal(isDoneMarker("/"), false);
		assert.equal(isDoneMarker(">"), false);
	});
});

describe("taskStatusFromListItem", () => {
	it("classifies todo as open", () => {
		assert.equal(taskStatusFromListItem(parseListItem("- [ ] Write docs")), "open");
	});

	it("classifies done as done", () => {
		assert.equal(taskStatusFromListItem(parseListItem("- [x] Ship it")), "done");
	});

	it("classifies in-progress as open and strips the marker from text", () => {
		const item = parseListItem("- [/] Working on it");
		assert.equal(taskStatusFromListItem(item), "open");
		assert.equal(firstTextValue(item), "Working on it");
	});

	it("classifies cancelled as done", () => {
		assert.equal(taskStatusFromListItem(parseListItem("- [-] Abandoned")), "done");
	});

	it("returns null for wiki-link list items", () => {
		assert.equal(taskStatusFromListItem(parseListItem("- [[Meeting notes]] read this later")), null);
	});

	it("returns null for plain bullets", () => {
		assert.equal(taskStatusFromListItem(parseListItem("- plain bullet")), null);
	});

	it("supports starred and numbered list markers", () => {
		assert.equal(taskStatusFromListItem(parseListItem("* [/] Star task")), "open");
		assert.equal(taskStatusFromListItem(parseListItem("1. [-] Numbered cancelled")), "done");
	});
});
