// Local persistence. Everything lives in this phone's browser storage;
// use Export in the Me tab to back it up.
const KEY = 'workoutpal.v1';

export const defaultState = () => ({
  version: 1,
  profile: {
    sex: 'male', age: 22, heightIn: 70, weightLb: 265, goalLb: 220,
    days: 5, sessionMin: 60, rack: true,
    kcalMode: 'manual', kcalTarget: 2100, kcalLow: 2000, kcalHigh: 2200,
    proteinG: 220, fatG: 65,
    startDate: today(),
  },
  swaps: {},      // planned slot key -> exercise id (permanent swaps)
  sessions: [],   // workout sessions
  activeId: null,
  foods: {},      // 'YYYY-MM-DD' -> [{id,name,kcal,p,c,f,meal}]
  savedFoods: [],
  weights: [{ date: today(), lb: 265 }],
});

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    const d = defaultState();
    return { ...d, ...s, profile: { ...d.profile, ...(s.profile || {}) } };
  } catch {
    return defaultState();
  }
}

let saveTimer = null;
export function save(state) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }, 150);
}

export function saveNow(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}

export function today(d = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
