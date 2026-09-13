# Pokellects

> **A personal Pokémon knowledge companion & collection game that never resets.**

![Status: In Active Development](https://img.shields.io/badge/status-in%20active%20development-amber.svg)

Unlike standard trivia quizzes where scores and answers vanish once the tab closes, **Pokellects** turns identification, memory, and trivia into a permanent personal Pokédex ledger. Test your knowledge across all 9 generations, unlock entries into your collection, and tackle minigames in the Battle Arena.

---

## 🚧 Status: Work in Progress

Pokellects is actively being built. Core systems currently in development and preview:

- [x] **Interactive 3D Hero Companion** — WebGL Pokéball with physics interaction and instant sprite summon mechanics.
- [x] **Light-First Design System** — Clean, modern UI with Pokémon type-accented palettes.
- [x] **Relational Storage & Session Engine** — Persistent trainer profiles, unlock ledgers, and multi-match query handling.
- [ ] **Player Dashboard & Pokédex Shell** — Visual National Pokédex grid with fast filters, generation buckets, and progress metrics.
- [ ] **Continuous Fast Input** — Floating keyboard-first identification engine for rapid-fire logging.
- [ ] **Battle Arena Minigames** — _Who's That Pokémon?_, _Hangmon_, and _Identicry_ drawn exclusively from your undiscovered roster.

---

## ⚡ Sneakpeek: What's Coming

| Feature                     | Description                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Personal Pokédex Ledger** | Track completion across 1,025 species with elemental type breakdowns and discovery timelines.                         |
| **Continuous Fast Input**   | Streamlined speed: type Pokémon names into a floating input bar and inspect entries without losing your flow.         |
| **Battle Arena Challenges** | Arena challenges exclusively select Pokémon you haven't yet unlocked. Win the round to register the species directly. |
| **100% Client Persistence** | Zero setup required; progress is saved automatically with local relational database backing.                          |

---

## 🛠️ Local Development

To run the sneakpeek build locally:

```bash
# Clone the repository
git clone https://github.com/elfinix/pokellects-web.git
cd pokellects-web

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## ⚖️ Disclaimer

_Pokellects is a fan-made, non-commercial open-source project. Pokémon and Pokémon character names, sprites, and data are trademarks and copyright of Nintendo, Creatures Inc., and GAME FREAK inc. Pokémon data sourced via PokeAPI._
