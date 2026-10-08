#!/usr/bin/env node
/* ============================================================
   SELFTEST -- run with:  node selftest.js
   ------------------------------------------------------------
   The converter's UI needs a browser, but the maths does not, so
   every conversion goes through here first. This is how the tables
   get verified without opening the page.
   ============================================================ */

const path = require("node:path");
const fs = require("node:fs");
const vm = require("node:vm");

/* Load the data + logic files exactly the way a browser <script> tag does:
   as global-scope scripts that share globals with each other. Using require()
   would give each file its own module scope, so color.js could never see
   COLOR_NAMES the way it does on the page. */
[
  "color-names.js", "currency-snapshot.js",
  "convert.js", "units.js", "numeral.js", "color.js", "currency.js", "extras.js",
].forEach(function (f) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, f), "utf8"), { filename: f });
});

/* `function` and `var` at script top level become properties of globalThis;
   `const`/`let` go into the global *lexical* scope, which is visible to bare
   identifiers but not as globalThis properties. So only destructure the
   former, and leave CATEGORY_LIST etc. to be picked up lexically. */
const { convert, formatNumber } = globalThis;
const { getCategory } = globalThis;

let passed = 0, failed = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) passed++;
  else { failed++; failures.push(`${name}${detail ? "  -> " + detail : ""}`); }
}

function near(name, actual, expected, tol) {
  tol = tol == null ? 1e-9 : tol;
  const scale = Math.max(Math.abs(expected), 1);
  const err = Math.abs(actual - expected) / scale;
  ok(name, err <= tol, `got ${actual}, want ${expected}`);
}

/** convert a value between two units of the same category */
function cv(catId, v, from, to) {
  return convert(getCategory(catId), v, from, to);
}

/* ---------- 1. known-good reference values ---------- */
console.log("\n== reference conversions ==");

near("1 mile -> km",            cv("length", 1, "mile", "kilometer"), 1.609344);
near("1 yard -> feet",          cv("length", 1, "yard", "foot"), 3);
near("1 inch -> cm",            cv("length", 1, "inch", "centimeter"), 2.54);
near("1 light-year -> km",      cv("length", 1, "lightyear", "kilometer"), 9.4607304725808e12, 1e-12);
near("1 smoot -> inches",       cv("length", 1, "smoot", "inch"), 67);
near("1 furlong -> chains",     cv("length", 1, "furlong", "chain"), 10);

near("1 kg -> lb",              cv("mass", 1, "kilogram", "pound"), 2.2046226218487757, 1e-12);
near("1 lb -> oz",              cv("mass", 1, "pound", "ounce"), 16);
near("1 stone -> lb",           cv("mass", 1, "stone", "pound"), 14);
near("1 carat -> g",            cv("mass", 1, "carat", "gram"), 0.2);
near("1 tonne -> kg",           cv("mass", 1, "tonne", "kilogram"), 1000);

near("1 acre -> m2",            cv("area", 1, "acre", "sq_meter"), 4046.8564224, 1e-12);
near("1 hectare -> m2",         cv("area", 1, "hectare", "sq_meter"), 10000);
near("1 sq mile -> acre",       cv("area", 1, "sq_mile", "acre"), 640);
near("1 barn -> m2",            cv("area", 1, "barn", "sq_meter"), 1e-28);

near("1 US cup -> mL",          cv("volume", 1, "cup_us", "milliliter"), 236.5882365, 1e-12);
near("1 UK gallon -> L",        cv("volume", 1, "gallon_uk", "liter"), 4.54609);
near("1 ft3 -> L",              cv("volume", 1, "cubic_foot", "liter"), 28.316846592, 1e-12);
near("1 tbsp -> tsp",           cv("cooking", 1, "tablespoon", "teaspoon"), 3);
near("1 tbsp -> mL",            cv("cooking", 1, "tablespoon", "milliliter"), 14.78676478125, 1e-12);

