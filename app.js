/* ============================================================
   Depreciation Calculator

   Prices come from vehicles.js (PRICE_BOOK), the only place they
   live. The model dropdown is built from that list, so adding a
   car there makes it selectable here with no code change.

   The maths is reverse engineered from, and verified cell by cell
   against, the two source workbooks:
     Depreciation Benefits(Tax Benefit Working M9).csv
     Depreciation Benefits(Tax Benefit Working Cyberster).csv

   Deliberate departures from those workbooks:
     Written down value compounds (the header's "c = a*b" is wrong).
     Tax relief is charged on the year's depreciation, not the WDV.
     Relief accumulates over the years held.
     M9's year 4 tax benefit (a hardcoded 4,85,572) and its year 5
     tax rate (34% inside a 30% block) are corrected.

   runSelfCheck() re-asserts all of that on load and warns in the
   console if it ever drifts.
   ============================================================ */

'use strict';

const YEARS = 5;

const DEFAULTS = {
  discount: 0,
  rate: '0.40',
  years: '3',
  halfYear: false,
  taxRate: 34.944,
  balCharge: false
};

/* Formatting */

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const money = v => (v < 0 ? '−' : '') + '₹' + inr.format(Math.abs(Math.round(v)));

const pct  = (v, dp = 1) => (v * 100).toFixed(dp).replace(/\.0+$/, '') + '%';
const pct0 = v => Math.round(v * 100) + '%';
const yrs  = n => n + (n === 1 ? ' year' : ' years');
const $ = sel => document.querySelector(sel);

/* Calculation */

/**
 * Reducing balance depreciation schedule.
 * cfg: { cost, rate, halfYear, taxRate }
 */
function schedule(cfg) {
  const rows = [];
  let opening = cfg.cost, cumDep = 0, cumTax = 0;

  for (let n = 1; n <= YEARS; n++) {
    const rate = (n === 1 && cfg.halfYear) ? cfg.rate / 2 : cfg.rate;
    const dep  = opening * rate;      // depreciation charged this year
    const wdv  = opening - dep;       // written down value carried forward
    const tax  = dep * cfg.taxRate;   // tax saved by claiming it
    cumDep += dep;
    cumTax += tax;

    rows.push({ n, rate, opening, dep, wdv, tax, cumDep, cumTax });
    opening = wdv;
  }
  return rows;
}

/** Figures for the year the car is sold. */
function result(cfg) {
  const rows = schedule(cfg);
  const r = rows[cfg.years - 1];

  const resale = cfg.resalePct * cfg.cost;
  const gain   = resale - r.wdv;                            // sale above written down value
  const charge = cfg.balCharge && gain > 0 ? gain * cfg.taxRate : 0;

  // Paid, less tax relief, less what it sells for, plus any tax on the gain.
  const netCost = cfg.cost - r.cumTax - resale + charge;

  return {
    rows,
    depClaimed: r.cumDep,
    taxSaved:   r.cumTax,
    wdv:        r.wdv,
    resale, gain, charge, netCost,
    netPct: cfg.cost ? netCost / cfg.cost : 0
  };
}

/* Reading the form */

const vehicle = () => PRICE_BOOK.vehicles.find(v => v.key === $('#model').value)
                   || PRICE_BOOK.vehicles[0];

function num(id, fallback) {
  const v = parseFloat($('#' + id).value);
  return Number.isFinite(v) ? v : fallback;
}

function readForm() {
  const v = vehicle();
  const years = parseInt($('#years').value, 10);
  const discPct = Math.min(Math.max(num('discount', 0), 0), 100) / 100;
  const discount = Math.round(v.exShowroom * discPct);

  return {
    vehicle: v,
    price: v.exShowroom,
    discPct,
    discount,
    cost: v.exShowroom - discount,
    rate: parseFloat($('#rate').value),
    years,
    halfYear: $('#halfYear').checked,
    taxRate: num('taxRate', DEFAULTS.taxRate) / 100,
    resalePct: num('resale', v.resaleLadder[years - 1]) / 100,
    balCharge: $('#balCharge').checked
  };
}

/* Rendering */

