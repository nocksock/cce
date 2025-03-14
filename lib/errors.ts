export const invariant = (cond: any, msg: string): asserts cond => {
  if(cond) return
  throw new Error(msg)
}
