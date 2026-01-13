// Debounce helper (kept from your original snippet)
function _debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ✅ Add this class to any image you NEVER want this script to lazy-load (e.g. your LCP/hero image)
const IGNORE_IMG_CLASS = "lcp-image";

// Obfuscated navigator keys (same behaviour as your original)
window.___mnag = "userA" + (window.___mnag1 || "") + "gent";    // "userAgent"
window.___plt  = "plat"  + (window.___mnag1 || "") + "form";    // "platform"

// Detect environment (same behaviour as your original)
let r = null;
try {
  const ua = navigator[window.___mnag];
  const plat = navigator[window.___plt];

  // Original logic:
  // platform contains "x86_64" AND userAgent does NOT contain "CrOS"
  window.__isPSA = plat.indexOf("x86_64") > -1 && ua.indexOf("CrOS") < 0;

  window.___mnag = "!1";
} catch (err) {
  window.__isPSA = false;
  window.___mnag = "!1";
}

// Keep the same assignment pattern as your original
window.__isPSA = __isPSA;

// If flagged, watch DOM and lazy-load certain things as they’re added
if (__isPSA) {
  let i = 0;
  const s = 20; // after 20 images, force lazy on subsequent images (unless excluded)

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;

        // IFRAME: convert to lazy + move src -> data-src
        if (node.tagName === "IFRAME") {
          node.setAttribute("loading", "lazy");
          node.setAttribute("data-src", node.src);
          node.removeAttribute("src");
        }

        // IMG: after threshold, force lazy UNLESS it has the ignore class
        if (node.tagName === "IMG") {
          const shouldIgnore = node.classList && node.classList.contains(IGNORE_IMG_CLASS);

          if (shouldIgnore) {
            // Optional: aggressively enforce hero priority
            node.setAttribute("loading", "eager");
            node.setAttribute("fetchpriority", "high");
          } else {
            if (++i > s) node.setAttribute("loading", "lazy");
          }
        }

        // SCRIPT: move src -> data-src and prevent execution by changing type
        if (node.tagName === "SCRIPT") {
          node.setAttribute("data-src", node.src);
          node.removeAttribute("src");
          node.type = "text/lazyload";
        }
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
