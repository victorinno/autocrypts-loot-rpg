/** Modernist Dungeon Ledger: framework-independent game contracts and catalogue-backed inventory. */

export type ClassId = "warden" | "arcanist" | "ravager";
export type DamageType = "slash" | "pierce" | "blunt" | "fire" | "frost" | "arcane" | "poison";
export type ConditionId = "always" | "enemyBurning" | "enemyFrosted" | "enemyLow" | "playerLow";
export type RoomKind = "nothing" | "monster" | "treasure" | "trap";
export type GamePhase = "planning" | "combat" | "resolved" | "fallen";
export type LogTone = "neutral" | "damage" | "loot" | "combo" | "danger";
export type ItemSlot = "Weapon" | "Armor" | "Relic" | "Helm" | "Boots";
export type ItemTier = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "RELIC";

export interface Skill {
  id: string;
  classId: ClassId;
  name: string;
  description: string;
  damage: number;
  damageType: DamageType;
  cooldown: number;
  tier: number;
}

export interface ClassSpec {
  id: ClassId;
  name: string;
  short: string;
  description: string;
  maxHealth: number;
  ward: number;
  primaryDamage: DamageType;
}

export interface ItemBlueprint {
  id: string;
  name: string;
  slot: ItemSlot;
  tier: ItemTier;
  stat: string;
  description: string;
  value: number;
}

export interface Item extends Omit<ItemBlueprint, "id"> {
  id: string;
  baseId: string;
  acquiredAt: number;
}

export interface PlayerState {
  classId: ClassId;
  health: number;
  maxHealth: number;
  ward: number;
  gold: number;
  xp: number;
  skillPoints: number;
  unlockedSkillIds: string[];
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  power: number;
  statuses: Partial<Record<"fire" | "frost" | "poison", number>>;
}

export interface Room {
  kind: RoomKind;
  title: string;
  summary: string;
  detail: string;
}

export interface AutomationRule {
  id: number;
  condition: ConditionId;
  skillId: string;
}

export interface ComboRule {
  openerId: string;
  followupId: string;
}

export interface LogEntry {
  id: number;
  message: string;
  tone: LogTone;
}

export interface GameState {
  phase: GamePhase;
  roomIndex: number;
  currentRoom: Room;
  player: PlayerState;
  enemy: Enemy | null;
  inventory: Item[];
  inventoryCapacity: number;
  equipment: Item[];
  cooldowns: Record<string, number>;
  automation: AutomationRule[];
  combo: ComboRule;
  lastSkillId: string | null;
  logs: LogEntry[];
  eventId: number;
}
