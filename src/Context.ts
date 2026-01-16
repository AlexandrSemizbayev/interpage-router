import { createContext } from "react";

export type URLContextType = {
  getURL: string;
  setURL: React.Dispatch<React.SetStateAction<string>>;
};

export const AppContext = createContext<URLContextType | null>(null);

export default AppContext;
