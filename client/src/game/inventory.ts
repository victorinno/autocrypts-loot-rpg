/** Modernist Dungeon Ledger: pure catalogue-backed inventory helpers for equipment and item inspection. */

import type { GameState, Item } from "./types";

export function isEquipped(state: GameState, itemId: string): boolean {
  return state.equipment.some((item) => item.id === itemId);
}

export function equippedSlotItem(state: GameState, slot: Item["slot"]): Item | undefined {
  return state.equipment.find((item) => item.slot === slot);
}

export function inventorySpace(state: GameState): number {
  return Math.max(0, state.inventoryCapacity - state.inventory.length);
}
