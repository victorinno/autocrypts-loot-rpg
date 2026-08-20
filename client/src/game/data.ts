/** Modernist Dungeon Ledger: English combat doctrines, semantic colors, and a deterministic 250-item catalogue. */

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

const skill = (id: string, classId: ClassId, name: string, description: string, damage: number, damageType: DamageType, cooldown: number, tier: number, kind: Skill["effect"]["kind"], amount: number, scale: number, label: string): Skill => ({ id, classId, name, description, damage, damageType, cooldown, tier, effect: { kind, amount, scale, label } });
export const SKILLS: Skill[] = [
  skill("cleave", "warden", "Cleave", "A reliable wide slash that opens a wound.", 15, "slash", 1, 0, "bleed", 3, 1, "Bleed"),
  skill("emberCut", "warden", "Ember Cut", "Brands the target with fire.", 13, "fire", 2, 1, "burn", 3, 1, "Burn"),
  skill("frostGuard", "warden", "Frost Guard", "A cold strike that raises a ward.", 11, "frost", 2, 2, "ward", 8, 3, "Ward gain"),
  skill("stoneBreak", "warden", "Stone Break", "A disciplined pierce that breaks defenses.", 17, "pierce", 2, 3, "sunder", 5, 2, "Ward break"),
  skill("vigilMend", "warden", "Vigil Mend", "A measured strike that restores resolve.", 10, "slash", 3, 4, "heal", 9, 3, "Vitality return"),
  skill("lastOath", "warden", "Last Oath", "A final blade doctrine for weakened hostiles.", 23, "slash", 3, 5, "execute", 16, 3, "Execute threshold"),
  skill("arcBolt", "arcanist", "Arc Bolt", "A direct pulse that exposes elemental weaknesses.", 14, "arcane", 1, 0, "exposure", 5, 2, "Elemental exposure"),
  skill("cinderSigil", "arcanist", "Cinder Sigil", "Ignites an exposed target.", 12, "fire", 2, 1, "burn", 3, 1, "Burn"),
  skill("iceLance", "arcanist", "Ice Lance", "Pierces and chills the target.", 16, "frost", 2, 2, "chill", 25, 5, "Retaliation slow"),
  skill("venomCant", "arcanist", "Venom Cant", "A corrosive refrain that persists between casts.", 11, "poison", 2, 3, "venom", 3, 1, "Venom"),
  skill("prismLash", "arcanist", "Prism Lash", "Every third cast tears through certainty.", 18, "arcane", 2, 4, "critical", 55, 8, "Critical impact"),
  skill("astralSever", "arcanist", "Astral Sever", "Unthreads targets already close to collapse.", 20, "arcane", 3, 5, "execute", 14, 3, "Execute threshold"),
  skill("ironCrash", "ravager", "Iron Crash", "A brutal impact that sunders the frame.", 18, "blunt", 1, 0, "sunder", 4, 2, "Ward break"),
  skill("rendingAxe", "ravager", "Rending Axe", "A heavy rupture that continues to bleed.", 16, "slash", 2, 1, "bleed", 3, 1, "Bleed"),
  skill("cinderSlam", "ravager", "Cinder Slam", "A crushing attack that ignites.", 15, "fire", 2, 2, "burn", 3, 1, "Burn"),
  skill("glacierRoar", "ravager", "Glacier Roar", "A chilling blow that suppresses retaliation.", 14, "frost", 2, 3, "chill", 30, 5, "Retaliation slow"),
  skill("bloodFurnace", "ravager", "Blood Furnace", "An impact that recovers vitality through force.", 13, "blunt", 3, 4, "heal", 10, 3, "Vitality return"),
  skill("ruinfall", "ravager", "Ruinfall", "A terminal impact for exposed quarry.", 25, "blunt", 3, 5, "execute", 18, 3, "Execute threshold"),
];

