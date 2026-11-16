// Exercise library, alternatives, mobility routines and plan templates.
// Equipment assumptions: Planet Fitness (dumbbells to ~75 lb, Smith machines,
// selectorized machines, cable stations, cardio) plus the new barbell racks.

// elbow: notes for limited right-elbow extension (bone spur / blocked lockout).
// alts: busy = equipment is taken, hard = too hard today, feel = doesn't feel right.

export const EX = {
  // ---------- Lower: squat pattern ----------
  bb_back_squat: {
    name: 'Barbell Back Squat', group: 'Legs', equip: 'Barbell rack',
    cues: 'Brace hard before you descend. Sit between your hips, knees track over toes, drive the floor away.',
    elbow: 'Use a wider grip with thumbs over the bar so the right elbow is not cranked. If it still aches, switch to Safety-style: hold the bar with straps or swap to a goblet/leg press.',
    alts: { busy: ['smith_squat', 'goblet_squat'], hard: ['goblet_squat', 'leg_press'], feel: ['leg_press', 'smith_squat'] },
  },
  smith_squat: {
    name: 'Smith Machine Squat', group: 'Legs', equip: 'Smith machine',
    cues: 'Feet slightly in front of the bar. Control down, drive up through mid-foot.',
    elbow: 'Grip wider than usual; you only need to stabilize the bar.',
    alts: { busy: ['goblet_squat', 'leg_press'], hard: ['leg_press', 'goblet_squat'], feel: ['leg_press', 'db_reverse_lunge'] },
  },
  goblet_squat: {
    name: 'Dumbbell Goblet Squat', group: 'Legs', equip: 'Dumbbell',
    cues: 'Hold the bell at your chest, elbows inside the knees at the bottom. Pause 1s.',
    alts: { busy: ['leg_press', 'smith_squat'], hard: ['leg_press', 'wall_sit'], feel: ['leg_press', 'step_up'] },
  },
  leg_press: {
    name: 'Leg Press', group: 'Legs', equip: 'Machine',
    cues: 'Low back stays on the pad. Go as deep as you can without your hips rolling up.',
    alts: { busy: ['smith_squat', 'goblet_squat'], hard: ['goblet_squat', 'wall_sit'], feel: ['goblet_squat', 'step_up'] },
  },
  wall_sit: {
    name: 'Wall Sit', group: 'Legs', equip: 'Bodyweight',
    cues: 'Thighs parallel, back flat on the wall. Log seconds as reps.',
    alts: { busy: ['goblet_squat'], hard: ['goblet_squat'], feel: ['step_up'] },
  },

  // ---------- Lower: hinge ----------
  bb_rdl: {
    name: 'Barbell Romanian Deadlift', group: 'Hamstrings/Glutes', equip: 'Barbell rack',
    cues: 'Soft knees, push hips back, bar stays against your legs. Stop when your hamstrings stop you, not your back.',
    elbow: 'Arms just hang; a bent right elbow is fine. Use straps if grip or elbow complains.',
    alts: { busy: ['db_rdl', 'smith_rdl'], hard: ['db_rdl', 'cable_pull_through'], feel: ['back_extension', 'cable_pull_through'] },
  },
  db_rdl: {
    name: 'Dumbbell Romanian Deadlift', group: 'Hamstrings/Glutes', equip: 'Dumbbell',
    cues: 'Dumbbells slide down the front of your thighs. Big stretch, squeeze glutes to stand.',
    alts: { busy: ['smith_rdl', 'cable_pull_through'], hard: ['cable_pull_through', 'back_extension'], feel: ['back_extension', 'hip_thrust'] },
  },
  smith_rdl: {
    name: 'Smith Machine RDL', group: 'Hamstrings/Glutes', equip: 'Smith machine',
    cues: 'Stand close to the bar, hips back, keep the bar path straight down your legs.',
    alts: { busy: ['db_rdl', 'cable_pull_through'], hard: ['cable_pull_through'], feel: ['back_extension'] },
  },
  cable_pull_through: {
    name: 'Cable Pull-Through', group: 'Hamstrings/Glutes', equip: 'Cable',
    cues: 'Face away from the stack, rope between legs, hinge back and snap hips through.',
    alts: { busy: ['db_rdl', 'back_extension'], hard: ['glute_bridge'], feel: ['glute_bridge'] },
  },
  back_extension: {
    name: '45° Back Extension', group: 'Hamstrings/Glutes', equip: 'Bench',
    cues: 'Pad at the hip crease. Round slightly down, squeeze glutes to come up. Hug a plate to progress.',
    alts: { busy: ['db_rdl', 'cable_pull_through'], hard: ['glute_bridge'], feel: ['glute_bridge', 'cable_pull_through'] },
  },
  hip_thrust: {
    name: 'Smith Machine Hip Thrust', group: 'Hamstrings/Glutes', equip: 'Smith machine',
    cues: 'Upper back on a bench, chin tucked, ribs down. Full lockout with glutes, pause 1s.',
    alts: { busy: ['glute_bridge', 'cable_pull_through'], hard: ['glute_bridge'], feel: ['cable_pull_through', 'back_extension'] },
  },
  glute_bridge: {
    name: 'Dumbbell Glute Bridge', group: 'Hamstrings/Glutes', equip: 'Dumbbell',
    cues: 'On the floor, dumbbell on hips, drive through heels, hold the top 2s.',
    alts: { busy: ['back_extension'], hard: ['back_extension'], feel: ['back_extension'] },
  },
  leg_curl: {
    name: 'Seated Leg Curl', group: 'Hamstrings/Glutes', equip: 'Machine',
    cues: 'Lean forward slightly, curl hard, 2-3s on the way back up.',
    alts: { busy: ['db_rdl', 'back_extension'], hard: ['back_extension', 'glute_bridge'], feel: ['back_extension', 'cable_pull_through'] },
  },

  // ---------- Lower: single leg / accessories ----------
  db_split_squat: {
    name: 'DB Bulgarian Split Squat', group: 'Legs', equip: 'Dumbbell',
    cues: 'Back foot on a bench, most weight on the front leg, slight forward lean for glutes.',
    alts: { busy: ['db_reverse_lunge', 'smith_split_squat'], hard: ['db_reverse_lunge', 'step_up'], feel: ['step_up', 'leg_press'] },
  },
  smith_split_squat: {
    name: 'Smith Split Squat', group: 'Legs', equip: 'Smith machine',
    cues: 'Long stance, drop the back knee straight down.',
    alts: { busy: ['db_reverse_lunge'], hard: ['step_up'], feel: ['step_up', 'leg_press'] },
  },
  db_reverse_lunge: {
    name: 'DB Reverse Lunge', group: 'Legs', equip: 'Dumbbell',
    cues: 'Step back, front shin stays vertical-ish. Easier on knees than forward lunges.',
    alts: { busy: ['step_up', 'smith_split_squat'], hard: ['step_up'], feel: ['step_up', 'leg_press'] },
  },
  step_up: {
    name: 'DB Step-Up', group: 'Legs', equip: 'Dumbbell',
    cues: 'Knee-height box or bench. Drive through the whole front foot, no push from the back leg.',
    alts: { busy: ['db_reverse_lunge'], hard: ['goblet_squat'], feel: ['leg_press'] },
  },
  leg_ext: {
    name: 'Leg Extension', group: 'Legs', equip: 'Machine',
    cues: 'Squeeze quads at the top for 1s, control down.',
    alts: { busy: ['goblet_squat', 'step_up'], hard: ['wall_sit'], feel: ['wall_sit', 'step_up'] },
  },
  calf_raise: {
    name: 'Standing Calf Raise (Smith)', group: 'Calves', equip: 'Smith machine',
    cues: 'Toes on a plate, full stretch at the bottom, pause at the top.',
    alts: { busy: ['leg_press_calf', 'db_calf'], hard: ['db_calf'], feel: ['leg_press_calf'] },
  },
  leg_press_calf: {
    name: 'Leg Press Calf Raise', group: 'Calves', equip: 'Machine',
    cues: 'Balls of feet on the platform edge, knees soft, full range.',
    alts: { busy: ['db_calf'], hard: ['db_calf'], feel: ['db_calf'] },
  },
  db_calf: {
    name: 'Single-Leg DB Calf Raise', group: 'Calves', equip: 'Dumbbell',
    cues: 'Hold a dumbbell, off a step, one leg at a time.',
    alts: { busy: ['leg_press_calf'], hard: ['leg_press_calf'], feel: ['leg_press_calf'] },
  },

  // ---------- Upper: push ----------
  db_bench: {
    name: 'Dumbbell Bench Press', group: 'Chest', equip: 'Dumbbell',
    cues: 'Shoulder blades pinned, 45° elbow angle, press up and slightly in.',
    elbow: 'Dumbbells let each arm stop where it stops. Press the right arm to its end range; never force lockout. A slight neutral (palms-in) turn often feels best.',
    alts: { busy: ['machine_chest_press', 'smith_bench', 'bb_bench'], hard: ['machine_chest_press', 'pushup'], feel: ['machine_chest_press', 'cable_fly'] },
  },
  bb_bench: {
    name: 'Barbell Bench Press', group: 'Chest', equip: 'Barbell rack',
    cues: 'Feet planted, arch modestly, touch low chest, drive up and back.',
    elbow: 'Your right arm will stop short of the left. Stop BOTH arms at the right arm\'s end range so the bar stays level. Use a spotter or safeties.',
    alts: { busy: ['db_bench', 'smith_bench'], hard: ['machine_chest_press'], feel: ['db_bench', 'machine_chest_press'] },
  },
  smith_bench: {
    name: 'Smith Machine Bench Press', group: 'Chest', equip: 'Smith machine',
    cues: 'Bar over lower chest. Set the safeties just above chest height.',
    elbow: 'Stop both arms at the right arm\'s end range.',
    alts: { busy: ['machine_chest_press', 'db_bench'], hard: ['machine_chest_press'], feel: ['db_bench', 'cable_fly'] },
  },
  machine_chest_press: {
    name: 'Machine Chest Press', group: 'Chest', equip: 'Machine',
    cues: 'Seat so handles line up with mid-chest. Neutral grip if offered.',
    elbow: 'Neutral handles are easiest on the elbow. Stop at your end range.',
    alts: { busy: ['db_bench', 'pushup'], hard: ['pushup_incline'], feel: ['cable_fly', 'pushup_incline'] },
  },
  incline_db_press: {
    name: 'Incline Dumbbell Press', group: 'Chest', equip: 'Dumbbell',
    cues: 'Bench at 30°. Lower to upper chest, press up without clanging the bells.',
    elbow: 'Same as flat: let the right arm stop where it stops.',
    alts: { busy: ['smith_incline', 'machine_chest_press'], hard: ['machine_chest_press', 'pushup_incline'], feel: ['cable_fly_low', 'machine_chest_press'] },
  },
  smith_incline: {
    name: 'Smith Incline Press', group: 'Chest', equip: 'Smith machine',
    cues: 'Bench at 30° under the bar, bar to upper chest.',
    elbow: 'Stop both arms at the right arm\'s end range.',
    alts: { busy: ['incline_db_press', 'machine_chest_press'], hard: ['machine_chest_press'], feel: ['cable_fly_low'] },
  },
  pushup: {
    name: 'Push-Up', group: 'Chest', equip: 'Bodyweight',
    cues: 'Body in a straight line, chest to fist height. Elevate hands to make it easier.',
    alts: { busy: ['pushup_incline'], hard: ['pushup_incline'], feel: ['machine_chest_press'] },
  },
  pushup_incline: {
    name: 'Incline Push-Up (hands on bench)', group: 'Chest', equip: 'Bodyweight',
    cues: 'Hands on a bench or Smith bar. Lower the bar to make it harder.',
    alts: { busy: ['pushup'], hard: ['machine_chest_press'], feel: ['machine_chest_press'] },
  },
  cable_fly: {
    name: 'Cable Fly (mid)', group: 'Chest', equip: 'Cable',
    cues: 'Slight bend in elbows held the whole time; hug a tree. Stretch, then squeeze.',
    elbow: 'Your elbow stays bent anyway, so this is an elbow-friendly chest move.',
    alts: { busy: ['pec_deck', 'db_fly'], hard: ['pec_deck'], feel: ['pec_deck'] },
  },
  cable_fly_low: {
    name: 'Low-to-High Cable Fly', group: 'Chest', equip: 'Cable',
    cues: 'Handles low, sweep up to chin height. Targets the upper chest.',
    alts: { busy: ['pec_deck', 'incline_db_press'], hard: ['pec_deck'], feel: ['pec_deck'] },
  },
  pec_deck: {
    name: 'Pec Deck', group: 'Chest', equip: 'Machine',
    cues: 'Handles at chest height, squeeze for 1s in the middle.',
    alts: { busy: ['cable_fly', 'db_fly'], hard: ['cable_fly'], feel: ['cable_fly'] },
  },
  db_fly: {
    name: 'Dumbbell Fly', group: 'Chest', equip: 'Dumbbell',
    cues: 'Light weight, big stretch, elbows soft.',
    alts: { busy: ['cable_fly'], hard: ['pec_deck'], feel: ['pec_deck'] },
  },
  db_shoulder_press: {
    name: 'Seated DB Shoulder Press (neutral grip)', group: 'Shoulders', equip: 'Dumbbell',
    cues: 'Back on an upright bench, palms facing in, press up slightly in front of your face.',
    elbow: 'Overhead lockout is where your right elbow will block. Press to end range and stop; do not shrug or lean to "finish" the rep.',
    alts: { busy: ['machine_shoulder_press', 'landmine_press'], hard: ['machine_shoulder_press'], feel: ['landmine_press', 'machine_shoulder_press'] },
  },
  machine_shoulder_press: {
    name: 'Machine Shoulder Press', group: 'Shoulders', equip: 'Machine',
    cues: 'Handles at shoulder height to start. Neutral grip if offered.',
    elbow: 'Stop at end range.',
    alts: { busy: ['db_shoulder_press', 'landmine_press'], hard: ['landmine_press'], feel: ['landmine_press'] },
  },
  landmine_press: {
    name: 'Half-Kneeling Landmine Press', group: 'Shoulders', equip: 'Barbell rack',
    cues: 'Barbell end in a corner (or landmine). Press up and forward. Shoulder-friendly angle, great for throwers.',
    elbow: 'The angled path means you never need full lockout overhead.',
    alts: { busy: ['machine_shoulder_press', 'db_shoulder_press'], hard: ['machine_shoulder_press'], feel: ['machine_shoulder_press'] },
  },
  db_lateral: {
    name: 'Dumbbell Lateral Raise', group: 'Shoulders', equip: 'Dumbbell',
    cues: 'Lead with elbows, raise to shoulder height, slow down. Light and strict.',
    alts: { busy: ['cable_lateral'], hard: ['cable_lateral'], feel: ['cable_lateral'] },
  },
  cable_lateral: {
    name: 'Cable Lateral Raise', group: 'Shoulders', equip: 'Cable',
    cues: 'Cable low and behind you, one arm at a time. Constant tension.',
    alts: { busy: ['db_lateral'], hard: ['db_lateral'], feel: ['db_lateral'] },
  },
  rope_pushdown: {
    name: 'Rope Triceps Pushdown', group: 'Triceps', equip: 'Cable',
    cues: 'Elbows pinned to your sides, split the rope at the bottom.',
    elbow: 'Work the right arm to its end range only. If the blocked lockout pinches, use single-arm pushdowns so each arm moves on its own.',
    alts: { busy: ['machine_tricep', 'db_kickback'], hard: ['single_pushdown'], feel: ['single_pushdown', 'machine_tricep'] },
  },
  single_pushdown: {
    name: 'Single-Arm Cable Pushdown', group: 'Triceps', equip: 'Cable',
    cues: 'One arm at a time, palm down or neutral, pause at your end range.',
    elbow: 'Lets the right arm use its own range without the left arm dictating.',
    alts: { busy: ['machine_tricep'], hard: ['machine_tricep'], feel: ['machine_tricep'] },
  },
  machine_tricep: {
    name: 'Machine Triceps Extension / Dip Machine', group: 'Triceps', equip: 'Machine',
    cues: 'Seated dip or triceps extension machine. Controlled reps.',
    elbow: 'Stop at end range.',
    alts: { busy: ['rope_pushdown'], hard: ['single_pushdown'], feel: ['single_pushdown'] },
  },
  db_kickback: {
    name: 'Dumbbell Kickback', group: 'Triceps', equip: 'Dumbbell',
    cues: 'Hinge over a bench, upper arm parallel to the floor, extend back.',
    elbow: 'Light weight. Squeeze at your end range; do not force straight.',
    alts: { busy: ['single_pushdown'], hard: ['single_pushdown'], feel: ['single_pushdown'] },
  },

  // ---------- Upper: pull ----------
  lat_pulldown: {
    name: 'Lat Pulldown', group: 'Back', equip: 'Machine',
    cues: 'Slightly wider than shoulders, pull elbows to your back pockets, chest up.',
    elbow: 'You do not need to fully straighten at the top. Stop at end range, then pull.',
    alts: { busy: ['assisted_pullup', 'kneel_cable_pulldown'], hard: ['kneel_cable_pulldown'], feel: ['neutral_pulldown', 'kneel_cable_pulldown'] },
  },
  neutral_pulldown: {
    name: 'Neutral-Grip Pulldown (V-handle)', group: 'Back', equip: 'Cable',
    cues: 'Palms facing each other, pull the handle to upper chest.',
    elbow: 'Neutral grip is usually the most comfortable for a cranky elbow.',
    alts: { busy: ['lat_pulldown', 'kneel_cable_pulldown'], hard: ['kneel_cable_pulldown'], feel: ['kneel_cable_pulldown'] },
  },
  kneel_cable_pulldown: {
    name: 'Half-Kneeling 1-Arm Cable Pulldown', group: 'Back', equip: 'Cable',
    cues: 'One arm at a time from a high pulley, drive the elbow down to your hip.',
    alts: { busy: ['lat_pulldown'], hard: ['lat_pulldown'], feel: ['neutral_pulldown'] },
  },
  assisted_pullup: {
    name: 'Assisted Pull-Up', group: 'Back', equip: 'Machine',
    cues: 'Use enough assistance for clean reps. Chin over the bar, control down.',
    elbow: 'Do not dead-hang at the bottom; keep a slight bend and the lats engaged.',
    alts: { busy: ['lat_pulldown'], hard: ['lat_pulldown'], feel: ['neutral_pulldown'] },
  },
  cs_db_row: {
    name: 'Chest-Supported DB Row', group: 'Back', equip: 'Dumbbell',
    cues: 'Chest on a 30-45° bench. Row to your hips, squeeze shoulder blades. No low-back stress.',
    alts: { busy: ['seated_cable_row', 'machine_row'], hard: ['machine_row'], feel: ['seated_cable_row', 'machine_row'] },
  },
  db_row: {
    name: 'One-Arm Dumbbell Row', group: 'Back', equip: 'Dumbbell',
    cues: 'Hand and knee on a bench, pull the dumbbell to your hip.',
    alts: { busy: ['seated_cable_row', 'machine_row'], hard: ['machine_row'], feel: ['seated_cable_row'] },
  },
  seated_cable_row: {
    name: 'Seated Cable Row', group: 'Back', equip: 'Cable',
    cues: 'Neutral handle, tall chest, pull to your belly button. Do not rock.',
    alts: { busy: ['machine_row', 'cs_db_row'], hard: ['machine_row'], feel: ['machine_row'] },
  },
  machine_row: {
    name: 'Machine Row', group: 'Back', equip: 'Machine',
    cues: 'Chest on the pad, pull elbows back, pause 1s.',
    alts: { busy: ['seated_cable_row', 'cs_db_row'], hard: ['seated_cable_row'], feel: ['seated_cable_row'] },
  },
  bb_row: {
    name: 'Barbell Row', group: 'Back', equip: 'Barbell rack',
    cues: 'Hinge to about 45°, pull to your lower ribs.',
    alts: { busy: ['db_row', 'seated_cable_row'], hard: ['cs_db_row', 'machine_row'], feel: ['cs_db_row'] },
  },
  face_pull: {
    name: 'Cable Face Pull', group: 'Rear delts', equip: 'Cable',
    cues: 'Rope at eye level, pull to your forehead, thumbs back. Shoulder insurance for an old thrower.',
    alts: { busy: ['reverse_pec_deck', 'db_rear_delt'], hard: ['reverse_pec_deck'], feel: ['db_rear_delt'] },
  },
  reverse_pec_deck: {
    name: 'Reverse Pec Deck', group: 'Rear delts', equip: 'Machine',
    cues: 'Face the pad, arms slightly bent, sweep back.',
    alts: { busy: ['face_pull', 'db_rear_delt'], hard: ['db_rear_delt'], feel: ['face_pull'] },
  },
  db_rear_delt: {
    name: 'Bent-Over DB Rear Delt Raise', group: 'Rear delts', equip: 'Dumbbell',
    cues: 'Chest on an incline bench, light bells, raise out to the side.',
    alts: { busy: ['face_pull'], hard: ['reverse_pec_deck'], feel: ['reverse_pec_deck'] },
  },
  cable_er: {
    name: 'Cable External Rotation', group: 'Rotator cuff', equip: 'Cable',
    cues: 'Elbow at your side on a rolled towel, rotate out slowly. Light. Same arm-care work you did in season.',
    alts: { busy: ['db_er'], hard: ['db_er'], feel: ['db_er'] },
  },
  db_er: {
    name: 'Side-Lying DB External Rotation', group: 'Rotator cuff', equip: 'Dumbbell',
    cues: 'Lie on your side, towel under elbow, rotate the light dumbbell up.',
    alts: { busy: ['cable_er'], hard: ['cable_er'], feel: ['cable_er'] },
  },
  hammer_curl: {
    name: 'Dumbbell Hammer Curl', group: 'Biceps', equip: 'Dumbbell',
    cues: 'Palms in, elbows still, control the way down.',
    elbow: 'Neutral grip is the friendliest curl for your elbow. Curl from your bottom range; there is no need to reach a straight arm.',
    alts: { busy: ['rope_hammer_curl', 'machine_curl'], hard: ['machine_curl'], feel: ['rope_hammer_curl', 'machine_curl'] },
  },
  rope_hammer_curl: {
    name: 'Cable Rope Hammer Curl', group: 'Biceps', equip: 'Cable',
    cues: 'Rope on a low pulley, palms in, squeeze at the top.',
    alts: { busy: ['hammer_curl', 'machine_curl'], hard: ['machine_curl'], feel: ['machine_curl'] },
  },
  machine_curl: {
    name: 'Machine Preacher Curl', group: 'Biceps', equip: 'Machine',
    cues: 'Armpits snug to the pad, stop short of locking out.',
    elbow: 'Preacher-style stretches the bottom; set the range so the right arm stops before its block.',
    alts: { busy: ['hammer_curl', 'rope_hammer_curl'], hard: ['rope_hammer_curl'], feel: ['hammer_curl'] },
  },

  // ---------- Core / carries ----------
  plank: {
    name: 'Front Plank', group: 'Core', equip: 'Bodyweight',
    cues: 'Squeeze glutes, ribs down. Log seconds as reps.',
    alts: { busy: ['dead_bug'], hard: ['dead_bug'], feel: ['dead_bug'] },
  },
  dead_bug: {
    name: 'Dead Bug', group: 'Core', equip: 'Bodyweight',
    cues: 'Low back pressed into the floor, opposite arm and leg reach slow.',
    alts: { busy: ['plank'], hard: ['plank'], feel: ['plank'] },
  },
  pallof: {
    name: 'Cable Pallof Press', group: 'Core', equip: 'Cable',
    cues: 'Stand sideways to the stack, press the handle straight out and resist the twist. Rotational athletes need this.',
    alts: { busy: ['plank'], hard: ['dead_bug'], feel: ['dead_bug'] },
  },
  knee_raise: {
    name: "Captain's Chair Knee Raise", group: 'Core', equip: 'Machine',
    cues: 'Back on the pad, curl knees to chest, no swinging.',
    alts: { busy: ['cable_crunch', 'dead_bug'], hard: ['dead_bug'], feel: ['cable_crunch'] },
  },
  cable_crunch: {
    name: 'Kneeling Cable Crunch', group: 'Core', equip: 'Cable',
    cues: 'Rope behind your head, crunch ribs to hips. Hips stay still.',
    alts: { busy: ['knee_raise', 'dead_bug'], hard: ['dead_bug'], feel: ['dead_bug'] },
  },
  farmer_carry: {
    name: 'Farmer Carry', group: 'Core', equip: 'Dumbbell',
    cues: 'Heavy dumbbells, tall posture, walk 40 m. Log the dumbbell weight and meters as reps.',
    elbow: 'Arms hang naturally; a bent right elbow is fine.',
    alts: { busy: ['suitcase_carry'], hard: ['suitcase_carry'], feel: ['plank'] },
  },
  suitcase_carry: {
    name: 'Suitcase Carry (one side)', group: 'Core', equip: 'Dumbbell',
    cues: 'One heavy dumbbell, do not lean. Switch hands halfway.',
    alts: { busy: ['pallof'], hard: ['plank'], feel: ['pallof'] },
  },
};

