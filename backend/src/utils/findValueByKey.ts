export function findValueByKey<Input, Output>(
  obj: Input | any,
  key: string,
): Output | null {
  let result: Output | null = null

  for (const prop in obj) {
    if (prop === key) {
      return obj[prop]
    }

    if (obj[prop] instanceof Object || obj[prop] instanceof Array) {
      result = findValueByKey(obj[prop], key)

      if (result) {
        break
      }
    }
  }

  return result
}
