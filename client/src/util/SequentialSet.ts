export class SequentialSet<T> {
  private list: T[];
  private set: Set<T>;

  static ofArray<T>(array: T[]): SequentialSet<T> {
    const set = new SequentialSet(array);
    return set;
  }

  constructor(items?: T[]) {
    this.set = new Set();
    this.list = [];
    this.addAll(items);
  }

  addAll(items: T[]): void {
    items && items.forEach((item) => this.add(item));
  }

  withAll(items: T[]): SequentialSet<T> {
    this.addAll(items);
    return this;
  }

  with(item: T): SequentialSet<T> {
    this.add(item);
    return this;
  }

  add(item: T): void {
    if (this.set.has(item)) {
      return;
    }
    this.set.add(item);
    this.list.push(item);
  }

  has(item: T): boolean {
    return this.set.has(item);
  }

  remove(item: T): T {
    if (!this.set.has(item)) {
      return undefined;
    }
    this.set.delete(item);
    const i = this.list.indexOf(item);
    return this.list.splice(i, 1)[0];
  }

  removeAll(): void {
    this.set.clear();
    this.list = [];
  }

  values(): T[] {
    return this.list;
  }

  forEach(consumer: (item: T, index: number) => void): void {
    this.list.forEach(consumer);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.list.filter(predicate);
  }

  find(predicate: (item: T) => boolean): T {
    return this.list.find(predicate);
  }
}
