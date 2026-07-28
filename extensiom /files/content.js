// content.js
// Runs in the isolated content-script world. Its jobs:
//   1. Inject inject.js into the actual page context (needed to patch
//      window.fetch / XHR — a content script's own fetch is a separate
//      copy the page's React code never touches).
//   2. Listen for the postMessage events inject.js sends whenever it
//      captures a JSON response from Flipp's API.
//   3. Walk that JSON looking for item-shaped objects (has a name-ish
//      field + a price-ish field), pull out {name, price, image}.
//   4. De-dupe and save the running list to chrome.storage.local so the
//      popup can display / export it.

(function bootstrap() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
})();

const NAME_KEY_RE = /^(name|title|item_name|product_name|description)$/i;
const PRICE_KEY_RE = /price/i;
const IMAGE_KEY_RE = /(image|thumbnail|photo|img)/i;
const SKIP_KEY_RE = /^(id|url|slug|type|category|merchant_id|flyer_id)$/i;

// Recursively walk parsed JSON, collecting anything that looks like a
// flyer item: an object with a plausible name field AND a plausible
// price field somewhere on it.
function extractItems(node, found = [], depth = 0) {
  if (!node || typeof node !== "object" || depth > 12) return found;

  if (Array.isArray(node)) {
    for (const child of node) extractItems(child, found, depth + 1);
    return found;
  }

  const keys = Object.keys(node);
  let nameVal = null;
  let priceVal = null;
  let imageVal = null;

  for (const k of keys) {
    const v = node[k];
    if (nameVal === null && NAME_KEY_RE.test(k) && typeof v === "string" && v.trim()) {
      nameVal = v.trim();
    }
    if (priceVal === null && PRICE_KEY_RE.test(k) && !SKIP_KEY_RE.test(k)) {
      if (typeof v === "number") priceVal = v;
      else if (typeof v === "string" && /^\$?\s*\d/.test(v)) priceVal = v.trim();
    }
    if (imageVal === null && IMAGE_KEY_RE.test(k) && typeof v === "string" && v.startsWith("http")) {
      imageVal = v;
    }
  }

  if (nameVal && priceVal !== null) {
    found.push({ name: nameVal, price: priceVal, image: imageVal });
  }

  // Keep walking children regardless — items are often nested inside
  // wrapper objects (e.g. { item: {...}, flyer: {...} }).
  for (const k of keys) {
    extractItems(node[k], found, depth + 1);
  }

  return found;
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = `${it.name}__${it.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

async function saveItems(newItems) {
  const { flyerwiseItems = [] } = await chrome.storage.local.get("flyerwiseItems");
  const merged = dedupe([...flyerwiseItems, ...newItems]);
  await chrome.storage.local.set({
    flyerwiseItems: merged,
    flyerwiseUpdatedAt: Date.now(),
    flyerwiseUrl: location.href
  });
  chrome.runtime.sendMessage({ type: "FLYERWISE_COUNT", count: merged.length }).catch(() => {});
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || msg.source !== "flyerwise-inject") return;

  const items = extractItems(msg.data);
  if (items.length) {
    console.log(`[FlyerWise] captured ${items.length} candidate items from`, msg.url);
    saveItems(items);
  } else {
    // Keep this around for debugging — lets you check DevTools console
    // to see payload shapes that DIDN'T match, so you can extend the
    // regexes above (e.g. if Flipp uses "current_price" or "list_price").
    console.debug("[FlyerWise] no items matched in payload from", msg.url, msg.data);
  }
});