export const ALT_REASONS = {
  busy: { label: 'Equipment taken', short: 'Taken' },
  hard: { label: 'Too hard today', short: 'Too hard' },
  feel: { label: "Doesn't feel right", short: 'Feels off' },
};

// ---------- Mobility ----------
export const MOBILITY = {
  warmup: {
    name: 'Pre-lift warm-up', minutes: 8,
    items: [
      { name: 'Incline walk', dose: '3 min, easy', why: 'Raises body temperature before anything else.' },
      { name: 'Cat-cow', dose: '8 slow reps', why: 'Wakes up the spine.' },
      { name: "World's greatest stretch", dose: '4 / side', why: 'Hips, hamstrings and T-spine in one move.' },
      { name: '90/90 hip switches', dose: '8 / side', why: 'Hip rotation for squats and lunges.' },
      { name: 'Band pull-aparts or cable face pulls (light)', dose: '15 reps', why: 'Primes the upper back and shoulder.' },
      { name: 'Elbow flexion/extension + forearm rotations', dose: '10 each arm', why: 'Moves the right elbow through its full available range before loading it.' },
      { name: 'Bodyweight squat with pause', dose: '8 reps, 2s hold', why: 'Grooves the bottom position.' },
    ],
  },
  long: {
    name: 'Mobility flow (cardio day)', minutes: 15,
    items: [
      { name: 'Couch stretch', dose: '60s / side', why: 'Opens hip flexors that get tight from sitting.' },
      { name: 'Pigeon stretch', dose: '60s / side', why: 'Glutes and hip rotation.' },
      { name: 'Deep squat hold', dose: '2 × 45s', why: 'Ankles, hips and squat depth.' },
      { name: 'Thoracic open books', dose: '10 / side', why: 'Upper-back rotation, which baseball lived on.' },
      { name: 'Sleeper stretch', dose: '45s / side, gentle', why: 'Shoulder internal rotation. Throwers tend to lose it.' },
      { name: 'Cross-body shoulder stretch', dose: '45s / side', why: 'Back of the shoulder.' },
      { name: 'Lat stretch on bench', dose: '45s', why: 'Overhead mobility without loading the elbow.' },
      { name: 'Wrist flexor/extensor stretch', dose: '30s each', why: 'Forearms feed the elbow; keep them loose.' },
      { name: 'Ankle knee-to-wall rocks', dose: '10 / side', why: 'Ankle range for deeper squats.' },
    ],
  },
};

