/** Modernist Dungeon Ledger: English game data, semantic damage colors, and a deterministic 250-item catalogue. */

import type { ClassId, ClassSpec, ConditionId, DamageType, Enemy, Item, ItemBlueprint, ItemSlot, ItemTier, Room, Skill } from "./types";

export const DAMAGE_META: Record<DamageType, { short: string; label: string }> = {
  slash: { short: "SL", label: "Slash" }, pierce: { short: "PR", label: "Pierce" }, blunt: { short: "BL", label: "Blunt" }, fire: { short: "FI", label: "Fire" }, frost: { short: "FR", label: "Frost" }, arcane: { short: "AR", label: "Arcane" }, poison: { short: "PO", label: "Poison" },
};

export const CONDITIONS: Record<ConditionId, string> = { always: "Always", enemyBurning: "Enemy is burning", enemyFrosted: "Enemy is frosted", enemyLow: "Enemy below 40%", playerLow: "Health below 50%" };

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

export const ITEM_SLOTS: ItemSlot[] = ["Weapon", "Armor", "Relic", "Helm", "Boots"];
export const ITEM_TIERS: ItemTier[] = ["COMMON", "UNCOMMON", "RARE", "EPIC", "RELIC"];
const ITEM_FAMILIES = ["Chalksteel", "Boneglass", "Cinderthread", "Blueglass", "Gravesilk", "Brassroot", "Mooniron", "Vermilion", "Hollowsalt", "Nightscript"];
const SLOT_FORMS: Record<ItemSlot, string[]> = {
  Weapon: ["Edge", "Pike", "Hammer", "Scepter", "Cleaver", "Mace", "Needle", "Falchion", "Maul", "Brand"],
  Armor: ["Coat", "Carapace", "Harness", "Cuirass", "Mantle", "Vestment", "Mail", "Shell", "Raiment", "Plate"],
  Relic: ["Seal", "Prism", "Key", "Sigil", "Lens", "Talisman", "Rune", "Idol", "Charm", "Votive"],
  Helm: ["Visor", "Hood", "Crown", "Mask", "Helm", "Circlet", "Browguard", "Cowl", "Casque", "Diadem"],
  Boots: ["Treads", "Greaves", "Walkers", "Steps", "Sabatons", "Striders", "Boots", "Gaiters", "Tracks", "Marchers"],
};
const TIER_MULTIPLIER: Record<ItemTier, number> = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 5, RELIC: 8 };
const TIER_NAME: Record<ItemTier, string> = { COMMON: "Filed", UNCOMMON: "Marked", RARE: "Sealed", EPIC: "Consecrated", RELIC: "Lasting" };

function statFor(slot: ItemSlot, tier: ItemTier): string {
  const amount = TIER_MULTIPLIER[tier];
  const stats: Record<ItemSlot, string> = { Weapon: `+${amount * 4} base damage`, Armor: `+${amount * 9} max health`, Relic: `+${amount * 3}% elemental damage`, Helm: `+${amount * 4} ward`, Boots: `+${amount * 2}% room scouting` };
  return stats[slot];
}

function descriptionFor(slot: ItemSlot, tier: ItemTier, family: string): string {
  return `${tier.toLowerCase()} ${family.toLowerCase()} fieldwork for a crypt expedition. Its ${slot.toLowerCase()} discipline is catalogued for repeatable doctrine builds.`;
}

export const CATALOGUE: ItemBlueprint[] = ITEM_SLOTS.flatMap((slot) => ITEM_FAMILIES.flatMap((family, familyIndex) => ITEM_TIERS.map((tier, tierIndex) => ({
  id: `catalogue-${slot.toLowerCase()}-${familyIndex + 1}-${tier.toLowerCase()}`,
  name: `${family} ${TIER_NAME[tier]} ${SLOT_FORMS[slot][familyIndex]}`,
  slot,
  tier,
  stat: statFor(slot, tier),
  description: descriptionFor(slot, tier, family),
  value: 8 * TIER_MULTIPLIER[tier] + tierIndex * 4,
}))));

export const CATALOGUE_TOTAL = CATALOGUE.length;
const ROOM_SEQUENCE: Room["kind"][] = ["monster", "treasure", "nothing", "monster", "trap", "monster", "treasure", "trap"];
const ROOM_COPY: Record<Room["kind"], Omit<Room, "kind">> = {
  monster: { title: "Hostile Signature", summary: "A guard blocks the route.", detail: "Combat begins automatically when the threshold is crossed." },
  treasure: { title: "Sealed Cache", summary: "An unclaimed item waits.", detail: "The expedition catalogues the find before moving on." },
  nothing: { title: "Quiet Passage", summary: "Nothing answers your approach.", detail: "The route remains clear, but the crypt is still watching." },
  trap: { title: "Pressure Fault", summary: "A buried mechanism activates.", detail: "The trap strikes once before the route can continue." },
};
const ENEMIES = ["Stonebound Guard", "Ash Wisp", "Grave Leech", "Cinder Husk"];

export function classById(id: ClassId): ClassSpec { return CLASSES.find((entry) => entry.id === id) ?? CLASSES[0]; }
export function skillsForClass(classId: ClassId): Skill[] { return SKILLS.filter((skill) => skill.classId === classId); }
export function skillById(id: string): Skill | undefined { return SKILLS.find((skill) => skill.id === id); }
export function roomFor(index: number): Room { const kind = ROOM_SEQUENCE[(index - 1) % ROOM_SEQUENCE.length]; return { kind, ...ROOM_COPY[kind] }; }
export function enemyFor(index: number): Enemy { const maxHealth = 64 + index * 12; return { id: `enemy-${index}`, name: ENEMIES[(index - 1) % ENEMIES.length], health: maxHealth, maxHealth, power: 6 + Math.floor(index / 2), statuses: {} }; }

export function itemFromBlueprint(blueprint: ItemBlueprint, instanceId: string, acquiredAt: number): Item {
  return { ...blueprint, id: instanceId, baseId: blueprint.id, acquiredAt };
}

export function startingEquipment(classId: ClassId): Item[] {
  const affinity = classId === "warden" ? 0 : classId === "arcanist" ? 3 : 7;
  return ITEM_SLOTS.map((slot, index) => {
    const blueprint = CATALOGUE.find((entry) => entry.slot === slot && entry.tier === "COMMON" && entry.name.startsWith(ITEM_FAMILIES[(affinity + index) % ITEM_FAMILIES.length])) ?? CATALOGUE[index];
    return itemFromBlueprint(blueprint, `starter-${classId}-${slot.toLowerCase()}`, index);
  });
}

export function lootFor(index: number): Item {
  const tier: ItemTier = index % 17 === 0 ? "RELIC" : index % 9 === 0 ? "EPIC" : index % 5 === 0 ? "RARE" : index % 3 === 0 ? "UNCOMMON" : "COMMON";
  const options = CATALOGUE.filter((entry) => entry.tier === tier);
  const blueprint = options[(index * 11 + 3) % options.length];
  return itemFromBlueprint(blueprint, `drop-${index}-${blueprint.id}`, index);
}
