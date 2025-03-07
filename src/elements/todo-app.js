import { html } from 'lit-html'
import { css, CustomElement } from '../../lib/main'
import { todoContext } from './todos'

export const toggleAction = (id, completed) => {
  return new CustomEvent('toggle', {
    composed: true,
    bubbles: true,
    detail: { id, completed },
  })
}

export class TodoApp extends CustomElement {
  static props = { user: Number }
  todos = this.provide(todoContext, [])

  setup() {
    fetch(`https://jsonplaceholder.typicode.com/user/${this.user()}/todos`)
      .then(response => response.json())
      .then(json => this.todos(json))

    this.addEventListener('toggle', (e) => {
      this.todos(this.todos().map(todo => {
        if (todo.id === e.detail.id) {
          return { ...todo, completed: e.detail.completed }
        }
        return todo
      }))
    })
  }

  static style = css`
    :host {
      font-family: ui-monospace;
    }
    div {
      padding: 1rem;
    }
    div.lists {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  `
  render() {
    return html`
      <div>
        <h1>Demo Todo App</h1>
        <p>Count: ${this.todos().length}</p>
        <div class="lists">
          <todo-list limit="10"></todo-list>
          <todo-list limit="20" completed="completed"></todo-list>
        </div>
      </div>
    `
  }
}

customElements.define('todo-app', TodoApp)
