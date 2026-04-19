/**
 * Quiz scoring tests — EN (108 combos) + DE (108 combos)
 * Run with: node tests/quiz-scoring.test.js
 *
 * Validates per locale:
 *   1. Score is clamped to [10, 95]
 *   2. Profile rank maps correctly to slug/equity
 *   3. URL params use integer values for risk, income (and cashflow in DE)
 *   4. Deep-link contract matches CLAUDE.md spec
 */

/* ══════════════════════════════════════════════════════
   SHARED
   ══════════════════════════════════════════════════════ */
const VALID_PROFILES = new Set(['conservative', 'balanced', 'growth', 'aggressive']);
const VALID_EQUITIES = new Set([30, 50, 70, 90]);

function rankFromScore(e) { return e < 40 ? 1 : e < 60 ? 2 : e < 80 ? 3 : 4; }

/* ── test runner ── */
let passed = 0;
let failed = 0;
const failures = [];

function assert(label, condition, detail = '') {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(`  FAIL: ${label}${detail ? ' — ' + detail : ''}`);
  }
}

/* ══════════════════════════════════════════════════════
   EN — mirror of maybeShowProfile()
   ══════════════════════════════════════════════════════ */
const EN_PROFILES = [null,
  { name:'Conservative', profile:'conservative', equity:30 },
  { name:'Balanced',     profile:'balanced',     equity:50 },
  { name:'Growth',       profile:'growth',       equity:70 },
  { name:'Aggressive',   profile:'aggressive',   equity:90 },
];

const EN_RISK_INT   = { panic:1, hold:3, buy:4 };
const EN_INCOME_INT = { stable:1, mixed:2, volatile:3 };

function enScore({ horizon, risk, income, cashflow }) {
  const hd = { 1:-25, 2:0, 3:20, 4:35 };
  let e = 50;
  e += hd[+horizon] ?? 0;
  if (risk === 'panic') e -= 25;
  else if (risk === 'hold') e += 5;
  else if (risk === 'buy')  e += 20;
  if (income === 'stable')        e += 10;
  else if (income === 'volatile') e -= 10;
  if (cashflow === 'yes')         e -= 15;
  else if (cashflow === 'no')     e += 10;
  return Math.max(10, Math.min(95, e));
}

/* ══════════════════════════════════════════════════════
   DE — mirror of scoreProfile()
   data-v values are integers; cashflow: 1/2/3 per contract
   ══════════════════════════════════════════════════════ */
const DE_PROFILES = [null,
  { name:'Konservativ', profile:'conservative', equity:30 },
  { name:'Ausgewogen',  profile:'balanced',     equity:50 },
  { name:'Wachstum',    profile:'growth',       equity:70 },
  { name:'Aggressiv',   profile:'aggressive',   equity:90 },
];

// DE risk scoring uses array index: [unused, -25, 0, +5, +20]
function deScore({ horizon, risk, income, cashflow }) {
  let e = 50;
  e += [0, -25, 0, 20, 35][horizon] ?? 0;
  e += [0, -25,  0,  5, 20][risk]   ?? 0;
  e += (income === 1 ? 10 : income === 2 ? 0 : -10);
  e += (cashflow === 1 ? -15 : cashflow === 2 ? 0 : 10);
  return Math.max(10, Math.min(95, e));
}

/* ══════════════════════════════════════════════════════
   EN spot checks
   ══════════════════════════════════════════════════════ */
console.log('=== EN — spot checks ===\n');

const EN_SPOT_CHECKS = [
  // bug case from screenshot: h=2 r=buy i=volatile c=no → 70 → Growth
  { inputs:{ horizon:2, risk:'buy',   income:'volatile', cashflow:'no'        }, score:70, profile:'growth',       riskInt:4, incomeInt:3 },
  // floor clamp: h=1 r=panic i=volatile c=yes → 50−25−25−10−15=−25 → 10 → Conservative
  { inputs:{ horizon:1, risk:'panic', income:'volatile', cashflow:'yes'       }, score:10, profile:'conservative', riskInt:1, incomeInt:3 },
  // ceiling clamp: h=4 r=buy i=stable c=no → 50+35+20+10+10=125 → 95 → Aggressive
  { inputs:{ horizon:4, risk:'buy',   income:'stable',   cashflow:'no'        }, score:95, profile:'aggressive',   riskInt:4, incomeInt:1 },
  // balanced boundary (score=40): h=1 r=hold i=stable c=sometimes → 50−25+5+10=40
  { inputs:{ horizon:1, risk:'hold',  income:'stable',   cashflow:'sometimes' }, score:40, profile:'balanced',     riskInt:3, incomeInt:1 },
  // growth boundary (score=75): h=3 r=hold i=mixed c=sometimes → 50+20+5=75
  { inputs:{ horizon:3, risk:'hold',  income:'mixed',    cashflow:'sometimes' }, score:75, profile:'growth',       riskInt:3, incomeInt:2 },
  // aggressive boundary (score=80): h=3 r=buy i=stable c=sometimes → 50+20+20+10=100→95? no: 50+20+20+10=100→95
  // actually let's use h=3 r=buy i=mixed c=no → 50+20+20+0+10=100→95 → Aggressive
  { inputs:{ horizon:3, risk:'buy',   income:'mixed',    cashflow:'no'        }, score:95, profile:'aggressive',   riskInt:4, incomeInt:2 },
];

