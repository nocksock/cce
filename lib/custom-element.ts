import { html } from 'lit-html'
import { consume, Context, provide } from './context'
import { linkRender } from './view'

export class CustomElement extends HTMLElement {
  consume<T>(key: Context<T>) {
    return consume(this, key)
  }

  provide<T>(key: Context<T>, value: T) {
    return provide(this, key, value)
  }

  #removeRender?: () => void;
  connectedCallback() {
    // @ts-expect-error
    if (this.render) {
      this.#removeRender = linkRender(this)
    }
  }

  render() {
    return html`<slot></slot>`
  }

  disconnectedCallback() {
    this.#removeRender?.()
  }
}
