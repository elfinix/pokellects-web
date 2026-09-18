# Pokellects — Minigames Design Language & Specification

This specification documents the visual, structural, and behavioral design language established for all minigames in Pokellects.

---

## 1. Core Principles & Layout Rules

### Viewport Fitting & Non-Scrollable Experience
- **Zero Scrollability**: Minigames must fit completely within the viewport height (`h-[calc(100vh-theme(spacing.20))]` or `max-h-[860px] min-h-[580px]`). No internal or page scrollbars during gameplay.
- **Consistent Page Width**: Must match the standard workspace container (`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) matching Pokédex, Dashboard, and Reports.
- **Unified Header Alignment**: Aligned to top origin with standard navigation components.

### Flat & Premium Aesthetics
- **No Heavy Shadows / Glows**: Avoid heavy box shadows, colorful glow auras, and gradient text. Use flat, crisp borders (`border border-slate-200/90`), clean backgrounds (`bg-white` and `bg-slate-50/80`), and solid accent colors.
- **Minimalist & Distraction-Free**: Avoid verbose sci-fi HUD text or cluttered labels. Keep instructions concise and gameplay-focused.
- **No Visual Keyboard Badges**: Do not clutter the interface with visible `<kbd>` badges; keep hotkeys silent for power users.

---

## 2. Gameplay & Pokédex Integration Rules

### 1. Strictly Unregistered Pokémon Pool
- Every round **must** exclusively draw species that the player has **not yet registered** in their Pokédex (using `getRandomUndiscoveredPokemon` combined with persistent storage checks).
- If a player has collected all 1,025 species, gracefully fallback to the complete roster.

### 2. Untimed Rounds & Active Skip
- Minigames operate without countdown pressure unless explicitly specified.
- A prominent **Skip** action allows players to rotate to another mystery species at any time without penalty or resetting their win streak.

### 3. Clean Pokédex Registration
- Victories record the species to the user's collection via `registerById(id, method)`.
- Registration happens silently in the background without automatically opening the modal or triggering discovery overlays when switching to the Pokédex tab.

### 4. Complete Identity Concealment on Loss
- When a player fails or runs out of attempts/chances in a minigame (such as Hangmon or Identicry), **DO NOT reveal the Pokémon's artwork, name, Dex number, or details**!
- The purpose is testing and sharpening Dex recall; revealing the mystery Pokémon spoils the challenge.
- Present a clean, concealed loss screen with a prompt to advance to the next mystery Pokémon.

---

## 3. Canvas & Visual Anatomy

### Full-Screen Stage with Subtle Texture
- The main gameplay stage spans the full canvas area.
- Canvas background features a subtle, elegant dot-matrix grid (`radial-gradient(circle, #94a3b8 0.8px, transparent 0.8px)` at `24px` spacing with `40%` opacity).
- Scanner corner brackets (`┌ ┐ └ ┘`) in slate border colors anchor the 4 corners of the canvas.

### Drag-Protected Visual Assets
- All mystery sprites and silhouettes must enforce strict drag and context menu prevention:
  ```tsx
  draggable={false}
  onDragStart={(e) => e.preventDefault()}
  onContextMenu={(e) => e.preventDefault()}
  style={{ userSelect: 'none', WebkitUserDrag: 'none', WebkitTouchCallout: 'none' }}
  className="select-none pointer-events-none"
  ```

### Flicker-Free Preloading
- Before mounting a new Pokémon on the canvas, the image URL must be fully preloaded in memory (`new Image().onload`).
- While loading, render an animated spinner (`Loader2 animate-spin text-amber-500`) instead of generic question mark icons or flashing placeholder sprites.

---

## 4. Insignia & Stamp Placement

### On the Game Canvas (Upon Victory / Revelation)
1. **Pokéball Insignia Mark (`PokeballChalkMark`)**:
   - Positioned near the **top-right of the Pokémon artwork** (`-top-3 -right-6 sm:-top-5 sm:-right-8`).
2. **`REGISTERED` Stamp (`ChalkRegisteredStamp`)**:
   - Positioned in the **top-right corner of the canvas frame** (`top-8 right-8 sm:top-10 sm:right-10`).
   - Includes the animated red chalk spring transition with `NEW!` badge if newly registered.

### Inside the Pokédex Detail Modal (`View Dex`)
- When opened from a minigame:
  - Previous/Next navigation buttons are disabled (`showNavigation={false}`).
  - The modal footer renders only the centered **`REGISTERED` Stamp** (`ChalkRegisteredStamp`).
  - The Pokéball Insignia remains on the top right below the close button.

---

## 5. Controls & Bottom Action Dock

### Floating Middle-Bottom Dock
- The interaction dock floats centered in front of the lower portion of the canvas (`w-full max-w-xl mx-auto`).
- **Input Field**:
  - Uses the **Crosshair** (`Crosshair`) icon as the leading indicator.
  - Zero autocomplete suggestions or spoilers.
  - Auto-focused on round start.
  - Case-insensitive and punctuation-tolerant matching (`normalizePokemonQuery`).
- **Post-Reveal Actions**:
  - **View Dex** button with `BookOpen` icon to inspect the discovered entry.
  - **Next Pokémon →** primary action button to advance to the next round.

---

## 6. Mini-game Theme & Metadata Reference

| Minigame | Theme Color | Icon | Gameplay Mechanic |
| :--- | :--- | :--- | :--- |
| **Who's That Pokémon?** | Amber (`#f59e0b`) | `Eye` | Mystery silhouette with text name identification & untimed skip. |
| **Hangmon** | Blue (`#3b82f6`) | `Type` | Letter-by-letter tile deduction with concealed Pokémon identity. |
| **Identicry** | Purple (`#8b5cf6`) | `Volume2` | Audio cry identification with zero visual previews. |
| **Biolo-gist** | Teal (`#14b8a6`) | `ScrollText` | Bulbapedia biology text deduction with redacted species names. |
| **Pokédle** | Slate (`#64748b`) | `Grid3X3` | Attribute Wordle matrix (*In Development — "Dev is cooking"*). |