near("0 C -> F",                cv("temperature", 0, "celsius", "fahrenheit"), 32, 1e-12);
near("100 C -> F",              cv("temperature", 100, "celsius", "fahrenheit"), 212, 1e-9);
near("0 C -> K",                cv("temperature", 0, "celsius", "kelvin"), 273.15, 1e-12);
near("0 K -> C",                cv("temperature", 0, "kelvin", "celsius"), -273.15, 1e-12);
near("-40 C -> F",              cv("temperature", -40, "celsius", "fahrenheit"), -40, 1e-12);
near("0 C -> Re",               cv("temperature", 0, "celsius", "reaumur"), 0, 1e-12);
near("100 C -> Re",             cv("temperature", 100, "celsius", "reaumur"), 80, 1e-9);
near("491.67 R -> F",           cv("temperature", 491.67, "rankine", "fahrenheit"), 32, 1e-9);
near("32 F -> De",              cv("temperature", 32, "fahrenheit", "delisle"), 150, 1e-9);

near("1 hour -> seconds",       cv("time", 1, "hour", "second"), 3600);
near("1 day -> hours",          cv("time", 1, "day", "hour"), 24);
near("1 century -> years",      cv("time", 1, "century", "year"), 100);

near("100 km/h -> mph",         cv("speed", 100, "kmh", "mph"), 62.13711922373339, 1e-10);
near("1 m/s -> km/h",           cv("speed", 1, "mps", "kmh"), 3.6, 1e-12);
near("1 knot -> km/h",          cv("speed", 1, "knot", "kmh"), 1.852, 1e-12);
near("1 c -> m/s",              cv("speed", 1, "speed_of_light", "mps"), 299792458);

near("1 atm -> Pa",             cv("pressure", 1, "atmosphere", "pascal"), 101325);
near("1 psi -> Pa",             cv("pressure", 1, "psi", "pascal"), 6894.757293168361, 1e-12);
near("1 bar -> Pa",             cv("pressure", 1, "bar", "pascal"), 100000);
near("1 atm -> torr",           cv("pressure", 1, "atmosphere", "torr"), 760.0000266, 1e-6);

near("1 hp -> W",               cv("power", 1, "horsepower", "watt"), 745.6998715822702, 1e-12);
near("1 kWh -> J",              cv("energy", 1, "kilowatthour", "joule"), 3.6e6);
near("1 kcal -> cal",           cv("energy", 1, "kilocalorie", "calorie"), 1000, 1e-9);
near("1 BTU -> J",              cv("energy", 1, "btu", "joule"), 1055.05585262, 1e-12);
near("1 eV -> J",               cv("energy", 1, "electronvolt", "joule"), 1.602176634e-19, 1e-12);

near("1 lbf -> N",              cv("force", 1, "poundforce", "newton"), 4.4482216152605, 1e-12);
near("1 kgf -> N",              cv("force", 1, "kilogramforce", "newton"), 9.80665, 1e-12);
near("180 deg -> rad",          cv("angle", 180, "degree", "radian"), Math.PI, 1e-12);
near("1 turn -> deg",           cv("angle", 1, "turn", "degree"), 360);

near("1 GiB -> bytes",          cv("data", 1, "gibibyte", "byte"), 1073741824);
near("1 KiB -> bytes",          cv("data", 1, "kibibyte", "byte"), 1024);
near("1 KB -> KiB",             cv("data", 1, "kilobyte", "kibibyte"), 1000 / 1024);
near("8 bits -> byte",          cv("data", 8, "bit", "byte"), 1);
near("1 Mbps -> MiB/s",         cv("datarate", 1, "mbps", "mebibyte_per_second"), 1e6 / 8388608, 1e-12);

near("1 g/cm3 -> kg/m3",        cv("density", 1, "gcm3", "kgm3"), 1000);
near("1 lb/ft3 -> kg/m3",       cv("density", 1, "lbft3", "kgm3"), 16.018463373960142, 1e-12);

near("1 Gauss -> T",            cv("magnetism", 1, "gauss", "tesla"), 1e-4);
near("1 Ci -> Bq",              cv("radiation_activity", 1, "curie", "becquerel"), 3.7e10);
near("1 rad -> Gy",             cv("radiation_dose", 1, "rad", "gray"), 0.01);
near("1 rem -> Sv",             cv("radiation_equiv", 1, "rem", "sievert"), 0.01);

