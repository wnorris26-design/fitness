# Workout Pal

A phone-first workout and nutrition tracker built for getting back in shape after college baseball.

- **Today**: the next workout in your rotation, set-by-set logging (weight × reps), "last time" numbers, progression hints and a rest timer.
- **Swaps**: every exercise has alternatives for *equipment taken*, *too hard today* and *doesn't feel right*. Swap for just today, or make it the default in your plan.
- **Plan**: 4 or 5 day Upper/Lower split for Planet Fitness equipment plus barbell racks, 45/60/75 min sessions, incline treadmill finishers, a cardio + mobility day, and elbow-friendly choices for limited right-elbow extension.
- **Food**: calories and macros against a 2,000–2,200 kcal / 220 g protein target, quick-add foods and saved favorites.
- **Progress**: body-weight chart with goal line and ETA, estimated 1RM trends, workout history.

All data stays on the phone (browser storage). Use **You → Export backup** to save a copy.

## Put it on your phone

1. In GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root → Save**.
2. Open `https://wnorris26-design.github.io/fitness/` on your phone.
3. iPhone: Safari → Share → **Add to Home Screen**. Android: Chrome menu → **Install app**.

It works offline after the first load.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
