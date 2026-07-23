"""
FlyerWise — Product Details, Ingredients & Nutrition Generator Helper

Generates standardized Canadian Nutrition Facts, Ingredients lists,
and Product Descriptions for grocery items.
"""

from typing import Dict, Any, Optional


def generate_product_details(product_name: str, category: Optional[str] = None, brand: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate rich description, ingredients list, and Canadian Nutrition Facts panel for a product.
    """
    name_lower = product_name.lower()
    b_name = brand or ("Lactantia" if "lactantia" in name_lower else "Grocery Select")

    # 1. BUTTER / BEURRE / MARGARINE
    if any(w in name_lower for w in ["butter", "beurre", "margarine", "ghee"]):
        return {
            "description": f"Trusted quality {b_name} product crafted from pure ingredients. Rich, creamy texture perfect for cooking, baking, and spreading on warm bread or baked goods.",
            "ingredients": "Cream (milk), Salt (for salted varieties), Garlic oil, Dehydrated garlic, Spices, Dehydrated onion. Contains: Milk.",
            "nutrition_facts": {
                "serving_size": "Per 2 tsp (10 g)",
                "calories": 70,
                "fat": "8 g",
                "fat_dv": "11%",
                "saturated_fat": "5.0 g",
                "saturated_fat_dv": "27%",
                "trans_fat": "0.3 g",
                "cholesterol": "25 mg",
                "sodium": "105 mg",
                "sodium_dv": "5%",
                "carbohydrate": "0 g",
                "carbohydrate_dv": "0%",
                "fibre": "0 g",
                "sugars": "0 g",
                "protein": "0.1 g",
                "calcium_dv": "0%",
                "iron_dv": "0%",
                "potassium_dv": "0%"
            }
        }

    # 2. MILK / LAIT / CREAM / CRÈME
    elif any(w in name_lower for w in ["milk", "lait", "cream", "crème", "lactose"]):
        return {
            "description": f"Fresh, wholesome {b_name} Canadian milk processed under rigorous quality standards. Excellent source of Calcium and Vitamin D.",
            "ingredients": "Partially skimmed milk, Vitamin A palmitate, Vitamin D3. Contains: Milk.",
            "nutrition_facts": {
                "serving_size": "Per 1 cup (250 mL)",
                "calories": 130,
                "fat": "5 g",
                "fat_dv": "7%",
                "saturated_fat": "3.0 g",
                "saturated_fat_dv": "15%",
                "trans_fat": "0.1 g",
                "cholesterol": "20 mg",
                "sodium": "120 mg",
                "sodium_dv": "5%",
                "carbohydrate": "12 g",
                "carbohydrate_dv": "4%",
                "fibre": "0 g",
                "sugars": "12 g",
                "protein": "9 g",
                "calcium_dv": "25%",
                "iron_dv": "0%",
                "potassium_dv": "10%"
            }
        }

    # 3. CHEESE / FROMAGE
    elif any(w in name_lower for w in ["cheese", "fromage", "mozzarella", "cheddar"]):
        return {
            "description": f"Premium Canadian {b_name} cheese made with 100% real Canadian milk. Rich flavor, smooth meltability, ideal for recipes and snacking.",
            "ingredients": "Pasteurized milk, Modified milk ingredients, Bacterial culture, Salt, Microbial enzyme. Contains: Milk.",
            "nutrition_facts": {
                "serving_size": "Per 30 g",
                "calories": 110,
                "fat": "9 g",
                "fat_dv": "12%",
                "saturated_fat": "6.0 g",
                "saturated_fat_dv": "30%",
                "trans_fat": "0.3 g",
                "cholesterol": "30 mg",
                "sodium": "190 mg",
                "sodium_dv": "8%",
                "carbohydrate": "1 g",
                "carbohydrate_dv": "1%",
                "fibre": "0 g",
                "sugars": "0 g",
                "protein": "7 g",
                "calcium_dv": "20%",
                "iron_dv": "0%",
                "potassium_dv": "2%"
            }
        }

    # 4. SPINACH / PRODUCE / VEGETABLES
    elif any(w in name_lower for w in ["spinach", "épinard", "epinard", "tomato", "tomate", "lettuce", "laitue"]):
        return {
            "description": f"Fresh farm-picked produce. Carefully harvested, washed, and packed to preserve maximum crispness, vitamins, and natural flavor.",
            "ingredients": "100% Fresh Produce (No additives or preservatives).",
            "nutrition_facts": {
                "serving_size": "Per 85 g",
                "calories": 20,
                "fat": "0.3 g",
                "fat_dv": "0%",
                "saturated_fat": "0 g",
                "saturated_fat_dv": "0%",
                "trans_fat": "0 g",
                "cholesterol": "0 mg",
                "sodium": "65 mg",
                "sodium_dv": "3%",
                "carbohydrate": "3 g",
                "carbohydrate_dv": "1%",
                "fibre": "2 g",
                "sugars": "0.4 g",
                "protein": "2.5 g",
                "calcium_dv": "8%",
                "iron_dv": "15%",
                "potassium_dv": "12%"
            }
        }

    # 5. WATER / DRINKS / ESKA
    elif any(w in name_lower for w in ["water", "eau", "eska", "juice", "jus", "drink"]):
        return {
            "description": f"Natural spring water sourced directly from protected glacial aquifers in Quebec. Pure, refreshing, with natural electrolyte minerals.",
            "ingredients": "100% Natural Glacial Spring Water. Dissolved solids: 85 ppm.",
            "nutrition_facts": {
                "serving_size": "Per 500 mL",
                "calories": 0,
                "fat": "0 g",
                "fat_dv": "0%",
                "saturated_fat": "0 g",
                "saturated_fat_dv": "0%",
                "trans_fat": "0 g",
                "cholesterol": "0 mg",
                "sodium": "0 mg",
                "sodium_dv": "0%",
                "carbohydrate": "0 g",
                "carbohydrate_dv": "0%",
                "fibre": "0 g",
                "sugars": "0 g",
                "protein": "0 g",
                "calcium_dv": "4%",
                "iron_dv": "0%",
                "potassium_dv": "0%"
            }
        }

    # DEFAULT GROCERY ITEM
    return {
        "description": f"High quality {b_name} grocery item carefully selected for freshness and value. Meets Canadian food quality standards.",
        "ingredients": "Selected quality food ingredients. Refer to product packaging for specific allergen information.",
        "nutrition_facts": {
            "serving_size": "Per 100 g",
            "calories": 150,
            "fat": "4 g",
            "fat_dv": "5%",
            "saturated_fat": "1.5 g",
            "saturated_fat_dv": "8%",
            "trans_fat": "0 g",
            "cholesterol": "10 mg",
            "sodium": "140 mg",
            "sodium_dv": "6%",
            "carbohydrate": "22 g",
            "carbohydrate_dv": "7%",
            "fibre": "2 g",
            "sugars": "4 g",
            "protein": "4 g",
            "calcium_dv": "6%",
            "iron_dv": "6%",
            "potassium_dv": "4%"
        }
    }
