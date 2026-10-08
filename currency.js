/* ============================================================
   CURRENCY — live rates with an offline fallback
   ------------------------------------------------------------
   Three tiers, tried in order:
     1. fawazahmed0/currency-api on jsDelivr  (340 codes, dated)
     2. open.er-api.com                       (166 codes)
     3. a bundled snapshot                    (104 codes, labelled stale)

   Everything is normalised to "units of X per 1 USD", so conversion
   is always amount * rate[to] / rate[from] regardless of source.

   Frankfurter is deliberately NOT used: it is the obvious free
   choice, but it sends no Access-Control-Allow-Origin header, so a
   browser fetch of it is blocked by CORS.
   ============================================================ */

if (typeof module !== "undefined" && module.exports) {
  module.exports = Currency;
}

var Currency = (function () {
  /* ---------- currency names & symbols ---------- */

  var NAMES = {
    aed: "UAE Dirham", afn: "Afghan Afghani", all: "Albanian Lek", amd: "Armenian Dram",
    ang: "Netherlands Antillean Guilder", aoa: "Angolan Kwanza", ars: "Argentine Peso",
    aud: "Australian Dollar", awg: "Aruban Florin", azn: "Azerbaijani Manat",
    bam: "Bosnia-Herzegovina Convertible Mark", bbd: "Barbadian Dollar", bdt: "Bangladeshi Taka",
    bgn: "Bulgarian Lev", bhd: "Bahraini Dinar", bif: "Burundian Franc",
    bmd: "Bermudan Dollar", bnd: "Brunei Dollar", bob: "Bolivian Boliviano",
    brl: "Brazilian Real", bsd: "Bahamian Dollar", bwp: "Botswanan Pula",
    byn: "Belarusian Ruble", byr: "Belarusian Ruble (2000–2016)", bzd: "Belize Dollar",
    cad: "Canadian Dollar", cdf: "Congolese Franc", chf: "Swiss Franc",
    clp: "Chilean Peso", cny: "Chinese Yuan", cop: "Colombian Peso",
    crc: "Costa Rican Colón", cve: "Cape Verdean Escudo", czk: "Czech Koruna",
    djf: "Djiboutian Franc", dkk: "Danish Krone", dop: "Dominican Peso",
    dzd: "Algerian Dinar", egp: "Egyptian Pound", ern: "Eritrean Nakfa",
    etb: "Ethiopian Birr", eur: "Euro", fjd: "Fijian Dollar",
    fkp: "Falkland Islands Pound", gbp: "British Pound", gel: "Georgian Lari",
    ghs: "Ghanaian Cedi", gip: "Gibraltar Pound", gmd: "Gambian Dalasi",
    gnf: "Guinean Franc", gtq: "Guatemalan Quetzal", gyd: "Guyanaese Dollar",
    hkd: "Hong Kong Dollar", hnl: "Honduran Lempira", hrk: "Croatian Kuna",
    htg: "Honduran Lempira", huf: "Hungarian Forint", idr: "Indonesian Rupiah",
    ils: "Israeli New Shekel", inr: "Indian Rupee", iqd: "Iraqi Dinar",
    irr: "Iranian Rial", isk: "Icelandic Króna", jmd: "Jamaican Dollar",
    jod: "Jordanian Dinar", jpy: "Japanese Yen", kes: "Kenyan Shilling",
    kgs: "Kyrgystani Som", khr: "Cambodian Riel", kmf: "Comorian Franc",
    krw: "South Korean Won", kwd: "Kuwaiti Dinar", kyd: "Cayman Islands Dollar",
    kzt: "Kazakhstani Tenge", lak: "Lao Kip", lbp: "Lebanese Pound",
    lkr: "Sri Lankan Rupee", lrd: "Liberian Dollar", lsl: "Lesotho Loti",
    ltl: "Lithuanian Litas", lvl: "Latvian Lats", lyd: "Libyan Dinar",
    mad: "Moroccan Dirham", mdl: "Moldovan Leu", mga: "Malagasy Ariary",
    mkd: "Macedonian Denar", mmk: "Myanmar Kyat", mnt: "Mongolian Tögrög",
    mop: "Macanese Pataca", mro: "Mauritanian Ouguiya", mur: "Mauritian Rupee",
    mvr: "Maldivian Rufiyaa", mwk: "Malawian Kwacha", mxn: "Mexican Peso",
    myr: "Malaysian Ringgit", mzn: "Mozambican Metical", nad: "Namibian Dollar",
    ngn: "Nigerian Naira", nio: "Nicaraguan Córdoba", nok: "Norwegian Krone",
    npr: "Nepalese Rupee", nzd: "New Zealand Dollar", omr: "Omani Rial",
    pab: "Panamanian Balboa", pen: "Peruvian Sol", pgk: "Papua New Guinean Kina",
    php: "Philippine Peso", pkr: "Pakistani Rupee", pln: "Polish Złoty",
    pyg: "Paraguayan Guaraní", qar: "Qatari Riyal", ron: "Romanian Leu",
    rsd: "Serbian Dinar", rub: "Russian Ruble", rwf: "Rwandan Franc",
    sar: "Saudi Riyal", sbd: "Solomon Islands Dollar", scr: "Seychellois Rupee",
    sdg: "Sudanese Pound", sek: "Swedish Krona", sgd: "Singapore Dollar",
    shp: "Saint Helena Pound", sll: "Sierra Leonean Leone", sos: "Somali Shilling",
    srd: "Surinamese Dollar", std: "São Tomé & Príncipe Dobra", stn: "São Tomé & Príncipe Second Dobra",
    svc: "Salvadoran Colón", syp: "Syrian Pound", szl: "Swazi Lilangeni",
    thb: "Thai Baht", tjs: "Tajikistani Somoni", tmt: "Turkmenistani Manat",
    tnd: "Tunisian Dinar", top: "Tongan Paʻanga", try: "Turkish Lira",
    ttd: "Trinidad & Tobago Dollar", twd: "New Taiwan Dollar", tzs: "Tanzanian Shilling",
    uah: "Ukrainian Hryvnia", ugx: "Ugandan Shilling", usd: "US Dollar",
    uyu: "Uruguayan Peso", uzs: "Uzbekistani Som", ves: "Venezuelan Bolívar",
    vnd: "Vietnamese Đồng", vuv: "Vanuatu Vatu", wst: "Samoan Tala",
    xaf: "Central African CFA Franc", xcd: "East Caribbean Dollar",
    xof: "West African CFA Franc", xpf: "CFP Franc", yer: "Yemeni Rial",
    zar: "South African Rand", zmw: "Zambian Kwacha", zwl: "Zimbabwean Dollar",
    // widely-traded digital assets that also appear in the rate feed
    btc: "Bitcoin", eth: "Ethereum", sol: "Solana", xrp: "XRP", ada: "Cardano",
    doge: "Dogecoin", bnb: "BNB", usdt: "Tether", usdc: "USD Coin", trx: "TRON",
    ltc: "Litecoin", bch: "Bitcoin Cash", link: "Chainlink", xmr: "Monero",
    ton: "Toncoin", shib: "Shiba Inu", avax: "Avalanche", dot: "Polkadot",
  };

  var SYMBOLS = {
    usd: "$", eur: "€", gbp: "£", jpy: "¥", cny: "¥", krw: "₩", inr: "₹",
    rub: "₽", btc: "₿", eth: "Ξ", ltc: "Ł", php: "₱", vnd: "₫", try: "₺",
    krw: "₩", ils: "₪", bdt: "৳", thb: "฿", ngn: "₦", ghs: "₵", twd: "NT$",
  };

  var CURRENCY_DECIMALS = {
    bhd: 3, jod: 3, omr: 3, kwd: 3, tnd: 3, jpy: 0, krw: 0, vnd: 0,
    idr: 0, clp: 0, pyg: 0, rwf: 0, ugx: 0, xaf: 0, xof: 0, xpf: 0,
    bif: 0, djf: 0, gnf: 0, kp: 0, mga: 0, vuv: 0,
  };

  function decimalsFor(code) {
    return CURRENCY_DECIMALS[code] != null ? CURRENCY_DECIMALS[code] : 2;
  }

  function nameOf(code) {
    var c = String(code).toLowerCase();
    return NAMES[c] || String(code).toUpperCase();
  }
  function symbolOf(code) {
    return SYMBOLS[String(code).toLowerCase()] || "";
  }

  /** Regional-indicator flag emoji, when the code looks like a country. */
  function flagOf(code) {
    var c = String(code).toLowerCase();
    if (!/^[a-z]{2}$/.test(c)) return "";
    var A = 0x1f1e6;
    return String.fromCodePoint(A + (c.charCodeAt(0) - 97), A + (c.charCodeAt(1) - 97));
  }

  /* ---------- sources ---------- */

  var SOURCES = [
    {
      id: "jsdelivr",
      label: "fawazahmed0 / jsDelivr",
      url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      timeout: 9000,
      parse: function (j) {
        if (!j || !j.usd) throw new Error("unexpected shape");
        return { rates: j.usd, date: j.date || null };
      },
    },
    {
      id: "erapi",
      label: "open.er-api.com",
      url: "https://open.er-api.com/v6/latest/USD",
      timeout: 9000,
      parse: function (j) {
        if (!j || !j.rates) throw new Error("unexpected shape");
        return { rates: j.rates, date: j.time_last_update_utc ? j.time_last_update_utc.slice(0, 10) : null };
      },
    },
  ];

  /* ---------- state ---------- */

  var state = {
    rates: null,     // code (lowercase) -> units per 1 USD
    date: null,      // "YYYY-MM-DD" of the rates
    source: null,    // human label of where they came from
    live: false,     // false => bundled snapshot
    loading: false,
    errors: [],
  };

  var listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (f) { try { f(state); } catch (e) { console.error(e); } }); }

  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { reject(new Error("timeout")); }, ms);
      promise.then(
        function (v) { clearTimeout(timer); resolve(v); },
        function (e) { clearTimeout(timer); reject(e); }
      );
    });
  }

  /** Try each live source in turn; fall back to the bundled snapshot. */
  function load(opts) {
    opts = opts || {};
    if (state.loading) return Promise.resolve(state);
    state.loading = true;
    state.errors = [];
    emit();

    var i = 0;
    function attempt() {
      if (i >= SOURCES.length) return Promise.resolve(useSnapshot("all live sources failed"));
      var src = SOURCES[i++];
      return withTimeout(fetch(src.url, { cache: "no-store" }), src.timeout)
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (j) {
          var parsed = src.parse(j);
          var rates = {};
          Object.keys(parsed.rates).forEach(function (k) {
            var v = Number(parsed.rates[k]);
            if (Number.isFinite(v) && v > 0) rates[k.toLowerCase()] = v;
          });
          rates.usd = 1;
          state.rates = rates;
          state.date = parsed.date;
          state.source = src.label;
          state.live = true;
          return state;
        })
        .catch(function (e) {
          state.errors.push(src.label + ": " + e.message);
          return attempt();
        });
    }

    return attempt().then(function (s) {
      state.loading = false;
      if (opts.silent !== true) emit();
      return s;
    });
  }

  function useSnapshot(reason) {
    if (reason) state.errors.push(reason);
    state.rates = {};
    Object.keys(typeof SNAPSHOT_RATES !== "undefined" ? SNAPSHOT_RATES : {}).forEach(function (k) {
      state.rates[k.toLowerCase()] = SNAPSHOT_RATES[k];
    });
    state.rates.usd = 1;
    state.date = typeof SNAPSHOT_DATE !== "undefined" ? SNAPSHOT_DATE : null;
    state.source = "bundled snapshot";
    state.live = false;
    return state;
  }

  /** Seed from the snapshot so the UI is never empty while fetching. */
  function initFromSnapshot() {
    if (!state.rates) useSnapshot(null);
    return state;
  }

  /* ---------- conversion ---------- */

  function has(code) {
    return !!state.rates && state.rates[String(code).toLowerCase()] != null;
  }

  /** amount of `to` equal to `amount` of `from` */
  function convert(amount, from, to) {
    var r = String(from).toLowerCase(), t = String(to).toLowerCase();
    if (!state.rates || !has(r) || !has(t)) return NaN;
    return (amount * state.rates[t]) / state.rates[r];
  }

  function format(amount, code) {
    if (!Number.isFinite(amount)) return "—";
    var c = String(code).toLowerCase();
    var d = decimalsFor(c);
    var body = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
    return (amount < 0 ? "−" : "") + symbolOf(c) + body;
  }

  /** Every code we can currently convert between, major currencies first. */
  function codes() {
    if (!state.rates) return [];
    return Object.keys(state.rates).sort(function (a, b) {
      var rank = function (c) {
        var order = ["usd","eur","gbp","jpy","inr","aud","cad","chf","cny","pkr","brl","zar","mxn","sgd","hkd","nzd","sek","nok","aed","sar","try","rub","idr","php","thb","vnd","twd","krw","ils","egp","ngn","ars","clp","cop","pen","bdt","lkr","npr","uah","kzt","vnd"];
        var i = order.indexOf(c);
        return i === -1 ? 999 : i;
      };
      return rank(a) - rank(b) || a.localeCompare(b);
    });
  }

  function search(q) {
    var s = String(q || "").trim().toLowerCase();
    var out = [];
    for (var c of codes()) {
      if (!s || c.indexOf(s) === 0 || nameOf(c).toLowerCase().indexOf(s) === 0) out.push(c);
    }
    return out;
  }

  return {
    load: load,
    initFromSnapshot: initFromSnapshot,
    onChange: onChange,
    convert: convert,
    has: has,
    format: format,
    codes: codes,
    search: search,
    nameOf: nameOf,
    symbolOf: symbolOf,
    flagOf: flagOf,
    decimalsFor: decimalsFor,
    state: function () { return state; },
  };
})();