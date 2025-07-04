
export const invoke = (fn: Function, ...args: any[]) => fn(...args)

export const createCallCollection = <T extends Function>() => {
  const collection: T[] = [];
  return {
    add: (fn: T) => collection.push(fn),
    call: (...args: any[]) => {
      // @ts-ignore
      const cleanups = collection.map(invoke.bind(null, ...args))
      return () => cleanups.forEach(invoke)
    }
  }
}

