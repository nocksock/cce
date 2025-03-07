# cce - create custom element

helpers for creating Web Components


## Basic usage

```js
class MyCustomElement extends CustomElement {
    // props are reactive and available in the render() method via `this.someProp()`
    // they can be updated using setAttribute or ``<element>.someProp = newValue`
    static props = {
        simplePropDefault: "default value",

        // can be a function that serves as a serialiser/transformer
        someOtherProp: (value = "also default") => value.toUpperCase(),

        // meaning, this works too:
        counter: Number
    }

    static style = css`
        div {
            background: black;
            color: white;
        }
    `

    setup() { // more convenient alias for constructor() { super() }
        effect(() => console.log("somOtherProp was changed!", this.someOtherProp()))

        setTimeout(() => {
            this.someOtherProp("new value")
        }, 500)
    }

    render() {
        // the html tagged template literal is coming straight from lit-html
        return html`
            <div>
                Value of someNumberProp: ${this.someNumberProp()}
                <button @click=${() => this.counter(this.counter() + 1)}>
                    ${this.counter()}
                </button>

                <!-- shadow dom! -->
                <slot></slot>
            </div>
        `
    }
}

customElements.define("my-element", MyCustomElement);
```
