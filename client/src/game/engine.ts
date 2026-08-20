/** Modernist Dungeon Ledger: pure expedition, automatic combat, drops, and inventory mutations. */

import { chooseAutomatedSkill } from "./automation";
import { comboBonus, resolvesCombo } from "./combos";
import { classById, enemyFor, lootFor, roomFor, skillById, skillsForClass, startingEquipment } from "./data";
import type { AutomationRule, ClassId, ComboRule, GameState, Item, LogTone, PlayerState } from "./types";

export const RESTORE_RATIO = 0.3;
export const RESTORE_COOLDOWN = 3;
export const AUTO_RESTORE_THRESHOLD = 0.35;

function record(state: GameState, message: string, tone: LogTone = "neutral"): GameState {
  const eventId = state.eventId + 1;
  return { ...state, eventId, logs: [{ id: eventId, message, tone }, ...state.logs].slice(0, 8) };
}

function newPlayer(classId: ClassId): PlayerState {
  const spec = classById(classId);
  return { classId, health: spec.maxHealth, maxHealth: spec.maxHealth, ward: spec.ward, healingCharges: 2, maxHealingCharges: 2, gold: 16, xp: 0, skillPoints: 2, unlockedSkillIds: [skillsForClass(classId)[0].id] };
}

function defaultRules(classId: ClassId): AutomationRule[] { const skills = skillsForClass(classId); return [{ id: 1, condition: "always", skillId: skills[0].id }, { id: 2, condition: "enemyBurning", skillId: skills[1].id }, { id: 3, condition: "enemyLow", skillId: skills[2].id }]; }
function defaultCombo(classId: ClassId): ComboRule { const skills = skillsForClass(classId); return { openerId: skills[1].id, followupId: skills[2].id }; }

function awardItem(state: GameState, item: Item, message: string): GameState {
  if (state.inventory.length >= state.inventoryCapacity) return record({ ...state, player: { ...state.player, gold: state.player.gold + item.value } }, `Inventory full. Salvaged ${item.name} for ${item.value} gold.`, "loot");
  return record({ ...state, inventory: [item, ...state.inventory] }, message, "loot");
}

export function newGame(classId: ClassId = "warden"): GameState {
  const player = newPlayer(classId);
  const spec = classById(classId);
  const equipment = startingEquipment(classId);
  return { phase: "planning", roomIndex: 0, currentRoom: { kind: "nothing", title: "Expedition Ready", summary: "Mark a doctrine, then breach the next room.", detail: "Automatic combat begins only when a hostile room is entered." }, player, enemy: null, inventory: equipment, inventoryCapacity: 60, equipment, cooldowns: {}, healingCooldown: 0, automation: defaultRules(classId), combo: defaultCombo(classId), lastSkillId: null, logs: [{ id: 1, message: `${spec.name} doctrine loaded. Awaiting the first breach.`, tone: "neutral" }], eventId: 1 };
}

export function selectClass(classId: ClassId): GameState { return record(newGame(classId), `${classById(classId).name} class selected. Doctrine recalibrated.`); }

export function enterRoom(state: GameState): GameState {
  if (state.phase === "combat" || state.phase === "fallen") return state;
  const roomIndex = state.roomIndex + 1;
  const room = roomFor(roomIndex);
  const base = { ...state, roomIndex, currentRoom: room, cooldowns: {}, lastSkillId: null };
  if (room.kind === "monster") return record({ ...base, phase: "combat", enemy: enemyFor(roomIndex) }, `Room ${roomIndex}: hostile signature found. Doctrine engaged.`, "danger");
  if (room.kind === "treasure") {
    const item = lootFor(roomIndex);
    const charges = Math.min(state.player.maxHealingCharges, state.player.healingCharges + 1);
    const replenished = charges > state.player.healingCharges;
    const player = { ...state.player, gold: state.player.gold + 10, xp: state.player.xp + 8, healingCharges: charges };
    return awardItem({ ...base, phase: "resolved", player }, item, `Recovered ${item.name} [${item.tier}]${replenished ? " and replenished one restorative vial" : ""}.`);
  }
  if (room.kind === "trap") {
    const damage = 13 + roomIndex;
    const health = Math.max(0, state.player.health - damage);
    return record({ ...base, phase: health === 0 ? "fallen" : "resolved", player: { ...state.player, health } }, `Pressure fault deals ${damage} damage.`, "danger");
  }
  return record({ ...base, phase: "resolved" }, "No response. The route remains clear.");
}

export function unlockSkill(state: GameState, skillId: string): GameState {
  const skill = skillById(skillId);
  if (!skill || skill.classId !== state.player.classId || state.player.unlockedSkillIds.includes(skillId) || state.player.skillPoints < 1) return state;
  const previous = skillsForClass(skill.classId).find((entry) => entry.tier === skill.tier - 1);
  if (previous && !state.player.unlockedSkillIds.includes(previous.id)) return state;
  return record({ ...state, player: { ...state.player, skillPoints: state.player.skillPoints - 1, unlockedSkillIds: [...state.player.unlockedSkillIds, skillId] } }, `${skill.name} added to the doctrine.`, "loot");
}

