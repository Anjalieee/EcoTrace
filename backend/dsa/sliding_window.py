"""
Sliding Window - For time-series analysis of e-waste collection/recycling trends
Used in: Dashboard - moving average of kg diverted per week, EPR credits per month
"""

def sliding_window_sum(data: list, window_size: int) -> list:
    """
    Calculate sum of values in each sliding window.
    data: list of numeric values (e.g., daily kg diverted)
    window_size: size of the window
    Returns: list of sums for each window position
    """
    if window_size > len(data):
        return []
    
    results = []
    window_sum = sum(data[:window_size])
    results.append(window_sum)
    
    for i in range(window_size, len(data)):
        window_sum = window_sum - data[i - window_size] + data[i]
        results.append(window_sum)
    
    return results


def sliding_window_average(data: list, window_size: int) -> list:
    """Calculate moving average."""
    sums = sliding_window_sum(data, window_size)
    return [s / window_size for s in sums]


def sliding_window_max(data: list, window_size: int) -> list:
    """Find maximum value in each sliding window."""
    if window_size > len(data):
        return []
    
    from collections import deque
    results = []
    dq = deque()  # Store indices
    
    for i in range(len(data)):
        # Remove elements outside current window
        while dq and dq[0] < i - window_size + 1:
            dq.popleft()
        
        # Remove smaller elements from back
        while dq and data[dq[-1]] <= data[i]:
            dq.pop()
        
        dq.append(i)
        
        # First valid window
        if i >= window_size - 1:
            results.append(data[dq[0]])
    
    return results


def extract_time_window(records: list, start_date, end_date, date_field: str):
    """
    Extract records within a date range (time window).
    records: list of dicts with date field
    start_date, end_date: datetime objects
    date_field: name of date field in records
    Returns: filtered list
    """
    return [r for r in records if start_date <= r[date_field] <= end_date]


# Example usage for EcoTrace:
# daily_kg = [50, 60, 55, 70, 65, 80, 75]  # kg diverted each day
# weekly_avg = sliding_window_average(daily_kg, window_size=7)
# max_in_window = sliding_window_max(daily_kg, window_size=3)
