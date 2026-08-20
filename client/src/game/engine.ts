/** Modernist Dungeon Ledger: pure expedition, mastery-scaled automatic combat, drops, and inventory mutations. */

import { chooseAutomatedSkill } from "./automation";
import { comboBonus, resolvesCombo } from "./combos";
import { classById, enemyFor, lootFor, roomFor, skillById, skillsForClass, startingEquipment } from "./data";
import { effectPower, masteryRank, skillDamage } from "./mastery";
import type { AutomationRule, ClassId, ComboRule, DotStatus, Enemy, EnemyStatus, GameState, Item, LogTone, PlayerState, Skill } from "./types";

export const RESTORE_RATIO = 0.3;
export const RESTORE_COOLDOWN = 3;
export const AUTO_RESTORE_THRESHOLD = 0.35;

function record(state: GameState, message: string, tone: LogTone = "neutral"): GameState { const eventId = state.eventId + 1; return { ...state, eventId, logs: [{ id: eventId, message, tone }, ...state.logs].slice(0, 8) }; }
function newPlayer(classId: ClassId): PlayerState { const spec = classById(classId); return { classId, health: spec.maxHealth, maxHealth: spec.maxHealth, ward: spec.ward, healingCharges: 2, maxHealingCharges: 2, gold: 16, xp: 0, skillPoints: 5, unlockedSkillIds: [skillsForClass(classId)[0].id], skillUses: {} }; }
function defaultRules(classId: ClassId): AutomationRule[] { const skills = skillsForClass(classId); return [{ id: 1, condition: "always", skillId: skills[0].id }, { id: 2, condition: "enemyBurning", skillId: skills[1].id }, { id: 3, condition: "enemyLow", skillId: skills[2].id }]; }
function defaultCombo(classId: ClassId): ComboRule { const skills = skillsForClass(classId); return { openerId: skills[1].id, followupId: skills[2].id }; }
function awardItem(state: GameState, item: Item, message: string): GameState { if (state.inventory.length >= state.inventoryCapacity) return record({ ...state, player: { ...state.player, gold: state.player.gold + item.value } }, `Inventory full. Salvaged ${item.name} for ${item.value} gold.`, "loot"); return record({ ...state, inventory: [item, ...state.inventory] }, message, "loot"); }
function clearReward(state: GameState): GameState { const item = lootFor(state.roomIndex + 7); const player = { ...state.player, gold: state.player.gold + 14, xp: state.player.xp + 18, skillPoints: state.player.skillPoints + (state.roomIndex % 2 === 0 ? 1 : 0) }; return awardItem({ ...state, phase: "resolved", enemy: null, player }, item, `Hostile cleared. Filed ${item.name} [${item.tier}].`); }
function isElemental(skill: Skill): boolean { return skill.damageType === "fire" || skill.damageType === "frost" || skill.damageType === "arcane" || skill.damageType === "poison"; }
function isPhysical(skill: Skill): boolean { return skill.damageType === "slash" || skill.damageType === "pierce" || skill.damageType === "blunt"; }
function applyDotTicks(state: GameState): GameState {
  if (!state.enemy) return state;
  const statuses: Partial<Record<EnemyStatus, number>> = { ...state.enemy.statuses };
  const statusPotency = { ...state.enemy.statusPotency };
  let enemy: Enemy = { ...state.enemy, statuses, statusPotency };
  let next = state;
  (Object.keys(statuses) as EnemyStatus[]).forEach((status) => {
    const turns = statuses[status] ?? 0;
    if (turns <= 0) return;
    if (status === "fire" || status === "poison" || status === "bleed") {
      const potency = statusPotency[status] ?? 1;
      enemy = { ...enemy, health: Math.max(0, enemy.health - potency) };
      next = record({ ...next, enemy }, `${status.toUpperCase()} deals ${potency} persistent damage.`, "damage");
    }
    statuses[status] = Math.max(0, turns - 1);
    if (statuses[status] === 0) delete statusPotency[status];
  });
  return { ...next, enemy: { ...enemy, statuses, statusPotency } };
}
function effectLog(skill: Skill, power: number): string {
  const label = skill.effect.label;
  if (skill.effect.kind === "burn" || skill.effect.kind === "bleed" || skill.effect.kind === "venom") return `${label} applied: ${power} damage for 3 turns.`;
  if (skill.effect.kind === "chill") return `${label}: retaliation reduced by ${power}%.`;
  if (skill.effect.kind === "ward") return `${label}: +${power} ward.`;
  if (skill.effect.kind === "sunder") return `${label}: physical hits gain +${power} damage.`;
  if (skill.effect.kind === "exposure") return `${label}: elemental hits gain +${power} damage.`;
  if (skill.effect.kind === "heal") return `${label}: +${power} vitality.`;
  if (skill.effect.kind === "execute") return `${label}: triggers below ${power}% health.`;
  return `${label}: every third cast deals critical damage.`;
}

