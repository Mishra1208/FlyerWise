const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");

function render(items, sourceUrl) {
  listEl.innerHTML = "";
  if (!items.length) {
    statusEl.textContent =
      "No items captured yet. Open a Flipp flyer page, let it fully load, then reopen this popup.";
    listEl.innerHTML = '<div id="empty">Nothing here yet.</div>';
    return;
  }

  statusEl.textContent = `${items.length} items captured${
    sourceUrl ? " from " + new URL(sourceUrl).pathname : ""
  }`;

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      ${item.image ? `<img src="${item.image}" alt="">` : '<div style="width:36px;height:36px"></div>'}
      <div class="name">${escapeHtml(item.name)}</div>
      <div class="price">${typeof item.price === "number" ? "$" + item.price.toFixed(2) : escapeHtml(String(item.price))}</div>
    `;
    listEl.appendChild(row);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename }, () => URL.revokeObjectURL(url));
}

async function loadAndRender() {
  const { flyerwiseItems = [], flyerwiseUrl = "" } = await chrome.storage.local.get([
    "flyerwiseItems",
    "flyerwiseUrl"
  ]);
  render(flyerwiseItems, flyerwiseUrl);
  return flyerwiseItems;
}

document.getElementById("syncDb").addEventListener("click", async () => {
  const items = await loadAndRender();
  if (!items.length) return alert("No items to sync!");
  
  statusEl.textContent = "Syncing to FlyerWise Database...";
  try {
    const res = await fetch("http://localhost:8000/api/products/ingest_extension_json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    const data = await res.json();
    alert(`🎉 Successfully synced ${data.items_saved} official items into FlyerWise PostgreSQL database!`);
    statusEl.textContent = `Synced ${data.items_saved} items to DB!`;
  } catch (err) {
    alert("❌ Error syncing to database. Make sure FlyerWise backend is running at http://localhost:8000");
    statusEl.textContent = "Sync failed.";
  }
});

document.getElementById("exportJson").addEventListener("click", async () => {
  const items = await loadAndRender();
  download("flyerwise-items.json", JSON.stringify(items, null, 2));
});

document.getElementById("exportCsv").addEventListener("click", async () => {
  const items = await loadAndRender();
  const header = "name,price,image\n";
  const rows = items
    .map(
      (it) =>
        `"${(it.name || "").replace(/"/g, '""')}","${it.price ?? ""}","${it.image || ""}"`
    )
    .join("\n");
  download("flyerwise-items.csv", header + rows);
});

document.getElementById("clear").addEventListener("click", async () => {
  await chrome.storage.local.remove(["flyerwiseItems", "flyerwiseUrl", "flyerwiseUpdatedAt"]);
  render([], "");
});

loadAndRender();
