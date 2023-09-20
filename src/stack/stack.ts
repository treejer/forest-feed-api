export class StackClass<T> {
  private items: T[] = [];

  set(array: T[]) {
    this.items = array;
  }

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | null {
    return this.items.length > 0 ? this.items[this.items.length - 1] : null;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  get(): T[] {
    return this.items;
  }
}
