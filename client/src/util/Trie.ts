import TrieNode from "./TrieNode";

class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      const curr = word.charAt(i);
      if (!node.constainsKey(curr)) {
        node.put(curr, new TrieNode());
      }
      node = node.get(curr);
    }
    node.setEnd();
  }

  private searchPrefix(word: string): TrieNode {
    return this.searchPrefixFr(this.root, word);
  }

  private searchPrefixFr(fromNode: TrieNode, word: string): TrieNode {
    let node = fromNode;
    for (let i = 0; i < word.length; i++) {
      let curr = word.charAt(i);

      if (curr === ".") {
        for (let child of node.getAll()) {
          if (!!child) {
            let searchFromChild = this.searchPrefixFr(child, word.substr(++i));
            if (!!searchFromChild) {
              return searchFromChild;
            }
          }
        }
      } else if (node.constainsKey(curr)) {
        node = node.get(curr);
      } else {
        return undefined;
      }
    }
    return node;
  }

  search(word: string): boolean {
    const node = this.searchPrefix(word);
    return node && node.isTheEnd();
  }

  startsWith(prefix: string) {
    const node = this.searchPrefix(prefix);
    return !!node;
  }
}

export default Trie;