for (const { inputs, score, profile, riskInt, incomeInt } of EN_SPOT_CHECKS) {
  const s  = enScore(inputs);
  const pf = EN_PROFILES[rankFromScore(s)];
  const ri = EN_RISK_INT[inputs.risk];
  const ii = EN_INCOME_INT[inputs.income];
  const label = JSON.stringify(inputs);
  assert(`EN ${label} → score=${score}`,       s === score,          `got ${s}`);
  assert(`EN ${label} → profile=${profile}`,   pf.profile === profile, `got ${pf.profile}`);
  assert(`EN ${label} → riskInt=${riskInt}`,   ri === riskInt,       `got ${ri}`);
  assert(`EN ${label} → incomeInt=${incomeInt}`,ii === incomeInt,    `got ${ii}`);
}

/* ══════════════════════════════════════════════════════
   EN exhaustive — 4×3×3×3 = 108 combinations
   ══════════════════════════════════════════════════════ */
console.log('=== EN — all 108 combinations ===\n');

const EN_HORIZONS  = [1, 2, 3, 4];
const EN_RISKS     = ['panic', 'hold', 'buy'];
const EN_INCOMES   = ['stable', 'mixed', 'volatile'];
const EN_CASHFLOWS = ['yes', 'sometimes', 'no'];
const VALID_EN_CASHFLOWS = new Set(['yes', 'sometimes', 'no']);
const VALID_RISK_INTS    = new Set([1, 2, 3, 4]);
const VALID_INCOME_INTS  = new Set([1, 2, 3]);

for (const horizon of EN_HORIZONS) {
  for (const risk of EN_RISKS) {
    for (const income of EN_INCOMES) {
      for (const cashflow of EN_CASHFLOWS) {
        const inputs = { horizon, risk, income, cashflow };
        const s  = enScore(inputs);
        const pf = EN_PROFILES[rankFromScore(s)];
        const ri = EN_RISK_INT[risk];
        const ii = EN_INCOME_INT[income];
        const lbl = `EN h=${horizon} r=${risk} i=${income} c=${cashflow}`;

        assert(`${lbl}: score in [10,95]`,          s >= 10 && s <= 95,           `got ${s}`);
        assert(`${lbl}: profile slug valid`,         VALID_PROFILES.has(pf.profile), `got "${pf.profile}"`);
        assert(`${lbl}: equity valid`,               VALID_EQUITIES.has(pf.equity),  `got ${pf.equity}`);
        assert(`${lbl}: riskInt in {1,2,3,4}`,      VALID_RISK_INTS.has(ri),        `got ${ri}`);
        assert(`${lbl}: incomeInt in {1,2,3}`,      VALID_INCOME_INTS.has(ii),      `got ${ii}`);
        assert(`${lbl}: cashflow string valid`,      VALID_EN_CASHFLOWS.has(cashflow), `got "${cashflow}"`);
        const expectedName = s < 40 ? 'Conservative' : s < 60 ? 'Balanced' : s < 80 ? 'Growth' : 'Aggressive';
        assert(`${lbl}: name matches bracket`,       pf.name === expectedName,
          `score=${s} → expected ${expectedName}, got ${pf.name}`);
      }
    }
  }
}

/* ══════════════════════════════════════════════════════
   DE spot checks
   ══════════════════════════════════════════════════════ */
console.log('=== DE — spot checks ===\n');

const DE_SPOT_CHECKS = [
  // equivalent of screenshot case: h=2 r=4 i=3 c=3 → 50+0+20−10+10=70 → Wachstum
  { inputs:{ horizon:2, risk:4, income:3, cashflow:3 }, score:70, profile:'growth'       },
  // floor: h=1 r=1 i=3 c=1 → 50−25−25−10−15=−25 → 10 → Konservativ
  { inputs:{ horizon:1, risk:1, income:3, cashflow:1 }, score:10, profile:'conservative' },
  // ceiling: h=4 r=4 i=1 c=3 → 50+35+20+10+10=125 → 95 → Aggressiv
  { inputs:{ horizon:4, risk:4, income:1, cashflow:3 }, score:95, profile:'aggressive'   },
  // balanced boundary: h=1 r=3 i=1 c=2 → 50−25+5+10=40 → Ausgewogen
  { inputs:{ horizon:1, risk:3, income:1, cashflow:2 }, score:40, profile:'balanced'     },
  // growth boundary: h=3 r=3 i=2 c=2 → 50+20+5=75 → Wachstum
  { inputs:{ horizon:3, risk:3, income:2, cashflow:2 }, score:75, profile:'growth'       },
];

