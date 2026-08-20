# Game Plan: AutoCrypts

## Risk Tasks

### 1. Real-time automatic combat and stateful combo resolution

- **Why isolated:** Timed cooldowns, automatic target decisions, and chained skill effects can produce duplicate triggers or stale combat state when the UI re-renders.
- **Approach:** Keep one mutable expedition state with a deterministic combat tick. Evaluate automation rules in priority order, trigger at most one eligible skill per combat turn, and resolve combo effects only after the initiating skill has successfully fired.
- **Verify:** Start a monster room, observe health values decrease on timed attacks, confirm the same skill does not fire twice per cooldown, and confirm a configured two-step combo produces the bonus event only after its required opener.

### 2. Room progression with divergent outcomes

- **Why isolated:** The room loop changes both combat state and non-combat rewards, so a transition can accidentally preserve a dead enemy, repeat loot, or advance twice.
- **Approach:** Resolve each room into exactly one explicit outcome—nothing, monster, treasure, or trap—then move through a single transition function that records the result and resets the next room state.
- **Verify:** Advance through multiple rooms and confirm every room produces one outcome, monster rooms cannot advance before victory, traps change health once, treasure is added once, and the route counter increments one room at a time.

## Main Build

Implement the game as an English-only, asset-free browser interface. The game needs a playable expedition loop, three distinct starting classes, skill-tree unlocks, tiered items, physical and elemental damage types, an automatic combat feed, configurable automation rules, and linked combo rules. The player should be able to choose a class, unlock skills, arrange doctrines, enter rooms, observe automated combat, gather rewards, and reset the run.

- **Assets needed:** None during the current minimalist direction. The visual system uses CSS surfaces, Lucide icons, type hierarchy, rule chips, health meters, and geometric room markers.
- **Verify:**
  - The app has no external or generated image dependencies.
  - Class selection, skill unlocks, room actions, automation edits, combo selection, and reset controls work with mouse and keyboard.
  - Physical and elemental damage labels remain readable and use distinct semantic colors.
  - The doctrine evaluation, combo trigger, loot acquisition, and room result appear in the combat log.
  - Desktop and mobile layouts are usable without overflow or clipped controls.
  - No browser console errors occur during an automated combat run.
  - The page matches the minimalist direction: dark graphite ground, warm white paper-like panels, restrained Crypt Vermilion accent, no image backgrounds, and no generic centered marketing layout.

## Inventory Expansion

The item system is a deterministic catalogue of **250 distinct base items**: five equipment slots, five tiers, and ten themed item families. The runtime inventory stores item instances, not just a compact preview, so the same base entry can be acquired more than once without identity collisions. The player can filter inventory entries, inspect exact stats, equip by slot, and salvage an instance for gold. Combat and treasure rewards select tier-aware entries from the catalogue.

- **Verify:** The catalogue contains exactly 250 unique base IDs and names; acquired inventory instances receive unique IDs; equipping replaces only the same slot; salvaging removes the correct instance and clears an equipped reference when needed; filters and the catalogue view remain usable at narrow widths.

## Restorative Protocol

Each run begins with two restorative vial charges. A vial restores **30% of maximum vitality**, capped at full health, and starts a three-combat-tick recovery cooldown. The player can trigger a vial manually from the field-medicine controls or the inventory ledger. During automatic combat, the Mend Protocol automatically spends a ready vial after incoming damage would leave vitality at or below 35%, including a lethal hit. Treasure rooms restore one missing charge, ensuring recovery is a tactical resource rather than a passive reset.

- **Verify:** healing never exceeds maximum health; manual use consumes one ready charge; the automatic threshold consumes a ready charge before a fallen state is resolved; treasure never raises charges above the maximum; and the interface displays current charges, cooldown, and recovery events.
