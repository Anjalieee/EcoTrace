"""
Max Heap - For priority queue of batches (sort by urgency/weight/EPR credits)
Used in: Collector/Recycler dashboard - show highest priority batches first
"""

class MaxHeap:
    def __init__(self):
        self.heap = []
    
    def insert(self, priority, value):
        """Insert an item with a priority into the max heap."""
        self.heap.append({"priority": priority, "value": value})
        self._bubble_up(len(self.heap) - 1)
    
    def extract_max(self):
        """Remove and return the item with highest priority."""
        if len(self.heap) == 0:
            return None
        
        max_item = self.heap[0]
        
        if len(self.heap) == 1:
            self.heap = []
        else:
            self.heap[0] = self.heap[-1]
            self.heap.pop()
            self._bubble_down(0)
        
        return max_item
    
    def peek_max(self):
        """Return the item with highest priority without removing it."""
        if len(self.heap) == 0:
            return None
        return self.heap[0]
    
    def _bubble_up(self, index):
        """Move item up to maintain heap property."""
        while index > 0:
            parent_index = (index - 1) // 2
            if self.heap[index]["priority"] > self.heap[parent_index]["priority"]:
                self.heap[index], self.heap[parent_index] = self.heap[parent_index], self.heap[index]
                index = parent_index
            else:
                break
    
    def _bubble_down(self, index):
        """Move item down to maintain heap property."""
        while True:
            largest = index
            left = 2 * index + 1
            right = 2 * index + 2
            
            if left < len(self.heap) and self.heap[left]["priority"] > self.heap[largest]["priority"]:
                largest = left
            
            if right < len(self.heap) and self.heap[right]["priority"] > self.heap[largest]["priority"]:
                largest = right
            
            if largest != index:
                self.heap[index], self.heap[largest] = self.heap[largest], self.heap[index]
                index = largest
            else:
                break
    
    def get_top_k(self, k):
        """Return top k items by priority (without modifying heap)."""
        sorted_items = sorted(self.heap, key=lambda x: x["priority"], reverse=True)
        return sorted_items[:k]


# Example usage for EcoTrace:
# heap = MaxHeap()
# heap.insert(150.0, {"batch_id": 1, "weight_kg": 150})  # High weight = high priority
# heap.insert(75.0, {"batch_id": 2, "weight_kg": 75})
# top_batch = heap.extract_max()  # Get most urgent batch
