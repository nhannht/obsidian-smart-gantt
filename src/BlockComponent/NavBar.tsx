import SmartGanttPlugin from "../../main";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle
} from "@/component/NavMenu";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/component/Tooltip";

export const NavBar = (props: {
	setIsSettingQFn: (status: boolean) => void
	thisPlugin?: SmartGanttPlugin,
	reloadViewButtonQ?: boolean,
}) => {
	let reloadButton: JSX.Element
	if ("reloadViewButtonQ" in props && "thisPlugin" in props && props.reloadViewButtonQ === true) {
		reloadButton = <NavigationMenuItem>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<NavigationMenuLink
							className={navigationMenuTriggerStyle()}
							onClick={() => {
								setTimeout(()=>props.thisPlugin?.helper.reloadView(),2000)
							}}>
							Reload
						</NavigationMenuLink>
					</TooltipTrigger>
					<TooltipContent side={"bottom"}>
						<div>
							<br/>
							The change from inside this plugin (sidebar/block) will affect outside.<br/>
							But any change from the outside (eg. you edit the file) will not auto trigger the
							update.<br/>
							So please click this button to manual update
							<br/>
							<div className={"text-rose-600"}>This button will wait 2s before reload, because Obsidian <br/>
							not autosave your change immediately after you make change
							</div>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

		</NavigationMenuItem>
	} else {
		reloadButton = <></>
	}

	return <NavigationMenu>
		<NavigationMenuList>
			<NavigationMenuItem>
				<NavigationMenuLink
					onClick={() => props.setIsSettingQFn(true)}
					className={navigationMenuTriggerStyle()}>Settings</NavigationMenuLink>
			</NavigationMenuItem>
			{reloadButton}

		</NavigationMenuList>
	</NavigationMenu>
}
