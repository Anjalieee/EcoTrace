"""
Trie Data Structure — Certificate UID prefix search & device name autocomplete
Used in:
  - Recycler portal Module 3: O(m) prefix search on certificate UIDs stored in Trie nodes
  - Device name autocomplete in batch registration form
"""


class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end   = False
        self.data     = None   # stores associated object at end-of-word node


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str, data=None):
        """Insert a word (e.g. certificate UID or device name) with payload."""
        node = self.root
        for char in word.lower():
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
        node.data   = data

    def search(self, word: str) -> bool:
        """Exact match lookup — O(m) where m = len(word)."""
        node = self.root
        for char in word.lower():
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end

    def autocomplete(self, prefix: str, limit: int = 10) -> list:
        """
        Return up to `limit` entries whose key starts with `prefix`.
        Returns list of {"word": str, "data": any} dicts.
        """
        node = self.root
        for char in prefix.lower():
            if char not in node.children:
                return []
            node = node.children[char]

        results = []

        def dfs(cur_node, cur_word):
            if len(results) >= limit:
                return
            if cur_node.is_end:
                results.append({"word": cur_word, "data": cur_node.data})
            for ch, child in cur_node.children.items():
                dfs(child, cur_word + ch)

        dfs(node, prefix.lower())
        return results

    def search_prefix(self, prefix: str, limit: int = 10) -> list:
        """
        Convenience wrapper — returns just the data objects (not the word strings).
        Used by the recycler certificate search endpoint.
        """
        raw = self.autocomplete(prefix, limit)
        return [r["data"] for r in raw if r.get("data") is not None]


# ── Singleton helpers ──────────────────────────────────────────────────────────

# Device-name autocomplete trie (loaded at import time from DEVICES dict)
device_trie = Trie()


def load_device_trie(devices: dict):
    """Populate device_trie from the DEVICES sample-data dict."""
    device_trie.root = TrieNode()
    for dev in devices.values():
        device_trie.insert(dev["name"], dev)


def load_from_dict(devices: dict):
    """Compatibility helper for loading device records into the shared trie."""
    load_device_trie(devices)


# Example usage:
# trie = Trie()
# trie.insert("CERT-9A8B7C6D", {"certificate_uid": "CERT-9A8B7C6D", "weight_kg": 225})
# trie.search_prefix("CERT-9")   → [{"certificate_uid": "CERT-9A8B7C6D", ...}]
