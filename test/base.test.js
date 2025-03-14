import { CustomElement, html } from '../lib/main.ts'
import { fixture, expect } from '@open-wc/testing'

class BasicElement extends CustomElement {
  render() {
    return html`<div>Hello World</div>`
  }
}

customElements.define('basic-element', BasicElement)

describe('MyElement', () => {
  it('renders', async () => {
    const el = await fixture(html`<basic-element></basic-element>`)
    expect(el.shadowRoot.innerHTML).to.contain('Hello World')
  })
})
