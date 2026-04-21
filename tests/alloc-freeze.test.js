/**
 * Allocation freeze / redistribute tests
 * Run with: node tests/alloc-freeze.test.js
 *
 * These are pure-function tests — no DOM required.
 * The redistribute() logic is lifted verbatim from the HTML files.
 *
 * Invariants under test:
 *   1. Sum of result always === 100
 *   2. Frozen indices never change
 *   3. Moved index gets the requested value (clamped if necessary)
 *   4. Free indices adjust proportionally (or equally when all are 0)
 *   5. frozenTotal ≥ 100 → moved index clamped to 100−frozenTotal
 */

/* ══════════════════════════════════════════════════════
   Standalone reimplementation of redistribute()
   (mirrors the JS in the HTML files)
   ══════════════════════════════════════════════════════ */

/**
 * @param {number[]} lastVals  current 5-element allocation array (sums to 100)
 * @param {boolean[]} frozen   5-element freeze flags
 * @param {number}   idx       which slider is being moved
 * @param {number}   rawNew    requested new value for slider idx
 * @returns {number[]}         new allocation array (always sums to 100)
 */
function redistribute(lastVals, frozen, idx, rawNew) {
  const ids = [0, 1, 2, 3, 4]; // index placeholders

  const frozenTotal = frozen.reduce((s, f, i) => s + (f && i !== idx ? lastVals[i] : 0), 0);
  const freeOthers  = ids.filter(i => i !== idx && !frozen[i]);
  const maxNew      = Math.max(0, 100 - frozenTotal);
  const newVal      = Math.min(rawNew, maxNew);
  const freeSum     = freeOthers.reduce((s, i) => s + lastVals[i], 0);
  const remainder   = maxNew - newVal;
  const nv          = [...lastVals];
  nv[idx]           = newVal;

  if (freeOthers.length === 0) {
    nv[idx] = maxNew;
  } else if (freeSum === 0) {
    const share    = Math.floor(remainder / freeOthers.length);
    freeOthers.forEach(i => { nv[i] = share; });
    const rounding = remainder - share * freeOthers.length;
    nv[freeOthers[freeOthers.length - 1]] += rounding;
  } else {
    freeOthers.forEach(i => {
      nv[i] = Math.max(0, Math.round(remainder * (lastVals[i] / freeSum)));
    });
  }

  // rounding correction — apply to largest free slider
  const s = nv.reduce((a, b) => a + b, 0);
  if (s !== 100 && freeOthers.length > 0) {
    const lg = freeOthers.reduce((b, i) => nv[i] > nv[b] ? i : b, freeOthers[0]);
    nv[lg] = Math.max(0, nv[lg] + (100 - s));
  }

  return nv;
}

/* ══════════════════════════════════════════════════════
   Test harness
   ══════════════════════════════════════════════════════ */
let passed = 0, failed = 0;
const failures = [];

function assert(label, condition, detail = '') {
  if (condition) { passed++; }
  else { failed++; failures.push(`  FAIL: ${label}${detail ? ' — ' + detail : ''}`); }
}

function assertRedistribute(label, lastVals, frozen, idx, rawNew, expected) {
  const result = redistribute(lastVals, frozen, idx, rawNew);
  const sum    = result.reduce((a, b) => a + b, 0);

  assert(`${label}: sum===100`,          sum === 100,                   `got ${sum}`);
  assert(`${label}: moved idx=${idx}`,   result[idx] === expected[idx], `got ${result[idx]}, want ${expected[idx]}`);

  frozen.forEach((f, i) => {
    if (f && i !== idx) {
      assert(`${label}: frozen[${i}] unchanged`, result[i] === lastVals[i], `got ${result[i]}, want ${lastVals[i]}`);
    }
  });

  if (expected !== null) {
    result.forEach((v, i) => {
      assert(`${label}: result[${i}]=${expected[i]}`, v === expected[i], `got ${v}`);
    });
  }
}

/* ══════════════════════════════════════════════════════
   1. No freeze — proportional redistribution
   ══════════════════════════════════════════════════════ */
console.log('=== 1. No freeze — proportional ===\n');

// Start: [20,20,20,20,20], move idx=0 to 40
// Remaining 60 split proportionally across [1,2,3,4] (each was 20 → equal share = 15)
assertRedistribute(
  'nofreeze equal base, raise idx0 to 40',
  [20, 20, 20, 20, 20], [false,false,false,false,false],
  0, 40,
  [40, 15, 15, 15, 15]
);

