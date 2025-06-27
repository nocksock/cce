import { CustomElement, html, signal, effect } from '../lib/main.ts'
import { ref} from '../lib/directives.ts'
import sinon from 'sinon'
import { fixture, expect } from '@open-wc/testing'

const refEventHandler = sinon.spy()
const ref$ = signal(null)

class BasicElement extends CustomElement {
  static props = {
    name: String,
  }

  setup() {
    effect(() => {
      const element = ref$()
      if (element) {
        refEventHandler(element)
      }
    })
  }

  render() {
    return html`<input ${ref(ref$)} value=${this.name()} />`
  }
}

customElements.define('basic-element', BasicElement)

describe('MyElement', () => {
  it('renders', async () => {
    const el = await fixture(html`<basic-element name="foo"></basic-element>`)
    expect(refEventHandler.called).to.equal(true)
    expect(ref$().value).to.equal('foo')
  })
})