export const ITEM_SLOTS: ItemSlot[] = ["Weapon", "Armor", "Relic", "Helm", "Boots"];
export const ITEM_TIERS: ItemTier[] = ["COMMON", "UNCOMMON", "RARE", "EPIC", "RELIC"];
const ITEM_FAMILIES = ["Chalksteel", "Boneglass", "Cinderthread", "Blueglass", "Gravesilk", "Brassroot", "Mooniron", "Vermilion", "Hollowsalt", "Nightscript"];
const SLOT_FORMS: Record<ItemSlot, string[]> = { Weapon: ["Edge", "Pike", "Hammer", "Scepter", "Cleaver", "Mace", "Needle", "Falchion", "Maul", "Brand"], Armor: ["Coat", "Carapace", "Harness", "Cuirass", "Mantle", "Vestment", "Mail", "Shell", "Raiment", "Plate"], Relic: ["Seal", "Prism", "Key", "Sigil", "Lens", "Talisman", "Rune", "Idol", "Charm", "Votive"], Helm: ["Visor", "Hood", "Crown", "Mask", "Helm", "Circlet", "Browguard", "Cowl", "Casque", "Diadem"], Boots: ["Treads", "Greaves", "Walkers", "Steps", "Sabatons", "Striders", "Boots", "Gaiters", "Tracks", "Marchers"] };
const TIER_MULTIPLIER: Record<ItemTier, number> = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 5, RELIC: 8 };
const TIER_NAME: Record<ItemTier, string> = { COMMON: "Filed", UNCOMMON: "Marked", RARE: "Sealed", EPIC: "Consecrated", RELIC: "Lasting" };
function statFor(slot: ItemSlot, tier: ItemTier): string { const amount = TIER_MULTIPLIER[tier]; return { Weapon: `+${amount * 4} base damage`, Armor: `+${amount * 9} max health`, Relic: `+${amount * 3}% elemental damage`, Helm: `+${amount * 4} ward`, Boots: `+${amount * 2}% room scouting` }[slot]; }
function descriptionFor(slot: ItemSlot, tier: ItemTier, family: string): string { return `${tier.toLowerCase()} ${family.toLowerCase()} fieldwork for a crypt expedition. Its ${slot.toLowerCase()} discipline is catalogued for repeatable doctrine builds.`; }
export const CATALOGUE: ItemBlueprint[] = ITEM_SLOTS.flatMap((slot) => ITEM_FAMILIES.flatMap((family, familyIndex) => ITEM_TIERS.map((tier, tierIndex) => ({ id: `catalogue-${slot.toLowerCase()}-${familyIndex + 1}-${tier.toLowerCase()}`, name: `${family} ${TIER_NAME[tier]} ${SLOT_FORMS[slot][familyIndex]}`, slot, tier, stat: statFor(slot, tier), description: descriptionFor(slot, tier, family), value: 8 * TIER_MULTIPLIER[tier] + tierIndex * 4 }))));
export const CATALOGUE_TOTAL = CATALOGUE.length;
const ROOM_SEQUENCE: Room["kind"][] = ["monster", "treasure", "nothing", "monster", "trap", "monster", "treasure", "trap"];
const ROOM_COPY: Record<Room["kind"], Omit<Room, "kind">> = { monster: { title: "Hostile Signature", summary: "A guard blocks the route.", detail: "Combat begins automatically when the threshold is crossed." }, treasure: { title: "Sealed Cache", summary: "An unclaimed item waits.", detail: "The expedition catalogues the find before moving on." }, nothing: { title: "Quiet Passage", summary: "Nothing answers your approach.", detail: "The route remains clear, but the crypt is still watching." }, trap: { title: "Pressure Fault", summary: "A buried mechanism activates.", detail: "The trap strikes once before the route can continue." } };
const ENEMIES = ["Stonebound Guard", "Ash Wisp", "Grave Leech", "Cinder Husk"];
export function classById(id: ClassId): ClassSpec { return CLASSES.find((entry) => entry.id === id) ?? CLASSES[0]; }
export function skillsForClass(classId: ClassId): Skill[] { return SKILLS.filter((skill) => skill.classId === classId); }
export function skillById(id: string): Skill | undefined { return SKILLS.find((skill) => skill.id === id); }
export function roomFor(index: number): Room { const kind = ROOM_SEQUENCE[(index - 1) % ROOM_SEQUENCE.length]; return { kind, ...ROOM_COPY[kind] }; }
export function enemyFor(index: number): Enemy { const maxHealth = 64 + index * 12; return { id: `enemy-${index}`, name: ENEMIES[(index - 1) % ENEMIES.length], health: maxHealth, maxHealth, power: 6 + Math.floor(index / 2), statuses: {}, statusPotency: {} }; }
export function itemFromBlueprint(blueprint: ItemBlueprint, instanceId: string, acquiredAt: number): Item { return { ...blueprint, id: instanceId, baseId: blueprint.id, acquiredAt }; }
export function startingEquipment(classId: ClassId): Item[] { const affinity = classId === "warden" ? 0 : classId === "arcanist" ? 3 : 7; return ITEM_SLOTS.map((slot, index) => { const blueprint = CATALOGUE.find((entry) => entry.slot === slot && entry.tier === "COMMON" && entry.name.startsWith(ITEM_FAMILIES[(affinity + index) % ITEM_FAMILIES.length])) ?? CATALOGUE[index]; return itemFromBlueprint(blueprint, `starter-${classId}-${slot.toLowerCase()}`, index); }); }
export function lootFor(index: number): Item { const tier: ItemTier = index % 17 === 0 ? "RELIC" : index % 9 === 0 ? "EPIC" : index % 5 === 0 ? "RARE" : index % 3 === 0 ? "UNCOMMON" : "COMMON"; const options = CATALOGUE.filter((entry) => entry.tier === tier); const blueprint = options[(index * 11 + 3) % options.length]; return itemFromBlueprint(blueprint, `drop-${index}-${blueprint.id}`, index); }