near("1 foot-candle -> lux",    cv("illuminance", 1, "footcandle", "lux"), 10.763910416709722, 1e-12);
near("1 nit -> cd/m2",          cv("luminance", 1, "nit", "cd_m2"), 1, 1e-12);
near("1 ft-lambert -> nit",     cv("luminance", 1, "footlambert", "cd_m2"), 3.4262590996353905, 1e-12);

near("1 N m -> lbf ft",         cv("torque", 1, "nm", "lbfft"), 0.7375621492441384, 1e-10);
near("1 cP -> Pa s",            cv("viscosity_dyn", 1, "cpoise", "pas"), 0.001, 1e-12);
near("1 cSt -> m2/s",           cv("viscosity_kin", 1, "cstokes", "m2s"), 1e-6, 1e-12);

near("1 kohm -> ohm",           cv("resistance", 1, "kiloohm", "ohm"), 1000);
near("1 Ah -> C",               cv("charge", 1, "amperehour", "coulomb"), 3600);
near("1 mAh -> C",              cv("charge", 1, "milliamperehour", "coulomb"), 3.6, 1e-12);
near("1 uF -> F",               cv("capacitance", 1, "microfarad", "farad"), 1e-6, 1e-12);
near("1 statV -> V",            cv("voltage", 1, "statvolt", "volt"), 299.792458, 1e-9);

near("1 g -> mg",              cv("mass", 1, "gram", "milligram"), 1000);
near("1 pt -> in",              cv("typography", 1, "point_dtp", "inch"), 1 / 72, 1e-12);
near("1 em -> px",              cv("typography", 1, "em", "pixel"), 16, 1e-9);

/* inverted units (fuel economy) */
near("1 L/100km -> km/L",       cv("fuel", 1, "liter_per_100km", "kmpl"), 100, 1e-12);
near("30 mpg US -> L/100km",    cv("fuel", 30, "mpg_us", "liter_per_100km"), 7.8407, 1e-3);
near("10 L/100km -> mpg US",    cv("fuel", 10, "liter_per_100km", "mpg_us"), 23.52145833333333, 1e-12);
near("1 L/100mi -> km/L",       cv("fuel", 1, "liter_per_100mile", "kmpl"), 160.9344, 1e-9);

/* ---------- 2. round-trip every unit pair in every category ---------- */
console.log("\n== round-trip sweep (every unit, every category) ==");

for (const cat of CATEGORY_LIST) {
  const ids = Object.keys(cat.units);
  let bad = 0;
  const probes = [1, 2.5, 0.125, 137.0625];
  for (const from of ids) {
    for (const to of ids) {
      for (const v of probes) {
        const there = convert(cat, v, from, to);
        const back = convert(cat, there, to, from);
        const tol = 1e-9 * Math.max(1, Math.abs(v));
        if (!Number.isFinite(there) || !Number.isFinite(back) || Math.abs(back - v) > tol) {
          if (bad < 3) failures.push(`roundtrip ${cat.id}: ${v} ${from}->${to}->${from} = ${back}`);
          bad++;
          failed++;
        } else passed++;
      }
    }
  }
  console.log(`  ${cat.id.padEnd(22)} ${String(ids.length).padStart(3)} units  ${bad === 0 ? "ok" : bad + " FAILURES"}`);
}

/* ---------- 3. sanity: every category's base unit maps to itself ---------- */
console.log("\n== identity check ==");
for (const cat of CATEGORY_LIST) {
  if (typeof cat.convert === "function") continue;
  if (!cat.units[cat.base]) { ok(`base ${cat.base} exists in ${cat.id}`, false); continue; }
  for (const id of Object.keys(cat.units)) {
    near(`${cat.id}: ${cat.base} -> ${id} -> ${cat.base}`,
      convert(cat, convert(cat, 1, cat.base, id), id, cat.base), 1, 1e-9);
  }
}

/* ---------- 4. numerals ---------- */
console.log("\n== number systems ==");

