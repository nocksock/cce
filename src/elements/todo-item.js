import { html } from 'lit-html'
import { CustomElement } from '../../lib/main'
import { todoContext } from './todos';

export class TodoItem extends CustomElement {

  static props = {
    foo: Number,
    meh: value => value
  }

  render() {
    return html`
      <style>
        div {
          padding: 0.5rem;
        }
      </style>

      <div>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('todo-item', TodoItem)

