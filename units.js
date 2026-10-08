/* ============================================================
   UNITS — every physical conversion category
   ------------------------------------------------------------
   Each category has a `base` unit; every unit stores a numeric
   factor `toBase` that multiplies its value into that base.

   The exception is `temperature`, which is offset-based, so its
   units carry toK/fromK functions and the category supplies its own
   `convert`.

   Adding a unit: add one line. Nothing else needs to change.
   ============================================================ */

/* ---------- length ---------- */
const length = {
  id: "length", label: "Length", base: "meter", group: "Physics", icon: "📏",
  units: {
    meter:      { name: "Meter",      symbol: "m",     toBase: 1 },
    kilometer:  { name: "Kilometer",  symbol: "km",    toBase: 1000 },
    decimeter:  { name: "Decimeter",  symbol: "dm",    toBase: 0.1 },
    centimeter: { name: "Centimeter", symbol: "cm",    toBase: 0.01 },
    millimeter: { name: "Millimeter", symbol: "mm",    toBase: 0.001 },
    micrometer: { name: "Micrometer", symbol: "µm",    toBase: 1e-6, aliases: ["micron", "um"] },
    nanometer:  { name: "Nanometer",  symbol: "nm",    toBase: 1e-9 },
    picometer:  { name: "Picometer",  symbol: "pm",    toBase: 1e-12 },
    angstrom:   { name: "Ångström",   symbol: "Å",     toBase: 1e-10 },
    inch:       { name: "Inch",       symbol: "in",    toBase: 0.0254, aliases: ["inches", "”", "\""] },
    foot:       { name: "Foot",       symbol: "ft",    toBase: 0.3048, aliases: ["feet", "ft"] },
    yard:       { name: "Yard",       symbol: "yd",    toBase: 0.9144 },
    mile:       { name: "Mile",       symbol: "mi",    toBase: 1609.344, aliases: ["statute mile"] },
    nauticalmile:{ name: "Nautical mile", symbol: "nmi", toBase: 1852, aliases: ["knot", "nm"] },
    furlong:    { name: "Furlong",    symbol: "fur",   toBase: 201.168 },
    chain:      { name: "Chain",      symbol: "ch",    toBase: 20.1168 },
    rod:        { name: "Rod",        symbol: "rd",    toBase: 5.0292 },
    league:     { name: "League",     symbol: "lea",   toBase: 4828.032 },
    fathom:     { name: "Fathom",     symbol: "ftm",   toBase: 1.8288 },
    cable:      { name: "Cable",      symbol: "cb",    toBase: 185.2 },
    hand:       { name: "Hand",       symbol: "hh",    toBase: 0.1016 },
    barleycorn: { name: "Barleycorn", symbol: "bc",    toBase: 0.003175 },
    cubit:      { name: "Cubit",      symbol: "cbt",   toBase: 0.4572 },
    span:       { name: "Span",       symbol: "sp",    toBase: 0.2286 },
    ell:        { name: "Ell",        symbol: "ell",   toBase: 1.143 },
    thou:       { name: "Thousandth of an inch", symbol: "mil", toBase: 2.54e-5 },
    pica:       { name: "Pica",       symbol: "p",     toBase: 4.233333333333333e-4 },
    point_dtp:  { name: "Point (72/in)", symbol: "pt", toBase: 3.5277777777777778e-4 },
    twip:       { name: "Twip",       symbol: "tw",    toBase: 1.7638888888888889e-5 },
    astronomicalunit: { name: "Astronomical unit", symbol: "AU", toBase: 1.495978707e11, aliases: ["au"] },
    lightyear:  { name: "Light-year", symbol: "ly",    toBase: 9.4607304725808e15 },
    parsec:     { name: "Parsec",     symbol: "pc",    toBase: 3.0856775814913673e16 },
    lightsecond:{ name: "Light-second", symbol: "ls",   toBase: 299792458 },
    lightminute:{ name: "Light-minute", symbol: "lmin", toBase: 1.798754748e10 },
    lighthour:  { name: "Light-hour", symbol: "lh",    toBase: 1.0792528488e12 },
    plancklength:{ name: "Planck length", symbol: "ℓp", toBase: 1.616255e-35 },
    smoot:      { name: "Smoot",       symbol: "sm",   toBase: 1.7018, aliases: ["mit", "olympic curve unit"] },
  },
};

/* ---------- mass ---------- */
const mass = {
  id: "mass", label: "Mass & Weight", base: "kilogram", group: "Physics", icon: "⚖️",
  units: {
    kilogram:   { name: "Kilogram",   symbol: "kg",    toBase: 1 },
    gram:       { name: "Gram",       symbol: "g",     toBase: 1e-3 },
    milligram:  { name: "Milligram",  symbol: "mg",    toBase: 1e-6 },
    microgram:  { name: "Microgram",  symbol: "µg",    toBase: 1e-9 },
    nanogram:   { name: "Nanogram",   symbol: "ng",    toBase: 1e-12 },
    tonne:      { name: "Tonne",      symbol: "t",     toBase: 1000, aliases: ["metric ton", "megagram"] },
    kilotonne:  { name: "Kilotonne",  symbol: "kt",    toBase: 1e6 },
    pound:      { name: "Pound",      symbol: "lb",    toBase: 0.45359237, aliases: ["lbs", "lb"] },
    ounce:      { name: "Ounce",      symbol: "oz",    toBase: 0.028349523125 },
    stone:      { name: "Stone",      symbol: "st",    toBase: 6.35029318 },
    grain:      { name: "Grain",      symbol: "gr",    toBase: 6.479891e-5 },
    dram:       { name: "Dram",       symbol: "dr",    toBase: 1.7718451953125e-3 },
    scruple:    { name: "Scruple",    symbol: "sc",    toBase: 1.2959782e-3 },
    pennyweight:{ name: "Pennyweight",symbol: "dwt",   toBase: 1.55517384e-3 },
    carat:      { name: "Carat",      symbol: "ct",    toBase: 0.0002 },
    ton_us:     { name: "Short ton (US)", symbol: "ton",  toBase: 907.18474, aliases: ["short ton", "us ton"] },
    ton_uk:     { name: "Long ton (UK)", symbol: "lt",   toBase: 1016.0469088, aliases: ["long ton", "imperial ton"] },
    cwt_us:     { name: "Hundredweight (US)", symbol: "cwt", toBase: 45.359237 },
    cwt_uk:     { name: "Hundredweight (UK)", symbol: "cwt", toBase: 50.80234544, aliases: ["long cwt", "gross"] },
    slug:       { name: "Slug",       symbol: "slug",  toBase: 14.593902937206364 },
    poundal:    { name: "Poundal",    symbol: "pdl",   toBase: 0.138254954376 },
    gamma_mass: { name: "Gamma",      symbol: "γ",     toBase: 1e-9 },
    dalton:     { name: "Dalton",     symbol: "Da",    toBase: 1.66053906660e-27, aliases: ["amu", "atomic mass unit"] },
    planckmass: { name: "Planck mass", symbol: "mp",   toBase: 2.176434e-8 },
    solarmass:  { name: "Solar mass", symbol: "M☉",    toBase: 1.98847e30 },
  },
};

