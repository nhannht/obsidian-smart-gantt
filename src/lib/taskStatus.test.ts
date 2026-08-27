import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {isDoneMarker, taskStatusFromLine} from "./taskStatus";

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

describe("taskStatusFromLine", () => {
	it("classifies todo as open", () => {
		assert.equal(taskStatusFromLine("- [ ] Write docs"), "open");
	});

	it("classifies done as done", () => {
		assert.equal(taskStatusFromLine("- [x] Ship it"), "done");
		assert.equal(taskStatusFromLine("- [X] Ship it"), "done");
	});

	it("classifies in-progress as open", () => {
		assert.equal(taskStatusFromLine("- [/] Working on it"), "open");
	});

	it("classifies cancelled as done", () => {
		assert.equal(taskStatusFromLine("- [-] Abandoned"), "done");
	});

	it("returns null for non-checkbox list items", () => {
		assert.equal(taskStatusFromLine("- plain bullet"), null);
		assert.equal(taskStatusFromLine("not a list"), null);
	});

	it("supports starred and numbered list markers", () => {
		assert.equal(taskStatusFromLine("* [/] Star task"), "open");
		assert.equal(taskStatusFromLine("1. [-] Numbered cancelled"), "done");
	});
});
