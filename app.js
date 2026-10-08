/* ============================================================
   APP -- UI wiring
   ------------------------------------------------------------
   Plain DOM, no framework. Views are functions that return a node;
   the router keeps the current view in location.hash so any
   conversion is shareable as a link.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- tiny DOM helper ---------- */

  function h(tag, props, ...kids) {
    var n = document.createElement(tag);
    if (props) {
      for (var k in props) {
        var v = props[k];
        if (v == null || v === false) continue;
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k === "text") n.textContent = v;
        else if (k === "style") n.setAttribute("style", v);
        else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
        else if (k === "value" || k === "checked" || k === "disabled" || k === "hidden") n[k] = v;
        else n.setAttribute(k, v);
      }
    }
    for (var c of kids.flat()) {
      if (c == null || c === false) continue;
      n.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
    }
    return n;
  }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 1600);
  }

  function copy(text, what) {
    var done = function () { toast("Copied " + (what || "") + "to clipboard"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = h("textarea", { style: "position:fixed;opacity:0" });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { toast("Copy failed — select and copy manually"); }
      document.body.removeChild(ta);
    }
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */

  var SPECIAL = [
    { id: "currency",  label: "Currency",       icon: "💱" },
    { id: "numeral",   label: "Number systems", icon: "🔢" },
    { id: "color",     label: "Colour",         icon: "🎨" },
    { id: "timezone",  label: "Time zones",     icon: "🌍" },
    { id: "paper",     label: "Paper sizes",    icon: "📄" },
    { id: "shoe",      label: "Shoe sizes",     icon: "👟" },
    { id: "clothing",  label: "Clothing",       icon: "👕" },
    { id: "age",       label: "Date & age",     icon: "🎂" },
    { id: "image",     label: "Image resolution", icon: "🖼️" },
    { id: "constants", label: "Physics constants", icon: "⚛️" },
  ];

  var current = null;   // current view id
  var state = {};      // per-view remembered state

  function navModel() {
    var groups = new Map();
    for (var cat of CATEGORY_LIST) {
      if (!groups.has(cat.group)) groups.set(cat.group, []);
      groups.get(cat.group).push({
        id: "cat:" + cat.id, label: cat.label, icon: cat.icon,
        n: Object.keys(cat.units).length,
      });
    }
    return groups;
  }

  function renderNav(filter) {
    var nav = $("#cat-nav");
    nav.textContent = "";
    var q = (filter || "").trim().toLowerCase();
    var groups = navModel();
    var order = ["Physics", "Electricity", "Science", "Computing", "Everyday"];
    var any = false;

    function addItem(item) {
      any = true;
      nav.appendChild(h("button", {
        type: "button",
        class: "nav-item" + (current === item.id ? " is-active" : ""),
        onclick: function () { go(item.id); },
      }, h("span", { class: "ico", text: item.icon || "" }),
         h("span", { text: item.label }),
         item.n ? h("span", { class: "n", text: item.n }) : null));
    }

    // 1. all the multiplicative unit categories, grouped
    order.forEach(function (g) {
      if (!groups.has(g)) return;
      var items = groups.get(g).filter(function (i) {
        return !q || i.label.toLowerCase().includes(q) ||
          Object.keys(getCategory(i.id.slice(4)).units).some(function (uid) {
            var u = getCategory(i.id.slice(4)).units[uid];
            return (uid + " " + u.name + " " + u.symbol).toLowerCase().includes(q);
          });
      });
      if (!items.length) return;
      nav.appendChild(h("div", { class: "nav-group-title", text: g }));
      items.forEach(addItem);
    });

    // 2. everything that is not a plain multiplicative table
    var specials = SPECIAL.filter(function (s) {
      return !q || s.label.toLowerCase().includes(q) ||
        (s.aliases || []).join(" ").toLowerCase().includes(q);
    });
    if (specials.length) {
      nav.appendChild(h("div", { class: "nav-group-title", text: "Also here" }));
      specials.forEach(addItem);
    }

    if (!any) nav.appendChild(h("div", { class: "nav-empty", text: "Nothing matches that." }));
  }

  /* ============================================================
     ROUTER
     ============================================================ */

  function go(id, replace) {
    if (location.hash.slice(1) !== id) {
      if (replace) history.replaceState(null, "", "#" + id);
      else location.hash = id;
      if (replace) render();
    } else {
      render();
    }
  }

  function parseHash() {
    var raw = location.hash.slice(1) || "";
    var parts = raw.split("/");
    var view = parts[0] || "cat:length";
    var params = parts.slice(1).reduce(function (acc, p) {
      var kv = p.split("=");
      if (kv.length === 2) acc[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
      return acc;
    }, {});
    return { view: view, params: params, raw: raw };
  }

  function render() {
    var r = parseHash();
    current = r.view;
    var view = $("#view");
    view.textContent = "";

    try {
      view.appendChild(buildView(r));
    } catch (e) {
      console.error(e);
      view.appendChild(h("div", { class: "card" },
        h("h2", { text: "Something broke" }),
        h("p", { class: "note", text: String(e && e.message || e) }),
        h("p", { class: "note" },
          "Details are in the browser console. ",
          h("a", { href: "#cat:length", text: "Back to a working page" }))));
    }

    renderNav($("#cat-filter").value);
    renderPalette();
  }

  function buildView(r) {
    if (r.view === "currency") return viewCurrency(r);
    if (r.view === "numeral") return viewNumeral(r);
    if (r.view === "color") return viewColor(r);
    if (r.view === "timezone") return viewTimezone(r);
    if (r.view === "paper") return viewPaper(r);
    if (r.view === "shoe") return viewShoe(r);
    if (r.view === "clothing") return viewClothing(r);
    if (r.view === "age") return viewAge(r);
    if (r.view === "image") return viewImage(r);
    if (r.view === "constants") return viewConstants(r);
    if (r.view.slice(0, 4) === "cat:") {
      var cat = getCategory(r.view.slice(4));
      if (cat) return viewCategory(cat, r);
    }
    return h("div", { class: "card" },
      h("h2", { text: "Unknown converter" }),
      h("p", { class: "note", text: "No converter called " + r.view }));
  }

  /* ============================================================
     SHARED BITS
     ============================================================ */

  function pageHead(title, sub, icon) {
    return h("div", { class: "page-head" },
      h("h1", {}, icon ? h("span", { "aria-hidden": "true", text: icon }) : null, title),
      sub ? h("p", { text: sub }) : null);
  }

  function unitOptions(cat, selected) {
    return Object.entries(cat.units).map(function (e) {
      var id = e[0], u = e[1];
      return h("option", { value: id, selected: id === selected || null },
        u.name + "  (" + u.symbol + ")");
    });
  }

  function table(head, rows) {
    return h("div", { class: "tbl-wrap" },
      h("table", { class: "tbl" },
        h("thead", {}, h("tr", {}, head.map(function (x) { return h("th", { text: x }); }))),
        h("tbody", {}, rows.map(function (cells) {
          return h("tr", {}, cells.map(function (c, i) {
            return h("td", { class: i > 0 ? "num" : "name" }, c);
          }));
        }))));
  }

  /* ============================================================
     UNIT CATEGORY VIEW
     ============================================================ */

  function viewCategory(cat, r) {
    var ids = Object.keys(cat.units);
    var st = state[cat.id] || (state[cat.id] = {
      from: r.params.from && cat.units[r.params.from] ? r.params.from : cat.base,
      to: r.params.to && cat.units[r.params.to] ? r.params.to : pickDefaultTo(cat, cat.base),
      a: r.params.a != null ? r.params.a : "1",
    });
    if (r.params.from && cat.units[r.params.from]) st.from = r.params.from;
    if (r.params.to && cat.units[r.params.to]) st.to = r.params.to;
    if (r.params.a != null) st.a = r.params.a;

    var guard = false;

    var inputA = h("input", { type: "text", inputmode: "decimal", value: st.a,
      "aria-label": "value to convert", spellcheck: "false" });
    var inputB = h("input", { type: "text", inputmode: "decimal",
      "aria-label": "converted value", spellcheck: "false", readonly: "readonly" });
    var selA = h("select", { "aria-label": "from unit" }, unitOptions(cat, st.from));
    var selB = h("select", { "aria-label": "to unit" }, unitOptions(cat, st.to));

    var fromUnit = h("span", { class: "unit-meta" });
    var toUnit = h("span", { class: "unit-meta" });
    var errBox = h("div", { class: "err", hidden: true });

    function update(source) {
      if (guard) return;
      guard = true;
      var raw = source === "b" ? inputB.value : inputA.value;
      var v = Number(String(raw).trim().replace(/,/g, ""));
      var from = source === "b" ? selB.value : selA.value;
      var to = source === "b" ? selA.value : selB.value;

      var bad = String(raw).trim() === "" || !Number.isFinite(v);
      inputA.classList.toggle("is-invalid", bad && source === "a");
      inputB.classList.toggle("is-invalid", bad && source === "b");
      errBox.hidden = !bad;

      if (bad) {
        if (source === "a") inputB.value = "";
        guard = false;
        return;
      }
      errBox.textContent = "That is not a number I can convert.";

      var out = convert(cat, v, from, to);
      if (source === "a") inputB.value = formatNumber(out, 12);
      else inputA.value = formatNumber(out, 12);

      st.from = selA.value; st.to = selB.value;
      if (source === "a") st.a = inputA.value; else st.a = inputA.value;
      syncMeta();
      writeHash();
      guard = false;
    }

    function syncMeta() {
      var fu = cat.units[selA.value], tu = cat.units[selB.value];
      var baseLabel = (cat.units[cat.base] || {}).name || cat.base;
      // the "1 base = x from-unit" line is only interesting when the from-unit
      // is not already the base; otherwise it just reads "1 Kelvin = 1 Kelvin"
      fromUnit.textContent = selA.value === cat.base ? "" :
        "1 " + baseLabel + " = " +
        formatNumber(convert(cat, 1, cat.base, selA.value), 8) + " " + fu.name;
      toUnit.textContent = "1 " + fu.name + " = " +
        formatNumber(convert(cat, 1, selA.value, selB.value), 12) + " " + tu.name;
    }

    function writeHash() {
      var id = "cat:" + cat.id + "/from=" + encodeURIComponent(selA.value) +
        "/to=" + encodeURIComponent(selB.value) + "/a=" + encodeURIComponent(inputA.value.trim());
      history.replaceState(null, "", "#" + id);
    }

    inputA.addEventListener("input", function () { update("a"); });
    inputB.addEventListener("input", function () { update("b"); });
    selA.addEventListener("change", function () { update("a"); });
    selB.addEventListener("change", function () { update("a"); });

    var container = h("div", {},
      pageHead(cat.label, cat.blurb || "", cat.icon),
      h("div", { class: "card" },
        h("div", { class: "conv" },
          h("div", { class: "conv-row" },
            h("div", { class: "field" }, inputA, fromUnit),
            h("div", { class: "field" }, selA)),
          h("div", { class: "swap" }, h("button", {
            type: "button", class: "btn", title: "Swap units",
            "aria-label": "Swap units",
            onclick: function () {
              var a = selA.value; selA.value = selB.value; selB.value = a;
              update("a");
            },
          }, "⇅")),
          h("div", { class: "conv-row" },
            h("div", { class: "field" }, inputB, toUnit),
            h("div", { class: "field" }, selB)),
          errBox,
          h("div", { class: "btn-row" },
            h("button", { type: "button", class: "btn", onclick: function () {
              copy(inputB.value, cat.label.toLowerCase() + " value");
            } }, "Copy result"),
            h("button", { type: "button", class: "btn", onclick: function () {
              inputA.value = "1"; update("a");
            } }, "Reset to 1"),
            h("a", { class: "btn btn-ghost", href: "#" + writeHashToString(), text: "Permalink" })))),
      referenceCard(cat));

    update("a");
    return container;
  }

  function writeHashToString() {
    return location.hash.slice(1);
  }

  function pickDefaultTo(cat, base) {
    // a friendly default pair: SI to the unit most people actually use
    var nice = {
      length: "foot", mass: "pound", area: "acre", volume: "gallon_us",
      time: "hour", speed: "kmh", energy: "kilocalorie", power: "horsepower",
      pressure: "psi", force: "poundforce", data: "gigabyte", datarate: "mbps",
      fuel: "mpg_us", temperature: "fahrenheit", frequency: "megahertz",
      angle: "radian", density: "gcm3", typography: "point_dtp",
      illumination: "footcandle", torque: "lbfft", volume_cooking: "cup",
    };
    return nice[cat.id] && cat.units[nice[cat.id]] ? nice[cat.id]
      : Object.keys(cat.units).find(function (k) { return k !== base; }) || base;
  }

  function referenceCard(cat) {
    var ids = Object.keys(cat.units);
    var baseUnit = cat.units[cat.base];
    var rows = ids.map(function (id) {
      return [cat.units[id].name + " (" + cat.units[id].symbol + ")",
              formatNumber(convert(cat, 1, cat.base, id), 10)];
    });
    return h("div", { class: "card" },
      h("div", { class: "card-title-row" },
        h("h2", { text: "1 " + (baseUnit ? baseUnit.name : cat.base) + " in every unit" }),
        h("span", { class: "copy-hint", text: ids.length + " units in this category" })),
      h("p", { class: "hint", text: "Everything routes through " +
        (baseUnit ? baseUnit.name : cat.base) + ", which is what keeps the table consistent." }),
      table(["Unit", "Value"], rows));
  }

  /* ============================================================
     CURRENCY
     ============================================================ */

  function viewCurrency(r) {
    var codes = Currency.codes();
    var st = state.currency || (state.currency = {
      from: r.params.from || "usd", to: r.params.to || "eur", amount: r.params.a || "100",
    });

    var inputA = h("input", { type: "text", inputmode: "decimal", value: st.amount, "aria-label": "amount" });
    var outBox = h("div", { class: "result-big" });
    var subBox = h("div", { class: "result-sub" });
    var selA = currencySelect(codes, st.from);
    var selB = currencySelect(codes, st.to);
    var info = h("div", { class: "note" });

    function update() {
      var v = Number(inputA.value.trim().replace(/,/g, ""));
      if (!Number.isFinite(v)) { outBox.textContent = "—"; return; }
      var out = Currency.convert(v, selA.value, selB.value);
      st.from = selA.value; st.to = selB.value; st.amount = inputA.value;
      outBox.textContent = Currency.format(out, selB.value);
      subBox.textContent = Currency.nameOf(selA.value) + " → " + Currency.nameOf(selB.value);
      var rate = Currency.convert(1, selA.value, selB.value);
      var one = Currency.nameOf(selA.value);
      info.textContent = "1 " + one + " = " + Currency.format(rate, selB.value) +
        (Currency.decimalsFor(selB.value) > 4 ? " (rate " + rate.toPrecision(6) + ")" : "");
      history.replaceState(null, "", "#currency/from=" + encodeURIComponent(selA.value) +
        "/to=" + encodeURIComponent(selB.value) + "/a=" + encodeURIComponent(inputA.value.trim()));
    }

    inputA.addEventListener("input", update);
    selA.addEventListener("change", update);
    selB.addEventListener("change", update);

    var node = h("div", {},
      pageHead("Currency", "Live exchange rates, refreshed from a public feed.", "💱"),
      h("div", { class: "card" },
        h("div", { class: "conv" },
          h("div", { class: "conv-row" },
            h("div", { class: "field" }, inputA, h("span", { class: "unit-meta", text: "amount" })),
            h("div", { class: "field" }, selA)),
          h("div", { class: "swap" }, h("button", {
            type: "button", class: "btn", "aria-label": "Swap currencies", title: "Swap",
            onclick: function () {
              var a = selA.value; selA.value = selB.value; selB.value = a; update();
            },
          }, "⇅")),
          h("div", { class: "conv-row" },
            h("div", { class: "field" }, outBox, subBox),
            h("div", { class: "field" }, selB)),
          h("div", { class: "btn-row" },
            h("button", { type: "button", class: "btn", onclick: function () {
              copy(outBox.textContent, "amount");
            } }, "Copy result"),
            h("button", { type: "button", class: "btn", onclick: function () {
              Currency.load().then(function () {
                // repopulate both selects in place so the page does not jump
                syncCodes();
                update();
              });
            } }, "Refresh rates"))),
        h("div", { class: "unit-meta", style: "margin-top:10px" }, info)),
      currencyStatusCard());

    update();
    return node;
  }

  function syncCodes() {
    var fresh = Currency.codes();
    document.querySelectorAll("#view select").forEach(function (sel) {
      var keep = sel.value;
      sel.textContent = "";
      fresh.forEach(function (c) {
        sel.appendChild(h("option", { value: c, selected: c === keep || null },
          c.toUpperCase() + " — " + Currency.nameOf(c)));
      });
      sel.value = keep;
    });
  }

  function currencySelect(codes, selected) {
    var sel = h("select", { "aria-label": "currency" });
    // note: appendChild takes ONE node -- passing the array silently adds only
    // the first option. Loop, or use .append().
    codes.forEach(function (c) {
      sel.appendChild(h("option", { value: c, selected: c === selected || null },
        c.toUpperCase() + " — " + Currency.nameOf(c)));
    });
    if (selected && !codes.includes(selected)) sel.value = sel.options[0].value;
    return sel;
  }

  function currencyStatusCard() {
    var s = Currency.state();
    var body = h("div", { class: "note" });
    body.textContent = s.loading
      ? "Fetching live rates…"
      : (s.live ? "Live rates from " : "Offline snapshot from ") + s.source +
        (s.date ? " · as of " + s.date : "");
    return h("div", { class: "card" },
      h("h2", { text: "Where these rates come from" }),
      h("p", { class: "hint", text: "Rates are fetched from a free public endpoint. " +
        "If that is unreachable the converter falls back to a bundled snapshot and says so, " +
        "rather than quietly showing stale numbers as if they were live." }),
      body,
      s.errors && s.errors.length
        ? h("div", { class: "err", style: "margin-top:10px", text: s.errors.join(" · ") })
        : null);
  }

  /* ============================================================
     NUMBER SYSTEMS
     ============================================================ */

  function viewNumeral(r) {
    var st = state.numeral || (state.numeral = {
      text: r.params.v != null ? r.params.v : "255",
      base: r.params.b ? Number(r.params.b) : 16,
    });

    var input = h("input", { type: "text", value: st.text, "aria-label": "value",
      spellcheck: "false", class: "mono" });
    var targetSel = h("select", { "aria-label": "target base" },
      [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,20,32,36].map(function (b) {
        return h("option", { value: b, selected: b === st.base || null },
          "Base " + b + (b === 2 ? " (binary)" : b === 8 ? " (octal)" : b === 10 ? " (decimal)" :
             b === 16 ? " (hex)" : b === 36 ? " (base36)" : ""));
      }));
    var out = h("div", { class: "result-big" });
    var err = h("div", { class: "err", hidden: true });

    function value() {
      var v = input.value.trim();
      if (!v) return NaN;
      try { return Numeral.valueOf(v); } catch (e) { return NaN; }
    }

    function update() {
      var v = value();
      st.text = input.value;
      if (!Number.isFinite(v)) {
        out.textContent = "—";
        err.hidden = false;
        err.textContent = "Could not read that as a number. Try 255, 0xFF, 0b1010, 1010, MMXXIV or 1T0101.";
        renderTable(null);
        return;
      }
      err.hidden = true;
      try {
        out.textContent = Numeral.fromNumber(v, st.base, 20);
      } catch (e) {
        out.textContent = "—";
      }
      renderTable(v);
      history.replaceState(null, "", "#numeral/v=" + encodeURIComponent(input.value) +
        "/b=" + st.base);
    }

    var tableBox = h("div", { class: "card" });
    function renderTable(v) {
      tableBox.textContent = "";
      if (v == null) return;
      var rows = [];
      function add(name, text) { rows.push([name, text]); }
      try { add("Binary (2)", Numeral.fromNumber(v, 2, 24)); } catch (e) {}
      try { add("Octal (8)", Numeral.fromNumber(v, 8, 20)); } catch (e) {}
      try { add("Decimal (10)", Numeral.fromNumber(v, 10, 20)); } catch (e) {}
      try { add("Hexadecimal (16)", Numeral.fromNumber(v, 16, 20).toUpperCase()); } catch (e) {}
      try { add("Base 32", Numeral.fromNumber(v, 32, 20)); } catch (e) {}
      try { add("Base 36", Numeral.fromNumber(v, 36, 20)); } catch (e) {}
      if (Number.isInteger(v) && Math.abs(v) <= 100000) {
        try { add("Roman", Numeral.toRoman(v)); } catch (e) {}
        try { add("Balanced ternary", Numeral.toBalancedTernary(v)); } catch (e) {}
      }
      if (Number.isInteger(v) && v >= 0 && v <= 200) {
        // a few hundred tick marks would stretch the table off-screen
        var unary = Numeral.toUnary(v);
        add("Unary", unary.length > 40 ? "(" + unary.length + " tick marks)"
                                     : (unary || "(empty)"));
      }
      if (/^-?[\d.]+$/.test(input.value.trim())) {
        try { add("Scientific", Number(v).toExponential(10)); } catch (e) {}
      }
      tableBox.appendChild(h("h2", { text: "The same value in other systems" }));
      tableBox.appendChild(table(["System", "Value"], rows));
      tableBox.appendChild(h("div", { class: "chip-row", style: "margin-top:12px" },
        h("button", { type: "button", class: "btn", onclick: function () {
          copy(out.textContent, "value");
        } }, "Copy result"),
        h("button", { type: "button", class: "btn", onclick: function () {
          input.value = "255"; update();
        } }, "Try 255")));
    }

    input.addEventListener("input", update);
    targetSel.addEventListener("change", function () {
      st.base = Number(targetSel.value);
      update();
    });

    var node = h("div", {},
      pageHead("Number systems", "Any base from 2 to 36, plus Roman, balanced ternary and unary.", "🔢"),
      h("div", { class: "card" },
        h("div", { class: "conv-row" },
          h("div", { class: "field" }, input,
            h("span", { class: "unit-meta", text: "auto-detects 0x, 0b, 0o, Roman, balanced ternary" })),
          h("div", { class: "field" }, targetSel)),
        err,
        h("div", { class: "card", style: "margin-top:14px" }, out),
        h("p", { class: "note", style: "margin-top:12px" },
          "Fractional values are carried as exact fractions rather than floats, so ",
          h("code", { text: "0.1" }), " really is ",
          h("code", { text: "0.0001100110011…₂" }),
          " and not an approximation that drifts.")),
      tableBox,
      encodingCard(input, update));

    update();
    return node;
  }

  function encodingCard(input, onChange) {
    var out = h("div", { class: "tbl-wrap" });
    function update() {
      out.textContent = "";
      var s = input.value;
      var rows = [];
      if (s) {
        try {
          var bytes = Numeral.textToBytes(s);
          rows.push(["UTF-8 bytes", bytes.length + " — " + Numeral.bytesToHex(bytes)]);
          rows.push(["Base64", Numeral.base64Encode(s)]);
          rows.push(["Decimal char codes", Array.from(s).map(function (ch) {
            return ch.codePointAt(0);
          }).join(" ")]);
        } catch (e) {
          rows.push(["error", e.message]);
        }
      }
      out.appendChild(table(["Text encoding", "Result"], rows.length ? rows : [["—", "type something above"]]));
    }
    update();
    return h("div", { class: "card" },
      h("h2", { text: "If that text is actually text" }),
      h("p", { class: "hint", text: "Character codes and byte encodings of whatever is in the box above." }),
      out);
  }

  /* ============================================================
     COLOUR
     ============================================================ */

  function viewColor(r) {
    var st = state.color || (state.color = { value: r.params.v || "#2f6df6" });
    var input = h("input", { type: "text", value: st.value, "aria-label": "colour",
      spellcheck: "false", style: "font-family:var(--mono)" });
    var swatch = h("div", { class: "swatch" });
    var models = h("div", { class: "grid-3" });
    var extras = h("div", {});
    var swatches = h("div", { class: "chip-row" });

    function update() {
      var c = Color.parse(input.value);
      st.value = input.value;
      models.textContent = "";
      extras.textContent = "";
      if (!c) {
        swatch.style.background = "var(--panel-2)";
        swatch.textContent = "unrecognised";
        models.appendChild(h("div", { class: "stat" },
          h("div", { class: "k", text: "error" }),
          h("div", { class: "v sm", text: "Not a colour I recognise" })));
        return;
      }
      var hex = Color.toHex(c);
      swatch.style.background = hex;
      swatch.style.color = Color.luminance(c) > 0.4 ? "#000" : "#fff";
      swatch.textContent = hex;

      function stat(k, v, copyable) {
        var d = h("div", { class: "stat" },
          h("div", { class: "k", text: k }),
          h("div", { class: "v", text: v }));
        if (copyable) {
          d.style.cursor = "pointer";
          d.title = "Click to copy";
          d.addEventListener("click", function () { copy(String(v), k.toLowerCase()); });
        }
        return d;
      }

      models.appendChild(stat("Hex", hex, true));
      models.appendChild(stat("RGB", Color.toRgbString(c), true));
      models.appendChild(stat("HSL", Color.toHslString(c), true));
      var hsv = Color.toHsv(c);
      models.appendChild(stat("HSV", "hsv(" + Math.round(hsv.h) + ", " +
        Math.round(hsv.s) + "%, " + Math.round(hsv.v) + "%)", true));
      models.appendChild(stat("CMYK", Color.toCmykString(c), true));
      models.appendChild(stat("Decimal", String(Color.toInt(c)), true));

      var near = Color.nearestName(c);
      if (near) {
        extras.appendChild(h("div", { class: "stat", style: "margin-bottom:10px" },
          h("div", { class: "k", text: "Closest CSS colour name" }),
          h("div", { class: "v", text: near })));
      }

      extras.appendChild(h("div", { class: "stat", style: "margin-bottom:10px" },
        h("div", { class: "k", text: "WCAG contrast" }),
        h("div", { class: "v", text: Color.contrast(c, "#ffffff").toFixed(2) + " : 1 vs white" }),
        h("div", { class: "v sm", text: Color.contrast(c, "#000000").toFixed(2) + " : 1 vs black" })));

      var harm = Color.harmonies(c);
      extras.appendChild(h("div", { class: "harmony" },
        h("div", { style: "background:" + harm.complementary,
                   onclick: function () { input.value = harm.complementary; update(); } }),
        harm.triadic.map(function (t) {
          return h("div", { style: "background:" + t, title: t,
            onclick: function () { input.value = t; update(); } });
        }),
        harm.analogous.slice(1).map(function (t) {
          return h("div", { style: "background:" + t, title: t,
            onclick: function () { input.value = t; update(); } });
        })));

      extras.appendChild(h("div", { class: "chip-row", style: "margin-top:12px" },
        h("button", { type: "button", class: "btn", onclick: function () {
          input.value = Color.shade(c, -18); update();
        } }, "Darker"),
        h("button", { type: "button", class: "btn", onclick: function () {
          input.value = Color.shade(c, 18); update();
        } }, "Lighter"),
        h("button", { type: "button", class: "btn", onclick: function () {
          input.value = harm.complementary; update();
        } }, "Complement")));

      renderSwatches();
      history.replaceState(null, "", "#color/v=" + encodeURIComponent(input.value));
    }

    function renderSwatches() {
      swatches.textContent = "";
      var names = Color.allNames();
      var sample = names.filter(function (_, i) { return i % 9 === 0; });
      sample.slice(0, 40).forEach(function (n) {
        var rgb = Color.parse(n);
        swatches.appendChild(h("button", {
          type: "button", class: "chip", style: "cursor:pointer",
          onclick: function () { input.value = n; update(); },
        }, h("span", { style: "width:12px;height:12px;border-radius:3px;display:inline-block;background:" + Color.toHex(rgb) }),
          n));
      });
    }

    input.addEventListener("input", update);

    var node = h("div", {},
      pageHead("Colour", "Hex, RGB, HSL, HSV, CMYK and all 148 CSS colour names.", "🎨"),
      h("div", { class: "card" },
        h("div", { class: "conv-row" },
          h("div", { class: "field" }, input,
            h("span", { class: "unit-meta", text: "#2f6df6, rgb(0,128,255), hsl(216,100%,50%) or a name" })),
          h("div", { class: "field" }, h("div", { class: "chip", text: "click any value to copy" }))),
        h("div", { style: "margin-top:14px" }, swatch),
        h("div", { class: "grid-3", style: "margin-top:14px" }, models)),
      h("div", { class: "card" },
        h("h2", { text: "Derived" }), extras),
      h("div", { class: "card" },
        h("h2", { text: "Some named colours" }),
        h("p", { class: "hint", text: "Click one to load it." }),
        swatches));

    update();
    return node;
  }

  /* ============================================================
     TIME ZONES
     ============================================================ */

  function viewTimezone(r) {
    var now = new Date();
    var rows = Extras.zones.map(function (z) {
      return [Extras.zoneLabel(z),
              fmtOffset(Extras.zoneOffset(now, z)),
              Extras.timeInZone(now, z) || "—",
              Extras.dayInZone(now, z) || "—"];
    });

    var fromSel = h("select", { "aria-label": "from time zone" },
      Extras.zones.map(function (z) {
        return h("option", { value: z, selected: z === "UTC" || null }, Extras.zoneLabel(z) + " — " + z);
      }));
    var toSel = h("select", { "aria-label": "to time zone" },
      Extras.zones.map(function (z) {
        return h("option", { value: z, selected: z === "America/New_York" || null },
          Extras.zoneLabel(z) + " — " + z);
      }));
    var timeInput = h("input", { type: "text", value: Extras.timeInZone(now, "UTC"), "aria-label": "time in source zone" });
    var out = h("div", { class: "result-big" });
    var sub = h("div", { class: "result-sub" });

    function update() {
      var t = timeInput.value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!t) { out.textContent = "—"; sub.textContent = "Use HH:MM"; return; }
      var d = new Date();
      var hh = Number(t[1]), mm = Number(t[2]), ss = t[3] ? Number(t[3]) : 0;
      if (hh > 23 || mm > 59) { out.textContent = "—"; sub.textContent = "Time is out of range"; return; }
      d.setUTCHours(hh, mm, ss, 0);
      var conv = Extras.convertTime(d, fromSel.value, toSel.value);
      out.textContent = conv ? conv.time : "—";
      sub.textContent = conv
        ? Extras.dayInZone(new Date(), toSel.value) + " in " + Extras.zoneLabel(toSel.value) +
          " · " + Extras.timeInZone(now, fromSel.value) + " is the same as " +
          fmtOffset(conv.offset) + " there"
        : "";
      history.replaceState(null, "", "#timezone");
    }
    [fromSel, toSel, timeInput].forEach(function (e) { e.addEventListener("input", update); });
    update();

    return h("div", {},
      pageHead("Time zones", "The same instant, seen from every major zone.", "🌍"),
      h("div", { class: "card" },
        h("h2", { text: "Convert a wall-clock time between zones" }),
        h("div", { class: "grid-3" },
          h("div", { class: "field" }, h("label", { text: "Time (in the left zone)" }), timeInput),
          h("div", { class: "field" }, h("label", { text: "From" }), fromSel),
          h("div", { class: "field" }, h("label", { text: "To" }), toSel)),
        h("div", { class: "card", style: "margin-top:12px" }, out, sub)),
      h("div", { class: "card" },
        h("div", { class: "card-title-row" },
          h("h2", { text: "World clock" }),
          h("span", { class: "copy-hint", text: "right now" })),
        h("div", { class: "scroll-y" },
          table(["Zone", "UTC offset", "Local time", "Date"], rows))));
  }

  function fmtOffset(o) {
    if (o == null) return "—";
    return (o >= 0 ? "+" : "−") + Math.abs(o).toFixed(o % 1 === 0 ? 0 : 1);
  }

  /* ============================================================
     PAPER
     ============================================================ */

  function viewPaper() {
    var papers = Extras.paperSizes();
    var rows = papers.map(function (p) {
      return [p.name,
              p.w + " × " + p.h + " mm",
              (p.wIn.toFixed(2) + " × " + p.hIn.toFixed(2) + " in").trim(),
              p.areaCm2.toFixed(0) + " cm²",
              p.ratio];
    });

    var aSel = h("select", {}, papers.map(function (p) {
      return h("option", { value: p.name, selected: p.name === "A4" || null }, p.name);
    }));
    var bSel = h("select", {}, papers.map(function (p) {
      return h("option", { value: p.name, selected: p.name === "A3" || null }, p.name);
    }));
    var out = h("div", { class: "result-big" });
    var dpi = h("input", { type: "number", value: "300", min: "1", max: "4800" });
    var pxOut = h("div", { class: "result-sub" });

    function update() {
      var ratio = Extras.paperRatio(aSel.value, bSel.value);
      out.textContent = Number.isFinite(ratio) ? ratio.toFixed(ratio < 10 ? 4 : 2) + " ×" : "—";
      var p = Extras.paperToPixels(aSel.value, Number(dpi.value) || 300);
      pxOut.textContent = p ? aSel.value + " at " + dpi.value + " dpi = " + p.w + " × " + p.h + " px" : "";
    }
    [aSel, bSel, dpi].forEach(function (e) { e.addEventListener("input", update); });
    update();

    return h("div", {},
      pageHead("Paper sizes", "ISO A and B, North American, envelopes and historical sheet sizes.", "📄"),
      h("div", { class: "card" },
        h("h2", { text: "How many fit on one sheet" }),
        h("div", { class: "grid-3" },
          h("div", { class: "field" }, h("label", { text: "Small sheet" }), aSel),
          h("div", { class: "field" }, h("label", { text: "Large sheet" }), bSel),
          h("div", { class: "field" }, h("label", { text: "Print DPI" }), dpi)),
        h("div", { class: "card", style: "margin-top:12px" }, out, pxOut),
        h("p", { class: "note", style: "margin-top:10px" },
          "Area ratio, not a fit count — the “×” is how many areas, so a true ",
          "floor-and-trim fit needs the specific dimensions.")),
      h("div", { class: "card" },
        h("h2", { text: "All sizes" }),
        h("div", { class: "scroll-y" },
          table(["Name", "mm", "inches", "Area", "Ratio"], rows))));
  }

  /* ============================================================
     SHOE SIZES
     ============================================================ */

  function viewShoe() {
    var st = state.shoe || (state.shoe = { gender: "men" });

    function body() {
      var rows = Extras.shoeSizes(st.gender).map(function (s) {
        return [s.eu, s.uk, s.us, s.footMm + " mm", s.footIn + " in"];
      });
      var fromSel = h("select", {}, ["eu", "uk", "us"].map(function (k) {
        return h("option", { value: k, selected: k === "eu" || null }, k.toUpperCase());
      }));
      var toSel = h("select", {}, ["uk", "us", "eu", "footMm"].map(function (k) {
        return h("option", { value: k, selected: k === "uk" || null },
          k === "footMm" ? "Foot length (mm)" : k.toUpperCase());
      }));
      var val = h("input", { type: "number", value: "42", step: "0.5" });
      var out = h("div", { class: "result-big" });
      function update() {
        out.textContent = Extras.convertShoe(st.gender, Number(val.value), fromSel.value, toSel.value);
      }
      [fromSel, toSel, val].forEach(function (e) { e.addEventListener("input", update); });
      update();

      return h("div", {},
        h("div", { class: "btn-row" },
          h("button", { type: "button", class: "btn btn-primary", onclick: function () {
            st.gender = "men"; render();
          } }, "Men"),
          h("button", { type: "button", class: "btn", onclick: function () {
            st.gender = "women"; render();
          } }, "Women")),
        h("div", { class: "card", style: "margin-top:12px" },
          h("h2", { text: "Size converter" }),
          h("div", { class: "grid-3" },
            h("div", { class: "field" }, h("label", { text: "From" }), fromSel),
            h("div", { class: "field" }, h("label", { text: "Size" }), val),
            h("div", { class: "field" }, h("label", { text: "To" }), toSel)),
          h("div", { class: "card", style: "margin-top:12px" }, out),
          h("p", { class: "note", style: "margin-top:10px" },
            "EU is used as the pivot because it is the most linear of the three. ",
            "Foot length follows the Paris point and is approximate — real sizing ",
            "charts vary by maker and by country.")),
        h("div", { class: "scroll-y" },
          table(["EU", "UK", "US", "Foot (mm)", "Foot (in)"], rows)));
    }

    return h("div", {},
      pageHead("Shoe sizes", "EU, UK and US, men and women.", "👟"),
      h("div", { class: "card" }, body()));
  }

  /* ============================================================
     CLOTHING
     ============================================================ */

  function viewClothing() {
    var shirtRows = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map(function (l) {
      var s = Extras.shirtSize(l);
      return [l, s.neckIn + " in", s.neckCm + " cm",
              s.chestIn + " in", Math.round(s.chestCm) + " cm"];
    });

    var waist = h("input", { type: "number", value: "32", step: "0.5" });
    var waistOut = h("div", { class: "grid-2" });
    function updateWaist() {
      var s = Extras.waistToSize(Number(waist.value) || 0);
      waistOut.textContent = "";
      [["Waist (in)", s.inches], ["Waist (cm)", s.cm + " cm"],
       ["UK", s.uk], ["US", s.us], ["EU", s.eu]].forEach(function (p) {
        waistOut.appendChild(h("div", { class: "stat" },
          h("div", { class: "k", text: p[0] }),
          h("div", { class: "v", text: String(p[1]) })));
      });
    }
    waist.addEventListener("input", updateWaist);
    updateWaist();

    return h("div", {},
      pageHead("Clothing sizes", "Shirts by collar size, trousers by waist.", "👕"),
      h("div", { class: "card" },
        h("h2", { text: "Trouser / waist sizing" }),
        h("div", { class: "field" }, h("label", { text: "Waist in inches" }), waist),
        h("div", { class: "grid-2", style: "margin-top:12px" }, waistOut),
        h("p", { class: "note", style: "margin-top:10px" },
          "UK and US both quote a waist in inches, so EU is a straight +16 approximation. ",
          "It lines up with common charts (28→44, 32→48, 36→52) but is not a standard.")),
      h("div", { class: "card" },
        h("h2", { text: "Shirts by collar" }),
        table(["Size", "Collar", "Collar (cm)", "Chest", "Chest (cm)"], shirtRows)));
  }

  /* ============================================================
     DATE & AGE
     ============================================================ */

  function viewAge() {
    var birth = h("input", { type: "date", value: "2000-01-15" });
    var ref = h("input", { type: "date" });
    var out = h("div", { class: "grid-2" });
    var extra = h("div", { class: "chip-row", style: "margin-top:12px" });

    function update() {
      out.textContent = "";
      extra.textContent = "";
      var b = Extras.parseDate(birth.value);
      var r = ref.value ? Extras.parseDate(ref.value) : new Date();
      if (!b) { out.appendChild(h("div", { class: "err", text: "Pick a valid birth date" })); return; }
      if (r < b) { out.appendChild(h("div", { class: "err", text: "The reference date is before the birth date" })); return; }
      var a = Extras.ageBetween(b, r);
      function stat(k, v) {
        return h("div", { class: "stat" },
          h("div", { class: "k", text: k }),
          h("div", { class: "v", text: String(v) }));
      }
      out.appendChild(stat("Age", a.years + " years"));
      out.appendChild(stat("Precisely", a.years + "y " + a.months + "m " + a.days + "d"));
      out.appendChild(stat("Total months", a.totalMonths.toLocaleString()));
      out.appendChild(stat("Total weeks", a.totalWeeks.toLocaleString()));
      out.appendChild(stat("Total days", a.totalDays.toLocaleString()));
      out.appendChild(stat("Total hours", a.totalHours.toLocaleString()));
      out.appendChild(stat("Total minutes", a.totalMinutes.toLocaleString()));
      out.appendChild(stat("Leap days lived", a.leapDays));
      out.appendChild(stat("In decades", a.decades.toFixed(3)));
      out.appendChild(stat("Earth days", a.inDaysOfEarth.toFixed(2)));
      out.appendChild(stat("In seconds", a.totalSeconds.toLocaleString()));
      var ago = Extras.timeSince(b, r);
      if (ago) {
        extra.appendChild(h("span", { class: "chip", text: "That was " + ago.value + " " + ago.unit + " ago" }));
      }
    }
    [birth, ref].forEach(function (e) { e.addEventListener("input", update); });
    update();

    return h("div", {},
      pageHead("Date & age", "Exactly how old, in more units than you asked for.", "🎂"),
      h("div", { class: "card" },
        h("div", { class: "grid-2" },
          h("div", { class: "field" }, h("label", { text: "Born" }), birth),
          h("div", { class: "field" }, h("label", { text: "Measured on (blank = today)" }), ref)),
        h("div", { style: "margin-top:14px" }, out), extra));
  }

  /* ============================================================
     IMAGE RESOLUTION
     ============================================================ */

  function viewImage(r) {
    var st = state.image || (state.image = {
      w: r.params.w || "3840", h: r.params.h || "2160", dpi: r.params.dpi || "300",
    });
    var wIn = h("input", { type: "number", value: st.w, min: "1" });
    var hIn = h("input", { type: "number", value: st.h, min: "1" });
    var dpiIn = h("input", { type: "number", value: st.dpi, min: "1", max: "4800" });
    var out = h("div", { class: "grid-2" });
    var presets = h("div", { class: "chip-row", style: "margin-top:12px" });

    var PRESETS = [
      ["4K UHD", 3840, 2160], ["1080p", 1920, 1080], ["1440p", 2560, 1440],
      ["8K", 7680, 4320], ["iPhone", 4032, 3024], ["A4 @300dpi", 2480, 3508],
      ["Instagram", 1080, 1080], ["HD", 1280, 720],
    ];
    PRESETS.forEach(function (p) {
      presets.appendChild(h("button", { type: "button", class: "btn", onclick: function () {
        wIn.value = p[1]; hIn.value = p[2]; update();
      } }, p[0]));
    });

    function update() {
      var w = Number(wIn.value), hh = Number(hIn.value), dpi = Number(dpiIn.value) || 300;
      out.textContent = "";
      if (!w || !hh) return;
      function stat(k, v) {
        return h("div", { class: "stat" },
          h("div", { class: "k", text: k }),
          h("div", { class: "v", text: String(v) }));
      }
      var mp = Extras.megapixels(w, hh);
      var asp = Extras.aspect(w, hh);
      var raw = Math.round(mp * 1e6 * 3 / 8 / 1024);
      var png = Math.round(mp * 1e6 * 3 / 8 / 1024 * 0.55);
      out.appendChild(stat("Resolution", w + " × " + hh));
      out.appendChild(stat("Megapixels", mp.toFixed(2)));
      out.appendChild(stat("Total pixels", (w * hh).toLocaleString()));
      out.appendChild(stat("Aspect ratio", asp.reduced + "  (" + asp.ratio.toFixed(3) + ":1)"));
      out.appendChild(stat("Print size at " + dpi + " dpi",
        Extras.pixelsToPrint(w, dpi).toFixed(1) + " × " + Extras.pixelsToPrint(hh, dpi).toFixed(1) + " mm"));
      out.appendChild(stat("Print size at " + dpi + " dpi",
        (w / dpi).toFixed(1) + " × " + (hh / dpi).toFixed(1) + " in"));
      out.appendChild(stat("Uncompressed RGB", raw.toLocaleString() + " KB"));
      out.appendChild(stat("Typical PNG", png.toLocaleString() + " KB"));
      out.appendChild(stat("At 1080p wide", Extras.scaleTo(w, hh, 1920).height + " px tall"));
      out.appendChild(stat("At 720p wide", Extras.scaleTo(w, hh, 1280).height + " px tall"));
      state.image = { w: wIn.value, h: hIn.value, dpi: dpiIn.value };
      history.replaceState(null, "", "#image/w=" + w + "/h=" + hh + "/dpi=" + dpi);
    }
    [wIn, hIn, dpiIn].forEach(function (e) { e.addEventListener("input", update); });
    update();

    return h("div", {},
      pageHead("Image resolution", "Pixels, megapixels and what that means on paper.", "🖼️"),
      h("div", { class: "card" },
        h("div", { class: "grid-3" },
          h("div", { class: "field" }, h("label", { text: "Width (px)" }), wIn),
          h("div", { class: "field" }, h("label", { text: "Height (px)" }), hIn),
          h("div", { class: "field" }, h("label", { text: "DPI" }), dpiIn)),
        presets,
        h("div", { class: "grid-2", style: "margin-top:14px" }, out),
        h("p", { class: "note", style: "margin-top:10px" },
          "File sizes are estimates for 8-bit RGB with no compression and with typical ",
          "PNG compression; real encoders vary a lot.")));
  }

  /* ============================================================
     CONSTANTS
     ============================================================ */

  function viewConstants() {
    var filter = h("input", { type: "search", placeholder: "Filter constants…",
      "aria-label": "filter constants", spellcheck: "false" });
    var box = h("div", { class: "scroll-y" });
    function render() {
      var q = filter.value.trim().toLowerCase();
      var rows = Extras.constants().filter(function (c) {
        return !q || (c.name + " " + c.sym + " " + c.unit).toLowerCase().includes(q);
      }).map(function (c) {
        return [c.name + "  (" + c.sym + ")",
                formatNumber(c.value, 10),
                c.unit || "—",
                c.note || ""];
      });
      box.textContent = "";
      box.appendChild(rows.length
        ? table(["Constant", "Value", "Unit", "Note"], rows)
        : h("div", { class: "nav-empty", text: "No constant matches that." }));
    }
    filter.addEventListener("input", render);
    render();

    return h("div", {},
      pageHead("Physics constants", "SI defining constants and a few famous ones besides.", "⚛️"),
      h("div", { class: "card" },
        h("div", { class: "field" }, filter),
        h("div", { style: "margin-top:12px" }, box)),
      h("div", { class: "card" },
        h("h2", { text: "Worth knowing" }),
        h("p", { class: "note" },
          "Since 2019 the SI is defined by seven exact constants: c, h, e, k, Nₐ, and two ",
          "more involving caesium and the metre. Everything else in this table is a ",
          "measurement, and its uncertainty is not shown because it varies by many ",
          "digits. “Exact by definition” does not mean known to more precision — ",
          "c is exactly 299792458 m/s and that is all it means.")));
  }

  /* ============================================================
     COMMAND PALETTE
     ============================================================ */

  var paletteItems = [];

  function renderPalette() {
    paletteItems = buildPalette($("#palette-input").value);
    paintPalette();
  }

  function buildPalette(q) {
    q = q.trim().toLowerCase();
    var items = [];
    function push(view, label, sub, icon) { items.push({ view: view, label: label, sub: sub, icon: icon }); }

    for (var cat of CATEGORY_LIST) {
      if (!q || cat.label.toLowerCase().includes(q)) {
        push("cat:" + cat.id, cat.label, Object.keys(cat.units).length + " units", cat.icon);
      }
      for (var [uid, u] of Object.entries(cat.units)) {
        var hay = (uid + " " + u.name + " " + u.symbol + " " + (u.aliases || []).join(" ")).toLowerCase();
        if (q && hay.includes(q)) {
          push("cat:" + cat.id + "/from=" + cat.base + "/to=" + uid + "/a=1",
               cat.label + " · " + u.name, u.symbol, cat.icon);
        }
      }
    }
    for (var s of SPECIAL) {
      if (!q || s.label.toLowerCase().includes(q)) push(s.id, s.label, "", s.icon);
    }
    if (Currency.state().rates) {
      for (var c of Currency.codes()) {
        if (q && (c + " " + Currency.nameOf(c)).toLowerCase().includes(q)) {
          push("currency/from=" + c + "/to=usd/a=1",
               c.toUpperCase() + " — " + Currency.nameOf(c), "currency", "💱");
        }
      }
    }
    if (q) {
      for (var cn of Color.allNames()) {
        if (cn.includes(q)) push("color/v=" + cn, cn, "colour", "🎨");
      }
    }
    return items.slice(0, 120);
  }

  function highlight(text, q) {
    var i = text.toLowerCase().indexOf(q.trim().toLowerCase());
    if (i < 0 || !q.trim()) return document.createTextNode(text);
    var frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(text.slice(0, i)));
    frag.appendChild(h("mark", { text: text.slice(i, i + q.trim().length) }));
    frag.appendChild(document.createTextNode(text.slice(i + q.trim().length)));
    return frag;
  }

  var palIndex = 0;
  function paintPalette() {
    var ul = $("#palette-results");
    ul.textContent = "";
    var q = $("#palette-input").value;
    if (!paletteItems.length) {
      ul.appendChild(h("li", { class: "palette-empty", text: "Nothing found." }));
      return;
    }
    paletteItems.forEach(function (it, i) {
      var li = h("li", {
        role: "option",
        "aria-selected": i === palIndex ? "true" : "false",
        onmouseenter: function () { palIndex = i; paintPalette(); },
        onclick: function () { openPaletteItem(it); },
      }, h("span", { class: "ico", text: it.icon || "" }),
         h("span", {}, highlight(it.label, q)),
         it.sub ? h("span", { class: "sub", text: it.sub }) : null);
      ul.appendChild(li);
    });
    var sel = ul.children[palIndex];
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }

  function openPaletteItem(it) {
    closePalette();
    go(it.view);
  }

  var paletteReturnFocus = null;

  function openPalette() {
    paletteReturnFocus = document.activeElement;
    var p = $("#palette");
    p.hidden = false;
    var input = $("#palette-input");
    input.value = "";
    palIndex = 0;
    renderPalette();
    input.focus();
  }

  /* Closing has to hand focus back. Without this, focus stays parked on the
     now-hidden palette input, which silently swallows every later keyboard
     shortcut (including "/") because they all ignore INPUT elements. */
  function closePalette() {
    var p = $("#palette");
    if (p.hidden) return;
    p.hidden = true;
    var back = paletteReturnFocus;
    paletteReturnFocus = null;
    if (back && back.focus && back !== document.body && back.isConnected) {
      back.focus();
    } else {
      var view = $("#view");
      if (view && view.focus) view.focus();
    }
  }

  /* ============================================================
     BOOT
     ============================================================ */

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("uc-theme"); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  }

  function boot() {
    initTheme();

    $("#theme-btn").addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("uc-theme", next); } catch (e) {}
    });

    $("#cat-filter").addEventListener("input", function () { renderNav(this.value); });
    $("#palette-btn").addEventListener("click", openPalette);
    $("#palette-input").addEventListener("input", function () { palIndex = 0; renderPalette(); });
    $("#palette").addEventListener("click", function (e) {
      if (e.target === this) closePalette();
    });

    document.addEventListener("keydown", function (e) {
      var inPalette = !$("#palette").hidden;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inPalette ? closePalette() : openPalette();
        return;
      }
      if (e.key === "/" && !inPalette && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault();
        $("#cat-filter").focus();
        return;
      }
      if (!inPalette) return;
      if (e.key === "Escape") { closePalette(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); palIndex = Math.min(palIndex + 1, paletteItems.length - 1); paintPalette(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); palIndex = Math.max(palIndex - 1, 0); paintPalette(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (paletteItems[palIndex]) openPaletteItem(paletteItems[palIndex]);
      }
    });

    window.addEventListener("hashchange", render);

    // seed from the bundled snapshot so nothing is ever empty, then go live
    Currency.initFromSnapshot();
    render();

    function setBadge() {
      var s = Currency.state();
      var b = $("#rates-badge");
      if (s.loading) { b.hidden = false; b.className = "badge"; b.textContent = "rates…"; return; }
      b.hidden = false;
      b.className = "badge" + (s.live ? "" : " is-stale");
      b.textContent = s.live
        ? "rates " + (s.date || "live")
        : "offline snapshot";
      b.title = s.live
        ? "Live rates from " + s.source
        : "Offline snapshot from " + s.source + " — live fetch failed. " + (s.errors || []).join(" · ");
    }
    setBadge();
    Currency.onChange(function () {
      setBadge();
      // keep an open currency view honest about which rates it is showing
      if (current === "currency") render();
    });
    Currency.load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();