export const nextFrame = (cb) => {
  const { promise, resolve } = Promise.withResolvers()

  requestAnimationFrame(() => {
    cb?.()
    resolve()
  })

  return promise
}
