"""
Maxi Official Master Catalog Harvester & Normalizer

Fetches official digital product titles from Maxi/Loblaw publications & Flipp APIs.
"""

import requests
import json
import os

MASTER_CATALOG_FILE = os.path.join(os.path.dirname(__file__), "maxi_official_catalog.json")

OFFICIAL_MAXI_ITEMS = [
    # Produce & Fresh Meats
    "Fresh Boneless Skinless Chicken Breasts", "Chicken Lollipops & Drumsticks", "Lean Ground Beef, Pork & Veal 450g",
    "Pork Loin Chops Club Pack", "Fresh Atlantic Salmon Fillets", "PMC Basa Fillets 400g", "Shrimp Medium Cooked 340g",
    "Red Vine Tomatoes", "Grape Tomatoes 1 Pint", "English Cucumbers", "Yellow Onions 3lb Bag", "Russet Potatoes 10lb Bag",
    "Gala Apples 3lb Bag", "Bananas Organic", "Strawberries 1lb", "Blueberries 1 Pint", "Avocados 5-pack",
    "Baby Spinach 227g", "Romaine Lettuce Hearts 3-pack", "Celery Stalks",
    
    # Dairy & Refrigerated
    "Lactantia PurFil Milk 2L 2%", "Natrel Fine Filtered Milk 2L", "Selection Butter 454g Salted", "Becel Margarine 850g",
    "Cracker Barrel Cheese Block 400g", "Kraft Singles Cheese Slices 410g", "Cracker Barrel Signature Cheese Spread 200g",
    "Iögo Nano Yogurt 6x93ml", "Danone Oikos Greek Yogurt 4x100g", "Philadelphia Cream Cheese 227g",
    
    # Pantry & Dry Foods
    "Annie's Macaroni & Cheese 170g", "Catelli Pasta Spaghetti 900g", "PC Splendido Extra Virgin Olive Oil 1L",
    "No Name White Bread 675g", "No Name Hamburger Buns 12-pack", "Quaker Crispy Minis Rice Cakes", "RealFruit Dare Gummies 180g",
    "Royal Sliced Deli Meat 300g", "St-Hubert Chicken Noodle Soup 540ml", "Heinz Tomato Ketchup 1L",
    
    # Frozen
    "Ben & Jerry's Ice Cream 473ml", "Magnum Ice Cream Bars 3-pack", "Breyers Classic Ice Cream 1.66L",
    "McCain Superfast French Fries 900g", "Pillsbury Pizza Pockets 4-pack", "Cavendish Farms Hash Browns",
    
    # Beverages & Household
    "Simply Orange Juice 1.54L", "Allen's Apple Juice 1L", "Sparkling Ice Water 503ml", "Powerade Sports Drink 710ml",
    "Coors Light Beer 24-pack", "Bud Light Beer 24-pack", "Budweiser Beer 24-pack", "Miller Lite Beer 24-pack",
    "Sleeman Clear 2.0 Beer 40 Canettes", "Tide Pods Laundry Detergent 22-pack", "Downy April Fresh Liquid Fabric Softener 1.53L",
    "Dawn Ultra Liquid Dish Soap 473ml", "Charmin Ultra Soft Toilet Paper 8-24 Rolls", "Mr. Clean All-Purpose Cleaner 1.3L"
]


def harvest_maxi_catalog() -> list[str]:
    """
    Query active Loblaw & Flipp APIs for current official Maxi product titles.
    Merges them with the master catalog list.
    """
    catalog = set(OFFICIAL_MAXI_ITEMS)
    
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get("https://backflipp.wishabi.com/flipp/flyers?locale=en&postal_code=H3B3A7", headers=headers, timeout=10)
        if r.status_code == 200:
            flyers = r.json().get("flyers", [])
            maxi_flyers = [f for f in flyers if "maxi" in f.get("merchant", "").lower()]
            for mf in maxi_flyers:
                fid = mf.get("id")
                r2 = requests.get(f"https://backflipp.wishabi.com/flipp/flyers/{fid}", headers=headers, timeout=10)
                if r2.status_code == 200:
                    items = r2.json().get("items", [])
                    for item in items:
                        name = item.get("name")
                        brand = item.get("brand")
                        if name:
                            clean_n = name.strip().title()
                            catalog.add(clean_n)
                        if brand and name:
                            catalog.add(f"{brand} {name}".strip().title())
    except Exception as e:
        print(f"Warning: API catalog harvest error: {e}")

    result_list = sorted(list(catalog))
    with open(MASTER_CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(result_list, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Harvested {len(result_list)} official Maxi master products into catalog!")
    return result_list


if __name__ == "__main__":
    harvest_maxi_catalog()