/* ---------- area ---------- */
const area = {
  id: "area", label: "Area", base: "sq_meter", group: "Physics", icon: "⬜",
  units: {
    sq_meter:     { name: "Square meter", symbol: "m²",  toBase: 1, aliases: ["m2"] },
    sq_kilometer: { name: "Square kilometer", symbol: "km²", toBase: 1e6, aliases: ["km2"] },
    sq_centimeter:{ name: "Square centimeter", symbol: "cm²", toBase: 1e-4, aliases: ["cm2"] },
    sq_millimeter:{ name: "Square millimeter", symbol: "mm²", toBase: 1e-6, aliases: ["mm2"] },
    sq_inch:      { name: "Square inch", symbol: "in²", toBase: 6.4516e-4, aliases: ["in2"] },
    sq_foot:      { name: "Square foot", symbol: "ft²", toBase: 0.09290304, aliases: ["ft2", "sqft"] },
    sq_yard:      { name: "Square yard", symbol: "yd²", toBase: 0.83612736, aliases: ["yd2"] },
    sq_mile:      { name: "Square mile", symbol: "mi²", toBase: 2589988.110336, aliases: ["mi2"] },
    sq_nauticalmile:{ name: "Square nautical mile", symbol: "nmi²", toBase: 3429904 },
    acre:         { name: "Acre", symbol: "ac", toBase: 4046.8564224, aliases: ["acreage"] },
    rood:         { name: "Rood", symbol: "ro", toBase: 1011.7141056 },
    hectare:      { name: "Hectare", symbol: "ha", toBase: 10000 },
    are:          { name: "Are", symbol: "a", toBase: 100 },
    township:     { name: "Township (US)", symbol: "twp", toBase: 93239571.972096 },
    circularmil:  { name: "Circular mil", symbol: "cmil", toBase: 2.06686167e-10 },
    barn:         { name: "Barn", symbol: "b", toBase: 1e-28 },
    darwin:       { name: "Darwin", symbol: "d", toBase: 5.04e-5 },
  },
};

/* ---------- volume ---------- */
const volume = {
  id: "volume", label: "Volume", base: "liter", group: "Physics", icon: "🧊",
  units: {
    liter:       { name: "Liter", symbol: "L", toBase: 1, aliases: ["litre"] },
    milliliter:  { name: "Milliliter", symbol: "mL", toBase: 1e-3, aliases: ["ml", "cc"] },
    microliter:  { name: "Microliter", symbol: "µL", toBase: 1e-6 },
    cubic_meter: { name: "Cubic meter", symbol: "m³", toBase: 1000, aliases: ["m3"] },
    cubic_centimeter: { name: "Cubic centimeter", symbol: "cm³", toBase: 1, aliases: ["cm3"] },
    cubic_millimeter: { name: "Cubic millimeter", symbol: "mm³", toBase: 1e-6, aliases: ["mm3"] },
    cubic_inch:  { name: "Cubic inch", symbol: "in³", toBase: 0.016387064, aliases: ["in3"] },
    cubic_foot:  { name: "Cubic foot", symbol: "ft³", toBase: 28.316846592, aliases: ["ft3"] },
    cubic_yard:  { name: "Cubic yard", symbol: "yd³", toBase: 764.554857984, aliases: ["yd3"] },
    gallon_us:   { name: "Gallon (US)", symbol: "gal", toBase: 3.785411784, aliases: ["us gallon"] },
    gallon_uk:   { name: "Gallon (UK)", symbol: "gal", toBase: 4.54609, aliases: ["imperial gallon"] },
    quart_us:    { name: "Quart (US)", symbol: "qt", toBase: 0.946352946 },
    quart_uk:    { name: "Quart (UK)", symbol: "qt", toBase: 1.1365225 },
    pint_us:     { name: "Pint (US)", symbol: "pt", toBase: 0.473176473 },
    pint_uk:     { name: "Pint (UK)", symbol: "pt", toBase: 0.56826125 },
    cup_us:      { name: "Cup (US)", symbol: "c", toBase: 0.2365882365 },
    cup_uk:      { name: "Cup (UK)", symbol: "c", toBase: 0.284130625 },
    floz_us:     { name: "Fluid ounce (US)", symbol: "fl oz", toBase: 0.0295735295625 },
    floz_uk:     { name: "Fluid ounce (UK)", symbol: "fl oz", toBase: 0.0284130625 },
    tbsp_us:     { name: "Tablespoon (US)", symbol: "tbsp", toBase: 0.01478676478125 },
    tsp_us:      { name: "Teaspoon (US)", symbol: "tsp", toBase: 0.00492892159375 },
    gill_us:     { name: "Gill (US)", symbol: "gi", toBase: 0.1182941183 },
    barrel_oil:  { name: "Barrel (oil)", symbol: "bbl", toBase: 158.987294928 },
    barrel_beer: { name: "Barrel (US beer)", symbol: "bl", toBase: 117.3477638 },
    peck:        { name: "Peck", symbol: "pk", toBase: 8.8097675 },
    bushel:      { name: "Bushel", symbol: "bu", toBase: 35.23907008 },
    cord:        { name: "Cord (firewood)", symbol: "cord", toBase: 3624.556363776 },
    acrefoot:    { name: "Acre-foot", symbol: "ac-ft", toBase: 1233.48183754752 },
  },
};

/* ---------- temperature (offset-based, custom convert) ---------- */
const temperature = {
  id: "temperature", label: "Temperature", base: "kelvin", group: "Physics", icon: "🌡️",
  units: {
    celsius:   { name: "Celsius",    symbol: "°C", toK: v => v + 273.15, fromK: k => k - 273.15, aliases: ["centigrade", "c"] },
    fahrenheit:{ name: "Fahrenheit", symbol: "°F", toK: v => (v - 32) * 5 / 9 + 273.15, fromK: k => (k - 273.15) * 9 / 5 + 32, aliases: ["fahrenheit", "f"] },
    kelvin:    { name: "Kelvin",     symbol: "K",  toK: v => v, fromK: k => k, aliases: ["k"] },
    rankine:   { name: "Rankine",    symbol: "°R", toK: v => v * 5 / 9, fromK: k => k * 9 / 5, aliases: ["r"] },
    reaumur:   { name: "Réaumur",    symbol: "°Ré", toK: v => v * 5 / 4 + 273.15, fromK: k => (k - 273.15) * 4 / 5 },
    rome:      { name: "Rome",       symbol: "°Rō", toK: v => (v - 12.5) / 1.09375 + 273.15, fromK: k => (k - 273.15) * 1.09375 + 12.5 },
    delisle:   { name: "Delisle",    symbol: "°De", toK: v => 373.15 - v * 2 / 3, fromK: k => (373.15 - k) * 3 / 2 },
    newton:    { name: "Newton",     symbol: "°N", toK: v => v * 100 / 33 + 273.15, fromK: k => (k - 273.15) * 33 / 100 },
  },
  convert: (v, f, t) => t.fromK(f.toK(v)),
};