export function newGame(classId: ClassId = "warden"): GameState {
  const player = newPlayer(classId); const spec = classById(classId); const equipment = startingEquipment(classId);
  return { phase: "planning", roomIndex: 0, currentRoom: { kind: "nothing", title: "Expedition Ready", summary: "Mark a doctrine, then breach the next room.", detail: "Automatic combat begins only when a hostile room is entered." }, player, enemy: null, inventory: equipment, inventoryCapacity: 60, equipment, cooldowns: {}, healingCooldown: 0, automation: defaultRules(classId), combo: defaultCombo(classId), lastSkillId: null, logs: [{ id: 1, message: `${spec.name} doctrine loaded. Awaiting the first breach.`, tone: "neutral" }], eventId: 1 };
}
export function selectClass(classId: ClassId): GameState { return record(newGame(classId), `${classById(classId).name} class selected. Doctrine recalibrated.`); }
export function enterRoom(state: GameState): GameState {
  if (state.phase === "combat" || state.phase === "fallen") return state;
  const roomIndex = state.roomIndex + 1; const room = roomFor(roomIndex); const base = { ...state, roomIndex, currentRoom: room, cooldowns: {}, lastSkillId: null };
  if (room.kind === "monster") return record({ ...base, phase: "combat", enemy: enemyFor(roomIndex) }, `Room ${roomIndex}: hostile signature found. Doctrine engaged.`, "danger");
  if (room.kind === "treasure") { const item = lootFor(roomIndex); const charges = Math.min(state.player.maxHealingCharges, state.player.healingCharges + 1); const replenished = charges > state.player.healingCharges; const player = { ...state.player, gold: state.player.gold + 10, xp: state.player.xp + 8, healingCharges: charges }; return awardItem({ ...base, phase: "resolved", player }, item, `Recovered ${item.name} [${item.tier}]${replenished ? " and replenished one restorative vial" : ""}.`); }
  if (room.kind === "trap") { const damage = 13 + roomIndex; const health = Math.max(0, state.player.health - damage); return record({ ...base, phase: health === 0 ? "fallen" : "resolved", player: { ...state.player, health } }, `Pressure fault deals ${damage} damage.`, "danger"); }
  return record({ ...base, phase: "resolved" }, "No response. The route remains clear.");
}
export function unlockSkill(state: GameState, skillId: string): GameState { const skill = skillById(skillId); if (!skill || skill.classId !== state.player.classId || state.player.unlockedSkillIds.includes(skillId) || state.player.skillPoints < 1) return state; const previous = skillsForClass(skill.classId).find((entry) => entry.tier === skill.tier - 1); if (previous && !state.player.unlockedSkillIds.includes(previous.id)) return state; return record({ ...state, player: { ...state.player, skillPoints: state.player.skillPoints - 1, unlockedSkillIds: [...state.player.unlockedSkillIds, skillId] } }, `${skill.name} added to the doctrine.`, "loot"); }
export function updateAutomation(state: GameState, id: number, update: Partial<AutomationRule>): GameState { return { ...state, automation: state.automation.map((rule) => rule.id === id ? { ...rule, ...update } : rule) }; }
export function reorderAutomation(state: GameState, id: number, direction: -1 | 1): GameState { const current = state.automation.findIndex((rule) => rule.id === id); const target = current + direction; if (current < 0 || target < 0 || target >= state.automation.length) return state; const automation = [...state.automation]; [automation[current], automation[target]] = [automation[target], automation[current]]; return record({ ...state, automation }, `Doctrine priority ${direction < 0 ? "raised" : "lowered"}.`); }
export function updateCombo(state: GameState, update: Partial<ComboRule>): GameState { return { ...state, combo: { ...state.combo, ...update } }; }
export function healingAmount(player: PlayerState): number { return Math.max(1, Math.ceil(player.maxHealth * RESTORE_RATIO)); }
export function canUseHealing(state: GameState): boolean { return state.phase !== "fallen" && state.player.health < state.player.maxHealth && state.player.healingCharges > 0 && state.healingCooldown === 0; }
export function useHealingVial(state: GameState, source = "Field vial"): GameState { if (!canUseHealing(state)) return state; const restored = Math.min(healingAmount(state.player), state.player.maxHealth - state.player.health); const player = { ...state.player, health: state.player.health + restored, healingCharges: state.player.healingCharges - 1 }; return record({ ...state, player, healingCooldown: RESTORE_COOLDOWN }, `${source} restores ${restored} vitality.`, "loot"); }
export function equipItem(state: GameState, itemId: string): GameState { const item = state.inventory.find((entry) => entry.id === itemId); if (!item) return state; const equipment = [item, ...state.equipment.filter((entry) => entry.slot !== item.slot)]; return record({ ...state, equipment }, `Equipped ${item.name} in ${item.slot}.`, "loot"); }
export function salvageItem(state: GameState, itemId: string): GameState { const item = state.inventory.find((entry) => entry.id === itemId); if (!item) return state; return record({ ...state, inventory: state.inventory.filter((entry) => entry.id !== itemId), equipment: state.equipment.filter((entry) => entry.id !== itemId), player: { ...state.player, gold: state.player.gold + item.value } }, `Salvaged ${item.name} for ${item.value} gold.`, "loot"); }

