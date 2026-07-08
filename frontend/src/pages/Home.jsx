import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Application, Graphics } from "pixi.js";

// ── Character data ──────────────────────────────────────────────
const CHARACTERS = [
  { id:"sung-jinwoo", name:"Sung Jin-Woo", series:"Solo Leveling",   tier:"GOD", accent:"#7c3aed", sprite:"/characters/sung-jinwoo.png", image:"SJW", tagline:"I alone level up." },
  { id:"gojo-satoru", name:"Gojo Satoru",  series:"Jujutsu Kaisen",  tier:"GOD", accent:"#06b6d4", sprite:"/characters/gojo-satoru.png", image:"GJK", tagline:"Throughout Heaven and Earth, I alone am the honored one." },
  { id:"madara",      name:"Madara Uchiha",series:"Naruto",           tier:"S",   accent:"#dc2626", sprite:"/characters/Madara-Uchiha.png",      image:"MDR", tagline:"Wake up to reality." },
  { id:"ichigo",      name:"Ichigo Kurosaki",series:"Bleach",         tier:"S",   accent:"#f97316", sprite:"/characters/Ichigo-Kurosaki.png",      image:"ICH", tagline:"If fate is a millstone, we are the grist." },
  { id:"zoro",        name:"Roronoa Zoro", series:"One Piece",        tier:"S",   accent:"#16a34a", sprite:"/characters/zoro.png",        image:"ZRO", tagline:"Nothing happened." },
  { id:"levi",        name:"Levi Ackermann",series:"Attack on Titan", tier:"A",   accent:"#f59e0b", sprite:"/characters/Levi-Ackermann.png",        image:"LVI", tagline:"Give up on your dreams and die." },
];

const TIER_COLORS = { GOD:"#a855f7", S:"#f59e0b", A:"#22d3ee" };