/* ---------- time ---------- */
const time = {
  id: "time", label: "Time", base: "second", group: "Physics", icon: "⏱️",
  units: {
    nanosecond:   { name: "Nanosecond",  symbol: "ns", toBase: 1e-9 },
    microsecond:  { name: "Microsecond", symbol: "µs", toBase: 1e-6, aliases: ["us", "μs"] },
    millisecond:  { name: "Millisecond", symbol: "ms", toBase: 1e-3 },
    second:       { name: "Second",      symbol: "s",  toBase: 1 },
    minute:       { name: "Minute",      symbol: "min", toBase: 60, aliases: ["mins"] },
    hour:         { name: "Hour",        symbol: "h",  toBase: 3600, aliases: ["hr", "hours"] },
    day:          { name: "Day",         symbol: "d",  toBase: 86400, aliases: ["days"] },
    week:         { name: "Week",        symbol: "wk", toBase: 604800, aliases: ["weeks"] },
    fortnight:    { name: "Fortnight",   symbol: "fn", toBase: 1209600 },
    month:        { name: "Month (avg)", symbol: "mo", toBase: 2629746, aliases: ["30.436875 days"] },
    year:         { name: "Year (Julian)", symbol: "yr", toBase: 31557600, aliases: ["365.25 days"] },
    decade:       { name: "Decade",      symbol: "dec", toBase: 315576000 },
    century:      { name: "Century",     symbol: "C", toBase: 3155760000, aliases: ["100 years"] },
    millennium:   { name: "Millennium",  symbol: "mil", toBase: 31557600000, aliases: ["1000 years"] },
    sidereal_day:{ name: "Sidereal day", symbol: "d_sid", toBase: 86164.0905, aliases: ["earth rotation"] },
    sidereal_year:{ name: "Sidereal year", symbol: "yr_sid", toBase: 31558149.764 },
    tropical_year:{ name: "Tropical year", symbol: "yr_trop", toBase: 31556925.216 },
    synodic_month:{ name: "Synodic month", symbol: "mo_syn", toBase: 2551447.7, aliases: ["lunar month"] },
    shake:        { name: "Shake",       symbol: "shake", toBase: 1e-8 },
    svedberg:     { name: "Svedberg",    symbol: "S", toBase: 1e-13 },
    planck_time:  { name: "Planck time", symbol: "tp", toBase: 5.391247e-44 },
    dogyear:      { name: "Dog year",    symbol: "dy", toBase: 604800 * 7, aliases: ["7 human years"] },
  },
};

/* ---------- speed ---------- */
const speed = {
  id: "speed", label: "Speed", base: "mps", group: "Physics", icon: "🏃",
  units: {
    mps:      { name: "Meter per second", symbol: "m/s", toBase: 1, aliases: ["mps"] },
    kmh:      { name: "Kilometer per hour", symbol: "km/h", toBase: 0.2777777777777778, aliases: ["kph", "kmph"] },
    kmps:     { name: "Kilometer per second", symbol: "km/s", toBase: 1000 },
    mph:      { name: "Mile per hour", symbol: "mph", toBase: 0.44704 },
    fps:      { name: "Foot per second", symbol: "ft/s", toBase: 0.3048 },
    fpm:      { name: "Foot per minute", symbol: "ft/min", toBase: 0.00508 },
    ips:      { name: "Inch per second", symbol: "in/s", toBase: 0.0254 },
    mpm:      { name: "Meter per minute", symbol: "m/min", toBase: 1 / 60 },
    cmps:     { name: "Centimeter per second", symbol: "cm/s", toBase: 0.01 },
    knot:     { name: "Knot", symbol: "kn", toBase: 0.5144444444444445, aliases: ["kt", "knots"] },
    mach:     { name: "Mach (sea level)", symbol: "Ma", toBase: 340.29 },
    speed_of_light: { name: "Speed of light", symbol: "c", toBase: 299792458, aliases: ["lightspeed"] },
    km_per_day:{ name: "Kilometer per day", symbol: "km/d", toBase: 1 / 86400 },
    furlong_per_hour: { name: "Furlong per hour", symbol: "fur/h", toBase: 201.168 / 3600 },
  },
};

/* ---------- acceleration ---------- */
const acceleration = {
  id: "acceleration", label: "Acceleration", base: "mps2", group: "Physics", icon: "🚀",
  units: {
    mps2:  { name: "Meter per second²", symbol: "m/s²", toBase: 1, aliases: ["m/ss"] },
    fps2:  { name: "Foot per second²", symbol: "ft/s²", toBase: 0.3048 },
    g0:    { name: "Standard gravity", symbol: "g", toBase: 9.80665, aliases: ["gee", "gravity"] },
    galileo:{ name: "Galileo", symbol: "Gal", toBase: 0.01 },
    gn:    { name: "Gravity (g₀)", symbol: "g₀", toBase: 9.80665 },
  },
};

/* ---------- force ---------- */
const force = {
  id: "force", label: "Force", base: "newton", group: "Physics", icon: "💪",
  units: {
    newton:      { name: "Newton", symbol: "N", toBase: 1 },
    kilonewton:  { name: "Kilonewton", symbol: "kN", toBase: 1000 },
    millinewton: { name: "Millinewton", symbol: "mN", toBase: 1e-3 },
    dyne:        { name: "Dyne", symbol: "dyn", toBase: 1e-5 },
    poundforce:  { name: "Pound-force", symbol: "lbf", toBase: 4.4482216152605, aliases: ["lbf"] },
    kilogramforce:{ name: "Kilogram-force", symbol: "kgf", toBase: 9.80665, aliases: ["kp"] },
    gramforce:   { name: "Gram-force", symbol: "gf", toBase: 0.00980665 },
    poundal:     { name: "Poundal", symbol: "pdl", toBase: 0.138254954376 },
    kip:         { name: "Kip", symbol: "kip", toBase: 4448.2216152605 },
    tonforce_us: { name: "Ton-force (US)", symbol: "tonf", toBase: 8896.443230521 },
    tonforce_uk: { name: "Ton-force (UK)", symbol: "tonf", toBase: 9964.01641818352, aliases: ["long ton-force"] },
    tonneforce:  { name: "Tonne-force", symbol: "tf", toBase: 9806.65 },
  },
};

