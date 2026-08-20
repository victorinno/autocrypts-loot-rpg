# Structure: AutoCrypts

## Application Boundary

The application uses React for the accessible interface and a framework-independent game domain under `client/src/game/`. The visual layer only renders state and forwards explicit user decisions; it never owns combat outcomes or room rules.

## Game Modules

| Module | Responsibility |
|---|---|
| `data.ts` | Defines classes, skills, item tiers, room outcomes, damage types, and initial build data. |
| `engine.ts` | Owns the expedition state, automatic combat tick, cooldown handling, room resolution, reward generation, and run reset. |
| `automation.ts` | Evaluates ordered automation rules against the current enemy and player state. |
| `combos.ts` | Validates compatible skill pairs and returns a resolved combo effect after an opener fires. |
| `types.ts` | Provides shared data shapes for combat, equipment, skills, and UI events. |
| `Home.tsx` | Composes the expedition desk and connects UI actions to one game-controller hook. |

## UI Regions

The screen is split into an expedition folio on the left, the active room tableau in the middle, and tactical doctrine panels on the right. The left contains character identity, resources, equipped items, and the skill tree. The middle contains the route, live enemy/player confrontation, explicit room action, and event log. The right contains automation and combo configuration. At narrow widths, these regions stack in the same gameplay order.

## State Ownership

`useAutoCryptsGame` owns one interval lifecycle and a single game-state snapshot. It delegates every mutation to pure helpers from the engine and automation modules. On unmount, the interval is cleared. No component creates its own competing combat timer.

## Visual System

The UI uses CSS only: graphite background, off-white document panels, thin dark dividers, vermilion active states, and elemental semantic colors. Motion is limited to meter changes, room reveal, event insertions, and combo threads; the motion is disabled for reduced-motion users.

