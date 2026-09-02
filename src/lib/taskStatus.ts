import {ListItem} from "mdast";
import {Node, Parent} from "unist";

export type TaskBinaryStatus = "done" | "open";

const CUSTOM_MARKER_RE = /^\[(.)]\s+/;

/** Done (x/X) or cancelled (-) — both treated as finished. */
export function isDoneMarker(marker: string): boolean {
	const m = marker.trim();
	return m === "x" || m === "X" || m === "-";
}

/**
 * Classify a list item as open/done using remark's AST. Custom markers like
 * [/] are detected only when the paragraph starts with a text node (wiki-links
 * start with a link node and are ignored). Strips the marker from the text
 * node so downstream title extraction stays clean.
 */
export function taskStatusFromListItem(listItem: ListItem): TaskBinaryStatus | null {
	if (typeof listItem.checked === "boolean") {
		return listItem.checked ? "done" : "open";
	}

	const paragraph = listItem.children?.[0] as Parent | undefined;
	const first = paragraph?.children?.[0];
	if (first?.type !== "text") return null;

	const textNode = first as { type: "text"; value: string };
	const match = CUSTOM_MARKER_RE.exec(textNode.value);
	if (!match) return null;

	textNode.value = textNode.value.slice(match[0].length);
	return isDoneMarker(match[1]) ? "done" : "open";
}

export function walkListItems(node: Node, visit: (item: ListItem) => void): void {
	if (node.type === "listItem") {
		visit(node as ListItem);
	}
	if ("children" in node) {
		for (const child of (node as Parent).children) {
			walkListItems(child, visit);
		}
	}
}
