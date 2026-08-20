# QA Notes

## 2026-08-20 — Ledger comparison positioning

The first desktop comparison preview showed that the floating comparison card obscured the item inspector. The comparison is now anchored as a left-side ledger companion at desktop sizes, preserving the selected item details, equip control, and salvage control. At narrower widths it moves to a centered bottom companion position rather than covering the inspector.

The ledger correctly reports an equipped item as `Equipped` inside Run Inventory, then reports the matching catalogue blueprint as `Lateral` with zero field, tier, and value deltas. The catalogue reveals same-slot entries from +4 through +32 base damage, enabling direct upgrade-state verification.

Selecting Chalksteel Lasting Edge in the catalogue produced a visible Upgrade card against Chalksteel Filed Edge, with +28 field, +4 tier, and +72g value. A deterministic comparison test also verified equipped, lateral, downgrade, and open-slot states. Type checking passed, and the temporary validation harness was removed.
