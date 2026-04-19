"""
BFS (Breadth-First Search) - For finding shortest path from batch to collector/recycler
Used in: Network analysis, finding minimum-hop routes between facilities
"""

from collections import deque

class Graph:
    def __init__(self):
        self.graph = {}
    
    def add_node(self, node_id, data=None):
        """Add a node to the graph."""
        if node_id not in self.graph:
            self.graph[node_id] = {"data": data, "neighbors": []}
    
    def add_edge(self, node1, node2, weight=1):
        """Add a directed edge from node1 to node2."""
        if node1 not in self.graph:
            self.add_node(node1)
        if node2 not in self.graph:
            self.add_node(node2)
        
        self.graph[node1]["neighbors"].append((node2, weight))
    
    def bfs(self, start_node, end_node=None):
        """
        BFS traversal from start_node.
        If end_node specified, returns shortest path to that node.
        Returns: (visited_nodes, distances, parent_map)
        """
        visited = set()
        queue = deque([start_node])
        distances = {start_node: 0}
        parent_map = {start_node: None}
        
        while queue:
            node = queue.popleft()
            
            if node in visited:
                continue
            
            visited.add(node)
            
            if end_node and node == end_node:
                return self._reconstruct_path(parent_map, end_node), distances[end_node]
            
            for neighbor, weight in self.graph[node]["neighbors"]:
                if neighbor not in visited:
                    new_distance = distances[node] + weight
                    
                    if neighbor not in distances or new_distance < distances[neighbor]:
                        distances[neighbor] = new_distance
                        parent_map[neighbor] = node
                    
                    queue.append(neighbor)
        
        return visited, distances, parent_map
    
    def _reconstruct_path(self, parent_map, end_node):
        """Reconstruct path from start to end using parent map."""
        path = []
        current = end_node
        
        while current is not None:
            path.append(current)
            current = parent_map.get(current)
        
        return list(reversed(path))


# Example usage for EcoTrace:
# graph = Graph()
# graph.add_node("batch_1", {"weight_kg": 50})
# graph.add_node("collector_1", {"city": "Delhi"})
# graph.add_node("recycler_1", {"type": "it_equipment"})
# graph.add_edge("batch_1", "collector_1", weight=15)
# graph.add_edge("collector_1", "recycler_1", weight=20)
# path, distance = graph.bfs("batch_1", "recycler_1")
