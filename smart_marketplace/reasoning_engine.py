from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


RULES: List[Dict[str, object]] = [
    {
        "id": "high_demand_low_supply",
        "conditions": {"demand": "high", "supply": "low"},
        "action": {"price_adjustment_pct": 12, "tag": "price_increase"},
        "reason": "Demand is high while supply is low in your area.",
    },
    {
        "id": "high_demand_high_supply",
        "conditions": {"demand": "high", "supply": "high"},
        "action": {"price_adjustment_pct": 4, "tag": "mild_increase"},
        "reason": "Demand is high, but supply is also high.",
    },
    {
        "id": "low_demand_any_supply",
        "conditions": {"demand": "low"},
        "action": {"price_adjustment_pct": -8, "tag": "discount"},
        "reason": "Demand is low, suggesting a discount to increase conversions.",
    },
    {
        "id": "medium_demand_low_supply",
        "conditions": {"demand": "medium", "supply": "low"},
        "action": {"price_adjustment_pct": 6, "tag": "moderate_increase"},
        "reason": "Supply is constrained with stable demand.",
    },
]


def _bucket(value: float) -> str:
    if value >= 0.7:
        return "high"
    if value >= 0.4:
        return "medium"
    return "low"


@dataclass
class ReasoningResult:
    adjusted_price: float
    adjustment_pct: float
    rule_id: str
    explanation: str


def apply_pricing_rules(base_price: float, demand_index: float, supply_index: float) -> ReasoningResult:
    demand_bucket = _bucket(demand_index)
    supply_bucket = _bucket(supply_index)

    chosen_rule = None
    for rule in RULES:
        conditions = rule["conditions"]
        demand_ok = conditions.get("demand") in (None, demand_bucket)
        supply_ok = conditions.get("supply") in (None, supply_bucket)
        if demand_ok and supply_ok:
            chosen_rule = rule
            break

    if not chosen_rule:
        return ReasoningResult(
            adjusted_price=round(base_price, 2),
            adjustment_pct=0,
            rule_id="none",
            explanation="No pricing rule matched. Using model prediction as is.",
        )

    adjustment_pct = float(chosen_rule["action"]["price_adjustment_pct"])
    adjusted_price = base_price * (1 + adjustment_pct / 100)

    return ReasoningResult(
        adjusted_price=round(adjusted_price, 2),
        adjustment_pct=adjustment_pct,
        rule_id=str(chosen_rule["id"]),
        explanation=str(chosen_rule["reason"]),
    )


def recommend_crops_from_trends(trending_crops: List[Dict[str, object]]) -> List[str]:
    recommendations: List[str] = []
    for crop in trending_crops[:3]:
        crop_name = str(crop["crop_type"])
        volume = int(crop["search_count"])
        recommendations.append(f"Prioritize {crop_name} this week ({volume} active searches).")
    return recommendations


def create_demand_alerts(trending_crops: List[Dict[str, object]]) -> List[str]:
    alerts: List[str] = []
    for crop in trending_crops:
        crop_name = str(crop["crop_type"])
        volume = int(crop["search_count"])
        if volume >= 30:
            alerts.append(f"High-demand alert: {crop_name} is surging in buyer interest ({volume} searches).")
    return alerts
