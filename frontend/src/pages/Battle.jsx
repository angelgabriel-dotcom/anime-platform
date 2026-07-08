import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080/api/v1";

// ─────────────────────────────────────────────
// CHARACTER ROSTER (mirrors Go stubs)
// ─────────────────────────────────────────────
const CHARACTERS = [
  {
    id: "sung-jinwoo",
    name: "Sung Jin-Woo",
    series: "Solo Leveling",
    tier: "GOD",
    role: "Shadow Monarch",
    image: "SJW",
    sprite: "/characters/sung-jinwoo.png",
    accent: "#7c3aed",
    glowColor: "rgba(124,58,237,0.6)",
    attrs: { strength:9800, speed:9700, defense:8500, intelligence:8000, endurance:9000, aura:9500 },
    critRate: 75, evasion: 60,
    abilities: [
      { id:"ruler-authority", name:"Ruler's Authority", manaCost:500, multi:3.5, cooldown:3, type:"attack", icon:"⚡" },
      { id:"shadow-exchange", name:"Shadow Exchange",   manaCost:200, multi:1.8, cooldown:1, type:"attack", icon:"🌀" },
    ],
    tagline: "I alone level up.",
  },
  {
    id: "gojo-satoru",
    name: "Gojo Satoru",
    series: "Jujutsu Kaisen",
    tier: "GOD",
    role: "Special Grade Sorcerer",
    image: "GJK",
    sprite: "/characters/gojo-satoru.png",
    accent: "#06b6d4",
    glowColor: "rgba(6,182,212,0.6)",
    attrs: { strength:9200, speed:9500, defense:9900, intelligence:9800, endurance:9000, aura:9800 },
    critRate: 55, evasion: 80,
    abilities: [
      { id:"infinity",      name:"Infinity",      manaCost:0,   multi:0,   cooldown:0, type:"passive", icon:"♾️" },
      { id:"hollow-purple", name:"Hollow Purple", manaCost:800, multi:5.0, cooldown:5, type:"attack",  icon:"💜" },
    ],
    tagline: "Throughout Heaven and Earth, I alone am the honored one.",
  },
  {
    id: "zoro",
    name: "Roronoa Zoro",
    series: "One Piece",
    tier: "S",
    role: "Pirate Hunter",
    image: "ZRO",
    sprite: "/characters/zoro.png",
    accent: "#16a34a",
    glowColor: "rgba(22,163,74,0.5)",
    attrs: { strength:8350, speed:8000, defense:8300, intelligence:7000, endurance:9500, aura:8000 },
    critRate: 80, evasion: 55,
    abilities: [
      { id:"ackermann-burst",        name:"Conqueror's Haki",       manaCost:0,   multi:0,   cooldown:0, type:"passive", icon:"⚫" },
      { id:"the-breath-of-all-things", name:"Breath of All Things", manaCost:700, multi:4.5, cooldown:4, type:"attack",  icon:"⚔️" },
    ],
    tagline: "Nothing happened.",
  },
  {
    id: "madara",
    name: "Madara Uchiha",
    series: "Naruto",
    tier: "S",
    role: "Ghost of the Uchiha",
    image: "MDR",
    sprite: "/characters/Madara-Uchiha.png",
    accent: "#dc2626",
    glowColor: "rgba(220,38,38,0.5)",
    attrs: { strength:9600, speed:9200, defense:8500, intelligence:9700, endurance:9500, aura:8000 },
    critRate: 80, evasion: 60,
    abilities: [
      { id:"susanoo", name:"Perfect Susanoo",   manaCost:500, multi:3.8, cooldown:3, type:"attack", icon:"🔥" },
      { id:"limbo",   name:"Limbo: Border Jail",manaCost:700, multi:4.5, cooldown:4, type:"attack", icon:"🌑" },
    ],
    tagline: "Wake up to reality.",
  },
  {
    id: "levi",
    name: "Levi Ackermann",
    series: "Attack on Titan",
    tier: "A",
    role: "Humanity's Strongest",
    image: "LVI",
    sprite: "/characters/Levi-Ackermann.png",
    accent: "#f59e0b",
    glowColor: "rgba(245,158,11,0.5)",
    attrs: { strength:8500, speed:9000, defense:7500, intelligence:8800, endurance:8200, aura:7000 },
    critRate: 85, evasion: 90,
    abilities: [
      { id:"ackermann-burst", name:"Ackermann Burst",    manaCost:200, multi:3.0, cooldown:2, type:"attack", icon:"🌪️" },
      { id:"vertical-slash",  name:"360° Vertical Slash",manaCost:100, multi:2.0, cooldown:1, type:"attack", icon:"💨" },
    ],
    tagline: "Give up on your dreams and die.",
  },
  {
    id: "ichigo",
    name: "Ichigo Kurosaki",
    series: "Bleach",
    tier: "S",
    role: "Soul Reaper / Quincy",
    image: "ICH",
    sprite: "/characters/Ichigo-Kurosaki.png",
    accent: "#f97316",
    glowColor: "rgba(249,115,22,0.5)",
    attrs: { strength:9300, speed:9400, defense:8000, intelligence:7800, endurance:9500, aura:9200 },
    critRate: 60, evasion: 62,
    abilities: [
      { id:"getsuga-tensho", name:"Getsuga Tenshō", manaCost:300, multi:2.8, cooldown:2, type:"attack", icon:"🌙" },
      { id:"final-getsuga",  name:"Mugetsu",         manaCost:999, multi:6.0, cooldown:9, type:"attack", icon:"☯️" },
    ],
    tagline: "If fate is a millstone, then we are the grist.",
  },
];