// Start: [20,20,20,20,20], move idx=0 to 0
// Remaining 100 split equally: 25 each
assertRedistribute(
  'nofreeze equal base, lower idx0 to 0',
  [20, 20, 20, 20, 20], [false,false,false,false,false],
  0, 0,
  [0, 25, 25, 25, 25]
);

// Unequal base [10,20,30,25,15], move idx=2 (30) to 10
// frozenTotal=0, freeOthers=[0,1,3,4], remainder=90, freeSum=70
// proportional: 0→round(90*10/70)=13, 1→round(90*20/70)=26, 3→round(90*25/70)=32, 4→round(90*15/70)=19 → sum=13+26+10+32+19=100
assertRedistribute(
  'nofreeze unequal base, lower idx2 to 10',
  [10, 20, 30, 25, 15], [false,false,false,false,false],
  2, 10,
  [13, 26, 10, 32, 19]
);

/* ══════════════════════════════════════════════════════
   2. One slider frozen
   ══════════════════════════════════════════════════════ */
console.log('=== 2. One slider frozen ===\n');

// [20,20,20,20,20], freeze idx=1 (20), move idx=0 to 30
// frozenTotal=20, maxNew=80, newVal=30, remainder=50
// freeOthers=[2,3,4] each=20, freeSum=60 → each round(50*20/60)=17 → sum=101
// rounding correction: first/largest (idx=2) gets −1 → [30,20,16,17,17]
assertRedistribute(
  'freeze idx1, raise idx0 to 30',
  [20, 20, 20, 20, 20], [false,true,false,false,false],
  0, 30,
  [30, 20, 16, 17, 17]
);

// [20,20,20,20,20], freeze idx=1 (20), move idx=0 to 80 (asking 80 but maxNew=80)
// frozenTotal=20, maxNew=80, newVal=80, remainder=0 → freeOthers get 0 each
assertRedistribute(
  'freeze idx1, raise idx0 to 80 (fills to max)',
  [20, 20, 20, 20, 20], [false,true,false,false,false],
  0, 80,
  [80, 20, 0, 0, 0]
);

/* ══════════════════════════════════════════════════════
   3. Multiple sliders frozen
   ══════════════════════════════════════════════════════ */
console.log('=== 3. Multiple sliders frozen ===\n');

// [10,30,40,10,10], freeze idx=1(30) and idx=2(40), move idx=0 to 5
// frozenTotal=70, maxNew=30, newVal=5, remainder=25
// freeOthers=[3,4] each=10, freeSum=20 → each round(25*10/20)=13 → sum=101
// rounding correction: first/largest (idx=3) gets −1 → [5,30,40,12,13]
assertRedistribute(
  'freeze idx1+idx2, lower idx0 to 5',
  [10, 30, 40, 10, 10], [false,true,true,false,false],
  0, 5,
  [5, 30, 40, 12, 13]
);

// Same but request idx=0 to 35 → clamped to maxNew=30
assertRedistribute(
  'freeze idx1+idx2, raise idx0 to 35 (clamped to 30)',
  [10, 30, 40, 10, 10], [false,true,true,false,false],
  0, 35,
  [30, 30, 40, 0, 0]
);

/* ══════════════════════════════════════════════════════
   4. frozenTotal >= 100 — moved index clamped to 0
   ══════════════════════════════════════════════════════ */
console.log('=== 4. frozenTotal >= 100 ===\n');

// [0,50,50,0,0], freeze idx=1(50) and idx=2(50), move idx=0
// frozenTotal=100, maxNew=0, newVal=0 regardless of rawNew
assertRedistribute(
  'frozenTotal=100, idx0 forced to 0',
  [0, 50, 50, 0, 0], [false,true,true,false,false],
  0, 30,
  [0, 50, 50, 0, 0]
);

/* ══════════════════════════════════════════════════════
   5. Last free slider (only one free, not being moved)
   ══════════════════════════════════════════════════════ */
console.log('=== 5. Last free slider ===\n');

// [10,20,30,25,15], freeze idx=0,1,3,4 (total 70), move idx=2 to 20
// frozenTotal=70, maxNew=30, newVal=20, remainder=10
// freeOthers=[] → freeOthers.length===0 → idx gets maxNew=30 NOT 20
// Wait — freeOthers is [] when all others are frozen
// In this case idx=2 is moved AND is the only free; freeOthers=[] → nv[idx]=maxNew=30
assertRedistribute(
  'all others frozen, idx2 is last free, forced to 30',
  [10, 20, 30, 25, 15], [true,true,false,true,true],
  2, 20,
  [10, 20, 30, 25, 15]
);

