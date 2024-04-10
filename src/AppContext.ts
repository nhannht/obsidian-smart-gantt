import {App} from "obsidian";
import {createContext, useContext} from "react";
export interface AppContextProps {
	app: App,

}
export const AppContext = createContext<AppContextProps | undefined>(undefined);

export function useApp(): AppContextProps | undefined {
	return useContext(AppContext)
}
