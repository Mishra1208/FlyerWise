"""
FlyerWise Product Name Normalizer

Handles the critical task of normalizing product names from different stores
so they can be matched across stores for price comparison.

Challenges:
- Different stores use different naming conventions
- Quebec stores may use French names (e.g., "Tomates grappe" vs "Vine Tomatoes")
- Units embedded in names (e.g., "1 lb", "per kg")
- Brand names mixed into product names
"""

import re
from unidecode import unidecode


# Common French-to-English grocery translations
FR_EN_TRANSLATIONS = {
    "tomate": "tomato",
    "tomates": "tomatoes",
    "pomme": "apple",
    "pommes": "apples",
    "pomme de terre": "potato",
    "pommes de terre": "potatoes",
    "lait": "milk",
    "pain": "bread",
    "beurre": "butter",
    "fromage": "cheese",
    "poulet": "chicken",
    "boeuf": "beef",
    "porc": "pork",
    "oeuf": "egg",
    "oeufs": "eggs",
    "riz": "rice",
    "sucre": "sugar",
    "sel": "salt",
    "huile": "oil",
    "eau": "water",
    "jus": "juice",
    "banane": "banana",
    "bananes": "bananas",
    "orange": "orange",
    "oranges": "oranges",
    "carotte": "carrot",
    "carottes": "carrots",
    "oignon": "onion",
    "oignons": "onions",
    "ail": "garlic",
    "concombre": "cucumber",
    "laitue": "lettuce",
    "celeri": "celery",
    "brocoli": "broccoli",
    "champignon": "mushroom",
    "champignons": "mushrooms",
    "poivron": "pepper",
    "poivrons": "peppers",
    "fraise": "strawberry",
    "fraises": "strawberries",
    "bleuet": "blueberry",
    "bleuets": "blueberries",
    "raisin": "grape",
    "raisins": "grapes",
    "cerise": "cherry",
    "cerises": "cherries",
    "peche": "peach",
    "peches": "peaches",
    "poire": "pear",
    "poires": "pears",
    "melon": "melon",
    "pasteque": "watermelon",
    "ananas": "pineapple",
    "mangue": "mango",
    "avocat": "avocado",
    "avocats": "avocados",
    "citron": "lemon",
    "citrons": "lemons",
    "lime": "lime",
    "grappe": "vine",
    "bio": "organic",
    "frais": "fresh",
    "congele": "frozen",
    "entier": "whole",
    "tranche": "sliced",
    "hache": "ground",
    "poitrine": "breast",
    "cuisse": "thigh",
    "saucisse": "sausage",
    "jambon": "ham",
    "bacon": "bacon",
    "crevette": "shrimp",
    "crevettes": "shrimp",
    "saumon": "salmon",
    "thon": "tuna",
    "yogourt": "yogurt",
    "creme": "cream",
    "glacee": "ice cream",
    "cereale": "cereal",
    "cereales": "cereal",
    "pates": "pasta",
    "sauce": "sauce",
    "soupe": "soup",
    "croustille": "chips",
    "croustilles": "chips",
    "biscuit": "cookie",
    "biscuits": "cookies",
    "chocolat": "chocolate",
    "cafe": "coffee",
    "the": "tea",
    "boisson": "drink",
    "boissons": "drinks",
    "gazeuse": "soda",
    "detergent": "detergent",
    "savon": "soap",
    "papier": "paper",
    "mouchoir": "tissue",
    "mouchoirs": "tissues",
    "serviette": "napkin",
    "serviettes": "napkins",
}

# Unit patterns to strip from product names
UNIT_PATTERNS = [
    r"\d+\s*(?:lb|lbs|kg|g|mg|ml|mL|l|L|oz|fl\.?\s*oz)\b",
    r"\d+\s*x\s*\d+\s*(?:ml|mL|g|L|l|oz)\b",  # e.g., "6 x 500 mL"
    r"\d+\s*(?:pack|pk|ct|count|un|unit|units)\b",
    r"\bper\s+(?:lb|kg|100\s*g|each)\b",
]

# Common filler words to remove
FILLER_WORDS = {
    "the", "a", "an", "or", "and", "de", "du", "des", "le", "la", "les",
    "un", "une", "au", "aux", "et", "ou", "avec", "sans", "pour",
    "selected", "assorted", "varieties", "variety", "product", "of",
}


