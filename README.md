# cce - create custom elemen (working title)

A base class for creating Web Components more conveniently.
Built on signals `lit-html` providing helpers for event handling.

> [!WARNING]
> This is still in its infancies and exploration phase. Also the name will
> *definitely* change. You may look around, you could even use it - I personally
> use it to build a couple of side projects, but I can't provide any support
> in its current state.

## Features

- Fine grained render updates using signals
- Thin convnience wrapper around native life-cycle hook
    - `mount()` instead of `connectedCallback()`
    - `on` instead of `addEventListener()` and manually cleaning up.
- Highly efficient element re-use during rerenders thanks to `lit-html`
- Setup of context providers and consumers without orchestration using string keys
    - or more memory efficient using the usual `createContext` route.
    - using the context community standard for interop.
- No synthetic events, no v-dom, all web.
- Lightweight (<7.8kb gzip, signals, context, rendering and all)

## API Overview

```js
class MyCustomElement extends CustomElement {
    // Props are reactive and available in the render() method via `this.someProp()`
    // they can be updated using setAttribute or ``<element>.someProp = newValue`
    // and can be bound in render:
    //      html`<my-element .someProp=${someValue}></my-element>`
    static props = {
        simplePropDefault: "default value",
        // can be a function that serves as a serialiser/transformer
        someOtherProp: (value = "also default") => value.toUpperCase(),
        // meaning, this works too:
        counter: Number
    }

    // For private state, simply use a private field. Public would also work,
    // but you'll most likely want a prop then.
    #somePrivateState = signal()

    // style is expected to be a CSSStylesheet instance. Create one using 
    // the builtin `css` template literal, or construct your own.
    static style = css`
        div {
            background: black;
            color: white;
        }
    `

    // A more convenient alias for constructor() { super() }
    // In one of the next minor versions setup can be async...
    setup() { 
        effect(() => console.log("somOtherProp was changed!", this.someOtherProp()))

        setTimeout(() => {
            // ... but this pattern is convenient enough most of the time.
            this.someOtherProp("new value")
        }, 500)
    }

    mount() {
        this.on('some-event', (e) => {
            // this event handler will automatically be removed on unmount
            // also events are stopped from propagating.
            // You can still use this.addEventListener when this doesn't suite
            // your needs.
            // NOTE: `this.on` is only allowed to be called here at the moment.
        })

        return () => {
            // this will be called on unmount
        }
    }

    // Render gets passed `this`, so you can destructure props etc and make
    // it easier to re-use views.
    render({counter}) {
        // the html tagged template literal is coming straight from lit-html
        return html`
            <div>
                Value of someNumberProp: ${this.someNumberProp()}
                <button @click=${() => this.counter(this.counter() + 1)}>
                    ${counter()}
                </button>

                <button @click=${() => {
                    // Shorthand for dispatching events that *bubble up* and 
                    // can be caught by shadow dom.
                    // this.dispatchEvent() works like usual, in case `on` does
                    // not suit your needs.
                    this.dispatch('simple-event')
                    this.dispatch('custom-event', payload)
                }}>
                    dispatch!
                </button>

                <!-- shadow dom! -->
                <slot></slot>
            </div>
        `
    }
}

// Don't forget to define it!
customElements.define("my-element", MyCustomElement);
```

