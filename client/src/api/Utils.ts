export function queryOf(queryObj: any): string {
  if (!queryObj) {
      return ''
  }
  return Object.keys(queryObj).reduce((result, key) => {
      const val = queryObj[key]
      const keyValueStr = (key && val) ? `${key}=${val}`: '' 
      if (!keyValueStr) {
          return result
      }
      return result ? `${result}&${keyValueStr}` : `?${keyValueStr}`
  }, '')
}