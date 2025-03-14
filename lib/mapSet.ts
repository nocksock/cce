export class MapSet<T> {
  #map = new Map<string, Set<T>>()

  add(key: string, value: any) {
    if (!this.#map.has(key)) {
      this.#map.set(key, new Set())
    }
    this.#map.get(key)!.add(value)
  }

  clear(key: string) {
    this.#map.delete(key)
  }

  forEach(key: string, cb: (value: T) => void) {
    this.#map.get(key)?.forEach(cb)
  }
}
