export const stylesheet = (css: string) => {
  const stylesheet = new CSSStyleSheet()
  stylesheet.replaceSync(css)
  return stylesheet
}

export const css = (strings: TemplateStringsArray, ...values: any[]) => 
  stylesheet(strings.map((str, i) => str + (values[i] ?? "")).join(""))