def normalize_product_name(raw_name: str) -> str:
    """
    Normalize a product name for cross-store matching.

    Steps:
    1. Lowercase & remove accents
    2. Translate common French terms to English
    3. Strip unit measurements
    4. Remove filler words
    5. Clean up whitespace and punctuation

    Examples:
        'Tomates grappe bio, 1 lb'       → 'tomato vine organic'
        'Vine Tomatoes, per lb'           → 'vine tomato'
        'PC® Chicken Breast, 1 kg'       → 'pc chicken breast'
        'Beurre non salé Selection 454 g' → 'butter unsalted selection'
    """
    if not raw_name:
        return ""

    # Step 1: Lowercase and remove accents
    name = raw_name.lower().strip()
    name = unidecode(name)

    # Step 2: Translate French words to English
    words = name.split()
    translated_words = []
    i = 0
    while i < len(words):
        # Check multi-word translations first (e.g., "pomme de terre")
        matched = False
        for phrase_len in range(3, 0, -1):
            if i + phrase_len <= len(words):
                phrase = " ".join(words[i : i + phrase_len])
                if phrase in FR_EN_TRANSLATIONS:
                    translated_words.append(FR_EN_TRANSLATIONS[phrase])
                    i += phrase_len
                    matched = True
                    break

        if not matched:
            word = words[i]
            translated_words.append(FR_EN_TRANSLATIONS.get(word, word))
            i += 1

    name = " ".join(translated_words)

    # Step 3: Strip unit measurements
    for pattern in UNIT_PATTERNS:
        name = re.sub(pattern, "", name, flags=re.IGNORECASE)

    # Step 4: Remove punctuation and special characters (keep letters, numbers, spaces)
    name = re.sub(r"[^\w\s]", " ", name)

    # Step 5: Remove filler words
    words = name.split()
    words = [w for w in words if w not in FILLER_WORDS and len(w) > 1]

    # Step 6: Clean up whitespace
    name = " ".join(words).strip()

    return name


def extract_brand(raw_name: str) -> str | None:
    """
    Attempt to extract a brand name from a product name.

    Common Canadian grocery brands often appear at the start:
    'PC® Blue Menu Chicken' → 'PC'
    'Great Value Tomatoes'  → 'Great Value'
    'Selection Butter'      → 'Selection'
    """
    known_brands = [
        "great value",
        "pc",
        "president's choice",
        "no name",
        "selection",
        "compliments",
        "irresistibles",
        "life smart",
        "essential everyday",
        "kirkland",
        "old el paso",
        "heinz",
        "kraft",
        "kellogg",
        "general mills",
        "nestle",
        "danone",
        "oasis",
        "tropicana",
        "minute maid",
        "natrel",
        "beatrice",
    ]

    name_lower = raw_name.lower()
    name_lower = unidecode(name_lower)

    for brand in known_brands:
        if name_lower.startswith(brand):
            return brand.title()

    return None


def guess_category(normalized_name: str) -> str | None:
    """
    Guess the product category from the normalized name.

    Returns one of: produce, dairy, meat, bakery, frozen, beverages,
    snacks, pantry, household, or None.
    """
    category_keywords = {
        "produce": [
            "tomato", "apple", "banana", "lettuce", "carrot", "onion",
            "potato", "pepper", "cucumber", "broccoli", "mushroom",
            "celery", "garlic", "grape", "strawberry", "blueberry",
            "orange", "lemon", "lime", "avocado", "mango", "pineapple",
            "watermelon", "peach", "pear", "cherry", "melon",
        ],
        "dairy": [
            "milk", "cheese", "yogurt", "butter", "cream", "egg",
        ],
        "meat": [
            "chicken", "beef", "pork", "ground", "breast", "thigh",
            "sausage", "ham", "bacon", "steak", "roast",
        ],
        "seafood": [
            "shrimp", "salmon", "tuna", "fish", "cod", "tilapia",
        ],
        "bakery": [
            "bread", "baguette", "croissant", "muffin", "cake", "roll",
        ],
        "frozen": [
            "frozen", "ice cream",
        ],
        "beverages": [
            "juice", "water", "soda", "coffee", "tea", "drink",
        ],
        "snacks": [
            "chips", "cookie", "chocolate", "cracker", "popcorn",
        ],
        "pantry": [
            "rice", "pasta", "sauce", "soup", "cereal", "sugar", "oil",
            "salt", "flour",
        ],
        "household": [
            "detergent", "soap", "paper", "tissue", "napkin", "cleaner",
        ],
    }

    name_lower = normalized_name.lower()

    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in name_lower:
                return category

    return None
