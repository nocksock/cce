import { consume, type Context, provide } from './context.js'
import { render, html } from './html.js'
import { signal, effect } from './signals.js'
import { invariant } from './errors.js'
import { addEventListener, dispatch } from './events.js'

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

type PropValue = <T,R>(value: T) => R
  | string
  | number
  | boolean
  | null
  | undefined

const propRegistry = Symbol()
type CustomElementClass = typeof CustomElement
export type PropMap = Record<string, PropValue>
export class CustomElement extends HTMLElement {
  // TODO: move this to props.ts as well somehow?
  static [propRegistry]: PropMap = {}
  static props: PropMap = {}
  static style = new CSSStyleSheet()

  static get observedAttributes() {
    this.finalize()
    return [...Object.keys(this[propRegistry])]
  }

  static finalize() {
    for (const key in this.props) {
      const valueFn = this.props[key]
      this[propRegistry][key] = valueFn!
    }
  }

  // TODO: make this static to also track finalization etc
  #lifecycle = signal();

  override shadowRoot!: ShadowRoot

  static defaultOptions = {
    shadowRoot: 'open' as 'open' | 'closed',
  }

  constructor(opts: {
    shadowRoot?: 'open' | 'closed'
  } = CustomElement.defaultOptions) {
    super()
    this.#lifecycle('constructor');
    this.attachShadow({ mode: opts.shadowRoot || 'open' })

    const constructor = this.constructor as CustomElementClass

    // Register all event handlers
    // this.#lifecycle('constructor:register-handlers');
    // for (const key in constructor.handle) {
    //   this.on(key, constructor.handle[key])
    // }

    // Create acustom-elementssor for each attribute
    // TODO: extract into module
    this.#lifecycle('constructor:register-acustom-elementssors');
    for (const key in constructor[propRegistry]) {
      const valueFn = constructor[propRegistry][key]!
      // @ts-expect-error
      const attrValue = this[key] || this.getAttribute(key)
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

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    // @ts-ignore
    this[name] = newValue
  }

  #onUnmount = new Set<() => void>()
  connectedCallback() {
    this.#lifecycle('connectedCallback');

    if (this.render) {
      this.#onUnmount.add(effect(() => {
        this.#lifecycle('render');
        return render(this.render(this), this.shadowRoot!)
      }))
    }

    this.#lifecycle('mount');
    if (this.mount) {
      const unmount = this.mount() || (() => {})
      this.#onUnmount.add(unmount)
    }
  }

  disconnectedCallback() {
    this.#lifecycle('disconnectedCallback');
    for (const cleanup of this.#onUnmount) {
      // @ts-ignore
      invariant(typeof cleanup === 'function', `Cleanup function must be a function, received ${typeof cleanup} instead.`)
      this.#lifecycle('cleanup');
      cleanup()
    }
    this.#onUnmount.clear()
  }

  /**
   * Consume a reactive value from the nearest provider for this ContextKey.
   */
  consume<T>(key: Context<T>, defaultValue?: T) {
    return consume(this, key, defaultValue)
  }

  /**
   * Provide a reactive value to alle consumers of the given ContextKey within
   * this element's subtree.
   *
   * NOTE: use strings for the key, only if the lifetime of the value is the 
   * same as the lifetime of the session as it won't be garbage collected. 
   * Otherwise use `createContext` to create a unique key.
   */
  provide<T>(key: Context<T>, value: T) {
    return provide(this, key, value)
  }

  /**
   * Put your render logic here. 
   *
   * This method will be called whenever a reactive value that is used in the 
    * render method changes. This method should return a lit-html template.
   */
  render(self: typeof this) {
    return html`<slot></slot>`
  }

  /**
   * Mount is called when the element is connected to the DOM. Convenience to
   * avoid having to call super() in the connectedCallback - and faster to type
   * You can return a cleanup function that will be called when the element is
   * disconnected from the DOM - use this for `unmount` logic.
   */
  mount() : void | (() => void) {
    return () => {}
  }

  /**
   * Dispatch a custom event with the given type and detail.
   */
  dispatch<E extends string, T>(type: E, detail: T) {
    dispatch(this, type, detail);
  }

  /**
    * Convenience method to add an event listener that is removed when the element is
    * disconnected from the DOM. To be used in mount()
    */
  on(type: string, handler: (e: CustomEvent) => void) {
    // TODO: allow calls from withing setup() as well that are not removed on unmount
    invariant(this.#lifecycle() == 'mount', "on() must only be called in mount(). Use addEventListener() elsewhere. Was called in" + this.#lifecycle())
    // @ts-ignore
    this.#onUnmount.add(addEventListener(this, type, handler))
  }
}
