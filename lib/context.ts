import { signal, effect, computed } from 'kloen'

export type ContextKey = string | symbol | number | object
type Brand<T, B> = T & { __brand: B }
export type Context<T> = Brand<T, 'Context'>

interface ContextRequestEvent<T> extends CustomEvent {
  detail: {
    key: ContextKey
    callback: (value: T, source: HTMLElement) => void
  }
}

export const createContext = <T>(key: ContextKey): Context<T> =>
  key as Context<T>

export function provide<T>(self: HTMLElement, key: Context<T>, $) {
  // @ts-ignore
  self.addEventListener(
    'request-context-signal',
    (e: ContextRequestEvent<T>) => {
      if (e.detail.key === key) {
        effect(() => e.detail.callback?.($, self))
      }
    }
  )
  return $
}

export function consume<T>(self: HTMLElement, key: Context<T>) {
  const value = signal()
  const $ = computed(() => value()())

  self.dispatchEvent(
    new CustomEvent('request-context-signal', {
      bubbles: true,
      detail: {
        key,
        callback: $ => {
          value($)
        },
      },
    })
  )

  return $ as () => T
}