function render() {
  const cfg = readForm();
  const out = result(cfg);
  const { years } = cfg;

  $('#priceNote').innerHTML  = `<b>${money(cfg.price)}</b> ex showroom`;
  $('#costNote').innerHTML   = cfg.discount
    ? `${money(cfg.discount)} off. Capitalised <b>${money(cfg.cost)}</b>`
    : `Capitalised <b>${money(cfg.cost)}</b>`;
  $('#resaleNote').innerHTML = `<b>${money(out.resale)}</b> in year ${years}`;

  $('#heroLbl').textContent = `Tax saved over ${yrs(years)}`;
  $('#heroVal').textContent = money(out.taxSaved);
  $('#heroSub').innerHTML   =
    `on ${money(out.depClaimed)} of depreciation at ${pct(cfg.taxRate, 3)}`;

  const shareOfCost = v => pct0(cfg.cost ? v / cfg.cost : 0);
  const cells = [
    ['Depreciation claimed', money(out.depClaimed), `${shareOfCost(out.depClaimed)} of cost`],
    ['Written down value',   money(out.wdv),       `${shareOfCost(out.wdv)} of cost`],
    ['Resale value',         money(out.resale),
      `${money(Math.abs(out.gain))} ${out.gain >= 0 ? 'above' : 'below'} book`],
    ['Real cost',            money(out.netCost),   `${shareOfCost(out.netCost)} of cost`]
  ];
  if (out.charge > 0) {
    cells.splice(3, 0, ['Tax on sale profit', money(out.charge), `at ${pct(cfg.taxRate, 1)}`]);
  }

  $('#resultGrid').innerHTML = cells.map(([t, v, s]) => `
    <div><dt>${t}</dt><dd${v.startsWith('−') ? ' class="is-neg"' : ''}>${v}<small>${s}</small></dd></div>`).join('');

  const head = ['Year', 'Opening value', 'Rate', 'Depreciation', 'Written down value', 'Tax saved', 'Cumulative'];
  $('#sched').innerHTML = `
    <thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${out.rows.map(r => `
        <tr class="${r.n === years ? 'sel' : r.n > years ? 'dim' : ''}">
          <td class="k">${r.n}</td>
          <td>${money(r.opening)}</td>
          <td>${pct0(r.rate)}</td>
          <td>${money(r.dep)}</td>
          <td class="k">${money(r.wdv)}</td>
          <td>${money(r.tax)}</td>
          <td>${money(r.cumTax)}</td>
        </tr>`).join('')}
    </tbody>`;

  // Every row is a real term, so the column adds up to the total.
  const steps = [
    ['Cost capitalised', money(cfg.cost)],
    [`Less tax saved on ${money(out.depClaimed)} of depreciation at ${pct(cfg.taxRate, 3)}`,
      '−' + money(out.taxSaved)],
    [`Less resale value at ${pct0(cfg.resalePct)} of price`, '−' + money(out.resale)]
  ];
  if (out.charge > 0) {
    steps.push([`Plus tax on ${money(out.gain)} sold above book value`, '+' + money(out.charge)]);
  }
  steps.push([`Real cost over ${yrs(years)}`, money(out.netCost), true]);

  $('#steps').innerHTML = steps.map(([w, a, tot]) =>
    `<li class="${tot ? 'tot' : ''}"><span class="w">${w}</span><span class="a">${a}</span></li>`).join('');

  $('#asm').innerHTML = [
    `Reducing balance. Each year is charged on the value left after the previous year.`,
    `Written down value is the car's value in your accounts. Resale value is what the market pays.`,
    `Tax rate is 30% base, plus surcharge, plus 4% cess.`,
    `Prices are ex showroom, fixed in vehicles.js, set ${PRICE_BOOK.updated}.`,
    cfg.balCharge
      ? `Selling above written down value is treated as taxable, so some relief is clawed back.`
      : `Selling above written down value is generally taxable. Tick "Tax the profit on sale" to include it.`,
    `Indicative figures for discussion only, not tax advice. Confirm the rate and the treatment of sale proceeds with your accountant.`
  ].map(t => `<li>${t}</li>`).join('');
}

/* Setup */

function buildModelSelect() {
  $('#model').innerHTML = PRICE_BOOK.vehicles.map(v =>
    `<option value="${v.key}">${v.name}</option>`).join('');
}

/** Resale follows the chosen model and year until the user types over it. */
let resaleTouched = false;
function syncResale() {
  if (resaleTouched) return;
  $('#resale').value = vehicle().resaleLadder[parseInt($('#years').value, 10) - 1];
}