// ── Cinematic intro sequence ────────────────────────────────────
function CinematicIntro({ onComplete }) {
  const [phase, setPhase]     = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleText, setSubtitleText] = useState("");
  const [enterVisible, setEnterVisible] = useState(false);
  const [flash, setFlash]     = useState(false);

  const SUBTITLE = "SELECT YOUR FIGHTER. CLAIM THE THRONE.";
  useEffect(() => {
    if (phase !== 2) return;
    const delay = setTimeout(() => {
      const handler = () => onComplete();
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, 1000);
    return () => clearTimeout(delay);
  }, [phase, onComplete]);

  useEffect(() => {
    // Phase 0 → Phase 1 after 600ms
    const t = setTimeout(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      setPhase(1);
    }, 600);
    return () => clearTimeout(t);
  }, []); // runs once only

  useEffect(() => {
    if (phase !== 1) return;
    // Cycle through all characters then move to phase 2
    let idx = 0;
    const t = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 80);
      setCharIdx(idx);
      idx++;
      if (idx >= CHARACTERS.length) {
        clearInterval(t);
        setPhase(2);
      }
    }, 350);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 2) return;
    setTitleVisible(true);
    setSubtitleText("");

    let i = 0;
    const t = setInterval(() => {
      i++;
      setSubtitleText(SUBTITLE.slice(0, i));
      if (i >= SUBTITLE.length) {
        clearInterval(t);
        setEnterVisible(true);
      }
    }, 45);

    // Hard fallback
    const fallback = setTimeout(() => setEnterVisible(true), 4000);

    return () => {
      clearInterval(t);
      clearTimeout(fallback);
    };
  }, [phase]); // only runs when phase becomes 2

  useEffect(() => {
    if (phase !== 2) return;
    setTitleVisible(true);
    setSubtitleText("");

    let i = 0;
    const t = setInterval(() => {
      i++;
      setSubtitleText(SUBTITLE.slice(0, i));
      if (i >= SUBTITLE.length) {
        clearInterval(t);
        setEnterVisible(true);
      }
    }, 45);

    // Hard fallback — always show button after 3s
    const fallback = setTimeout(() => setEnterVisible(true), 3000);

    return () => {
      clearInterval(t);
      clearTimeout(fallback);
    };
  }, [phase]);

  const char = CHARACTERS[charIdx];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10000,
      background:"#000",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
        @keyframes titleSlam {
          0%   { transform:scale(2.5) translateY(-40px); opacity:0; filter:blur(20px); }
          60%  { transform:scale(0.95) translateY(4px);  opacity:1; filter:blur(0); }
          80%  { transform:scale(1.03); }
          100% { transform:scale(1) translateY(0); }
        }
        @keyframes shockwave {
          0%   { transform:scale(0); opacity:0.8; }
          100% { transform:scale(4); opacity:0; }
        }
        @keyframes charSlash {
          0%   { transform:translateX(-120%) skewX(-20deg); opacity:0; }
          30%  { opacity:1; }
          70%  { opacity:1; }
          100% { transform:translateX(120%) skewX(-20deg); opacity:0; }
        }
        @keyframes enterPulse {
          0%,100% { box-shadow: 0 0 20px #7c3aed, 0 0 40px #7c3aed44; }
          50%     { box-shadow: 0 0 40px #7c3aed, 0 0 80px #7c3aed88; }
        }
        @keyframes scanDown {
          0%   { transform:translateY(-100%); }
          100% { transform:translateY(100vh); }
        }
      `}</style>

      {/* Flash overlay */}
      {flash && (
        <div style={{
          position:"absolute", inset:0, zIndex:5,
          background: char.accent,
          opacity:0.15,
          pointerEvents:"none",
        }}/>
      )}

      {/* Ambient glow */}
      <div style={{
        position:"absolute", width:600, height:600, borderRadius:"50%",
        background: char.accent,
        filter:"blur(120px)", opacity:0.08,
        transition:"background 0.3s",
        pointerEvents:"none",
      }}/>

      {/* Scanline */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)",
        zIndex:2,
      }}/>

      {/* Phase 1 — character flash */}
      {phase === 1 && (
        <div style={{
          position:"absolute", inset:0, display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:3,
        }}>
          {/* Character image or code */}
          <div style={{
            animation:"charSlash 0.32s ease-out",
            display:"flex", flexDirection:"column", alignItems:"center", gap:16,
          }}>
            {char.sprite ? (
              <img src={char.sprite} alt={char.name} style={{
                height:360, objectFit:"contain",
                filter:`drop-shadow(0 0 40px ${char.accent}) drop-shadow(0 0 80px ${char.accent}88)`,
              }}/>
            ) : (
              <div style={{
                fontFamily:"'Orbitron',monospace", fontSize:120, fontWeight:900,
                color:char.accent, textShadow:`0 0 60px ${char.accent}`,
              }}>{char.image}</div>
            )}
            <div style={{
              fontFamily:"'Orbitron',monospace", fontSize:11, letterSpacing:6,
              color:char.accent, opacity:0.8,
            }}>{char.name.toUpperCase()}</div>
          </div>

          {/* Slash lines */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            background:`linear-gradient(135deg, transparent 40%, ${char.accent}22 50%, transparent 60%)`,
            animation:"charSlash 0.32s ease-out",
          }}/>
        </div>
      )}

      {/* Phase 2 — title */}
      {phase === 2 && (
        <div style={{ textAlign:"center", zIndex:4, position:"relative" }}>
          {/* Shockwave */}
          {titleVisible && (
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              width:200, height:200,
              marginLeft:-100, marginTop:-100,
              borderRadius:"50%",
              border:`2px solid #a855f7`,
              animation:"shockwave 0.8s ease-out forwards",
              pointerEvents:"none",
              zIndex:-1,
            }}/>
          )}

          <div style={{
            fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(36px,7vw,88px)",
            fontWeight:900, letterSpacing:6,
            background:"linear-gradient(135deg, #ffffff 0%, #a855f7 40%, #06b6d4 70%, #ffffff 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            animation: titleVisible ? "titleSlam 0.7s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
            opacity: titleVisible ? 1 : 0,
            marginBottom:8,
            textTransform:"uppercase",
          }}>
            SHADOW<br/>ARENA
          </div>

          <div style={{
            fontFamily:"'Orbitron',monospace", fontSize:11, letterSpacing:4,
            color:"#475569", marginBottom:48, minHeight:20,
          }}>
            {subtitleText}<span style={{ opacity: subtitleText.length < SUBTITLE.length ? 1 : 0, color:"#7c3aed" }}>|</span>
          </div>

          <button
            onClick={onComplete}
            style={{
              fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, letterSpacing:4,
              padding:"16px 48px",
              background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
              color:"#fff", border:"none", borderRadius:4, cursor:"pointer",
              animation: enterVisible ? "enterPulse 2s ease-in-out infinite" : "none",
              opacity: enterVisible ? 1 : 0,
              transition:"opacity 0.8s ease",
              pointerEvents: enterVisible ? "auto" : "none",
              display:"block", margin:"0 auto",
            }}
          >
            ⚔ ENTER THE ARENA
          </button>
          {enterVisible && (
            <p style={{
              marginTop:16, fontFamily:"'Orbitron',monospace", fontSize:9,
              letterSpacing:3, color:"#334155", textAlign:"center",
            }}>
              CLICK BUTTON OR PRESS ANY KEY
            </p>
          )}

          {/* Character silhouettes bottom */}
          <div style={{
            position:"fixed", bottom:0, left:0, right:0,
            display:"flex", justifyContent:"space-around", alignItems:"flex-end",
            padding:"0 40px", pointerEvents:"none", zIndex:1,
            opacity:0.15,
          }}>
            {CHARACTERS.map((c, i) => (
              <div key={c.id} style={{
                height:200,
                display:"flex", alignItems:"flex-end",
              }}>
                {c.sprite ? (
                  <img src={c.sprite} alt="" style={{
                    height:"100%", objectFit:"contain",
                    filter:`drop-shadow(0 0 10px ${c.accent})`,
                    transform:`scaleX(${i % 2 === 0 ? 1 : -1})`,
                  }}/>
                ) : (
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:24, color:c.accent }}>{c.image}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 0 — initial black */}
      {phase === 0 && (
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, letterSpacing:4, color:"#1e293b" }}>
          INITIALIZING...
        </div>
      )}
    </div>
  );
}

