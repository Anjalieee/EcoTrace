"""
Greedy Algorithm - For optimal batch-to-collector assignment
Used in: Assign batches to collectors with minimum total distance/cost
Goal: Maximize efficiency (minimize empty returns, distance, or cost)
"""

def greedy_batch_assignment(batches: list, collectors: list) -> dict:
    """
    Greedy assignment: assign each batch to the nearest available collector.
    batches: [{"id": 1, "lat": 28.6139, "lng": 77.2090, "weight_kg": 50}, ...]
    collectors: [{"id": 1, "lat": 28.6150, "lng": 77.2100, "capacity_kg": 500}, ...]
    Returns: {batch_id: collector_id, ...}
    """
    assignments = {}
    used_capacity = {c["id"]: 0 for c in collectors}
    
    # Sort batches by weight (descending) - assign heavy items first
    sorted_batches = sorted(batches, key=lambda x: x.get("weight_kg", 0), reverse=True)
    
    for batch in sorted_batches:
        best_collector = None
        best_distance = float('inf')
        
        for collector in collectors:
            # Check if collector has capacity
            remaining_capacity = collector.get("capacity_kg", 0) - used_capacity[collector["id"]]
            if remaining_capacity < batch.get("weight_kg", 0):
                continue
            
            # Calculate distance
            distance = ((batch["lat"] - collector["lat"])**2 + 
                       (batch["lng"] - collector["lng"])**2)**0.5
            
            if distance < best_distance:
                best_distance = distance
                best_collector = collector["id"]
        
        if best_collector:
            assignments[batch["id"]] = best_collector
            used_capacity[best_collector] += batch.get("weight_kg", 0)
    
    return assignments


def greedy_recycler_assignment(collectors: list, recyclers: list) -> dict:
    """
    Greedy assignment: assign collectors to recyclers based on specialization match.
    Returns: {collector_id: recycler_id, ...}
    """
    assignments = {}
    used_capacity = {r["id"]: 0 for r in recyclers}
    
    for collector in collectors:
        best_recycler = None
        
        for recycler in recyclers:
            # Check capacity and specialization match
            remaining = recycler.get("capacity_kg", 0) - used_capacity[recycler["id"]]
            if remaining <= 0:
                continue
            
            # Simple match: if recycler accepts any of collector's types
            # (implement based on device_types in batch)
            best_recycler = recycler["id"]
            break
        
        if best_recycler:
            assignments[collector["id"]] = best_recycler
    
    return assignments
