def maximise_epr_value(classified_devices: list) -> dict:
    """
    Greedy algorithm: reorders classified devices by EPR credit value
    descending to maximise total EPR obligation fulfilled.

    Input: list of dicts with classification and device info
    Output: sorted list + totals

    Why Greedy works here: EPR credit per device is independent —
    choosing the highest value device first never hurts subsequent choices.
    This is the classic greedy exchange argument.
    """
    # EPR credit per classification
    EPR_VALUES = {
        "refurbish": 150,
        "recycle": 80,
        "hazardous": 30
    }

    # Assign EPR value to each device entry
    for device in classified_devices:
        device["epr_credit"] = EPR_VALUES.get(device["classification"], 0)

    # Greedy sort: highest EPR credit first
    sorted_devices = sorted(
        classified_devices,
        key=lambda x: x["epr_credit"],
        reverse=True
    )

    # Compute totals
    total_epr_credit = sum(d["epr_credit"] for d in sorted_devices)
    refurbish_count = sum(1 for d in sorted_devices if d["classification"] == "refurbish")
    recycle_count = sum(1 for d in sorted_devices if d["classification"] == "recycle")
    hazardous_count = sum(1 for d in sorted_devices if d["classification"] == "hazardous")
    total_weight_kg = sum(d.get("weight_kg", 0) for d in sorted_devices)
    total_copper_kg = sum(d.get("copper_kg", 0) for d in sorted_devices)
    total_gold_g = sum(d.get("gold_g", 0) for d in sorted_devices)
    total_cadmium_g = sum(d.get("cadmium_g", 0) for d in sorted_devices)

    return {
        "sorted_devices": sorted_devices,
        "total_epr_credit": round(total_epr_credit, 2),
        "refurbish_count": refurbish_count,
        "recycle_count": recycle_count,
        "hazardous_count": hazardous_count,
        "total_weight_kg": round(total_weight_kg, 3),
        "total_copper_kg": round(total_copper_kg, 4),
        "total_gold_g": round(total_gold_g, 4),
        "total_cadmium_g": round(total_cadmium_g, 4),
        "co2_avoided_kg": round(total_copper_kg * 3.5, 3)  # 1 tonne copper = 3.5 tonne CO2
    }