// ── PixiJS particle background ──────────────────────────────────
function ParticleBackground({ accentColor }) {
  const canvasRef = useRef(null);
  const appRef    = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let app;
    try {
      app = new Application({
        view: canvasRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: 1,
        autoDensity: true,
      });
      appRef.current = app;
    } catch(e) {
      console.warn("PixiJS failed to init:", e);
      return;
    }

    const particles = [];
    const count = 80;

    // Parse accent color to number
    const colorNum = parseInt((accentColor || "#7c3aed").replace("#",""), 16);

    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const size = Math.random() * 2.5 + 0.5;
      const alpha = Math.random() * 0.4 + 0.1;
      g.beginFill(colorNum, alpha);
      g.drawCircle(0, 0, size);
      g.endFill();
      g.x = Math.random() * app.screen.width;
      g.y = Math.random() * app.screen.height;
      const speed = Math.random() * 0.4 + 0.1;
      const drift = (Math.random() - 0.5) * 0.3;
      particles.push({ g, speed, drift, alpha });
      app.stage.addChild(g);
    }

    // Energy lines
    const lines = [];
    for (let i = 0; i < 6; i++) {
      const g = new Graphics();
      lines.push({
        g,
        x1: Math.random() * app.screen.width,
        y1: Math.random() * app.screen.height,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
        life: Math.random(),
        maxLife: Math.random() * 120 + 60,
      });
      app.stage.addChild(g);
    }

    app.ticker.add(() => {
      // Animate particles
      particles.forEach(p => {
        p.g.y -= p.speed;
        p.g.x += p.drift;
        if (p.g.y < -10) {
          p.g.y = app.screen.height + 10;
          p.g.x = Math.random() * app.screen.width;
        }
        if (p.g.x < -10 || p.g.x > app.screen.width + 10) {
          p.g.x = Math.random() * app.screen.width;
        }
        p.g.alpha = p.alpha * (0.7 + 0.3 * Math.sin(Date.now() * 0.001 + p.g.x));
      });

      // Animate energy lines
      lines.forEach(l => {
        l.life++;
        const progress = l.life / l.maxLife;
        const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        const len = 60 + Math.sin(l.life * 0.05) * 20;
        l.g.clear();
        l.g.lineStyle(0.8, colorNum, alpha * 0.3);
        l.g.moveTo(l.x1, l.y1);
        l.g.lineTo(
          l.x1 + Math.cos(l.angle) * len,
          l.y1 + Math.sin(l.angle) * len
        );
        l.x1 += Math.cos(l.angle) * l.speed;
        l.y1 += Math.sin(l.angle) * l.speed;
        if (l.life >= l.maxLife) {
          l.life = 0;
          l.x1 = Math.random() * app.screen.width;
          l.y1 = Math.random() * app.screen.height;
          l.angle = Math.random() * Math.PI * 2;
        }
      });
    });

    const handleResize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      app.destroy(false);
    };
  }, [accentColor]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
    }}/>
  );
}

