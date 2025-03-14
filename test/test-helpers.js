export const nextFrame = () => {
  const { promise, resolve } = Promise.withResolvers()
  requestAnimationFrame(resolve)
  return promise
}