// ---------- Cardio ----------
export const CARDIO = {
  finisher: { label: 'Incline treadmill finisher', minutes: 15, incline: 10, speed: 3.0, note: 'Zone 2: you can talk in full sentences. No holding the rails.' },
  steady: { label: 'Incline treadmill, steady', minutes: 35, incline: 12, speed: 3.0, note: 'Long zone 2 walk. Add 5 min each week until you hit 45.' },
};

// ---------- Plan templates ----------
// slot: [exerciseId, sets, repRange, restSec, tier]  tier: 1 main, 2 secondary, 3 accessory
const S = (ex, sets, reps, rest, tier) => ({ ex, sets, reps, rest, tier });

export const DAYS = {
  lowerA: {
    name: 'Lower A', focus: 'Squat + quads',
    slots: [
      S('bb_back_squat', 4, '5-8', 180, 1),
      S('db_rdl', 3, '8-10', 120, 2),
      S('db_split_squat', 3, '8-10', 90, 2),
      S('leg_ext', 3, '12-15', 60, 3),
      S('calf_raise', 3, '10-15', 60, 3),
      S('pallof', 3, '10-12', 45, 3),
    ],
    cardio: 'finisher', mobility: 'warmup',
  },
  upperA: {
    name: 'Upper A', focus: 'Press + rows',
    slots: [
      S('db_bench', 4, '6-10', 150, 1),
      S('cs_db_row', 4, '8-12', 120, 1),
      S('db_shoulder_press', 3, '8-12', 90, 2),
      S('lat_pulldown', 3, '10-12', 90, 2),
      S('db_lateral', 3, '12-15', 45, 3),
      S('rope_pushdown', 3, '10-15', 45, 3),
      S('hammer_curl', 3, '10-12', 45, 3),
    ],
    cardio: 'finisher', mobility: 'warmup',
  },
  cardio: {
    name: 'Cardio + Mobility', focus: 'Incline walk, mobility, core',
    slots: [
      S('dead_bug', 3, '8-10', 30, 3),
      S('farmer_carry', 3, '40m', 60, 3),
      S('face_pull', 2, '15-20', 30, 3),
    ],
    cardio: 'steady', mobility: 'long',
  },
  lowerB: {
    name: 'Lower B', focus: 'Hinge + glutes',
    slots: [
      S('bb_rdl', 4, '6-8', 180, 1),
      S('leg_press', 3, '10-12', 120, 2),
      S('hip_thrust', 3, '8-12', 90, 2),
      S('leg_curl', 3, '10-15', 60, 3),
      S('db_reverse_lunge', 2, '10/leg', 60, 3),
      S('knee_raise', 3, '10-15', 45, 3),
    ],
    cardio: 'finisher', mobility: 'warmup',
  },
  upperB: {
    name: 'Upper B', focus: 'Pull + incline',
    slots: [
      S('incline_db_press', 4, '8-10', 150, 1),
      S('neutral_pulldown', 4, '8-12', 120, 1),
      S('seated_cable_row', 3, '10-12', 90, 2),
      S('cable_fly', 3, '12-15', 60, 3),
      S('face_pull', 3, '15-20', 45, 3),
      S('cable_er', 2, '12-15', 30, 3),
      S('rope_hammer_curl', 2, '10-15', 45, 3),
    ],
    cardio: 'finisher', mobility: 'warmup',
  },
};