// ── Character showcase card ─────────────────────────────────────
function ShowcaseCard({ char, index, onHover }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => { setHovered(true); onHover(char); }}
      onMouseLeave={() => { setHovered(false); onHover(null); }}
      style={{
        position:"relative", cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center",
        transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "translateY(-16px) scale(1.05)" : "translateY(0) scale(1)",
        animation:`floatIn 0.6s ease ${index * 0.1}s both`,
      }}
    >
      <style>{`
        @keyframes floatIn {
          from { opacity:0; transform:translateY(40px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes idleFloat {
          0%,100% { transform:translateY(0px); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes auraExpand {
          0%   { transform:scale(0.8); opacity:0; }
          100% { transform:scale(1.2); opacity:0; }
        }
      `}</style>

      {/* Aura glow on hover */}
      {hovered && (
        <>
          <div style={{
            position:"absolute", inset:-20, borderRadius:"50%",
            background: char.accent,
            filter:"blur(40px)", opacity:0.25,
            animation:"auraExpand 1s ease-in-out infinite",
            pointerEvents:"none",
          }}/>
          <div style={{
            position:"absolute", inset:0, borderRadius:8,
            border:`1px solid ${char.accent}66`,
            pointerEvents:"none",
          }}/>
        </>
      )}

      {/* Character image */}
      <div style={{
        height:180, display:"flex", alignItems:"flex-end",
        animation: hovered ? "none" : `idleFloat ${3 + index * 0.3}s ease-in-out infinite`,
      }}>
        {char.sprite ? (
          <img src={char.sprite} alt={char.name} style={{
            height:"100%", objectFit:"contain",
            filter: hovered
              ? `drop-shadow(0 0 20px ${char.accent}) drop-shadow(0 0 40px ${char.accent}88)`
              : `drop-shadow(0 0 8px ${char.accent}44)`,
            transition:"filter 0.3s",
          }}/>
        ) : (
          <div style={{
            fontFamily:"'Orbitron',monospace", fontSize:36, fontWeight:900,
            color:char.accent, textShadow:`0 0 20px ${char.accent}`,
            width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center",
            background:`${char.accent}11`, borderRadius:8,
            border:`1px solid ${char.accent}33`,
          }}>{char.image}</div>
        )}
      </div>

      {/* Name + tier */}
      <div style={{ textAlign:"center", marginTop:8, padding:"0 4px" }}>
        <div style={{
          fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:2,
          color: TIER_COLORS[char.tier] || "#94a3b8", marginBottom:3,
        }}>{char.tier}</div>
        <div style={{
          fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700,
          color: hovered ? "#f1f5f9" : "#64748b",
          transition:"color 0.2s", whiteSpace:"nowrap",
        }}>{char.name}</div>
      </div>
    </div>
  );
}

