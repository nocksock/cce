import { consume, Context, provide } from './context'
import { render, html } from 'lit-html'
import { signal, effect } from 'kloen'

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
  static [propRegistry] = {}
  static props = {}
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

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot?.adoptedStyleSheets.push(this.constructor.style)

    // Create accessor for each attribute
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

    this.setup()
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this[name] = newValue
  }

  #removeRender?: () => void
  #mountCleanup?: () => void
  connectedCallback() {
    if (this.render) {
      this.#removeRender = effect(() => render(this.render(this), this.shadowRoot))
    }

    this.#mountCleanup = this.mount()
  }

  disconnectedCallback() {
    this.#removeRender?.()
    this.unmount()
    this.#mountCleanup?.()
  }

  /**
   * Consume a reactive value from the nearest provider for this key.
   */
  consume<T>(key: Context<T>, defaultValue?: T) {
    return consume(this, key, defaultValue)
  }

  /**
   * Provide a reactive value to alle consumers of the given key within this
   * element's subtree.
   */
  provide<T>(key: Context<T>, value: T) {
    return provide(this, key, value)
  }

  /**
   * Put your render logic here. This method will be called whenever a reactive
   * value that is used in the render method changes. This method should return
   * a lit-html template.
   */
  render() {
    return html`<slot></slot>`
  }

  /**
   * Setup is called before the element is connected to the
   * DOM. This is a good place to set up any signals or
   * effects that are needed for the element to function.
   * Convenience to avoid having to call super() in the
   * constructor.
   */
  setup() {}

  /**
   * Mount is called when the element is connected to the DOM. Convenience to
   * avoid having to call super() in the connectedCallback - and faster to type
   * You can return a cleanup function that will be called when the element is
   * disconnected from the DOM.
   */
  mount() {
    return () => {}
  }

  /**
   * Unmount is called when the element is disconnected from the DOM.
   */
  unmount() {}
}
