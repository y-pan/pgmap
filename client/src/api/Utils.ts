export function queryOf(queryObj: any): string {
  if (!queryObj) {
    return "";
  }
  return Object.keys(queryObj).reduce((result, key) => {
    const val = queryObj[key];
    const keyValueStr = key && val ? `${key}=${val}` : "";
    if (!keyValueStr) {
      return result;
    }
    return result ? `${result}&${keyValueStr}` : `?${keyValueStr}`;
  }, "");
}

export interface SMap<T> {
  [key: string]: T;
}

export function groupBy<T>(
  array: T[],
  keyExtrator: (item: T) => string
): SMap<T[]> {
  const map: SMap<T[]> = {};

  for (let item of array) {
    const key = keyExtrator(item);
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(item);
  }

  return map;
}

export function toDistinctMap<T, V>(
  array: T[],
  keyExtrator: (item: T) => string,
  valueExtractor: (item: T) => any
): SMap<V> {
  const map: SMap<V> = {};
  for (let item of array) {
    const key = keyExtrator(item);
    map[key] = valueExtractor(item);
  }
  return map;
}
