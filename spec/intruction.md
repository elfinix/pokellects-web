**Executive Summary:**\
I want to make a web application named “Pokellects” which is a web-based Pokémon knowledge and collection game where players build a **personal Pokédex** by identifying, remembering, and learning about Pokémon. Unlike a traditional Pokémon quiz, where completing a question only contributes to a temporary score, **Pokellects saves the player's progress**. Every Pokémon they successfully register becomes part of their personal collection, creating a long-term objective: **complete the Pokédex.**

**System Prompt** (don't mention in UI)**:\
Tech**: React (Node.js) + Vite + Tailwind CSS v4

- Runtime: React 19 and React DOM 19
- Icons & Charts: Lucide React, Recharts
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`

Also use: ThreeJS and other npx/npm external libraries that can help beautify our UI

**Data**:

- Source of truth for pokemon data: PokeAPI
- Player's data: Generate mockdata.ts first

**Styling**:\
Use **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

**Code Quality**:

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

**Toolbox:**

- Every page that has data readable from it must have a toolbox on the top page that presents either or all: Search field, Filter button/dropdown, Sort button/dropdown, Sort toggle (Asc/Desc via an icon)

**Users:**

1. Player\
   their data are:

- first name, last name (optional)
- username
- password (with password visibility toggle)
- gender
- birthday
- icon (blue person for male; pink person for female; gray person for non-binary)

1. Admin\
   their data are:

- first name, last name (optional)
- username
- password (with password visibility toggle)
- department
- gender
- birthday
- icon (blue person for male; pink person for female; gray person for non-binary)

**Color Palette/Design Theme:**

Dark-first, with accent of Red - but it’s actually dynamic, like depending on the pokemon (and their type), when on their page, the UI also changes

**Functional Requirements:**

Landing page is presented very beautifully, with aspects of ThreeJS. Player and admin pages are presented with a sleek main page and side bar navigation.

Upon user’s log in, they are first displayed with the dashboard. Then, they can proceed to Pokedex page to see their current pokedex list. When in this page, below, there is a floating input field where they can input a pokemon’s name. Then once that pokemon’s name is confirmed to exist, it will automatically be registered to the pokedex with a banner/modal showing that pokemon’s detail. Clicking on a pokemon also shows the pokemon’s detail. Present the modal aesthetically with proper UI/UX. When on the pokedex page, the focus is always put on the input field. Since it’s gonna be a repetitive process: user inputs pokemon name → pokemon details appear → user clicks Escape button → focus again on the input to continue playing.

Please also consider possible variations of the name, but not typos (e.g., For Porygon-Z, Porygon Z is allowed,. Also special case, when a name matches an equivalent of more than one pokemon, like for regional variants (e.g., Nidoran accounts to both male and female, Tauros includes both the Kantonian and Paldean Tauros).

In Arena page, the games are first presented as cards. When clicked a modal on the description of thge game appears, and when the “Play Game” button is clicked, it redirects to a page-whole change in UI (not modal) where the game can be played. Each game presents a way for a user to unlock a pokemon, and for every pokemon, they are also registered in the Pokedex. The games should only present to player Pokemon they haven’t unlocked yet.

The goal is for the user to complete the Pokedex.

**Suggest your Plans to Me:**

1. Default view/filter when opening the Pokedex page
2. How to display pokemon modal/dialog when a pokemon is clicked
   1. What tabs are present in the modal for the groupings of details

**Pages:**

1. Landing Page
   1. the header must have a “Get Started” (redirect to login page)
   2. Hero
   3. About the System
   4. Meet the Developers
   5. (more possible addition here)
   6. footer
2. Login Page
   1. Email
   2. Password
3. Player Panel | Dashboard
   1. Metrics
   2. Charts
4. Player Panel | Pokedex
   1. Toolbox
   2. Main Pokedex
      1. Toolbox
      2. When a pokemon is clicked, a modal appears for the details of that pokemon that can be grouped by tags
5. Player Panel | Arena
   1. Who’s That Pokemon (silhouette guessing)
   2. Hangmon (Hangman-style Pokemon guessing)
   3. Identicry (Identify the Pokemon based on the cry)
   4. _soon (not yet to implement)_: Pokedle (Grid-wordle-style Pokemon guessing from overlapping criteria)
6. Player Panel | Reports
7. Player Panel | Achievements
8. Player Panel | Settings
9. Admin Panel | Dashboard
10. Admin Panel | Users
11. Admin Panel | Configurations
    1. this can include the main configuration for each game
    2. include also Feature Flags here
12. Admin Panel | Reports
13. Admin Panel | Settings

Technical Instructions:

Follow the appropriate and standard structuring of the ReactJS Code

> Root Folder contains: [index.html, package.json, package-lock.json, tsconfig.json, tsconfig.node.json, vite.config.json, and src/]\
> src/ Folder contains: [components/, context/, hooks/, pages/, services/, styles/, App.tsx, main.tsx]\
> 🟡 Prepare the code for Convex database integration
