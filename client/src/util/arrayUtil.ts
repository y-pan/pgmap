import { isNil } from "./utils";

export function asArray<T>(arrayMaybe: T | T[]): T[] {
  if (isNil(arrayMaybe)) {
    return [];
  }
  if (Array.isArray(arrayMaybe)) {
    return arrayMaybe;
  }
  return [arrayMaybe];
}
