import { EX, ALT_REASONS, MOBILITY, CARDIO, DAYS, WEEK_TEMPLATES, SCHEDULE_HINT, LENGTH_CAP, QUICK_FOODS } from './data.js';
import { load, save, saveNow, defaultState, today, uid } from './store.js';

let state = load();
let tab = (() => { try { return localStorage.getItem('workoutpal.tab') || 'today'; } catch { return 'today'; } })();
let foodDate = today();
let trendEx = null;
let sheet = null;        // { mode: 'session'|'plan', idx|slotKey, reason }
let resetArmed = false;
let rest = null;         // { end, total }
let restTick = null;

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const fmt = (n, d = 0) => Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
const persist = () => save(state);
const SKIP = '__skip__';

// ---------------- Targets ----------------
export function maintenance(p) {
  const kg = p.weightLb * 0.4536, cm = p.heightIn * 2.54;
  const bmr = 10 * kg + 6.25 * cm - 5 * p.age + (p.sex === 'female' ? -161 : 5);
  const act = p.days >= 5 ? 1.6 : 1.55;
  return Math.round((bmr * act) / 10) * 10;
}
function targets() {
  const p = state.profile;
  const kcal = p.kcalMode === 'manual' ? p.kcalTarget : maintenance(p) - 500;
  const carbs = Math.max(0, Math.round((kcal - p.proteinG * 4 - p.fatG * 9) / 4));
  return { kcal, low: p.kcalMode === 'manual' ? p.kcalLow : kcal - 100, high: p.kcalMode === 'manual' ? p.kcalHigh : kcal + 100, p: p.proteinG, f: p.fatG, c: carbs };
}

// ---------------- Plan ----------------
function plan() {
  const p = state.profile;
  const keys = WEEK_TEMPLATES[p.days] || WEEK_TEMPLATES[4];
  const cap = LENGTH_CAP[p.sessionMin] || 6;
  return keys.map((k) => {
    const d = DAYS[k];
    let slots = d.slots.map((s, i) => ({ ...s, key: `${k}:${i}`, base: s.ex }));
    if (k !== 'cardio') slots = slots.slice(0, cap);
    slots = slots.map((s) => {
      let ex = state.swaps[s.key] && state.swaps[s.key] !== SKIP ? state.swaps[s.key] : s.ex;
      if (!p.rack && EX[ex].equip === 'Barbell rack') ex = EX[ex].alts.busy.find((a) => EX[a].equip !== 'Barbell rack') || ex;
      return { ...s, ex };
    }).filter((s) => state.swaps[s.key] !== SKIP);
    const removed = d.slots.map((s, i) => ({ ...s, key: `${k}:${i}` })).filter((s) => state.swaps[s.key] === SKIP);
    return { key: k, ...d, slots, removed };
  });
}
function nextDayKey() {
  const keys = plan().map((d) => d.key);
  const done = state.sessions.filter((s) => s.finished).sort((a, b) => b.startedAt - a.startedAt);
  if (!done.length) return keys[0];
  const i = keys.indexOf(done[0].dayKey);
  return keys[(i + 1) % keys.length];
}
const weekNum = () => Math.max(1, Math.floor((new Date(today()) - new Date(state.profile.startDate)) / 864e5 / 7) + 1);

// ---------------- History helpers ----------------
function lastSets(exId, excludeId) {
  const ss = state.sessions.filter((s) => s.id !== excludeId && s.finished).sort((a, b) => b.startedAt - a.startedAt);
  for (const s of ss) {
    const e = s.exercises.find((x) => x.ex === exId && x.sets.some((st) => st.done));
    if (e) return { date: s.date, sets: e.sets.filter((st) => st.done) };
  }
  return null;
}
const topOfRange = (reps) => { const m = String(reps).match(/(\d+)\s*-\s*(\d+)/); return m ? +m[2] : parseInt(reps) || 0; };
const bottomOfRange = (reps) => parseInt(reps) || 0;
const e1rm = (w, r) => (r > 0 && w > 0 ? w * (1 + Math.min(r, 15) / 30) : 0);

function suggestion(exId, reps, sessionId) {
  const last = lastSets(exId, sessionId);
  if (!last) return { w: '', text: 'First time: pick a weight you could do for 2-3 more reps than the target.' };
  const top = topOfRange(reps);
  const w = Math.max(...last.sets.map((s) => num(s.w)));
  const allTop = top && last.sets.every((s) => num(s.r) >= top);
  if (allTop && w > 0) {
    const eq = EX[exId].equip;
    const inc = eq === 'Barbell rack' || eq === 'Smith machine' ? (EX[exId].group.match(/Legs|Hamstrings/) ? 10 : 5) : 5;
    return { w: w + inc, text: `You hit ${top} on every set last time. Go up to ${w + inc}.` };
  }
  return { w: w || '', text: w ? `Stay at ${w} and beat last time's reps.` : 'Beat last time.' };
}

// ---------------- Session actions ----------------
function startSession(dayKey) {
  const d = plan().find((x) => x.key === dayKey);
  const id = uid();
  const s = {
    id, dayKey, dayName: d.name, date: today(), startedAt: Date.now(), finished: false,
    warmup: {}, exercises: d.slots.map((sl) => {
      const sug = suggestion(sl.ex, sl.reps, id);
      return { slotKey: sl.key, ex: sl.ex, planned: sl.ex, target: { sets: sl.sets, reps: sl.reps, rest: sl.rest }, sets: Array.from({ length: sl.sets }, () => ({ w: sug.w, r: '', done: false })) };
    }),
    cardio: { type: 'Incline treadmill', minutes: CARDIO[d.cardio].minutes, incline: CARDIO[d.cardio].incline, speed: CARDIO[d.cardio].speed, done: false, plan: d.cardio },
    mobility: d.mobility, notes: '',
  };
  state.sessions.push(s);
  state.activeId = id;
  persist();
  tab = 'today';
  render();
  window.scrollTo(0, 0);
}
const active = () => state.sessions.find((s) => s.id === state.activeId);