ok("255 base10 -> hex",       Numeral.fromNumber(255, 16) === "ff");
ok("255 base10 -> octal",     Numeral.fromNumber(255, 8) === "377");
ok("255 base10 -> binary",    Numeral.fromNumber(255, 2) === "11111111");
ok("0 -> base36",             Numeral.fromNumber(0, 36) === "0");
ok("35 -> base36",            Numeral.fromNumber(35, 36) === "z");
ok("parse ff base16",         Numeral.toNumber(Numeral.parse("ff", 16)) === 255);
ok("parse 0xFF",              Numeral.valueOf("0xFF") === 255);
ok("parse 0b1010",            Numeral.valueOf("0b1010") === 10);
ok("parse 0o17",              Numeral.valueOf("0o17") === 15);
ok("0.5 -> binary",           Numeral.fromNumber(0.5, 2, 1) === "0.1");
ok("1/3 -> ternary",          Numeral.fromNumber(1 / 3, 3, 4) === "0.1000");
ok("0.1 dec -> binary prefix",Numeral.fromNumber(0.1, 2, 20).startsWith("0.00011001100"));
ok("rounding 0.999 -> bin",   Numeral.fromNumber(0.999, 2, 3) === "1.000");
ok("negative hex",            Numeral.fromNumber(-255, 16) === "-ff");
ok("bigint exactness",        Numeral.toNumber(Numeral.parse(Numeral.fromNumber(2 ** 60, 36), 36)) === 2 ** 60);

ok("roman 1994",              Numeral.toRoman(1994) === "MCMXCIV");
ok("roman 2024",              Numeral.toRoman(2024) === "MMXXIV");
ok("roman 0 -> N",            Numeral.toRoman(0) === "N");
ok("roman parse 1994",        Numeral.fromRoman("MCMXCIV") === 1994);
ok("roman 4 -> IV",           Numeral.toRoman(4) === "IV");
ok("roman 9 -> IX",           Numeral.toRoman(9) === "IX");
ok("roman 4000 has overline", Numeral.toRoman(4000).includes("̅"));
ok("roman parse 4000",        Numeral.fromRoman(Numeral.toRoman(4000)) === 4000);
for (const n of [1, 3, 4, 9, 14, 40, 90, 400, 900, 1984, 2024, 3999]) {
  ok(`roman roundtrip ${n}`, Numeral.fromRoman(Numeral.toRoman(n)) === n);
}

ok("balanced ternary 0",      Numeral.toBalancedTernary(0) === "0");
ok("balanced ternary 1",      Numeral.toBalancedTernary(1) === "1");
ok("balanced ternary 2",      Numeral.toBalancedTernary(2) === "1T");
ok("balanced ternary 5",      Numeral.toBalancedTernary(5) === "1TT");
ok("balanced ternary -5",     Numeral.toBalancedTernary(-5) === "-1TT");
ok("bt parse 1TT",            Numeral.fromBalancedTernary("1TT") === 5);
for (const n of [0, 1, 2, 3, 8, 40, 365, 1000, -7]) {
  ok(`bt roundtrip ${n}`, Numeral.fromBalancedTernary(Numeral.toBalancedTernary(n)) === n);
}

ok("unary 5",                 Numeral.toUnary(5) === "|||||");
ok("unary parse",             Numeral.fromUnary("|||||") === 5);

ok("radix point p2",          Numeral.toNumber(Numeral.parse("101p2", 2)) === 20);      // 101_2 * 2^2
ok("radix point p-1",         Numeral.toNumber(Numeral.parse("1000p-2", 2)) === 2);      // 1000_2 * 2^-2
ok("radix point decimal",     Numeral.valueOf("1.5p3") === 1500);                        // detect() assumes base 10
ok("utf8 hello bytes",        Numeral.textToBytes("A").join() === "65");
ok("hex roundtrip",           Numeral.bytesToText(Numeral.hexToBytes(Numeral.bytesToHex(Numeral.textToBytes("héllo")))) === "héllo");

