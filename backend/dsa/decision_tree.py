"""
Decision Tree - For device classification (refurbishable vs recyclable vs hazardous)
Used in: Batch triage engine - automatically categorize devices
"""

class DecisionTreeNode:
    def __init__(self, feature=None, threshold=None, left=None, right=None, label=None):
        self.feature = feature  # e.g., "age", "weight", "device_type"
        self.threshold = threshold  # e.g., 5 (years)
        self.left = left  # Child if feature <= threshold
        self.right = right  # Child if feature > threshold
        self.label = label  # Classification: "refurbishable", "recyclable", "hazardous"
    
    def is_leaf(self):
        return self.label is not None

class DecisionTree:
    def __init__(self):
        self.root = None
    
    def build_simple_tree(self):
        """
        Build a simple decision tree for e-waste classification.
        Rules:
        - If age < 3 years: likely refurbishable
        - If weight > 20kg: likely hazardous (large appliance)
        - Otherwise: recyclable
        """
        # Leaf nodes (classifications)
        refurbish = DecisionTreeNode(label="refurbishable")
        recyclable = DecisionTreeNode(label="recyclable")
        hazardous = DecisionTreeNode(label="hazardous")
        
        # Age check
        age_node = DecisionTreeNode(feature="age_years", threshold=3, left=refurbish, right=None)
        
        # Weight check (if age >= 3)
        weight_node = DecisionTreeNode(feature="weight_kg", threshold=20, left=recyclable, right=hazardous)
        age_node.right = weight_node
        
        self.root = age_node
    
    def classify(self, device_data: dict) -> str:
        """
        Classify a device based on its features.
        device_data: {"age_years": 4, "weight_kg": 15, "category": "laptop", ...}
        Returns: "refurbishable", "recyclable", or "hazardous"
        """
        return self._traverse(self.root, device_data)
    
    def _traverse(self, node, device_data):
        if node.is_leaf():
            return node.label
        
        feature_value = device_data.get(node.feature, 0)
        
        if feature_value <= node.threshold:
            return self._traverse(node.left, device_data)
        else:
            return self._traverse(node.right, device_data)


# Example usage for EcoTrace:
# tree = DecisionTree()
# tree.build_simple_tree()
# device = {"age_years": 2, "weight_kg": 2, "category": "phone"}
# classification = tree.classify(device)  # Returns "refurbishable"
