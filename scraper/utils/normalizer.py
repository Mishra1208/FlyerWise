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
    "grappes": "vine",
    "vigne": "vine",
    "vignes": "vine",
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

    # Step 7: Canonical product grouping (group messy names under standard terms)
    if "tomato" in name or "tomatoes" in name:
        if "roma" in name:
            name = "roma tomatoes"
        elif any(x in name for x in ["vine", "grappe", "cluster", "stemmed"]):
            name = "vine tomatoes"
        elif any(x in name for x in ["grape", "raisin"]):
            name = "grape tomatoes"
        elif any(x in name for x in ["cherry", "cerise"]):
            name = "cherry tomatoes"
        elif any(x in name for x in ["beefsteak", "serre", "hothouse"]):
            name = "hothouse tomatoes"
        else:
            name = "red tomatoes"
    elif "milk" in name or "lait" in name:
        if "2%" in name or "2 %" in name or "2percent" in name:
            name = "2% milk"
        elif "1%" in name or "1 %" in name or "1percent" in name:
            name = "1% milk"
        elif "skim" in name or "ecreme" in name:
            name = "skim milk"
        elif "whole" in name or "entier" in name or "homo" in name or "3.25" in name:
            name = "3.25% milk"
    elif "butter" in name or "beurre" in name:
        if "unsalted" in name or "sans sel" in name or "doux" in name:
            name = "unsalted butter"
        elif "salted" in name or "sale" in name:
            name = "salted butter"
        else:
            name = "butter"
    elif "egg" in name or "eggs" in name or "oeuf" in name or "oeufs" in name:
        if "large" in name or "gros" in name:
            name = "large eggs"
        elif "medium" in name or "moyen" in name:
            name = "medium eggs"
        else:
            name = "eggs"
    elif "banana" in name or "bananas" in name or "banane" in name or "bananes" in name:
        name = "bananas"

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


# ============================================================
# SYNONYM TAGGING SYSTEM
# ============================================================