/* ---------- energy ---------- */
const energy = {
  id: "energy", label: "Energy", base: "joule", group: "Physics", icon: "🔋",
  units: {
    joule:      { name: "Joule", symbol: "J", toBase: 1 },
    kilojoule:  { name: "Kilojoule", symbol: "kJ", toBase: 1000 },
    megajoule:  { name: "Megajoule", symbol: "MJ", toBase: 1e6 },
    gigajoule:  { name: "Gigajoule", symbol: "GJ", toBase: 1e9 },
    calorie:    { name: "Calorie", symbol: "cal", toBase: 4.184, aliases: ["thermochemical calorie"] },
    kilocalorie:{ name: "Kilocalorie", symbol: "kcal", toBase: 4184, aliases: ["food calorie", "Calorie"] },
    watthour:   { name: "Watt hour", symbol: "Wh", toBase: 3600 },
    kilowatthour:{ name: "Kilowatt hour", symbol: "kWh", toBase: 3.6e6, aliases: ["kwh", "kilowatt-hour"] },
    megawatthour:{ name: "Megawatt hour", symbol: "MWh", toBase: 3.6e9 },
    btu:        { name: "BTU (IT)", symbol: "BTU", toBase: 1055.05585262, aliases: ["british thermal unit"] },
    therm:      { name: "Therm (US)", symbol: "thm", toBase: 1.054804e8 },
    quad:       { name: "Quad", symbol: "quad", toBase: 1.055056e18 },
    erg:        { name: "Erg", symbol: "erg", toBase: 1e-7 },
    electronvolt:{ name: "Electronvolt", symbol: "eV", toBase: 1.602176634e-19 },
    kiloelectronvolt:{ name: "Kiloelectronvolt", symbol: "keV", toBase: 1.602176634e-16 },
    megaelectronvolt:{ name: "Megaelectronvolt", symbol: "MeV", toBase: 1.602176634e-13 },
    gigaelectronvolt:{ name: "Gigaelectronvolt", symbol: "GeV", toBase: 1.602176634e-10 },
    footpound:  { name: "Foot-pound", symbol: "ft·lb", toBase: 1.3558179483314004 },
    kgfm:       { name: "Kilogram-force metre", symbol: "kgf·m", toBase: 9.80665 },
    tontnt:     { name: "Tonne of TNT", symbol: "t TNT", toBase: 4.184e9 },
    megatontnt: { name: "Megate tonne of TNT", symbol: "Mt TNT", toBase: 4.184e15 },
    ktoe:       { name: "Kilotonne of oil equivalent", symbol: "ktoe", toBase: 4.1868e13 },
  },
};

/* ---------- power ---------- */
const power = {
  id: "power", label: "Power", base: "watt", group: "Physics", icon: "🔌",
  units: {
    watt:      { name: "Watt", symbol: "W", toBase: 1 },
    milliwatt: { name: "Milliwatt", symbol: "mW", toBase: 1e-3 },
    kilowatt:  { name: "Kilowatt", symbol: "kW", toBase: 1000, aliases: ["kw"] },
    megawatt:  { name: "Megawatt", symbol: "MW", toBase: 1e6 },
    gigawatt:  { name: "Gigawatt", symbol: "GW", toBase: 1e9 },
    terawatt:  { name: "Terawatt", symbol: "TW", toBase: 1e12 },
    horsepower: { name: "Horsepower (mechanical)", symbol: "hp", toBase: 745.6998715822702 },
    horsepower_metric: { name: "Horsepower (metric)", symbol: "PS", toBase: 735.49875, aliases: ["ps", "cv"] },
    horsepower_electric: { name: "Horsepower (electric)", symbol: "hp", toBase: 746 },
    btuhour:   { name: "BTU per hour", symbol: "BTU/h", toBase: 1055.05585262 / 3600 },
    btuminute: { name: "BTU per minute", symbol: "BTU/min", toBase: 1055.05585262 / 60 },
    calpersecond:{ name: "Calorie per second", symbol: "cal/s", toBase: 4.184 },
    ergpersecond:{ name: "Erg per second", symbol: "erg/s", toBase: 1e-7 },
    footpoundpersecond:{ name: "Foot-pound per second", symbol: "ft·lb/s", toBase: 1.3558179483314004 },
    ton_refrigeration:{ name: "Ton of refrigeration", symbol: "TR", toBase: 3516.8528420667 },
    kilovoltampere:{ name: "Kilovolt-ampere", symbol: "kVA", toBase: 1000 },
  },
};

/* ---------- pressure ---------- */
const pressure = {
  id: "pressure", label: "Pressure", base: "pascal", group: "Physics", icon: "🎈",
  units: {
    pascal:     { name: "Pascal", symbol: "Pa", toBase: 1 },
    kilopascal: { name: "Kilopascal", symbol: "kPa", toBase: 1000 },
    megapascal: { name: "Megapascal", symbol: "MPa", toBase: 1e6 },
    gigapascal: { name: "Gigapascal", symbol: "GPa", toBase: 1e9 },
    bar:        { name: "Bar", symbol: "bar", toBase: 1e5 },
    millibar:   { name: "Millibar", symbol: "mbar", toBase: 100 },
    microbar:   { name: "Microbar", symbol: "µbar", toBase: 0.1 },
    atmosphere: { name: "Atmosphere", symbol: "atm", toBase: 101325, aliases: ["std atm"] },
    psi:        { name: "Pound per square inch", symbol: "psi", toBase: 6894.757293168361 },
    ksi:        { name: "Kip per square inch", symbol: "ksi", toBase: 6894757.293168361 },
    torr:       { name: "Torr", symbol: "Torr", toBase: 133.32236842105263 },
    mmhg:       { name: "Millimeter of mercury", symbol: "mmHg", toBase: 133.322387415 },
    inhg:       { name: "Inch of mercury", symbol: "inHg", toBase: 3386.388640341 },
    mmh2o:      { name: "Millimeter of water", symbol: "mmH₂O", toBase: 9.80665 },
    inh2o:      { name: "Inch of water", symbol: "inH₂O", toBase: 249.0889 },
    cmh2o:      { name: "Centimeter of water", symbol: "cmH₂O", toBase: 98.0665 },
    technical_atmosphere: { name: "Technical atmosphere", symbol: "at", toBase: 98066.5 },
    barye:      { name: "Barye", symbol: "Ba", toBase: 0.1 },
  },
};

