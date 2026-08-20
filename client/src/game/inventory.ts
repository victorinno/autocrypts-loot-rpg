/** Modernist Dungeon Ledger: pure catalogue-backed inventory helpers for equipment and item inspection. */

import type { GameState, Item } from "./types";

export interface LoadoutComparison {
  equipped: Item | undefined;
  statDelta: number;
  tierDelta: number;
  valueDelta: number;
  verdict: "upgrade" | "downgrade" | "lateral" | "equipped" | "open-slot";
}

const TIER_SCORE = { COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, RELIC: 4 } as const;

function statValue(stat: string): number {
  return Number(stat.match(/\+(\d+)/)?.[1] ?? 0);
}

export function isEquipped(state: GameState, itemId: string): boolean {
  return state.equipment.some((item) => item.id === itemId);
}

export function equippedSlotItem(state: GameState, slot: Item["slot"]): Item | undefined {
  return state.equipment.find((item) => item.slot === slot);
}

export function compareItemToEquipped(state: GameState, candidate: Pick<Item, "id" | "slot" | "tier" | "stat" | "value">): LoadoutComparison {
  const equipped = equippedSlotItem(state, candidate.slot);
  if (!equipped) return { equipped, statDelta: statValue(candidate.stat), tierDelta: TIER_SCORE[candidate.tier], valueDelta: candidate.value, verdict: "open-slot" };
  const statDelta = statValue(candidate.stat) - statValue(equipped.stat);
  const tierDelta = TIER_SCORE[candidate.tier] - TIER_SCORE[equipped.tier];
  const valueDelta = candidate.value - equipped.value;
  const verdict = candidate.id === equipped.id ? "equipped" : statDelta > 0 || (statDelta === 0 && tierDelta > 0) ? "upgrade" : statDelta < 0 || (statDelta === 0 && tierDelta < 0) ? "downgrade" : "lateral";
  return { equipped, statDelta, tierDelta, valueDelta, verdict };
}

export function inventorySpace(state: GameState): number {
  return Math.max(0, state.inventoryCapacity - state.inventory.length);
}