function walkKcal(min, incline, mph) {
  const v = mph * 26.82; // m/min
  const vo2 = 3.5 + 0.1 * v + 1.8 * v * (incline / 100);
  return Math.round((vo2 * state.profile.weightLb * 0.4536 / 1000) * 5 * min);
}

// ---------------- Rest timer ----------------
function startRest(sec) {
  rest = { end: Date.now() + sec * 1000, total: sec };
  clearInterval(restTick);
  restTick = setInterval(drawRest, 250);
  drawRest();
}
function stopRest() { rest = null; clearInterval(restTick); drawRest(); }
function drawRest() {
  const el = $('#rest');
  if (!rest) { el.hidden = true; return; }
  const left = Math.max(0, Math.round((rest.end - Date.now()) / 1000));
  el.hidden = false;
  el.querySelector('.rest-time').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  el.querySelector('.rest-bar i').style.width = `${(1 - left / rest.total) * 100}%`;
  el.classList.toggle('over', left === 0);
  if (left === 0 && !rest.buzzed) { rest.buzzed = true; try { navigator.vibrate?.([200, 100, 200]); } catch {} }
}

// ---------------- Charts ----------------
function lineChart(pts, { unit = '', goal = null, avg = false } = {}) {
  if (pts.length < 2) return `<p class="muted small">Log at least two entries to see a trend.</p>`;
  const W = 340, H = 170, L = 40, R = 10, T = 12, B = 24;
  const xs = pts.map((p) => +new Date(p.x)), ys = pts.map((p) => p.y);
  let y0 = Math.min(...ys, goal ?? Infinity), y1 = Math.max(...ys, goal ?? -Infinity);
  const pad = Math.max(2, (y1 - y0) * 0.12); y0 = Math.floor(y0 - pad); y1 = Math.ceil(y1 + pad);
  const x0 = Math.min(...xs), x1 = Math.max(...xs) || x0 + 1;
  const sx = (x) => L + ((x - x0) / (x1 - x0 || 1)) * (W - L - R);
  const sy = (y) => T + (1 - (y - y0) / (y1 - y0 || 1)) * (H - T - B);
  const ticks = 4, step = (y1 - y0) / ticks;
  let g = '';
  for (let i = 0; i <= ticks; i++) {
    const v = y0 + step * i;
    g += `<line x1="${L}" x2="${W - R}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/><text x="${L - 6}" y="${sy(v) + 4}" text-anchor="end" class="tick">${fmt(v)}</text>`;
  }
  const d = (p) => new Date(p).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  g += `<text x="${L}" y="${H - 6}" class="tick">${d(x0)}</text><text x="${W - R}" y="${H - 6}" text-anchor="end" class="tick">${d(x1)}</text>`;
  if (goal != null) g += `<line x1="${L}" x2="${W - R}" y1="${sy(goal)}" y2="${sy(goal)}" class="goal"/><text x="${W - R}" y="${sy(goal) - 4}" text-anchor="end" class="tick goal-t">Goal ${goal}${unit}</text>`;
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(+new Date(p.x)).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');
  const area = `${path}L${sx(xs[xs.length - 1])},${sy(y0)}L${sx(xs[0])},${sy(y0)}Z`;
  g += `<path d="${area}" class="area"/><path d="${path}" class="line ${avg ? 'thin' : ''}"/>`;
  if (avg) {
    const av = pts.map((p, i) => { const w = pts.slice(Math.max(0, i - 6), i + 1); return { x: p.x, y: w.reduce((a, b) => a + b.y, 0) / w.length }; });
    g += `<path d="${av.map((p, i) => `${i ? 'L' : 'M'}${sx(+new Date(p.x)).toFixed(1)},${sy(p.y).toFixed(1)}`).join('')}" class="line"/>`;
  }
  const lp = pts[pts.length - 1];
  g += `<circle cx="${sx(+new Date(lp.x))}" cy="${sy(lp.y)}" r="4" class="dot"/>`;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend chart">${g}</svg></div>`;
}

// ---------------- Views ----------------
function viewToday() {
  const s = active();
  if (s) return viewSession(s);
  const pl = plan();
  const nk = nextDayKey();
  const nd = pl.find((d) => d.key === nk);
  const t = targets();
  const eaten = (state.foods[today()] || []).reduce((a, f) => a + num(f.kcal), 0);
  const prot = (state.foods[today()] || []).reduce((a, f) => a + num(f.p), 0);
  const lastW = [...state.weights].sort((a, b) => a.date.localeCompare(b.date)).pop();
  const done = state.sessions.filter((x) => x.finished);
  const thisWeek = done.filter((x) => (Date.now() - x.startedAt) / 864e5 < 7).length;
  return `
  <header class="top"><p class="eyebrow">Week ${weekNum()} · ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p><h1>Up next</h1></header>
  <section class="hero card">
    <div class="hero-head"><div><p class="eyebrow">${esc(nd.focus)}</p><h2>${esc(nd.name)}</h2></div><span class="pill">${nd.slots.length} lifts · ${CARDIO[nd.cardio].minutes} min walk</span></div>
    <ol class="mini-list">${nd.slots.map((sl) => `<li><span>${esc(EX[sl.ex].name)}</span><span class="mono">${sl.sets}×${esc(sl.reps)}</span></li>`).join('')}</ol>
    <button class="btn primary big" data-act="start" data-day="${nk}">Start ${esc(nd.name)}</button>
  </section>
  <section class="stats">
    <div class="stat"><span class="eyebrow">This week</span><b>${thisWeek}<small>/${state.profile.days}</small></b><span class="muted small">sessions</span></div>
    <div class="stat"><span class="eyebrow">Food today</span><b>${fmt(Math.max(0, t.kcal - eaten))}</b><span class="muted small">kcal left · ${fmt(prot)}/${t.p} g protein</span></div>
    <div class="stat"><span class="eyebrow">Weight</span><b>${lastW ? fmt(lastW.lb, 1) : '-'}</b><span class="muted small">${lastW ? fmt(lastW.lb - state.profile.goalLb, 1) + ' lb to goal' : 'log a weigh-in'}</span></div>
  </section>
  <section>
    <h3 class="section-h">Start a different day</h3>
    <div class="day-grid">${pl.filter((d) => d.key !== nk).map((d) => `<button class="day-btn" data-act="start" data-day="${d.key}"><b>${esc(d.name)}</b><span class="muted small">${esc(d.focus)}</span></button>`).join('')}</div>
  </section>`;
}

