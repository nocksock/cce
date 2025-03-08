export const dispatch = <E extends string, T>(self: EventTarget, type: E, detail: T) => {
  self.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
}

