(() => {
  "use strict";
  const VERSION = document.documentElement.dataset.ver;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const STATUS = { playing: "Playing", finished: "Finished", played: "Played", backlog: "Backlog", wishlist: "Wishlist", dropped: "Dropped" };
  const UNPLAYED = new Set(["backlog", "wishlist"]);
  const TABS = ["library", "discover", "wishlist", "stats", "friends", "trophies"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const todayISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const isoOf = d => new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const norm = s => String(s || "").toLowerCase().replace(/[™®©]/g, "").replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // under an hour reads in minutes (40 min); longer reads in hours with one decimal (12.5 h)
  const fmtH = h => { h = Number(h) || 0; if (h > 0 && h < 1) return Math.max(1, Math.round(h * 60)) + " min"; h = Math.round(h * 10) / 10; return (h % 1 ? h.toFixed(1) : String(h)) + " h"; };
  $("#ver").textContent = VERSION;

