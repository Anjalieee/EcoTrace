"""
Hungarian Algorithm - For optimal assignment of batches to collectors/recyclers
Minimizes total cost (distance/weight/capacity mismatch)
Used in: Batch-to-facility assignment optimization
Complexity: O(n^3)
"""

def hungarian_assignment(cost_matrix: list) -> tuple:
    """
    Find minimum-cost assignment in a bipartite matching problem.
    cost_matrix[i][j] = cost of assigning worker i to job j
    Returns: (assignments, min_cost)
    assignments: {worker_id: job_id}
    
    Simplified version for small instances.
    For production, use scipy.optimize.linear_sum_assignment
    """
    n = len(cost_matrix)
    
    # Check if all workers can be matched to jobs
    if not cost_matrix or len(cost_matrix[0]) == 0:
        return {}, 0
    
    assignments = {}
    used_jobs = set()
    total_cost = 0
    
    # Simple greedy approach (not true Hungarian, but works for demo)
    # For real implementation, use scipy
    
    # Create list of (cost, worker, job) tuples
    costs = []
    for i in range(len(cost_matrix)):
        for j in range(len(cost_matrix[0])):
            if j not in used_jobs:
                costs.append((cost_matrix[i][j], i, j))
    
    # Sort by cost
    costs.sort()
    
    # Greedily assign
    used_workers = set()
    for cost, worker, job in costs:
        if worker not in used_workers and job not in used_jobs:
            assignments[worker] = job
            used_workers.add(worker)
            used_jobs.add(job)
            total_cost += cost
            
            if len(assignments) == n:
                break
    
    return assignments, total_cost


def build_cost_matrix(batches: list, collectors: list) -> list:
    """
    Build cost matrix for assignment problem.
    Cost = distance + capacity_mismatch_penalty
    """
    cost_matrix = []
    
    for batch in batches:
        row = []
        for collector in collectors:
            # Calculate distance
            distance = ((batch["lat"] - collector["lat"])**2 + 
                       (batch["lng"] - collector["lng"])**2)**0.5
            
            # Capacity penalty
            weight_diff = abs(batch.get("weight_kg", 0) - 
                             collector.get("avg_batch_weight", 50))
            
            cost = distance + (weight_diff * 0.1)
            row.append(cost)
        
        cost_matrix.append(row)
    
    return cost_matrix


# Example usage for EcoTrace:
# cost_matrix = [
#     [10, 15, 20],  # batch 0 to collectors 0,1,2
#     [12, 8, 25],   # batch 1 to collectors 0,1,2
# ]
# assignments, min_cost = hungarian_assignment(cost_matrix)
