# AutoCrypts Implementation Checklist

- [x] Replace image-led art direction with an English-only minimalist interface built from CSS, typography, and geometric shapes.
- [x] Create the core expedition state: rooms, player class, equipment, skill points, and combat log.
- [x] Implement automatic combat with cooldowns, typed physical damage, and elemental damage.
- [x] Implement a room loop with nothing, monster, treasure, and trap outcomes.
- [x] Build interactive class selection and a skill-tree panel.
- [x] Add a configurable automation doctrine with ordered conditions and editable actions.
- [x] Add combo rules that trigger sequenced effects between compatible skills.
- [x] Implement equipment tiers, rarity, and stat changes.
- [x] Verify desktop and mobile layouts, interactions, type checking, and browser console health.
- [x] Publish the repository under victorinno and enable GitHub Pages.

## Gameplay QA Pass

- [x] Validate a full automatic monster-room combat and a combo trigger.
- [x] Validate treasure, nothing, and trap room resolutions across successive rooms.
- [x] Validate class changes, skill unlocks, automation priority edits, and reset behavior.
- [x] Inspect the published runtime for console errors and report the test outcome.

## Inventory Expansion

- [x] Define a deterministic 250-item catalogue across slots, tiers, and stat families.
- [x] Add inventory capacity, filtering, selection, equip, and salvage rules.
- [x] Replace the compact equipment preview with an accessible inventory panel and item inspector.
- [x] Make combat and treasure drops draw from the catalogue with tier-aware outcomes.
- [x] Verify catalogue uniqueness, inventory operations, responsive layout, and published behavior.

## Healing Mechanism

- [x] Add an automatic emergency heal with a visible restorative cooldown.
- [x] Add a restorative vial resource usable from the field-medicine inventory controls.
- [x] Add healing feedback to vitality, restorative charges, cooldown, and the combat record.
- [x] Verify that healing is capped at maximum health and cannot be used without available charges.
