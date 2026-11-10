import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PlatformHeader from "../components/PlatformHeader";

const API = "/api/v1";

const CHARACTERS = [
  { id:"sung-jinwoo", name:"Sung Jin-Woo", series:"Solo Leveling",   tier:"GOD", accent:"#7c3aed", sprite:"/characters/sung-jinwoo.png", image:"SJW",
    attrs:{ strength:9800, speed:9700, defense:8500, intelligence:8000, endurance:9000, aura:9500 }, critRate:75, evasion:60 },
  { id:"gojo-satoru", name:"Gojo Satoru",  series:"Jujutsu Kaisen",  tier:"GOD", accent:"#06b6d4", sprite:"/characters/gojo-satoru.png", image:"GJK",
    attrs:{ strength:9200, speed:9500, defense:9900, intelligence:9800, endurance:9000, aura:9800 }, critRate:55, evasion:80 },
  { id:"madara",      name:"Madara Uchiha",series:"Naruto",           tier:"S",   accent:"#dc2626", sprite:"/characters/Madara-Uchiha.png",      image:"MDR",
    attrs:{ strength:9600, speed:9200, defense:8500, intelligence:9700, endurance:9500, aura:8000 }, critRate:80, evasion:60 },
  { id:"ichigo",      name:"Ichigo Kurosaki",series:"Bleach",         tier:"S",   accent:"#f97316", sprite:"/characters/Ichigo-Kurosaki.png",      image:"ICH",
    attrs:{ strength:9300, speed:9400, defense:8000, intelligence:7800, endurance:9500, aura:9200 }, critRate:60, evasion:62 },
  { id:"zoro",        name:"Roronoa Zoro", series:"One Piece",        tier:"S",   accent:"#16a34a", sprite:"/characters/zoro.png",        image:"ZRO",
    attrs:{ strength:8350, speed:8000, defense:8300, intelligence:7000, endurance:9500, aura:8000 }, critRate:80, evasion:55 },
  { id:"levi",        name:"Levi Ackermann",series:"Attack on Titan", tier:"A",   accent:"#f59e0b", sprite:"/characters/Levi-Ackermann.png",        image:"LVI",
    attrs:{ strength:8500, speed:9000, defense:7500, intelligence:8800, endurance:8200, aura:7000 }, critRate:85, evasion:90 },
];

const TIER_COLORS = { GOD:"#a855f7", S:"#f59e0b", A:"#22d3ee", B:"#4ade80", C:"#94a3b8" };

function powerTotal(attrs, critRate, evasion) {
  return attrs.strength + attrs.speed + attrs.defense + attrs.intelligence +
    attrs.endurance + attrs.aura + critRate * 10 + evasion * 5;
}

