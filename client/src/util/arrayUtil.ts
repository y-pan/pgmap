import { isNil, MappingStrategy, SMap, toDistinctMap } from "./utils";

export function asArray<T>(arrayMaybe: T | T[]): T[] {
  if (isNil(arrayMaybe)) {
    return [];
  }
  if (Array.isArray(arrayMaybe)) {
    return arrayMaybe;
  }
  return [arrayMaybe];
}

export function mergeDistinct<T>(
  base: T | T[],
  newItems: T | T[],
  keyAccessor: (item: T) => string
): T[] {
  const map: SMap<T> = toDistinctMap<T, T>(
    [...asArray(base), ...asArray(newItems)],
    keyAccessor,
    (item) => item,
    MappingStrategy.USE_LATEST_ON_DUPLICATE
  );

  return Object.values(map); // order not guranteed
}
