# ⚔️ Level-Up-Life

A **gamified life-analytics PWA** that turns your daily habits into XP, levels, and RPG-style character stats. Track activities across six life domains, earn experience points, level up your character, and watch your real-life growth reflected as measurable progress — all offline, all private.

---

## ✨ Features

### 🎯 Activity Logging
- Log activities with a **quest name**, **domain**, **difficulty** (1–5), **duration**, and **outcome** (completed / partial / failed)
- Mark high-stakes tasks as **Boss Quests** for 3× XP
- Optional **mood** (1–5), **energy level** (1–5), and **anxiety level** (1–5) tracking per activity
- Quick-select suggestions for fast entry
- Real-time **XP preview** before submission

### 📊 Dashboard & Analytics
- **Hero stats panel** showing current level, total XP, and progress to next level
- **Attribute bars** for all five character stats (INT, WIS, CHA, VIT, GOLD)
- **Stat cards** for streak freezes owned, lifetime critical hits, and current expected difficulty
- **Activity history** with recent logs
- **Mood, energy & anxiety trends** visualization
- **Streak badge** displaying your current consecutive-day streak 🔥
- **Bottom navigation bar** with six tabs (Home, Quest, Schedule, Heatmap, Shop, Settings) and live Gold counter

### 📅 Task Scheduling
- **Schedule upcoming tasks** with a name, domain, start date, and expected completion date
- Tasks automatically **promote from upcoming to active** when their start date arrives
- Completing an activity **auto-archives** matching scheduled tasks
- Manually mark tasks as complete or remove them

### 📊 Activity Heatmap
- **Monthly calendar view** showing daily XP as color-coded intensity tiles
- Navigate between months with **previous/next controls**
- **Hover tooltips** display the exact XP earned on each day
- **Color legend** from less to more activity

### 🛒 In-Game Shop
- Purchase **Streak Freezes** (50 GOLD each) to protect your streak when you miss a day

### 💰 Gold Milestones
- Earn **10 GOLD** each time your total XP crosses a milestone threshold
- Milestones are spaced at **random 300–400 XP intervals**, keeping rewards surprising

### ⚙️ Settings & Accessibility
- Toggle **sound effects** (Web Audio API sine-wave tones for click, XP gain, critical success, level up, purchase, streak saved, sad/fail)
- Toggle **reduced motion** to disable animations
- **Haptic feedback** via the Vibration API (short, success, and critical vibration patterns)
- Full **data export/import** as version-tagged JSON (v2) for backup and restore, including scheduled tasks

### 🎊 Feedback & Celebrations
- Post-submission **feedback modal** showing XP earned, base XP breakdown, attribute changes, and critical-hit notifications
- **Confetti animation** on level-up and critical hits
- **Daily nudge** to encourage logging your first activity each day

---

## 🗂️ What It Tracks

### Six Life Domains

| Domain | Description | Attributes Affected |
|--------|-------------|---------------------|
| 📚 **Learning** | Education, reading, skill-building | INT ↑, WIS ↑ |
| 💪 **Wellbeing** | Exercise, health, self-care | VIT ↑, WIS ↑ |
| 💰 **Finance** | Saving, budgeting, earning | GOLD ↑, WIS ↑ |
| 🤝 **Social** | Relationships, networking, community | CHA ↑ |
| 🔧 **Misc** | General tasks and chores | All stats ↑ (small) |
| 🚫 **Bad Habit** | Habits you want to break | VIT ↓, WIS ↓ (negative XP) |

### Five Character Attributes

| Stat | Full Name | Boosted By |
|------|-----------|------------|
| **INT** | Intelligence | Learning, Misc |
| **WIS** | Wisdom | Learning, Wellbeing, Finance, Misc |
| **CHA** | Charisma | Social, Misc |
| **VIT** | Vitality | Wellbeing, Misc (lowered by Bad Habits) |
| **GOLD** | Currency | Finance, milestones (spent in the Shop) |

### Additional Tracking
- **Streak days** — consecutive days with at least one logged activity
- **Mood, energy & anxiety** — optional per-activity wellbeing snapshots (1–5 scale)
- **Critical success count** — lifetime total of critical hits rolled
- **Recent outcomes** — last 30 activity outcomes for adaptive difficulty
- **Gold milestones** — next XP threshold for the periodic 10 GOLD reward

---

## 🧮 RPG Principles & Logic

