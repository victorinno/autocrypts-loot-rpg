# Memory

## 2026-08-20 — Initialization

The project was initialized as a static React/Vite WebDev application. The game will be built as a browser-playable, information-dense dungeon crawler with an automated combat doctrine, configurable skill conditions, and ordered combo chains. No assets have been wired yet.

## 2026-08-20 — Scope Revision

The user requested an English-only, minimalist game without generated or external imagery for now. The production direction therefore uses CSS material, typography, icons, and geometric combat markers rather than visual assets. Previously reserved image URLs must not be referenced by the app.

## 2026-08-20 — Implementation Verification

The finished game uses an asset-free React interface plus a small Babylon procedural room tableau. Desktop and mobile screenshots confirmed that the expedition desk, class selector, skill tree, automatic-combat state, automation queue, combo configuration, items, route progression, and combat record are visible. `pnpm check` passed. The first production build hit a command time limit while transforming Babylon, then completed successfully with a longer bounded-memory run. Browser and dev-server logs contained no error or warning entries during verification.

## 2026-08-20 — Published Run QA, Scenario 1

On the public GitHub Pages build, the Warden entered the opening monster room, automatic combat ran without user clicks, Cleave dealt 15 slash damage on its tick cadence, the Stonebound Guard retaliated for 6, and the player fell from 128 to 98 health before victory. The reward resolved exactly once as Chalksteel Edge [COMMON], with gold and XP increasing and the room action changing to Advance Route. No visible runtime fault occurred.

## 2026-08-20 — Published Run QA, Scenario 2 Preparation

After the first victory, Ember Cut unlocked using one skill point and immediately became selectable in the doctrine. Frost Guard then unlocked using the final skill point, proving the tier prerequisite and skill-point gates work. The default combo UI remains Ember Cut → Frost Guard, ready for a full trigger test in the next monster room.

The public-run test then opened the first-priority skill selector to assign Ember Cut as the automatic opener. Browser keyboard interaction was used to move to the second skill option; the subsequent room test will confirm whether the selection committed before interpreting combo output.

The first keyboard attempt targeted the condition selector rather than the skill selector and did not alter the visible doctrine. The test then focused the correct first-priority skill selector. The next input will apply the second option and verify it with combat-log evidence.

The browser’s native selector interaction did not visibly commit either ArrowDown or type-ahead while the published page was under automation. Rather than treat this as a game defect, the test will use the built-in deterministic demonstration route for room-state coverage and report the automation queue UI as only partially validated.

## 2026-08-20 — Published Run QA, Scenario 3

The public `?demo` route progressed automatically from the opening monster to room 2 treasure, room 3 nothing, and room 4 monster. The combat record explicitly showed the clear reward, then `Recovered Chalksteel Edge [COMMON]`, then `No response. The route remains clear.`, before room 4 began against Cinder Husk. Gold rose to 40 and XP to 26. This validates automatic transition handling for monster, treasure, and nothing outcomes.

The same demo reached an Ash Wisp and correctly entered the fallen state at 0/128 health with `Expedition ended. The crypt keeps the route.` The Reset Expedition control restored the new Warden baseline (128 health, 16 gold, zero XP, and the first room’s fresh enemy) before the demo resumed. This validates defeat and reset behavior. The trap is implicitly traversed in the route from room 5 to room 6 but was no longer present in the short rolling event log for direct wording verification.

The test then selected Arcanist during an active demo room. The run reset to the expected Arcanist baseline (92/92 health and 28 ward), replaced Arc Bolt/Cinder Sigil/Ice Lance in the tree, replaced the equipment issue item, and rewrote the automation queue and combo defaults to the class-specific skills. The combat log confirmed `Arcanist class selected. Doctrine recalibrated.`

## 2026-08-20 — Published Run QA, Scenario 4

On the public demo route, moving the first doctrine rule down updated the rule order and immediately wrote `Doctrine priority lowered.` into the combat log. The same visible run reached the trap room directly and recorded `Pressure fault deals 18 damage.`, confirming the previously inferred trap behavior. A deterministic engine harness then configured Warden’s Ember Cut → Frost Guard sequence under two always-eligible rules. It passed with the exact event `COMBO: +12 linked damage resolved.`, leaving the 76-health starting enemy at 40 health. The temporary harness was removed after the pass. The native browser selector itself could not be changed through the automation driver, so UI selection is not fully end-to-end validated through the test driver; its backing engine behavior was validated deterministically.

## 2026-08-20 — Inventory Expansion Verification

The updated development build renders the new inventory entry point at 5/60. Opening it reveals a full item ledger with a Run Inventory tab, a Catalogue tab labeled 250, slot and tier filters, five equipped starter instances, and a detailed item inspector with equip and salvage controls. The inventory drawer preserves the modernist ledger visual language and does not depend on image assets.

The Catalogue tab exposed `250 records shown` and rendered tier-qualified, distinct blueprint records. Returning to Run Inventory restored the five acquired starter instances and their equipped state in the same ledger without disrupting the active game view.

Salvaging the selected equipped starter weapon reduced the live inventory counter from 5/60 to 4/60, increased gold from 16 to 24, removed the weapon from the equipped preview, and emitted `Salvaged Chalksteel Edge for 8 gold.` in the combat record. Closing the ledger returned cleanly to the expedition desk.

The drop engine was checked independently: a treasure room produced Brassroot Filed Talisman, a combat clear produced Boneglass Filed Greaves, and both instances carried base IDs present in the 250-item catalogue. A cleared combat run increased inventory from five starter instances to six. Temporary validation files were removed after passing.

The 250-item catalogue test confirmed 250 entries with 250 unique IDs and tier-qualified names. It also verified equip replacement within the same slot and salvage removal from both inventory and equipment, including the exact gold reward. Desktop and mobile screenshots showed a readable expedition desk and ledger; `pnpm check` and the production build passed, and the available runtime logs contained no errors.

GitHub Pages deployment run 32376884928 completed successfully. The live game displays Inventory 5/60, tier-qualified starter items, the item-ledger entry point, and the Run Inventory / Catalogue 250 tabs with inspector and action controls.

## 2026-08-20 — Restorative Protocol Verification

The updated development demo displayed the Field Medicine panel with two restorative vial charges and a `MEND +39 VITALITY` control. During the fourth monster room, it showed the Warden at 74/128 health with both charges still available, confirming that a player can choose recovery before the automatic 35% emergency threshold is reached.

The interactive manual-control test consumed one vial, reflected by the field-medicine panel changing to 1/2 charges. The rapid demo continued through later rooms and eventually reached a fallen trap state, while the rolling combat record separately confirmed a treasure cache replenished a missing restorative vial. The deterministic engine test verified the exact manual, cooldown, emergency, and treasure rules without timing ambiguity.

## 2026-08-20 — Central Tableau UX Repair

The central room UX failure was caused by a broad late-stage CSS selector forcing every direct stage child into relative positioning. That overrode the absolute positioning required by the player card, hostile card, room briefing, and primary action. The repair restores explicit absolute layers, confines decorative route geometry to non-interactive pseudo-elements, and separates the state cards from the room briefing. Desktop and mobile screenshots show the cards, ready marker, briefing, and Breach First Room action without overlap or blocked hit targets.
