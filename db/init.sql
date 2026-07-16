-- ============================================
-- FlyerWise Database Schema
-- ============================================

-- Enable trigram extension for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- STORES: Tracked grocery retailers
-- ============================================
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    flyer_url VARCHAR(500),
    color VARCHAR(7),              -- Brand color hex for UI (e.g., '#0071CE')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FLYERS: Weekly flyer tracking
-- ============================================
CREATE TABLE flyers (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    flyer_url VARCHAR(500),
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error')),
    items_count INTEGER DEFAULT 0,
    UNIQUE(store_id, start_date, end_date)
);

CREATE INDEX idx_flyers_store_id ON flyers(store_id);
CREATE INDEX idx_flyers_status ON flyers(status);
CREATE INDEX idx_flyers_dates ON flyers(start_date, end_date);

-- ============================================
-- PRODUCTS: Normalized product entries
-- ============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    raw_name VARCHAR(500) NOT NULL,
    normalized_name VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(200),
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full-text search index on normalized name
CREATE INDEX idx_products_fts ON products
    USING GIN (to_tsvector('english', normalized_name));

-- Trigram index for fuzzy matching
CREATE INDEX idx_products_trgm ON products
    USING GIN (normalized_name gin_trgm_ops);

-- Index on category for filtering
CREATE INDEX idx_products_category ON products(category);

-- ============================================
-- PRICES: Core table linking products, stores, flyers
-- ============================================
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    flyer_id INTEGER REFERENCES flyers(id) ON DELETE SET NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    savings VARCHAR(100),
    unit VARCHAR(50),                     -- 'per lb', 'each', 'per kg', 'per 100g'
    quantity VARCHAR(100),                -- '2 for $5', '3/$10'
    price_text VARCHAR(200),              -- Original price text from flyer
    description TEXT,
    image_url VARCHAR(500),
    valid_from DATE,
    valid_until DATE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, store_id, flyer_id)
);

CREATE INDEX idx_prices_product_id ON prices(product_id);
CREATE INDEX idx_prices_store_id ON prices(store_id);
CREATE INDEX idx_prices_valid_until ON prices(valid_until);
CREATE INDEX idx_prices_current_price ON prices(current_price);

-- Composite index for the most common query: active prices by product
CREATE INDEX idx_prices_active_lookup ON prices(product_id, valid_until, current_price);

-- ============================================
-- SEARCH HISTORY: Track popular searches (for suggestions)
-- ============================================
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    query VARCHAR(200) NOT NULL,
    results_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_query ON search_history(query);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at);

-- ============================================
-- SCRAPE LOG: Track scraper runs
-- ============================================
CREATE TABLE scrape_log (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    items_scraped INTEGER DEFAULT 0,
    error_message TEXT
);

CREATE INDEX idx_scrape_log_store_id ON scrape_log(store_id);
CREATE INDEX idx_scrape_log_status ON scrape_log(status);

-- ============================================
-- HELPER FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTION: Auto-expire old flyers
-- ============================================
CREATE OR REPLACE FUNCTION expire_old_flyers()
RETURNS void AS $$
BEGIN
    UPDATE flyers
    SET status = 'expired'
    WHERE end_date < CURRENT_DATE AND status = 'active';
END;
$$ LANGUAGE plpgsql;
