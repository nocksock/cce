import { createContext } from "../../lib/context";

export const counter = createContext<number>(Symbol())
