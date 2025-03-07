import { createContext } from "../../lib/main";

export const todoContext = createContext('todos', [
  { text: 'load from url', done: false },
]);
