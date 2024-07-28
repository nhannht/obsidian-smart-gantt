import {App} from "obsidian";
import {createContext, useContext} from "react";

export const AppContext = createContext<App | undefined>(undefined);

export function useApp(): App | undefined {
	return useContext(AppContext)
}