/* ---------- density ---------- */
const density = {
  id: "density", label: "Density", base: "kgm3", group: "Physics", icon: "🧊",
  units: {
    kgm3:  { name: "Kilogram per cubic meter", symbol: "kg/m³", toBase: 1 },
    gm3:   { name: "Gram per cubic meter", symbol: "g/m³", toBase: 0.001 },
    kgl:   { name: "Kilogram per liter", symbol: "kg/L", toBase: 1000 },
    gl:    { name: "Gram per liter", symbol: "g/L", toBase: 1 },
    gcm3:  { name: "Gram per cubic centimeter", symbol: "g/cm³", toBase: 1000, aliases: ["g/ml"] },
    mgl:   { name: "Milligram per liter", symbol: "mg/L", toBase: 0.001, aliases: ["ppm in water"] },
    lbft3: { name: "Pound per cubic foot", symbol: "lb/ft³", toBase: 16.018463373960142 },
    ozin3: { name: "Ounce per cubic inch", symbol: "oz/in³", toBase: 1729.9940443271187 },
    lbin3: { name: "Pound per cubic inch", symbol: "lb/in³", toBase: 27679.904710750223 },
    lbgal: { name: "Pound per gallon (US)", symbol: "lb/gal", toBase: 119.82642731671389 },
    lbyd3: { name: "Pound per cubic yard", symbol: "lb/yd³", toBase: 1.678402381748764 },
    slugft3:{ name: "Slug per cubic foot", symbol: "slug/ft³", toBase: 515.3788183931961 },
    lbl:   { name: "Pound per liter", symbol: "lb/L", toBase: 0.45359237 },
  },
};

/* ---------- torque ---------- */
const torque = {
  id: "torque", label: "Torque", base: "nm", group: "Physics", icon: "🔩",
  units: {
    nm:      { name: "Newton meter", symbol: "N·m", toBase: 1 },
    knm:     { name: "Kilonewton meter", symbol: "kN·m", toBase: 1000 },
    ncm:     { name: "Newton centimeter", symbol: "N·cm", toBase: 0.01 },
    nmm:     { name: "Newton millimeter", symbol: "N·mm", toBase: 0.001 },
    lbfft:   { name: "Pound-force foot", symbol: "lbf·ft", toBase: 1.3558179483314004 },
    lbfin:   { name: "Pound-force inch", symbol: "lbf·in", toBase: 0.1129848290276167 },
    kgfm:    { name: "Kilogram-force meter", symbol: "kgf·m", toBase: 9.80665 },
    dynecm:  { name: "Dyne centimeter", symbol: "dyn·cm", toBase: 1e-7 },
  },
};

/* ---------- angle ---------- */
const angle = {
  id: "angle", label: "Angle", base: "degree", group: "Science", icon: "📐",
  units: {
    degree:      { name: "Degree", symbol: "°", toBase: 1, aliases: ["deg", "circle degree"] },
    radian:      { name: "Radian", symbol: "rad", toBase: 57.29577951308232, aliases: ["rad"] },
    gradian:     { name: "Gradian", symbol: "gon", toBase: 0.9, aliases: ["grad", "gon"] },
    turn:        { name: "Turn", symbol: "turn", toBase: 360, aliases: ["revolution", "cycle"] },
    revolution:  { name: "Revolution", symbol: "rev", toBase: 360 },
    quadrant:    { name: "Quadrant", symbol: "quad", toBase: 90 },
    right_angle: { name: "Right angle", symbol: "∠", toBase: 90 },
    arcminute:   { name: "Arcminute", symbol: "′", toBase: 1 / 60, aliases: ["minute", "arcmin"] },
    arcsecond:   { name: "Arcsecond", symbol: "″", toBase: 1 / 3600, aliases: ["second", "arcsec"] },
    mil:         { name: "Mil (NATO)", symbol: "mil", toBase: 0.05625, aliases: ["thousandth of circle"] },
    sextant:     { name: "Sextant", symbol: "sx", toBase: 60 },
    circle:      { name: "Circle", symbol: "○", toBase: 360 },
  },
};

/* ---------- frequency ---------- */
const frequency = {
  id: "frequency", label: "Frequency", base: "hertz", group: "Physics", icon: "📡",
  units: {
    hertz:     { name: "Hertz", symbol: "Hz", toBase: 1 },
    millihertz:{ name: "Millihertz", symbol: "mHz", toBase: 0.001 },
    kilohertz: { name: "Kilohertz", symbol: "kHz", toBase: 1000 },
    megahertz: { name: "Megahertz", symbol: "MHz", toBase: 1e6 },
    gigahertz: { name: "Gigahertz", symbol: "GHz", toBase: 1e9 },
    terahertz: { name: "Terahertz", symbol: "THz", toBase: 1e12 },
    rpm:       { name: "Revolution per minute", symbol: "rpm", toBase: 1 / 60 },
    radpersec: { name: "Radian per second", symbol: "rad/s", toBase: 1 / (2 * Math.PI) },
    bpm:       { name: "Beat per minute", symbol: "bpm", toBase: 1 / 60 },
    cpm:       { name: "Count per minute", symbol: "cpm", toBase: 1 / 60 },
    dpm:       { name: "Disintegration per minute", symbol: "dpm", toBase: 1 / 60 },
    fresnel:   { name: "Fresnel", symbol: "F", toBase: 4848.483 },
    diurnal:   { name: "Diurnal cycle", symbol: "d⁻¹", toBase: 1 / 86400 },
  },
};

/* ---------- data storage ---------- */
const data = {
  id: "data", label: "Data Storage", base: "byte", group: "Computing", icon: "💾",
  units: {
    bit:      { name: "Bit", symbol: "bit", toBase: 0.125 },
    nibble:   { name: "Nibble", symbol: "nibble", toBase: 0.5 },
    byte:     { name: "Byte", symbol: "B", toBase: 1, aliases: ["octet"] },
    kilobyte: { name: "Kilobyte", symbol: "kB", toBase: 1e3 },
    kibibyte: { name: "Kibibyte", symbol: "KiB", toBase: 1024 },
    megabyte: { name: "Megabyte", symbol: "MB", toBase: 1e6 },
    mebibyte: { name: "Mebibyte", symbol: "MiB", toBase: 1048576 },
    gigabyte: { name: "Gigabyte", symbol: "GB", toBase: 1e9 },
    gibibyte: { name: "Gibibyte", symbol: "GiB", toBase: 1073741824 },
    terabyte: { name: "Terabyte", symbol: "TB", toBase: 1e12 },
    tebibyte: { name: "Tebibyte", symbol: "TiB", toBase: 1099511627776 },
    petabyte: { name: "Petabyte", symbol: "PB", toBase: 1e15 },
    pebibyte: { name: "Pebibyte", symbol: "PiB", toBase: 1125899906842624 },
    exabyte:  { name: "Exabyte", symbol: "EB", toBase: 1e18 },
    exbibyte: { name: "Exbibyte", symbol: "EiB", toBase: 1152921504606846976 },
    word16:   { name: "Word (16-bit)", symbol: "w", toBase: 2 },
    word32:   { name: "Word (32-bit)", symbol: "w", toBase: 4 },
    word64:   { name: "Word (64-bit)", symbol: "w", toBase: 8 },
    floppy:   { name: "Floppy disk (1.44 MB)", symbol: "F", toBase: 1440000 },
    cd:       { name: "CD (700 MiB)", symbol: "CD", toBase: 734003200 },
    dvd:      { name: "DVD (4.7 GB)", symbol: "DVD", toBase: 4700000000 },
  },
};