export const WEEK_TEMPLATES = {
  4: ['lowerA', 'upperA', 'lowerB', 'upperB'],
  5: ['lowerA', 'upperA', 'cardio', 'lowerB', 'upperB'],
};

export const SCHEDULE_HINT = {
  4: 'Mon Lower A · Tue Upper A · Thu Lower B · Fri Upper B. Walk on an off day if you can.',
  5: 'Mon Lower A · Tue Upper A · Wed Cardio + Mobility · Thu Lower B · Fri Upper B.',
};

// Accessory count kept by session length.
export const LENGTH_CAP = { 45: 4, 60: 6, 75: 7 };

// ---------- Quick foods ----------
export const QUICK_FOODS = [
  { name: 'Chicken breast, 6 oz cooked', kcal: 280, p: 52, c: 0, f: 6 },
  { name: 'Lean ground beef 93%, 6 oz cooked', kcal: 340, p: 46, c: 0, f: 16 },
  { name: 'Salmon, 6 oz cooked', kcal: 350, p: 38, c: 0, f: 21 },
  { name: 'Eggs, 3 large', kcal: 215, p: 19, c: 1, f: 15 },
  { name: 'Egg whites, 1 cup', kcal: 125, p: 26, c: 2, f: 0 },
  { name: 'Greek yogurt nonfat, 1 cup', kcal: 130, p: 23, c: 9, f: 0 },
  { name: 'Protein shake, 1 scoop + water', kcal: 120, p: 24, c: 3, f: 1 },
  { name: 'Cottage cheese 2%, 1 cup', kcal: 180, p: 24, c: 10, f: 5 },
  { name: 'White rice, 1 cup cooked', kcal: 205, p: 4, c: 45, f: 0 },
  { name: 'Oats, 1/2 cup dry', kcal: 150, p: 5, c: 27, f: 3 },
  { name: 'Potato, medium baked', kcal: 160, p: 4, c: 37, f: 0 },
  { name: 'Banana', kcal: 105, p: 1, c: 27, f: 0 },
  { name: 'Apple', kcal: 95, p: 0, c: 25, f: 0 },
  { name: 'Whole wheat bread, 2 slices', kcal: 200, p: 8, c: 36, f: 3 },
  { name: 'Peanut butter, 2 tbsp', kcal: 190, p: 7, c: 7, f: 16 },
  { name: 'Mixed veggies, 2 cups', kcal: 100, p: 5, c: 20, f: 0 },
  { name: 'Chipotle chicken bowl (rice, beans, salsa)', kcal: 790, p: 55, c: 95, f: 20 },
  { name: 'Subway 6" turkey', kcal: 280, p: 18, c: 46, f: 4 },
  { name: 'Beef jerky, 1 oz', kcal: 80, p: 13, c: 3, f: 1 },
  { name: 'Whole milk, 1 cup', kcal: 150, p: 8, c: 12, f: 8 },
];
