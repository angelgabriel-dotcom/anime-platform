import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PlatformHeader from "../components/PlatformHeader";
import Icon from "../components/Icon";
import { POWER_STATS, rankEntries, readRankings, rosterRankings } from "../data/rankings";
import "../styles/rankings.css";

const SORTS = { power: "Power score", win_rate: "Win rate", battles: "Battles played" };
const SOURCES = { loading: "Loading rankings", live: "Arena records", cached: "Saved arena records", preview: "Roster preview", offline: "Offline roster" };
const number = value => Math.round(value).toLocaleString();
const winRate = entry => entry.winRate === null ? "—" : `${(entry.winRate * 100).toFixed(1)}%`;
const initials = name => name.split(/\s+/).slice(0, 2).map(word => word[0]).join("");

function Portrait({ character, ...props }) {
  return character.portrait ? <img src={character.portrait} alt="" {...props} /> : <span className="rankings-initials" aria-hidden="true">{initials(character.name)}</span>;
}

function LeaderCard({ entry, sortBy, selected, onSelect }) {
  const { character } = entry;
  const value = sortBy === "win_rate" ? winRate(entry) : sortBy === "battles" ? entry.totalBattles === null ? "—" : number(entry.totalBattles) : number(entry.powerTotal);
  return <button type="button" className={`rankings-leader rankings-leader-${entry.rank}`} style={{ "--fighter-color": character.color }} aria-label={`View ${character.name}, rank ${entry.rank}`} aria-pressed={selected} aria-controls="ranking-profile" onClick={onSelect}>
    <span className="rankings-leader-number" aria-hidden="true">0{entry.rank}</span>
    <span className="rankings-leader-art"><Portrait character={character} /></span>
    <span className="rankings-leader-top"><span><Icon name={entry.rank === 1 ? "trophy" : "bolt"} size={15} /> {entry.rank === 1 ? "LEADING THE RANKS" : `RANK 0${entry.rank}`}</span><span>{character.tier} TIER</span></span>
    <span className="rankings-leader-copy"><span>{character.series}</span><strong>{character.name}</strong><span className="rankings-leader-score"><b>{value}</b><span>{SORTS[sortBy]}</span></span></span>
    <span className="rankings-leader-footer">Explore fighter <Icon name="arrow" size={15} /></span>
  </button>;
}

function FighterProfile({ entry, headingRef }) {
  const { character } = entry;
  return <aside className="rankings-profile" id="ranking-profile" style={{ "--fighter-color": character.color }} aria-labelledby="rankings-profile-title">
    <div className="rankings-profile-top"><span className="rankings-eyebrow">FIGHTER PROFILE</span><span>RANK {String(entry.rank).padStart(2, "0")}</span></div>
    <div className="rankings-profile-art"><span aria-hidden="true">{character.tier}</span><Portrait character={character} /></div>
    <div className="rankings-profile-copy"><span className="rankings-eyebrow">{character.series} / {character.tier} TIER</span><h3 id="rankings-profile-title" tabIndex={-1} ref={headingRef}>{character.name}</h3>{character.role && <p className="rankings-profile-role">{character.role}</p>}
      <div className="rankings-profile-score"><span>Power score</span><b>{number(entry.powerTotal)}</b></div>
      <dl className="rankings-stats">{POWER_STATS.map(key => <div key={key}><dt>{key}</dt><dd>{number(character.powerAttributes[key])}<span aria-hidden="true"><i style={{ width: `${character.powerAttributes[key] / 100}%` }} /></span></dd></div>)}</dl>
      <div className="rankings-rates"><span>Critical <b>{character.powerAttributes.critical_rate}%</b></span><span>Evasion <b>{character.powerAttributes.evasion_rate}%</b></span></div>
      <div className="rankings-profile-record"><Icon name="swords" size={17} /><p>{entry.totalBattles === null ? "Battle history unavailable" : entry.totalBattles === 0 ? "No recorded battles yet" : `${number(entry.totalBattles)} ${entry.totalBattles === 1 ? "battle" : "battles"} · ${winRate(entry)} win rate`}</p></div>
      {character.availableInArena !== false ? <Link className="rankings-button rankings-button-primary" to={`/battle?fighter=${encodeURIComponent(character.id)}`}><Icon name="swords" size={16} />Fight with this legend<Icon name="arrow" size={16} /></Link> : <p className="rankings-profile-unavailable">Not in the arena roster yet.</p>}
    </div>
  </aside>;
}

