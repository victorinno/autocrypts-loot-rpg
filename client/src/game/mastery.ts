/** Modernist Dungeon Ledger: pure skill-usage mastery and effect-scaling helpers. */

import type { SecondaryEffect, Skill } from "./types";

export const CASTS_PER_RANK = 3;
export const MAX_MASTERY_RANK = 5;

export function masteryRank(uses: number): number { return Math.min(MAX_MASTERY_RANK, Math.floor(Math.max(0, uses) / CASTS_PER_RANK)); }
export function castsToNextRank(uses: number): number { return masteryRank(uses) >= MAX_MASTERY_RANK ? 0 : CASTS_PER_RANK - (uses % CASTS_PER_RANK || CASTS_PER_RANK); }
export function skillDamage(skill: Skill, uses: number): number { return skill.damage + masteryRank(uses) * 2; }
export function effectPower(effect: SecondaryEffect, uses: number): number { return effect.amount + masteryRank(uses) * effect.scale; }
export function masteryLine(skill: Skill, uses: number): string { const rank = masteryRank(uses); return rank >= MAX_MASTERY_RANK ? `M${rank} / MAX` : `M${rank} / ${castsToNextRank(uses)} casts`; }
