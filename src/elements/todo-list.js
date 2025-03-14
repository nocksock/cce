import { CustomElement, html } from '../../lib/main'
import { toggleAction } from './todo-app'
import { todoContext } from './todos'
import { repeat } from 'lit-html/directives/repeat.js'

class TodoList extends CustomElement {
  static props = {
    limit: (value = -1) => Number(value),
    completed: Boolean,
  }

  list = this.consume(todoContext)

  #toggle = (id, completed) => {
    this.dispatchEvent(toggleAction(id, completed))
  }

  render({ limit, list }) {
    return html`
      <input
        type="range"
        min="0"
        max="${list().length}"
        value=${Math.min(limit(), list().length)}
        @input=${e => limit(e.target.value)}
      />
      ${this.completed() ? html`<p>Completed</p>` : html`<p>Not Completed</p>`}

      <ul>
        ${repeat(
          list()
            .filter(i => (this.completed() ? i.completed : !i.completed))
            .slice(0, limit()),
          i => i.id,
          todo => html`
            <li .id=${todo.id}>
              <label>
                <input
                  type="checkbox"
                  .checked=${todo.completed}
                  @change=${e => this.#toggle(todo.id, e.target.checked)}
                />
                ${todo.title}
              </label>
            </li>
          `
        )}
      </ul>
    `
  }
}

customElements.define('todo-list', TodoList)
