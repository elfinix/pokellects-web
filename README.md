---
## What is Pokéllects

Unlike typical trivia quizzes where scores and answers vanish once the browser tab closes, **Pokéllects** turns identification, memory, and trivia into a permanent personal Pokédex ledger. Test your knowledge across all 9 generations, unlock entries permanently into your collection, and tackle challenges across interactive minigames.
---

## Core Features

- **Interactive 3D WebGL Companion** — Real-time 3D Pokéball with physics interaction, drag-to-inspect gestures, and instant random sprite summon effects.
- **National Pokédex Explorer** — Comprehensive directory spanning 1,025 species with 9 generation tabs, dual-type filtering, search omnibar, and collectible chalk stamps.
- **Continuous Floating Omnibar** — Speed-focused, keyboard-first registration bar that lets trainers identify, submit, and inspect entries without losing focus.
- **Trainer Dashboard and Analytics** — Live regional completion progress charts, elemental affinity breakdowns, and milestone achievement unlock tracking.
- **Adaptive UI Responsiveness** — Crafted from the ground up for seamless navigation across slim smartphones, foldable devices, tablets, iPads, and ultra-wide desktop monitors.
- **Tailored Light and Dark Themes** — Type-harmonized color system with accessible high-contrast modes, sound toggles, and reduced-motion support.
- **Real-Time Cloud Persistence** — Backed by Convex for sub-millisecond reactive subscriptions, secure credential auth, and atomic cascading data management.

---

## Screenshots

| Pokédex Vault Explorer                                                 | Interactive Minigames                                           |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| _Visual National Pokédex grid with 9 generations and stamp indicators_ | _Dynamic game modes drawn exclusively from undiscovered roster_ |

| Trainer Dashboard & Analytics                                    | Biolo-gist Knowledge Mode                                       |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| _Regional completion metrics and interactive achievement badges_ | _Bulbapedia passage comprehension with redacted identity clues_ |

---

## Minigames

All minigames dynamically select Pokémon from your **undiscovered roster**. Successfully clearing a round directly registers that species into your personal Pokédex.

### 1. Who's That Pokémon

The iconic silhouette recognition challenge. Study the silhouette, note elemental type hints, and identify the mystery Pokémon before time runs out.

### 2. Hangmon

Classic hangman word-puzzle with a trainer twist. Guess letter by letter while monitoring remaining attempts, generation indicators, and unique letter counts.

### 3. Identicry

Auditory memory challenge. Listen to authentic Pokémon sound cries sourced from the official games and type the corresponding species name.

### 4. Biolo-gist

Scientific reading comprehension. Read through authentic Bulbapedia biology descriptions with dynamically redacted species names and deduce the Pokémon from behavioral traits and habitat notes.

### 5. Pokédle

Wordle-style numerical and categorical deduction. Guess species and receive immediate feedback on Generation, Primary Type, Secondary Type, Height, and Weight comparisons.

---

## Tech Stack and Architecture

- **Frontend Framework:** React 19 + TypeScript
- **Styling and Theming:** Tailwind CSS v4 + Vanilla CSS Design Tokens
- **3D Graphics:** Three.js with WebGL canvas rendering
- **Animations:** Motion (Framer Motion) + Canvas Confetti
- **Charts and Data Visualization:** Recharts
- **Backend and Real-time Database:** Convex Cloud (`convex/` reactive platform)
- **Authentication:** `@convex-dev/auth` (Passkeys / Credentials)
- **Data Pipeline:** PokéAPI + Bulbapedia dataset

---

## Getting Started

### Prerequisites

- Node.js 18.0 or newer
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elfinix/pokellects-web.git
   cd pokellects-web
   ```
1. **Install dependencies:**
   ```bash
   npm install
   ```
1. **Configure Environment Variables:** Create a `.env.local` file in the project root:
   ```env
   VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
   VITE_CONVEX_SITE_URL=https://your-deployment-name.convex.site
   ```
1. **Start the development server:**
   ```bash
   npm run dev
   ```
1. Open http://localhost:5173 in your browser.

---

## Points for Improvement

The following areas are actively considered for upcoming iterations:

- **Regional Variants and Forms** — Extending the database schema to support Alolan, Galarian, Hisuian, and Paldean regional forms as distinct collectible entries.
- **Deeper Pokémon Details** — Expanding species modals to include base stats distributions, evolution chains, movepools, and shiny sprite toggles.
- **Additional Minigame Modes** — Developing new game formats including Type Matchup Battle Quiz, Height/Weight Balance Scale, and Silhouette Speed Run.

---

## Disclaimer and Credits

_Pokéllects is a fan-made, non-commercial open-source project. Pokémon and Pokémon character names, sprites, audio cries, and related media are trademarks and copyright of Nintendo, Creatures Inc., and GAME FREAK inc. Pokémon data is sourced via PokeAPI._
