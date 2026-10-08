/* ============================================================
   CONVERT — the conversion engine
   Pure functions, no DOM. Loaded in the browser via <script> and
   in node via require() so selftest.js can verify the maths.
   ============================================================

   Every physical category is a plain multiplicative table:

       convert(v) = v * units[from].toBase / units[to].toBase

   which keeps "add a new unit" a one-line edit instead of a new
   special-case function. The four categories that genuinely are not
   multiplicative get explicit escape hatches rather than polluting
   the engine:

     cat.convert   overrides the whole conversion (temperature)
     unit.invert   the unit is "consumption per distance" (fuel economy)
     (colour, currency and numerals live in their own modules entirely)
   ============================================================ */

if (typeof module !== "undefined" && module.exports) {
  module.exports = { convert, toBaseValue, fromBaseValue, isInvertible, formatNumber, roundSig };
}

/* ---------- core ---------- */

/**
 * Convert `value` from one unit to another within a category.
 * @param {object} cat   category object (see units.js)
 * @param {number} value source value
 * @param {string} fromId source unit id
 * @param {string} toId   target unit id
 * @returns {number} converted value, or NaN on bad input
 */
function convert(cat, value, fromId, toId) {
  const f = cat.units[fromId];
  const t = cat.units[toId];
  if (!f || !t) throw new Error(`unknown unit in ${cat.id}: ${fromId} -> ${toId}`);
  if (typeof value !== "number" || !Number.isFinite(value)) return NaN;

  // temperature and friends
  if (typeof cat.convert === "function") return cat.convert(value, f, t);

  return fromBaseValue(cat, t, toBaseValue(cat, f, value));
}

/** Value -> category base unit.
 *  `unit.invFactor` overrides the category default, because "per 100 km" and
 *  "per 100 miles" invert by different amounts. */
function toBaseValue(cat, unit, value) {
  if (unit.invert) return (unit.invFactor || cat.inverseFactor) / value;
  return value * unit.toBase;
}

/** Category base unit -> value. */
function fromBaseValue(cat, unit, base) {
  if (unit.invert) return (unit.invFactor || cat.inverseFactor) / base;
  return base / unit.toBase;
}

/** True when a category mixes "per distance" units with plain ones. */
function isInvertible(cat) {
  return typeof cat.inverseFactor === "number";
}

/* ---------- rounding + display ---------- */

/** Round to `sig` significant digits, staying in Number range. */
function roundSig(v, sig) {
  if (v === 0 || !Number.isFinite(v)) return v;
  return Number(v.toPrecision(sig));
}

/**
 * Human-readable number.
 *  - large/small values fall back to exponential so we never print
 *    0.0000000000000042 or 1.0000000000000002e21
 *  - big values get thousands separators
 *  - trailing zeros from rounding are dropped
 */
function formatNumber(v, sig) {
  sig = sig || 10;
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  if (!Number.isFinite(v)) return v > 0 ? "∞" : "−∞";
  if (v === 0) return "0";

  const abs = Math.abs(v);
  if (abs >= 1e15 || abs < 1e-6) {
    return v
      .toExponential(Math.max(0, sig - 1))
      .replace(/\.?0+(e[+-]?\d+)$/, "$1")
      .replace("e", " × 10^");
  }

  let out;
  if (abs >= 10000) {
    out = roundSig(v, sig).toLocaleString("en-US", { maximumFractionDigits: 20 });
  } else {
    out = String(roundSig(v, sig));
  }
  return out.replace("-", "−");
}