// ── Main Home ───────────────────────────────────────────────────
export default function Home() {
  const navigate        = useNavigate();
  const [showIntro, setShowIntro]     = useState(true);
  const [hoveredChar, setHoveredChar] = useState(null);
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [counters, setCounters]       = useState({ power:0, fighters:0, universes:0 });
  const [pixiReady, setPixiReady]     = useState(false);

  // Update background accent when character is hovered
  useEffect(() => {
    if (hoveredChar) setAccentColor(hoveredChar.accent);
    else setAccentColor("#7c3aed");
  }, [hoveredChar]);

  // Animate counters on load
  useEffect(() => {
    if (showIntro) return;
    const duration = 1800;
    const start = Date.now();
    const targets = { power:9800, fighters:6, universes:6 };
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        power:   Math.floor(ease * targets.power),
        fighters:Math.floor(ease * targets.fighters),
        universes:Math.floor(ease * targets.universes),
      });
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [showIntro]);

  if (showIntro) return <CinematicIntro onComplete={() => {
    setShowIntro(false);
    setTimeout(() => setPixiReady(true), 100);
  }}/>;

  return (
    <div style={{
      minHeight:"100vh", background:"#050508",
      color:"#e2e8f0", fontFamily:"'Rajdhani',sans-serif",
      overflowX:"hidden", position:"relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes pulseGlow{ 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes gradShift{
          0%  { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100%{ background-position: 0% 50%; }
        }
        @keyframes scanline {
          0%   { transform:translateY(-100%); opacity:0.06; }
          100% { transform:translateY(100vh); opacity:0.06; }
        }
        .nav-link { font-family:'Orbitron',monospace; font-size:10px; letter-spacing:2px; color:#475569; text-decoration:none; transition:color 0.2s; cursor:pointer; }
        .nav-link:hover { color:#e2e8f0; }
        .cta-btn {
          font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:3px;
          padding:14px 36px; background:linear-gradient(135deg,#7c3aed,#4f46e5);
          color:#fff; border:none; border-radius:4px; cursor:pointer;
          transition:all 0.25s; box-shadow:0 0 24px rgba(124,58,237,0.4);
        }
        .cta-btn:hover { transform:translateY(-3px); box-shadow:0 0 40px rgba(124,58,237,0.7); }
        .cta-ghost {
          font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:3px;
          padding:14px 36px; background:transparent; color:#475569;
          border:1px solid rgba(255,255,255,0.1); border-radius:4px; cursor:pointer; transition:all 0.2s;
        }
        .cta-ghost:hover { color:#e2e8f0; border-color:rgba(255,255,255,0.3); }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
      `}</style>

      {/* PixiJS particle canvas — mounted after page renders */}
      {pixiReady && <ParticleBackground accentColor={accentColor}/>}

      {/* Ambient background glow — shifts with hovered character */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:`radial-gradient(ellipse 60% 50% at 50% 50%, ${accentColor}0a 0%, transparent 70%)`,
        transition:"background 0.8s ease",
      }}/>

      {/* Scanline */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:1,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)",
      }}/>

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"16px 40px",
        background:"rgba(5,5,8,0.8)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:accentColor, boxShadow:`0 0 10px ${accentColor}`, animation:"pulseGlow 2s infinite", transition:"background 0.5s" }}/>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900, letterSpacing:3, color:"#e2e8f0" }}>
            SHADOW<span style={{ color:accentColor, transition:"color 0.5s" }}>ARENA</span>
          </span>
        </div>
        <div style={{ display:"flex", gap:32 }}>
          <span className="nav-link" onClick={() => navigate("/")}>HOME</span>
          <span className="nav-link" onClick={() => navigate("/battle")}>BATTLE</span>
          <span className="nav-link" onClick={() => navigate("/leaderboard")}>RANKINGS</span>
        </div>
        <button className="cta-btn" style={{ padding:"8px 20px", fontSize:10 }} onClick={() => navigate("/battle")}>
          ENTER ARENA
        </button>
      </nav>

      <div style={{ position:"relative", zIndex:2 }}>

        {/* ── HERO ── */}
        <section style={{
          minHeight:"100vh", display:"flex", alignItems:"center",
          padding:"120px 60px 80px",
          maxWidth:1400, margin:"0 auto",
        }}>
          {/* Left */}
          <div style={{ flex:"0 0 50%", animation:"fadeUp 0.8s ease 0.2s both" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
              <div style={{ height:1, width:32, background:accentColor, transition:"background 0.5s" }}/>
              <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:4, color:accentColor, transition:"color 0.5s" }}>
                ANIME POWER SIMULATION PLATFORM
              </span>
            </div>

            <h1 style={{
              fontFamily:"'Orbitron',monospace",
              fontSize:"clamp(40px,5.5vw,80px)",
              fontWeight:900, lineHeight:1.0, letterSpacing:2,
              margin:"0 0 24px",
              background:`linear-gradient(135deg, #f1f5f9 0%, ${accentColor} 50%, #06b6d4 100%)`,
              backgroundSize:"200% 200%",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              animation:"gradShift 4s ease infinite",
              transition:"background 0.5s",
            }}>
              WHO<br/>WOULD<br/>WIN?
            </h1>

            <p style={{
              fontSize:16, color:"#64748b", lineHeight:1.8,
              maxWidth:420, margin:"0 0 40px", fontWeight:500,
            }}>
              The ultimate anime power debate — settled by a Go-powered battle engine.
              Pick any two fighters from across universes. Watch every hit, dodge, and
              finishing blow play out round by round.
            </p>

            <div style={{ display:"flex", gap:12 }}>
              <button className="cta-btn" onClick={() => navigate("/battle")}>⚔ START BATTLE</button>
              <button className="cta-ghost" onClick={() => navigate("/leaderboard")}>VIEW RANKINGS</button>
            </div>

            {/* Animated counters */}
            <div style={{ display:"flex", gap:40, marginTop:60 }}>
              {[
                { val: counters.power.toLocaleString(), label:"MAX POWER", sub:"Sung Jin-Woo" },
                { val: counters.fighters, label:"FIGHTERS",   sub:"across universes" },
                { val: counters.universes, label:"UNIVERSES",  sub:"represented" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:30, fontWeight:900, color:"#e2e8f0", lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:9, color:accentColor, fontFamily:"'Orbitron',monospace", letterSpacing:2, marginTop:4, transition:"color 0.5s" }}>{s.label}</div>
                  <div style={{ fontSize:10, color:"#334155", marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — character showcase */}
          <div style={{ flex:"0 0 50%", display:"flex", justifyContent:"center", alignItems:"flex-end", paddingBottom:40 }}>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(3,1fr)",
              gap:12,
              width:"100%", maxWidth:480,
            }}>
              {CHARACTERS.map((char, i) => (
                <ShowcaseCard
                  key={char.id}
                  char={char}
                  index={i}
                  onHover={setHoveredChar}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── HOVERED CHARACTER SPOTLIGHT ── */}
        {hoveredChar && (
          <div style={{
            position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)",
            zIndex:50, pointerEvents:"none",
            padding:"12px 28px",
            background:"rgba(5,5,8,0.92)", backdropFilter:"blur(12px)",
            border:`1px solid ${hoveredChar.accent}44`,
            borderRadius:6,
            boxShadow:`0 0 30px ${hoveredChar.accent}22`,
            animation:"fadeUp 0.2s ease",
          }}>
            <p style={{
              margin:0, fontFamily:"'Rajdhani',sans-serif", fontSize:13,
              color:"#94a3b8", fontStyle:"italic",
            }}>
              "{hoveredChar.tagline}"
            </p>
            <p style={{ margin:"4px 0 0", fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2, color:hoveredChar.accent }}>
              — {hoveredChar.name.toUpperCase()} · {hoveredChar.series.toUpperCase()}
            </p>
          </div>
        )}

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding:"80px 60px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48 }}>
            <div style={{ height:1, flex:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06))" }}/>
            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:4, color:"#334155" }}>HOW IT WORKS</span>
            <div style={{ height:1, flex:1, background:"linear-gradient(90deg,rgba(255,255,255,0.06),transparent)" }}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 }}>
            {[
              { icon:"🎯", title:"Pick Your Fighters", body:"Choose any two characters from 6 universes. Each carries real stats, abilities, and a power tier." },
              { icon:"⚙️", title:"Go Engine Decides", body:"A concurrent Go battle engine resolves every round — crits, evasion, ability cooldowns, stamina drain." },
              { icon:"📜", title:"Watch It Unfold", body:"The combat log streams back round by round. Every hit and KO narrated in real time with live HP bars." },
              { icon:"🏆", title:"Claim the Throne", body:"Win rates and power totals feed the leaderboard. See which fighter dominates across all matchups." },
            ].map((f, i) => (
              <div key={f.title} style={{
                padding:24, borderRadius:8,
                background:"rgba(10,10,20,0.7)",
                border:"1px solid rgba(255,255,255,0.05)",
                transition:"all 0.25s", cursor:"default",
                animation:`fadeUp 0.5s ease ${i * 0.1}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${accentColor}44`;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 0 20px ${accentColor}11`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <span style={{ fontSize:28, display:"block", marginBottom:12 }}>{f.icon}</span>
                <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:16, fontWeight:700, color:"#f1f5f9", margin:"0 0 8px" }}>{f.title}</h3>
                <p style={{ margin:0, fontSize:12, color:"#475569", lineHeight:1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BATTLE CTA BANNER ── */}
        <section style={{ padding:"60px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{
            padding:"48px 60px",
            background:`linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.08) 100%)`,
            border:"1px solid rgba(124,58,237,0.2)",
            borderRadius:8, textAlign:"center",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:400, height:400, borderRadius:"50%",
              background:"#7c3aed", filter:"blur(100px)", opacity:0.06,
              pointerEvents:"none",
            }}/>
            <h2 style={{
              fontFamily:"'Orbitron',monospace",
              fontSize:"clamp(20px,3vw,36px)", fontWeight:900, letterSpacing:3,
              margin:"0 0 12px",
              background:"linear-gradient(135deg,#e2e8f0,#a855f7)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>READY TO FIND OUT?</h2>
            <p style={{ margin:"0 0 28px", fontSize:13, color:"#475569", letterSpacing:1 }}>
              The debate ends here. Enter the arena.
            </p>
            <button className="cta-btn" onClick={() => navigate("/battle")} style={{ fontSize:13 }}>
              ⚔ BATTLE NOW
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop:"1px solid rgba(255,255,255,0.04)",
          padding:"24px 60px",
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12,
        }}>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#1e293b", letterSpacing:3 }}>SHADOW ARENA v1.0.0</span>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#1e293b", letterSpacing:3 }}>GO + REACT + PIXIJS</span>
        </footer>
      </div>
    </div>
  );
}