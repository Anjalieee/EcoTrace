"""
Max Flow / Min Cut - For capacity planning and resource allocation
Used in: Determining if all batches can be processed given collector/recycler capacities
Ford-Fulkerson algorithm with BFS (Edmonds-Karp)
"""

from collections import deque, defaultdict

class MaxFlowGraph:
    def __init__(self, vertices):
        self.V = vertices
        self.graph = defaultdict(lambda: defaultdict(int))
    
    def add_edge(self, u, v, capacity):
        """Add an edge with given capacity."""
        self.graph[u][v] += capacity
    
    def bfs(self, source, sink, parent):
        """BFS to find if path exists from source to sink."""
        visited = set([source])
        queue = deque([source])
        
        while queue:
            u = queue.popleft()
            
            for v in self.graph[u]:
                if v not in visited and self.graph[u][v] > 0:
                    visited.add(v)
                    queue.append(v)
                    parent[v] = u
                    if v == sink:
                        return True
        
        return False
    
    def max_flow(self, source, sink):
        """
        Find maximum flow from source to sink using Edmonds-Karp.
        Returns: max_flow_value
        """
        parent = {}
        max_flow_value = 0
        
        while self.bfs(source, sink, parent):
            # Find minimum capacity along the path
            path_flow = float('inf')
            s = sink
            
            while s != source:
                path_flow = min(path_flow, self.graph[parent[s]][s])
                s = parent[s]
            
            # Update residual capacities
            v = sink
            while v != source:
                u = parent[v]
                self.graph[u][v] -= path_flow
                self.graph[v][u] += path_flow
                v = parent[v]
            
            max_flow_value += path_flow
            parent = {}
        
        return max_flow_value


# Example usage for EcoTrace:
# graph = MaxFlowGraph(6)
# graph.add_edge("batch_source", "collector_1", 100)  # 100 kg batch
# graph.add_edge("collector_1", "recycler_1", 50)    # collector can send 50kg
# graph.add_edge("recycler_1", "sink", 50)           # recycler capacity 50kg
# max_flow = graph.max_flow("batch_source", "sink")  # Returns max processable kg
