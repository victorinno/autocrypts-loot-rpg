/** Modernist Dungeon Ledger: asymmetric, asset-free combat desk over a procedural canvas. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { ArrowDown, ArrowUp, BookOpenText, Box, ChevronRight, Compass, Flame, Gem, HeartPulse, LockKeyhole, RotateCcw, Shield, Skull, Sparkles, Sword, Target, Zap } from "lucide-react";
import { CLASSES, CONDITIONS, DAMAGE_META, classById, skillById, skillsForClass } from "@/game/data";
import { enterRoom, newGame, reorderAutomation, selectClass, tickCombat, unlockSkill, updateAutomation, updateCombo } from "@/game/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import type { ClassId, ConditionId, DamageType, GameState, LogTone, Skill } from "@/game/types";

const TONE_LABELS: Record<LogTone, string> = { neutral: "NOTE", damage: "HIT", loot: "LOOT", combo: "COMBO", danger: "WARN" };

function percent(value: number, max: number): string {
  return `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
}

function DamageTag({ type }: { type: DamageType }) {
  return <span className={`damage-tag damage-${type}`}>{DAMAGE_META[type].short}</span>;
}

function Meter({ label, value, max, tone = "health" }: { label: string; value: number; max: number; tone?: "health" | "enemy" | "ward" }) {
  return <div className="meter"><div className="meter-label"><span>{label}</span><b>{value}/{max}</b></div><div className={`meter-track ${tone}`}><span style={{ width: percent(value, max) }} /></div></div>;
}

function SkillNode({ skill, game, setGame }: { skill: Skill; game: GameState; setGame: React.Dispatch<React.SetStateAction<GameState>> }) {
  const unlocked = game.player.unlockedSkillIds.includes(skill.id);
  const previous = skillsForClass(skill.classId).find((entry) => entry.tier === skill.tier - 1);
  const available = !unlocked && game.player.skillPoints > 0 && (!previous || game.player.unlockedSkillIds.includes(previous.id));
  return <button className={`skill-node ${unlocked ? "unlocked" : ""} ${available ? "available" : ""}`} disabled={!available && !unlocked} onClick={() => available && setGame((state) => unlockSkill(state, skill.id))}>
    <span className="skill-tier">T{skill.tier + 1}</span><span className="skill-name">{skill.name}</span><DamageTag type={skill.damageType} /><span className="skill-copy">{unlocked ? `${skill.damage} DMG · ${skill.cooldown}T CD` : available ? "Unlock / 1 SP" : "Locked"}</span>
  </button>;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [game, setGame] = useState<GameState>(() => newGame());
  const classSpec = classById(game.player.classId);
  const classSkills = useMemo(() => skillsForClass(game.player.classId), [game.player.classId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    createGameScene(engine, canvas).then((sceneHandle) => { handle = sceneHandle; engine.runRenderLoop(() => sceneHandle.scene.render()); });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); handle?.dispose(); engine.dispose(); startedRef.current = false; };
  }, []);

  useEffect(() => {
    if (game.phase !== "combat") return;
    const timer = window.setInterval(() => setGame((state) => tickCombat(state)), 850);
    return () => window.clearInterval(timer);
  }, [game.phase]);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("demo")) return;
    const timer = window.setInterval(() => setGame((state) => (state.phase === "combat" || state.phase === "fallen" ? state : enterRoom(state))), 1700);
    return () => window.clearInterval(timer);
  }, []);

  const roomAction = game.phase === "planning" ? "Breach first room" : game.phase === "resolved" ? "Advance route" : game.phase === "fallen" ? "Reset expedition" : "Doctrine executing";
  const action = () => setGame((state) => (state.phase === "fallen" ? newGame(state.player.classId) : enterRoom(state)));

  return <div className="game-shell">
    <canvas ref={canvasRef} className="game-canvas" aria-hidden="true" />
    <div className="game-overlay">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Compass size={19} strokeWidth={2.5} /></span><span><b>AutoCrypts</b><small>Loot RPG / Doctrine Run</small></span></div>
        <div className="top-status"><span>RUN {String(game.roomIndex + 1).padStart(2, "0")}</span><i /><span>{game.phase === "combat" ? "AUTOMATIC COMBAT" : "EXPEDITION DESK"}</span></div>
        <button className="reset-button" onClick={() => setGame(newGame(game.player.classId))}><RotateCcw size={14} /> Reset run</button>
      </header>

      <aside className="left-column">
        <section className="panel player-panel"><div className="panel-kicker">01 / Adventurer</div><div className="player-title"><div className="class-sigil">{classSpec.short}</div><div><h1>{classSpec.name}</h1><p>{classSpec.description}</p></div></div><Meter label="VITALITY" value={game.player.health} max={game.player.maxHealth} /><div className="stat-row"><span><Shield size={14} /> Ward <b>{game.player.ward}</b></span><span><Gem size={14} /> Gold <b>{game.player.gold}</b></span><span><Sparkles size={14} /> XP <b>{game.player.xp}</b></span></div></section>

        <section className="panel"><div className="panel-heading"><span>Class folio</span><BookOpenText size={15} /></div><div className="class-list">{CLASSES.map((entry) => <button key={entry.id} className={entry.id === game.player.classId ? "class-choice selected" : "class-choice"} onClick={() => setGame(selectClass(entry.id as ClassId))}><b>{entry.name}</b><span>{entry.primaryDamage}</span></button>)}</div></section>

        <section className="panel skill-panel"><div className="panel-heading"><span>Skill tree</span><b className="point-badge">{game.player.skillPoints} SP</b></div><div className="skill-tree">{classSkills.map((skill) => <SkillNode key={skill.id} skill={skill} game={game} setGame={setGame} />)}</div></section>

        <section className="panel equipment-panel"><div className="panel-heading"><span>Equipment</span><Box size={15} /></div>{game.equipment.slice(0, 4).map((item) => <div className="item-row" key={item.id}><span className={`tier-dot tier-${item.tier.toLowerCase()}`} /><div><b>{item.name}</b><small>{item.slot} · {item.stat}</small></div><em>{item.tier}</em></div>)}</section>
      </aside>

      <main className="center-column">
        <section className="route-strip"><div className="route-ledger"><span>ENTRY</span><i /><span className={game.roomIndex >= 1 ? "visited" : ""}>01</span><i /><span className={game.roomIndex >= 2 ? "visited" : ""}>02</span><i /><span className="active-node">{String(game.roomIndex + 1).padStart(2, "0")}</span><i className="route-fade" /><span>?</span><b>DEPTH {String(game.roomIndex).padStart(2, "0")}</b></div><em>ACTIVE DOCTRINE / SYNC</em></section>
        <section className="room-stage">
          <div className="stage-corner top-left" /><div className="stage-corner top-right" /><div className="stage-corner bottom-left" /><div className="stage-corner bottom-right" />
          <div className="stage-label">CURRENT ROOM / {game.currentRoom.kind.toUpperCase()}</div>
          <div className="combat-card player-card"><span>YOU</span><b>{classSpec.name}</b><small>{classSpec.primaryDamage} doctrine</small><Meter label="HP" value={game.player.health} max={game.player.maxHealth} /></div>
          {game.enemy ? <div className="combat-card enemy-card"><span>HOSTILE</span><b>{game.enemy.name}</b><small>{Object.entries(game.enemy.statuses).filter(([, turns]) => (turns ?? 0) > 0).map(([status]) => status).join(" · ") || "Unmarked"}</small><Meter label="HP" value={game.enemy.health} max={game.enemy.maxHealth} tone="enemy" /></div> : <div className="combat-card enemy-card idle"><span>ROOM STATE</span><b>{game.currentRoom.kind === "treasure" ? "Cache secured" : game.currentRoom.kind === "trap" ? "Mechanism resolved" : "No active hostile"}</b><small>Awaiting next route action</small></div>}
          <div className="versus"><Target size={18} /><span>{game.phase === "combat" ? "AUTO" : "READY"}</span></div>
          <div className="room-copy"><span className="panel-kicker">{game.currentRoom.summary}</span><h2>{game.currentRoom.title}</h2><p>{game.currentRoom.detail}</p><button className={`breach-button ${game.phase === "combat" ? "executing" : ""}`} disabled={game.phase === "combat"} onClick={action}>{game.phase === "combat" ? <Zap size={16} /> : <ChevronRight size={16} />}{roomAction}</button></div>
        </section>
        <section className="panel log-panel"><div className="panel-heading"><span>Combat record</span><span className="live-dot">LIVE</span></div><div className="combat-log">{game.logs.slice(0, 5).map((entry) => <div className={`log-entry log-${entry.tone}`} key={entry.id}><span>{TONE_LABELS[entry.tone]}</span><p>{entry.message}</p></div>)}</div></section>
      </main>

      <aside className="right-column">
        <section className="panel doctrine-panel"><div className="panel-kicker">02 / Priority queue</div><div className="panel-heading"><span>Automation doctrine</span><Zap size={15} /></div><p className="panel-intro">The first eligible rule fires on every combat tick.</p><div className="rule-list">{game.automation.map((rule, index) => <div className="rule-row" key={rule.id}><div className="rule-index">{String(index + 1).padStart(2, "0")}</div><div className="rule-controls"><select value={rule.condition} onChange={(event) => setGame((state) => updateAutomation(state, rule.id, { condition: event.target.value as ConditionId }))}>{Object.entries(CONDITIONS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select value={rule.skillId} onChange={(event) => setGame((state) => updateAutomation(state, rule.id, { skillId: event.target.value }))}>{classSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div><div className="rule-move"><button aria-label="Raise priority" onClick={() => setGame((state) => reorderAutomation(state, rule.id, -1))}><ArrowUp size={13} /></button><button aria-label="Lower priority" onClick={() => setGame((state) => reorderAutomation(state, rule.id, 1))}><ArrowDown size={13} /></button></div></div>)}</div></section>

        <section className="panel combo-panel"><div className="panel-kicker">03 / Linked execution</div><div className="panel-heading"><span>Combo sequence</span><Sparkles size={15} /></div><div className="combo-flow"><select value={game.combo.openerId} onChange={(event) => setGame((state) => updateCombo(state, { openerId: event.target.value }))}>{classSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select><span className="combo-line"><ChevronRight size={19} /></span><select value={game.combo.followupId} onChange={(event) => setGame((state) => updateCombo(state, { followupId: event.target.value }))}>{classSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div><div className="combo-result"><Flame size={15} /><span>When both unlocked skills fire in sequence:</span><b>+12 linked damage</b></div></section>

        <section className="panel damage-panel"><div className="panel-heading"><span>Damage language</span><Sword size={15} /></div><div className="damage-grid">{(["slash", "pierce", "blunt", "fire", "frost", "arcane", "poison"] as DamageType[]).map((type) => <div key={type}><DamageTag type={type} /><span>{DAMAGE_META[type].label}</span></div>)}</div></section>
        <section className="minimal-callout"><Skull size={17} /><p><b>Room logic</b> moves through nothing, monster, treasure, and trap outcomes.</p></section>
      </aside>
    </div>
  </div>;
}