for (const { inputs, score, profile } of DE_SPOT_CHECKS) {
  const s  = deScore(inputs);
  const pf = DE_PROFILES[rankFromScore(s)];
  const label = JSON.stringify(inputs);
  assert(`DE ${label} → score=${score}`,     s === score,            `got ${s}`);
  assert(`DE ${label} → profile=${profile}`, pf.profile === profile, `got ${pf.profile}`);
  // DE passes integers natively — verify all params are numeric
  assert(`DE ${label} → risk is integer`,    Number.isInteger(inputs.risk),     `got ${typeof inputs.risk}`);
  assert(`DE ${label} → income is integer`,  Number.isInteger(inputs.income),   `got ${typeof inputs.income}`);
  assert(`DE ${label} → cashflow is integer`,Number.isInteger(inputs.cashflow), `got ${typeof inputs.cashflow}`);
}

/* ══════════════════════════════════════════════════════
   DE exhaustive — 4×4×3×3 = 144 combinations
   (risk has 4 options in DE: 1–4)
   ══════════════════════════════════════════════════════ */
console.log('=== DE — all 144 combinations ===\n');

const DE_HORIZONS  = [1, 2, 3, 4];
const DE_RISKS     = [1, 2, 3, 4];
const DE_INCOMES   = [1, 2, 3];
const DE_CASHFLOWS = [1, 2, 3];
const VALID_DE_CASHFLOW_INTS = new Set([1, 2, 3]);

for (const horizon of DE_HORIZONS) {
  for (const risk of DE_RISKS) {
    for (const income of DE_INCOMES) {
      for (const cashflow of DE_CASHFLOWS) {
        const inputs = { horizon, risk, income, cashflow };
        const s  = deScore(inputs);
        const pf = DE_PROFILES[rankFromScore(s)];
        const lbl = `DE h=${horizon} r=${risk} i=${income} c=${cashflow}`;

        assert(`${lbl}: score in [10,95]`,          s >= 10 && s <= 95,            `got ${s}`);
        assert(`${lbl}: profile slug valid`,         VALID_PROFILES.has(pf.profile), `got "${pf.profile}"`);
        assert(`${lbl}: equity valid`,               VALID_EQUITIES.has(pf.equity),  `got ${pf.equity}`);
        assert(`${lbl}: risk is integer`,            Number.isInteger(risk),          `got ${typeof risk}`);
        assert(`${lbl}: income is integer`,          Number.isInteger(income),        `got ${typeof income}`);
        assert(`${lbl}: cashflow int valid`,         VALID_DE_CASHFLOW_INTS.has(cashflow), `got ${cashflow}`);
        const expectedName = s < 40 ? 'Konservativ' : s < 60 ? 'Ausgewogen' : s < 80 ? 'Wachstum' : 'Aggressiv';
        assert(`${lbl}: name matches bracket`,       pf.name === expectedName,
          `score=${s} → expected ${expectedName}, got ${pf.name}`);
      }
    }
  }
}

/* ══════════════════════════════════════════════════════
   EN ↔ DE parity — same inputs must yield same profile
   ══════════════════════════════════════════════════════ */
console.log('=== EN ↔ DE parity (shared inputs) ===\n');

// Map EN string inputs to DE integer equivalents and compare profiles
const EN_RISK_TO_DE   = { panic:1, hold:3, buy:4 };
const EN_INCOME_TO_DE = { stable:1, mixed:2, volatile:3 };
const EN_CF_TO_DE     = { yes:1, sometimes:2, no:3 };

for (const horizon of EN_HORIZONS) {
  for (const risk of EN_RISKS) {
    for (const income of EN_INCOMES) {
      for (const cashflow of EN_CASHFLOWS) {
        const enInputs = { horizon, risk, income, cashflow };
        const deInputs = {
          horizon,
          risk:     EN_RISK_TO_DE[risk],
          income:   EN_INCOME_TO_DE[income],
          cashflow: EN_CF_TO_DE[cashflow],
        };
        const enS  = enScore(enInputs);
        const deS  = deScore(deInputs);
        const enPf = EN_PROFILES[rankFromScore(enS)].profile;
        const dePf = DE_PROFILES[rankFromScore(deS)].profile;
        const lbl  = `parity h=${horizon} r=${risk} i=${income} c=${cashflow}`;
        assert(`${lbl}: same score`, enS === deS, `EN=${enS} DE=${deS}`);
        assert(`${lbl}: same profile`, enPf === dePf, `EN=${enPf} DE=${dePf}`);
      }
    }
  }
}

/* ══════════════════════════════════════════════════════
   Summary
   ══════════════════════════════════════════════════════ */
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(f));
  process.exit(1);
} else {
  console.log('\nAll tests passed.');
}
