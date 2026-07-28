// inject.js
// Runs in the PAGE's own JS context (not the isolated content-script world),
// so it can monkey-patch window.fetch / XMLHttpRequest and see every network
// call the Flipp React app makes to its own backend, including the ones that
// return item name / price / image data as JSON.
//
// We forward any JSON response coming from a Flipp API host to the content
// script via window.postMessage. The content script then parses it.

(function () {
  const API_HOST_HINTS = [
    "flippback.com",
    "flippenterprise.net",
    "flipp.com/api",
    "wishabi"
  ];

  function looksLikeFlippApi(url) {
    return API_HOST_HINTS.some((h) => url.includes(h));
  }

  function forward(url, data) {
    try {
      window.postMessage(
        { source: "flyerwise-inject", url, data },
        "*"
      );
    } catch (e) {
      // ignore postMessage failures (e.g. data not cloneable)
    }
  }

  // ---- Patch fetch ----
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      if (looksLikeFlippApi(url)) {
        const clone = response.clone();
        clone
          .json()
          .then((data) => forward(url, data))
          .catch(() => {
            /* not JSON, ignore */
          });
      }
    } catch (e) {
      /* swallow — never break the page's real fetch */
    }
    return response;
  };

  // ---- Patch XMLHttpRequest ----
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__flyerwiseUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", function () {
      try {
        const url = this.__flyerwiseUrl || "";
        if (looksLikeFlippApi(url) && this.responseText) {
          const data = JSON.parse(this.responseText);
          forward(url, data);
        }
      } catch (e) {
        /* not JSON or parse failed, ignore */
      }
    });
    return originalSend.apply(this, args);
  };

  console.log("[FlyerWise] network interceptor installed");
})();
