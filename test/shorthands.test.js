import { html, cce } from '../lib/main.ts'
import { fixture, expect } from '@open-wc/testing'

cce('child-element', 
  { someProp: String }, 
  ({someProp, consume, onMount, style}) => {
  const value = consume('key', 'loading')

  return () => html`
    <div>
      Hello ${value()}
    </div>
  `
})

cce('parent-element', 
  { someProp: String },
  ({someProp, provide, root}) => {
  const value = provide('key', 'World')

  return () => html`<div>
    <child-element></child-element>
  </div>`
})

describe('MyElement', () => {
  it('renders', async () => {
    const el = await fixture(html`<parent-element>foobar</parent-element>`)
    expect(el.shadowRoot.querySelector('child-element').shadowRoot.innerHTML).to.match(/Hello(.*)World/)
  })
})
