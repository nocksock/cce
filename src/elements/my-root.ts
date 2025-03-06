import { linkView } from "../../lib/view"
import { provide } from "../../lib/context"
import { signal } from "kloen"
import { html } from "lit-html"
import { counter } from "../contexts/counter";
import { CustomElement } from "../../lib/custom-element";

class MyRoot extends CustomElement {
  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
  
  counter = this.provide(counter, signal(0))
  
  constructor() {
    super();
    setInterval(() => this.counter(1 + this.counter()), Number(this.getAttribute("interval") || 500))
  }
}

customElements.define("my-root", MyRoot)
