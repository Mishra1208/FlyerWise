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
),
(
    'IGA',
    'iga',
    '/logos/iga.svg',
    'https://www.iga.net',
    'https://www.iga.net/en/flyer',
    '#E31837'
),
(
    'Super C',
    'superc',
    '/logos/superc.svg',
    'https://www.superc.ca',
    'https://www.superc.ca/en/flyer',
    '#E30613'
),
(
    'Provigo',
    'provigo',
    '/logos/provigo.svg',
    'https://www.provigo.ca',
    'https://www.provigo.ca/en/flyer',
    '#D32F2F'
)
ON CONFLICT (slug) DO NOTHING;
