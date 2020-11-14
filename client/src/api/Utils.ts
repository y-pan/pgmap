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

/**
 *
 * @sumary group array by key, extracted by keyExtractor.
 * Use valExtractor to extract new shape of item if provided, default to use original item.
 */
export function groupBy<T, V>(
  array: T[],
  keyExtractor: (item: T) => string,
  valExtractor?: (item: T) => V
): SMap<T[] | V[]> {
  const map: SMap<any[]> = {};

  for (let item of array) {
    const key = keyExtractor(item);
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(valExtractor ? valExtractor(item) : item);
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

export function compare<T>(v1: T, v2: T): number {
  if (v1 < v2) return -1;
  if (v1 > v2) return 1;
  return 0;
}