function StatMini({ label, value, max = 10000, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
      <span style={{ fontSize:9, color:"#475569", fontFamily:"'Orbitron',monospace", letterSpacing:1, width:28 }}>{label}</span>
      <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, boxShadow:`0 0 4px ${color}88` }}/>
      </div>
      <span style={{ fontSize:9, color, fontFamily:"'Orbitron',monospace", width:36, textAlign:"right" }}>{value}</span>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [entries, setEntries]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [filter, setFilter]         = useState("ALL");
  const [sortBy, setSortBy]         = useState("power");

  useEffect(() => {
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(data => {
        // If backend returns empty, build from local character data
        const backendEntries = data.entries || [];
        if (backendEntries.length === 0) {
          const local = CHARACTERS.map((c, i) => ({
            rank: i + 1,
            character: c,
            power_total: powerTotal(c.attrs, c.critRate, c.evasion),
            win_rate: 0,
            total_battles: 0,
          })).sort((a, b) => b.power_total - a.power_total)
            .map((e, i) => ({ ...e, rank: i + 1 }));
          setEntries(local);
        } else {
          setEntries(backendEntries);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local data if API is down
        const local = CHARACTERS.map((c, i) => ({
          rank: i + 1,
          character: c,
          power_total: powerTotal(c.attrs, c.critRate, c.evasion),
          win_rate: 0,
          total_battles: 0,
        })).sort((a, b) => b.power_total - a.power_total)
          .map((e, i) => ({ ...e, rank: i + 1 }));
        setEntries(local);
        setLoading(false);
      });
  }, []);

  const tiers = ["ALL", "GOD", "S", "A"];

  const filtered = entries
    .filter(e => filter === "ALL" || e.character.tier === filter)
    .sort((a, b) => sortBy === "power" ? b.power_total - a.power_total : b.win_rate - a.win_rate)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const rankColors = { 1:"#f59e0b", 2:"#94a3b8", 3:"#b45309" };

  return (
    <div style={{ minHeight:"100vh", background:"#050508", color:"#e2e8f0", fontFamily:"'Rajdhani',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes pulseGlow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .lb-row:hover { background:rgba(255,255,255,0.04) !important; cursor:pointer; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
      `}</style>

      {/* Scanline */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)" }}/>

      <PlatformHeader />

      <div style={{ maxWidth:1300, margin:"0 auto", padding:"32px 20px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:12 }}>
            <div style={{ height:1, width:40, background:"linear-gradient(90deg,transparent,#f59e0b)" }}/>
            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:4, color:"#f59e0b" }}>POWER RANKINGS</span>
            <div style={{ height:1, width:40, background:"linear-gradient(90deg,#f59e0b,transparent)" }}/>
          </div>
          <h1 style={{
            margin:"0 0 8px", fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(24px,4vw,48px)", fontWeight:900, letterSpacing:3,
            background:"linear-gradient(135deg,#f59e0b,#e2e8f0,#a855f7)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>LEADERBOARD</h1>
          <p style={{ margin:0, fontSize:11, color:"#475569", fontFamily:"'Orbitron',monospace", letterSpacing:2 }}>
            RANKED BY POWER TOTAL // {CHARACTERS.length} FIGHTERS
          </p>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          {/* Tier filter */}
          <div style={{ display:"flex", gap:6 }}>
            {tiers.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2,
                padding:"6px 14px", borderRadius:4, border:"none", cursor:"pointer",
                background: filter === t
                  ? (t === "ALL" ? "rgba(124,58,237,0.2)" : `${TIER_COLORS[t]}22`)
                  : "rgba(255,255,255,0.03)",
                color: filter === t
                  ? (t === "ALL" ? "#a855f7" : TIER_COLORS[t])
                  : "#334155",
                borderBottom: filter === t
                  ? `1px solid ${t === "ALL" ? "#7c3aed" : TIER_COLORS[t]}`
                  : "1px solid transparent",
                transition:"all 0.2s",
              }}>{t === "ALL" ? "ALL TIERS" : `${t} TIER`}</button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display:"flex", gap:6 }}>
            {[["power","POWER"], ["win_rate","WIN RATE"]].map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key)} style={{
                fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2,
                padding:"6px 14px", borderRadius:4, border:"none", cursor:"pointer",
                background: sortBy === key ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                color: sortBy === key ? "#a855f7" : "#334155",
                borderBottom: sortBy === key ? "1px solid #7c3aed" : "1px solid transparent",
                transition:"all 0.2s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:11, color:"#334155", letterSpacing:3 }}>LOADING RANKINGS...</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap:20, alignItems:"start" }}>

            {/* Rankings table */}
            <div style={{ background:"rgba(10,10,20,0.8)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:8, overflow:"hidden" }}>
              {/* Table header */}
              <div style={{
                display:"grid", gridTemplateColumns:"52px 1fr 120px 100px 100px",
                padding:"10px 20px",
                background:"rgba(255,255,255,0.02)",
                borderBottom:"1px solid rgba(255,255,255,0.05)",
              }}>
                {["RANK","FIGHTER","POWER","WIN RATE","BATTLES"].map(h => (
                  <span key={h} style={{ fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:2, color:"#334155" }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {filtered.map((entry, i) => {
                const c = entry.character;
                const isSelected = selected?.character?.id === c.id;
                const rankColor = rankColors[entry.rank] || "#334155";
                return (
                  <div
                    key={c.id}
                    className="lb-row"
                    onClick={() => setSelected(isSelected ? null : entry)}
                    style={{
                      display:"grid", gridTemplateColumns:"52px 1fr 120px 100px 100px",
                      padding:"14px 20px",
                      borderBottom:"1px solid rgba(255,255,255,0.03)",
                      background: isSelected ? `${c.accent}08` : "transparent",
                      borderLeft: isSelected ? `2px solid ${c.accent}` : "2px solid transparent",
                      transition:"all 0.2s",
                      animation:`fadeUp 0.4s ease ${i * 0.06}s both`,
                    }}
                  >
                    {/* Rank */}
                    <div style={{ display:"flex", alignItems:"center" }}>
                      {entry.rank <= 3 ? (
                        <div style={{
                          width:28, height:28, borderRadius:"50%",
                          background:`${rankColor}22`, border:`1px solid ${rankColor}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:900, color:rankColor,
                          boxShadow:`0 0 10px ${rankColor}44`,
                        }}>{entry.rank}</div>
                      ) : (
                        <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, color:"#334155", paddingLeft:6 }}>#{entry.rank}</span>
                      )}
                    </div>

                    {/* Fighter */}
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      {/* Avatar */}
                      <div style={{
                        width:44, height:44, borderRadius:6, overflow:"hidden",
                        background:`${c.accent}18`, border:`1px solid ${c.accent}33`,
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        {c.sprite ? (
                          <img src={c.sprite} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"contain", filter:`drop-shadow(0 0 6px ${c.accent})` }}/>
                        ) : (
                          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, color:c.accent, fontWeight:900 }}>{c.image}</span>
                        )}
                      </div>
                      <div>
                        <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:700, color:"#f1f5f9", fontFamily:"'Rajdhani',sans-serif" }}>{c.name}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:10, color:"#475569" }}>{c.series}</span>
                          <span style={{
                            fontSize:8, fontFamily:"'Orbitron',monospace", letterSpacing:1,
                            color: TIER_COLORS[c.tier], padding:"1px 5px",
                            border:`1px solid ${TIER_COLORS[c.tier]}44`, borderRadius:2,
                          }}>{c.tier}</span>
                        </div>
                      </div>
                    </div>

                    {/* Power total */}
                    <div style={{ display:"flex", alignItems:"center" }}>
                      <div>
                        <p style={{ margin:"0 0 2px", fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, color: c.accent }}>
                          {entry.power_total.toLocaleString()}
                        </p>
                        <div style={{ height:3, width:80, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                          <div style={{
                            height:"100%",
                            width:`${Math.min(100,(entry.power_total / 120000) * 100)}%`,
                            background:`linear-gradient(90deg,${c.accent}88,${c.accent})`,
                            borderRadius:2,
                          }}/>
                        </div>
                      </div>
                    </div>

                    {/* Win rate */}
                    <div style={{ display:"flex", alignItems:"center" }}>
                      <span style={{
                        fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700,
                        color: entry.win_rate > 0.5 ? "#22c55e" : entry.win_rate > 0 ? "#f59e0b" : "#334155",
                      }}>
                        {entry.total_battles > 0 ? `${(entry.win_rate * 100).toFixed(1)}%` : "—"}
                      </span>
                    </div>

                    {/* Battles */}
                    <div style={{ display:"flex", alignItems:"center" }}>
                      <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, color:"#475569" }}>
                        {entry.total_battles || "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{
                background:"rgba(10,10,20,0.9)",
                border:`1px solid ${selected.character.accent}33`,
                borderRadius:8, padding:24, position:"sticky", top:80,
                animation:"fadeUp 0.3s ease",
              }}>
                {/* Close */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2, color:"#334155" }}>CHARACTER PROFILE</span>
                  <span onClick={() => setSelected(null)} style={{ cursor:"pointer", color:"#334155", fontSize:16, lineHeight:1 }}>✕</span>
                </div>

                {/* Sprite */}
                <div style={{
                  width:"100%", height:200, borderRadius:6, marginBottom:16,
                  background:`linear-gradient(135deg,${selected.character.accent}11,${selected.character.accent}22)`,
                  border:`1px solid ${selected.character.accent}33`,
                  display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
                }}>
                  {selected.character.sprite ? (
                    <img src={selected.character.sprite} alt={selected.character.name} style={{
                      maxHeight:"100%", maxWidth:"100%", objectFit:"contain",
                      filter:`drop-shadow(0 0 20px ${selected.character.accent}88)`,
                    }}/>
                  ) : (
                    <span style={{ fontFamily:"'Orbitron',monospace", fontSize:64, fontWeight:900, color:selected.character.accent }}>{selected.character.image}</span>
                  )}
                </div>

                {/* Tier badge */}
                <div style={{ marginBottom:8 }}>
                  <span style={{
                    fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2,
                    color: TIER_COLORS[selected.character.tier],
                    padding:"3px 10px", border:`1px solid ${TIER_COLORS[selected.character.tier]}44`,
                    borderRadius:2, background:`${TIER_COLORS[selected.character.tier]}11`,
                  }}>{selected.character.tier} TIER</span>
                </div>

                <h2 style={{ margin:"0 0 2px", fontFamily:"'Rajdhani',sans-serif", fontSize:22, fontWeight:700, color:"#f1f5f9" }}>{selected.character.name}</h2>
                <p style={{ margin:"0 0 16px", fontSize:11, color:selected.character.accent, fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:1 }}>{selected.character.series}</p>

                {/* Power total */}
                <div style={{ padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:6, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2, color:"#475569" }}>POWER TOTAL</span>
                  <span style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:900, color:selected.character.accent }}>{selected.power_total.toLocaleString()}</span>
                </div>

                {/* Stats */}
                <div style={{ marginBottom:16 }}>
                  <StatMini label="STR"  value={selected.character.attrs.strength}     color="#ef4444"/>
                  <StatMini label="SPD"  value={selected.character.attrs.speed}        color="#06b6d4"/>
                  <StatMini label="DEF"  value={selected.character.attrs.defense}      color="#22c55e"/>
                  <StatMini label="INT"  value={selected.character.attrs.intelligence} color="#a855f7"/>
                  <StatMini label="END"  value={selected.character.attrs.endurance}    color="#f59e0b"/>
                  <StatMini label="AURA" value={selected.character.attrs.aura}         color={selected.character.accent}/>
                </div>

                {/* Fight button */}
                <button onClick={() => navigate("/battle")} style={{
                  width:"100%", padding:"12px", fontFamily:"'Orbitron',monospace",
                  fontSize:11, fontWeight:700, letterSpacing:3,
                  background:`linear-gradient(135deg,${selected.character.accent},${selected.character.accent}88)`,
                  color:"#fff", border:"none", borderRadius:4, cursor:"pointer",
                  boxShadow:`0 0 20px ${selected.character.accent}44`,
                }}>⚔ FIGHT WITH {selected.character.name.toUpperCase()}</button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:40, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ margin:0, fontSize:9, color:"#1e293b", fontFamily:"'Orbitron',monospace", letterSpacing:3 }}>
            SHADOW ARENA v1.0.0 // POWER RANKINGS // GO + REACT
          </p>
        </div>
      </div>
    </div>
  );
}