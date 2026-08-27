import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {
	applyDataviewDates,
	applyTasksEmojiDates,
	extractTaskDates,
	formatIsoDate,
	spanFromTaskDates,
	stripTaskDateTokens,
} from "./taskDates";

const d = (iso: string) => {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) throw new Error(`bad iso ${iso}`);
	return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

describe("extractTaskDates", () => {
	it("reads Tasks start and due emoji dates", () => {
		const fields = extractTaskDates("Ship feature 🛫 2024-01-01 📅 2024-01-15");
		assert.ok(fields);
		assert.equal(fields.source, "tasks");
		assert.equal(formatIsoDate(fields.startDate!), "2024-01-01");
		assert.equal(formatIsoDate(fields.dueDate!), "2024-01-15");
	});

	it("reads due-only Tasks date", () => {
		const fields = extractTaskDates("Finish report 📅 2024-02-20");
		assert.ok(fields);
		assert.equal(fields.startDate, null);
		assert.equal(formatIsoDate(fields.dueDate!), "2024-02-20");
	});

	it("reads start-only Tasks date", () => {
		const fields = extractTaskDates("Kickoff 🛫 2024-03-01");
		assert.ok(fields);
		assert.equal(formatIsoDate(fields.startDate!), "2024-03-01");
		assert.equal(fields.dueDate, null);
	});

	it("reads Dataview start and due fields", () => {
		const fields = extractTaskDates("Plan sprint [start:: 2024-04-01] [due:: 2024-04-10]");
		assert.ok(fields);
		assert.equal(fields.source, "dataview");
		assert.equal(formatIsoDate(fields.startDate!), "2024-04-01");
		assert.equal(formatIsoDate(fields.dueDate!), "2024-04-10");
	});

	it("returns null when no start or due is present", () => {
		assert.equal(extractTaskDates("No dates here"), null);
		assert.equal(extractTaskDates("Scheduled only ⏳ 2024-05-01"), null);
	});
});

describe("spanFromTaskDates", () => {
	it("maps start+due to a range bar", () => {
		const span = spanFromTaskDates({
			source: "tasks",
			startDate: d("2024-01-01"),
			dueDate: d("2024-01-15"),
		});
		assert.ok(span);
		assert.equal(formatIsoDate(span.start), "2024-01-01");
		assert.equal(formatIsoDate(span.end), "2024-01-15");
	});

	it("uses due as both ends for due-only tasks", () => {
		const span = spanFromTaskDates({
			source: "tasks",
			startDate: null,
			dueDate: d("2024-02-20"),
		});
		assert.ok(span);
		assert.equal(formatIsoDate(span.start), "2024-02-20");
		assert.equal(formatIsoDate(span.end), "2024-02-20");
	});

	it("uses start as both ends for start-only tasks", () => {
		const span = spanFromTaskDates({
			source: "tasks",
			startDate: d("2024-03-01"),
			dueDate: null,
		});
		assert.ok(span);
		assert.equal(formatIsoDate(span.start), "2024-03-01");
		assert.equal(formatIsoDate(span.end), "2024-03-01");
	});

	it("swaps reversed start and due", () => {
		const span = spanFromTaskDates({
			source: "tasks",
			startDate: d("2024-06-10"),
			dueDate: d("2024-06-01"),
		});
		assert.ok(span);
		assert.equal(formatIsoDate(span.start), "2024-06-01");
		assert.equal(formatIsoDate(span.end), "2024-06-10");
	});
});

describe("stripTaskDateTokens", () => {
	it("removes Tasks emoji dates but keeps plain language", () => {
		const cleaned = stripTaskDateTokens("Review docs 📅 2024-01-15 from Mon to Wed");
		assert.equal(cleaned, "Review docs from Mon to Wed");
	});
});

describe("applyTasksEmojiDates", () => {
	it("writes a range with start and due emoji", () => {
		const line = applyTasksEmojiDates(
			"- [ ] Ship feature 🛫 2024-01-01 📅 2024-01-15",
			d("2024-02-01"),
			d("2024-02-10"),
		);
		assert.match(line, /🛫 2024-02-01/);
		assert.match(line, /📅 2024-02-10/);
	});

	it("writes only due for a single-day bar", () => {
		const line = applyTasksEmojiDates("- [ ] Finish report 📅 2024-01-15", d("2024-03-05"), d("2024-03-05"));
		assert.match(line, /📅 2024-03-05/);
		assert.doesNotMatch(line, /🛫/);
	});
});

describe("applyDataviewDates", () => {
	it("writes start and due inline fields for a range", () => {
		const line = applyDataviewDates(
			"- [ ] Plan [start:: 2024-01-01] [due:: 2024-01-15]",
			d("2024-02-01"),
			d("2024-02-10"),
		);
		assert.match(line, /\[start:: 2024-02-01\]/);
		assert.match(line, /\[due:: 2024-02-10\]/);
	});
});
