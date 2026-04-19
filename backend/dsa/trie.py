"""
TRIE Data Structure - For autocompleting device names and locations
Used in: Batch registration form (autocomplete device types, collector names, etc)
"""

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
        self.data = None  # Store associated data (device_id, collector_id, etc)

class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word: str, data=None):
        """Insert a word into the trie with optional associated data."""
        node = self.root
        for char in word.lower():
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
        node.data = data
    
    def search(self, word: str):
        """Search for an exact word in the trie."""
        node = self.root
        for char in word.lower():
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end
    
    def autocomplete(self, prefix: str, limit=10):
        """Return up to `limit` words starting with the given prefix."""
        node = self.root
        results = []
        
        # Navigate to the prefix node
        for char in prefix.lower():
            if char not in node.children:
                return results
            node = node.children[char]
        
        # DFS to collect all words from this prefix
        def dfs(current_node, current_word):
            if len(results) >= limit:
                return
            if current_node.is_end:
                results.append({
                    "word": current_word,
                    "data": current_node.data
                })
            for char, child_node in current_node.children.items():
                dfs(child_node, current_word + char)
        
        dfs(node, prefix.lower())
        return results


# Example usage for EcoTrace:
# device_trie = Trie()
# device_trie.insert("iPhone 13", {"device_id": 1, "weight": 0.17})
# device_trie.insert("iPhone 14", {"device_id": 2, "weight": 0.19})
# device_trie.autocomplete("iPhone", limit=5)