export default function Leaderboard() {
  const [board, setBoard] = useState({ entries: [], source: "loading" });
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [tier, setTier] = useState("ALL");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("power");
  const profileHeadingRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
    setLoading(true);
    async function load() {
      try {
        const response = await fetch("/api/v1/leaderboard", { signal: controller.signal });
        if (!response.ok) throw new Error("Rankings unavailable");
        const entries = readRankings(await response.json());
        if (controller.signal.aborted) return;
        setBoard({ entries: entries.length ? entries : rosterRankings(), source: entries.length ? "live" : "preview" });
      } catch {
        if (controller.signal.aborted && !timedOut) return;
        setBoard(current => current.source === "live" || current.source === "cached"
          ? { ...current, source: "cached" }
          : { entries: rosterRankings(), source: "offline" });
      } finally {
        clearTimeout(timeout);
        if (!controller.signal.aborted || timedOut) setLoading(false);
      }
    }
    load();
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [refresh]);

  const ranked = rankEntries(board.entries, sortBy);
  const tiers = ["ALL", ...[...new Set(board.entries.map(entry => entry.character.tier))].sort((a, b) => (["GOD", "S", "A", "B", "C"].indexOf(a) - ["GOD", "S", "A", "B", "C"].indexOf(b)) || a.localeCompare(b))];
  const effectiveTier = tiers.includes(tier) ? tier : "ALL";
  const filtered = ranked.filter(entry => (effectiveTier === "ALL" || entry.character.tier === effectiveTier)
    && `${entry.character.name} ${entry.character.series}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = ranked.find(entry => entry.character.id === selectedId) || ranked[0];
  const historyAvailable = board.source === "live" || board.source === "cached";
  const activeFighters = board.entries.filter(entry => entry.totalBattles > 0).length;

  function selectFighter(id) {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 900px)").matches) requestAnimationFrame(() => {
      profileHeadingRef.current?.focus({ preventScroll: true });
      document.getElementById("ranking-profile")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    });
  }

  function resetFilters() { setTier("ALL"); setQuery(""); }

  return <div className="animverse-rankings">
    <a className="rankings-skip" href="#rankings-main">Skip to rankings</a><PlatformHeader />
    <main className="rankings-main" id="rankings-main">
      <div className="rankings-breadcrumb"><Link to="/">Animverse</Link><span>/</span><span>Rankings</span><span className="rankings-source" role="status"><i className={`rankings-source-${board.source}`} />{loading ? "Loading rankings" : SOURCES[board.source]}</span></div>
      <header className="rankings-heading"><div><span className="rankings-eyebrow">LEGENDS ABOVE THE REST</span><h1>The power rankings<span>.</span></h1><p>Discover the strongest. Find your next challenger.</p></div><Link className="rankings-button rankings-button-secondary" to="/battle"><Icon name="swords" size={17} />Make a matchup<Icon name="arrow" size={16} /></Link></header>
      <div className="rankings-overview"><span><Icon name="globe" size={15} /><b>{board.entries.length || "—"}</b> fighters across worlds</span><span><Icon name="bolt" size={15} />Prototype power scores</span><span><Icon name="swords" size={15} />{historyAvailable ? `${activeFighters} fighters with battle records` : "Battle records unavailable"}</span></div>
      {(board.source === "offline" || board.source === "cached" || board.source === "preview") && <div className="rankings-notice" role="status"><Icon name="bolt" size={17} /><p>{board.source === "cached" ? "Couldn’t refresh arena results. Showing the last loaded records." : board.source === "preview" ? "No arena rankings yet. Explore prototype power scores while records become available." : "Arena results are unavailable. Showing prototype power scores."}</p><button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)}>{loading ? "Loading…" : "Retry"}<Icon name="arrow" size={14} /></button></div>}
      <section className="rankings-leaders" aria-label={`Top fighters by ${SORTS[sortBy].toLowerCase()}`}>
        {ranked.length ? ranked.slice(0, 3).map(entry => <LeaderCard key={entry.character.id} entry={entry} sortBy={sortBy} selected={selected?.character.id === entry.character.id} onSelect={() => selectFighter(entry.character.id)} />) : <div className="rankings-loading" role="status">Loading the legends…</div>}
      </section>
      <section className="rankings-roster" aria-labelledby="rankings-roster-title">
        <div className="rankings-section-heading"><div><span className="rankings-eyebrow">THE FULL LINEUP</span><h2 id="rankings-roster-title">Every legend. Every rank<span>.</span></h2></div><button type="button" className="rankings-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}>{loading ? "Refreshing…" : "Refresh rankings"}<Icon name="arrow" size={15} /></button></div>
        <div className="rankings-toolbar"><div className="rankings-tier-filter" aria-label="Filter by tier">{tiers.map(value => <button key={value} type="button" aria-pressed={effectiveTier === value} onClick={() => setTier(value)}>{value === "ALL" ? "All tiers" : `${value} tier`}</button>)}</div><div className="rankings-search-sort"><label className="rankings-search"><Icon name="search" size={16} /><span className="rankings-sr-only">Search rankings</span><input type="search" placeholder="Find a legend…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="rankings-sort"><span className="rankings-sr-only">Sort rankings</span><select value={sortBy} onChange={event => setSortBy(event.target.value)}>{Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></div>
        <div className="rankings-list-caption"><p role="status">{filtered.length} of {ranked.length} fighters{effectiveTier !== "ALL" || query.trim() ? " · Filters keep overall ranks" : ""}</p><span>RANKED BY {SORTS[sortBy].toUpperCase()}</span></div>
        <div className="rankings-layout"><div className="rankings-table-wrap" aria-busy={loading}>
          <table className="rankings-table"><caption className="rankings-sr-only">Fighters ranked by {SORTS[sortBy].toLowerCase()}. Select a fighter to view their profile.</caption><thead><tr>{["Rank", "Fighter", "Power", "Win rate", "Battles"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{filtered.map(entry => <tr key={entry.character.id} className={selected?.character.id === entry.character.id ? "is-selected" : ""} style={{ "--fighter-color": entry.character.color }}>
            <td className={`rankings-rank ${entry.rank <= 3 ? "rankings-rank-top" : ""}`}>{String(entry.rank).padStart(2, "0")}</td><th scope="row"><button type="button" className="rankings-fighter-button" aria-pressed={selected?.character.id === entry.character.id} aria-controls="ranking-profile" aria-label={`View ${entry.character.name}`} onClick={() => selectFighter(entry.character.id)}><span className="rankings-avatar"><Portrait character={entry.character} loading="lazy" /></span><span><strong>{entry.character.name}</strong><span>{entry.character.series}<b>{entry.character.tier}</b></span></span></button></th>
            <td className="rankings-power">{number(entry.powerTotal)}</td><td className="rankings-win-rate">{winRate(entry)}</td><td className="rankings-battles">{entry.totalBattles === null ? "—" : number(entry.totalBattles)}</td>
          </tr>)}</tbody></table>
          {!ranked.length ? <p className="rankings-empty">Loading rankings…</p> : !filtered.length && <div className="rankings-empty"><Icon name="search" size={25} /><h3>No legends found.</h3><p>Try another name, anime, or tier.</p><button type="button" className="rankings-button rankings-button-secondary" onClick={resetFilters}>Reset filters</button></div>}
          <div className="rankings-table-foot"><Icon name="trophy" size={15} /><p>{historyAvailable ? "Win rates reflect recorded arena simulations. Unplayed fighters have no win rate." : "Battle records appear when arena results are available."}</p></div>
        </div>{selected && <FighterProfile entry={selected} headingRef={profileHeadingRef} />}</div>
      </section>
      <section className="rankings-method" aria-labelledby="rankings-method-title"><span className="rankings-method-icon"><Icon name="bolt" size={24} /></span><div><span className="rankings-eyebrow">UNDERSTANDING THE RANKS</span><h2 id="rankings-method-title">Power is only the beginning.</h2><p>Power scores combine six attributes, critical rate × 10, and evasion × 5. These are prototype values for the arena. A matchup’s abilities and combat rolls decide the result.</p></div><Link to="/battle">Put it to the test<Icon name="arrow" size={17} /></Link></section>
      <footer className="rankings-footer"><Link to="/">← Back to the lobby</Link><span>ANIMVERSE / POWER RANKINGS</span><Link to="/battle">Enter Shadow Arena<Icon name="arrow" size={14} /></Link></footer>
    </main>
  </div>;
}
