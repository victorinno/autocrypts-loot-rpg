/** Modernist Dungeon Ledger: an asset-free combat desk with a 250-item, catalogue-backed inventory ledger. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Archive, ArrowDown, ArrowUp, BookOpenText, Box, ChevronRight, Compass, Flame, Gem, HeartPulse, PackageOpen, RotateCcw, Shield, Skull, Sparkles, Sword, Target, Trash2, X, Zap } from "lucide-react";
import { CATALOGUE, CATALOGUE_TOTAL, CLASSES, CONDITIONS, DAMAGE_META, ITEM_SLOTS, ITEM_TIERS, classById, skillsForClass } from "@/game/data";
import { canUseHealing, equipItem, enterRoom, healingAmount, newGame, reorderAutomation, salvageItem, selectClass, tickCombat, unlockSkill, updateAutomation, updateCombo, useHealingVial } from "@/game/engine";
import { compareItemToEquipped, isEquipped, type LoadoutComparison } from "@/game/inventory";
import { effectPower, masteryLine, masteryRank, skillDamage } from "@/game/mastery";
import { createGameScene, type GameHandle } from "@/game/scene";
import type { ClassId, ConditionId, DamageType, GameState, Item, ItemSlot, ItemTier, LogTone, Skill } from "@/game/types";

const TONE_LABELS: Record<LogTone, string> = { neutral: "NOTE", damage: "HIT", loot: "LOOT", combo: "COMBO", danger: "WARN" };
type InventoryView = "inventory" | "catalogue";
type InventoryEntry = Item | (typeof CATALOGUE)[number];
const percent = (value: number, max: number) => `${Math.max(0, Math.min(100, (value / max) * 100))}%`;

function DamageTag({ type }: { type: DamageType }) { return <span className={`damage-tag damage-${type}`}>{DAMAGE_META[type].short}</span>; }
function Meter({ label, value, max, tone = "health" }: { label: string; value: number; max: number; tone?: "health" | "enemy" | "ward" }) { return <div className="meter"><div className="meter-label"><span>{label}</span><b>{value}/{max}</b></div><div className={`meter-track ${tone}`}><span style={{ width: percent(value, max) }} /></div></div>; }

function SkillNode({ skill, game, setGame }: { skill: Skill; game: GameState; setGame: React.Dispatch<React.SetStateAction<GameState>> }) {
  const unlocked = game.player.unlockedSkillIds.includes(skill.id);
  const previous = skillsForClass(skill.classId).find((entry) => entry.tier === skill.tier - 1);
  const available = !unlocked && game.player.skillPoints > 0 && (!previous || game.player.unlockedSkillIds.includes(previous.id));
  const uses = game.player.skillUses[skill.id] ?? 0;
  const effect = effectPower(skill.effect, uses);
  const effectSuffix = skill.effect.kind === "execute" || skill.effect.kind === "critical" || skill.effect.kind === "chill" ? "%" : "";
  return <button className={`skill-node ${unlocked ? "unlocked" : ""} ${available ? "available" : ""}`} disabled={!available && !unlocked} onClick={() => available && setGame((state) => unlockSkill(state, skill.id))}><span className="skill-tier">T{skill.tier + 1}</span><span className="skill-name">{skill.name}</span><DamageTag type={skill.damageType} /><span className="skill-copy">{unlocked ? `${skillDamage(skill, uses)} DMG · ${skill.effect.label} ${effect}${effectSuffix}` : available ? "Unlock / 1 SP" : "Locked"}</span>{unlocked && <span className="mastery-chip">{masteryLine(skill, uses)}</span>}</button>;
}

function TierDot({ tier }: { tier: ItemTier }) { return <span className={`tier-dot tier-${tier.toLowerCase()}`} />; }

function HealingPanel({ game, setGame }: { game: GameState; setGame: React.Dispatch<React.SetStateAction<GameState>> }) {
  const ready = canUseHealing(game);
  const nextRestore = healingAmount(game.player);
  return <section className="panel healing-panel"><div className="panel-kicker">01A / Field medicine</div><div className="healing-heading"><div><HeartPulse size={17} /><span><b>Restorative vial</b><small>Auto-engages at 35% vitality.</small></span></div><em>{game.player.healingCharges}/{game.player.maxHealingCharges}</em></div><button className="healing-action" disabled={!ready} onClick={() => setGame((state) => useHealingVial(state))}>{game.healingCooldown > 0 ? `Recharging · ${game.healingCooldown}T` : game.player.healingCharges === 0 ? "No restorative charge" : `Mend +${nextRestore} vitality`}</button></section>;
}

function MasteryFolio({ game, skills }: { game: GameState; skills: Skill[] }) {
  const unlocked = skills.filter((skill) => game.player.unlockedSkillIds.includes(skill.id));
  const casts = unlocked.reduce((total, skill) => total + (game.player.skillUses[skill.id] ?? 0), 0);
  const ranks = unlocked.reduce((total, skill) => total + masteryRank(game.player.skillUses[skill.id] ?? 0), 0);
  return <section className="panel mastery-panel"><div className="panel-kicker">01B / Doctrinal stats</div><div className="panel-heading"><span>Skill proficiency</span><Sparkles size={15} /></div><div className="mastery-metrics"><span><b>{casts}</b> casts</span><span><b>{ranks}</b> ranks</span><span><b>{unlocked.length}</b> active</span></div><p>Every three successful casts add a mastery rank: <b>+2 damage</b> and stronger secondary effects.</p></section>;
}

function deltaLabel(value: number, suffix = ""): string { return value > 0 ? `+${value}${suffix}` : value < 0 ? `${value}${suffix}` : `±0${suffix}`; }

function ComparisonStrip({ comparison }: { comparison: LoadoutComparison }) {
  const label = comparison.verdict === "open-slot" ? "Open slot" : comparison.verdict === "equipped" ? "Equipped" : comparison.verdict === "upgrade" ? "Upgrade" : comparison.verdict === "downgrade" ? "Downgrade" : "Lateral";
  return <section className={`comparison-strip comparison-${comparison.verdict}`}><div className="comparison-title"><span>LOADOUT COMPARE</span><b>{label}</b></div>{comparison.equipped ? <><p><span>Current</span>{comparison.equipped.name}</p><div className="comparison-metrics"><div><span>FIELD</span><b>{deltaLabel(comparison.statDelta)}</b></div><div><span>TIER</span><b>{deltaLabel(comparison.tierDelta)}</b></div><div><span>VALUE</span><b>{deltaLabel(comparison.valueDelta, "g")}</b></div></div></> : <p><span>Current</span>No item is equipped in this slot.</p>}</section>;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [game, setGame] = useState<GameState>(() => newGame());
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryView, setInventoryView] = useState<InventoryView>("inventory");
  const [slotFilter, setSlotFilter] = useState<ItemSlot | "ALL">("ALL");
  const [tierFilter, setTierFilter] = useState<ItemTier | "ALL">("ALL");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const classSpec = classById(game.player.classId);
  const classSkills = useMemo(() => skillsForClass(game.player.classId), [game.player.classId]);
  const sourceItems = inventoryView === "inventory" ? game.inventory : CATALOGUE;
  const filteredItems = useMemo(() => sourceItems.filter((item) => (slotFilter === "ALL" || item.slot === slotFilter) && (tierFilter === "ALL" || item.tier === tierFilter)), [sourceItems, slotFilter, tierFilter]);
  const selectedItem = (filteredItems.find((item) => item.id === selectedItemId) ?? filteredItems[0] ?? null) as InventoryEntry | null;
  const comparison = selectedItem ? compareItemToEquipped(game, selectedItem) : null;

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

  useEffect(() => { if (game.phase !== "combat") return; const timer = window.setInterval(() => setGame((state) => tickCombat(state)), 850); return () => window.clearInterval(timer); }, [game.phase]);
  useEffect(() => { if (!new URLSearchParams(window.location.search).has("demo")) return; const timer = window.setInterval(() => setGame((state) => state.phase === "combat" || state.phase === "fallen" ? state : enterRoom(state)), 1700); return () => window.clearInterval(timer); }, []);

  const roomAction = game.phase === "planning" ? "Breach first room" : game.phase === "resolved" ? "Advance route" : game.phase === "fallen" ? "Reset expedition" : "Doctrine executing";
  const action = () => setGame((state) => state.phase === "fallen" ? newGame(state.player.classId) : enterRoom(state));
  const inspectItem = (item: InventoryEntry) => setSelectedItemId(item.id);

  return <div className="game-shell">
    <canvas ref={canvasRef} className="game-canvas" aria-hidden="true" />
    {inventoryOpen && comparison && <div className="inventory-compare-dock"><ComparisonStrip comparison={comparison} /></div>}
    <div className="game-overlay">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Compass size={19} strokeWidth={2.5} /><i className="brand-spark" /></span><span><b className="wordmark">AutoCrypts</b><small>Loot RPG / Doctrine Run</small></span></div>
        <div className="top-status"><span>RUN {String(game.roomIndex + 1).padStart(2, "0")}</span><i /><span>{game.phase === "combat" ? "AUTOMATIC COMBAT" : "EXPEDITION DESK"}</span></div>
        <div className="header-actions"><button className="inventory-button" onClick={() => setInventoryOpen(true)}><Archive size={14} /> Inventory {game.inventory.length}/{game.inventoryCapacity}</button><button className="reset-button" onClick={() => setGame(newGame(game.player.classId))}><RotateCcw size={14} /> Reset run</button></div>
      </header>

      <aside className="left-column">
        <section className="panel player-panel"><div className="panel-kicker">01 / Adventurer</div><div className="player-title"><div className="class-sigil">{classSpec.short}</div><div><h1>{classSpec.name}</h1><p>{classSpec.description}</p></div></div><Meter label="VITALITY" value={game.player.health} max={game.player.maxHealth} /><div className="stat-row"><span><Shield size={14} /> Ward <b>{game.player.ward}</b></span><span><Gem size={14} /> Gold <b>{game.player.gold}</b></span><span><Sparkles size={14} /> XP <b>{game.player.xp}</b></span></div></section>
        <HealingPanel game={game} setGame={setGame} />
        <section className="panel"><div className="panel-heading"><span>Class folio</span><BookOpenText size={15} /></div><div className="class-list">{CLASSES.map((entry) => <button key={entry.id} className={entry.id === game.player.classId ? "class-choice selected" : "class-choice"} onClick={() => setGame(selectClass(entry.id as ClassId))}><b>{entry.name}</b><span>{entry.primaryDamage}</span></button>)}</div></section>
        <section className="panel skill-panel"><div className="panel-heading"><span>Skill tree / 6 tiers</span><b className="point-badge">{game.player.skillPoints} SP</b></div><p className="panel-intro">Unlock the next doctrine tier, then build mastery by casting it in combat.</p><div className="skill-tree">{classSkills.map((skill) => <SkillNode key={skill.id} skill={skill} game={game} setGame={setGame} />)}</div></section>
        <MasteryFolio game={game} skills={classSkills} />
        <section className="panel equipment-panel"><div className="panel-heading"><span>Equipped / 5 slots</span><Box size={15} /></div>{game.equipment.slice(0, 5).map((item) => <button className="item-row item-row-button" key={item.id} onClick={() => { setInventoryOpen(true); setInventoryView("inventory"); inspectItem(item); }}><TierDot tier={item.tier} /><div><b>{item.name}</b><small>{item.slot} · {item.stat}</small></div><em>{item.tier}</em></button>)}<button className="inventory-mini-link" onClick={() => setInventoryOpen(true)}><PackageOpen size={13} /> Open item ledger</button></section>
      </aside>

      <main className="center-column">
        <section className="route-strip"><div className="route-ledger"><span>ENTRY</span><i /><span className={game.roomIndex >= 1 ? "visited" : ""}>01</span><i /><span className={game.roomIndex >= 2 ? "visited" : ""}>02</span><i /><span className="active-node">{String(game.roomIndex + 1).padStart(2, "0")}</span><i className="route-fade" /><span>?</span><b>DEPTH {String(game.roomIndex).padStart(2, "0")}</b></div><em>ACTIVE DOCTRINE / SYNC</em></section>
        <section className="room-stage"><div className="stage-corner top-left" /><div className="stage-corner top-right" /><div className="stage-corner bottom-left" /><div className="stage-corner bottom-right" /><div className="stage-label">CURRENT ROOM / {game.currentRoom.kind.toUpperCase()}</div><div className="combat-card player-card"><span>YOU</span><b>{classSpec.name}</b><small>{classSpec.primaryDamage} doctrine</small><Meter label="HP" value={game.player.health} max={game.player.maxHealth} /></div>{game.enemy ? <div className="combat-card enemy-card"><span>HOSTILE</span><b>{game.enemy.name}</b><small>{Object.entries(game.enemy.statuses).filter(([, turns]) => (turns ?? 0) > 0).map(([status]) => status).join(" · ") || "Unmarked"}</small><Meter label="HP" value={game.enemy.health} max={game.enemy.maxHealth} tone="enemy" /></div> : <div className="combat-card enemy-card idle"><span>ROOM STATE</span><b>{game.currentRoom.kind === "treasure" ? "Cache secured" : game.currentRoom.kind === "trap" ? "Mechanism resolved" : "No active hostile"}</b><small>Awaiting next route action</small></div>}<div className="versus"><Target size={18} /><span>{game.phase === "combat" ? "AUTO" : "READY"}</span></div><div className="room-copy"><span className="panel-kicker">{game.currentRoom.summary}</span><h2>{game.currentRoom.title}</h2><p>{game.currentRoom.detail}</p><button className={`breach-button ${game.phase === "combat" ? "executing" : ""}`} disabled={game.phase === "combat"} onClick={action}>{game.phase === "combat" ? <Zap size={16} /> : <ChevronRight size={16} />}{roomAction}</button></div></section>
        <section className="panel log-panel"><div className="panel-heading"><span>Combat record</span><span className="live-dot">LIVE</span></div><div className="combat-log">{game.logs.slice(0, 5).map((entry) => <div className={`log-entry log-${entry.tone}`} key={entry.id}><span>{TONE_LABELS[entry.tone]}</span><p>{entry.message}</p></div>)}</div></section>
      </main>

      <aside className="right-column"><section className="panel doctrine-panel"><div className="panel-kicker">02 / Priority queue</div><div className="panel-heading"><span>Automation doctrine</span><Zap size={15} /></div><p className="panel-intro">The first eligible rule fires on every combat tick.</p><div className="rule-list">{game.automation.map((rule, index) => <div className="rule-row" key={rule.id}><div className="rule-index">{String(index + 1).padStart(2, "0")}</div><div className="rule-controls"><select value={rule.condition} onChange={(event) => setGame((state) => updateAutomation(state, rule.id, { condition: event.target.value as ConditionId }))}>{Object.entries(CONDITIONS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select value={rule.skillId} onChange={(event) => setGame((state) => updateAutomation(state, rule.id, { skillId: event.target.value }))}>{classSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div><div className="rule-move"><button aria-label="Raise priority" onClick={() => setGame((state) => reorderAutomation(state, rule.id, -1))}><ArrowUp size={13} /></button><button aria-label="Lower priority" onClick={() => setGame((state) => reorderAutomation(state, rule.id, 1))}><ArrowDown size={13} /></button></div></div>)}</div></section><section className="panel combo-panel"><div className="panel-kicker">03 / Linked execution</div><div className="panel-heading"><span>Combo sequence</span><Sparkles size={15} /></div><div className="combo-flow"><select value={game.combo.openerId} onChange={(event) => setGame((state) => updateCombo(state, { openerId: event.target.value }))}>{classSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select><span className="combo-line"><ChevronRight size={19} /></span><select value={game.combo.followupId} onChange={(event) => setGame((state) => updateCombo(state, { followupId: event.target.value }))}>{classSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div><div className="combo-result"><Flame size={15} /><span>When both unlocked skills fire in sequence:</span><b>+12 linked damage</b></div></section><section className="panel damage-panel"><div className="panel-heading"><span>Damage language</span><Sword size={15} /></div><div className="damage-grid">{(["slash", "pierce", "blunt", "fire", "frost", "arcane", "poison"] as DamageType[]).map((type) => <div key={type}><DamageTag type={type} /><span>{DAMAGE_META[type].label}</span></div>)}</div></section><section className="minimal-callout"><Skull size={17} /><p><b>Room logic</b> moves through nothing, monster, treasure, and trap outcomes.</p></section></aside>
    </div>

    {inventoryOpen && <section className="inventory-layer" role="dialog" aria-modal="true" aria-label="Item ledger"><div className="inventory-ledger"><header className="inventory-header"><div><span className="panel-kicker">04 / Field catalogue</span><h2>Item ledger <b>{inventoryView === "inventory" ? `${game.inventory.length}/${game.inventoryCapacity}` : `${CATALOGUE_TOTAL} blueprints`}</b></h2></div><button className="inventory-close" onClick={() => setInventoryOpen(false)} aria-label="Close inventory"><X size={18} /></button></header><div className="inventory-tabs"><button className={inventoryView === "inventory" ? "active" : ""} onClick={() => { setInventoryView("inventory"); setSelectedItemId(null); }}>Run inventory <b>{game.inventory.length}</b></button><button className={inventoryView === "catalogue" ? "active" : ""} onClick={() => { setInventoryView("catalogue"); setSelectedItemId(null); }}>Catalogue <b>{CATALOGUE_TOTAL}</b></button><span>5 slots · 5 tiers · 10 families</span></div><div className="inventory-filterbar"><div><span>SLOT</span><select value={slotFilter} onChange={(event) => { setSlotFilter(event.target.value as ItemSlot | "ALL"); setSelectedItemId(null); }}><option value="ALL">All slots</option>{ITEM_SLOTS.map((slot) => <option value={slot} key={slot}>{slot}</option>)}</select></div><div><span>TIER</span><select value={tierFilter} onChange={(event) => { setTierFilter(event.target.value as ItemTier | "ALL"); setSelectedItemId(null); }}><option value="ALL">All tiers</option>{ITEM_TIERS.map((tier) => <option value={tier} key={tier}>{tier}</option>)}</select></div><p>{filteredItems.length} records shown</p></div><div className="inventory-workspace"><div className="inventory-list"><div className="inventory-list-head"><span>{inventoryView === "inventory" ? "Acquired record" : "Catalogue record"}</span><span>slot / tier</span></div>{filteredItems.length ? filteredItems.map((item) => <button key={item.id} className={`inventory-entry ${selectedItem?.id === item.id ? "selected" : ""}`} onClick={() => inspectItem(item)}><TierDot tier={item.tier} /><div><b>{item.name}</b><small>{item.stat}</small></div><span>{item.slot}</span>{inventoryView === "inventory" && isEquipped(game, item.id) && <em>EQUIPPED</em>}</button>) : <div className="inventory-empty">No item records match these filters.</div>}</div><aside className="item-inspector">{selectedItem ? <><div className="inspector-tier"><TierDot tier={selectedItem.tier} /><span>{selectedItem.tier} / {selectedItem.slot}</span></div><h3>{selectedItem.name}</h3><p>{selectedItem.description}</p><div className="inspector-stat"><span>FIELD STAT</span><b>{selectedItem.stat}</b></div><div className="inspector-meta"><span>Catalogued value</span><b>{selectedItem.value} gold</b></div>{inventoryView === "inventory" ? <div className="inspector-actions"><button className="equip-action" disabled={isEquipped(game, selectedItem.id)} onClick={() => setGame((state) => equipItem(state, selectedItem.id))}>{isEquipped(game, selectedItem.id) ? "Equipped" : `Equip to ${selectedItem.slot}`}</button><button className="salvage-action" onClick={() => setGame((state) => salvageItem(state, selectedItem.id))}><Trash2 size={14} /> Salvage</button></div> : <div className="catalogue-note"><PackageOpen size={15} /> Find this record in a treasure cache or monster reward.</div>}</> : <div className="inventory-empty">Choose an item record to inspect it.</div>}</aside></div></div></section>}
  </div>;
}
