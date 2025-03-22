import { CustomElement } from './custom-element.ts'
import { html, render } from './html'
import { css, stylesheet } from './css'
import { provide} from './context'

export function cce(name, props, fn) {
  if (arguments.length == 2) return cce(name, {}, props)

  class Element extends CustomElement {
    static props = props

    #view;
    #onmount;
    #setup;

    constructor() {
      super()
      this.#view = fn(Object.assign(this, {
        mount: (fn) => this.#onmount = fn,
        provide: this.provide.bind(this),
        consume: this.consume.bind(this),
        dispatch: this.dispatch.bind(this),
        on: this.on.bind(this),
        css: (strings: TemplateStringsArray, ...values: any[]) => {
          const style = stylesheet(strings.map((str, i) => str + (values[i] ?? "")).join(""))
          this.shadowRoot?.adoptedStyleSheets.push(style)
        },
      })).bind(this);
    }

    render() {
      return this.#view(this)
    }

    mount() {
      return this.#onmount?.()
    }
  }

  customElements.define(name, Element)
}

