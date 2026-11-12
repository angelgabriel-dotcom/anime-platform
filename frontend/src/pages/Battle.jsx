import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PlatformHeader from "../components/PlatformHeader";
import Icon from "../components/Icon";
import { CHARACTERS } from "../data/characters";
import "../styles/battle.css";

const MODES = { quick: "A matchup in moments. Pick your legends and let their power decide.", ranked: "Put your strongest pairing to the test.", story: "Follow every turn of your matchup." };
const EVENT_LABELS = { NORMAL_ATTACK: "Strike", SPECIAL_SKILL: "Special skill", CRITICAL_HIT: "Critical hit", EVADED: "Evaded", KNOCKOUT: "Knockout", BUFF: "Power up", DEBUFF: "Weakened", HEAL: "Heal", MANA_EXHAUSTED: "Mana exhausted" };
const format = value => Math.round(value).toLocaleString();

async function fetchJSON(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "The arena is unavailable. Try again in a moment.");
  if (!data) throw new Error("The arena returned an incomplete response. Please try again.");
  return data;
}

function ResourceBar({ label, value, max }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  return <div className={`arena-resource ${label === "Mana" ? "arena-resource-mana" : ""}`}>
    <div><span>{label}</span><b>{format(value)} <span>/ {format(max)}</span></b></div>
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0, Math.min(max, value))}><i style={{ width: `${percent}%` }} /></div>
  </div>;
}

// Each event contains both fighters' snapshots, including evades and healing.
function resourcesFor(character, combatant, rounds) {
  const attrs = combatant?.power_attributes;
  if (!attrs) return null;
  const maxHP = attrs.endurance * 100;
  const maxMana = attrs.aura * 10;
  let hp = maxHP, mana = maxMana;
  for (const entry of rounds) {
    const actor = entry.actor_id === character.id;
    if (!actor && entry.target_id !== character.id) continue;
    hp = (actor ? entry.actor_hp : entry.target_hp) ?? hp;
    // Knockout entries omit mana snapshots in the current API.
    if (entry.event_type !== "KNOCKOUT") mana = (actor ? entry.actor_mana : entry.target_mana) ?? mana;
  }
  return { hp, mana, maxHP, maxMana };
}

function FighterPanel({ character, slot, active, locked, onActivate, onClear, resources, winner, complete }) {
  return <section className={`arena-fighter arena-fighter-${slot} ${active ? "is-editing" : ""} ${complete && winner?.id === character?.id ? "is-winner" : ""}`} style={{ "--fighter-color": character?.color || "#a99abb" }} aria-label={`Fighter ${slot === "a" ? "one" : "two"}`}>
    {character && <><span className="arena-art-word" aria-hidden="true">{character.tier}</span><img className="arena-fighter-art" src={character.portrait} alt="" /></>}
    <div className="arena-slot-tools"><button type="button" className="arena-slot" aria-pressed={active} disabled={locked} onClick={onActivate}><span>{slot === "a" ? "01" : "02"}</span> {slot === "a" ? "CHALLENGER" : "OPPONENT"}<Icon name="diagonal" size={13} /></button>{character && <button className="arena-clear" type="button" aria-label={`Clear ${slot === "a" ? "challenger" : "opponent"}`} disabled={locked} onClick={onClear}><Icon name="close" size={16} /></button>}</div>
    {character ? <div className="arena-fighter-copy"><span className="arena-eyebrow">{character.series} <i /> {character.tier} TIER</span><h2>{character.name}</h2><p>{character.role}</p>
      {resources ? <div className="arena-resources"><ResourceBar label="Health" value={resources.hp} max={resources.maxHP} /><ResourceBar label="Mana" value={resources.mana} max={resources.maxMana} /></div> : <dl className="arena-preview-stats">{Object.entries(character.stats).slice(0, 3).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{format(value)}</dd></div>)}</dl>}
    </div> : <button className="arena-empty-slot" type="button" disabled={locked} onClick={onActivate}><Icon name="swords" size={36} /><h2>Choose your legend.</h2><p>Select a character from the roster below.</p><span>Browse fighters <Icon name="arrow" size={16} /></span></button>}
  </section>;
}

