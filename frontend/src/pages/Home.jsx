import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PlatformHeader from "../components/PlatformHeader";
import Icon from "../components/Icon";
import { CHARACTERS, JINWOO_COLLECTION } from "../data/characters";
import "../styles/home.css";

const FEATURED = CHARACTERS.slice(0, 3);
const WORLDS = [...new Set(CHARACTERS.map(character => character.series))];

function CharacterDialog({ character, view, onChangeView, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => { closeRef.current?.focus(); }, [view]);
  return (
    <dialog className={`character-dialog ${view === "3d" ? "character-dialog-3d" : ""}`} ref={dialogRef} aria-labelledby="character-dialog-title" onCancel={onClose} style={{ "--character-accent": character.color }}>
      <button className="dialog-close" ref={closeRef} type="button" aria-label="Close character preview" onClick={onClose}><Icon name="close" /></button>
      {view === "3d" ? (
        <div className="character-viewer">
          <div className="character-viewer-heading"><span className="lobby-eyebrow">CHARACTER SHOWCASE</span><h2 id="character-dialog-title">Sung Jin-Woo <span>/ 3D preview</span></h2></div>
          <iframe title="Sung Jin-Woo — shared Sketchfab 3D collection" src={JINWOO_COLLECTION.embedUrl} allow="autoplay; fullscreen; xr-spatial-tracking; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          <div className="viewer-attribution"><p><a href={JINWOO_COLLECTION.url} target="_blank" rel="noopener noreferrer">gffgfg</a> · collection by <a href={JINWOO_COLLECTION.curatorUrl} target="_blank" rel="noopener noreferrer">fernanflowvera</a> on <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer">Sketchfab</a></p><a href={JINWOO_COLLECTION.url} target="_blank" rel="noopener noreferrer">Open on Sketchfab <Icon name="diagonal" size={13} /></a></div>
          <div className="viewer-foot"><button className="lobby-text-button" type="button" onClick={() => onChangeView("profile")}>← Back to character</button><span>Explore the creator’s published scene.</span></div>
        </div>
      ) : (
        <div className="character-profile">
          <div className="character-profile-art"><span className="profile-art-word" aria-hidden="true">{character.tier}</span><img src={character.portrait} alt="" /><span className="profile-series">{character.series}</span></div>
          <div className="character-profile-copy"><span className="lobby-eyebrow">{character.role}</span><h2 id="character-dialog-title">{character.name}</h2><p className="profile-lore">{character.description}</p>
            <div className="profile-abilities">{character.abilities.map(ability => <div key={ability.name}><Icon name="bolt" size={17} /><div><h3>{ability.name}</h3><p>{ability.detail}</p></div></div>)}</div>
            <div className="profile-stats"><span className="lobby-eyebrow">ARENA ATTRIBUTES</span><dl>{Object.entries(character.stats).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value.toLocaleString()}</dd><span aria-hidden="true" style={{ "--stat-width": `${value / 100}%` }} /></div>)}</dl></div>
            <div className="profile-actions"><Link className="lobby-button lobby-button-primary" to={`/battle?fighter=${character.id}`} onClick={onClose}><Icon name="swords" size={17} />Choose for battle</Link>{character.id === "sung-jinwoo" && <button className="lobby-button lobby-button-secondary" type="button" onClick={() => onChangeView("3d")}><Icon name="cube" size={17} />3D preview</button>}</div>
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function Home() {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [world, setWorld] = useState("all");
  const [dialog, setDialog] = useState(null);
  const featured = FEATURED[featuredIndex];
  const roster = CHARACTERS.filter(character => (world === "all" || character.series === world) && `${character.name} ${character.series} ${character.role}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="animverse-lobby">
      <a className="lobby-skip" href="#main-content">Skip to content</a><PlatformHeader />
      <main id="main-content" className="lobby-main">
        <div className="lobby-welcome"><p><span className="lobby-diamond" />YOUR WORLDS. YOUR LEGENDS.</p><span>THE ANIMVERSE STARTS HERE <Icon name="diagonal" size={13} /></span></div>
        <section className="lobby-hero" aria-labelledby="spotlight-title" style={{ "--spotlight": featured.color }}>
          <div className="hero-lines" aria-hidden="true" /><div className="hero-ambient" aria-hidden="true" />
          <span className="hero-background-word" aria-hidden="true">{featuredIndex === 0 ? "ARISE" : featuredIndex === 1 ? "LIMITLESS" : "UCHIHA"}</span>
          <div className="hero-art"><img key={featured.id} src={featured.portrait} alt={`${featured.name} character artwork`} /><div className="hero-floor" /></div>
          <div className="hero-copy">
            <div className="hero-world"><span className="hero-world-mark"><Icon name="globe" size={13} /></span>{featured.series}<span className="hero-world-line" />CHARACTER SPOTLIGHT</div>
            <h1 id="spotlight-title">{featured.title[0]}<br /><span>{featured.title[1]}</span></h1>
            <p className="hero-character-name">{featured.name}<span />{featured.epithet}</p><p className="hero-description">{featured.description}</p>
            <div className="hero-actions"><button className="lobby-button lobby-button-primary" type="button" onClick={() => setDialog({ character: featured, view: "profile" })}>Explore character<Icon name="arrow" size={18} /></button><Link className="lobby-button lobby-button-secondary" to={`/battle?fighter=${featured.id}`}><Icon name="swords" size={17} />Enter arena</Link></div>
            <div className="hero-identity"><div><span>SIGNATURE POWER</span><b>{featured.signature}</b></div><i /><div><span>ALLEGIANCE</span><b>{featured.allegiance}</b></div></div>
          </div>
          <div className="hero-rank"><span>ARENA TIER</span><b>{featured.tier}</b><i /></div>
          {featured.id === "sung-jinwoo" && <button type="button" className="hero-3d-button" onClick={() => setDialog({ character: featured, view: "3d" })}><Icon name="cube" size={17} /><span>View in 3D</span><Icon name="diagonal" size={13} /></button>}
          <div className="hero-footer"><div className="hero-chapter"><b>{String(featuredIndex + 1).padStart(2, "0")}</b><span>/ 03</span><i /><span>FEATURED LEGENDS</span></div><div className="hero-picks" aria-label="Choose featured character">{FEATURED.map((character, index) => <button key={character.id} type="button" aria-label={`Feature ${character.name}`} aria-pressed={featuredIndex === index} onClick={() => setFeaturedIndex(index)}><img src={character.portrait} alt="" /><span>{character.name}</span><b>{String(index + 1).padStart(2, "0")}</b></button>)}</div></div>
        </section>
        <section className="lobby-paths" aria-label="Explore Animverse">
          <Link className="lobby-path arena-path" to="/battle"><span className="path-symbol"><Icon name="swords" size={27} /></span><div><span className="lobby-eyebrow">THE BATTLEGROUND</span><h2>Shadow Arena</h2><p>Choose two legends. Settle the matchup.</p></div><span className="path-action">Enter arena<Icon name="arrow" size={17} /></span><span className="path-decoration" aria-hidden="true">VS</span></Link>
          <Link className="lobby-path rankings-path" to="/leaderboard"><span className="path-symbol"><Icon name="trophy" size={26} /></span><div><span className="lobby-eyebrow">THE POWER INDEX</span><h2>Who stands above?</h2><p>Explore the roster’s power rankings.</p></div><span className="path-action">View rankings<Icon name="arrow" size={17} /></span><span className="rank-decoration" aria-hidden="true"><i /><i /><i /></span></Link>
        </section>
        <section className="lobby-roster" id="characters" aria-labelledby="roster-heading">
          <div className="lobby-section-heading"><div><span className="lobby-eyebrow">BEYOND ONE UNIVERSE</span><h2 id="roster-heading">Every legend has an origin<span>.</span></h2></div><span className="roster-count">{CHARACTERS.length.toString().padStart(2, "0")} CHARACTERS <i />{WORLDS.length.toString().padStart(2, "0")} WORLDS</span></div>
          <div className="roster-toolbar"><label className="roster-search"><Icon name="search" size={18} /><span className="lobby-sr-only">Search characters</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find your legend…" type="search" /></label><label className="roster-world-filter"><Icon name="globe" size={16} /><span className="lobby-sr-only">Filter by anime world</span><select value={world} onChange={event => setWorld(event.target.value)}><option value="all">All worlds</option>{WORLDS.map(series => <option key={series}>{series}</option>)}</select></label><span className="roster-showing" role="status">{roster.length} {roster.length === 1 ? "character" : "characters"}</span></div>
          <div className="lobby-roster-grid">{roster.map(character => <button type="button" className="lobby-character-card" key={character.id} style={{ "--character-accent": character.color }} onClick={() => setDialog({ character, view: "profile" })}><span className="character-card-art"><span className="character-card-number" aria-hidden="true">{String(CHARACTERS.indexOf(character) + 1).padStart(2, "0")}</span><span className="character-card-tier">{character.tier}</span><img src={character.portrait} alt="" loading="lazy" /><span className="character-card-caption">{character.role}</span></span><span className="character-card-info"><span>{character.series}</span><strong>{character.name}</strong><Icon name="diagonal" size={15} /></span></button>)}</div>
          {roster.length === 0 && <div className="roster-empty"><Icon name="search" size={28} /><h3>No legends found.</h3><p>Try another name or explore a different world.</p><button type="button" className="lobby-button lobby-button-secondary" onClick={() => { setWorld("all"); setQuery(""); }}>Reset filters</button></div>}
        </section>
        <section className="lobby-closing"><span className="closing-mark" aria-hidden="true">A</span><div><span className="lobby-eyebrow">ONE PLATFORM. COUNTLESS WORLDS.</span><h2>This is your Animverse.</h2><p>Discover the characters. Explore their power. Make your matchup.</p></div><Link className="lobby-text-link" to="/battle">Your next battle awaits<Icon name="arrow" size={20} /></Link></section>
      </main>
      <footer className="lobby-footer"><span>ANIMVERSE <i /> A WORLD BEYOND THE SCREEN.</span><span>BUILT FOR ANIME. DRIVEN BY AURA.</span></footer>
      {dialog && <CharacterDialog character={dialog.character} view={dialog.view} onChangeView={view => setDialog(current => ({ ...current, view }))} onClose={() => setDialog(null)} />}
    </div>
  );
}