/* invalid input must throw, not silently return garbage */
ok("rejects digit 9 in base 8",   (() => { try { Numeral.parse("9", 8); return false; } catch { return true; } })());
ok("rejects nonsense",            (() => { try { Numeral.parse("!!", 10); return false; } catch { return true; } })());
ok("rejects two radix points",    (() => { try { Numeral.parse("1.2.3", 10); return false; } catch { return true; } })());

/* ---------- 5. formatting ---------- */
console.log("\n== number formatting ==");
ok("format 0",                formatNumber(0) === "0");
ok("format 1234.5",           formatNumber(1234.5) === "1234.5");
ok("format big integer",      formatNumber(1e12) === "1,000,000,000,000");
ok("format tiny -> exponent", formatNumber(1.2345e-9).includes("10^"));
ok("format huge -> exponent", formatNumber(1.5e21).includes("10^"));
ok("format NaN",              formatNumber(NaN) === "—");
ok("format Infinity",         formatNumber(Infinity) === "∞");
ok("format drops float noise",formatNumber(0.1 + 0.2) === "0.3");
ok("roundSig",                 roundSigCheck());

function roundSigCheck() {
  return Math.abs(convert(getCategory("length"), 1, "kilometer", "foot") - 3280.839895) < 1e-6;
}

/* ---------- 6. colour ---------- */
console.log("\n== colour ==");

ok("hex long parses",     JSON.stringify(Color.parse("#ff8000")) === JSON.stringify({ r: 255, g: 128, b: 0, a: 1 }));
ok("hex short parses",    JSON.stringify(Color.parse("#f80")) === JSON.stringify({ r: 255, g: 136, b: 0, a: 1 }));
near("hex alpha parses",  Color.parse("#ff000080").a, 0x80 / 255, 1e-12);
ok("named parses",        JSON.stringify(Color.parse("rebeccapurple")) === JSON.stringify({ r: 102, g: 51, b: 153, a: 1 }));
ok("rgb() parses",        Color.parse("rgb(1,2,3)").b === 3);
ok("hsl() parses",        Color.parse("hsl(0,100%,50%)").r === 255);
ok("garbage is null",     Color.parse("not-a-colour") === null);
ok("#12345 rejected",     Color.parse("#12345") === null);

ok("red hex roundtrip",   Color.toHex({ r: 255, g: 0, b: 0, a: 1 }) === "#ff0000");
ok("red hsl",             Color.toHslString("#ff0000") === "hsl(0, 100%, 50%)");
ok("red cmyk",            Color.toCmykString("#ff0000") === "cmyk(0%, 100%, 100%, 0%)");
ok("white cmyk",          Color.toCmykString("#ffffff") === "cmyk(0%, 0%, 0%, 0%)");
ok("black luminance",     Math.abs(Color.luminance("#000000")) < 1e-12);
ok("white luminance",     Math.abs(Color.luminance("#ffffff") - 1) < 1e-9);
ok("black/white contrast",Math.abs(Color.contrast("#000000", "#ffffff") - 21) < 1e-6, "got " + Color.contrast("#000000", "#ffffff"));
ok("same colour contrast",Math.abs(Color.contrast("#123456", "#123456") - 1) < 1e-9);
ok("nearest name red",    Color.nearestName("#ff0000") === "red", "got " + Color.nearestName("#ff0000"));
ok("nearest name white",  Color.nearestName("#ffffff") === "white", "got " + Color.nearestName("#ffffff"));
ok("complementary",       Color.harmonies("#ff0000").complementary === "#00ffff",
   "got " + Color.harmonies("#ff0000").complementary);
ok("name table populated",Color.nameCount() === 148, "got " + Color.nameCount());

// every model must survive a round trip through RGB
for (const hex of ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#123456", "#abcdef", "#808080"]) {
  const rgb = Color.parse(hex);
  const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
  const back = Color.hslToRgb(hsl.h, hsl.s, hsl.l);
  ok(`hsl roundtrip ${hex}`, Color.toHex(back) === hex, `got ${Color.toHex(back)}`);

  const hsv = Color.rgbToHsv(rgb.r, rgb.g, rgb.b);
  const back2 = Color.hsvToRgb(hsv.h, hsv.s, hsv.v);
  ok(`hsv roundtrip ${hex}`, Color.toHex(back2) === hex, `got ${Color.toHex(back2)}`);

  const cmyk = Color.rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const back3 = Color.cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
  ok(`cmyk roundtrip ${hex}`, Color.toHex(back3) === hex, `got ${Color.toHex(back3)}`);
}

