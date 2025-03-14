import { CustomElement, html } from '../lib/main.ts'
import { fixture, expect } from '@open-wc/testing'

class BasicElement extends CustomElement {
  static props = {
    name: String
  }
  render() {
    return html`<div>${this.name()}</div>`
  }
}
customElements.define('basic-element', BasicElement)

describe('MyElement', () => {
  it('renders', async () => {
    const el = await fixture(html`<basic-element name="Hello foo"></basic-element>`)
    expect(el.shadowRoot.innerHTML).to.contain('Hello foo')
  })
})