# Bilingual synonym expansions: if ANY of the trigger words appear
# in the raw product name, ALL the associated tags are added.
# This lets users search in English OR French and find the product.
KEYWORD_TAG_EXPANSIONS = {
    # --- Leafy greens / salads ---
    "spinach":   "spinach épinard epinard greens leafy verdure feuille",
    "épinard":   "spinach épinard epinard greens leafy verdure feuille",
    "epinard":   "spinach épinard epinard greens leafy verdure feuille",
    "lettuce":   "lettuce laitue salad salade greens leafy",
    "laitue":    "lettuce laitue salad salade greens leafy",
    "arugula":   "arugula roquette rocket greens leafy salad salade",
    "roquette":  "arugula roquette rocket greens leafy salad salade",
    "kale":      "kale chou frise greens leafy",
    # --- Tomatoes ---
    "tomato":    "tomato tomate tomatoes tomates",
    "tomate":    "tomato tomate tomatoes tomates",
    # --- Root vegetables ---
    "potato":    "potato patate pomme terre potatoes patates",
    "patate":    "potato patate pomme terre potatoes patates",
    "carrot":    "carrot carotte carrots carottes",
    "carotte":   "carrot carotte carrots carottes",
    "onion":     "onion oignon onions oignons",
    "oignon":    "onion oignon onions oignons",
    # --- Fruits ---
    "apple":     "apple pomme apples pommes fruit",
    "pomme":     "apple pomme apples pommes fruit",
    "banana":    "banana banane bananas bananes fruit",
    "banane":    "banana banane bananas bananes fruit",
    "strawberry":"strawberry fraise strawberries fraises berry berries fruit",
    "fraise":    "strawberry fraise strawberries fraises berry berries fruit",
    "blueberry": "blueberry bleuet blueberries bleuets berry berries fruit",
    "bleuet":    "blueberry bleuet blueberries bleuets berry berries fruit",
    "grape":     "grape raisin grapes raisins fruit",
    "raisin":    "grape raisin grapes raisins fruit",
    "orange":    "orange oranges agrume citrus fruit",
    "lemon":     "lemon citron lemons citrons agrume citrus fruit",
    "citron":    "lemon citron lemons citrons agrume citrus fruit",
    "avocado":   "avocado avocat avocados avocats fruit",
    "avocat":    "avocado avocat avocados avocats fruit",
    "mango":     "mango mangue mangos mangoes mangues fruit",
    "mangue":    "mango mangue mangos mangoes mangues fruit",
    "watermelon":"watermelon melon eau pasteque fruit",
    "pineapple": "pineapple ananas fruit",
    "ananas":    "pineapple ananas fruit",
    "peach":     "peach peche peaches peches fruit",
    "pear":      "pear poire pears poires fruit",
    "poire":     "pear poire pears poires fruit",
    "cherry":    "cherry cerise cherries cerises fruit",
    "cerise":    "cherry cerise cherries cerises fruit",
    # --- Proteins ---
    "chicken":   "chicken poulet poultry volaille",
    "poulet":    "chicken poulet poultry volaille",
    "beef":      "beef boeuf meat viande",
    "boeuf":     "beef boeuf meat viande",
    "pork":      "pork porc meat viande",
    "porc":      "pork porc meat viande",
    "shrimp":    "shrimp crevette crevettes seafood fruits mer",
    "crevette":  "shrimp crevette crevettes seafood fruits mer",
    "salmon":    "salmon saumon fish poisson seafood",
    "saumon":    "salmon saumon fish poisson seafood",
    "tuna":      "tuna thon fish poisson seafood",
    "thon":      "tuna thon fish poisson seafood",
    "ham":       "ham jambon meat viande charcuterie",
    "jambon":    "ham jambon meat viande charcuterie",
    "bacon":     "bacon meat viande",
    "sausage":   "sausage saucisse meat viande",
    "saucisse":  "sausage saucisse meat viande",
    # --- Dairy ---
    "milk":      "milk lait dairy laitier",
    "lait":      "milk lait dairy laitier",
    "cheese":    "cheese fromage dairy laitier",
    "fromage":   "cheese fromage dairy laitier",
    "yogurt":    "yogurt yogourt dairy laitier",
    "yogourt":   "yogurt yogourt dairy laitier",
    "butter":    "butter beurre dairy laitier",
    "beurre":    "butter beurre dairy laitier",
    "cream":     "cream crème creme dairy laitier",
    "egg":       "egg oeuf eggs oeufs dairy",
    "oeuf":      "egg oeuf eggs oeufs dairy",
    # --- Bakery ---
    "bread":     "bread pain bakery boulangerie",
    "pain":      "bread pain bakery boulangerie",
    # --- Pantry ---
    "rice":      "rice riz grain",
    "riz":       "rice riz grain",
    "pasta":     "pasta pâtes pates noodle",
    "pâtes":     "pasta pâtes pates noodle",
    "cereal":    "cereal céréales cereales breakfast",
    "sugar":     "sugar sucre",
    "sucre":     "sugar sucre",
    "oil":       "oil huile cooking",
    "huile":     "oil huile cooking",
    "sauce":     "sauce condiment",
    "soup":      "soup soupe",
    "soupe":     "soup soupe",
    # --- Beverages ---
    "juice":     "juice jus beverage boisson drink",
    "jus":       "juice jus beverage boisson drink",
    "coffee":    "coffee café cafe beverage boisson",
    "café":      "coffee café cafe beverage boisson",
    "tea":       "tea thé the beverage boisson",
    # --- Snacks ---
    "chips":     "chips croustilles snack",
    "croustilles": "chips croustilles snack",
    "chocolate": "chocolate chocolat snack candy",
    "chocolat":  "chocolate chocolat snack candy",
    "cookie":    "cookie biscuit cookies biscuits snack",
    "biscuit":   "cookie biscuit cookies biscuits snack",
    # --- Household ---
    "detergent": "detergent détergent laundry lessive cleaning",
    "soap":      "soap savon cleaning",
    "savon":     "soap savon cleaning",
}