/* ---------- 7. currency ---------- */
console.log("\n== currency ==");

Currency.initFromSnapshot();
const cs = Currency.state();
ok("snapshot seeded",      cs.rates != null && Object.keys(cs.rates).length > 90,
   "got " + (cs.rates ? Object.keys(cs.rates).length : 0));
ok("snapshot flagged stale", cs.live === false);
ok("USD rate is 1",        cs.rates.usd === 1);
ok("has majors",           Currency.has("usd") && Currency.has("eur") && Currency.has("bdt") && Currency.has("jpy"));
ok("unknown code absent",  Currency.has("zzzz") === false);

near("1 USD -> EUR",       Currency.convert(1, "usd", "eur"), cs.rates.eur, 1e-12);
ok("identity conversion",  Currency.convert(123.45, "usd", "usd") === 123.45);
near("EUR -> USD roundtrip", Currency.convert(Currency.convert(250, "usd", "eur"), "eur", "usd"), 250, 1e-9);
near("cross rate EUR->JPY", Currency.convert(1, "eur", "jpy"), cs.rates.jpy / cs.rates.eur, 1e-12);
ok("no NaN for valid pair",Number.isFinite(Currency.convert(1, "gbp", "inr")));
ok("NaN for unknown pair", Number.isNaN(Currency.convert(1, "usd", "zzzz")));
ok("rate sanity EUR<2",    cs.rates.eur > 0.5 && cs.rates.eur < 2, "EUR=" + cs.rates.eur);
ok("rate sanity JPY<300",  cs.rates.jpy > 50 && cs.rates.jpy < 300, "JPY=" + cs.rates.jpy);
ok("name lookup",          Currency.nameOf("usd") === "US Dollar" && Currency.nameOf("jpy") === "Japanese Yen");
ok("symbol lookup",        Currency.symbolOf("usd") === "$" && Currency.symbolOf("eur") === "€");
ok("JPY has 0 decimals",   Currency.decimalsFor("jpy") === 0 && Currency.decimalsFor("usd") === 2);
ok("flag emoji",           Currency.flagOf("us") === "\u{1F1FA}\u{1F1F8}");
ok("code list sorted majors first", Currency.codes()[0] === "usd");
ok("search by name",       Currency.search("Japanese").includes("jpy"));
ok("formatting",           Currency.format(1234.5, "usd") === "$1,234.50", "got " + Currency.format(1234.5, "usd"));

/* ---------- 8. extras ---------- */
console.log("\n== extras ==");

const papers = Extras.paperSizes();
const byName = {}; papers.forEach(p => byName[p.name] = p);
ok("A4 is 210x297",        byName.A4.w === 210 && byName.A4.h === 297);
ok("Letter is 8.5x11 in",  Math.abs(byName.Letter.wIn - 8.5) < 1e-9 && Math.abs(byName.Letter.hIn - 11) < 1e-9);
ok("A0 area is ~1 m2",     Math.abs(byName.A0.areaM2 - 1) < 0.01, "got " + byName.A0.areaM2);
ok("A4 area in cm2",       Math.abs(byName.A4.areaCm2 - 623.7) < 0.1, "got " + byName.A4.areaCm2);
near("A4:A5 ~ 2:1",      Extras.paperRatio("A4", "A5"), 2, 0.005);
ok("A-series halves",      Math.abs(Extras.paperRatio("A3", "A4") - 2) < 1e-9);
ok("A4 at 300dpi",         Extras.paperToPixels("A4", 300).w === 2480, "got " + Extras.paperToPixels("A4", 300).w);

