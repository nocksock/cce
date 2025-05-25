import { CustomElement, html, signal } from '../lib/main.ts'
import { fixture, expect, nextFrame } from '@open-wc/testing'
import sinon from 'sinon'

const parentEventHandler = sinon.spy()
const childEventHandler = sinon.spy()

class ParentElement extends CustomElement {
  mount() {
    this.on('event-for-parent', parentEventHandler)
    this.on('event-for-child', (e) => {
      e.stopPropagation()
      throw new Error('Should not be called')
    })
  }
}

class ChildElement extends CustomElement {
  mount() {
    this.on('event-for-child', (e) => {
      e.stopPropagation()
      childEventHandler(e)
    })
  }

  trigger(doc) {
    this.dispatch('event-for-parent')
  }
}

customElements.define('parent-element', ParentElement)
customElements.define('child-element', ChildElement)

describe('CustomElement', () => {
  it('provides event helpers', async () => {
    const el = await fixture(html`
      <parent-element>
        <child-element>
          Hello World
          <nested-element></nested-element>
        </child-element>
      </parent-element>
    `)

    const parent = document.querySelector('parent-element')
    const child = document.querySelector('child-element')
    const nested = el.querySelector('nested-element')
    const doc = {title: "some title"}

    child.trigger(doc)
    expect(parentEventHandler.called).to.equal(true)
    expect(parentEventHandler.callCount).to.equal(1)

    child.trigger(doc)
    expect(parentEventHandler.callCount).to.equal(2)

    nested.dispatchEvent(new Event('event-for-child', {
      bubbles: true,
      composed: true,
    }))

    // if this succeeds, the event was not caught by the parent which would've
    // thrown an error.
    expect(childEventHandler.callCount).to.equal(1)

    // Verify that event handlers are not called when the element is not mounted
    parent.remove()
    child.trigger(doc)
    expect(parentEventHandler.callCount).to.equal(2)

    // and that they are called when the element is re-mounted
    document.body.appendChild(parent)
    child.trigger(doc)
    expect(parentEventHandler.callCount).to.equal(3)
  })
})
