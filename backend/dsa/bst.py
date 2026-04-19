"""
Binary Search Tree (BST) - For maintaining sorted list of EPR credits/certificates
Used in: Dashboard - querying EPR credits by date range, finding median EPR value
"""

class BSTNode:
    def __init__(self, key, value):
        self.key = key  # e.g., certificate_date or epr_credits
        self.value = value  # certificate data
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None
    
    def insert(self, key, value):
        """Insert a key-value pair into the BST."""
        if self.root is None:
            self.root = BSTNode(key, value)
        else:
            self._insert_recursive(self.root, key, value)
    
    def _insert_recursive(self, node, key, value):
        if key < node.key:
            if node.left is None:
                node.left = BSTNode(key, value)
            else:
                self._insert_recursive(node.left, key, value)
        else:
            if node.right is None:
                node.right = BSTNode(key, value)
            else:
                self._insert_recursive(node.right, key, value)
    
    def range_query(self, min_key, max_key):
        """Return all values whose keys are in [min_key, max_key]."""
        results = []
        self._range_recursive(self.root, min_key, max_key, results)
        return results
    
    def _range_recursive(self, node, min_key, max_key, results):
        if node is None:
            return
        
        # Visit left subtree if necessary
        if min_key < node.key:
            self._range_recursive(node.left, min_key, max_key, results)
        
        # Include current node if in range
        if min_key <= node.key <= max_key:
            results.append(node.value)
        
        # Visit right subtree if necessary
        if max_key > node.key:
            self._range_recursive(node.right, min_key, max_key, results)
    
    def inorder_traversal(self):
        """Return all values in sorted order."""
        results = []
        self._inorder(self.root, results)
        return results
    
    def _inorder(self, node, results):
        if node is None:
            return
        self._inorder(node.left, results)
        results.append(node.value)
        self._inorder(node.right, results)


# Example usage for EcoTrace:
# bst = BinarySearchTree()
# bst.insert(100.5, {"batch_id": 1, "date": "2024-01-15"})
# bst.insert(250.0, {"batch_id": 2, "date": "2024-01-20"})
# credits_in_range = bst.range_query(100, 200)  # EPR credits between 100-200
