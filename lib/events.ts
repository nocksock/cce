import { invariant } from "./errors";

export const dispatch = <E extends string, T>(self: EventTarget, type: E, detail?: T) => {
    let eventType: string;

    if (typeof type == "string" && !detail) {
      eventType = type;
      return self.dispatchEvent(new Event(eventType, { bubbles: true, composed: true }))
    }

    if (typeof type == "string" && detail) {
      eventType = type;
      return self.dispatchEvent(new CustomEvent(eventType, { detail, bubbles: true, composed: true }))
    }

    if (typeof type == "function")  {
      invariant(type.name, "Cannot dispatch functions without a name (eg anonymous functions)")
      eventType = type.name
      self.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
    }
}


function stopHandler(cb: (e: Event) => void, e: Event) {
  e.stopPropagation()
  cb(e)
}

export const addEventListener = <E extends string, T>(self: EventTarget, type: E, handler: (e: CustomEvent<T>) => void, stopPropagation?: true) => {
  let event: string;
  if (typeof type == "string") {
    event = type
  }

  if (typeof type == "function") {
    invariant(type.name, "Cannot handle functions without a name (eg anonymous functions)")
    event = type.name
  }

  const boundHandler = stopHandler.bind(self, handler)

  self.shadowRoot.addEventListener(event, boundHandler)
  return () => self.shadowRoot.removeEventListener(event, boundHandler)
}