const men = Extras.shoeSizes("men");
const m42 = men.find(s => s.eu === 42);
ok("EU 42 men -> UK 8.5",  Math.abs(m42.uk - 8.5) < 1e-9, "got " + m42.uk);
ok("EU 42 foot ~270mm",    m42.footMm >= 265 && m42.footMm <= 275, "got " + m42.footMm);
ok("shoe convert eu->us",  Math.abs(Extras.convertShoe("men", 42, "eu", "us") - 9.5) < 1e-9);
ok("women EU 38 -> UK 4.5",Math.abs(Extras.convertShoe("women", 38, "eu", "uk") - 4.5) < 1e-9,
   "got " + Extras.convertShoe("women", 38, "eu", "uk"));

ok("shirt M neck 16in",    Extras.shirtSize("M").neckIn === 16);
ok("waist 32in -> EU 48",  Extras.waistToSize(32).eu === 48, "got " + Extras.waistToSize(32).eu);
ok("waist 36in -> EU 52",  Extras.waistToSize(36).eu === 52, "got " + Extras.waistToSize(36).eu);
ok("waist 32in -> 81.3cm",  Math.abs(Extras.waistToSize(32).cm - 81.3) < 0.05);

const d = new Date("2024-03-15T12:00:00Z");
ok("UTC zone time",        Extras.timeInZone(d, "UTC") === "12:00:00", "got " + Extras.timeInZone(d, "UTC"));
ok("Tokyo is +9",          Math.abs(Extras.zoneOffset(d, "Asia/Tokyo") - 9) < 1e-9,
   "got " + Extras.zoneOffset(d, "Asia/Tokyo"));
ok("Kolkata is +5.5",      Math.abs(Extras.zoneOffset(d, "Asia/Kolkata") - 5.5) < 1e-9,
   "got " + Extras.zoneOffset(d, "Asia/Kolkata"));
ok("NY in March is -4",    Math.abs(Extras.zoneOffset(d, "America/New_York") - -4) < 1e-9,
   "got " + Extras.zoneOffset(d, "America/New_York"));
ok("12:00 UTC -> 21:00 Tokyo", Extras.convertTime(d, "UTC", "Asia/Tokyo").time === "21:00:00",
   "got " + Extras.convertTime(d, "UTC", "Asia/Tokyo").time);
ok("bad zone is null",     Extras.timeInZone(d, "Mars/Olympus") === null);
ok("zone list has UTC",    Extras.zones.includes("UTC"));

const age = Extras.ageBetween(new Date(2000, 0, 15), new Date(2024, 6, 20));
ok("age is 24",            age.years === 24, "got " + age.years);
ok("age months 6",         age.months === 6, "got " + age.months);
ok("age days 5",           age.days === 5, "got " + age.days);
ok("age months total 294", age.totalMonths === 24 * 12 + 6, "got " + age.totalMonths);
ok("age spans leap days",  age.leapDays === 7, "got " + age.leapDays);

ok("megapixels 4K",        Extras.megapixels(3840, 2160) === 8.2944);
ok("300dpi print of 1920px", Math.abs(Extras.pixelsToPrint(300, 300) - 25.4) < 1e-9);
ok("px from 210mm at 300", Extras.printToPixels(210, 300) === 2480);
ok("scaleTo 4K -> 1080p",  Extras.scaleTo(3840, 2160, 1920).height === 1080);
ok("aspect 1920x1080",     Extras.aspect(1920, 1080).reduced === "16:9");

const consts = Extras.constants();
ok("constants list present",consts.length > 25);
ok("c is exact",           consts.find(c => c.sym === "c").value === 299792458);
ok("planck h is exact",    consts.find(c => c.sym === "h").exact === true);

/* ---------- summary ---------- */
console.log("\n" + "=".repeat(56));
if (failed === 0) {
  console.log(`ALL PASS — ${passed} assertions`);
} else {
  console.log(`FAILED — ${failed} of ${passed + failed} assertions failed:\n`);
  for (const f of failures.slice(0, 40)) console.log("  x " + f);
  if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`);
}
console.log("=".repeat(56));
process.exit(failed === 0 ? 0 : 1);