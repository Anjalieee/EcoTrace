"""
K-D Tree (KD-Tree) - For spatial indexing of collectors and recyclers
Used in: Finding nearest collector/recycler by geographic coordinates
Complexity: O(log n) average case, O(n) worst case for nearest neighbor search
"""

from typing import List, Tuple, Optional

class KDNode:
    def __init__(self, point: Tuple[float, float], data=None):
        """
        point: (lat, lng)
        data: dict with collector/recycler info
        """
        self.point = point
        self.data = data
        self.left = None
        self.right = None

class KDTree:
    def __init__(self, k=2):  # 2D tree for lat/lng
        self.root = None
        self.k = k
    
    def insert(self, point: Tuple[float, float], data=None):
        """Insert a point into the KD-tree."""
        if self.root is None:
            self.root = KDNode(point, data)
        else:
            self._insert_recursive(self.root, point, data, 0)
    
    def _insert_recursive(self, node, point, data, depth):
        axis = depth % self.k
        
        if point[axis] < node.point[axis]:
            if node.left is None:
                node.left = KDNode(point, data)
            else:
                self._insert_recursive(node.left, point, data, depth + 1)
        else:
            if node.right is None:
                node.right = KDNode(point, data)
            else:
                self._insert_recursive(node.right, point, data, depth + 1)
    
    def nearest(self, point: Tuple[float, float], k=1) -> List[dict]:
        """Find k nearest neighbors to the given point."""
        best = []
        self._nearest_recursive(self.root, point, 0, best, k)
        best.sort(key=lambda x: x["distance"])
        return best[:k]
    
    def _nearest_recursive(self, node, point, depth, best, k):
        if node is None:
            return
        
        # Calculate distance
        distance = ((node.point[0] - point[0])**2 + (node.point[1] - point[1])**2)**0.5
        
        if len(best) < k:
            best.append({
                "point": node.point,
                "data": node.data,
                "distance": distance
            })
        else:
            worst = max(best, key=lambda x: x["distance"])
            if distance < worst["distance"]:
                best.remove(worst)
                best.append({
                    "point": node.point,
                    "data": node.data,
                    "distance": distance
                })
        
        # Determine which axis to use for splitting
        axis = depth % self.k
        diff = point[axis] - node.point[axis]
        
        # Always check the side where point falls
        if diff < 0:
            self._nearest_recursive(node.left, point, depth + 1, best, k)
            # Check other side if needed
            if len(best) < k or abs(diff) < max(b["distance"] for b in best):
                self._nearest_recursive(node.right, point, depth + 1, best, k)
        else:
            self._nearest_recursive(node.right, point, depth + 1, best, k)
            # Check other side if needed
            if len(best) < k or abs(diff) < max(b["distance"] for b in best):
                self._nearest_recursive(node.left, point, depth + 1, best, k)


# Example usage for EcoTrace:
# kd_tree = KDTree()
# kd_tree.insert((28.6139, 77.2090), {"collector_id": 1, "name": "GreenCollect Delhi"})
# nearest = kd_tree.nearest((28.6150, 77.2100), k=3)  # Find 3 nearest collectors