// Edge: move idx=2 to 40 — still clamped to maxNew=30
assertRedistribute(
  'all others frozen, idx2 forced to maxNew=30 (rawNew=40)',
  [10, 20, 30, 25, 15], [true,true,false,true,true],
  2, 40,
  [10, 20, 30, 25, 15]
);

/* ══════════════════════════════════════════════════════
   6. Equal distribution when all free sliders are at 0
   ══════════════════════════════════════════════════════ */
console.log('=== 6. Equal distribution (freeSum=0) ===\n');

// [100,0,0,0,0], no freeze, lower idx=0 to 60
// freeOthers=[1,2,3,4] all=0, freeSum=0 → equal: floor(40/4)=10 each, rounding=0
assertRedistribute(
  'freeSum=0, lower idx0 from 100 to 60, equal split',
  [100, 0, 0, 0, 0], [false,false,false,false,false],
  0, 60,
  [60, 10, 10, 10, 10]
);

// [100,0,0,0,0], no freeze, lower idx=0 to 57
// remainder=43, floor(43/4)=10, rounding=3 → last free (idx=4) gets +3
assertRedistribute(
  'freeSum=0, uneven split rounding goes to last free slider',
  [100, 0, 0, 0, 0], [false,false,false,false,false],
  0, 57,
  [57, 10, 10, 10, 13]
);

/* ══════════════════════════════════════════════════════
   7. Invariant: sum always 100 — randomised spot check
   ══════════════════════════════════════════════════════ */
console.log('=== 7. Sum invariant — randomised ===\n');

// Use a seeded-ish deterministic set instead of Math.random() for repeatability
const cases = [
  { vals:[25,25,25,25,0],  frozen:[false,false,false,false,false], idx:3, raw:50 },
  { vals:[10,10,60,10,10], frozen:[true, false,false,false,false],  idx:2, raw:20 },
  { vals:[5, 5, 5, 80, 5], frozen:[false,false,true, false,true],   idx:0, raw:50 },
  { vals:[33,33,34,0, 0],  frozen:[true, false,false,false,false],  idx:1, raw:1  },
  { vals:[0, 0, 0, 0,100], frozen:[false,false,false,false,false],  idx:4, raw:0  },
  { vals:[20,20,20,20,20], frozen:[true, true, true, true, false],  idx:4, raw:99 },
  { vals:[20,20,20,20,20], frozen:[false,false,false,false,false],  idx:2, raw:100},
];

for (const { vals, frozen, idx, raw } of cases) {
  const result = redistribute(vals, frozen, idx, raw);
  const sum    = result.reduce((a, b) => a + b, 0);
  const frozenOk = frozen.every((f, i) => !f || i === idx || result[i] === vals[i]);
  const lbl = `sum-invariant vals=[${vals}] frozen=[${frozen.map(Number)}] idx=${idx} raw=${raw}`;
  assert(`${lbl}: sum===100`, sum === 100, `got ${sum}`);
  assert(`${lbl}: frozen unchanged`, frozenOk, `result=[${result}]`);
}

/* ══════════════════════════════════════════════════════
   8. Profile-dot reset (unfreeze all before snap)
   ══════════════════════════════════════════════════════ */
console.log('=== 8. Profile-dot unfreeze-then-snap ===\n');

// In the HTML, profile dot click: unfreeze all checkboxes, then set each slider .value
// directly and call updateAlloc() — redistribute() is NOT called. So the test here
// verifies: (a) all four hardcoded profile targets sum to 100, and (b) that after
// unfreezing, a single redistribute() call with no frozen flags respects the sum invariant.

const profiles = [
  { name:'Conservative', vals:[30, 50, 20,  0,  0] },
  { name:'Balanced',     vals:[20, 30, 40, 10,  0] },
  { name:'Growth',       vals:[10, 20, 50, 15,  5] },
  { name:'Aggressive',   vals:[ 5, 10, 55, 20, 10] },
];

for (const { name, vals } of profiles) {
  const sum = vals.reduce((a, b) => a + b, 0);
  assert(`${name} profile sums to 100`, sum === 100, `got ${sum}`);
}

// After profile snap (no frozen), any subsequent single-slider move must still sum to 100
const noFreeze = [false, false, false, false, false];
for (const { name, vals } of profiles) {
  for (let idx = 0; idx < 5; idx++) {
    const result = redistribute(vals, noFreeze, idx, vals[idx]);
    const sum    = result.reduce((a, b) => a + b, 0);
    assert(`${name} post-snap redistribute idx=${idx} sums to 100`, sum === 100, `got ${sum}`);
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