export function updateAutomation(state: GameState, id: number, update: Partial<AutomationRule>): GameState { return { ...state, automation: state.automation.map((rule) => rule.id === id ? { ...rule, ...update } : rule) }; }
export function reorderAutomation(state: GameState, id: number, direction: -1 | 1): GameState { const current = state.automation.findIndex((rule) => rule.id === id); const target = current + direction; if (current < 0 || target < 0 || target >= state.automation.length) return state; const automation = [...state.automation]; [automation[current], automation[target]] = [automation[target], automation[current]]; return record({ ...state, automation }, `Doctrine priority ${direction < 0 ? "raised" : "lowered"}.`); }
export function updateCombo(state: GameState, update: Partial<ComboRule>): GameState { return { ...state, combo: { ...state.combo, ...update } }; }

export function healingAmount(player: PlayerState): number { return Math.max(1, Math.ceil(player.maxHealth * RESTORE_RATIO)); }

export function canUseHealing(state: GameState): boolean {
  return state.phase !== "fallen" && state.player.health < state.player.maxHealth && state.player.healingCharges > 0 && state.healingCooldown === 0;
}

export function useHealingVial(state: GameState, source = "Field vial"): GameState {
  if (!canUseHealing(state)) return state;
  const restored = Math.min(healingAmount(state.player), state.player.maxHealth - state.player.health);
  const player = { ...state.player, health: state.player.health + restored, healingCharges: state.player.healingCharges - 1 };
  return record({ ...state, player, healingCooldown: RESTORE_COOLDOWN }, `${source} restores ${restored} vitality.`, "loot");
}

export function equipItem(state: GameState, itemId: string): GameState {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return state;
  const equipment = [item, ...state.equipment.filter((entry) => entry.slot !== item.slot)];
  return record({ ...state, equipment }, `Equipped ${item.name} in ${item.slot}.`, "loot");
}

export function salvageItem(state: GameState, itemId: string): GameState {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return state;
  return record({ ...state, inventory: state.inventory.filter((entry) => entry.id !== itemId), equipment: state.equipment.filter((entry) => entry.id !== itemId), player: { ...state.player, gold: state.player.gold + item.value } }, `Salvaged ${item.name} for ${item.value} gold.`, "loot");
}

export function tickCombat(state: GameState): GameState {
  if (state.phase !== "combat" || !state.enemy) return state;
  const cooldowns = Object.fromEntries(Object.entries(state.cooldowns).map(([id, value]) => [id, Math.max(0, value - 1)]));
  const statuses = Object.fromEntries(Object.entries(state.enemy.statuses).map(([key, value]) => [key, Math.max(0, (value ?? 0) - 1)]));
  const prepared = { ...state, cooldowns, healingCooldown: Math.max(0, state.healingCooldown - 1), enemy: { ...state.enemy, statuses } };
  const skill = chooseAutomatedSkill(prepared);
  if (!skill) return record(prepared, "No eligible rule. The doctrine waits.");
  const comboTriggered = resolvesCombo(prepared.combo, prepared.lastSkillId, skill.id);
  const bonus = comboTriggered ? comboBonus(prepared.combo.openerId, prepared.combo.followupId) : 0;
  const damage = skill.damage + bonus;
  const nextStatuses = { ...prepared.enemy.statuses };
  if (skill.damageType === "fire" || skill.damageType === "frost" || skill.damageType === "poison") nextStatuses[skill.damageType] = 3;
  const enemyHealth = Math.max(0, prepared.enemy.health - damage);
  let next = record({ ...prepared, cooldowns: { ...prepared.cooldowns, [skill.id]: skill.cooldown }, enemy: { ...prepared.enemy, health: enemyHealth, statuses: nextStatuses }, lastSkillId: skill.id }, `${skill.name} deals ${damage} ${skill.damageType} damage.`, "damage");
  if (comboTriggered) next = record(next, `COMBO: +${bonus} linked damage resolved.`, "combo");
  if (enemyHealth === 0) {
    const item = lootFor(prepared.roomIndex + 7);
    const player = { ...next.player, gold: next.player.gold + 14, xp: next.player.xp + 18, skillPoints: next.player.skillPoints + (prepared.roomIndex % 2 === 0 ? 1 : 0) };
    return awardItem({ ...next, phase: "resolved", enemy: null, player }, item, `Hostile cleared. Filed ${item.name} [${item.tier}].`);
  }
  const remainingHealth = Math.max(0, next.player.health - prepared.enemy.power);
  next = record({ ...next, player: { ...next.player, health: remainingHealth } }, `${prepared.enemy.name} retaliates for ${prepared.enemy.power}.`, "danger");
  const atEmergencyThreshold = next.player.health / next.player.maxHealth <= AUTO_RESTORE_THRESHOLD;
  if (atEmergencyThreshold && canUseHealing(next)) return useHealingVial(next, "Mend protocol");
  return remainingHealth === 0 ? record({ ...next, phase: "fallen" }, "Expedition ended. The crypt keeps the route.", "danger") : next;
}
