import {forwardRef, HTMLAttributes} from "react";

/* Obsidian skins every button element (button:not(.clickable-icon)) and
 * community themes pile more rules on top - a war no plugin stylesheet can
 * win. Plugin controls render as div[role=button] instead, which no host
 * button selector can ever match. Keyboard activation is restored here. */
const Pressable = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	(props, ref) => (
		<div
			role={"button"}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.currentTarget.click();
				}
			}}
			{...props}
			ref={ref}
		/>
	),
);
Pressable.displayName = "Pressable";

export default Pressable;
