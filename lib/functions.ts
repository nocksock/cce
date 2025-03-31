
export const invoke = (fn, ...args) => fn(...args)

export const createCallCollection = <T extends Function>() => {
  const collection: T[] = [];
  return {
    add: (fn: T) => collection.push(fn),
    call: (...args: any[]) => {
      const cleanups = collection.map(invoke.bind(null, ...args))
      return () => cleanups.forEach(invoke)
    }
  }
}

