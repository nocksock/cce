import { cce, html, css } from "../lib/main";

cce('parent-element', {someProp: String}, ({someProp, provide}) => {
  const value = provide('value', 'some value')
  return () => html`<div>Hello ${value()} <child-element .someProp=${123}></child-element></div>`
});

cce('child-element', ({provide, consume, css, ...self}) => {
  const value = consume('value', 'default value')

  css`
    * {
      color: red;
    }
  `

  return ({someProp}) => html`<div>Child Elemenent: ${value()}</div>`
});

