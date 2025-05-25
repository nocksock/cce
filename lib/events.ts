import { invariant } from './errors'
import { isFunction, isString } from './predicates'

export const dispatch = <E extends string | Function, T>(
  self: EventTarget,
  type: E,
  detail?: T
) => {
  let eventType: string

  if (isString(type) && !detail) {
    eventType = type
    return self.dispatchEvent(
      new Event(eventType, { bubbles: true, composed: true })
    )
  }

  if (isString(type) && detail) {
    eventType = type
    return self.dispatchEvent(
      new CustomEvent(eventType, { detail, bubbles: true, composed: true })
    )
  }

  if (isFunction(type)) {
    invariant(
      type.name,
      'Cannot dispatch functions without a name (eg anonymous functions)'
    )
    eventType = type.name
    self.dispatchEvent(
      new CustomEvent(eventType, { detail, bubbles: true, composed: true })
    )
  }
}

export const addEventListener = <
  E extends string | (Function & { name: string }),
  T,
>(
  self: HTMLElement & { shadowRoot: ShadowRoot },
  type: E,
  handler: (e: Event | CustomEvent<T>) => void,
) => {
  let event: string
  if (typeof type == 'string') {
    event = type
  }

  if (typeof type == 'function') {
    invariant(
      isString(type.name),
      'Cannot handle functions without a name (eg anonymous functions)'
    )
    event = type.name
  }

  const boundHandler = handler.bind(self)

  // @ts-ignore
  self.shadowRoot.addEventListener(event, boundHandler)
  return () => self.shadowRoot.removeEventListener(event, boundHandler)
}