/**
 * A focused number input consumes the mouse wheel and silently changes its
 * value, so scrolling the page over one alters the calculation. Swallow the
 * first tick and drop focus, after which the page scrolls normally.
 */
function stopWheelOnNumbers() {
  document.querySelectorAll('input[type="number"]').forEach(el => {
    el.addEventListener('wheel', e => {
      if (document.activeElement === el) { e.preventDefault(); el.blur(); }
    }, { passive: false });
  });
}

function applyDefaults() {
  $('#model').value    = PRICE_BOOK.vehicles[0].key;
  $('#discount').value = DEFAULTS.discount;
  $('#rate').value     = DEFAULTS.rate;
  $('#years').value    = DEFAULTS.years;
  $('#taxRate').value  = DEFAULTS.taxRate;
  $('#halfYear').checked  = DEFAULTS.halfYear;
  $('#balCharge').checked = DEFAULTS.balCharge;
  resaleTouched = false;
  syncResale();
}

function initTheme() {
  const saved = localStorage.getItem('dep-theme');
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (dark ? 'dark' : 'light');
  $('#themeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('dep-theme', next);
  });
}

function init() {
  buildModelSelect();
  applyDefaults();
  initTheme();
  stopWheelOnNumbers();

  $('#resale').addEventListener('input', () => { resaleTouched = true; });
  ['#model', '#years'].forEach(sel => $(sel).addEventListener('change', syncResale));

  ['input', 'change'].forEach(ev =>
    $('#calc').addEventListener(ev, () => { syncResale(); render(); }));

  $('#resetBtn').addEventListener('click', () => { applyDefaults(); render(); });

  render();
  runSelfCheck();
}

/* Fidelity guard.

   Re-asserts the maths against the source workbooks. Nothing is shown on
   screen; failures warn in the console only.

   The prices here are deliberately hardcoded rather than read from
   vehicles.js. They are the historical figures the spreadsheets were built
   on, so repricing a car must not rewrite this test. */

function runSelfCheck() {
  const cfg = (cost, taxRate) => ({ cost, rate: 0.40, halfYear: false, taxRate });
  const fails = [];
  const expect = (name, got, want, tol = 1.0) => {
    if (Math.abs(got - want) > tol) fails.push(`${name}: expected ${want}, got ${got.toFixed(2)}`);
  };

  // Cyberster at 82,49,800 and 34%. Reproduces the source in full.
  {
    const rows = schedule(cfg(8249800, 0.34));
    [4949880, 2969928, 1781957, 1069174, 641504].forEach((w, i) => expect(`Cyb wdv${i + 1}`, rows[i].wdv, w));
    [1121973, 673184, 403910, 242346, 145408].forEach((t, i) => expect(`Cyb tax${i + 1}`, rows[i].tax, t));
    expect('Cyb five year tax total', rows[4].cumTax, 2586820);
  }

  // M9 at 79,94,800 and 30%. Years 4 and 5 of the source tax column are
  // defective, so only years 1 to 3 of that column are asserted.
  {
    const rows = schedule(cfg(7994800, 0.30));
    [4796880, 2878128, 1726877, 1036126, 621676].forEach((w, i) => expect(`M9 wdv${i + 1}`, rows[i].wdv, w));
    [959376, 575626, 345375].forEach((t, i) => expect(`M9 tax${i + 1}`, rows[i].tax, t));
    expect('M9 three year tax total', rows[2].cumTax, 1880377);
  }

  // M9's second block at 18,99,800 and 34%.
  {
    const rows = schedule(cfg(1899800, 0.34));
    [1139880, 683928, 410357, 246214, 147728].forEach((w, i) => expect(`M9b2 wdv${i + 1}`, rows[i].wdv, w));
    [258373, 155024, 93014, 55809, 33485].forEach((t, i) => expect(`M9b2 tax${i + 1}`, rows[i].tax, t));
  }

  // Half rate in the first year.
  {
    const rows = schedule({ cost: 1000000, rate: 0.40, halfYear: true, taxRate: 0.30 });
    expect('half year dep1', rows[0].dep, 200000);
    expect('half year dep2', rows[1].dep, 320000);
  }

  if (fails.length) console.warn('[fidelity] drifted from the source workbooks:\n' + fails.join('\n'));
  return fails;
}

document.addEventListener('DOMContentLoaded', init);
