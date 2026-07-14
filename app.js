/* og-preview — vanilla JS, zero dependencies, zero build step.
   Everything runs client-side. Nothing leaves the browser. */

(function () {
  "use strict";

  // ---- Truncation limits (approximate what each surface shows) ----
  var LIMIT_TITLE = 60;   // Google truncates page titles around here
  var LIMIT_DESC = 160;   // Google truncates meta descriptions around here

  // ---------- Pure helpers ----------

  function truncate(str, max) {
    str = (str || "").trim();
    if (str.length <= max) return str;
    return str.slice(0, max - 1).trimEnd() + "…"; // ellipsis
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Extract a clean "domain" from a URL string, tolerant of bad input.
  function domainFromUrl(url) {
    if (!url) return "";
    try {
      var u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch (e) {
      // strip protocol + path manually as a fallback
      return String(url)
        .replace(/^[a-z]+:\/\//i, "")
        .replace(/^www\./, "")
        .split(/[/?#]/)[0];
    }
  }

  // Build a Google-style breadcrumb: "https://devya.dev › work › sub"
  function breadcrumb(url) {
    if (!url) return "";
    var host = "", path = "";
    try {
      var u = new URL(url);
      host = u.protocol + "//" + u.hostname.replace(/^www\./, "");
      path = u.pathname;
    } catch (e) {
      var stripped = String(url).replace(/^([a-z]+:\/\/)?/i, "");
      var slash = stripped.indexOf("/");
      host = "https://" + (slash === -1 ? stripped : stripped.slice(0, slash)).replace(/^www\./, "");
      path = slash === -1 ? "" : stripped.slice(slash);
    }
    var segs = path.split("/").filter(Boolean).map(decodeSafe);
    return segs.length ? host + " › " + segs.join(" › ") : host;
  }

  function decodeSafe(s) {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }

  // Build the <meta> tag block from the current field values.
  function buildMetaTags(v) {
    var title = v.title || "";
    var desc = v.description || "";
    var url = v.url || "";
    var image = v.image || "";
    var site = v.site || "";
    var card = v.card || "summary_large_image";

    var lines = [
      "<title>" + escapeHtml(title) + "</title>",
      '<meta name="description" content="' + escapeHtml(desc) + '" />',
      '<link rel="canonical" href="' + escapeHtml(url) + '" />',
      "",
      "<!-- Open Graph -->",
      '<meta property="og:title" content="' + escapeHtml(title) + '" />',
      '<meta property="og:description" content="' + escapeHtml(desc) + '" />',
      '<meta property="og:url" content="' + escapeHtml(url) + '" />',
      '<meta property="og:image" content="' + escapeHtml(image) + '" />',
      '<meta property="og:site_name" content="' + escapeHtml(site) + '" />',
      '<meta property="og:type" content="website" />',
      "",
      "<!-- Twitter -->",
      '<meta name="twitter:card" content="' + escapeHtml(card) + '" />',
      '<meta name="twitter:title" content="' + escapeHtml(title) + '" />',
      '<meta name="twitter:description" content="' + escapeHtml(desc) + '" />',
      '<meta name="twitter:image" content="' + escapeHtml(image) + '" />'
    ];
    return lines.join("\n");
  }

  // Expose pure helpers for optional node-side testing.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { truncate: truncate, escapeHtml: escapeHtml, domainFromUrl: domainFromUrl, breadcrumb: breadcrumb, buildMetaTags: buildMetaTags };
  }

  // ---------- DOM wiring (guard for node testing) ----------
  if (typeof document === "undefined") return;

  var els = {
    title: document.getElementById("f-title"),
    description: document.getElementById("f-description"),
    url: document.getElementById("f-url"),
    image: document.getElementById("f-image"),
    site: document.getElementById("f-site"),
    card: document.getElementById("f-card")
  };

  function readValues() {
    return {
      title: els.title.value,
      description: els.description.value,
      url: els.url.value,
      image: els.image.value,
      site: els.site.value,
      card: els.card.value
    };
  }

  // Apply an image to a preview slot, or render a labelled fallback.
  function applyImage(node, imageUrl) {
    if (imageUrl && imageUrl.trim()) {
      node.style.backgroundImage = "url('" + encodeURI(imageUrl.trim()).replace(/'/g, "%27") + "')";
      node.classList.remove("img-fallback");
      node.textContent = "";
    } else {
      node.style.backgroundImage = "none";
      node.classList.add("img-fallback");
      node.textContent = "1200 × 630 image";
    }
  }

  function setText(id, text) {
    var n = document.getElementById(id);
    if (n) n.textContent = text;
  }

  function updateCounter(el, len, limit) {
    el.textContent = len + " / " + limit + " chars";
    el.classList.remove("warn", "over");
    if (len > limit) el.classList.add("over");
    else if (len > limit - 10) el.classList.add("warn");
  }

  function render() {
    var v = readValues();
    var domain = domainFromUrl(v.url) || "example.com";

    // ----- Google -----
    setText("g-site", v.site || domain);
    setText("g-url", breadcrumb(v.url) || "https://" + domain);
    setText("g-title", truncate(v.title, LIMIT_TITLE) || "Untitled page");
    setText("g-desc", truncate(v.description, LIMIT_DESC));

    // ----- Facebook / Open Graph -----
    applyImage(document.getElementById("fb-image"), v.image);
    setText("fb-domain", domain.toUpperCase());
    setText("fb-title", v.title || "Untitled page");
    setText("fb-desc", truncate(v.description, 200));

    // ----- X (Twitter) -----
    var twCard = document.getElementById("tw-card");
    twCard.setAttribute("data-card", v.card === "summary" ? "summary" : "summary_large_image");
    applyImage(document.getElementById("tw-image"), v.image);
    setText("tw-title", v.title || "Untitled page");
    setText("tw-desc", truncate(v.description, 200));
    setText("tw-domain", domain);

    // ----- LinkedIn -----
    applyImage(document.getElementById("li-image"), v.image);
    setText("li-title", v.title || "Untitled page");
    setText("li-domain", domain);

    // ----- Counters -----
    updateCounter(document.getElementById("c-title"), (v.title || "").length, LIMIT_TITLE);
    updateCounter(document.getElementById("c-description"), (v.description || "").length, LIMIT_DESC);

    // ----- Meta tags block -----
    document.getElementById("meta-output").textContent = buildMetaTags(v);
  }

  // Wire every field to re-render live on input/change.
  Object.keys(els).forEach(function (key) {
    var node = els[key];
    node.addEventListener("input", render);
    node.addEventListener("change", render);
  });

  // ----- Copy button -----
  var copyBtn = document.getElementById("copy-btn");
  copyBtn.addEventListener("click", function () {
    var text = document.getElementById("meta-output").textContent;
    var done = function () {
      copyBtn.classList.add("copied");
      var original = "Copy";
      copyBtn.textContent = "Copied!";
      setTimeout(function () {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = original;
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (e) {
        copyBtn.textContent = "Press Ctrl+C";
        setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600);
      }
    }
  });

  // Initial paint.
  render();
})();
