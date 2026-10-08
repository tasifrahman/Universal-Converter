/* ============================================================
   NUMERAL — number systems
   ------------------------------------------------------------
   Values are carried as an exact rational (BigInt numerator over
   BigInt denominator) rather than a float, so
     0.1 (base 10) -> 0.000110011001100110011..._2
   stays correct instead of drifting. Floats only appear at the very
   edges (parsing user input, or rendering back to a JS number).

   Handles: bases 2-36 (fractional digits), unary, balanced ternary,
   Roman numerals including overline notation, and text encodings.
   ============================================================ */

var Numeral = (function () {
  var ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
  var OVERLINE = "̅";

  /* ---------- core rational ---------- */

  function make(num, den, neg) {
    if (den < 0n) { num = -num; den = -den; }
    return { num: BigInt(neg ? -num : num), den: BigInt(den) };
  }

  function digitValue(ch, base) {
    var i = ALPHABET.indexOf(ch.toLowerCase());
    return i >= 0 && i < base ? i : -1;
  }

  /**
   * Parse a numeral written in `base` into an exact rational.
   * Accepts an optional leading sign, digits, a fractional part and a
   * `pN` radix-point exponent (base^-(N*base)).  Underscores are ignored.
   */
  function parse(text, base) {
    var s = String(text).trim().replace(/_/g, "");
    if (!s) throw new Error("empty numeral");

    var neg = false;
    if (s[0] === "-") { neg = true; s = s.slice(1); }
    else if (s[0] === "+") s = s.slice(1);

    // radix point exponent: "1010p2" means the digits scaled by base^2
    var pointShift = 0;
    var pIdx = s.search(/[pP]/);
    if (pIdx >= 0) {
      var expTxt = s.slice(pIdx + 1);
      s = s.slice(0, pIdx);
      if (!/^-?\d+$/.test(expTxt)) throw new Error("bad radix exponent: " + expTxt);
      pointShift = parseInt(expTxt, 10);
    }

    if (!s) throw new Error("no digits");
    var bi = BigInt(base);
    var parts = s.split(".");
    if (parts.length > 2) throw new Error("more than one radix point");

    var intPart = 0n;
    for (var ch of parts[0]) {
      var d = digitValue(ch, base);
      if (d < 0) throw new Error("'" + ch + "' is not a base-" + base + " digit");
      intPart = intPart * bi + BigInt(d);
    }

    var frac = parts[1] || "";
    var num = 0n, den = 1n;
    for (ch of frac) {
      d = digitValue(ch, base);
      if (d < 0) throw new Error("'" + ch + "' is not a base-" + base + " digit");
      num = num * bi + BigInt(d);
      den *= bi;
    }

    // fold the integer part in, then scale the whole value by base^pointShift
    var fullNum = intPart * den + num;
    if (pointShift > 0) for (k = 0; k < pointShift; k++) fullNum *= bi;
    else for (k = 0; k < -pointShift; k++) den *= bi;

    return make(fullNum, den, neg);
  }

  /** Parse a plain decimal string (may be exponential, e.g. "1.5e-7"). */
  function parseDecimal(text) {
    var s = String(text).trim();
    var m = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(s);
    if (!m) throw new Error("not a decimal number: " + text);
    var sign = m[1] === "-" ? true : false;
    var ip = m[2] || "0", fp = m[3] || "", ex = m[4] ? parseInt(m[4], 10) : 0;

    var num = 0n;
    for (var ch of (ip + fp)) num = num * 10n + BigInt(ch === "." ? 0 : ch);
    var den = 10n ** BigInt(fp.length);
    if (ex > 0) num *= 10n ** BigInt(ex);
    else if (ex < 0) den *= 10n ** BigInt(-ex);

    return make(num, den, sign);
  }

  /** Rational -> approximate JS number. */
  function toNumber(r) {
    if (r.den === 1n) return Number(r.num);
    // scale by 10^12 before dividing so 15-ish significant digits survive
    var scaled = (r.num * 10n ** 12n) / r.den;
    return Number(scaled) / 1e12;
  }

  /** Rational -> string in `base`, with at most `maxFrac` fractional digits (rounded). */
  function format(r, base, maxFrac) {
    if (maxFrac == null) maxFrac = 20;
    var bi = BigInt(base);
    var neg = r.num < 0n;
    var num = neg ? -r.num : r.num;

    var intPart = num / r.den;
    var rem = num % r.den;

    var out = intPart.toString(base);

    if (rem !== 0n && maxFrac > 0) {
      var digits = [];
      var roundUp = false;
      for (var i = 0; i < maxFrac; i++) {
        rem *= bi;
        var q = rem / r.den;
        digits.push(ALPHABET[Number(q)]);
        rem %= r.den;
      }
      // one extra digit decides the rounding
      if (rem !== 0n) {
        rem *= bi;
        if ((rem / r.den) * 2n >= bi) roundUp = true;
      }
      if (roundUp) {
        var carry = true;
        for (i = digits.length - 1; i >= 0 && carry; i--) {
          var v = ALPHABET.indexOf(digits[i]) + 1;
          if (v === base) { digits[i] = ALPHABET[0]; }
          else { digits[i] = ALPHABET[v]; carry = false; }
        }
        if (carry) {
          var intStr = out.split("");
          var c = true;
          for (i = intStr.length - 1; i >= 0 && c; i--) {
            var iv = ALPHABET.indexOf(intStr[i]) + 1;
            if (iv === base) intStr[i] = ALPHABET[0];
            else { intStr[i] = ALPHABET[iv]; c = false; }
          }
          out = intStr.join("");
        }
      }
      out += "." + digits.join("");
    }

    return (neg ? "-" : "") + out;
  }

  /** JS number -> string in `base`. */
  function fromNumber(v, base, maxFrac) {
    if (!Number.isFinite(v)) throw new Error("not a finite number");
    if (v === 0) return "0";
    return format(parseDecimal(shortestDecimal(v)), base, maxFrac);
  }

  /** String(v) but never exponential -- feed it to parseDecimal. */
  function shortestDecimal(v) {
    var s = String(v);
    if (!/e/i.test(s)) return s;
    // expand "1.23e-7" into plain digits
    var m = /^(-?)(\d+)(?:\.(\d+))?e([+-]?\d+)$/i.exec(s);
    if (!m) return s;
    var sign = m[1], ip = m[2], fp = m[3] || "", ex = parseInt(m[4], 10);
    var digits = ip + fp;
    var pointAt = ip.length + ex;
    if (pointAt <= 0) return sign + "0." + "0".repeat(-pointAt) + digits;
    if (pointAt >= digits.length) return sign + digits + "0".repeat(pointAt - digits.length);
    return sign + digits.slice(0, pointAt) + "." + digits.slice(pointAt);
  }

  /* ---------- unary & balanced ternary ---------- */

  function toUnary(n) {
    if (!Number.isInteger(n) || n < 0) throw new Error("unary needs a non-negative integer");
    return n === 0 ? "" : "|".repeat(n);
  }
  function fromUnary(s) {
    var t = s.replace(/[^|]/g, "");
    return t.length;
  }

  function toBalancedTernary(n) {
    if (!Number.isInteger(n)) throw new Error("balanced ternary needs an integer");
    if (n === 0) return "0";
    var neg = n < 0;
    var k = Math.abs(n);
    var out = "";
    while (k > 0) {
      var r = k % 3;
      if (r === 0) { out = "0" + out; k = Math.floor(k / 3); }
      else if (r === 1) { out = "1" + out; k = (k - 1) / 3; }
      else { out = "T" + out; k = (k + 1) / 3; }
    }
    return (neg ? "-" : "") + out;
  }
  function fromBalancedTernary(s) {
    var neg = false;
    if (s[0] === "-") { neg = true; s = s.slice(1); }
    if (!s) throw new Error("empty balanced ternary");
    var acc = 0n;
    for (var ch of s) {
      acc *= 3n;
      if (ch === "1") acc += 1n;
      else if (ch === "T" || ch === "t") acc -= 1n;
      else if (ch === "0") { /* nothing */ }
      else throw new Error("'" + ch + "' is not a balanced ternary digit");
    }
    return Number(neg ? -acc : acc);
  }

  /* ---------- Roman numerals ---------- */

  var ROMAN_TABLE = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];

  function overline(s) {
    return Array.from(s).map(function (c) { return c + OVERLINE; }).join("");
  }

  /** Plain roman for 1-3999, no overlines. */
  function romanPlain(n) {
    var out = "";
    for (var [v, sym] of ROMAN_TABLE) {
      while (n >= v) { out += sym; n -= v; }
    }
    return out;
  }

  function toRoman(n) {
    if (!Number.isInteger(n)) throw new Error("Roman numerals need an integer");
    if (n === 0) return "N";                       // nulla
    var neg = n < 0;
    n = Math.abs(n);

    var thousands = Math.floor(n / 1000);
    var rest = n % 1000;

    var prefix;
    if (thousands === 0) prefix = "";
    else if (thousands <= 3) prefix = "M".repeat(thousands);   // 1000-3000 stay plain
    else if (thousands <= 3999) prefix = overline(romanPlain(thousands)); // bar = x1000
    else throw new Error("too large for Roman numerals (max 3,999,999)");

    return (neg ? "-" : "") + prefix + romanPlain(rest);
  }

  function fromRoman(s) {
    var t = String(s).trim().toUpperCase();
    if (!t) throw new Error("empty Roman numeral");
    var neg = false;
    if (t[0] === "-") { neg = true; t = t.slice(1); }

    // tokenise into numeric values, honouring overlines (each bar = x1000)
    var values = [];
    var i = 0;
    while (i < t.length) {
      var sym = t[i], bars = 0, j = i + 1;
      while (t[j] === OVERLINE) { bars++; j++; }
      var plain = ROMAN_SYMBOLS[sym];
      if (plain == null) throw new Error("'" + sym + "' is not a Roman numeral character");
      values.push(plain * Math.pow(1000, bars));
      i = j;
    }

    // standard subtractive rule: a smaller value before a bigger one is subtracted
    var total = 0;
    for (var k = 0; k < values.length; k++) {
      if (k + 1 < values.length && values[k] < values[k + 1]) total -= values[k];
      else total += values[k];
    }
    return neg ? -total : total;
  }

  var ROMAN_SYMBOLS = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000, N: 0 };

  /* ---------- convenience: guess what the user typed ---------- */

  /** Returns { base, value } for text written in any supported system. */
  function detect(text) {
    var s = String(text).trim();
    if (/^0x/i.test(s)) return { base: 16, value: s.slice(2) };
    if (/^0b/i.test(s)) return { base: 2, value: s.slice(2) };
    if (/^0o/i.test(s)) return { base: 8, value: s.slice(2) };
    // radix-point exponent, e.g. "1000p-2"
    if (/^[+-]?[0-9]*\.?[0-9]+[pP][+-]?\d+$/.test(s)) return { base: 10, value: s };
    if (/^[IVXLCDM̅]+$/i.test(s)) return { base: "roman", value: s };
    if (/^-?[01T]+$/.test(s) && /[T]/.test(s)) return { base: "bt", value: s };
    if (/^[0-9.,]+$/.test(s)) return { base: 10, value: s.replace(/,/g, "") };
    if (/^[0-9a-z.]+$/i.test(s)) return { base: 36, value: s };
    throw new Error("unrecognised numeral");
  }

  /** Parse text in any supported system into a JS number. */
  function valueOf(text) {
    var d = detect(text);
    if (d.base === "roman") return fromRoman(d.value);
    if (d.base === "bt") return fromBalancedTernary(d.value);
    return toNumber(parse(d.value, d.base));
  }

  /* ---------- text encodings ---------- */

  var encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  var decoder = typeof TextDecoder !== "undefined" ? new TextDecoder() : null;

  function textToBytes(str) {
    if (!encoder) throw new Error("TextEncoder unavailable");
    return Array.from(encoder.encode(str));
  }
  function bytesToText(bytes) {
    if (!decoder) throw new Error("TextDecoder unavailable");
    return decoder.decode(new Uint8Array(bytes));
  }
  function bytesToHex(bytes) {
    return bytes.map(function (b) { return b.toString(16).padStart(2, "0"); }).join(" ");
  }
  function hexToBytes(hex) {
    var h = hex.replace(/0x/gi, "").replace(/[^0-9a-f]/gi, "");
    if (h.length % 2) h = "0" + h;
    var out = [];
    for (var i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16));
    return out;
  }
  function base64Encode(str) {
    if (typeof btoa === "function") return btoa(unescape(encodeURIComponent(str)));
    return Buffer.from(str, "utf8").toString("base64");
  }
  function base64Decode(b64) {
    if (typeof atob === "function") return decodeURIComponent(escape(atob(b64)));
    return Buffer.from(b64, "base64").toString("utf8");
  }

  /* ---------- export ---------- */

  return {
    parse: parse,
    parseDecimal: parseDecimal,
    format: format,
    fromNumber: fromNumber,
    toNumber: toNumber,
    detect: detect,
    valueOf: valueOf,

    toUnary: toUnary,
    fromUnary: fromUnary,
    toBalancedTernary: toBalancedTernary,
    fromBalancedTernary: fromBalancedTernary,
    toRoman: toRoman,
    fromRoman: fromRoman,

    textToBytes: textToBytes,
    bytesToText: bytesToText,
    bytesToHex: bytesToHex,
    hexToBytes: hexToBytes,
    base64Encode: base64Encode,
    base64Decode: base64Decode,

    ALPHABET: ALPHABET,
    digitValue: digitValue,
  };
})();

// exported last: `var` is hoisted, so this must come after the assignment
if (typeof module !== "undefined" && module.exports) {
  module.exports = Numeral;
}