### XP Calculation

```
Base XP = durationMinutes × difficulty
```

**Final XP** applies multipliers in order:

| Multiplier | Formula | Effect |
|------------|---------|--------|
| Difficulty Ratio | `activity.difficulty / expectedDifficulty` | Rewards taking on harder challenges |
| Outcome | completed = 1.0 · partial = 0.5 · failed = 0.0 | Proportional reward by result |
| Streak | `1 + min(0.05 × streakDays, 0.5)` | Up to +50% bonus at 10+ day streaks |
| Boss | `3.0` if boss quest, else `1.0` | Triple XP for high-stakes activities |
| Critical Hit | `2×` (15% random chance) | Surprise double XP + 15 GOLD bonus |
| Fail Penalty | `−5 XP` if outcome = failed | Small XP deduction on failures |

**Bad habits** bypass all multipliers and yield **negative XP** (`-baseXP`).

### Leveling System

```
Required XP per level = 500 × level^1.5
```

| Level | XP Required |
|-------|-------------|
| 1 → 2 | 500 |
| 2 → 3 | ~1,414 |
| 5 → 6 | ~5,590 |
| 10 → 11 | ~15,811 |

XP requirements scale exponentially, rewarding sustained effort over time.

### Attribute Growth

Each logged activity modifies character stats based on its domain:

```
Base delta = max(1, round(xpGained / 20))
```

- **Learning**: INT + base, WIS + ⌈base/2⌉
- **Wellbeing**: VIT + base, WIS + ⌈base/2⌉
- **Finance**: GOLD + base, WIS + ⌈base/2⌉
- **Social**: CHA + base
- **Misc**: All stats + ⌈base/4⌉ (small balanced boost)
- **Bad Habit**: VIT − penalty, WIS − ⌈penalty/2⌉

### Goldilocks Adaptive Difficulty

The system automatically tunes the **expected difficulty** based on your recent success rate (last 30 outcomes):

| Success Rate | Adjustment |
|-------------|------------|
| > 80% | Expected difficulty **+0.5** (up to 5.0) |
| < 40% | Expected difficulty **−0.5** (down to 1.0) |
| 40–80% | No change |

This keeps tasks in the "Goldilocks zone" — challenging enough to be engaging but not so hard they become discouraging.

### Streak Mechanics
- Logging any non-bad-habit activity on consecutive calendar days builds your streak
- Streak bonus: **+5% per day**, capped at **+50%** (10+ days)
- **Streak Freeze** items (purchasable for 50 GOLD) protect your streak when you miss a day

### Critical Hits
- Every activity submission has a **15% chance** of triggering a critical success
- Critical hits grant **2× final XP** and a **+15 GOLD bonus**
- Bad habits are excluded from critical hits

### Gold Milestones
- Each time your cumulative XP crosses a milestone, you earn **+10 GOLD**
- Milestones are spaced at **random intervals between 300 and 400 XP**
- The next milestone threshold is recalculated after each reward, keeping the timing unpredictable

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **UI** | React 19 + Tailwind CSS 3 |
| **State** | Zustand 5 |
| **Database** | Dexie.js 4 (IndexedDB) |
| **Build** | Vite 7 + TypeScript 5 |
| **PWA** | vite-plugin-pwa |
| **Testing** | Vitest + React Testing Library |
| **Audio** | Web Audio API |
| **Haptics** | Vibration API |

## 🏛️ Architecture

```
src/
├── components/    # React + Tailwind UI components
├── data/
│   ├── db.ts              # IndexedDB schema (Dexie)
│   └── repositories/      # Data access layer (CRUD operations, export/import, scheduling)
├── lib/
│   ├── rpg-math.ts        # Pure RPG game logic (XP, levels, attributes, Goldilocks)
│   ├── soundEngine.ts     # Web Audio sound effects
│   └── haptics.ts         # Vibration API helpers
├── state/                 # Zustand stores (game state, UI state)
└── types/index.ts         # TypeScript interfaces
```

**Key design principle**: strict separation of concerns — pure math logic in `lib/`, data access in `repositories/`, reactive state in Zustand `state/`, and presentation in `components/`.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run coverage
```

---

## 🔒 Privacy

Level-Up-Life is **fully offline**. All data lives in your browser's IndexedDB — nothing is sent to any server. Use the built-in export/import feature to back up or transfer your data.

---

## 📄 License

ISC