export function tickCombat(state: GameState): GameState {
  if (state.phase !== "combat" || !state.enemy) return state;
  const cooldowns = Object.fromEntries(Object.entries(state.cooldowns).map(([id, value]) => [id, Math.max(0, value - 1)]));
  let prepared = applyDotTicks({ ...state, cooldowns, healingCooldown: Math.max(0, state.healingCooldown - 1) });
  if (!prepared.enemy || prepared.enemy.health === 0) return clearReward(prepared);
  const skill = chooseAutomatedSkill(prepared);
  if (!skill) return record(prepared, "No eligible rule. The doctrine waits.");
  const usesBefore = prepared.player.skillUses[skill.id] ?? 0;
  const uses = usesBefore + 1;
  const rank = masteryRank(uses);
  const power = effectPower(skill.effect, uses);
  const comboTriggered = resolvesCombo(prepared.combo, prepared.lastSkillId, skill.id);
  let damage = skillDamage(skill, uses) + (comboTriggered ? comboBonus(prepared.combo.openerId, prepared.combo.followupId) : 0);
  const enemy = prepared.enemy;
  if (isPhysical(skill) && (enemy.statuses.sunder ?? 0) > 0) damage += enemy.statusPotency.sunder ?? 0;
  if (isElemental(skill) && (enemy.statuses.exposure ?? 0) > 0) damage += enemy.statusPotency.exposure ?? 0;
  const critical = skill.effect.kind === "critical" && uses % 3 === 0;
  if (critical) damage = Math.ceil(damage * (1 + power / 100));
  const execute = skill.effect.kind === "execute" && enemy.health / enemy.maxHealth <= power / 100;
  if (execute) damage = enemy.health;
  const statuses = { ...enemy.statuses }; const statusPotency = { ...enemy.statusPotency };
  let player = { ...prepared.player, skillUses: { ...prepared.player.skillUses, [skill.id]: uses } };
  if (skill.effect.kind === "burn" || skill.effect.kind === "bleed" || skill.effect.kind === "venom") { const status: DotStatus = skill.effect.kind === "venom" ? "poison" : skill.effect.kind === "burn" ? "fire" : "bleed"; statuses[status] = 3; statusPotency[status] = power; }
  if (skill.effect.kind === "chill") { statuses.frost = 2; statusPotency.frost = power; }
  if (skill.effect.kind === "sunder") { statuses.sunder = 3; statusPotency.sunder = power; }
  if (skill.effect.kind === "exposure") { statuses.exposure = 3; statusPotency.exposure = power; }
  if (skill.effect.kind === "ward") player = { ...player, ward: player.ward + power };
  if (skill.effect.kind === "heal") player = { ...player, health: Math.min(player.maxHealth, player.health + power) };
  const enemyHealth = Math.max(0, enemy.health - damage);
  let next = record({ ...prepared, player, cooldowns: { ...prepared.cooldowns, [skill.id]: skill.cooldown }, enemy: { ...enemy, health: enemyHealth, statuses, statusPotency }, lastSkillId: skill.id }, `${skill.name} [M${rank}] deals ${damage} ${skill.damageType} damage${critical ? " — CRITICAL" : ""}${execute ? " — EXECUTE" : ""}.`, "damage");
  if (skill.effect.kind !== "critical") next = record(next, effectLog(skill, power), skill.effect.kind === "heal" || skill.effect.kind === "ward" ? "loot" : "combo");
  if (comboTriggered) next = record(next, `COMBO: +${comboBonus(prepared.combo.openerId, prepared.combo.followupId)} linked damage resolved.`, "combo");
  if (enemyHealth === 0) return clearReward(next);
  const chillPercent = next.enemy?.statuses.frost ? next.enemy.statusPotency.frost ?? 0 : 0;
  const incoming = Math.max(0, Math.ceil(enemy.power * (1 - chillPercent / 100)));
  const absorbed = Math.min(next.player.ward, incoming);
  const remainingHealth = Math.max(0, next.player.health - (incoming - absorbed));
  next = record({ ...next, player: { ...next.player, ward: next.player.ward - absorbed, health: remainingHealth } }, `${enemy.name} retaliates for ${incoming}${absorbed ? `, ward absorbs ${absorbed}` : ""}.`, "danger");
  const atEmergencyThreshold = next.player.health / next.player.maxHealth <= AUTO_RESTORE_THRESHOLD;
  if (atEmergencyThreshold && canUseHealing(next)) return useHealingVial(next, "Mend protocol");
  return remainingHealth === 0 ? record({ ...next, phase: "fallen" }, "Expedition ended. The crypt keeps the route.", "danger") : next;
}
