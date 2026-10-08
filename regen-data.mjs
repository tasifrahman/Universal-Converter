#!/usr/bin/env node
/* ============================================================
   REGENERATE BUNDLED DATA
   ------------------------------------------------------------
   Two data files in this directory are generated, not hand-written:

     currency-snapshot.js   offline fallback exchange rates
     color-names.js         the 148 CSS/X11 colour names

   Both are committed so the site works with no network at all.
   Re-run this only when you want fresher data:

       node regen-data.mjs

   It needs network access but no dependencies (node >= 18 for fetch).
   ============================================================ */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = dirname(fileURLToPath(import.meta.url));

/* ---------- 1. currency rates -> offline snapshot ---------- */

// 104 currencies: every ISO 4217 code that a person is plausibly converting,
// plus a few widely-traded digital assets the feed happens to carry.
const WANTED = [
  "usd", "eur", "jpy", "gbp", "aud", "cad", "chf", "cny", "hkd", "nzd",
  "sek", "nok", "dkk", "inr", "mxn", "sgd", "rub", "try", "zar", "krw",
  "brl", "twd", "thb", "idr", "php", "vnd", "myr", "pkr", "sar", "aed",
  "egp", "ngn", "pln", "uah", "czk", "ils", "clp", "cop", "ars", "pen",
  "qar", "kwd", "bhd", "omr", "jod", "lbp", "iqd", "bdt", "lkr", "npr",
  "afn", "mmk", "khr", "lak", "mnt", "kzt", "uzs", "gel", "azn", "amd",
  "bsd", "bzd", "bbd", "bmd", "fjd", "gip", "jmd", "ttd", "xcd", "xof",
  "xaf", "xpf", "rwf", "ugx", "tzs", "kes", "ghs", "nad", "zmw", "bwp",
  "mur", "scr", "etb", "aon", "aoa", "cdf", "cve", "gmd", "gnf", "lrd",
  "sll", "sos", "ssp", "sdg", "top", "wst", "vuv", "xdr", "sui", "byn",
  "mkd", "hrk", "cuc", "htg", "mzn", "lyd", "btc", "eth",
];

const RATES_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

const res = await fetch(RATES_URL);
if (!res.ok) throw new Error(`${RATES_URL} -> HTTP ${res.status}`);
const fx = await res.json();
if (!fx || !fx.usd) throw new Error("unexpected response shape (no .usd table)");

const snapshot = {};
for (const code of new Set(WANTED)) {
  if (typeof fx.usd[code] === "number" && fx.usd[code] > 0) snapshot[code] = fx.usd[code];
}

writeFileSync(
  join(OUT, "currency-snapshot.js"),
  `/* Offline fallback exchange rates. GENERATED FILE -- do not edit by hand.
 * Regenerate with:  node regen-data.mjs
 *
 * Rate = units of the currency per 1 USD. Source: fawazahmed0/currency-api.
 * Snapshot taken ${fx.date}. Only used when both live endpoints fail, in which
 * case the UI labels the numbers as a snapshot rather than passing them off as live.
 */
if (typeof module !== "undefined" && module.exports) module.exports = SNAPSHOT_RATES;
var SNAPSHOT_RATES = ${JSON.stringify(snapshot)};
var SNAPSHOT_DATE = ${JSON.stringify(fx.date)};
`
);
console.log(`currency-snapshot.js  ${Object.keys(snapshot).length} currencies, dated ${fx.date}`);

/* ---------- 2. colour names ---------- */

const COLORS_URL = "https://cdn.jsdelivr.net/npm/color-name@2.1.1/index.js";
const cres = await fetch(COLORS_URL);
if (!cres.ok) throw new Error(`${COLORS_URL} -> HTTP ${cres.status}`);
const csrc = await cres.text();

// It ships as ESM, so import it rather than regexing the object literal out.
const tmp = join(OUT, ".color-name.tmp.mjs");
writeFileSync(tmp, csrc);
let colors;
try {
  colors = (await import(`${new URL(`file://${tmp}`).href}?t=${Date.now()}`)).default;
} finally {
  try { (await import("node:fs")).unlinkSync(tmp); } catch {}
}

const pairs = Object.entries(colors).map(([name, rgb]) => [name, rgb]);
writeFileSync(
  join(OUT, "color-names.js"),
  `/* CSS/X11 colour names -> [r, g, b]. GENERATED FILE -- do not edit by hand.
 * Regenerate with:  node regen-data.mjs
 */
if (typeof module !== "undefined" && module.exports) module.exports = COLOR_NAMES;
var COLOR_NAMES = ${JSON.stringify(pairs)};
`
);
console.log(`color-names.js        ${pairs.length} colour names`);