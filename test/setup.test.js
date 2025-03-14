import { CustomElement, html, signal } from '../lib/main.ts'
import { fixture, expect } from '@open-wc/testing'

const $resolvers = signal()
class BasicElement extends CustomElement {
  async setup() {
    await $resolvers.promise
  }

  render() {
    return html`<div>Hello World</div>`
  }
}
customElements.define('basic-element', BasicElement)

// describe('MyElement', () => {
//   it('renders', async () => {
//     $resolvers(Promise.withResolvers())
//     const el = await fixture(html`<basic-element></basic-element>`)
//     expect(el.shadowRoot.innerHTML).not.to.contain('Hello World')
//     $resolvers().resolve()
//     await $resolvers().promise
//     expect(el.shadowRoot.innerHTML).to.contain('Hello World')
//   })
// })
