import {createContext, useContext} from "react";
import SmartGanttPlugin from "../main";
export const PluginContext = createContext<SmartGanttPlugin|undefined>(undefined)

export const usePlugin = ():SmartGanttPlugin|undefined=>{
	return useContext((PluginContext))
}