/* ---------- data rate ---------- */
const datarate = {
  id: "datarate", label: "Data Transfer Rate", base: "bps", group: "Computing", icon: "🌐",
  units: {
    bps:      { name: "Bit per second", symbol: "bit/s", toBase: 1 },
    kbps:     { name: "Kilobit per second", symbol: "kbit/s", toBase: 1000 },
    kibps:    { name: "Kibibit per second", symbol: "Kibit/s", toBase: 1024 },
    mbps:     { name: "Megabit per second", symbol: "Mbit/s", toBase: 1e6 },
    mibps:    { name: "Mebibit per second", symbol: "Mibit/s", toBase: 1048576 },
    gbps:     { name: "Gigabit per second", symbol: "Gbit/s", toBase: 1e9 },
    gibps:    { name: "Gibibit per second", symbol: "Gibit/s", toBase: 1073741824 },
    tbps:     { name: "Terabit per second", symbol: "Tbit/s", toBase: 1e12 },
    bytes_per_second: { name: "Byte per second", symbol: "B/s", toBase: 8 },
    kilobyte_per_second: { name: "Kilobyte per second", symbol: "kB/s", toBase: 8000 },
    mebibyte_per_second: { name: "Mebibyte per second", symbol: "MiB/s", toBase: 8388608 },
    gigabyte_per_second: { name: "Gigabyte per second", symbol: "GB/s", toBase: 8e9 },
    baud:     { name: "Baud", symbol: "Bd", toBase: 1 },
  },
};

/* ---------- flow rate ---------- */
const flow = {
  id: "flow", label: "Flow Rate", base: "lps", group: "Physics", icon: "🚰",
  units: {
    lps:   { name: "Liter per second", symbol: "L/s", toBase: 1 },
    lpm:   { name: "Liter per minute", symbol: "L/min", toBase: 1 / 60 },
    lph:   { name: "Liter per hour", symbol: "L/h", toBase: 1 / 3600 },
    m3s:   { name: "Cubic meter per second", symbol: "m³/s", toBase: 1000 },
    m3h:   { name: "Cubic meter per hour", symbol: "m³/h", toBase: 1000 / 3600 },
    m3d:   { name: "Cubic meter per day", symbol: "m³/d", toBase: 1000 / 86400 },
    gps_us:{ name: "US gallon per second", symbol: "gal/s", toBase: 3.785411784 },
    gpm_us:{ name: "US gallon per minute", symbol: "gpm", toBase: 3.785411784 / 60 },
    gph_us:{ name: "US gallon per hour", symbol: "gph", toBase: 3.785411784 / 3600 },
    gpm_uk:{ name: "UK gallon per minute", symbol: "gpm", toBase: 4.54609 / 60 },
    cfm:   { name: "Cubic foot per minute", symbol: "cfm", toBase: 28.316846592 / 60 },
    cfs:   { name: "Cubic foot per second", symbol: "cfs", toBase: 28.316846592 },
    bpd:   { name: "Barrel per day", symbol: "bpd", toBase: 158.987294928 / 86400 },
    mld:   { name: "Million liters per day", symbol: "MLD", toBase: 1e6 / 86400 },
  },
};

/* ---------- fuel economy (inverted units) ---------- */
const fuel = {
  id: "fuel", label: "Fuel Economy", base: "kmpl", group: "Everyday", icon: "⛽",
  inverseFactor: 100,
  units: {
    kmpl:      { name: "Kilometer per liter", symbol: "km/L", toBase: 1 },
    mpg_us:    { name: "Mile per gallon (US)", symbol: "mpg", toBase: 1.609344 / 3.785411784 },
    mpg_uk:    { name: "Mile per gallon (UK)", symbol: "mpg", toBase: 1.609344 / 4.54609 },
    kmpgal_us: { name: "Kilometer per US gallon", symbol: "km/gal", toBase: 3.785411784 },
    kmpgal_uk: { name: "Kilometer per UK gallon", symbol: "km/gal", toBase: 4.54609 },
    liter_per_100km: { name: "Liter per 100 km", symbol: "L/100km", toBase: 1, invert: true },
    liter_per_100mile:{ name: "Liter per 100 miles", symbol: "L/100mi", toBase: 1, invert: true, invFactor: 160.9344 },
  },
};

/* ---------- viscosity ---------- */
const viscosity_dyn = {
  id: "viscosity_dyn", label: "Viscosity (dynamic)", base: "pas", group: "Science", icon: "🧴",
  units: {
    pas:    { name: "Pascal second", symbol: "Pa·s", toBase: 1 },
    mpas:   { name: "Millipascal second", symbol: "mPa·s", toBase: 0.001 },
    poise:  { name: "Poise", symbol: "P", toBase: 0.1 },
    cpoise: { name: "Centipoise", symbol: "cP", toBase: 0.001 },
    lbspfts2:{ name: "Pound-force second per sq ft", symbol: "lbf·s/ft²", toBase: 47.88025898033584 },
    lbspfts: { name: "Pound-force second per ft", symbol: "lbf·s/ft", toBase: 1.48816394357 },
  },
};
const viscosity_kin = {
  id: "viscosity_kin", label: "Viscosity (kinematic)", base: "m2s", group: "Science", icon: "🌊",
  units: {
    m2s:    { name: "Square meter per second", symbol: "m²/s", toBase: 1 },
    stokes: { name: "Stokes", symbol: "St", toBase: 1e-4 },
    cstokes:{ name: "Centistokes", symbol: "cSt", toBase: 1e-6 },
    ft2s:   { name: "Square foot per second", symbol: "ft²/s", toBase: 0.09290304 },
  },
};

