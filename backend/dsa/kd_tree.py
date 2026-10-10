import math

class KDNode:
    def __init__(self, point, entity_id, entity_data, left=None, right=None):
        self.point = point
        self.entity_id = entity_id
        self.entity_data = entity_data
        self.left = left
        self.right = right


class KDTree:
    def __init__(self):
        self.root = None

    def _build(self, points: list, depth: int = 0) -> KDNode:
        if not points:
            return None
        axis = depth % 2
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
        self.root = self._build(entities)

    def _haversine_km(self, p1: tuple, p2: tuple) -> float:
        """
        Accurate distance in km between two (lat, lng) points.
        Uses Haversine formula — critical for geographic correctness.
        Euclidean distance was the root cause of the Delhi/Bangalore bug
        because it treats lat/lng as flat plane coordinates, which is
        wildly inaccurate at India's geographic scale.
        """
        R = 6371  # Earth radius in km
        lat1, lon1 = math.radians(p1[0]), math.radians(p1[1])
        lat2, lon2 = math.radians(p2[0]), math.radians(p2[1])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        return R * 2 * math.asin(math.sqrt(a))

    def _collect_all(self, node: KDNode, result: list):
        if node is None:
            return
        result.append(node)
        self._collect_all(node.left, result)
        self._collect_all(node.right, result)

    def find_within_radius(self, target: tuple, radius_km: float, k: int = 5) -> list:
        """
        Returns up to k entities whose own service_radius_km covers the target point
        AND whose actual distance from target is within radius_km.

        Double filter:
        1. Entity must be within radius_km of the query point
        2. Entity's own service_radius must also cover this location
        """
        if self.root is None:
            return []

        all_nodes = []
        self._collect_all(self.root, all_nodes)

        results = []
        for node in all_nodes:
            actual_dist = self._haversine_km(node.point, target)

            # Get this entity's own declared service radius
            entity_service_radius = float(
                node.entity_data.get("service_radius_km", 9999)
            )

            # Both conditions must be true
            if actual_dist <= radius_km and actual_dist <= entity_service_radius:
                data = dict(node.entity_data)
                data["distance_km"] = round(actual_dist, 2)
                results.append(data)

        # Sort by distance, return closest k
        results.sort(key=lambda x: x["distance_km"])
        return results[:k]

    def find_k_nearest(self, target: tuple, k: int = 3,
                       max_radius_km: float = 50) -> list:
        """
        Returns k nearest entities within max_radius_km.
        Default 50km — prevents cross-city results entirely.
        """
        return self.find_within_radius(target, max_radius_km, k)

    def load_from_db(self, entities: list):
        points = [
            {
                "id": e["id"],
                "point": (float(e["lat"]), float(e["lng"])),
                "data": e
            }
            for e in entities
        ]
        self.build(points)


collector_tree = KDTree()
recycler_tree = KDTree()