export default function Battle() {
  const [searchParams] = useSearchParams();
  const [fighters, setFighters] = useState(() => {
    const first = CHARACTERS.find(character => character.id === searchParams.get("fighter")) || CHARACTERS[0];
    return [first, CHARACTERS.find(character => character.id !== first.id && character.tier === "GOD")];
  });
  const [activeSlot, setActiveSlot] = useState(1);
  const [mode, setMode] = useState("quick");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [combatants, setCombatants] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState(null);
  const requestRef = useRef(null);
  const logRef = useRef(null);
  const [fighterA, fighterB] = fighters;
  const rounds = result?.rounds || [];
  const complete = !!result && cursor >= rounds.length;
  const playing = !!result && !complete;
  const locked = loading || playing;
  const visibleRounds = rounds.slice(0, cursor);
  const winner = complete ? CHARACTERS.find(character => character.id === result.winner_id) : null;
  const roster = CHARACTERS.filter(character => `${character.name} ${character.series} ${character.role}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (!playing || paused) return;
    const timer = setTimeout(() => setCursor(value => value + 1), 650 / speed);
    return () => clearTimeout(timer);
  }, [playing, paused, speed, cursor]);
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [cursor]);

  function clearResult() {
    setResult(null); setCombatants([]); setCursor(0); setPaused(false); setError(null);
  }

  function chooseFighter(character) {
    if (locked || fighters[1 - activeSlot]?.id === character.id) return;
    setFighters(current => current.map((fighter, index) => index === activeSlot ? character : fighter));
    clearResult();
    if (!fighters[1 - activeSlot]) setActiveSlot(1 - activeSlot);
  }

  async function startBattle() {
    if (!fighterA || !fighterB || locked || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    clearResult(); setLoading(true);
    try {
      const details = await Promise.all(fighters.map(character => fetchJSON(`/api/v1/characters/${character.id}`, { signal: controller.signal })));
      if (details.some(character => !character.power_attributes || character.power_attributes.endurance <= 0 || character.power_attributes.aura <= 0)) throw new Error("Fighter attributes are unavailable. Please try again.");
      setCombatants(details);
      const battle = await fetchJSON("/api/v1/battle/simulate", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenger_id: fighterA.id, opponent_id: fighterB.id, mode }),
      });
      if (!Array.isArray(battle.rounds) || !fighters.some(character => character.id === battle.winner_id)) throw new Error("The battle result is incomplete. Please try again.");
      setResult(battle);
    } catch (err) {
      if (err.name !== "AbortError") { setError(err.message); setCombatants([]); }
    } finally {
      if (requestRef.current === controller) { requestRef.current = null; setLoading(false); }
    }
  }

  function replay() { setCursor(0); setPaused(false); }

  const turnNumber = visibleRounds.at(-1)?.round || 0;
  const totalTurns = rounds.at(-1)?.round || 0;
  const isKnockout = rounds.some(entry => entry.event_type === "KNOCKOUT");
  const status = loading ? "Preparing your matchup…" : playing ? (paused ? "Replay paused" : `Turn ${turnNumber || 1} of ${totalTurns}`) : complete ? `${winner.name} wins` : fighterA && fighterB ? "Your matchup is ready." : "Choose two fighters to begin.";

  return <div className="animverse-arena">
    <a className="arena-skip" href="#arena-main">Skip to arena</a><PlatformHeader />
    <main className="arena-main" id="arena-main">
      <div className="arena-breadcrumb"><Link to="/">Animverse</Link><span>/</span><span>Shadow Arena</span><span className="arena-prototype">BATTLE SIMULATOR</span></div>
      <header className="arena-heading"><div><span className="arena-eyebrow">WHERE WORLDS COLLIDE</span><h1>Shadow Arena<span>.</span></h1><p>Two legends. One arena. Make your matchup.</p></div><div className="arena-mode-picker"><div className="arena-mode-tabs" aria-label="Battle mode">{Object.keys(MODES).map(value => <button key={value} type="button" disabled={locked} aria-pressed={mode === value} onClick={() => { setMode(value); clearResult(); }}>{value}</button>)}</div><span>Same combat rules in every mode.</span></div></header>
      <section className="arena-stage" aria-label="Your matchup">
        <div className="arena-stage-topline"><span><Icon name="swords" size={14} />{mode.toUpperCase()} MATCHUP</span><span>01 VS 02</span></div>
        <div className="arena-fighters">{fighters.map((character, index) => <FighterPanel key={index} character={character} slot={index === 0 ? "a" : "b"} active={activeSlot === index} locked={locked} onActivate={() => setActiveSlot(index)} onClear={() => { setFighters(current => current.map((fighter, i) => i === index ? null : fighter)); setActiveSlot(index); clearResult(); }} resources={character ? resourcesFor(character, combatants[index], visibleRounds) : null} winner={winner} complete={complete} />)}<div className="arena-versus" aria-hidden="true"><span>VS</span><i /></div></div>
        <div className={`arena-command ${complete ? "arena-command-complete" : ""}`}><div className="arena-command-status"><span className="arena-status-icon"><Icon name={complete ? "trophy" : "swords"} size={21} /></span><div><span className="arena-eyebrow">{complete ? "MATCH RESULT" : playing ? "BATTLE REPLAY" : "YOUR NEXT BATTLE"}</span><p role="status">{status}</p><span className="arena-command-detail">{complete ? (isKnockout ? `Victory by knockout · ${totalTurns} turns` : `Turn limit reached · ${totalTurns} turns · Higher remaining health wins`) : MODES[mode]}</span></div></div><div className="arena-command-actions">{playing ? <><button className="arena-button arena-button-secondary" type="button" onClick={() => setPaused(value => !value)}>{paused ? "Resume" : "Pause"}</button><button className="arena-button arena-button-primary" type="button" onClick={() => { setCursor(rounds.length); setPaused(false); }}>Show result<Icon name="arrow" size={17} /></button></> : <>{complete && <button className="arena-button arena-button-secondary" type="button" onClick={replay}>Replay</button>}<button className="arena-button arena-button-primary" type="button" disabled={!fighterA || !fighterB || loading} onClick={startBattle}><Icon name="swords" size={17} />{loading ? "Preparing…" : complete ? "Rematch" : "Start battle"}<Icon name="arrow" size={17} /></button></>}</div></div>
      </section>
      {error && <div className="arena-error" role="alert"><Icon name="bolt" size={20} /><div><strong>The battle couldn’t start.</strong><p>{error}</p></div><button type="button" aria-label="Dismiss battle error" onClick={() => setError(null)}><Icon name="close" size={18} /></button></div>}
      <section className="arena-roster" aria-labelledby="arena-roster-title"><div className="arena-section-heading"><div><span className="arena-eyebrow">BUILD YOUR MATCHUP</span><h2 id="arena-roster-title">Choose your fighters<span>.</span></h2></div><span className="arena-selection-hint">{locked ? "Matchup locked during replay" : `Selecting ${activeSlot === 0 ? "challenger" : "opponent"}`}<i /></span></div><div className="arena-roster-toolbar"><div className="arena-slot-picker" aria-label="Choose fighter slot">{[0, 1].map(index => <button key={index} type="button" disabled={locked} aria-pressed={activeSlot === index} onClick={() => setActiveSlot(index)}>{index === 0 ? "01 Challenger" : "02 Opponent"}</button>)}</div><label className="arena-search"><Icon name="search" size={16} /><span className="arena-sr-only">Search fighters</span><input type="search" placeholder="Find your fighter…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
        <div className="arena-roster-grid">{roster.map(character => { const selectedSlot = fighters.findIndex(fighter => fighter?.id === character.id); const unavailable = fighters[1 - activeSlot]?.id === character.id; return <button type="button" className={`arena-roster-card ${selectedSlot >= 0 ? "is-selected" : ""}`} key={character.id} style={{ "--fighter-color": character.color }} disabled={locked || unavailable} aria-pressed={fighters[activeSlot]?.id === character.id} aria-label={`${character.name}${selectedSlot >= 0 ? `, selected as ${selectedSlot === 0 ? "challenger" : "opponent"}` : ""}`} onClick={() => chooseFighter(character)}><span className="arena-roster-art"><img src={character.portrait} alt="" loading="lazy" /><span className="arena-roster-tier">{character.tier}</span>{selectedSlot >= 0 && <span className="arena-roster-assigned">{selectedSlot === 0 ? "01 CHALLENGER" : "02 OPPONENT"}</span>}</span><span className="arena-roster-info"><span>{character.series}</span><strong>{character.name}</strong><span>{character.role}</span></span></button>; })}</div>
        {roster.length === 0 && <div className="arena-no-results"><p>No fighters found. Try a character or anime name.</p><button className="arena-button arena-button-secondary" type="button" onClick={() => setQuery("")}>Reset search</button></div>}
      </section>
      {result ? <section className="arena-battle-log" aria-labelledby="arena-log-title"><div className="arena-section-heading"><div><span className="arena-eyebrow">EVERY MOVE TELLS A STORY</span><h2 id="arena-log-title">Battle timeline<span>.</span></h2></div><label className="arena-speed">Replay speed<select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label></div><div className="arena-log-progress"><span>{cursor} / {rounds.length} events</span><div><i style={{ width: `${rounds.length ? cursor / rounds.length * 100 : 100}%` }} /></div><span>{complete ? "Complete" : paused ? "Paused" : "Playing"}</span></div><ol className="arena-log-entries" ref={logRef} aria-label="Combat events">{visibleRounds.map((entry, index) => <li key={index} className={`arena-log-entry arena-event-${entry.event_type.toLowerCase()}`}><span className="arena-log-turn">{String(entry.round).padStart(2, "0")}</span><div><span className="arena-event-label">{EVENT_LABELS[entry.event_type] || entry.event_type.replaceAll("_", " ")}</span>{entry.ability_used && <span className="arena-log-ability">{entry.ability_used}</span>}<p>{entry.narrative}</p></div><b className="arena-log-damage">{entry.damage > 0 ? `−${format(entry.damage)}` : "—"}</b></li>)}{visibleRounds.length === 0 && <li className="arena-log-waiting">{complete ? "No combat events were returned for this matchup." : "The fighters are ready. The first move is coming."}</li>}</ol>{complete && <div className="arena-log-footer"><span><Icon name="trophy" size={15} />{winner.name} takes the victory.</span><button type="button" onClick={replay}>Watch it again<Icon name="arrow" size={15} /></button></div>}</section> : <section className="arena-match-notes" aria-label="Selected fighter powers">{fighters.map((character, index) => <div key={index} style={{ "--fighter-color": character?.color || "#a99abb" }}><span className="arena-eyebrow">{index === 0 ? "01 / CHALLENGER" : "02 / OPPONENT"}</span><h3>{character ? character.epithet : "An open challenge."}</h3><p>{character?.abilities.map(ability => ability.name).join(" · ") || "Choose a legend to explore their powers."}</p></div>)}</section>}
      <footer className="arena-footer"><Link to="/">← Back to the lobby</Link><span>ANIMVERSE / SHADOW ARENA</span><Link to="/leaderboard">Explore the rankings<Icon name="arrow" size={14} /></Link></footer>
    </main>
  </div>;
}
