/** Modernist Dungeon Ledger: explicit two-skill combo validation. */

import type { ComboRule } from "./types";

export function resolvesCombo(combo: ComboRule, lastSkillId: string | null, currentSkillId: string): boolean {
  return combo.openerId === lastSkillId && combo.followupId === currentSkillId && combo.openerId !== combo.followupId;
}

export function comboBonus(openerId: string, followupId: string): number {
  return openerId === followupId ? 0 : 12;
}