const TIER_COLORS = { GOD:"#a855f7", S:"#f59e0b", A:"#22d3ee", B:"#4ade80", C:"#94a3b8" };
const STAT_MAX = 10000;

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function StatBar({ label, value, max = STAT_MAX, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
        <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"'Rajdhani',sans-serif", letterSpacing:1, textTransform:"uppercase" }}>{label}</span>
        <span style={{ fontSize:10, color, fontWeight:700, fontFamily:"'Orbitron',monospace" }}>{value}</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`,
          background:`linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius:2, transition:"width 1s cubic-bezier(0.4,0,0.2,1)",
          boxShadow:`0 0 8px ${color}88`,
        }}/>
      </div>
    </div>
  );
}

function TierBadge({ tier }) {
  const c = TIER_COLORS[tier] || "#94a3b8";
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px",
      border:`1px solid ${c}`, borderRadius:2, background:`${c}15`,
    }}>
      <div style={{ width:5, height:5, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}` }}/>
      <span style={{ fontSize:10, color:c, fontFamily:"'Orbitron',monospace", letterSpacing:2, fontWeight:700 }}>{tier} TIER</span>
    </div>
  );
}

function CharacterCard({ character, selected, onSelect, slot }) {
  const [hovered, setHovered] = useState(false);
  const { name, series, tier, role, image, accent, glowColor, attrs, tagline, abilities } = character;
  const isActive = selected || hovered;

  return (
    <div
      onClick={() => onSelect(character)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:"relative", cursor:"pointer", borderRadius:8, overflow:"hidden",
        border: selected ? `1.5px solid ${accent}` : "1.5px solid rgba(255,255,255,0.06)",
        background: isActive
          ? `linear-gradient(135deg, rgba(15,15,25,0.98) 0%, ${accent}18 100%)`
          : "rgba(10,10,18,0.9)",
        boxShadow: selected
          ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}44`
          : hovered ? `0 0 15px ${glowColor}55` : "none",
        transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered && !selected ? "translateY(-3px)" : "none",
        userSelect:"none",
      }}
    >
      {/* Scanline */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:1,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
      }}/>

      {/* Corner accents */}
      <div style={{ position:"absolute", top:0, right:0, width:40, height:40, borderTop:`2px solid ${accent}`, borderRight:`2px solid ${accent}`, opacity: isActive ? 1 : 0.3, transition:"opacity 0.3s" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, width:40, height:40, borderBottom:`2px solid ${accent}`, borderLeft:`2px solid ${accent}`, opacity: isActive ? 1 : 0.3, transition:"opacity 0.3s" }}/>

      {/* Slot badge */}
      {selected && (
        <div style={{
          position:"absolute", top:8, left:8, zIndex:10,
          background: accent, color:"#000", fontSize:8, fontWeight:700,
          fontFamily:"'Orbitron',monospace", letterSpacing:1.5, padding:"3px 8px", borderRadius:2,
        }}>
          {slot === "a" ? "FIGHTER 1" : "FIGHTER 2"}
        </div>
      )}

      <div style={{ padding:16 }}>
        {/* Avatar */}
        <div style={{
          width:"100%", aspectRatio:"1", borderRadius:6, marginBottom:12,
          background:`linear-gradient(135deg, ${accent}22, ${accent}44)`,
          border:`1px solid ${accent}44`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: isActive ? `inset 0 0 30px ${glowColor}44` : "none",
          transition:"box-shadow 0.3s",
          overflow:"hidden", position:"relative",
        }}>
          {character.sprite ? (
            <img
              src={character.sprite}
              alt={name}
              style={{
                width:"100%", height:"100%", objectFit:"contain",
                filter: isActive ? `drop-shadow(0 0 12px ${accent})` : "none",
                transition:"filter 0.3s",
                transform: isActive ? "scale(1.05)" : "scale(1)",
              }}
            />
          ) : (
            <span style={{
              fontFamily:"'Orbitron',monospace", fontSize:32, fontWeight:900,
              color: accent, letterSpacing:2,
              textShadow: isActive ? `0 0 20px ${glowColor}` : "none",
              transition:"all 0.3s",
            }}>{image}</span>
          )}
        </div>

        <div style={{ marginBottom:8 }}><TierBadge tier={tier}/></div>

        <h3 style={{ margin:"0 0 2px", fontFamily:"'Rajdhani',sans-serif", fontSize:17, fontWeight:700, color:"#f1f5f9", letterSpacing:0.5 }}>{name}</h3>
        <p style={{ margin:"0 0 4px", fontSize:11, color: accent, fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:1 }}>{series}</p>
        <p style={{ margin:"0 0 12px", fontSize:10, color:"#64748b", fontStyle:"italic" }}>{role}</p>

        <div style={{ margin:"0 0 12px", padding:"6px 8px", borderLeft:`2px solid ${accent}`, background:`${accent}08` }}>
          <p style={{ margin:0, fontSize:10, color:"#94a3b8", fontStyle:"italic", lineHeight:1.4 }}>"{tagline}"</p>
        </div>

        <div style={{ marginBottom:12 }}>
          <StatBar label="STR"  value={attrs.strength}     color="#ef4444"/>
          <StatBar label="SPD"  value={attrs.speed}        color="#06b6d4"/>
          <StatBar label="DEF"  value={attrs.defense}      color="#22c55e"/>
          <StatBar label="INT"  value={attrs.intelligence} color="#a855f7"/>
          <StatBar label="END"  value={attrs.endurance}    color="#f59e0b"/>
          <StatBar label="AURA" value={attrs.aura}         color={accent}/>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {abilities.map(ab => (
            <div key={ab.id} style={{
              display:"flex", alignItems:"center", gap:8, padding:"4px 8px",
              background:"rgba(255,255,255,0.03)", borderRadius:4,
              border:"1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize:14 }}>{ab.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:600, color:"#e2e8f0", fontFamily:"'Rajdhani',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ab.name}</p>
                <p style={{ margin:0, fontSize:9, color:"#475569" }}>
                  {ab.type === "passive" ? "Passive" : `${ab.manaCost > 0 ? `${ab.manaCost} MP · ` : ""}${ab.multi}x · CD: ${ab.cooldown}t`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BattleBar({ current, max, color, label }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const danger = pct < 25;
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:9, color:"#64748b", fontFamily:"'Orbitron',monospace", letterSpacing:2, textTransform:"uppercase" }}>{label}</span>
        <span style={{ fontSize:10, color: danger ? "#ef4444" : color, fontFamily:"'Orbitron',monospace", fontWeight:700 }}>
          {Math.round(current)}<span style={{ opacity:0.5 }}>/{max}</span>
        </span>
      </div>
      <div style={{ height:8, background:"rgba(255,255,255,0.05)", borderRadius:4, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          height:"100%", width:`${pct}%`, borderRadius:4,
          background: danger ? "linear-gradient(90deg,#7f1d1d,#ef4444)" : `linear-gradient(90deg,${color}88,${color})`,
          boxShadow:`0 0 10px ${danger?"#ef4444":color}88`,
          transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}/>
      </div>
    </div>
  );
}

function LogEntry({ entry, charA, charB }) {
  const typeColors = { SKILL:"#a855f7", CRIT:"#ef4444", NORMAL:"#94a3b8", EVADE:"#06b6d4", KO:"#f59e0b" };
  const color = typeColors[entry.event_type] || "#94a3b8";
  return (
    <div style={{
      padding:"6px 10px", borderLeft:`2px solid ${color}`,
      background:`${color}08`, marginBottom:4, borderRadius:"0 4px 4px 0",
      animation:"slideInLog 0.3s ease-out",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
        <span style={{
          fontSize:8, fontFamily:"'Orbitron',monospace", letterSpacing:1.5,
          color, background:`${color}20`, padding:"1px 6px", borderRadius:2,
        }}>{entry.event_type}</span>
        {entry.damage > 0 && (
          <span style={{ fontSize:11, fontWeight:700, color, fontFamily:"'Orbitron',monospace" }}>-{entry.damage}</span>
        )}
      </div>
      <p style={{ margin:0, fontSize:11, color:"#94a3b8", lineHeight:1.4 }}>{entry.narrative}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Battle() {
  const navigate = useNavigate();
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [battleResult, setBattleResult]   = useState(null);
  const [visibleLogs, setVisibleLogs]     = useState([]);
  const [battleState, setBattleState]     = useState("idle"); // idle | fighting | done
  const [error, setError]                 = useState(null);
  const [mode, setMode]                   = useState("quick");

  const [hpA,   setHpA]   = useState(0);
  const [hpB,   setHpB]   = useState(0);
  const [manaA, setManaA] = useState(0);
  const [manaB, setManaB] = useState(0);
  const [shakeA, setShakeA] = useState(false);
  const [shakeB, setShakeB] = useState(false);

  const logRef      = useRef(null);
  const timeoutsRef = useRef([]);

  const maxHPA  = selectedA ? selectedA.attrs.endurance * 100 : 1000;
  const maxHPB  = selectedB ? selectedB.attrs.endurance * 100 : 1000;
  const maxManaA = selectedA ? selectedA.attrs.aura * 10 : 1000;
  const maxManaB = selectedB ? selectedB.attrs.aura * 10 : 1000;

  const handleSelect = (character) => {
    if (battleState === "fighting") return;
    if (!selectedA || selectedA?.id === character.id) {
      if (selectedB?.id === character.id) setSelectedB(null);
      setSelectedA(character);
    } else if (!selectedB || selectedB?.id === character.id) {
      if (selectedA?.id === character.id) setSelectedA(null);
      setSelectedB(character);
    } else {
      setSelectedA(character);
    }
    setBattleResult(null);
    setVisibleLogs([]);
    setBattleState("idle");
    setError(null);
    timeoutsRef.current.forEach(clearTimeout);
  };

  const startBattle = useCallback(async () => {
    if (!selectedA || !selectedB || battleState === "fighting") return;
    timeoutsRef.current.forEach(clearTimeout);

    setBattleState("fighting");
    setVisibleLogs([]);
    setError(null);
    setHpA(maxHPA);
    setHpB(maxHPB);
    setManaA(maxManaA);
    setManaB(maxManaB);

    try {
      const res = await fetch(`${API}/battle/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenger_id: selectedA.id,
          opponent_id:   selectedB.id,
          mode,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Battle failed");
      }

      const result = await res.json();
      setBattleResult(result);

      // Stream the rounds from the API response
      const rounds = result.rounds || [];
      rounds.forEach((entry, i) => {
        const t = setTimeout(() => {
          setVisibleLogs(prev => [...prev, entry]);

          // Update HP/Mana bars based on actor
          if (entry.actor_id === selectedA.id) {
            setHpB(entry.target_hp);
            setManaA(entry.actor_mana ?? maxManaA);
            if (entry.damage > 0) { setShakeB(true); setTimeout(() => setShakeB(false), 400); }
          } else {
            setHpA(entry.target_hp);
            setManaB(entry.actor_mana ?? maxManaB);
            if (entry.damage > 0) { setShakeA(true); setTimeout(() => setShakeA(false), 400); }
          }

          if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
          if (i === rounds.length - 1) setBattleState("done");
        }, i * 320);
        timeoutsRef.current.push(t);
      });

    } catch (err) {
      setError(err.message);
      setBattleState("idle");
    }
  }, [selectedA, selectedB, battleState, mode, maxHPA, maxHPB, maxManaA, maxManaB]);

  const winner = battleResult
    ? CHARACTERS.find(c => c.id === battleResult.winner_id)
    : null;

  return (
    <div style={{ minHeight:"100vh", background:"#050508", fontFamily:"'Rajdhani',sans-serif", color:"#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes pulseRing  { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.02)} }
        @keyframes slideInLog { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes shake      { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes pulseGlow  { 0%,100%{opacity:0.5} 50%{opacity:1} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
      `}</style>

      {/* Scanline overlay */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)" }}/>

      {/* Nav */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 32px",
        background:"rgba(5,5,8,0.9)", backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => navigate("/")}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#7c3aed", boxShadow:"0 0 10px #7c3aed", animation:"pulseGlow 2s infinite" }}/>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:900, letterSpacing:3, color:"#e2e8f0" }}>
            SHADOW<span style={{ color:"#7c3aed" }}>ARENA</span>
          </span>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {["quick","ranked","story"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2,
              padding:"6px 14px", borderRadius:4, border:"none", cursor:"pointer",
              background: mode === m ? "rgba(124,58,237,0.2)" : "transparent",
              color: mode === m ? "#a855f7" : "#334155",
              borderBottom: mode === m ? "1px solid #7c3aed" : "1px solid transparent",
              transition:"all 0.2s",
            }}>{m.toUpperCase()}</button>
          ))}
        </div>
        <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2, color:"#334155", cursor:"pointer" }} onClick={() => navigate("/leaderboard")}>
          RANKINGS →
        </span>
      </nav>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <h1 style={{
            margin:"0 0 4px", fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(22px,3.5vw,40px)", fontWeight:900, letterSpacing:3,
            background:"linear-gradient(135deg,#e2e8f0,#a855f7,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Shadow Arena</h1>
          <p style={{ margin:0, fontSize:11, color:"#475569", letterSpacing:2, fontFamily:"'Orbitron',monospace" }}>
            SELECT · BATTLE · DOMINATE // MODE: <span style={{ color:"#7c3aed" }}>{mode.toUpperCase()}</span>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            marginBottom:16, padding:"12px 16px",
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:6, color:"#ef4444", fontSize:12, fontFamily:"'Orbitron',monospace", letterSpacing:1,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Battle Arena */}
        {(selectedA || selectedB) && (
          <div style={{
            marginBottom:28, padding:20,
            background:"rgba(10,10,20,0.9)",
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:8, position:"relative", overflow:"hidden",
          }}>
            {selectedA && <div style={{ position:"absolute", left:"20%", top:"50%", transform:"translate(-50%,-50%)", width:200, height:200, borderRadius:"50%", background:selectedA.glowColor, filter:"blur(60px)", opacity:0.25, pointerEvents:"none" }}/>}
            {selectedB && <div style={{ position:"absolute", right:"20%", top:"50%", transform:"translate(50%,-50%)", width:200, height:200, borderRadius:"50%", background:selectedB.glowColor, filter:"blur(60px)", opacity:0.25, pointerEvents:"none" }}/>}

            {/* ── Battle Stage — large sprites facing each other ── */}
            {selectedA && selectedB && (
              <div style={{
                position:"relative", display:"flex", justifyContent:"space-between",
                alignItems:"flex-end", marginBottom:16, height:280,
                background:"linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)",
                borderRadius:8, overflow:"hidden",
              }}>
                {/* Stage floor line */}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }}/>

                {/* Fighter A — left side, faces right */}
                <div style={{
                  height:"100%", width:"40%", display:"flex", alignItems:"flex-end", justifyContent:"center",
                  animation: shakeA ? "shake 0.4s ease" : "none",
                  filter: battleState === "done" && winner?.id !== selectedA.id ? "grayscale(0.8) brightness(0.5)" : "none",
                  transition:"filter 0.5s",
                }}>
                  {selectedA.sprite ? (
                    <img src={selectedA.sprite} alt={selectedA.name} style={{
                      maxHeight:"100%", maxWidth:"100%", objectFit:"contain",
                      filter:`drop-shadow(0 0 20px ${selectedA.accent}88)`,
                      transform:"scaleX(1)",
                    }}/>
                  ) : (
                    <div style={{ fontSize:80, fontFamily:"'Orbitron',monospace", color:selectedA.accent, textShadow:`0 0 40px ${selectedA.accent}` }}>{selectedA.image}</div>
                  )}
                </div>

                {/* Center VS */}
                <div style={{
                  position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
                  fontFamily:"'Orbitron',monospace", fontSize:36, fontWeight:900, letterSpacing:4,
                  background:"linear-gradient(135deg,#7c3aed,#06b6d4)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  opacity: battleState === "fighting" ? 0.3 : 1, transition:"opacity 0.3s",
                }}>VS</div>

                {/* Fighter B — right side, faces left */}
                <div style={{
                  height:"100%", width:"40%", display:"flex", alignItems:"flex-end", justifyContent:"center",
                  animation: shakeB ? "shake 0.4s ease" : "none",
                  filter: battleState === "done" && winner?.id !== selectedB.id ? "grayscale(0.8) brightness(0.5)" : "none",
                  transition:"filter 0.5s",
                }}>
                  {selectedB.sprite ? (
                    <img src={selectedB.sprite} alt={selectedB.name} style={{
                      maxHeight:"100%", maxWidth:"100%", objectFit:"contain",
                      filter:`drop-shadow(0 0 20px ${selectedB.accent}88)`,
                      transform:"scaleX(-1)",
                    }}/>
                  ) : (
                    <div style={{ fontSize:80, fontFamily:"'Orbitron',monospace", color:selectedB.accent, textShadow:`0 0 40px ${selectedB.accent}` }}>{selectedB.image}</div>
                  )}
                </div>

                {/* Winner crown */}
                {battleState === "done" && winner && (
                  <div style={{
                    position:"absolute", top:8,
                    left: winner.id === selectedA.id ? "20%" : "auto",
                    right: winner.id === selectedB.id ? "20%" : "auto",
                    transform:"translateX(-50%)",
                    fontFamily:"'Orbitron',monospace", fontSize:10, letterSpacing:2,
                    background:"#f59e0b", color:"#000", fontWeight:700,
                    padding:"4px 12px", borderRadius:2,
                  }}>👑 VICTOR</div>
                )}
              </div>
            )}

            <div style={{ position:"relative", display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:16, alignItems:"start" }}>
              {/* Fighter A */}
              <div style={{ padding:16, borderRadius:6, border:`1px solid ${selectedA ? selectedA.accent+"44" : "rgba(255,255,255,0.06)"}`, background: selectedA ? `${selectedA.accent}08` : "rgba(255,255,255,0.02)", animation: shakeA ? "shake 0.4s ease" : "none" }}>
                {selectedA ? (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                      <div style={{ width:44, height:44, borderRadius:6, background:`${selectedA.accent}22`, border:`1px solid ${selectedA.accent}44`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                        {selectedA.sprite
                          ? <img src={selectedA.sprite} alt={selectedA.name} style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                          : <span style={{ fontFamily:"'Orbitron',monospace", fontSize:14, color:selectedA.accent, fontWeight:900 }}>{selectedA.image}</span>
                        }
                      </div>
                      <div>
                        <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#f1f5f9", fontFamily:"'Rajdhani',sans-serif" }}>{selectedA.name}</p>
                        <p style={{ margin:0, fontSize:10, color:selectedA.accent }}>{selectedA.series}</p>
                      </div>
                      {battleState === "done" && winner?.id === selectedA.id && (
                        <div style={{ marginLeft:"auto", background:"#f59e0b", color:"#000", fontSize:9, fontWeight:700, fontFamily:"'Orbitron',monospace", padding:"3px 10px", borderRadius:2, letterSpacing:1.5 }}>VICTOR</div>
                      )}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <BattleBar current={hpA || maxHPA}   max={maxHPA}   color={selectedA.accent} label="HP"/>
                      <BattleBar current={manaA || maxManaA} max={maxManaA} color="#a855f7"          label="Mana"/>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:"center", padding:"20px 0" }}>
                    <p style={{ margin:0, fontSize:12, color:"#334155", fontFamily:"'Orbitron',monospace", letterSpacing:2 }}>SELECT FIGHTER 1</p>
                  </div>
                )}
              </div>

              {/* VS + controls */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, paddingTop:8 }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:28, fontWeight:900, letterSpacing:2, background:"linear-gradient(135deg,#7c3aed,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VS</div>
                <button
                  onClick={startBattle}
                  disabled={!selectedA || !selectedB || battleState === "fighting"}
                  style={{
                    padding:"10px 20px", fontFamily:"'Orbitron',monospace", fontSize:10,
                    fontWeight:700, letterSpacing:2, border:"none", borderRadius:4,
                    cursor: (!selectedA||!selectedB||battleState==="fighting") ? "not-allowed" : "pointer",
                    background: (!selectedA||!selectedB||battleState==="fighting")
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: (!selectedA||!selectedB||battleState==="fighting") ? "#334155" : "#fff",
                    transition:"all 0.2s",
                    boxShadow: (selectedA&&selectedB&&battleState!=="fighting") ? "0 0 20px rgba(124,58,237,0.4)" : "none",
                    whiteSpace:"nowrap",
                  }}
                >
                  {battleState === "fighting" ? "⚡ BATTLING..." : battleState === "done" ? "↻ REMATCH" : "⚔ BATTLE"}
                </button>
              </div>

              {/* Fighter B */}
              <div style={{ padding:16, borderRadius:6, border:`1px solid ${selectedB ? selectedB.accent+"44" : "rgba(255,255,255,0.06)"}`, background: selectedB ? `${selectedB.accent}08` : "rgba(255,255,255,0.02)", animation: shakeB ? "shake 0.4s ease" : "none" }}>
                {selectedB ? (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                      <div style={{ width:44, height:44, borderRadius:6, background:`${selectedB.accent}22`, border:`1px solid ${selectedB.accent}44`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                        {selectedB.sprite
                          ? <img src={selectedB.sprite} alt={selectedB.name} style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                          : <span style={{ fontFamily:"'Orbitron',monospace", fontSize:14, color:selectedB.accent, fontWeight:900 }}>{selectedB.image}</span>
                        }
                      </div>
                      <div>
                        <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#f1f5f9", fontFamily:"'Rajdhani',sans-serif" }}>{selectedB.name}</p>
                        <p style={{ margin:0, fontSize:10, color:selectedB.accent }}>{selectedB.series}</p>
                      </div>
                      {battleState === "done" && winner?.id === selectedB.id && (
                        <div style={{ marginLeft:"auto", background:"#f59e0b", color:"#000", fontSize:9, fontWeight:700, fontFamily:"'Orbitron',monospace", padding:"3px 10px", borderRadius:2, letterSpacing:1.5 }}>VICTOR</div>
                      )}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <BattleBar current={hpB || maxHPB}   max={maxHPB}   color={selectedB.accent} label="HP"/>
                      <BattleBar current={manaB || maxManaB} max={maxManaB} color="#a855f7"          label="Mana"/>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:"center", padding:"20px 0" }}>
                    <p style={{ margin:0, fontSize:12, color:"#334155", fontFamily:"'Orbitron',monospace", letterSpacing:2 }}>SELECT FIGHTER 2</p>
                  </div>
                )}
              </div>
            </div>

            {/* Combat log */}
            {visibleLogs.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background: battleState==="fighting" ? "#22c55e" : "#f59e0b", boxShadow:`0 0 6px ${battleState==="fighting"?"#22c55e":"#f59e0b"}`, animation: battleState==="fighting"?"pulseRing 1s infinite":"none" }}/>
                  <span style={{ fontSize:9, fontFamily:"'Orbitron',monospace", letterSpacing:2, color:"#475569" }}>
                    COMBAT LOG — ROUND {visibleLogs[visibleLogs.length-1]?.round || 1}
                  </span>
                </div>
                <div ref={logRef} style={{ maxHeight:180, overflowY:"auto", display:"flex", flexDirection:"column", gap:2, padding:"8px", background:"rgba(0,0,0,0.3)", borderRadius:6, border:"1px solid rgba(255,255,255,0.04)" }}>
                  {visibleLogs.map((entry, i) => (
                    <LogEntry key={i} entry={entry} charA={selectedA} charB={selectedB}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!selectedA && !selectedB && (
          <div style={{ textAlign:"center", marginBottom:24, padding:"12px", background:"rgba(124,58,237,0.06)", borderRadius:6, border:"1px solid rgba(124,58,237,0.15)" }}>
            <p style={{ margin:0, fontSize:12, color:"#7c3aed", fontFamily:"'Orbitron',monospace", letterSpacing:2 }}>
              ↓ SELECT TWO CHARACTERS — FIRST CLICK = FIGHTER 1 · SECOND = FIGHTER 2
            </p>
          </div>
        )}

        {/* Roster divider */}
        <div style={{ marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ height:1, flex:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06))" }}/>
          <span style={{ fontSize:9, fontFamily:"'Orbitron',monospace", letterSpacing:3, color:"#334155" }}>CHARACTER ROSTER</span>
          <div style={{ height:1, flex:1, background:"linear-gradient(90deg,rgba(255,255,255,0.06),transparent)" }}/>
        </div>

        {/* Character grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
          {CHARACTERS.map(char => {
            const slot = selectedA?.id === char.id ? "a" : selectedB?.id === char.id ? "b" : null;
            return (
              <CharacterCard
                key={char.id}
                character={char}
                selected={!!slot}
                slot={slot}
                onSelect={handleSelect}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:40, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ margin:0, fontSize:9, color:"#1e293b", fontFamily:"'Orbitron',monospace", letterSpacing:3 }}>
            SHADOW ARENA v1.0.0 // GO + REACT // ANIME FAN ENGAGEMENT PLATFORM
          </p>
        </div>
      </div>
    </div>
  );
}