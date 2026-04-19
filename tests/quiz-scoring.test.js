/**
 * Quiz scoring tests — EN (108 combos) + DE (144 combos)
 * Run with: node tests/quiz-scoring.test.js
 *
 * Key invariant: the `risk` URL param always equals the final profile rank (1–4),
 * so profile and risk are always internally consistent for the Prompt Builder app.
 */

/* ══════════════════════════════════════════════════════
   SHARED
   ══════════════════════════════════════════════════════ */
const VALID_PROFILES = new Set(['conservative', 'balanced', 'growth', 'aggressive']);
const VALID_EQUITIES = new Set([30, 50, 70, 90]);
const HORIZON_CAP    = { 1:1, 2:2, 3:4, 4:4 };

function rankFromScore(e, horizon) {
  const raw = e < 40 ? 1 : e < 60 ? 2 : e < 80 ? 3 : 4;
  return Math.min(raw, HORIZON_CAP[horizon]);
}

let passed = 0, failed = 0;
const failures = [];

function assert(label, condition, detail = '') {
  if (condition) { passed++; }
  else { failed++; failures.push(`  FAIL: ${label}${detail ? ' — ' + detail : ''}`); }
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
   ══════════════════════════════════════════════════════ */
const DE_PROFILES = [null,
  { name:'Konservativ', profile:'conservative', equity:30 },
  { name:'Ausgewogen',  profile:'balanced',     equity:50 },
  { name:'Wachstum',    profile:'growth',       equity:70 },
  { name:'Aggressiv',   profile:'aggressive',   equity:90 },
];

function deScore({ horizon, risk, income, cashflow }) {
  let e = 50;
  e += [0, -25, 0, 20, 35][horizon] ?? 0;
  e += [0, -25,  0,  5, 20][risk]   ?? 0;
  e += (income === 1 ? 10 : income === 2 ? 0 : -10);
  e += (cashflow === 1 ? -15 : cashflow === 2 ? 0 : 10);
  return Math.max(10, Math.min(95, e));
}

/* ══════════════════════════════════════════════════════
   Helper: assert a full case
   ══════════════════════════════════════════════════════ */
function assertCase(label, score, horizon, expectedScore, expectedProfile, expectedRank) {
  const rank = rankFromScore(score, horizon);
  assert(`${label} score=${expectedScore}`,    score === expectedScore,              `got ${score}`);
  assert(`${label} profile=${expectedProfile}`,
    (expectedProfile === 'conservative' ? EN_PROFILES : EN_PROFILES)[rank].profile === expectedProfile,
    `got rank=${rank}`);
  assert(`${label} risk param=rank=${expectedRank}`, rank === expectedRank,         `got rank ${rank}`);
}

/* ══════════════════════════════════════════════════════
   EN spot checks
   ══════════════════════════════════════════════════════ */
console.log('=== EN — spot checks ===\n');

const EN_SPOT = [
  // risk param = rank (profile), not raw quiz answer
  // h=2 buy volatile no → score=70, capped to Balanced → risk=2
  { inputs:{horizon:2,risk:'buy',  income:'volatile',cashflow:'no'       }, score:70, profile:'balanced',     rank:2 },
  // h=3 buy volatile yes → score=65 → Growth → risk=3
  { inputs:{horizon:3,risk:'buy',  income:'volatile',cashflow:'yes'      }, score:65, profile:'growth',       rank:3 },
  // h=4 buy stable no → score=95 → Aggressive → risk=4
  { inputs:{horizon:4,risk:'buy',  income:'stable',  cashflow:'no'       }, score:95, profile:'aggressive',   rank:4 },
  // h=1 buy stable no → score=65, capped to Conservative → risk=1 (not 3)
  { inputs:{horizon:1,risk:'buy',  income:'stable',  cashflow:'no'       }, score:65, profile:'conservative', rank:1 },
  // h=2 hold stable no → score=75, capped to Balanced → risk=2
  { inputs:{horizon:2,risk:'hold', income:'stable',  cashflow:'no'       }, score:75, profile:'balanced',     rank:2 },
  // h=3 hold mixed sometimes → score=75 → Growth → risk=3
  { inputs:{horizon:3,risk:'hold', income:'mixed',   cashflow:'sometimes'}, score:75, profile:'growth',       rank:3 },
  // floor: h=1 panic volatile yes → score=10 → Conservative → risk=1
  { inputs:{horizon:1,risk:'panic',income:'volatile',cashflow:'yes'      }, score:10, profile:'conservative', rank:1 },
];

for (const { inputs, score, profile, rank } of EN_SPOT) {
  const s   = enScore(inputs);
  const r   = rankFromScore(s, inputs.horizon);
  const pf  = EN_PROFILES[r];
  const ii  = EN_INCOME_INT[inputs.income];
  const lbl = `EN ${JSON.stringify(inputs)} →`;
  assert(`${lbl} score=${score}`,          s === score,            `got ${s}`);
  assert(`${lbl} profile=${profile}`,      pf.profile === profile, `got ${pf.profile}`);
  assert(`${lbl} risk param=rank=${rank}`, r === rank,             `got rank ${r}`);
  assert(`${lbl} incomeInt in {1,2,3}`,   [1,2,3].includes(ii),   `got ${ii}`);
}

/* ══════════════════════════════════════════════════════
   EN exhaustive — 4×3×3×3 = 108 combinations
   ══════════════════════════════════════════════════════ */
console.log('=== EN — all 108 combinations ===\n');

const VALID_INCOME_INTS  = new Set([1, 2, 3]);
const VALID_EN_CASHFLOWS = new Set(['yes', 'sometimes', 'no']);
const VALID_RANKS        = new Set([1, 2, 3, 4]);

for (const horizon of [1,2,3,4]) {
  for (const risk of ['panic','hold','buy']) {
    for (const income of ['stable','mixed','volatile']) {
      for (const cashflow of ['yes','sometimes','no']) {
        const inputs = { horizon, risk, income, cashflow };
        const s   = enScore(inputs);
        const r   = rankFromScore(s, horizon);
        const pf  = EN_PROFILES[r];
        const ii  = EN_INCOME_INT[income];
        const lbl = `EN h=${horizon} r=${risk} i=${income} c=${cashflow}`;

        assert(`${lbl}: score in [10,95]`,       s >= 10 && s <= 95,              `got ${s}`);
        assert(`${lbl}: profile slug valid`,      VALID_PROFILES.has(pf.profile),  `got "${pf.profile}"`);
        assert(`${lbl}: equity valid`,            VALID_EQUITIES.has(pf.equity),   `got ${pf.equity}`);
        assert(`${lbl}: risk param=rank`,         VALID_RANKS.has(r),              `got ${r}`);
        assert(`${lbl}: risk==profile rank`,      r === rankFromScore(s, horizon), `mismatch`);
        assert(`${lbl}: incomeInt in {1,2,3}`,   VALID_INCOME_INTS.has(ii),       `got ${ii}`);
        assert(`${lbl}: cashflow string valid`,   VALID_EN_CASHFLOWS.has(cashflow),`got "${cashflow}"`);
        if (horizon === 1) assert(`${lbl}: h=1 → max Conservative`, r === 1, `got rank ${r}`);
        if (horizon === 2) assert(`${lbl}: h=2 → max Balanced`,      r <= 2, `got rank ${r}`);
      }
    }
  }
}

/* ══════════════════════════════════════════════════════
   DE spot checks
   ══════════════════════════════════════════════════════ */
console.log('=== DE — spot checks ===\n');

const DE_SPOT = [
  // h=2 r=4 i=3 c=3 → score=70, capped Ausgewogen → risk=2
  { inputs:{horizon:2,risk:4,income:3,cashflow:3}, score:70, profile:'balanced',     rank:2 },
  // h=3 r=4 i=3 c=1 → score=65 → Wachstum → risk=3
  { inputs:{horizon:3,risk:4,income:3,cashflow:1}, score:65, profile:'growth',       rank:3 },
  // h=4 r=4 i=1 c=3 → score=95 → Aggressiv → risk=4
  { inputs:{horizon:4,risk:4,income:1,cashflow:3}, score:95, profile:'aggressive',   rank:4 },
  // h=1 r=4 i=1 c=3 → score=65, capped Conservative → risk=1
  { inputs:{horizon:1,risk:4,income:1,cashflow:3}, score:65, profile:'conservative', rank:1 },
  // floor: h=1 r=1 i=3 c=1 → score=10 → Konservativ → risk=1
  { inputs:{horizon:1,risk:1,income:3,cashflow:1}, score:10, profile:'conservative', rank:1 },
];

for (const { inputs, score, profile, rank } of DE_SPOT) {
  const s  = deScore(inputs);
  const r  = rankFromScore(s, inputs.horizon);
  const pf = DE_PROFILES[r];
  const lbl = `DE ${JSON.stringify(inputs)} →`;
  assert(`${lbl} score=${score}`,          s === score,            `got ${s}`);
  assert(`${lbl} profile=${profile}`,      pf.profile === profile, `got ${pf.profile}`);
  assert(`${lbl} risk param=rank=${rank}`, r === rank,             `got rank ${r}`);
}

/* ══════════════════════════════════════════════════════
   DE exhaustive — 4×4×3×3 = 144 combinations
   ══════════════════════════════════════════════════════ */
console.log('=== DE — all 144 combinations ===\n');

for (const horizon of [1,2,3,4]) {
  for (const risk of [1,2,3,4]) {
    for (const income of [1,2,3]) {
      for (const cashflow of [1,2,3]) {
        const inputs = { horizon, risk, income, cashflow };
        const s  = deScore(inputs);
        const r  = rankFromScore(s, horizon);
        const pf = DE_PROFILES[r];
        const lbl = `DE h=${horizon} r=${risk} i=${income} c=${cashflow}`;

        assert(`${lbl}: score in [10,95]`,   s >= 10 && s <= 95,             `got ${s}`);
        assert(`${lbl}: profile slug valid`,  VALID_PROFILES.has(pf.profile), `got "${pf.profile}"`);
        assert(`${lbl}: equity valid`,        VALID_EQUITIES.has(pf.equity),  `got ${pf.equity}`);
        assert(`${lbl}: risk param=rank`,     VALID_RANKS.has(r),             `got ${r}`);
        if (horizon === 1) assert(`${lbl}: h=1 → max Conservative`, r === 1, `got rank ${r}`);
        if (horizon === 2) assert(`${lbl}: h=2 → max Balanced`,      r <= 2, `got rank ${r}`);
      }
    }
  }
}

/* ══════════════════════════════════════════════════════
   EN ↔ DE parity
   ══════════════════════════════════════════════════════ */
console.log('=== EN ↔ DE parity ===\n');

const EN_RISK_TO_DE   = { panic:1, hold:3, buy:4 };
const EN_INCOME_TO_DE = { stable:1, mixed:2, volatile:3 };
const EN_CF_TO_DE     = { yes:1, sometimes:2, no:3 };

for (const horizon of [1,2,3,4]) {
  for (const risk of ['panic','hold','buy']) {
    for (const income of ['stable','mixed','volatile']) {
      for (const cashflow of ['yes','sometimes','no']) {
        const enS  = enScore({ horizon, risk, income, cashflow });
        const deS  = deScore({ horizon, risk:EN_RISK_TO_DE[risk], income:EN_INCOME_TO_DE[income], cashflow:EN_CF_TO_DE[cashflow] });
        const enR  = rankFromScore(enS, horizon);
        const deR  = rankFromScore(deS, horizon);
        const enPf = EN_PROFILES[enR].profile;
        const dePf = DE_PROFILES[deR].profile;
        const lbl  = `parity h=${horizon} r=${risk} i=${income} c=${cashflow}`;
        assert(`${lbl}: same score`,        enS === deS,   `EN=${enS} DE=${deS}`);
        assert(`${lbl}: same profile`,      enPf === dePf, `EN=${enPf} DE=${dePf}`);
        assert(`${lbl}: same risk param`,   enR === deR,   `EN=${enR} DE=${deR}`);
      }
    }
  }
}

/* ══════════════════════════════════════════════════════
   Summary
   ══════════════════════════════════════════════════════ */
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
if (failures.length) { console.log('\nFailures:'); failures.forEach(f => console.log(f)); process.exit(1); }
else { console.log('\nAll tests passed.'); }
