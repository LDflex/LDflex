import { Handler, HandlerFunction } from "./types";

// Creates a handler from the given function
export function handler<T extends HandlerFunction>(handle: T): Handler<T> {
  return { handle };
}
