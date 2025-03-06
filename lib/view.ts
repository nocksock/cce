import { effect } from "kloen";
import { render, TemplateResult } from "lit-html";

export const linkView = (
  self: HTMLElement,
  view: (self: HTMLElement) => TemplateResult
) => 
  effect(() => render(view(self), self));

export const linkRender = (self: HTMLElement & {
  render: () => TemplateResult;
}) => 
  effect(() => render(self.render.bind(self)(), self))

