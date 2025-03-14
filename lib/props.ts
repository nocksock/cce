import { signal } from "./main"

export const propRegistry = Symbol()

const getInitialValue = <R>(
  specValue: string | ((v?: string) => R),
  domValue: string | null
): R | string => {
  if (domValue === null) {
    if (typeof specValue === 'function') {
      return specValue()
    }
    return specValue
  }

  if (typeof specValue === 'function') {
    return specValue(domValue)
  }

  return domValue
}

export const setupProps = (self: HTMLElement) => {
  // Create accessor for each attribute
  for (const key in self.constructor[propRegistry]) {
    const valueFn = self.constructor[propRegistry][key]
    const attrValue = self[key] || self.getAttribute(key)
    const initalValue = getInitialValue(valueFn, attrValue)
    const $prop = signal(initalValue)

    Object.defineProperty(this, key, {
      get() { return $prop },
      set(value) {
        $prop(typeof valueFn === 'function' ? valueFn(value) : value)
      },
    })
  }
}