function viewSession(s) {
  const mob = MOBILITY[s.mobility];
  const mins = Math.round((Date.now() - s.startedAt) / 60000);
  const doneSets = s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
  const allSets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
  const c = s.cardio;
  return `
  <header class="top"><p class="eyebrow">In progress · ${mins} min · ${doneSets}/${allSets} sets</p><h1>${esc(s.dayName)}</h1></header>
  ${(() => { const prev = state.sessions.filter((x) => x.finished && x.dayKey === s.dayKey && x.notes && x.notes.trim()).sort((a, b) => b.startedAt - a.startedAt)[0]; return prev ? `<section class="card last-note"><p class="eyebrow">Your note from last ${esc(s.dayName)} · ${new Date(prev.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p><p>${esc(prev.notes)}</p><p class="small muted">Want to change the plan because of it? Use Swap below, or Plan → Change to make it stick.</p></section>` : ''; })()}
  <details class="card warm" ${Object.keys(s.warmup).length < mob.items.length ? 'open' : ''}>
    <summary><span><b>${esc(mob.name)}</b> <span class="muted small">~${mob.minutes} min</span></span><span class="pill">${Object.values(s.warmup).filter(Boolean).length}/${mob.items.length}</span></summary>
    <ul class="checks">${mob.items.map((m, i) => `<li><label><input type="checkbox" id="wu-${i}" data-act="warm" data-i="${i}" ${s.warmup[i] ? 'checked' : ''}><span><b>${esc(m.name)}</b> <span class="mono small">${esc(m.dose)}</span><br><span class="muted small">${esc(m.why)}</span></span></label></li>`).join('')}</ul>
  </details>
  ${s.exercises.map((e, i) => exCard(s, e, i)).join('')}
  <section class="card">
    <div class="ex-head"><div><p class="eyebrow">Cardio</p><h3>${esc(CARDIO[c.plan].label)}</h3></div>${c.done ? '<span class="pill good">Done</span>' : ''}</div>
    <p class="muted small">${esc(CARDIO[c.plan].note)}</p>
    <div class="cardio-grid">
      <label>Type<select id="c-type" data-cf="type">${['Incline treadmill', 'Stairmaster', 'Bike', 'Elliptical', 'Rower'].map((t) => `<option ${t === c.type ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label>Minutes<input id="c-min" inputmode="decimal" data-cf="minutes" value="${esc(c.minutes)}"></label>
      ${c.type === 'Incline treadmill' ? `<label>Incline %<input id="c-inc" inputmode="decimal" data-cf="incline" value="${esc(c.incline)}"></label><label>Speed mph<input id="c-spd" inputmode="decimal" data-cf="speed" value="${esc(c.speed)}"></label>` : ''}
    </div>
    ${c.type === 'Incline treadmill' ? `<p class="small muted" id="c-est">≈ ${fmt(walkKcal(num(c.minutes), num(c.incline), num(c.speed)))} kcal burned (estimate)</p>` : ''}
    <button class="btn ${c.done ? '' : 'primary'}" data-act="cardio-done">${c.done ? 'Mark not done' : 'Mark cardio done'}</button>
  </section>
  <label class="card notes">Notes<textarea id="s-notes" rows="2" data-act="notes" placeholder="How did it feel? Elbow ok?">${esc(s.notes)}</textarea></label>
  <div class="row end">
    <button class="btn ghost" data-act="discard">Discard</button>
    <button class="btn primary big" data-act="finish">Finish workout</button>
  </div>`;
}

function exCard(s, e, i) {
  const x = EX[e.ex];
  const last = lastSets(e.ex, s.id);
  const sug = suggestion(e.ex, e.target.reps, s.id);
  const swapped = e.ex !== e.planned;
  return `
  <section class="card ex ${e.sets.every((st) => st.done) ? 'complete' : ''}" id="ex-${i}">
    <div class="ex-head">
      <div><p class="eyebrow">${esc(x.group)} · ${esc(x.equip)}${swapped ? ' · swapped' : ''}</p><h3>${esc(x.name)}</h3></div>
      <button class="btn small" data-act="swap" data-i="${i}" aria-label="Swap exercise">Swap</button>
    </div>
    <p class="target"><span class="mono">${e.target.sets} × ${esc(e.target.reps)}</span> · rest ${Math.floor(e.target.rest / 60)}:${String(e.target.rest % 60).padStart(2, '0')}</p>
    <p class="small">${esc(sug.text)}${last ? ` <span class="muted">Last (${esc(last.date.slice(5))}): ${last.sets.map((st) => `${esc(st.w)}×${esc(st.r)}`).join(', ')}</span>` : ''}</p>
    <details class="cues"><summary>Form cues${x.elbow ? ' + elbow note' : ''}</summary><p class="small">${esc(x.cues)}</p>${x.elbow ? `<p class="small elbow"><b>Right elbow:</b> ${esc(x.elbow)}</p>` : ''}</details>
    <div class="sets">
      <div class="set-row head"><span>Set</span><span>lb</span><span>Reps</span><span></span></div>
      ${e.sets.map((st, j) => `
      <div class="set-row ${st.done ? 'done' : ''}">
        <span class="mono">${j + 1}</span>
        <input id="w-${i}-${j}" inputmode="decimal" aria-label="Weight set ${j + 1}" data-set="w" data-i="${i}" data-j="${j}" value="${esc(st.w)}" placeholder="lb">
        <input id="r-${i}-${j}" inputmode="numeric" aria-label="Reps set ${j + 1}" data-set="r" data-i="${i}" data-j="${j}" value="${esc(st.r)}" placeholder="${esc(last?.sets[j]?.r || bottomOfRange(e.target.reps) || '')}">
        <button class="check" data-act="set-done" data-i="${i}" data-j="${j}" aria-label="Complete set ${j + 1}">${st.done ? '✓' : ''}</button>
      </div>`).join('')}
    </div>
    <div class="row"><button class="btn small ghost" data-act="add-set" data-i="${i}">+ Set</button>${e.sets.length > 1 ? `<button class="btn small ghost" data-act="rm-set" data-i="${i}">− Set</button>` : ''}</div>
  </section>`;
}

function viewPlan() {
  const p = state.profile;
  const pl = plan();
  return `
  <header class="top"><p class="eyebrow">Week ${weekNum()} of your plan</p><h1>Your plan</h1></header>
  <section class="card">
    <h3>Build it</h3>
    <div class="seg-group">
      <span class="lbl">Days per week</span>
      <div class="seg">${[4, 5].map((d) => `<button data-act="pset" data-k="days" data-v="${d}" class="${p.days === d ? 'on' : ''}">${d}</button>`).join('')}</div>
    </div>
    <div class="seg-group">
      <span class="lbl">Session length</span>
      <div class="seg">${[45, 60, 75].map((d) => `<button data-act="pset" data-k="sessionMin" data-v="${d}" class="${p.sessionMin === d ? 'on' : ''}">${d} min</button>`).join('')}</div>
    </div>
    <label class="toggle"><input type="checkbox" id="p-rack" data-act="rack" ${p.rack ? 'checked' : ''}><span>Barbell racks available</span></label>
    <p class="small muted">${esc(SCHEDULE_HINT[p.days])}</p>
  </section>
  <section class="card how">
    <h3>How it progresses</h3>
    <ul class="small">
      <li><b>Double progression.</b> Each lift has a rep range. When you hit the top of it on every set, add weight next time: 5 lb for dumbbells and upper body, 10 lb for barbell legs. The Today screen tells you when.</li>
      <li><b>Weeks 1-2:</b> leave 3 reps in the tank. You're coming back from 6 months off, so let tendons catch up.</li>
      <li><b>Week 3 on:</b> leave 1-2 reps in the tank on main lifts.</li>
      <li><b>Every 6th week:</b> same exercises, cut sets in half and drop the weight about 10%.</li>
      <li><b>Cardio:</b> 15 min incline walk after every lift, plus one long walk day. Add 5 min or 1% incline per week.</li>
      <li><b>On 2,000-2,200 kcal</b> strength may dip a little. Keep protein high, sleep 7+ hours, and if your main lifts drop 2 weeks in a row, eat 200 more on lifting days.</li>
    </ul>
  </section>
  <section class="card elbow-card">
    <h3>Right elbow rules</h3>
    <ul class="small">
      <li>Press and pull to your end range. Never shrug, lean or bounce to force a lockout.</li>
      <li>Dumbbells, cables and neutral grips come first because each arm moves on its own path.</li>
      <li>On barbell bench, stop both arms where the right one stops so the bar stays level.</li>
      <li>No skull crushers or straight-bar curls. Hammer curls and single-arm pushdowns replace them.</li>
      <li>If a move pinches, use Swap → "Doesn't feel right". Pain at the joint means swap; muscle burn is fine.</li>
    </ul>
  </section>
  ${pl.map((d) => `
  <section class="card">
    <div class="ex-head"><div><p class="eyebrow">${esc(d.focus)}</p><h3>${esc(d.name)}</h3></div><button class="btn small" data-act="start" data-day="${d.key}">Start</button></div>
    <ol class="plan-list">${d.slots.map((sl) => `<li><div><b>${esc(EX[sl.ex].name)}</b>${sl.ex !== sl.base ? ' <span class="pill tiny">swapped</span>' : ''}<br><span class="muted small">${sl.sets} × ${esc(sl.reps)} · ${EX[sl.ex].equip}</span></div><button class="btn small ghost" data-act="plan-swap" data-k="${sl.key}">Change</button></li>`).join('')}
    ${d.removed.map((sl) => `<li class="removed"><div><s>${esc(EX[sl.ex].name)}</s><br><span class="muted small">Removed</span></div><button class="btn small ghost" data-act="restore" data-k="${sl.key}">Add back</button></li>`).join('')}
    <li><div><b>${esc(CARDIO[d.cardio].label)}</b><br><span class="muted small">${CARDIO[d.cardio].minutes} min · ${CARDIO[d.cardio].incline}% · ${CARDIO[d.cardio].speed} mph</span></div></li></ol>
  </section>`).join('')}
  <section class="card">
    <h3>${esc(MOBILITY.long.name)}</h3>
    <ul class="plain small">${MOBILITY.long.items.map((m) => `<li><b>${esc(m.name)}</b> <span class="mono">${esc(m.dose)}</span><br><span class="muted">${esc(m.why)}</span></li>`).join('')}</ul>
  </section>
  ${Object.keys(state.swaps).length ? '<button class="btn ghost" data-act="clear-swaps">Reset all plan changes</button>' : ''}`;
}

function bar(label, v, t, unit, low, high) {
  const max = Math.max(t, high || 0) * 1.25;
  const pct = Math.min(100, (v / max) * 100);
  const over = high ? v > high : false;
  const inBand = low && high && v >= low && v <= high;
  return `<div class="macro"><div class="macro-top"><span>${label}</span><span class="mono">${fmt(v)}<span class="muted"> / ${fmt(t)}${unit}</span></span></div>
  <div class="track">${low && high ? `<i class="band" style="left:${(low / max) * 100}%;width:${((high - low) / max) * 100}%"></i>` : ''}<i class="fill ${over ? 'over' : inBand ? 'good' : ''}" style="width:${pct}%"></i><i class="mark" style="left:${(t / max) * 100}%"></i></div></div>`;
}

function viewFood() {
  const t = targets();
  const list = state.foods[foodDate] || [];
  const tot = list.reduce((a, f) => ({ kcal: a.kcal + num(f.kcal), p: a.p + num(f.p), c: a.c + num(f.c), f: a.f + num(f.f) }), { kcal: 0, p: 0, c: 0, f: 0 });
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const isToday = foodDate === today();
  const dlabel = isToday ? 'Today' : new Date(foodDate + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const favs = [...state.savedFoods, ...QUICK_FOODS];
  return `
  <header class="top"><p class="eyebrow">Target ${fmt(t.low)}-${fmt(t.high)} kcal</p>
    <div class="date-nav"><button class="btn small ghost" data-act="fday" data-d="-1" aria-label="Previous day">‹</button><h1>${dlabel}</h1><button class="btn small ghost" data-act="fday" data-d="1" aria-label="Next day" ${isToday ? 'disabled' : ''}>›</button></div></header>
  <section class="card">
    <div class="kcal-big"><b>${fmt(tot.kcal)}</b><span class="muted">kcal eaten · ${tot.kcal > t.high ? `<span class="warn">${fmt(tot.kcal - t.high)} over</span>` : `${fmt(Math.max(0, t.kcal - tot.kcal))} left`}</span></div>
    ${bar('Calories', tot.kcal, t.kcal, '', t.low, t.high)}
    ${bar('Protein', tot.p, t.p, ' g')}
    ${bar('Carbs', tot.c, t.c, ' g')}
    ${bar('Fat', tot.f, t.f, ' g')}
  </section>
  <section class="card">
    <h3>Add food</h3>
    <form id="food-form" class="food-form">
      <label class="wide">Food<input id="f-name" name="name" required placeholder="e.g. Chicken + rice" list="food-list" autocomplete="off"></label>
      <datalist id="food-list">${favs.map((f) => `<option value="${esc(f.name)}"></option>`).join('')}</datalist>
      <label>kcal<input id="f-kcal" name="kcal" inputmode="decimal" required></label>
      <label>Protein g<input id="f-p" name="p" inputmode="decimal"></label>
      <label>Carbs g<input id="f-c" name="c" inputmode="decimal"></label>
      <label>Fat g<input id="f-f" name="f" inputmode="decimal"></label>
      <label>Meal<select id="f-meal" name="meal">${meals.map((m) => `<option ${m === guessMeal() ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
      <label class="toggle wide"><input type="checkbox" id="f-save" name="save"><span>Save to my foods</span></label>
      <button class="btn primary wide" type="submit">Add</button>
    </form>
    <h4 class="section-h">Quick add</h4>
    <div class="chips">${favs.slice(0, 24).map((f, i) => `<button class="chip ${i < state.savedFoods.length ? 'mine' : ''}" data-act="quick" data-i="${i}"><span>${esc(f.name)}</span><span class="mono">${f.kcal} · ${f.p}p</span></button>`).join('')}</div>
  </section>
  ${meals.map((m) => { const items = list.filter((f) => f.meal === m); if (!items.length) return ''; return `
  <section class="card"><div class="ex-head"><h3>${m}</h3><span class="mono muted">${fmt(items.reduce((a, f) => a + num(f.kcal), 0))} kcal</span></div>
    <ul class="food-list">${items.map((f) => `<li><div><b>${esc(f.name)}</b><br><span class="muted small mono">${fmt(num(f.kcal))} kcal · P ${fmt(num(f.p))} · C ${fmt(num(f.c))} · F ${fmt(num(f.f))}</span></div><button class="btn small ghost" data-act="rm-food" data-id="${f.id}" aria-label="Remove ${esc(f.name)}">✕</button></li>`).join('')}</ul></section>`; }).join('')}
  ${!list.length ? `<p class="muted center">Nothing logged ${isToday ? 'yet today' : 'this day'}. Use quick add or type a food above.</p>` : ''}
  <section class="card how">
    <h3>Eating at ${fmt(t.low)}-${fmt(t.high)}</h3>
    <ul class="small">
      <li>Hit protein first: about ${Math.round(t.p / 4)} g at each of 4 meals. It keeps you full and protects muscle in a big deficit.</li>
      <li>Put most of your carbs before and after lifting so sessions still feel strong.</li>
      <li>Big-volume foods are your friend: potatoes, berries, Greek yogurt, egg whites, veggies, lean meat.</li>
      <li>Weigh in every morning; judge progress by the weekly average, not single days.</li>
    </ul>
  </section>`;
}
function guessMeal() { const h = new Date().getHours(); return h < 10 ? 'Breakfast' : h < 15 ? 'Lunch' : h < 17 ? 'Snack' : 'Dinner'; }

function viewProgress() {
  const ws = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = ws[0], last = ws[ws.length - 1];
  const goal = state.profile.goalLb;
  let rate = null, eta = '', span = 0;
  if (ws.length >= 2) {
    const days = (new Date(last.date) - new Date(first.date)) / 864e5; span = days;
    if (days >= 7) {
      rate = ((first.lb - last.lb) / days) * 7;
      if (rate > 0.1) { const wk = (last.lb - goal) / rate; const d = new Date(Date.now() + wk * 7 * 864e5); eta = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }); }
    }
  }
  const done = state.sessions.filter((s) => s.finished).sort((a, b) => b.startedAt - a.startedAt);
  const exWithHist = [...new Set(done.flatMap((s) => s.exercises.filter((e) => e.sets.some((x) => x.done && num(x.w) > 0)).map((e) => e.ex)))];
  if (!trendEx || !exWithHist.includes(trendEx)) trendEx = exWithHist[0] || null;
  const trend = trendEx ? done.slice().reverse().map((s) => { const e = s.exercises.find((x) => x.ex === trendEx); if (!e) return null; const best = Math.max(0, ...e.sets.filter((x) => x.done).map((x) => e1rm(num(x.w), num(x.r)))); return best ? { x: s.date, y: Math.round(best) } : null; }).filter(Boolean) : [];
  return `
  <header class="top"><p class="eyebrow">${first ? `Since ${new Date(first.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Progress'}</p><h1>Progress</h1></header>
  <section class="card">
    <div class="ex-head"><h3>Body weight</h3><span class="mono">${last ? fmt(last.lb, 1) : '-'} lb</span></div>
    <div class="stats tight">
      <div class="stat"><span class="eyebrow">Change</span><b>${last && first ? (last.lb - first.lb > 0 ? '+' : '') + fmt(last.lb - first.lb, 1) : '0'}</b></div>
      <div class="stat"><span class="eyebrow">To goal</span><b>${last ? fmt(Math.max(0, last.lb - goal), 1) : '-'}</b></div>
      <div class="stat"><span class="eyebrow">Per week</span><b>${rate != null ? fmt(-rate, 1) : '-'}</b></div>
    </div>
    ${lineChart(ws.map((w) => ({ x: w.date, y: w.lb })), { unit: ' lb', goal, avg: ws.length > 6 })}
    ${eta ? `<p class="small">At this pace you reach ${goal} lb around <b>${eta}</b>.</p>` : ''}
    ${rate != null && rate > 2.5 && span >= 14 ? '<p class="small warn">Losing more than 2.5 lb a week after the first couple of weeks usually costs strength. Consider eating toward 2,200.</p>' : ''}
    <form id="w-form" class="row">
      <input id="w-date" type="date" name="date" value="${today()}" max="${today()}" aria-label="Date">
      <input id="w-lb" name="lb" inputmode="decimal" placeholder="lb" required aria-label="Weight in pounds">
      <button class="btn primary" type="submit">Log</button>
    </form>
  </section>
  <section class="card">
    <h3>Strength trend</h3>
    ${exWithHist.length ? `<label>Exercise<select id="trend-ex" data-act="trend">${exWithHist.map((id) => `<option value="${id}" ${id === trendEx ? 'selected' : ''}>${esc(EX[id].name)}</option>`).join('')}</select></label>
    <p class="small muted">Estimated 1-rep max from your best set each session.</p>${lineChart(trend, { unit: ' lb' })}` : '<p class="muted small">Finish a workout to start seeing strength trends.</p>'}
  </section>
  <section class="card">
    <h3>History</h3>
    ${done.length ? `<ul class="hist">${done.slice(0, 40).map((s) => { const sets = s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0); const vol = s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).reduce((b, x) => b + num(x.w) * num(x.r), 0), 0); return `<li><details><summary><span><b>${esc(s.dayName)}</b><br><span class="muted small">${new Date(s.date + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${sets} sets · ${fmt(vol)} lb · ${s.cardio.done ? s.cardio.minutes + ' min cardio' : 'no cardio'}</span></span></summary>
      <ul class="plain small">${s.exercises.filter((e) => e.sets.some((x) => x.done)).map((e) => `<li><b>${esc(EX[e.ex].name)}</b> <span class="mono">${e.sets.filter((x) => x.done).map((x) => `${esc(x.w)}×${esc(x.r)}`).join(', ')}</span></li>`).join('')}</ul>
      ${s.notes ? `<p class="small muted">${esc(s.notes)}</p>` : ''}<button class="btn small ghost" data-act="rm-session" data-id="${s.id}">Delete session</button></details></li>`; }).join('')}</ul>` : '<p class="muted small">No workouts yet.</p>'}
  </section>`;
}

function viewMe() {
  const p = state.profile;
  const t = targets();
  const ft = Math.floor(p.heightIn / 12), inch = p.heightIn % 12;
  return `
  <header class="top"><p class="eyebrow">Settings</p><h1>You</h1></header>
  <section class="card">
    <h3>Profile</h3>
    <div class="form-grid">
      <label>Age<input id="m-age" inputmode="numeric" data-pf="age" value="${p.age}"></label>
      <label>Sex<select id="m-sex" data-pf="sex"><option value="male" ${p.sex === 'male' ? 'selected' : ''}>Male</option><option value="female" ${p.sex === 'female' ? 'selected' : ''}>Female</option></select></label>
      <label>Height ft<input id="m-ft" inputmode="numeric" data-pf="ft" value="${ft}"></label>
      <label>Height in<input id="m-in" inputmode="numeric" data-pf="in" value="${inch}"></label>
      <label>Current lb<input id="m-wt" inputmode="decimal" data-pf="weightLb" value="${p.weightLb}"></label>
      <label>Goal lb<input id="m-goal" inputmode="decimal" data-pf="goalLb" value="${p.goalLb}"></label>
    </div>
  </section>
  <section class="card">
    <h3>Daily targets</h3>
    <p class="small muted">Estimated maintenance at ${fmt(p.weightLb)} lb: about ${fmt(maintenance(p))} kcal. Your target is ${fmt(maintenance(p) - t.kcal)} below that.</p>
    <div class="form-grid">
      <label>Calories<input id="m-kcal" inputmode="numeric" data-pf="kcalTarget" value="${p.kcalTarget}"></label>
      <label>Range low<input id="m-lo" inputmode="numeric" data-pf="kcalLow" value="${p.kcalLow}"></label>
      <label>Range high<input id="m-hi" inputmode="numeric" data-pf="kcalHigh" value="${p.kcalHigh}"></label>
      <label>Protein g<input id="m-p" inputmode="numeric" data-pf="proteinG" value="${p.proteinG}"></label>
      <label>Fat g<input id="m-f" inputmode="numeric" data-pf="fatG" value="${p.fatG}"></label>
      <label>Carbs g<input id="m-c" value="${t.c}" disabled></label>
    </div>
    <p class="small muted">Carbs fill whatever calories protein and fat leave.</p>
  </section>
  <section class="card">
    <h3>Your data</h3>
    <p class="small muted">Everything is stored on this phone only. Export a backup now and then, or to move to a new phone.</p>
    <div class="row wrap">
      <button class="btn" data-act="export">Export backup</button>
      <label class="btn file">Import backup<input id="m-import" type="file" accept="application/json,.json" data-act="import" hidden></label>
      <button class="btn ${resetArmed ? 'danger' : 'ghost'}" data-act="reset">${resetArmed ? 'Tap again to erase everything' : 'Erase all data'}</button>
    </div>
    <p class="small muted" id="data-msg"></p>
  </section>`;
}

function viewSheet() {
  if (!sheet) return '';
  let cur, planned, title;
  if (sheet.mode === 'session') {
    const e = active().exercises[sheet.idx];
    cur = e.ex; planned = e.planned; title = 'Swap for today';
  } else {
    const sl = plan().flatMap((d) => d.slots).find((x) => x.key === sheet.key);
    cur = sl.ex; planned = sl.base; title = 'Change in your plan';
  }
  const x = EX[cur];
  const r = sheet.reason;
  const alts = [...new Set(x.alts[r].concat(EX[planned].alts[r] || []))].filter((a) => a !== cur);
  const more = Object.keys(EX).filter((k) => EX[k].group === x.group && k !== cur && !alts.includes(k));
  const item = (id, why) => `<button class="alt" data-act="pick" data-ex="${id}"><span><b>${esc(EX[id].name)}</b><br><span class="muted small">${esc(EX[id].equip)}${why ? ' · ' + why : ''}</span>${EX[id].elbow ? `<br><span class="small elbow">${esc(EX[id].elbow)}</span>` : ''}</span><span class="go">›</span></button>`;
  return `
  <div class="scrim" data-act="close-sheet"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="${title}">
    <div class="grab"></div>
    <p class="eyebrow">${title}</p>
    <h3>${esc(x.name)}</h3>
    <div class="seg full">${Object.entries(ALT_REASONS).map(([k, v]) => `<button data-act="reason" data-r="${k}" class="${r === k ? 'on' : ''}">${v.short}</button>`).join('')}</div>
    <p class="small muted">${esc(ALT_REASONS[r].label)}: try one of these.</p>
    <div class="alts">${alts.map((a) => item(a, '')).join('')}</div>
    ${cur !== planned ? `<h4 class="section-h">Back to the original</h4><div class="alts">${item(planned, 'planned')}</div>` : ''}
    ${more.length ? `<details><summary class="small">More ${esc(x.group.toLowerCase())} options</summary><div class="alts">${more.map((a) => item(a, '')).join('')}</div></details>` : ''}
    <details><summary class="small">Pick any exercise</summary>${[...new Set(Object.values(EX).map((e) => e.group))].map((g) => `<h4 class="section-h">${esc(g)}</h4><div class="alts">${Object.keys(EX).filter((k) => EX[k].group === g && k !== cur).map((a) => item(a, '')).join('')}</div>`).join('')}</details>
    <button class="btn ghost full" data-act="drop">${sheet.mode === 'session' ? 'Skip it today' : 'Remove from my plan'}</button>
    ${sheet.mode === 'session' ? `<label class="toggle"><input type="checkbox" id="sh-keep" ${sheet.keep ? 'checked' : ''} data-act="keep"><span>Also make this change in my plan (swap or skip)</span></label>` : ''}
    <button class="btn ghost full" data-act="close-sheet">Cancel</button>
  </div>`;
}

// ---------------- Render ----------------
const VIEWS = { today: viewToday, plan: viewPlan, food: viewFood, progress: viewProgress, me: viewMe };
function render() {
  $('#view').innerHTML = VIEWS[tab]();
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  $('#sheet').innerHTML = viewSheet();
  document.body.classList.toggle('sheet-open', !!sheet);
  drawRest();
}

// ---------------- Events ----------------
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-tab]');
  if (t) { tab = t.dataset.tab; resetArmed = false; try { localStorage.setItem('workoutpal.tab', tab); } catch {} render(); window.scrollTo(0, 0); return; }
  const a = ev.target.closest('[data-act]');
  if (!a) return;
  const act = a.dataset.act;
  const s = active();
  const i = +a.dataset.i, j = +a.dataset.j;
  switch (act) {
    case 'start':
      if (s && !s.finished) { tab = 'today'; render(); toast('Finish or discard the current workout first.'); return; }
      startSession(a.dataset.day); return;
    case 'warm': s.warmup[i] = a.checked; persist(); { const pill = $('.warm .pill'); if (pill) pill.textContent = `${Object.values(s.warmup).filter(Boolean).length}/${MOBILITY[s.mobility].items.length}`; } return;
    case 'set-done': {
      const st = s.exercises[i].sets[j];
      if (!st.done) {
        const rIn = $(`#r-${i}-${j}`), wIn = $(`#w-${i}-${j}`);
        st.w = wIn.value; st.r = rIn.value || rIn.placeholder;
        st.done = true;
        // carry the weight forward to the next empty set
        const nx = s.exercises[i].sets[j + 1];
        if (nx && !nx.done) nx.w = st.w;
        startRest(s.exercises[i].target.rest);
      } else st.done = false;
      persist(); render(); return;
    }
    case 'add-set': { const ss = s.exercises[i].sets; ss.push({ w: ss[ss.length - 1]?.w || '', r: '', done: false }); persist(); render(); return; }
    case 'rm-set': s.exercises[i].sets.pop(); persist(); render(); return;
    case 'swap': sheet = { mode: 'session', idx: i, reason: 'busy', keep: false }; render(); return;
    case 'plan-swap': sheet = { mode: 'plan', key: a.dataset.k, reason: 'busy' }; render(); return;
    case 'reason': sheet.reason = a.dataset.r; render(); return;
    case 'keep': sheet.keep = a.checked; return;
    case 'close-sheet': sheet = null; render(); return;
    case 'pick': {
      const id = a.dataset.ex;
      if (sheet.mode === 'session') {
        const e = s.exercises[sheet.idx];
        const sug = suggestion(id, e.target.reps, s.id);
        e.ex = id;
        e.sets = e.sets.map((st) => (st.done ? st : { w: sug.w, r: '', done: false }));
        if (sheet.keep) setSwap(e.slotKey, id);
        toast(`Swapped to ${EX[id].name}`);
      } else {
        setSwap(sheet.key, id);
        toast('Plan updated');
      }
      sheet = null; persist(); render(); return;
    }
    case 'drop': {
      if (sheet.mode === 'session') {
        const e = s.exercises[sheet.idx];
        if (sheet.keep) state.swaps[e.slotKey] = SKIP;
        s.exercises.splice(sheet.idx, 1);
        toast(sheet.keep ? `Removed ${EX[e.ex].name} from your plan` : `Skipped ${EX[e.ex].name}`);
      } else {
        state.swaps[sheet.key] = SKIP;
        toast('Removed from your plan');
      }
      sheet = null; persist(); render(); return;
    }
    case 'restore': delete state.swaps[a.dataset.k]; persist(); render(); toast('Added back'); return;
    case 'cardio-done': s.cardio.done = !s.cardio.done; persist(); render(); return;
    case 'finish': {
      s.finished = true; s.endedAt = Date.now(); state.activeId = null; stopRest(); saveNow(state);
      const sets = s.exercises.reduce((x, e) => x + e.sets.filter((q) => q.done).length, 0);
      toast(`Nice work. ${sets} sets logged.`); render(); window.scrollTo(0, 0); return;
    }
    case 'discard':
      if (a.dataset.armed) { state.sessions = state.sessions.filter((x) => x.id !== s.id); state.activeId = null; stopRest(); persist(); render(); return; }
      a.dataset.armed = '1'; a.textContent = 'Tap again to discard'; a.classList.add('danger'); return;
    case 'pset': state.profile[a.dataset.k] = +a.dataset.v; persist(); render(); return;
    case 'rack': state.profile.rack = a.checked; persist(); render(); return;
    case 'clear-swaps': state.swaps = {}; persist(); render(); return;
    case 'fday': { const d = new Date(foodDate + 'T12:00'); d.setDate(d.getDate() + +a.dataset.d); const n = today(d); if (n <= today()) { foodDate = n; render(); } return; }
    case 'quick': {
      const f = [...state.savedFoods, ...QUICK_FOODS][i];
      addFood({ name: f.name, kcal: f.kcal, p: f.p, c: f.c, f: f.f, meal: $('#f-meal')?.value || guessMeal() });
      toast(`Added ${f.name}`); return;
    }
    case 'rm-food': state.foods[foodDate] = (state.foods[foodDate] || []).filter((f) => f.id !== a.dataset.id); persist(); render(); return;
    case 'rm-session':
      if (a.dataset.armed) { state.sessions = state.sessions.filter((x) => x.id !== a.dataset.id); persist(); render(); return; }
      a.dataset.armed = '1'; a.textContent = 'Tap again to delete'; a.classList.add('danger'); return;
    case 'export': exportData(); return;
    case 'reset':
      if (!resetArmed) { resetArmed = true; render(); return; }
      state = defaultState(); resetArmed = false; saveNow(state); render(); toast('All data erased'); return;
    case 'rest-add': if (rest) { rest.end += 30000; rest.total += 30; rest.buzzed = false; } return;
    case 'rest-skip': stopRest(); return;
  }
});

function setSwap(key, id) {
  const base = DAYS[key.split(':')[0]].slots[+key.split(':')[1]].ex;
  if (id === base) delete state.swaps[key]; else state.swaps[key] = id;
}

function addFood(f) {
  (state.foods[foodDate] ||= []).push({ id: uid(), ...f });
  persist(); render();
}

document.addEventListener('change', (ev) => {
  const el = ev.target;
  const s = active();
  if (el.dataset.set) { const st = s.exercises[+el.dataset.i].sets[+el.dataset.j]; st[el.dataset.set] = el.value; persist(); return; }
  if (el.dataset.cf) { s.cardio[el.dataset.cf] = el.value; persist(); if (el.dataset.cf === 'type') render(); else { const est = $('#c-est'); if (est) est.textContent = `≈ ${fmt(walkKcal(num(s.cardio.minutes), num(s.cardio.incline), num(s.cardio.speed)))} kcal burned (estimate)`; } return; }
  if (el.dataset.act === 'notes') { s.notes = el.value; persist(); return; }
  if (el.dataset.act === 'trend') { trendEx = el.value; render(); return; }
  if (el.dataset.act === 'import') { importData(el.files[0]); return; }
  if (el.dataset.pf) {
    const p = state.profile, k = el.dataset.pf;
    if (k === 'sex') p.sex = el.value;
    else if (k === 'ft') p.heightIn = num(el.value) * 12 + (p.heightIn % 12);
    else if (k === 'in') p.heightIn = Math.floor(p.heightIn / 12) * 12 + num(el.value);
    else p[k] = num(el.value);
    persist(); render(); return;
  }
});

document.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  if (ev.target.id === 'food-form') {
    const f = { name: fd.get('name').trim(), kcal: num(fd.get('kcal')), p: num(fd.get('p')), c: num(fd.get('c')), f: num(fd.get('f')), meal: fd.get('meal') };
    if (!f.name) return;
    if (fd.get('save') && !state.savedFoods.some((x) => x.name === f.name)) state.savedFoods.unshift({ name: f.name, kcal: f.kcal, p: f.p, c: f.c, f: f.f });
    addFood(f); toast(`Added ${f.name}`);
  }
  if (ev.target.id === 'w-form') {
    const lb = num(fd.get('lb')), date = fd.get('date') || today();
    if (lb < 50) return;
    state.weights = state.weights.filter((w) => w.date !== date);
    state.weights.push({ date, lb });
    if (date >= state.weights.map((w) => w.date).sort().pop()) state.profile.weightLb = lb;
    persist(); render(); toast(`Logged ${lb} lb`);
  }
});

// Autofill macros when a known food name is typed.
document.addEventListener('input', (ev) => {
  if (ev.target.id !== 'f-name') return;
  const f = [...state.savedFoods, ...QUICK_FOODS].find((x) => x.name === ev.target.value);
  if (f) { $('#f-kcal').value = f.kcal; $('#f-p').value = f.p; $('#f-c').value = f.c; $('#f-f').value = f.f; }
});

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `workout-pal-backup-${today()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  const m = $('#data-msg'); if (m) m.textContent = 'Backup file created. Save it to Files or iCloud/Drive.';
}
function importData(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      if (!s || !s.profile || !Array.isArray(s.sessions)) throw new Error('bad');
      state = { ...defaultState(), ...s, profile: { ...defaultState().profile, ...s.profile } };
      saveNow(state); render(); toast('Backup restored');
    } catch { const m = $('#data-msg'); if (m) m.textContent = 'That file is not a Workout Pal backup. Pick the .json file you exported.'; }
  };
  r.readAsText(file);
}

let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => { el.classList.remove('show'); el.hidden = true; }, 2200);
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet) { sheet = null; render(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(state); });

render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