/* ---------- electricity ---------- */
const resistance = {
  id: "resistance", label: "Resistance", base: "ohm", group: "Electricity", icon: "⚡",
  units: {
    ohm:   { name: "Ohm", symbol: "Ω", toBase: 1 },
    milliohm:{ name: "Milliohm", symbol: "mΩ", toBase: 1e-3 },
    microohm:{ name: "Microohm", symbol: "µΩ", toBase: 1e-6 },
    kiloohm:{ name: "Kiloohm", symbol: "kΩ", toBase: 1000 },
    megaohm:{ name: "Megaohm", symbol: "MΩ", toBase: 1e6 },
    gigaohm:{ name: "Gigaohm", symbol: "GΩ", toBase: 1e9 },
    abohm: { name: "Abohm", symbol: "abΩ", toBase: 1e-10 },
  },
};
const voltage = {
  id: "voltage", label: "Voltage", base: "volt", group: "Electricity", icon: "🔋",
  units: {
    volt:   { name: "Volt", symbol: "V", toBase: 1 },
    millivolt:{ name: "Millivolt", symbol: "mV", toBase: 1e-3 },
    microvolt:{ name: "Microvolt", symbol: "µV", toBase: 1e-6 },
    kilovolt:{ name: "Kilovolt", symbol: "kV", toBase: 1000 },
    abvolt: { name: "Abvolt", symbol: "abV", toBase: 1e-8 },
    statvolt:{ name: "Statvolt", symbol: "statV", toBase: 299.792458 },
  },
};
const charge = {
  id: "charge", label: "Electric Charge", base: "coulomb", group: "Electricity", icon: "⚡",
  units: {
    coulomb: { name: "Coulomb", symbol: "C", toBase: 1 },
    millicoulomb:{ name: "Millicoulomb", symbol: "mC", toBase: 1e-3 },
    microcoulomb:{ name: "Microcoulomb", symbol: "µC", toBase: 1e-6 },
    nanocoulomb:{ name: "Nanocoulomb", symbol: "nC", toBase: 1e-9 },
    amperehour:{ name: "Ampere-hour", symbol: "Ah", toBase: 3600 },
    milliamperehour:{ name: "Milliampere-hour", symbol: "mAh", toBase: 3.6 },
    statcoulomb:{ name: "Statcoulomb", symbol: "statC", toBase: 3.33564095198e-10 },
    abcoulomb:{ name: "Abcoulomb", symbol: "abC", toBase: 1e-9 },
  },
};
const capacitance = {
  id: "capacitance", label: "Capacitance", base: "farad", group: "Electricity", icon: "🔋",
  units: {
    farad:      { name: "Farad", symbol: "F", toBase: 1 },
    millifarad: { name: "Millifarad", symbol: "mF", toBase: 1e-3 },
    microfarad: { name: "Microfarad", symbol: "µF", toBase: 1e-6 },
    nanofarad:  { name: "Nanofarad", symbol: "nF", toBase: 1e-9 },
    picofarad:  { name: "Picofarad", symbol: "pF", toBase: 1e-12 },
    statfarad:  { name: "Statfarad", symbol: "statF", toBase: 1.112650056e-12 },
  },
};
const conductance = {
  id: "conductance", label: "Conductance", base: "siemens", group: "Electricity", icon: "⚡",
  units: {
    siemens:     { name: "Siemens", symbol: "S", toBase: 1 },
    millisiemens:{ name: "Millisiemens", symbol: "mS", toBase: 1e-3 },
    microsiemens:{ name: "Microsiemens", symbol: "µS", toBase: 1e-6 },
    nanosiemens: { name: "Nanosiemens", symbol: "nS", toBase: 1e-9 },
    mho:          { name: "Mho", symbol: "℧", toBase: 1, aliases: ["reciprocal ohm", "siemens"] },
  },
};

/* ---------- magnetism ---------- */
const magnetism = {
  id: "magnetism", label: "Magnetic Flux Density", base: "tesla", group: "Science", icon: "🧲",
  units: {
    tesla:     { name: "Tesla", symbol: "T", toBase: 1 },
    millitesla:{ name: "Millitesla", symbol: "mT", toBase: 1e-3 },
    microtesla:{ name: "Microtesla", symbol: "µT", toBase: 1e-6 },
    nanotesla: { name: "Nanotesla", symbol: "nT", toBase: 1e-9 },
    gauss:     { name: "Gauss", symbol: "G", toBase: 1e-4 },
    milligauss:{ name: "Milligauss", symbol: "mG", toBase: 1e-7 },
    maxwell:   { name: "Maxwell", symbol: "Mx", toBase: 1e-8 },
    oersted:   { name: "Oersted", symbol: "Oe", toBase: 1e-4 },
  },
};

/* ---------- radiation ---------- */
const radiation_activity = {
  id: "radiation_activity", label: "Radiation Activity", base: "becquerel", group: "Science", icon: "☢️",
  units: {
    becquerel: { name: "Becquerel", symbol: "Bq", toBase: 1, aliases: ["disintegrations per second"] },
    kilobecquerel:{ name: "Kilobecquerel", symbol: "kBq", toBase: 1000 },
    kilocurie: { name: "Kilocurie", symbol: "kCi", toBase: 3.7e13 },
    megabecquerel:{ name: "Megabecquerel", symbol: "MBq", toBase: 1e6 },
    gigabecquerel:{ name: "Gigabecquerel", symbol: "GBq", toBase: 1e9 },
    curie:     { name: "Curie", symbol: "Ci", toBase: 3.7e10 },
    millicurie:{ name: "Millicurie", symbol: "mCi", toBase: 3.7e7 },
    microcurie:{ name: "Microcurie", symbol: "µCi", toBase: 3.7e4 },
    nanocurie: { name: "Nanocurie", symbol: "nCi", toBase: 3.7e3 },
    rutherford:{ name: "Rutherford", symbol: "Rd", toBase: 1e6 },
    disintegrations_per_minute: { name: "Disintegrations per minute", symbol: "dpm", toBase: 1 / 60 },
    counts_per_minute: { name: "Counts per minute", symbol: "cpm", toBase: 1 / 60 },
  },
};
const radiation_dose = {
  id: "radiation_dose", label: "Radiation Dose (absorbed)", base: "gray", group: "Science", icon: "☢️",
  units: {
    gray:    { name: "Gray", symbol: "Gy", toBase: 1 },
    milligray:{ name: "Milligray", symbol: "mGy", toBase: 1e-3 },
    microgray:{ name: "Microgray", symbol: "µGy", toBase: 1e-6 },
    kilogray:{ name: "Kilogray", symbol: "kGy", toBase: 1000 },
    rad:     { name: "Rad", symbol: "rad", toBase: 0.01 },
    millirad:{ name: "Millirad", symbol: "mrad", toBase: 1e-5 },
    microrad:{ name: "Microrad", symbol: "µrad", toBase: 1e-7 },
  },
};
const radiation_equiv = {
  id: "radiation_equiv", label: "Radiation Dose (equivalent)", base: "sievert", group: "Science", icon: "☢️",
  units: {
    sievert:    { name: "Sievert", symbol: "Sv", toBase: 1 },
    millisievert:{ name: "Millisievert", symbol: "mSv", toBase: 1e-3 },
    microsievert:{ name: "Microsievert", symbol: "µSv", toBase: 1e-6 },
    rem:        { name: "Rem", symbol: "rem", toBase: 0.01 },
    millirem:   { name: "Millirem", symbol: "mrem", toBase: 1e-5 },
    microrem:   { name: "Microrem", symbol: "µrem", toBase: 1e-7 },
  },
};

