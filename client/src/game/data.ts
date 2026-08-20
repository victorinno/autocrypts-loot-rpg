/** Modernist Dungeon Ledger: English game data and semantic color metadata. */

import type { ClassId, ClassSpec, ConditionId, DamageType, Enemy, Item, Room, Skill } from "./types";

export const DAMAGE_META: Record<DamageType, { short: string; label: string }> = {
  slash: { short: "SL", label: "Slash" },
  pierce: { short: "PR", label: "Pierce" },
  blunt: { short: "BL", label: "Blunt" },
  fire: { short: "FI", label: "Fire" },
  frost: { short: "FR", label: "Frost" },
  arcane: { short: "AR", label: "Arcane" },
  poison: { short: "PO", label: "Poison" },
};

export const CONDITIONS: Record<ConditionId, string> = {
  always: "Always",
  enemyBurning: "Enemy is burning",
  enemyFrosted: "Enemy is frosted",
  enemyLow: "Enemy below 40%",
  playerLow: "Health below 50%",
};

export const CLASSES: ClassSpec[] = [
  { id: "warden", name: "Warden", short: "WD", description: "A durable blade doctrine for measured physical chains.", maxHealth: 128, ward: 18, primaryDamage: "slash" },
  { id: "arcanist", name: "Arcanist", short: "AR", description: "Elemental sequencing and status-driven punishment.", maxHealth: 92, ward: 28, primaryDamage: "arcane" },
  { id: "ravager", name: "Ravager", short: "RV", description: "Heavy impacts that convert danger into momentum.", maxHealth: 150, ward: 10, primaryDamage: "blunt" },
];

export const SKILLS: Skill[] = [
  { id: "cleave", classId: "warden", name: "Cleave", description: "A reliable wide slash.", damage: 15, damageType: "slash", cooldown: 1, tier: 0 },
  { id: "emberCut", classId: "warden", name: "Ember Cut", description: "Brands the target with fire.", damage: 13, damageType: "fire", cooldown: 2, tier: 1 },
  { id: "frostGuard", classId: "warden", name: "Frost Guard", description: "A cold strike that slows the enemy.", damage: 11, damageType: "frost", cooldown: 2, tier: 2 },
  { id: "arcBolt", classId: "arcanist", name: "Arc Bolt", description: "A direct pulse of arcane force.", damage: 14, damageType: "arcane", cooldown: 1, tier: 0 },
  { id: "cinderSigil", classId: "arcanist", name: "Cinder Sigil", description: "Ignites an exposed target.", damage: 12, damageType: "fire", cooldown: 2, tier: 1 },
  { id: "iceLance", classId: "arcanist", name: "Ice Lance", description: "Pierces and chills the target.", damage: 16, damageType: "frost", cooldown: 2, tier: 2 },
  { id: "ironCrash", classId: "ravager", name: "Iron Crash", description: "A brutal, dependable impact.", damage: 18, damageType: "blunt", cooldown: 1, tier: 0 },
  { id: "rendingAxe", classId: "ravager", name: "Rending Axe", description: "A heavy rupturing strike.", damage: 16, damageType: "slash", cooldown: 2, tier: 1 },
  { id: "cinderSlam", classId: "ravager", name: "Cinder Slam", description: "A crushing attack that ignites.", damage: 15, damageType: "fire", cooldown: 2, tier: 2 },
];

const ROOM_SEQUENCE: Room["kind"][] = ["monster", "treasure", "nothing", "monster", "trap", "monster", "treasure", "trap"];

const ROOM_COPY: Record<Room["kind"], Omit<Room, "kind">> = {
  monster: { title: "Hostile Signature", summary: "A guard blocks the route.", detail: "Combat begins automatically when the threshold is crossed." },
  treasure: { title: "Sealed Cache", summary: "An unclaimed item waits.", detail: "The expedition catalogues the find before moving on." },
  nothing: { title: "Quiet Passage", summary: "Nothing answers your approach.", detail: "The route remains clear, but the crypt is still watching." },
  trap: { title: "Pressure Fault", summary: "A buried mechanism activates.", detail: "The trap strikes once before the route can continue." },
};

const ENEMIES = ["Stonebound Guard", "Ash Wisp", "Grave Leech", "Cinder Husk"];

export function classById(id: ClassId): ClassSpec {
  return CLASSES.find((entry) => entry.id === id) ?? CLASSES[0];
}

export function skillsForClass(classId: ClassId): Skill[] {
  return SKILLS.filter((skill) => skill.classId === classId);
}

export function skillById(id: string): Skill | undefined {
  return SKILLS.find((skill) => skill.id === id);
}

export function roomFor(index: number): Room {
  const kind = ROOM_SEQUENCE[(index - 1) % ROOM_SEQUENCE.length];
  return { kind, ...ROOM_COPY[kind] };
}

export function enemyFor(index: number): Enemy {
  const maxHealth = 64 + index * 12;
  return {
    id: `enemy-${index}`,
    name: ENEMIES[(index - 1) % ENEMIES.length],
    health: maxHealth,
    maxHealth,
    power: 6 + Math.floor(index / 2),
    statuses: {},
  };
}

export function startingEquipment(classId: ClassId): Item[] {
  const className = classById(classId).name;
  return [
    { id: "starter-weapon", name: `${className} Issue`, slot: "Weapon", tier: "COMMON", stat: "+4 base damage" },
    { id: "starter-armor", name: "Cryptweave Coat", slot: "Armor", tier: "COMMON", stat: "+8 guard" },
    { id: "starter-relic", name: "Blank Route Seal", slot: "Relic", tier: "COMMON", stat: "+2% discovery" },
  ];
}

export function lootFor(index: number): Item {
  const tier = index % 5 === 0 ? "EPIC" : index % 3 === 0 ? "RARE" : "COMMON";
  const options: Record<Item["tier"], Omit<Item, "id" | "tier">> = {
    COMMON: { name: "Chalksteel Edge", slot: "Weapon", stat: "+5 base damage" },
    RARE: { name: "Blueglass Sigil", slot: "Relic", stat: "+12% elemental damage" },
    EPIC: { name: "Vermilion Cuirass", slot: "Armor", stat: "+20 max health" },
    RELIC: { name: "The Unfolding Key", slot: "Relic", stat: "+1 combo damage tier" },
  };
  return { id: `loot-${index}`, tier, ...options[tier] };
}
