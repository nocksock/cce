import { CustomElement, PropMap } from './custom-element.ts'
import { stylesheet } from './css'
import { consume, provide } from './context.ts'
import { dispatch } from './events.ts'
import { createCallCollection, invoke } from './functions.ts'

// TODO: collect mount functions and call them all appropriately
// TODO: collect setup functions and call them all appropriately

export function cce(name: string, props: PropMap, fn: (self: any) => any) {
  // @ts-ignore
  if (arguments.length == 2) return cce(name, {}, props)

  class E extends CustomElement {
    static props = props

    #view: any;
    #mount = createCallCollection();
    #setup = createCallCollection();

    constructor() {
      super()
      this.#view = fn(this);
    }

    render = () => {
      return this.#view(this)
    }

    css = (strings: TemplateStringsArray, ...values: any[]) => {
      const style = stylesheet(strings.map((str, i) => str + (values[i] ?? "")).join(""))
      this.shadowRoot?.adoptedStyleSheets.push(style)
    }

    mount = () => this.#mount.call()
    provide = provide.bind(null, this)
    consume = consume.bind(null, this)
    dispatch = dispatch.bind(null, this)
    on = super.on.bind(this)
  }

  customElements.define(name, E)
}


export const createCustomElement = cce
