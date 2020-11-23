import { SequentialSet } from "./SequentialSet";
import Trie from "../trie/Trie";

(window as any).Trie = Trie;

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

export enum MappingStrategy {
  USE_LATEST_ON_DUPLICATE = "OVERWRITE_ON_DUPLICATE",
  USE_FIRST_ON_DUPLICATE = "USE_FIRST_ON_DUPLICATE",
  USE_LATEST_ON_DUPLICATE_WARNED = "USE_LATEST_ON_DUPLICATE_WARNED",
  USE_FIRST_ON_DUPLICATE_WARNED = "USE_FIRST_ON_DUPLICATE_WARNED",
  THROW_ON_DUPLICATE = "THROW_ON_DUPLICATE",
}

/** @summary make a map out of array. Will overwrite value when seeing duplicated keys */
export function toDistinctMap<T, V>(
  array: T[],
  keyExtrator: (item: T) => string,
  valueExtractor: (item: T) => V,
  mappingStrategy: MappingStrategy
): SMap<V> {
  const map: SMap<V> = {};
  for (let item of array) {
    const key = keyExtrator(item);
    const isDuplicated = map.hasOwnProperty(key);
    if (!isDuplicated) {
      map[key] = valueExtractor(item);
    } else {
      switch (mappingStrategy) {
        case MappingStrategy.THROW_ON_DUPLICATE:
          throw new Error("Duplicates not allowed!");

        case MappingStrategy.USE_FIRST_ON_DUPLICATE:
          break;

        case MappingStrategy.USE_FIRST_ON_DUPLICATE_WARNED:
          console.warn(`Duplicates found for key=${key}, using first.`);
          break;

        case MappingStrategy.USE_LATEST_ON_DUPLICATE:
          map[key] = valueExtractor(item);
          break;

        case MappingStrategy.USE_LATEST_ON_DUPLICATE_WARNED:
          map[key] = valueExtractor(item);
          console.warn(`Duplicates found for key=${key}, using latest.`);
          break;

        default:
          console.warn(
            `Unknown mapping strategy: ${mappingStrategy}, defaulted to ${MappingStrategy.USE_LATEST_ON_DUPLICATE}`
          );
          map[key] = valueExtractor(item);
          break;
      }
    }
  }
  return map;
}

export function compare<T>(v1: T, v2: T): number {
  if (v1 < v2) return -1;
  if (v1 > v2) return 1;
  return 0;
}

export function mapTransform<T, R>(
  map: SMap<T>,
  newKey: (oldKey: string, oldVal: T) => string,
  newVal: (oldKey: string, oldVal: T) => R
): SMap<R> {
  if (!map) return undefined;
  const newMap: SMap<R> = {};
  for (let k in map) {
    const v = map[k];
    newMap[newKey(k, v)] = newVal(k, v);
  }
  return newMap;
}

export function timeit(func: Function, numOfRepeats: number = 1): void {
  const t0 = new Date().getTime();
  for (let i = 0; i < numOfRepeats; i++) {
    func();
  }
  const t1 = new Date().getTime();
  console.log(`${numOfRepeats} runs took seconds: ${(t1 - t0) / 1000}`);
}

/**
 * @summary Time the function execution, return the execution result
 */
export function timed(func: Function): any {
  const wrapper = (...vars: any[]) => {
    const t0 = new Date().getTime();
    func(...vars);
    const t1 = new Date().getTime();
    console.log(`Took seconds: ${(t1 - t0) / 1000}`);
  };
  return wrapper;
}

export function distinctArrayOf<T>(array: T[]): T[] {
  if (!array) return array;
  return SequentialSet.ofArray(array).values();
}

export function isNil(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "number" && isNaN(value))
  );
}

export function nonNil(value: any): boolean {
  return !isNil(value);
}

export function isEmpty(value: any): boolean {
  if (isNil(value)) return true; // covers null/undefined/NaN/number
  switch (typeof value) {
    case "string":
      return !!value.trim();
    case "object":
      if (Array.isArray(value)) {
        return isNil(value) || value.length === 0;
      }
      // json obj
      for (let key in value) {
        return false; // has key in it
      }
      return true;
    default:
      return false;
  }
}

export function notEmpty(value: any): boolean {
  return !isEmpty(value);
}