# Brand-based tag rules: if the brand matches, inject extra tags
# regardless of whether the product name contains those keywords.
# This is the KEY innovation that solves the Attitude salad problem.
BRAND_TAG_RULES = {
    "attitude": {
        # Attitude Fraîche salads are always spinach/arugula/spring mix
        "triggers": ["salade", "salad", "fraiche", "fraîche", "spring", "mix"],
        "tags": "spinach arugula lettuce spring mix baby greens salad salade épinard epinard laitue roquette leafy verdure organic bio fresh frais",
    },
    "popeye": {
        "triggers": ["spinach", "épinard", "epinard"],
        "tags": "spinach épinard epinard greens leafy canned frozen",
    },
    "dole": {
        "triggers": ["salade", "salad", "mix", "blend"],
        "tags": "spinach lettuce arugula salad salade greens leafy épinard laitue",
    },
    "earthbound": {
        "triggers": ["salade", "salad", "organic", "bio", "spring"],
        "tags": "spinach lettuce arugula salad salade greens leafy organic bio épinard laitue",
    },
    "your fresh market": {
        "triggers": ["spinach", "épinard"],
        "tags": "spinach épinard epinard greens leafy fresh frais",
    },
    "irresistibles": {
        "triggers": ["salade", "salad", "mesclun", "mix"],
        "tags": "spinach lettuce arugula salad salade greens leafy épinard laitue",
    },
    "lactantia": {
        "triggers": ["beurre", "butter", "salé", "doux", "baratté", "churned", "lait", "milk", "crème", "cream"],
        "tags": "butter beurre salted unsalted baratté churned milk lait dairy cream crème",
    },
    "quebon": {
        "triggers": ["lait", "milk", "crème", "cream", "beurre", "butter"],
        "tags": "milk lait dairy cream crème 2% 1% 3.25% homo skim écrémé",
    },
    "natrel": {
        "triggers": ["lait", "milk", "crème", "cream", "beurre", "butter", "fine filtre"],
        "tags": "milk lait dairy cream crème fine filtré lactose free sans lactose",
    },
    "beatrice": {
        "triggers": ["lait", "milk", "crème", "cream"],
        "tags": "milk lait dairy cream crème",
    },
    "saputo": {
        "triggers": ["fromage", "cheese", "mozzarella", "cheddar"],
        "tags": "cheese fromage mozzarella cheddar dairy produit laitier",
    },
    "p'tit quebec": {
        "triggers": ["fromage", "cheese", "cheddar"],
        "tags": "cheese fromage cheddar rape shredded block morceau",
    },
    "black diamond": {
        "triggers": ["fromage", "cheese", "cheddar", "ficello", "string"],
        "tags": "cheese fromage cheddar string ficello dairy",
    },
}


def generate_search_tags(raw_name: str, brand: str | None = None) -> str:
    """
    Generate search tags for a product based on its name and brand.

    This is the core of the Synonym Tagging System. It solves the problem
    where products like "SALADES ATTITUDE FRAÎCHE, 142 G" don't contain
    the word "spinach" but should appear when a user searches for spinach.

    Strategy:
    1. Expand every keyword found in the product name with bilingual synonyms
    2. Apply brand-specific rules (e.g., Attitude salads → spinach tags)
    3. Deduplicate and return as a space-separated string

    Args:
        raw_name: The original product name from the flyer
        brand: The product brand (if known)

    Returns:
        Space-separated string of search tags, or empty string
    """
    if not raw_name:
        return ""

    # Normalize for matching
    name_lower = unidecode(raw_name.lower().strip())
    tags = set()

    # --- Step 1: Keyword-based expansion ---
    # For every word in the product name, check if it triggers synonym expansion
    name_words = set(re.split(r'[\s,|/\-]+', name_lower))
    for word in name_words:
        if word in KEYWORD_TAG_EXPANSIONS:
            for tag in KEYWORD_TAG_EXPANSIONS[word].split():
                tags.add(tag)

    # --- Step 2: Brand-based rules ---
    if brand:
        brand_lower = unidecode(brand.lower().strip())
        for brand_key, rule in BRAND_TAG_RULES.items():
            if brand_key in brand_lower:
                # Check if any trigger word appears in the product name
                if any(trigger in name_lower for trigger in rule["triggers"]):
                    for tag in rule["tags"].split():
                        tags.add(tag)
                break  # Only match one brand rule

    # --- Step 3: Generic variety detection ---
    # Products with "certaines variétés" / "assorted varieties" / "selected"
    # are multi-variety products — add broader category tags
    variety_indicators = [
        "certaines varietes", "varietes", "assorted", "selected varieties",
        "assortiment", "au choix",
    ]
    if any(indicator in name_lower for indicator in variety_indicators):
        # If we already have some tags from brand rules, expand them
        # If it's a salad brand, make sure spinach/lettuce are tagged
        if brand:
            brand_lower = unidecode(brand.lower().strip())
            if brand_lower in ("attitude", "dole", "earthbound", "irresistibles"):
                for tag in "spinach lettuce arugula salad salade greens épinard laitue roquette".split():
                    tags.add(tag)

    # Remove any single-character tags and empty strings
    tags = {t for t in tags if len(t) > 1}

    return " ".join(sorted(tags))

