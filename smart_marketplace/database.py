from __future__ import annotations

import random
import sqlite3
from datetime import datetime, timedelta

from config import CROPS, DB_PATH, LOCATIONS, SEASONS


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database() -> None:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS historical_market_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop_type TEXT NOT NULL,
            location TEXT NOT NULL,
            season TEXT NOT NULL,
            demand_index REAL NOT NULL,
            supply_index REAL NOT NULL,
            price REAL NOT NULL,
            date TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS search_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT NOT NULL,
            crop_type TEXT NOT NULL,
            location TEXT NOT NULL,
            user_role TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS product_listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id TEXT NOT NULL,
            crop_type TEXT NOT NULL,
            location TEXT NOT NULL,
            season TEXT NOT NULL,
            demand_index REAL NOT NULL,
            supply_index REAL NOT NULL,
            listed_price REAL NOT NULL,
            suggested_price REAL NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS negotiations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            crop_type TEXT NOT NULL,
            buyer_id TEXT NOT NULL,
            farmer_id TEXT NOT NULL,
            offered_price REAL NOT NULL,
            counter_price REAL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS negotiation_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            negotiation_id INTEGER NOT NULL,
            sender_role TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (negotiation_id) REFERENCES negotiations(id)
        )
        """
    )

    conn.commit()

    _seed_market_data(conn)
    _seed_search_logs(conn)

    conn.close()


def _seed_market_data(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    row_count = cur.execute("SELECT COUNT(*) AS count FROM historical_market_data").fetchone()["count"]
    if row_count > 0:
        return

    base_prices = {
        "Tomato": 42,
        "Potato": 30,
        "Onion": 36,
        "Wheat": 28,
        "Rice": 40,
        "Spinach": 26,
        "Mango": 95,
        "Banana": 44,
        "Milk": 58,
        "Eggs": 7,
    }

    now = datetime.utcnow()
    records = []

    for day_offset in range(240):
        date_value = (now - timedelta(days=day_offset)).date().isoformat()
        for crop in CROPS:
            for location in LOCATIONS:
                season = random.choice(SEASONS)
                demand = round(random.uniform(0.2, 1.0), 2)
                supply = round(random.uniform(0.2, 1.0), 2)
                seasonal_multiplier = {
                    "Kharif": 1.08,
                    "Rabi": 0.96,
                    "Summer": 1.12,
                    "Monsoon": 1.05,
                }[season]
                demand_effect = 1 + (demand - 0.5) * 0.5
                supply_effect = 1 - (supply - 0.5) * 0.4
                noise = random.uniform(-3.0, 3.0)
                price = max(5.0, base_prices[crop] * seasonal_multiplier * demand_effect * supply_effect + noise)

                records.append((crop, location, season, demand, supply, round(price, 2), date_value))

    cur.executemany(
        """
        INSERT INTO historical_market_data (
            crop_type, location, season, demand_index, supply_index, price, date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        records,
    )
    conn.commit()


def _seed_search_logs(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    row_count = cur.execute("SELECT COUNT(*) AS count FROM search_logs").fetchone()["count"]
    if row_count > 0:
        return

    now = datetime.utcnow()
    weighted_crops = [
        "Tomato", "Tomato", "Tomato", "Onion", "Onion", "Mango", "Rice", "Milk", "Banana", "Spinach"
    ]

    records = []
    for hour_offset in range(180):
        timestamp = (now - timedelta(hours=hour_offset)).isoformat()
        crop = random.choice(weighted_crops)
        records.append((f"buy {crop.lower()}", crop, random.choice(LOCATIONS), random.choice(["buyer", "farmer"]), timestamp))

    cur.executemany(
        """
        INSERT INTO search_logs (query, crop_type, location, user_role, timestamp)
        VALUES (?, ?, ?, ?, ?)
        """,
        records,
    )
    conn.commit()
