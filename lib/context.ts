import { signal, effect, computed } from './signals'

const REQ = 'request-context-signal'

export type ContextKey = string | symbol | number | object
type Brand<T, B> = T & { __brand: B }
export type Context<T> = Brand<T, 'Context'>
type Callback<T> = (value: T) => void
type ContextRequestEvent<T> = CustomEvent<{
  key: Context<T>
  value: ReturnType<typeof signal>
  consumer: HTMLElement
  callback: Callback<T>
}>
declare global {
  interface HTMLElementEventMap {
    [REQ]: ContextRequestEvent<any>
  }
}

const defaultMap = new Map<ContextKey, any>()
export const createContext = <T>(key: ContextKey, defaultValue: T): Context<T> => {
  defaultMap.set(key, defaultValue)
  return key as Context<T>
}

let pending: ContextRequestEvent<any>[] = []
document.body.addEventListener(REQ, (e: ContextRequestEvent<any>) => pending.push(e))

export function provide<T>(provider: HTMLElement, key: Context<T>, value: T) {
  const $value = signal(value)
  provider.addEventListener(REQ, (e: ContextRequestEvent<any>) => {
    e.stopPropagation()
    if (e.detail.key === key) {
      effect(() => e.detail.callback($value()))
    }
  })

  pending = pending.filter(e => {
    if (e.detail.key !== key) return true
    // retriggering the event from its source
    // eventListener seems to not be immediately listening
    queueMicrotask(() => linkContext((e.target as HTMLElement), key, e.detail.callback))
  })

  return $value
}

export function consume<T>(self: HTMLElement, key: Context<T>, defaultValue?: T) {
  const initialValue = defaultMap.get(key) ?? defaultValue
  if (initialValue === undefined) {
    console.warn(`No initial value found for context key: ${key}. Make sure to provide a defaultValue for either the contextKey or when calling consume..`)
  }

  const value = signal(initialValue)
  // queueMicrotask is needed to account for an optimisation within alien-signals.
  queueMicrotask(() => linkContext(self, key, value))
  return computed(() => value())
}

export function linkContext<T>(self: HTMLElement, key: Context<T>, callback: Callback<T>) {
  self.dispatchEvent(
    new CustomEvent(REQ, {
      composed: true,
      bubbles: true,
      detail: { key, callback },
    })
  )
}
