# FlyerWise Flipp Extractor

Extracts `{ name, price, image }` for every product on a Flipp flyer page
(e.g. `flipp.com/en-ca/verdun-qc/flyer/8053985-super-c-flyer`).

## Why this approach, not DOM scraping

Flipp's flyer page is a React/Next single-page app — the item grid you see
is rendered client-side from JSON the page fetches from Flipp's own backend
(`cdn-gateflipp.flippback.com`, `dam.flippenterprise.net`). CSS-class-based
DOM scraping breaks constantly on SPAs like this because class names are
auto-generated per build. So instead, this extension **listens in on the
network calls Flipp's own frontend makes** and reads the JSON directly —
which is the same data, in a much more stable and complete form (it also
gives you fields the DOM might not render at all, like the raw price
before formatting).

## How it works

- `inject.js` runs inside the page itself and patches `fetch`/`XHR` so it
  can see JSON responses coming back from Flipp's API hosts.
- `content.js` receives those payloads, walks the JSON looking for
  objects that have a name-like field and a price-like field, and saves
  matches to `chrome.storage.local`.
- `popup.html/js` shows what's been captured and lets you export to
  JSON or CSV.

## Install (unpacked, for development)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder
4. Visit your Flipp flyer URL, e.g.
   `https://flipp.com/en-ca/verdun-qc/flyer/8053985-super-c-flyer?postal_code=H4G2Y5`
5. Let the page fully load and scroll through it (Flipp lazy-loads items
   as you scroll, so more scrolling = more items captured)
6. Click the extension icon to see the captured list, then export

## One thing you'll need to verify: the actual field names

I don't have live browser access to Flipp's rendered page, so I built the
parser to be **heuristic** rather than hard-coded to exact field names —
it matches keys like `name`/`title`/`description` for the name,
anything containing `price`, and anything containing `image`/`thumbnail`
for the picture. This will catch most real-world shapes, but grocery
flyer scrapers built by others (e.g. the field names used in similar
projects: `name`, `price`, `valid_from`, `valid_to`, `merchant`) suggest
Flipp's actual schema is close to this, though the image field name is
unconfirmed.

To tighten it up in 2 minutes:

1. Open DevTools → **Network** tab → filter by **Fetch/XHR** on the flyer
   page, reload
2. Find the request(s) going to a `flippback.com` or `flippenterprise.net`
   host that return a big JSON array of items
3. Open the response, expand one item object, and note the exact key
   names for name / price / image
4. In `content.js`, tighten `NAME_KEY_RE`, `PRICE_KEY_RE`, `IMAGE_KEY_RE`
   to match those exact keys (this avoids false positives from unrelated
   objects that happen to have a "price"-ish key)
5. Also check the console (it logs `[FlyerWise] captured N candidate
   items from <url>` for hits, and `no items matched` with the raw
   payload for misses) — that raw payload log is the fastest way to see
   the true shape

## Notes / limits

- Chrome's Manifest V3 requires the network-sniffing to happen via a
  page-injected script (`inject.js`) rather than `chrome.webRequest`,
  since MV3 dropped blocking webRequest and its non-blocking variant
  can't read response bodies anyway — this fetch/XHR-patch approach is
  the standard workaround.
- Only tested against the general shape of Flipp's public flyer pages;
  Flipp may rate-limit or change its API at any time, so treat the
  regexes in `content.js` as something to revisit occasionally.
- This only reads data the page itself already fetches for display —
  it doesn't call Flipp's API directly or bypass anything.
