"""
K-Means Clustering - For geographical clustering of facilities and batches
Used in: Analyze regional waste distribution, identify underserved areas
"""

import random
from typing import List, Tuple

class KMeans:
    def __init__(self, k: int, max_iterations: int = 100):
        self.k = k
        self.max_iterations = max_iterations
        self.centroids = []
        self.clusters = {}
    
    def fit(self, points: List[Tuple[float, float]], initial_centroids=None):
        """
        Fit k-means clustering on 2D points (lat, lng).
        points: list of (lat, lng) tuples
        Returns: cluster assignments {point_index: cluster_id}
        """
        if not points:
            return {}
        
        # Initialize centroids
        if initial_centroids:
            self.centroids = initial_centroids
        else:
            indices = random.sample(range(len(points)), min(self.k, len(points)))
            self.centroids = [points[i] for i in indices]
        
        for iteration in range(self.max_iterations):
            # Assign points to nearest centroid
            self.clusters = self._assign_clusters(points)
            
            # Update centroids
            new_centroids = self._update_centroids(points)
            
            # Check for convergence
            if self._centroids_converged(new_centroids):
                break
            
            self.centroids = new_centroids
        
        return self.clusters
    
    def _assign_clusters(self, points):
        """Assign each point to nearest centroid."""
        clusters = {}
        
        for idx, point in enumerate(points):
            distances = [self._distance(point, centroid) for centroid in self.centroids]
            nearest_centroid = distances.index(min(distances))
            clusters[idx] = nearest_centroid
        
        return clusters
    
    def _update_centroids(self, points):
        """Update centroid positions as mean of assigned points."""
        new_centroids = []
        
        for c in range(self.k):
            # Find all points assigned to this centroid
            assigned_points = [points[idx] for idx, cluster_id in self.clusters.items() 
                              if cluster_id == c]
            
            if assigned_points:
                # Calculate mean
                mean_lat = sum(p[0] for p in assigned_points) / len(assigned_points)
                mean_lng = sum(p[1] for p in assigned_points) / len(assigned_points)
                new_centroids.append((mean_lat, mean_lng))
            else:
                # Keep old centroid if no points assigned
                new_centroids.append(self.centroids[c])
        
        return new_centroids
    
    def _distance(self, point1, point2):
        """Calculate Euclidean distance between two points."""
        return ((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)**0.5
    
    def _centroids_converged(self, new_centroids):
        """Check if centroids have converged."""
        return all(self._distance(old, new) < 0.0001 
                  for old, new in zip(self.centroids, new_centroids))
    
    def get_cluster_centers(self):
        """Return final centroid positions."""
        return self.centroids


# Example usage for EcoTrace:
# locations = [(28.6139, 77.2090), (28.6150, 77.2100), (28.6200, 77.2200), ...]
# kmeans = KMeans(k=3)  # 3 clusters (zones)
# clusters = kmeans.fit(locations)
# centers = kmeans.get_cluster_centers()