/* ---------- light ---------- */
const illuminance = {
  id: "illuminance", label: "Illuminance", base: "lux", group: "Science", icon: "💡",
  units: {
    lux:        { name: "Lux", symbol: "lx", toBase: 1, aliases: ["lumen per square meter"] },
    kilolux:    { name: "Kilolux", symbol: "klx", toBase: 1000 },
    millilux:   { name: "Millilux", symbol: "mlx", toBase: 0.001 },
    footcandle: { name: "Foot-candle", symbol: "fc", toBase: 10.763910416709722 },
    phot:       { name: "Phot", symbol: "ph", toBase: 10000 },
    nox:        { name: "Nox", symbol: "nx", toBase: 0.001 },
  },
};
const luminance = {
  id: "luminance", label: "Luminance", base: "cd_m2", group: "Science", icon: "✨",
  units: {
    cd_m2:     { name: "Candela per square meter", symbol: "cd/m²", toBase: 1 },
    nit:       { name: "Nit", symbol: "nt", toBase: 1, aliases: ["cd/m2"] },
    stilb:     { name: "Stilb", symbol: "sb", toBase: 10000 },
    lambert:   { name: "Lambert", symbol: "L", toBase: 3183.098861837907 },
    apostilb:  { name: "Apostilb", symbol: "asb", toBase: 3183.098861837907 },
    footlambert:{ name: "Foot-lambert", symbol: "fL", toBase: 3.4262590996353905 },
    blondel:   { name: "Blondel", symbol: "bl", toBase: 3183.098861837907 },
  },
};

/* ---------- sound ---------- */
const sound = {
  id: "sound", label: "Sound Level", base: "decibel", group: "Everyday", icon: "🔊",
  units: {
    decibel:  { name: "Decibel", symbol: "dB", toBase: 1, aliases: ["db spl"] },
    decibel_a:{ name: "Decibel (A-weighted)", symbol: "dB(A)", toBase: 1 },
    decibel_c:{ name: "Decibel (C-weighted)", symbol: "dB(C)", toBase: 1 },
    bel:      { name: "Bel", symbol: "B", toBase: 10 },
    neper:    { name: "Neper", symbol: "Np", toBase: 8.685889638065035 },
  },
};

/* ---------- typography ---------- */
const typography = {
  id: "typography", label: "Typography", base: "millimeter", group: "Everyday", icon: "🔠",
  units: {
    point_dtp: { name: "Point (72/in)", symbol: "pt", toBase: 0.0254 / 72, aliases: ["postscript point"] },
    point_tex: { name: "Point (72.27/in)", symbol: "pt", toBase: 0.0254 / 72.27, aliases: ["tex point", "bp"] },
    pica_tex:  { name: "Pica (TeX)", symbol: "pc", toBase: 12 * (0.0254 / 72.27) },
    didot:     { name: "Didot point", symbol: "dd", toBase: 0.00037577251 },
    cicero:    { name: "Cicero", symbol: "cc", toBase: 12 * 0.00037577251 },
    pixel:     { name: "Pixel (96 dpi)", symbol: "px", toBase: 0.0254 / 96 },
    em:        { name: "Em (16 px)", symbol: "em", toBase: 16 * (0.0254 / 96) },
    rem:       { name: "Rem (16 px)", symbol: "rem", toBase: 16 * (0.0254 / 96) },
    twip:      { name: "Twip", symbol: "tw", toBase: 0.0254 / 1440 },
    inch:      { name: "Inch", symbol: "in", toBase: 0.0254 },
    millimeter:{ name: "Millimeter", symbol: "mm", toBase: 0.001 },
  },
};

/* ---------- cooking ---------- */
const cooking = {
  id: "cooking", label: "Cooking Measures", base: "milliliter", group: "Everyday", icon: "🍳",
  units: {
    milliliter:{ name: "Milliliter", symbol: "mL", toBase: 1, aliases: ["ml"] },
    liter:     { name: "Liter", symbol: "L", toBase: 1000 },
    teaspoon:  { name: "Teaspoon (US)", symbol: "tsp", toBase: 4.92892159375 },
    tablespoon:{ name: "Tablespoon (US)", symbol: "tbsp", toBase: 14.78676478125 },
    fluidounce:{ name: "Fluid ounce (US)", symbol: "fl oz", toBase: 29.5735295625 },
    cup:       { name: "Cup (US)", symbol: "c", toBase: 236.5882365 },
    pint:      { name: "Pint (US)", symbol: "pt", toBase: 473.176473 },
    quart:     { name: "Quart (US)", symbol: "qt", toBase: 946.352946 },
    gallon:    { name: "Gallon (US)", symbol: "gal", toBase: 3785.411784 },
    pinch:     { name: "Pinch", symbol: "pinch", toBase: 4.92892159375 / 16 },
    dash:      { name: "Dash", symbol: "dash", toBase: 4.92892159375 / 8 },
    stick:     { name: "Stick of butter", symbol: "stick", toBase: 113.398093 },
    clove:     { name: "Clove of garlic", symbol: "clove", toBase: 3 },
    smidgen:   { name: "Smidgen", symbol: "smidgen", toBase: 4.92892159375 / 32 },
  },
};

/* ---------- registry ---------- */
const CATEGORIES = {
  length, mass, area, volume, temperature, time, speed, acceleration, force,
  energy, power, pressure, density, torque, angle, frequency, data, datarate,
  flow, fuel, viscosity_dyn, viscosity_kin, resistance, voltage, charge,
  capacitance, conductance, magnetism, radiation_activity, radiation_dose,
  radiation_equiv, illuminance, luminance, sound, typography, cooking,
};

const CATEGORY_LIST = Object.values(CATEGORIES);

function getCategory(id) {
  return CATEGORIES[id] || null;
}

/** Flat list of every unit with a back-reference to its category. */
function searchUnits(query) {
  const q = (query || "").trim().toLowerCase();
  const hits = [];
  for (const cat of CATEGORY_LIST) {
    for (const [id, u] of Object.entries(cat.units)) {
      const hay = [id, u.name, u.symbol].concat(u.aliases || []).join(" ").toLowerCase();
      if (!q || hay.includes(q)) {
        hits.push({ cat, id, unit: u, hay });
      }
    }
  }
  return hits;
}

// exported last: these are `const`, so touching them earlier is a TDZ error
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CATEGORIES, CATEGORY_LIST, getCategory, searchUnits };
}