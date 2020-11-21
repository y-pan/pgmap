export type Char = string; // Just for eye, no actual different

export default class TrieNode {
  private static charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  // 09: 48 -> 57
  // AZ: 65 -> 90
  // _:  95
  // az: 97 -> 122

  private static readonly R: number = 128; // ascii
  private static readonly C0: Char = "0";
  private static readonly CODE0: number = TrieNode.C0.charCodeAt(0);
  private links: TrieNode[];
  private isEnd: boolean;

  constructor() {
    this.links = new Array(TrieNode.R); // new TrieNode[TrieNode.R]();
  }

  public constainsKey(c: Char): boolean {
    return !!this.links[TrieNode.cInd(c)];
  }

  get(char: Char): TrieNode {
    return this.links[TrieNode.cInd(char)];
  }

  put(c: Char, node: TrieNode): void {
    this.links[TrieNode.cInd(c)] = node;
  }

  setEnd(): void {
    this.isEnd = true;
  }

  isTheEnd(): boolean {
    return !!this.isEnd;
  }

  getAll(): TrieNode[] {
    return this.links;
  }

  private static cInd(char: Char): number {
    return char.charCodeAt(0) - TrieNode.CODE0;
  }

  // private static cDif(char1: string, char2: string): number {
  //   return char1.charCodeAt(0) - char2.charCodeAt(1);
  // }
}
