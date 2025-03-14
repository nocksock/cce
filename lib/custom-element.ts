import { consume, Context, provide } from './context'
import { render, html } from 'lit-html'
import { signal, effect } from 'kloen'
import { invariant } from './errors'
import { addEventListener, dispatch } from './events'

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

const propRegistry = Symbol()
export class CustomElement extends HTMLElement {
  // TODO: move this to props.ts as well somehow?
  static [propRegistry] = {}
  static props = {}
  static handle = {}
  static style = new CSSStyleSheet()

  static get observedAttributes() {
    this.finalize()
    return [...Object.keys(this[propRegistry])]
  }

  static finalize() {
    for (const key in this.props) {
      const valueFn = this.props[key]
      this[propRegistry][key] = valueFn
    }
  }

  // TODO: make this static to also track finalization etc
  #lifecycle = signal();
  constructor() {
    super()
    this.#lifecycle('constructor');
    this.attachShadow({ mode: 'open' })
    this.shadowRoot?.adoptedStyleSheets.push(this.constructor.style)

    // Register all event handlers
    this.#lifecycle('constructor:register-handlers');
    for (const key in this.constructor.handle) {
      this.on(key, this.constructor.handle[key])
    }

    // Create accessor for each attribute
    this.#lifecycle('constructor:register-accessors');
    for (const key in this.constructor[propRegistry]) {
      const valueFn = this.constructor[propRegistry][key]
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

    this.#lifecycle('setup:before')
    Promise.resolve(this.setup())
      .then(() => {
        this.#lifecycle('setup:after');
      })
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    this[name] = newValue
  }

  #onUnmount = new Set<() => void>()
  connectedCallback() {
    this.#lifecycle('connectedCallback');

    if (this.render) {
      this.#onUnmount.add(effect(() => {
        this.#lifecycle('render');
        return render(this.render(this), this.shadowRoot)
      }))
    }

    this.#lifecycle('mount');
    this.#onUnmount.add(this.mount() || (() => {}))
  }

  disconnectedCallback() {
    this.#lifecycle('disconnectedCallback');
    for (const cleanup of this.#onUnmount) {
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
  render() {
    return html`<slot></slot>`
  }

  /**
    * Setup is called once from the constructor. It can be async and should be
    * used to setup any initial state or side effects.
    * If you return a promise, the element will not be considered "ready"
    * until the promise resolves. However, the element will still be connected
    * to the DOM, but it will not call mount() nor will it call render() until
    * the promise resolves. Instead it will call fallback().
    *
    * You can check if the setup is done by checking the setupDone property.
   */
  setup() : void | Promise<any> {}

  /**
   * Mount is called when the element is connected to the DOM. Convenience to
   * avoid having to call super() in the connectedCallback - and faster to type
   * You can return a cleanup function that will be called when the element is
   * disconnected from the DOM - use this for `unmount` logic.
   */
  mount() {
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
    invariant(this.#lifecycle() == 'mount', "on() must only be called in mount(). Use addEventListener() elsewhere. Was called in" + this.#lifecycle())
    const remove = addEventListener(this, type, handler)
    this.#onUnmount.add(remove)
  }
}
