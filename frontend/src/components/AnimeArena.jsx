import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// DATA — character roster (mirrors Go stubs)
// ─────────────────────────────────────────────
const CHARACTERS = [
  {
    id: "sung-jinwoo",
    name: "Sung Jin-Woo",
    series: "Solo Leveling",
    tier: "GOD",
    role: "Shadow Monarch",
    image: "SJW",
    accent: "#7c3aed",
    glowColor: "rgba(124,58,237,0.6)",
    attrs: { strength:98, speed:97, defense:85, intelligence:80, endurance:90, aura:95 },
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
    accent: "#06b6d4",
    glowColor: "rgba(6,182,212,0.6)",
    attrs: { strength:92, speed:95, defense:99, intelligence:98, endurance:90, aura:98 },
    critRate: 55, evasion: 80,
    abilities: [
      { id:"infinity",      name:"Infinity",       manaCost:0,   multi:0,   cooldown:0, type:"passive", icon:"♾️" },
      { id:"hollow-purple", name:"Hollow Purple",  manaCost:800, multi:5.0, cooldown:5, type:"attack",  icon:"💜" },
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
    accent: "#16a34a",
    glowColor: "rgba(22,163,74,0.5)",
    attrs: { strength:94, speed:88, defense:87, intelligence:70, endurance:96, aura:85 },
    critRate: 65, evasion: 45,
    abilities: [
      { id:"oni-giri",    name:"Oni Giri",           manaCost:150, multi:2.2, cooldown:1, type:"attack", icon:"⚔️" },
      { id:"ashura",      name:"Ashura: Ichibugin",  manaCost:600, multi:4.2, cooldown:4, type:"attack", icon:"👹" },
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
    accent: "#dc2626",
    glowColor: "rgba(220,38,38,0.5)",
    attrs: { strength:96, speed:92, defense:88, intelligence:97, endurance:94, aura:99 },
    critRate: 70, evasion: 55,
    abilities: [
      { id:"susanoo",     name:"Perfect Susanoo",  manaCost:500, multi:3.8, cooldown:3, type:"attack", icon:"🔥" },
      { id:"limbo",       name:"Limbo: Border Jail",manaCost:700, multi:4.5, cooldown:4, type:"attack", icon:"🌑" },
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
    accent: "#f59e0b",
    glowColor: "rgba(245,158,11,0.5)",
    attrs: { strength:85, speed:99, defense:75, intelligence:88, endurance:82, aura:70 },
    critRate: 85, evasion: 90,
    abilities: [
      { id:"ackermann-burst", name:"Ackermann Burst",  manaCost:200, multi:3.0, cooldown:2, type:"attack", icon:"🌪️" },
      { id:"vertical-slash",  name:"360° Vertical Slash",manaCost:100,multi:2.0, cooldown:1, type:"attack", icon:"💨" },
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
    accent: "#f97316",
    glowColor: "rgba(249,115,22,0.5)",
    attrs: { strength:93, speed:94, defense:80, intelligence:78, endurance:95, aura:92 },
    critRate: 60, evasion: 62,
    abilities: [
      { id:"getsuga-tensho",  name:"Getsuga Tenshō",  manaCost:300, multi:2.8, cooldown:2, type:"attack", icon:"🌙" },
      { id:"final-getsuga",   name:"Mugetsu",          manaCost:999, multi:6.0, cooldown:9, type:"attack", icon:"☯️" },
    ],
    tagline: "If fate is a millstone, then we are the grist.",
  },
];

const TIER_COLORS = { GOD:"#a855f7", S:"#f59e0b", A:"#22d3ee", B:"#4ade80", C:"#94a3b8" };

// ─────────────────────────────────────────────
// UTILITY — simulate battle client-side
// (mirrors the Go engine logic for demo purposes)
// ─────────────────────────────────────────────
function simulateBattle(a, b) {
  const rng = () => Math.random();
  const intn = (n) => Math.floor(rng() * n);

  const NARRATIVES = {
    NORMAL: [
      (a,b,d) => `${a} lunges forward — ${b} takes ${d} damage!`,
      (a,b,d) => `${a} strikes with brutal precision. ${d} damage lands on ${b}!`,
    ],
    SKILL: [
      (a,sk,b,d) => `⚡ ${a} activates [${sk}] — ${b} is engulfed for ${d} damage!`,
      (a,sk,b,d) => `💠 ${a} unleashes [${sk}]! Reality fractures. ${b} suffers ${d} damage!`,
    ],
    CRIT: [
      (a,b,d) => `🔥 CRITICAL STRIKE! ${a} devastates ${b} for ${d} damage!`,
    ],
    EVADE: [
      (a,b) => `🌀 ${b} vanishes! ${a}'s attack cuts through empty air!`,
    ],
    KO: [
      (a,b) => `💀 ${b} has fallen. ${a} stands triumphant!`,
    ],
  };

  const maxHP = (c) => c.attrs.endurance * 100;
  const maxMana = (c) => c.attrs.aura * 10;

  let stateA = { hp: maxHP(a), mana: maxMana(a), stamina: a.attrs.endurance, cooldowns: {} };
  let stateB = { hp: maxHP(b), mana: maxMana(b), stamina: b.attrs.endurance, cooldowns: {} };

  const rounds = [];
  const firstA = a.attrs.speed >= b.attrs.speed;
  let [actor, target, actorState, targetState] = firstA
    ? [a, b, stateA, stateB] : [b, a, stateB, stateA];

  for (let round = 1; round <= 50 && stateA.hp > 0 && stateB.hp > 0; round++) {
    for (const [atk, def, atkSt, defSt] of [[actor,target,actorState,targetState],[target,actor,targetState,actorState]]) {
      if (atkSt.hp <= 0 || defSt.hp <= 0) break;

      // passive
      atkSt.mana = Math.min(maxMana(atk), atkSt.mana + 3);
      atkSt.stamina = Math.max(0, atkSt.stamina - 5);
      for (const k in atkSt.cooldowns) if (atkSt.cooldowns[k] > 0) atkSt.cooldowns[k]--;

      // evasion
      if (intn(100) < def.evasion) {
        rounds.push({ round, actorId: atk.id, targetId: def.id, type:"EVADE", damage:0,
          actorHP: atkSt.hp, targetHP: defSt.hp, actorMana: atkSt.mana,
          narrative: NARRATIVES.EVADE[0](atk.name, def.name), maxHPA: maxHP(atk), maxHPB: maxHP(def) });
        continue;
      }

      // ability?
      let ability = null;
      const usable = (atk.abilities||[]).filter(ab => ab.type!=="passive"
        && (!atkSt.cooldowns[ab.id]) && atkSt.mana >= ab.manaCost);
      if (usable.length && rng() < 0.4) ability = usable[intn(usable.length)];

      const base = Math.max(1, atk.attrs.strength - def.attrs.defense);
      let dmg = ability ? Math.ceil(base * ability.multi) : base;
      let evType = ability ? "SKILL" : "NORMAL";

      if (ability) { atkSt.mana -= ability.manaCost; atkSt.cooldowns[ability.id] = ability.cooldown; }
      if (atkSt.stamina <= 0) dmg = Math.floor(dmg * 0.4);
      if (intn(100) < atk.critRate) { dmg = Math.floor(dmg * 1.75); evType = "CRIT"; }

      defSt.hp = Math.max(0, defSt.hp - dmg);

      const pick = (arr) => arr[intn(arr.length)];
      let narrative = evType === "SKILL"
        ? pick(NARRATIVES.SKILL)(atk.name, ability.name, def.name, dmg)
        : evType === "CRIT"
          ? pick(NARRATIVES.CRIT)(atk.name, def.name, dmg)
          : pick(NARRATIVES.NORMAL)(atk.name, def.name, dmg);

      rounds.push({
        round, actorId: atk.id, targetId: def.id, type: evType,
        ability: ability?.name, icon: ability?.icon, damage: dmg,
        actorHP: atkSt.hp, targetHP: defSt.hp,
        actorMana: atkSt.mana, targetMana: defSt.mana,
        maxHPA: maxHP(atk), maxHPB: maxHP(def),
        narrative,
      });

      if (defSt.hp <= 0) {
        rounds.push({ round, type:"KO", actorId: atk.id, targetId: def.id,
          damage:0, actorHP: atkSt.hp, targetHP: 0,
          narrative: pick(NARRATIVES.KO)(atk.name, def.name), maxHPA:maxHP(atk), maxHPB:maxHP(def) });
        return { rounds, winnerId: atk.id };
      }
    }
  }

  const winner = stateA.hp >= stateB.hp ? a : b;
  return { rounds, winnerId: winner.id };
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function StatBar({ label, value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
        <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"'Rajdhani',sans-serif", letterSpacing:1, textTransform:"uppercase" }}>{label}</span>
        <span style={{ fontSize:10, color, fontWeight:700, fontFamily:"'Orbitron',monospace" }}>{value}</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${color}88, ${color})`,
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
      onClick={() => onSelect(character, slot)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:"relative", cursor:"pointer", borderRadius:8, overflow:"hidden",
        border: selected ? `1.5px solid ${accent}` : "1.5px solid rgba(255,255,255,0.06)",
        background: isActive
          ? `linear-gradient(135deg, rgba(15,15,25,0.98) 0%, ${accent}18 100%)`
          : "rgba(10,10,18,0.9)",
        boxShadow: selected
          ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}44, inset 0 0 30px ${accent}08`
          : hovered ? `0 0 15px ${glowColor}55` : "none",
        transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered && !selected ? "translateY(-3px)" : "none",
        userSelect:"none",
      }}
    >
      {/* Scanline overlay */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:1,
        backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }}/>

      {/* Corner accent */}
      <div style={{
        position:"absolute", top:0, right:0, width:40, height:40,
        borderTop:`2px solid ${accent}`, borderRight:`2px solid ${accent}`,
        opacity: isActive ? 1 : 0.3, transition:"opacity 0.3s",
      }}/>
      <div style={{
        position:"absolute", bottom:0, left:0, width:40, height:40,
        borderBottom:`2px solid ${accent}`, borderLeft:`2px solid ${accent}`,
        opacity: isActive ? 1 : 0.3, transition:"opacity 0.3s",
      }}/>

      {/* Selected indicator */}
      {selected && (
        <div style={{
          position:"absolute", top:8, left:8, zIndex:10,
          background: accent, color:"#000", fontSize:8, fontWeight:700,
          fontFamily:"'Orbitron',monospace", letterSpacing:1.5,
          padding:"3px 8px", borderRadius:2,
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
          position:"relative", overflow:"hidden",
          boxShadow: isActive ? `inset 0 0 30px ${glowColor}44` : "none",
          transition:"box-shadow 0.3s",
        }}>
          <span style={{
            fontFamily:"'Orbitron',monospace", fontSize:32, fontWeight:900,
            color: accent, letterSpacing:2, opacity: isActive ? 1 : 0.7,
            textShadow: isActive ? `0 0 20px ${glowColor}` : "none",
            transition:"all 0.3s",
          }}>{image}</span>

          {/* Pulse ring when selected */}
          {selected && (
            <div style={{
              position:"absolute", inset:-2,
              borderRadius:8, border:`2px solid ${accent}`,
              animation:"pulseRing 2s ease-in-out infinite",
            }}/>
          )}
        </div>

        {/* Tier */}
        <div style={{ marginBottom:8 }}>
          <TierBadge tier={tier}/>
        </div>

        {/* Name & Series */}
        <h3 style={{
          margin:"0 0 2px", fontFamily:"'Rajdhani',sans-serif",
          fontSize:17, fontWeight:700, color:"#f1f5f9",
          letterSpacing:0.5, lineHeight:1.2,
          textShadow: isActive ? `0 0 12px ${glowColor}` : "none",
          transition:"text-shadow 0.3s",
        }}>{name}</h3>
        <p style={{ margin:"0 0 4px", fontSize:11, color: accent, fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:1 }}>{series}</p>
        <p style={{ margin:"0 0 12px", fontSize:10, color:"#64748b", fontStyle:"italic" }}>{role}</p>

        {/* Tagline */}
        <div style={{
          margin:"0 0 12px", padding:"6px 8px",
          borderLeft:`2px solid ${accent}`,
          background:`${accent}08`,
        }}>
          <p style={{ margin:0, fontSize:10, color:"#94a3b8", fontStyle:"italic", lineHeight:1.4 }}>"{tagline}"</p>
        </div>

        {/* Stats */}
        <div style={{ marginBottom:12 }}>
          <StatBar label="STR" value={attrs.strength} color="#ef4444"/>
          <StatBar label="SPD" value={attrs.speed}    color="#06b6d4"/>
          <StatBar label="DEF" value={attrs.defense}  color="#22c55e"/>
          <StatBar label="INT" value={attrs.intelligence} color="#a855f7"/>
          <StatBar label="END" value={attrs.endurance} color="#f59e0b"/>
          <StatBar label="AURA" value={attrs.aura}    color={accent}/>
        </div>

        {/* Abilities */}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {abilities.map(ab => (
            <div key={ab.id} style={{
              display:"flex", alignItems:"center", gap:8, padding:"4px 8px",
              background:"rgba(255,255,255,0.03)", borderRadius:4,
              border:"1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize:14 }}>{ab.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:600, color:"#e2e8f0", fontFamily:"'Rajdhani',sans-serif", letterSpacing:0.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ab.name}</p>
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

// ─── HP/Mana display bar for battle arena ───
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
          background: danger
            ? "linear-gradient(90deg, #7f1d1d, #ef4444)"
            : `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 10px ${danger ? "#ef4444" : color}88`,
          transition:"width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.3s",
        }}/>
      </div>
    </div>
  );
}

// ─── Combat log entry ───
function LogEntry({ entry, charA, charB }) {
  const isActor = (id) => id === charA.id;
  const typeColors = { SKILL:"#a855f7", CRIT:"#ef4444", NORMAL:"#94a3b8", EVADE:"#06b6d4", KO:"#f59e0b" };
  const color = typeColors[entry.type] || "#94a3b8";

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
        }}>{entry.icon || ""} {entry.type}</span>
        {entry.damage > 0 && (
          <span style={{ fontSize:11, fontWeight:700, color, fontFamily:"'Orbitron',monospace" }}>
            -{entry.damage}
          </span>
        )}
      </div>
      <p style={{ margin:0, fontSize:11, color:"#94a3b8", lineHeight:1.4 }}>{entry.narrative}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function AnimeArena() {
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [battleState, setBattleState] = useState("idle"); // idle | fighting | done
  const [hpA, setHpA] = useState(0);
  const [hpB, setHpB] = useState(0);
  const [manaA, setManaA] = useState(0);
  const [manaB, setManaB] = useState(0);
  const [shakeA, setShakeA] = useState(false);
  const [shakeB, setShakeB] = useState(false);
  const logRef = useRef(null);
  const timeoutsRef = useRef([]);

  const charA = selectedA;
  const charB = selectedB;

  const maxHPA = charA ? charA.attrs.endurance * 100 : 1000;
  const maxHPB = charB ? charB.attrs.endurance * 100 : 1000;
  const maxManaA = charA ? charA.attrs.aura * 10 : 1000;
  const maxManaB = charB ? charB.attrs.aura * 10 : 1000;

  const handleSelect = (character, slot) => {
    if (battleState === "fighting") return;
    if (slot === "a") {
      if (selectedB?.id === character.id) setSelectedB(null);
      setSelectedA(character);
    } else {
      if (selectedA?.id === character.id) setSelectedA(null);
      setSelectedB(character);
    }
    setBattleResult(null);
    setVisibleLogs([]);
    setBattleState("idle");
    timeoutsRef.current.forEach(clearTimeout);
  };

  const handleCardClick = (character, _slot) => {
    if (battleState === "fighting") return;
    if (!selectedA || selectedA.id === character.id) {
      handleSelect(character, "a");
    } else if (!selectedB || selectedB.id === character.id) {
      handleSelect(character, "b");
    } else {
      handleSelect(character, "a");
    }
  };

  const startBattle = useCallback(() => {
    if (!charA || !charB || battleState === "fighting") return;
    timeoutsRef.current.forEach(clearTimeout);

    setBattleState("fighting");
    setVisibleLogs([]);
    setHpA(maxHPA);
    setHpB(maxHPB);
    setManaA(maxManaA);
    setManaB(maxManaB);

    const result = simulateBattle(charA, charB);
    setBattleResult(result);

    // Stream logs with delays
    result.rounds.forEach((entry, i) => {
      const t = setTimeout(() => {
        setVisibleLogs(prev => [...prev, entry]);

        // Update HP/Mana bars
        if (entry.actorId === charA.id) {
          setHpB(entry.targetHP);
          setManaA(entry.actorMana ?? maxManaA);
          if (entry.damage > 0) { setShakeB(true); setTimeout(() => setShakeB(false), 400); }
        } else {
          setHpA(entry.targetHP);
          setManaB(entry.actorMana ?? maxManaB);
          if (entry.damage > 0) { setShakeA(true); setTimeout(() => setShakeA(false), 400); }
        }

        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;

        if (i === result.rounds.length - 1) setBattleState("done");
      }, i * 320);
      timeoutsRef.current.push(t);
    });
  }, [charA, charB, battleState, maxHPA, maxHPB, maxManaA, maxManaB]);

  const winner = battleResult ? (battleResult.winnerId === charA?.id ? charA : charB) : null;

  return (
    <div style={{
      minHeight:"100vh", background:"#050508",
      fontFamily:"'Rajdhani',sans-serif",
      color:"#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes pulseRing { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.02)} }
        @keyframes slideInLog { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes victoryPulse { 0%,100%{box-shadow:0 0 20px var(--accent),0 0 40px var(--accent)44} 50%{box-shadow:0 0 40px var(--accent),0 0 80px var(--accent)66} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes glitch {
          0%,100%{clip-path:inset(50% 0 30% 0)}
          20%{clip-path:inset(10% 0 60% 0)}
          40%{clip-path:inset(80% 0 5% 0)}
          60%{clip-path:inset(40% 0 40% 0)}
          80%{clip-path:inset(5% 0 80% 0)}
        }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
      `}</style>

      {/* Ambient scanline */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:9999,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)",
      }}/>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ height:1, width:60, background:"linear-gradient(90deg,transparent,#a855f7)" }}/>
            <span style={{ fontSize:10, fontFamily:"'Orbitron',monospace", letterSpacing:4, color:"#7c3aed" }}>POWER LEVEL: OVER 9000</span>
            <div style={{ height:1, width:60, background:"linear-gradient(90deg,#a855f7,transparent)" }}/>
          </div>
          <h1 style={{
            margin:"0 0 4px", fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(26px,4vw,48px)", fontWeight:900, letterSpacing:3,
            background:"linear-gradient(135deg, #e2e8f0, #a855f7, #06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            textTransform:"uppercase",
          }}>Shadow Arena</h1>
          <p style={{ margin:0, fontSize:12, color:"#475569", letterSpacing:2, fontFamily:"'Orbitron',monospace" }}>
            CHARACTER POWER SIMULATOR // SELECT · BATTLE · DOMINATE
          </p>
        </div>

        {/* Battle Arena */}
        {(charA || charB) && (
          <div style={{
            marginBottom:32, padding:20,
            background:"rgba(10,10,20,0.9)",
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:8, position:"relative", overflow:"hidden",
          }}>
            {/* Background glow */}
            {charA && <div style={{ position:"absolute", left:"20%", top:"50%", transform:"translate(-50%,-50%)", width:200, height:200, borderRadius:"50%", background:charA.glowColor, filter:"blur(60px)", opacity:0.3, pointerEvents:"none" }}/>}
            {charB && <div style={{ position:"absolute", right:"20%", top:"50%", transform:"translate(50%,-50%)", width:200, height:200, borderRadius:"50%", background:charB.glowColor, filter:"blur(60px)", opacity:0.3, pointerEvents:"none" }}/>}

            <div style={{ position:"relative", display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:16, alignItems:"start" }}>
              {/* Fighter A */}
              <div>
                <div style={{
                  padding:16, borderRadius:6, border:`1px solid ${charA ? charA.accent + "44" : "rgba(255,255,255,0.06)"}`,
                  background: charA ? `${charA.accent}08` : "rgba(255,255,255,0.02)",
                  animation: shakeA ? "shake 0.4s ease" : "none",
                }}>
                  {charA ? (
                    <>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                        <div style={{
                          width:44, height:44, borderRadius:6,
                          background:`${charA.accent}22`, border:`1px solid ${charA.accent}44`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:14, fontFamily:"'Orbitron',monospace", color:charA.accent, fontWeight:900,
                        }}>{charA.image}</div>
                        <div>
                          <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#f1f5f9", fontFamily:"'Rajdhani',sans-serif" }}>{charA.name}</p>
                          <p style={{ margin:0, fontSize:10, color:charA.accent }}>{charA.series}</p>
                        </div>
                        {battleState === "done" && winner?.id === charA.id && (
                          <div style={{ marginLeft:"auto", background:"#f59e0b", color:"#000", fontSize:9, fontWeight:700, fontFamily:"'Orbitron',monospace", padding:"3px 10px", borderRadius:2, letterSpacing:1.5 }}>VICTOR</div>
                        )}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <BattleBar current={hpA || maxHPA} max={maxHPA} color={charA.accent} label="HP"/>
                        <BattleBar current={manaA || maxManaA} max={maxManaA} color="#a855f7" label="Mana"/>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign:"center", padding:"20px 0" }}>
                      <p style={{ margin:0, fontSize:12, color:"#334155", fontFamily:"'Orbitron',monospace", letterSpacing:2 }}>SELECT FIGHTER 1</p>
                    </div>
                  )}
                </div>
              </div>

              {/* VS + Battle Button */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, paddingTop:8 }}>
                <div style={{
                  fontFamily:"'Orbitron',monospace", fontSize:28, fontWeight:900, letterSpacing:2,
                  background:"linear-gradient(135deg,#7c3aed,#06b6d4)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                }}>VS</div>
                <button
                  onClick={startBattle}
                  disabled={!charA || !charB || battleState === "fighting"}
                  style={{
                    padding:"10px 20px", fontFamily:"'Orbitron',monospace", fontSize:10,
                    fontWeight:700, letterSpacing:2, border:"none", borderRadius:4, cursor: (!charA||!charB||battleState==="fighting") ? "not-allowed" : "pointer",
                    background: (!charA||!charB||battleState==="fighting")
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    color: (!charA||!charB||battleState==="fighting") ? "#334155" : "#fff",
                    transition:"all 0.2s",
                    boxShadow: (charA&&charB&&battleState!=="fighting") ? "0 0 20px rgba(124,58,237,0.4)" : "none",
                    whiteSpace:"nowrap",
                  }}
                >
                  {battleState === "fighting" ? "⚡ BATTLING..." : battleState === "done" ? "↻ REMATCH" : "⚔ BATTLE"}
                </button>
              </div>

              {/* Fighter B */}
              <div>
                <div style={{
                  padding:16, borderRadius:6, border:`1px solid ${charB ? charB.accent + "44" : "rgba(255,255,255,0.06)"}`,
                  background: charB ? `${charB.accent}08` : "rgba(255,255,255,0.02)",
                  animation: shakeB ? "shake 0.4s ease" : "none",
                }}>
                  {charB ? (
                    <>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                        <div style={{
                          width:44, height:44, borderRadius:6,
                          background:`${charB.accent}22`, border:`1px solid ${charB.accent}44`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:14, fontFamily:"'Orbitron',monospace", color:charB.accent, fontWeight:900,
                        }}>{charB.image}</div>
                        <div>
                          <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#f1f5f9", fontFamily:"'Rajdhani',sans-serif" }}>{charB.name}</p>
                          <p style={{ margin:0, fontSize:10, color:charB.accent }}>{charB.series}</p>
                        </div>
                        {battleState === "done" && winner?.id === charB.id && (
                          <div style={{ marginLeft:"auto", background:"#f59e0b", color:"#000", fontSize:9, fontWeight:700, fontFamily:"'Orbitron',monospace", padding:"3px 10px", borderRadius:2, letterSpacing:1.5 }}>VICTOR</div>
                        )}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <BattleBar current={hpB || maxHPB} max={maxHPB} color={charB.accent} label="HP"/>
                        <BattleBar current={manaB || maxManaB} max={maxManaB} color="#a855f7" label="Mana"/>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign:"center", padding:"20px 0" }}>
                      <p style={{ margin:0, fontSize:12, color:"#334155", fontFamily:"'Orbitron',monospace", letterSpacing:2 }}>SELECT FIGHTER 2</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Combat log */}
            {visibleLogs.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background: battleState==="fighting" ? "#22c55e" : "#f59e0b", boxShadow:`0 0 6px ${battleState==="fighting"?"#22c55e":"#f59e0b"}`, animation: battleState==="fighting"?"pulseRing 1s infinite":"none" }}/>
                  <span style={{ fontSize:9, fontFamily:"'Orbitron',monospace", letterSpacing:2, color:"#475569" }}>COMBAT LOG — ROUND {visibleLogs[visibleLogs.length-1]?.round || 1}</span>
                </div>
                <div ref={logRef} style={{
                  maxHeight:180, overflowY:"auto", display:"flex", flexDirection:"column", gap:2,
                  padding:"8px", background:"rgba(0,0,0,0.3)", borderRadius:6,
                  border:"1px solid rgba(255,255,255,0.04)",
                }}>
                  {visibleLogs.map((entry, i) => (
                    <LogEntry key={i} entry={entry} charA={charA} charB={charB}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!charA && !charB && (
          <div style={{ textAlign:"center", marginBottom:24, padding:"12px", background:"rgba(124,58,237,0.06)", borderRadius:6, border:"1px solid rgba(124,58,237,0.15)" }}>
            <p style={{ margin:0, fontSize:12, color:"#7c3aed", fontFamily:"'Orbitron',monospace", letterSpacing:2 }}>
              ↓ SELECT TWO CHARACTERS TO BEGIN — FIRST CLICK = FIGHTER 1, SECOND = FIGHTER 2
            </p>
          </div>
        )}

        {/* Character Grid */}
        <div style={{ marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ height:1, flex:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06))" }}/>
          <span style={{ fontSize:9, fontFamily:"'Orbitron',monospace", letterSpacing:3, color:"#334155" }}>CHARACTER ROSTER</span>
          <div style={{ height:1, flex:1, background:"linear-gradient(90deg,rgba(255,255,255,0.06),transparent)" }}/>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
          gap:14,
        }}>
          {CHARACTERS.map(char => {
            const slot = selectedA?.id === char.id ? "a" : selectedB?.id === char.id ? "b" : null;
            return (
              <CharacterCard
                key={char.id}
                character={char}
                selected={!!slot}
                slot={slot}
                onSelect={handleCardClick}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:40, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ margin:0, fontSize:9, color:"#1e293b", fontFamily:"'Orbitron',monospace", letterSpacing:3 }}>
            SHADOW ARENA v1.0.0 // ANIME FAN ENGAGEMENT PLATFORM // GO + REACT
          </p>
        </div>
      </div>
    </div>
  );
}
