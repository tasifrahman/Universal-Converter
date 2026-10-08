/* ============================================================
   EXTRAS -- conversions that are not "one number times a factor"
   ------------------------------------------------------------
   Paper sizes are named shapes, not scalars. Shoe sizes are three
   correlated numbering systems. Time zones need a real IANA clock.
   So each of these gets its own small API instead of being forced
   through the generic engine.
   ============================================================ */

if (typeof module !== "undefined" && module.exports) {
  module.exports = Extras;
}

var Extras = (function () {
  var MM_PER_IN = 25.4;

  /* ============================================================
     PAPER
     ============================================================ */

  // name, width mm, height mm, family
  var PAPER = [
    ["A0", 841, 1189, "A"], ["A1", 594, 841, "A"], ["A2", 420, 594, "A"],
    ["A3", 297, 420, "A"], ["A4", 210, 297, "A"], ["A5", 148, 210, "A"],
    ["A6", 105, 148, "A"], ["A7", 74, 105, "A"], ["A8", 52, 74, "A"],
    ["A9", 37, 52, "A"], ["A10", 26, 37, "A"],
    ["B4", 250, 353, "B"], ["B5", 176, 250, "B"], ["B6", 125, 176, "B"],
    ["C4", 229, 324, "C"], ["C5", 162, 229, "C"], ["C6", 114, 162, "C"],
    ["DL", 220, 110, "envelope"], ["DL+", 220, 125, "envelope"],
    ["Business card", 55, 85, "card"],
    ["Letter", 215.9, 279.4, "North American"],
    ["Legal", 215.9, 355.6, "North American"],
    ["Tabloid", 279.4, 431.8, "North American"],
    ["Executive", 184.15, 266.7, "North American"],
    ["Foolscap", 210, 330.2, "North American"],
    ["Ledger", 431.8, 279.4, "North American"],
    ["Quarto", 215.9, 275.3, "historical"],
    ["Folio", 210, 330, "historical"],
    ["Octavo", 152.4, 229.2, "historical"],
    ["Imperial", 216, 345.4, "historical"],
    ["Royal", 254, 338.6, "historical"],
    ["Super Royal", 276.9, 381, "historical"],
  ];

  function paperSizes() {
    return PAPER.map(function (p) {
      return {
        name: p[0], w: p[1], h: p[2], family: p[3],
        areaMm2: p[1] * p[2],
        areaCm2: (p[1] * p[2]) / 100,
        areaM2: (p[1] * p[2]) / 1e6,
        areaIn2: (p[1] / MM_PER_IN) * (p[2] / MM_PER_IN),
        ratio: Math.round((p[2] / p[1]) * 1000) / 1000,
        wIn: p[1] / MM_PER_IN,
        hIn: p[2] / MM_PER_IN,
      };
    });
  }

  /** How many of `from` fit on one of `to` (by area). */
  function paperRatio(fromName, toName) {
    var a = PAPER.find(function (p) { return p[0] === fromName; });
    var b = PAPER.find(function (p) { return p[0] === toName; });
    if (!a || !b) return NaN;
    return (a[1] * a[2]) / (b[1] * b[2]);
  }

  /** Pixel dimensions for a paper size at a given DPI. */
  function paperToPixels(name, dpi) {
    var p = PAPER.find(function (x) { return x[0] === name; });
    if (!p) return null;
    return {
      w: Math.round((p[1] / MM_PER_IN) * dpi),
      h: Math.round((p[2] / MM_PER_IN) * dpi),
      dpi: dpi,
    };
  }

  /* ============================================================
     SHOE SIZES
     ============================================================ */

  /* EU is the most linear of the three, so EU is the pivot.
   * Men:   UK = EU - 33.5,  US = UK + 1
   * Women: UK = EU - 33.5,  US = UK + 4.5
   * Foot length follows the Paris point: 1 EU ~= 6.667 mm
   * minus a fixed offset. Approximate, as sizing charts are. */
  function shoeSizes(gender) {
    var women = gender === "women";
    var out = [];
    for (var eu = women ? 34 : 36; eu <= (women ? 44.5 : 49); eu += 0.5) {
      var uk = Math.round((eu - 33.5) * 2) / 2;
      out.push({
        eu: eu,
        uk: uk,
        us: women ? uk + 4.5 : uk + 1,
        footMm: Math.round((eu - 1.5) * 6.6667),
        footIn: Math.round(((eu - 1.5) * 6.6667) / 25.4 * 100) / 100,
      });
    }
    return out;
  }

  function convertShoe(gender, size, from, to) {
    var table = shoeSizes(gender);
    // find the nearest row by the source system
    var best = table[0], bestD = Infinity;
    for (var r of table) {
      var d = Math.abs(r[from] - size);
      if (d < bestD) { bestD = d; best = r; }
    }
    return best[to];
  }

  /* ============================================================
     CLOTHING
     ============================================================ */

  var SHIRT_NECK = { XS: [14, 36], S: [15, 38], M: [16, 41], L: [17, 43], XL: [18, 46], XXL: [19, 48], XXXL: [20, 51] };
  var TOP_NUMERIC = { XS: [0, 30, 34], S: [2, 32, 36], M: [4, 34, 38], L: [6, 36, 42], XL: [8, 40, 46], XXL: [10, 44, 50] };

  function shirtSize(label) {
    var r = SHIRT_NECK[label];
    return r ? { label: label, neckIn: r[0], neckCm: r[1], chestIn: r[0] + 2, chestCm: r[1] + 5.08 } : null;
  }

  /* Trouser/waist sizing. UK and US both quote the waist in inches here, and
   * the usual EU step is +16 inches (28in->44, 32in->48, 36in->52), so that
   * offset is the practical approximation rather than a precise standard. */
  function waistToSize(inches) {
    var u = Math.round(inches * 2) / 2;
    return {
      inches: inches,
      cm: Math.round(inches * 2.54 * 10) / 10,
      uk: u,
      us: u,
      eu: Math.round(inches + 16),
      approx: true,
    };
  }

  /* ============================================================
     TIME ZONES
     ============================================================ */

  var ZONES = [
    "UTC", "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles",
    "America/Denver", "America/Phoenix", "America/Chicago", "America/Mexico_City",
    "America/New_York", "America/Toronto", "America/Bogota", "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires", "Atlantic/Reykjavik", "Europe/London",
    "Europe/Lisbon", "Europe/Dublin", "Europe/Madrid", "Europe/Paris",
    "Europe/Berlin", "Europe/Rome", "Europe/Amsterdam", "Europe/Brussels",
    "Europe/Zurich", "Europe/Vienna", "Europe/Prague", "Europe/Warsaw",
    "Europe/Stockholm", "Europe/Oslo", "Europe/Copenhagen", "Europe/Helsinki",
    "Europe/Athens", "Europe/Istanbul", "Europe/Kyiv", "Europe/Moscow",
    "Africa/Casablanca", "Africa/Lagos", "Africa/Cairo", "Africa/Nairobi",
    "Africa/Johannesburg", "Asia/Jerusalem", "Asia/Dubai", "Asia/Karachi",
    "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Jakarta",
    "Asia/Singapore", "Asia/Hong_Kong", "Asia/Shanghai", "Asia/Taipei",
    "Asia/Seoul", "Asia/Tokyo", "Asia/Manila", "Australia/Perth",
    "Australia/Adelaide", "Australia/Brisbane", "Australia/Sydney",
    "Pacific/Auckland", "Pacific/Fiji", "Pacific/Honolulu",
  ];

  function zoneLabel(zone) {
    return String(zone).split("/").pop().replace(/_/g, " ");
  }

  function timeInZone(date, zone) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: zone, hour: "2-digit", minute: "2-digit",
        second: "2-digit", hour12: false,
      }).format(date);
    } catch (e) {
      return null;
    }
  }

  function dayInZone(date, zone) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: zone, weekday: "short", day: "numeric", month: "short", year: "numeric",
      }).format(date);
    } catch (e) {
      return null;
    }
  }

  /** UTC offset in hours for a zone at a given instant, e.g. +5.5 */
  function zoneOffset(date, zone) {
    var s = timeInZone(date, zone);
    if (!s) return null;
    var parts = s.split(":").map(Number);
    var asUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      parts[0], parts[1], parts[2]);
    return Math.round((asUTC - date.getTime()) / 36e5 * 100) / 100;
  }

  /** Wall-clock time in zone A expressed in zone B. */
  function convertTime(date, fromZone, toZone) {
    var off = zoneOffset(date, fromZone);
    if (off == null) return null;
    var shifted = new Date(date.getTime() + off * 36e5);
    var target = timeInZone(shifted, toZone);
    return { time: target, day: dayInZone(shifted, toZone), offset: zoneOffset(shifted, toZone) };
  }

  /* ============================================================
     DATES & AGES
     ============================================================ */

  var MS_YEAR = 365.2425 * 24 * 36e5;

  function parseDate(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text).trim());
    if (!m) {
      var d = new Date(text);
      if (!isNaN(d)) return d;
      return null;
    }
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  /** Whole-years age, plus the exact remainder in months/days. */
  function ageBetween(birth, now) {
    if (!birth) return null;
    var ref = now || new Date();
    var y = ref.getFullYear() - birth.getFullYear();
    var m = ref.getMonth() - birth.getMonth();
    var d = ref.getDate() - birth.getDate();
    if (d < 0) { m--; d += daysInMonth(ref.getFullYear(), ref.getMonth() - 1); }
    if (m < 0) { y--; m += 12; }
    var totalDays = Math.floor((ref - birth) / 864e5);
    return {
      years: y, months: m, days: d,
      totalMonths: y * 12 + m,
      totalDays: totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalHours: Math.floor((ref - birth) / 36e5),
      totalMinutes: Math.floor((ref - birth) / 6e4),
      totalSeconds: Math.floor((ref - birth) / 1000),
      decades: (ref - birth) / (MS_YEAR * 10),
      inDaysOfEarth: (ref - birth) / (864e5 * 365.2425),
      leapDays: countLeapDays(birth, ref),
    };
  }

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

  function countLeapDays(from, to) {
    var n = 0;
    for (var y = from.getFullYear(); y <= to.getFullYear(); y++) {
      var feb29 = new Date(y, 1, 29);
      if (feb29.getDate() === 29 && feb29 >= from && feb29 <= to) n++;
    }
    return n;
  }

  /** How long ago a past timestamp was, in words-ish units. */
  function timeSince(past, now) {
    var ref = now || new Date();
    var s = Math.floor((ref - past) / 1000);
    if (s < 0) return null;
    var units = [
      [31557600, "year"], [2629746, "month"], [604800, "week"],
      [86400, "day"], [3600, "hour"], [60, "minute"], [1, "second"],
    ];
    for (var [sec, name] of units) {
      if (s >= sec) {
        var n = Math.floor(s / sec);
        return { value: n, unit: name, seconds: s };
      }
    }
    return { value: s, unit: "second", seconds: s };
  }

  /* ============================================================
     IMAGES
     ============================================================ */

  function megapixels(w, h) { return (w * h) / 1e6; }

  /** Pixel count -> print size at a DPI, or the reverse. */
  function pixelsToPrint(px, dpi) { return (px / dpi) * MM_PER_IN; }
  function printToPixels(mm, dpi) { return Math.round((mm / MM_PER_IN) * dpi); }

  /** Factor two dimensions by a common ratio, e.g. reduce to 1920 wide. */
  function scaleTo(w, h, target) {
    var s = target / w;
    return { width: target, height: Math.round(h * s), scale: s };
  }

  function aspect(w, h) {
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }
    var g = gcd(w, h);
    return { ratio: w / h, reduced: w / g + ":" + h / g };
  }

  /* ============================================================
     PHYSICS CONSTANTS
     ============================================================ */

  var CONSTANTS = [
    { name: "Speed of light in vacuum", sym: "c", value: 299792458, unit: "m/s", note: "exact by definition", exact: true },
    { name: "Planck constant", sym: "h", value: 6.62607015e-34, unit: "J·s", note: "exact by definition", exact: true },
    { name: "Elementary charge", sym: "e", value: 1.602176634e-19, unit: "C", note: "exact by definition", exact: true },
    { name: "Boltzmann constant", sym: "k", value: 1.380649e-23, unit: "J/K", note: "exact by definition", exact: true },
    { name: "Avogadro constant", sym: "N_A", value: 6.02214076e23, unit: "1/mol", note: "exact by definition", exact: true },
    { name: "Speed of light in water", sym: "c_w", value: 224250000, unit: "m/s", note: "about 75% of c" },
    { name: "Standard gravity", sym: "g₀", value: 9.80665, unit: "m/s²", note: "exact by definition" },
    { name: "Standard atmosphere", sym: "atm", value: 101325, unit: "Pa", note: "exact by definition" },
    { name: "Newtonian constant of gravitation", sym: "G", value: 6.67430e-11, unit: "N·m²/kg²", note: "measured" },
    { name: "Stefan–Boltzmann constant", sym: "σ", value: 5.670374419e-8, unit: "W/m²·K⁴", note: "measured" },
    { name: "Molar gas constant", sym: "R", value: 8.314462618, unit: "J/mol·K", note: "measured" },
    { name: "Vacuum electric permittivity", sym: "ε₀", value: 8.8541878128e-12, unit: "F/m", note: "measured" },
    { name: "Vacuum magnetic permeability", sym: "μ₀", value: 1.25663706212e-6, unit: "N/A²", note: "measured" },
    { name: "Fine-structure constant", sym: "α", value: 7.2973525693e-3, unit: "", note: "dimensionless" },
    { name: "Atomic mass unit", sym: "u", value: 1.66053906660e-27, unit: "kg", note: "measured" },
    { name: "Electron rest mass", sym: "mₑ", value: 9.1093837015e-31, unit: "kg", note: "measured" },
    { name: "Proton rest mass", sym: "m_p", value: 1.67262192369e-27, unit: "kg", note: "measured" },
    { name: "Neutron rest mass", sym: "m_n", value: 1.67492749804e-27, unit: "kg", note: "measured" },
    { name: "Bohr radius", sym: "a₀", value: 5.29177210903e-11, unit: "m", note: "measured" },
    { name: "Rydberg constant", sym: "R_∞", value: 10973731.568160, unit: "1/m", note: "measured" },
    { name: "Bohr magneton", sym: "μ_B", value: 9.2740100783e-24, unit: "J/T", note: "measured" },
    { name: "Faraday constant", sym: "F", value: 96485.33212, unit: "C/mol", note: "measured" },
    { name: "Carbon-14 half-life", sym: "t½", value: 5730, unit: "year", note: "measured" },
    { name: "Earth mean radius", sym: "R⊕", value: 6371000, unit: "m", note: "IUGG mean" },
    { name: "Astronomical unit", sym: "AU", value: 1.495978707e11, unit: "m", note: "exact" },
    { name: "Parsec", sym: "pc", value: 3.0856775814913673e16, unit: "m", note: "exact" },
    { name: "Pi", sym: "π", value: Math.PI, unit: "", note: "to 15 digits" },
    { name: "Euler–Mascheroni", sym: "γ", value: 0.5772156649015329, unit: "", note: "to 16 digits" },
    { name: "Golden ratio", sym: "φ", value: 1.618033988749895, unit: "", note: "to 16 digits" },
  ];

  function constants() { return CONSTANTS; }

  /* ---------- export ---------- */

  return {
    paperSizes: paperSizes,
    paperRatio: paperRatio,
    paperToPixels: paperToPixels,
    shoeSizes: shoeSizes,
    convertShoe: convertShoe,
    shirtSize: shirtSize,
    waistToSize: waistToSize,
    zones: ZONES,
    zoneLabel: zoneLabel,
    timeInZone: timeInZone,
    dayInZone: dayInZone,
    zoneOffset: zoneOffset,
    convertTime: convertTime,
    parseDate: parseDate,
    ageBetween: ageBetween,
    timeSince: timeSince,
    megapixels: megapixels,
    pixelsToPrint: pixelsToPrint,
    printToPixels: printToPixels,
    scaleTo: scaleTo,
    aspect: aspect,
    constants: constants,
    MM_PER_IN: MM_PER_IN,
  };
})();