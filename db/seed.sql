-- ============================================
-- FlyerWise Seed Data — Initial Stores
-- ============================================

INSERT INTO stores (name, slug, logo_url, website_url, flyer_url, color) VALUES
(
    'Walmart',
    'walmart',
    '/logos/walmart.svg',
    'https://www.walmart.ca',
    'https://www.walmart.ca/flyer',
    '#0071CE'
),
(
    'Maxi',
    'maxi',
    '/logos/maxi.svg',
    'https://www.maxi.ca',
    'https://www.maxi.ca/en/flyer',
    '#ED1C24'
),
(
    'Metro',
    'metro',
    '/logos/metro.svg',
    'https://www.metro.ca',
    'https://www.metro.ca/en/flyer',
    '#003DA5'
)
ON CONFLICT (slug) DO NOTHING;
