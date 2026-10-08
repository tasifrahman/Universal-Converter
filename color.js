/* ============================================================
   COLOR — colour model conversions
   ------------------------------------------------------------
   sRGB is the working space. Everything else (hex, hsl, hsv, cmyk,
   named colours) is a view onto it. Alpha is carried where the model
   has it and reported as unsupported where it does not.
   ============================================================ */

if (typeof module !== "undefined" && module.exports) {
  module.exports = Color;
}

var Color = (function () {
  var NAMED = typeof COLOR_NAMES !== "undefined" ? COLOR_NAMES : [];

  /* ---------- parsing ---------- */

  function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }
  function round(n) { return Math.round(n * 1000) / 1000; }

  /**
   * Accepts: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(),
   * hsla(), and any of the 148 CSS colour names.
   * Returns { r, g, b, a } with a in 0..1, or null.
   */
  function parse(input) {
    if (input == null) return null;
    if (typeof input === "object" && "r" in input) {
      return { r: input.r, g: input.g, b: input.b, a: input.a == null ? 1 : input.a };
    }
    var s = String(input).trim().toLowerCase();
    if (!s) return null;

    // named colours
    for (var i = 0; i < NAMED.length; i++) {
      if (NAMED[i][0] === s) return { r: NAMED[i][1][0], g: NAMED[i][1][1], b: NAMED[i][1][2], a: 1 };
    }
    if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
    if (s === "rebeccapurple") return { r: 102, g: 51, b: 153, a: 1 };

    if (s[0] === "#") {
      var h = s.slice(1);
      if (!/^[0-9a-f]+$/.test(h)) return null;
      if (h.length === 3 || h.length === 4) {
        h = h.split("").map(function (c) { return c + c; }).join("");
      }
      if (h.length !== 6 && h.length !== 8) return null;
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }

    var m = /^rgba?\(([^)]+)\)$/.exec(s);
    if (m) {
      var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
      if (p.length < 3) return null;
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? (String(m[1]).includes("%") ? p[3] / 100 : p[3]) : 1 };
    }

    m = /^hsla?\(([^)]+)\)$/.exec(s);
    if (m) {
      var q = m[1].split(/[,\s/]+/).filter(Boolean);
      // hslToRgb takes percentages, matching what rgbToHsl returns
      var hh = parseFloat(q[0]), ss = parseFloat(q[1]), ll = parseFloat(q[2]);
      var aa = q.length > 3 ? parseFloat(q[3]) : 1;
      if (q[3] && q[3].indexOf("%") >= 0) aa /= 100;
      var rgb = hslToRgb(hh, ss, ll);
      return { r: rgb.r, g: rgb.g, b: rgb.b, a: aa };
    }

    return null;
  }

  /* ---------- models ---------- */

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2;
    var h = 0, s = 0;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100;
    function f(n) {
      var k = (n + h * 12) % 12;
      var a = s * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))));
    }
    return { r: f(0), g: f(8), b: f(4) };
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var h = 0;
    if (d !== 0) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
      if (h < 0) h += 360;
    }
    return { h: h, s: (max === 0 ? 0 : d / max) * 100, v: max * 100 };
  }

  function hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360; s /= 100; v /= 100;
    var c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    var t = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
    return {
      r: Math.round((t[0] + m) * 255),
      g: Math.round((t[1] + m) * 255),
      b: Math.round((t[2] + m) * 255),
    };
  }

  function rgbToCmyk(r, g, b) {
    var R = r / 255, G = g / 255, B = b / 255;
    var k = 1 - Math.max(R, G, B);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: ((1 - R - k) / (1 - k)) * 100,
      m: ((1 - G - k) / (1 - k)) * 100,
      y: ((1 - B - k) / (1 - k)) * 100,
      k: k * 100,
    };
  }

  function cmykToRgb(c, m, y, k) {
    c /= 100; m /= 100; y /= 100; k /= 100;
    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - m) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k)),
    };
  }

  /* ---------- output ---------- */

  function hex2(n) { return clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0"); }

  function toHex(c) {
    c = parse(c) || { r: 0, g: 0, b: 0, a: 1 };
    var base = "#" + hex2(c.r) + hex2(c.g) + hex2(c.b);
    return c.a < 1 ? base + hex2(c.a * 255) : base;
  }

  function toRgbString(c) {
    c = parse(c);
    if (!c) return null;
    return c.a < 1
      ? "rgba(" + c.r + ", " + c.g + ", " + c.b + ", " + round(c.a) + ")"
      : "rgb(" + c.r + ", " + c.g + ", " + c.b + ")";
  }

  function toHslString(c) {
    c = parse(c);
    if (!c) return null;
    var hsl = rgbToHsl(c.r, c.g, c.b);
    var body = "hsl(" + Math.round(hsl.h) + ", " + Math.round(hsl.s) + "%, " + Math.round(hsl.l) + "%)";
    return c.a < 1 ? body.replace("hsl(", "hsla(").replace(")", ", " + round(c.a) + ")") : body;
  }

  function toHsv(c) { c = parse(c); return c ? rgbToHsv(c.r, c.g, c.b) : null; }

  function toCmykString(c) {
    c = parse(c);
    if (!c) return null;
    var q = rgbToCmyk(c.r, c.g, c.b);
    return "cmyk(" + [q.c, q.m, q.y, q.k].map(function (v) { return Math.round(v); }).join("%, ") + "%)";
  }

  /* ---------- derived info ---------- */

  function hexToRgbInt(h) {
    var c = parse(h);
    return c ? (c.r << 16) + (c.g << 8) + c.b : 0;
  }

  function rgbIntToHex(n) {
    return "#" + (n & 0xffffff).toString(16).padStart(6, "0");
  }

  function toInt(c) {
    c = parse(c);
    return c ? (c.r << 16) + (c.g << 8) + c.b : 0;
  }

  /** WCAG relative luminance. */
  function luminance(c) {
    c = parse(c);
    if (!c) return 0;
    function ch(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }

  /** WCAG contrast ratio, 1..21. */
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /** Closest CSS colour name, using a perceptually-weighted RGB distance. */
  function nearestName(c) {
    c = parse(c);
    if (!c) return null;
    var best = null, bestD = Infinity;
    for (var i = 0; i < NAMED.length; i++) {
      var n = NAMED[i][1];
      // weights approximate perceived difference
      var dr = (c.r - n[0]) * 0.299, dg = (c.g - n[1]) * 0.587, db = (c.b - n[2]) * 0.114;
      var d = dr * dr + dg * dg + db * db;
      if (d < bestD) { bestD = d; best = NAMED[i][0]; }
    }
    return best;
  }

  function allNames() { return NAMED.map(function (n) { return n[0]; }); }

  /* ---------- harmonies ---------- */

  function harmonies(c) {
    var hsv = toHsv(c);
    if (!hsv) return null;
    function at(d) {
      return rgbIntToHex(toInt(hsvToRgb(hsv.h + d, hsv.s, hsv.v)));
    }
    return {
      complementary: at(180),
      analogous: [at(-30), at(0), at(30)],
      triadic: [at(0), at(120), at(240)],
      tetradic: [at(0), at(90), at(180), at(270)],
      monochromatic: [-30, -15, 0, 15, 30].map(function (d) {
        return rgbIntToHex(toInt(hsvToRgb(hsv.h, hsv.s, hsv.v + d)));
      }),
    };
  }

  /** Darken (amount < 0) or lighten (amount > 0) by a lightness delta. */
  function shade(c, amount) {
    c = parse(c);
    if (!c) return null;
    var h = rgbToHsl(c.r, c.g, c.b);
    return rgbIntToHex(toInt(hslToRgb(h.h, h.s, clamp(h.l + amount, 0, 100))));
  }

  /** Same hue, reduced saturation, pulled toward white. */
  function tint(c, amount) {
    c = parse(c);
    if (!c) return null;
    var h = rgbToHsl(c.r, c.g, c.b);
    return rgbIntToHex(toInt(hslToRgb(h.h, h.s * (1 - amount), clamp(h.l + amount * 40, 0, 100))));
  }

  function name() { return NAMED.length; }

  return {
    parse: parse,
    toHex: toHex,
    toInt: toInt,
    hexToRgbInt: hexToRgbInt,
    rgbIntToHex: rgbIntToHex,
    toRgbString: toRgbString,
    toHslString: toHslString,
    toHsv: toHsv,
    toCmykString: toCmykString,
    rgbToHsl: rgbToHsl,
    hslToRgb: hslToRgb,
    rgbToHsv: rgbToHsv,
    hsvToRgb: hsvToRgb,
    rgbToCmyk: rgbToCmyk,
    cmykToRgb: cmykToRgb,
    luminance: luminance,
    contrast: contrast,
    nearestName: nearestName,
    allNames: allNames,
    harmonies: harmonies,
    shade: shade,
    tint: tint,
    nameCount: name,
  };
})();