/** Modernist Dungeon Ledger: deterministic ordered automation rule evaluation. */

import { skillById } from "./data";
import type { ConditionId, GameState, Skill } from "./types";

function conditionMatches(condition: ConditionId, state: GameState): boolean {
  const enemy = state.enemy;
  if (condition === "always") return true;
  if (condition === "playerLow") return state.player.health / state.player.maxHealth <= 0.5;
  if (!enemy) return false;
  if (condition === "enemyBurning") return (enemy.statuses.fire ?? 0) > 0;
  if (condition === "enemyFrosted") return (enemy.statuses.frost ?? 0) > 0;
  return enemy.health / enemy.maxHealth <= 0.4;
}

export function chooseAutomatedSkill(state: GameState): Skill | undefined {
  const allowed = new Set(state.player.unlockedSkillIds);
  for (const rule of state.automation) {
    const skill = skillById(rule.skillId);
    if (skill && allowed.has(skill.id) && (state.cooldowns[skill.id] ?? 0) === 0 && conditionMatches(rule.condition, state)) {
      return skill;
    }
  }
  return undefined;
}
