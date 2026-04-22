import math

class KDNode:
    def __init__(self, point, entity_id, entity_data, left=None, right=None):
        self.point = point          # (lat, lng)
        self.entity_id = entity_id
        self.entity_data = entity_data
        self.left = left
        self.right = right


class KDTree:
    """
    2D k-d Tree for spatial nearest-neighbour queries on
    collector and recycler coordinates.

    Supports O(log n) nearest neighbour search vs O(n) brute force.
    """

    def __init__(self):
        self.root = None

    def _build(self, points: list, depth: int = 0) -> KDNode:
        if not points:
            return None
        axis = depth % 2  # 0 = lat, 1 = lng
        points.sort(key=lambda x: x["point"][axis])
        mid = len(points) // 2
        return KDNode(
            point=points[mid]["point"],
            entity_id=points[mid]["id"],
            entity_data=points[mid]["data"],
            left=self._build(points[:mid], depth + 1),
            right=self._build(points[mid + 1:], depth + 1)
        )

    def build(self, entities: list):
        """
        Build tree from list of entities.
        entities = [{"id": int, "point": (lat, lng), "data": dict}, ...]
        """
        self.root = self._build(entities)

    def _distance(self, p1: tuple, p2: tuple) -> float:
        """Euclidean distance between two (lat, lng) points"""
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

    def _nearest(self, node: KDNode, target: tuple, depth: int, best: list):
        if node is None:
            return
        dist = self._distance(node.point, target)
        if not best or dist < best[0][0]:
            best.clear()
            best.append((dist, node))

        axis = depth % 2
        diff = target[axis] - node.point[axis]
        close, away = (node.left, node.right) if diff <= 0 else (node.right, node.left)

        self._nearest(close, target, depth + 1, best)
        if not best or abs(diff) < best[0][0]:
            self._nearest(away, target, depth + 1, best)

    def find_k_nearest(self, target: tuple, k: int = 3) -> list:
        """
        Find k nearest entities to target (lat, lng).
        Returns list of entity_data dicts with distance added.
        """
        if self.root is None:
            return []

        # Collect all distances (simpler for small k)
        all_nodes = []
        self._collect_all(self.root, all_nodes)
        all_nodes.sort(key=lambda x: self._distance(x.point, target))
        results = []
        for node in all_nodes[:k]:
            data = dict(node.entity_data)
            data["distance_km"] = round(self._distance(node.point, target) * 111, 2)
            results.append(data)
        return results

    def _collect_all(self, node: KDNode, result: list):
        if node is None:
            return
        result.append(node)
        self._collect_all(node.left, result)
        self._collect_all(node.right, result)

    def load_from_db(self, entities: list):
        """
        Load collectors or recyclers from DB.
        entities = list of dicts with id, lat, lng, plus other fields
        """
        points = [
            {
                "id": e["id"],
                "point": (float(e["lat"]), float(e["lng"])),
                "data": e
            }
            for e in entities
        ]
        self.build(points)


# Singleton instances - one for collectors, one for recyclers
collector_tree = KDTree()
recycler_tree = KDTree()