from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "marketplace.db"

SEASONS = ["Kharif", "Rabi", "Summer", "Monsoon"]
CROPS = [
    "Tomato",
    "Potato",
    "Onion",
    "Wheat",
    "Rice",
    "Spinach",
    "Mango",
    "Banana",
    "Milk",
    "Eggs",
]
LOCATIONS = ["Pune", "Nashik", "Delhi", "Bengaluru", "Hyderabad", "Jaipur"]
