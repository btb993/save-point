  // ================= wishlist: release radar =================
  // a release date may be exact ("2027-02-16"), a month ("2027-02") or just a year ("2027")
  function releaseInfo(rel){
    rel = String(rel || "");
    if (!rel) return { label: "Date not announced", days: null, sort: "9999" };
    const today = todayISO();
    if (rel.length === 4) return { label: +rel <= +today.slice(0, 4) ? "Out now" : rel, days: +rel < +today.slice(0, 4) ? -1 : null, sort: rel + "-12-31" };
    if (rel.length === 7) return { label: rel < today.slice(0, 7) ? "Out now" : fmtDate(rel), days: rel < today.slice(0, 7) ? -1 : null, sort: rel + "-28" };
    const days = Math.round((new Date(rel) - new Date(today)) / 864e5);
    return { label: days < 0 ? "Out now" : days === 0 ? "Out today!" : days === 1 ? "Tomorrow" : `in ${days} days`, days, sort: rel };
  }
  const fmtRelease = rel => { const i = releaseInfo(rel); return i.days != null && i.days > 1 ? `${fmtDate(rel)} · ${i.label}` : i.label; };

