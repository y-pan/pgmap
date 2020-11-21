import { linkSync } from "fs";
import Benchmark from "../util/benchmark";
import { timeit } from "../util/utils";

interface ITrie<V> {
  get(key: string): V;
  put(key: string, value: V): void;
  delete(key: string): V;
  size(): number;
  isEmpty(): boolean;
  contains(key: string): boolean;
  keys(): string[]; //Iterable<string>;
  keysPrefix(prefix: string): string[];
  keysMatch(pattern: string): string[];
  longestPrefixOf(key: string): string;
}
type char = string; // 1 char, just for eye

const R: number = 256;

class TNode {
  value: any;
  next: TNode[];
  nextByCode(chartCode: number): TNode {
    return this.next[chartCode];
  }
  setNextByCode(chartCode: number, node: TNode): void {
    this.next[chartCode] = node;
  }
  nextByChar(c: char): TNode {
    return this.nextByCode[c.charCodeAt[0]];
  }
  constructor() {
    this.next = new Array(R);
  }
}
function isNil(x: any): boolean {
  return x === null || x === undefined || (typeof x === "number" && isNaN(x));
}
function nonNil(x: any): boolean {
  return !isNil(x);
}
function throwNil(x: any): void {
  if (isNil(x)) throw new Error("Nil!!");
}

function isEmpty(x: TNode): boolean {
  if (!x) return true;
  if (isNil(x.value)) return false;
  for (let n of x.next) {
    if (isNil(n)) return false;
  }
  return true;
}

function toCharCodes(key: string): number[] {
  let codes: number[] = new Array(key.length);
  for (let i = 0; i < key.length; i++) {
    codes[i] = key.charCodeAt(i);
  }
  return codes;
}

function toString(charCodes: number[]): string {
  return String.fromCharCode(...charCodes);
}
function toStrings(chartCodes: number[][]): string[] {
  return chartCodes.map(toString);
}
class Trie<V> implements ITrie<V> {
  private root: TNode;
  private _size: number = 0;

  get(key: string): V {
    throwNil(key);
    const keyCodes: number[] = toCharCodes(key);
    const x: TNode = this.getNode(this.root, keyCodes, 0);
    return isNil(x) ? undefined : x.value;
  }

  private getNode(x: TNode, keyCodes: number[], ni: number): TNode {
    if (isNil(x)) return undefined;
    if (ni === keyCodes.length) return x; // matched to the end of key, all done
    const nextNode = x.nextByCode(keyCodes[ni]);
    return this.getNode(nextNode, keyCodes, ni + 1);
  }

  put(key: string, value: V): void {
    throwNil(key);
    throwNil(value);
    const keyCodes: number[] = toCharCodes(key);
    this.root = this.putNode(this.root, keyCodes, value, 0);
  }
  private putNode(x: TNode, keyCodes: number[], value: V, ni: number): TNode {
    if (isNil(x)) x = new TNode();
    if (ni === keyCodes.length) {
      // end
      if (isNil(x.value)) this._size++; // adding new node
      x.value = value; // either same or different, update any
    } else {
      // not end
      const nextCode: number = keyCodes[ni];
      const nextNode = x.nextByCode(nextCode);
      x.setNextByCode(
        nextCode,
        this.putNode(nextNode, keyCodes, value, ni + 1)
      );
    }
    return x;
  }

  delete(key: string): V {
    throwNil(key);
    throw new Error("Method not implemented.");
  }
  size(): number {
    return this._size;
  }
  isEmpty(): boolean {
    return this._size === 0;
  }
  contains(key: string): boolean {
    throwNil(key);
    return nonNil(this.get(key));
  }
  keys(): string[] {
    return this.keysPrefix("");
  }
  keysPrefix(prefix: string): string[] {
    throwNil(prefix);
    const queue: number[][] = [];
    const prefixCodes: number[] = toCharCodes(prefix);
    const pnode: TNode = this.getNode(this.root, prefixCodes, 0);
    if (isNil(pnode)) return [];

    this.collect(pnode, prefixCodes, queue);
    return toStrings(queue);
  }
  keysMatch(pattern: string): string[] {
    throwNil(pattern);
    throw new Error("Method not implemented.");
  }
  private collect(x: TNode, prefixCodes: number[], queue: number[][]): void {
    if (isNil(x)) return; // no more node
    if (nonNil(x.value)) queue.push([...prefixCodes]); // shallow copy it, just an number[], to prevent
    // let isFirst = true;
    for (let charCode = 0; charCode < R; charCode++) {
      // collect from all the next
      prefixCodes.push(charCode); // to end
      this.collect(x.nextByCode(charCode), prefixCodes, queue); // not collected correctly ??  app => ["app", "app"], apple => ["apple"]
      prefixCodes.pop(); // much faster than prefixCodes.splice(prefixCodes.length - 1, 1);
    }
  }

