import { consume, CustomElement } from '../../lib/main'
import { html, render } from 'lit-html'
import { counter } from '../contexts/counter'
import { effect } from 'kloen'

const linkRender = (self: CustomElement) => {
  effect(() => render(self.render.bind(self)(), self))
}

class MyElement extends CustomElement {
  counter = this.consume(counter)

  render() {
    return html`
      ${this.counter()}
    `
  }
}

customElements.define('my-element', MyElement)
