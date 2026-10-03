/* TrippyCharts cookieless analytics. No cookies, no ids, no personal data.
   Sends small events to events.trippycharts.com via sendBeacon. Never throws, never blocks. */
(function () {
  try {
    var EP = "https://events.trippycharts.com/e";
    var ss = window.sessionStorage;
    var A_KEY = "tc_attr";
    var q = new URLSearchParams(location.search);
    var path = location.pathname.replace(/\/index\.html$/, "/");
    function sget(k) { try { return ss.getItem(k); } catch (e) { return null; } }
    function sset(k, v) { try { ss.setItem(k, v); } catch (e) {} }
    // First-touch attribution for this tab session (sessionStorage only, cleared when the tab closes).
    var attr = null;
    try { attr = JSON.parse(sget(A_KEY) || "null"); } catch (e) {}
    var ref = document.referrer || "";
    var refHost = ""; try { refHost = ref ? new URL(ref).hostname : ""; } catch (e) {}
    var internal = /(^|\.)trippycharts\.com$|(^|\.)stripe\.com$/.test(refHost);
    if (!attr || (q.get("utm_source") && !attr.us)) {
      attr = { us: q.get("utm_source") || "", um: q.get("utm_medium") || "", uc: q.get("utm_campaign") || "",
               ux: q.get("utm_content") || "", r: internal ? "" : ref };
      sset(A_KEY, JSON.stringify(attr));
    }
    function track(e, extra) {
      try {
        var d = { e: e, p: path, us: attr.us, um: attr.um, uc: attr.uc, ux: attr.ux, r: attr.r };
        if (extra) for (var k in extra) d[k] = extra[k];
        var body = JSON.stringify(d);
        var ok = false;
        if (navigator.sendBeacon) ok = navigator.sendBeacon(EP, new Blob([body], { type: "text/plain" }));
        if (!ok && window.fetch) fetch(EP, { method: "POST", body: body, keepalive: true, mode: "cors",
          headers: { "Content-Type": "text/plain" } }).catch(function () {});
      } catch (err) {}
    }
    window.tcTrack = track;
    track("pageview");
    var isStore = /toys\.html$/.test(location.pathname);
    if (isStore) track("store_view");

    // Purchase / cancel on return from Stripe. Runs before the page's own script clears trippy_pending_sku.
    var pending = null;
    try { pending = JSON.parse(localStorage.getItem("trippy_pending_sku") || "null"); } catch (e) {}
    var pItems = pending && pending.items ? pending.items : [];
    var fresh = pending && Date.now() - (pending.t || 0) < 30 * 60 * 1000;
    function once(key) { if (sget(key)) return false; sset(key, "1"); return true; }
    if (q.get("pass") === "ok") { if (once("tc_p_pass_" + location.search)) track("purchase", { skus: ["pass"], total: 500 }); }
    else if (q.get("pass") === "cancel") track("checkout_cancel", { skus: ["pass"] });
    else if (isStore && q.get("paid") === "1" && fresh && pItems.length) {
      if (once("tc_p_" + pending.t)) track("purchase", { skus: pItems.map(function (i) { return i.sku; }),
        total: pItems.reduce(function (n, i) { return n + (Number(i.amount) || 0); }, 0) });
    } else if (isStore && fresh && pItems.length && /stripe\.com$/.test(refHost)) {
      if (once("tc_c_" + pending.t)) track("checkout_cancel", { skus: pItems.map(function (i) { return i.sku; }) });
    }

    // Click tracking (capture phase, read-only: never stops or changes the page's own handlers).
    function cart() { try { return JSON.parse(localStorage.getItem("trippy_cart_v1") || "[]"); } catch (e) { return []; } }
    document.addEventListener("click", function (ev) {
      try {
        var t = ev.target; if (!t || !t.dataset) return;
        var ds = t.dataset, id = t.id;
        var sku = ds.buy || (ds.buycur && "cursor_" + ds.buycur) || (ds.buytheme && "theme_" + ds.buytheme);
        if (sku) return track("add_to_cart", { sku: sku });
        var bn = ds.buynow ? [ds.buynow, 100] : ds.buynowcur ? ["cursor_" + ds.buynowcur, 300] : ds.buynowtheme ? ["theme_" + ds.buynowtheme, 300] : null;
        if (bn) { track("buy_now_click", { sku: bn[0] }); return track("checkout_start", { skus: [bn[0]], total: bn[1] }); }
        if (ds.unlock) return track("unlock_credit_used", { sku: ds.unlock });
        if (id === "cartCheckout") {
          var c = cart(); if (!c.length) return;
          return track("checkout_start", { skus: c.map(function (i) { return i.sku; }),
            total: c.reduce(function (n, i) { return n + (Number(i.amount) || 0); }, 0) });
        }
        var isPass = ds.pass || id === "passLink" || id === "buyPass" ||
          (id === "signBtn" && !/manage/i.test(t.textContent || ""));
        if (isPass) { track("pass_click"); track("checkout_start", { skus: ["pass"], total: 500 }); }
      } catch (err) {}
    }, true);

    // product_view: a locked (not owned) store card scrolled into view, once per sku per session.
    if (isStore && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          try {
            if (!en.isIntersecting) return;
            var card = en.target; io.unobserve(card);
            if (!card.classList.contains("locked")) return;
            var cv = card.querySelector("canvas");
            if (!cv) return;
            var s = cv.dataset.kind || (cv.dataset.cur && "cursor_" + cv.dataset.cur) || (cv.dataset.theme && "theme_" + cv.dataset.theme);
            if (s && once("tc_v_" + s)) track("product_view", { sku: s });
          } catch (err) {}
        });
      }, { threshold: 0.6 });
      var watch = function () {
        try { document.querySelectorAll("#grid article.card, #cursors article.card, #themes article.card").forEach(function (c) { io.observe(c); }); } catch (e) {}
      };
      var start = function () {
        watch();
        ["grid", "cursors", "themes"].forEach(function (g) {
          var el = document.getElementById(g);
          if (el) new MutationObserver(watch).observe(el, { childList: true });
        });
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
    }
  } catch (e) {}
})();