  //  var t = new Trie(); t.put("app", "APPLICATION"); t.put("apple", "an appLE"); t.put("apple", "APPLE"); t.keysPrefix("app");

  longestPrefixOf(key: string): string {
    throwNil(key);
    throw new Error("Method not implemented.");
  }
}

function benchmark() {
  let sourceCode = `package main.dataStructures.trie;

  import main.utils.Asserts;
  
  import java.util.LinkedList;
  import java.util.Objects;
  import java.util.Queue;
  
  interface ITrie4<V> {
      V get(String key);
  
      void put(String key, V value);
  
      V delete(String key);
  
      int size();
  
      boolean isEmpty();
  
      boolean contains(String key);
  
      Iterable<String> keys();
  
      Iterable<String> keysPrefix(String prefix);
  
      Iterable<String> keysMatch(String pattern);
  
      String longestPrefixOf(String key);
  }
  
  public class Trie4<V> implements ITrie4<V> {
  
      private static final int R = 256;
      private Node root;
      private int size;
  
      @Override
      public V get(String key) {
          Objects.requireNonNull(key);
          Node x = get(root, key, 0);
          return x == null ? null : (V) x.value;
      }
  
      private Node get(Node x, String key, int ni) {
          if (x == null) return null;
          if (ni == key.length()) {
              return x;
          }
          char nc = key.charAt(ni);
          return get(x.next[nc], key, ni + 1);
      }
  
      @Override
      public void put(String key, V value) {
          Objects.requireNonNull(key);
          Objects.requireNonNull(value);
  
          root = put(root, key, value, 0);
      }
  
      private Node put(Node x, String key, V value, int ni) {
          if (x == null) x = new Node();
          if (ni == key.length()) {
              if (x.value == null) size++;
              x.value = value;
          } else {
              char nc = key.charAt(ni);
              x.next[nc] = put(x.next[nc], key, value, ni + 1);
          }
  
          return x;
      }
  
      @Override
      public V delete(String key) {
          Object[] bucket = new Object[1];
          root = delete(root, key, 0, bucket);
          return bucket.length == 0 ? null : (V) bucket[0];
      }
  
      private Node delete(Node x, String key, int ni, Object[] bucket) {
          if (x == null) return null;
          if (ni == key.length()) {
              if (x.value != null) {
                  size--;
                  bucket[0] = x.value;
              }
              x.value = null;
          } else {
              char nc = key.charAt(ni);
              x.next[nc] = delete(x.next[nc], key, ni + 1, bucket);
          }
  
          return Node.isEmpty(x) ? null : x;
      }
  
      @Override
      public int size() {
          return size;
      }
  
      @Override
      public boolean isEmpty() {
          return size == 0;
      }
  
      @Override
      public boolean contains(String key) {
          Objects.requireNonNull(key);
          return get(key) != null;
      }
  
      @Override
      public Iterable<String> keys() {
          return keysPrefix("");
      }
  
      @Override
      public Iterable<String> keysPrefix(String prefix) {
          Objects.requireNonNull(prefix);
          Queue<String> queue = new LinkedList<>();
          Node pnode = get(root, prefix, 0);
          if (pnode == null) return queue;
          collect(pnode, new StringBuilder(prefix), queue);
          return queue;
      }
  
      private void collect(Node x, StringBuilder prefix, Queue<String> queue) {
          if (x == null) return;
          if (x.value != null) queue.add(prefix.toString());
          for (char c = 0; c < R; c++) {
              prefix.append(c);
              collect(x.next[c], prefix, queue);
              prefix.deleteCharAt(prefix.length() - 1);
          }
      }
  
      @Override
      public Iterable<String> keysMatch(String pattern) {
          Objects.requireNonNull(pattern);
          Queue<String> queue = new LinkedList<>();
          StringBuilder prefix = new StringBuilder();
          collect(root, prefix, pattern, queue);
          return queue;
      }
  
      private void collect(Node x, StringBuilder prefix, String pattern, Queue<String> queue) {
          if (x == null) return;
          int ni = prefix.length();
          if (ni == pattern.length()) {
              if (x.value != null) queue.add(prefix.toString());
              return;
          }
  
          char nc = pattern.charAt(ni);
          if (nc == '.') {
              for (char c = 0; c < R; c++) {
                  prefix.append(c);
                  collect(x.next[c], prefix, pattern, queue);
                  prefix.deleteCharAt(prefix.length() - 1);
              }
          } else {
              prefix.append(nc);
              collect(x.next[nc], prefix, pattern, queue);
              prefix.deleteCharAt(prefix.length() - 1);
          }
      }
  
      @Override
      public String longestPrefixOf(String query) {
          // query is not prefix or pattern.
          // query could be: "February is the first day in a week in some countries"
          // and you return "February" since it is a key in trie, and no key like "February%"
  
          Objects.requireNonNull(query);
          int len = longestPrefixOf(root, query, 0, -1); // length indicates if prefix found. -1 for not found
          return len == -1 ? null : query.substring(0, len);
      }
  
      private int longestPrefixOf(Node x, String query, int nextIndex, int currentLength) {
          // only update currentLength when (x.value != null)
          if (x == null)
              return currentLength; // no more, return currentLength without change, it could be -1, or any positive integer. (actually nextIndex-1)
          if (x.value != null)
              currentLength = nextIndex; // this is the only place to increase currentLength. Later when we do query.subString(0, len), it's the range of [0, len)
          if (nextIndex == query.length())
              return currentLength; // query exhausted, don't go any further, return currentLength without change.
  
          char nc = query.charAt(nextIndex);
          return longestPrefixOf(x.next[nc], query, nextIndex + 1, currentLength); // recursive down, either same value of currentLength, or updated
      }
  
      private static class Node {
          private Object value;
          private Node[] next;
  
          Node() {
              next = new Node[R];
          }
  
          static boolean isEmpty(Node x) {
              if (x == null) return true;
              if (x.value != null) return false;
              for (Node n : x.next) {
                  if (n != null) return false;
              }
              return true;
          }
      }`;

  const lines: string[] = sourceCode.split("\n"); // whole text split into lines
  const words: string[] = lines
    .map((line) => line.trim()) // remove leading/ending spaces
    .flatMap((line) => line.split(/\s/)) // split line into words
    .filter((word) => !!word); // remove empty

  // repeat to make it larger
  words.push(...words);
  words.push(...words);
  words.push(...words);
  words.push(...words);
  words.push(...words);
  words.push(...words);
  words.push(...words);

  const trie = new Trie();
  const map = {};

  const triePut = () => {
    words.forEach((word, index) => {
      trie.put(word, index);
    });
  };

  const mapPut = () => {
    words.forEach((word, index) => {
      map[word] = index;
    });
  };

  const triePrefix = () => {
    const keysPrefix = trie.keysPrefix("n");
  };

  const mapPrefix = () => {
    const keysPrefix = Object.keys(map).filter((key) => key.startsWith("n"));
  };

  Benchmark.compareFuncAndShow(mapPut, triePut, 500); //In 500 runs, the speed of "mapPut" is 5.366186504927976 times as fast as "triePut".
  Benchmark.compareFuncAndShow(mapPrefix, triePrefix, 500); //In 500 runs, the speed of "mapPrefix" is 25.42857142857143 times as fast as "triePrefix".
}

(window as any).benchmark = benchmark;

(window as any).Trie = Trie;

export default Trie;
