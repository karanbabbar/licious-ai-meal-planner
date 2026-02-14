import { useState, useEffect, useRef } from "react";

const API_BASE = "https://karanbabbar.app.n8n.cloud/webhook";
const ENDPOINTS = {
  onboarding: `${API_BASE}/v2/onboarding`,
  mealPlanning: `${API_BASE}/v2/meal-planning`,
  weeklyCart: `${API_BASE}/v2/weekly-cart`,
};
const genId = () => `pp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const T = {
  brand: "#E23744", brandDk: "#C62D3A", brandLt: "#FFF1F2",
  dark: "#0F172A", charcoal: "#1E293B",
  g: { 50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0", 300: "#CBD5E1", 400: "#94A3B8", 500: "#64748B", 600: "#475569", 700: "#334155" },
  green: "#059669", greenLt: "#ECFDF5", amber: "#D97706", amberLt: "#FFFBEB", blue: "#2563EB", blueLt: "#EFF6FF",
  white: "#FFFFFF", bg: "#F8FAFC",
  r: { s: "10px", m: "14px", l: "18px", xl: "24px", full: "9999px" },
  sh: { s: "0 1px 3px rgba(0,0,0,0.06)", m: "0 4px 12px rgba(0,0,0,0.07)" },
};
const mono = "'JetBrains Mono', monospace";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Plus Jakarta Sans',sans-serif;background:${T.bg};color:${T.dark};-webkit-font-smoothing:antialiased}
    @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .up{animation:up .5s ease both}.up1{animation:up .5s .1s ease both;opacity:0}.up2{animation:up .5s .2s ease both;opacity:0}.up3{animation:up .5s .3s ease both;opacity:0}.up4{animation:up .5s .4s ease both;opacity:0}
    .fi{animation:fadeIn .4s ease both}.si{animation:scaleIn .3s ease both}
    input:focus{outline:none;border-color:${T.brand}!important;box-shadow:0 0 0 3px ${T.brand}18}
    input,select,button{font-family:'Plus Jakarta Sans',sans-serif}
    .no-sb::-webkit-scrollbar{display:none}.no-sb{-ms-overflow-style:none;scrollbar-width:none}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
    input[type=number]{-moz-appearance:textfield}
  `}</style>
);

const Shell = ({ children }) => <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.white, position: "relative", boxShadow: "0 0 60px rgba(0,0,0,0.06)" }}>{children}</div>;

const Btn = ({ children, onClick, v = "primary", disabled, loading, full, style = {} }) => {
  const vs = { primary: { background: `linear-gradient(135deg, ${T.brand}, ${T.brandDk})`, color: "#fff", boxShadow: "0 4px 16px " + T.brand + "40" }, secondary: { background: T.g[100], color: T.dark, boxShadow: "none" } };
  return <button onClick={disabled || loading ? undefined : onClick} style={{ ...vs[v], border: "none", padding: "14px 24px", borderRadius: T.r.l, fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", transition: "all .2s", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "-0.01em", ...style }}>{loading ? <div style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite" }} /> : children}</button>;
};

const PillSelect = ({ options, value, onChange, multi = false }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map(opt => {
      const sel = multi ? (value || []).includes(opt.value) : value === opt.value;
      return <button key={opt.value} onClick={() => multi ? onChange(sel ? (value||[]).filter(v=>v!==opt.value) : [...(value||[]), opt.value]) : onChange(opt.value)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: T.r.full, border: "2px solid " + (sel ? T.brand : T.g[200]), background: sel ? T.brandLt : T.white, color: sel ? T.brand : T.g[700], fontSize: 14, fontWeight: sel ? 700 : 500, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
        {opt.icon && <span style={{ fontSize: 18 }}>{opt.icon}</span>}{opt.label}
        {sel && "  ✓"}
      </button>;
    })}
  </div>
);

const NumberInput = ({ value, onChange, label, unit, placeholder }) => (
  <div>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.g[600], marginBottom: 6 }}>{label}</label>}
    <div style={{ display: "flex", alignItems: "center", border: "2px solid " + T.g[200], borderRadius: T.r.m, overflow: "hidden", background: T.white }}>
      <input type="number" value={value || ""} onChange={e => onChange(Number(e.target.value) || "")} placeholder={placeholder || "0"} style={{ flex: 1, padding: "12px 14px", border: "none", fontSize: 16, fontWeight: 600, background: "transparent", color: T.dark, width: "100%" }} />
      {unit && <span style={{ padding: "0 14px", fontSize: 13, fontWeight: 600, color: T.g[400] }}>{unit}</span>}
    </div>
  </div>
);

const TextInput = ({ value, onChange, label, placeholder }) => (
  <div>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.g[600], marginBottom: 6 }}>{label}</label>}
    <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "12px 14px", border: "2px solid " + T.g[200], borderRadius: T.r.m, fontSize: 15, fontWeight: 500, background: T.white, color: T.dark }} />
  </div>
);

const RankingUI = ({ value, onChange }) => {
  const defaults = ["Chicken", "Eggs", "Fish", "Mutton"];
  const icons = { Chicken: "🍗", Eggs: "🥚", Fish: "🐟", Mutton: "🥩" };
  const items = value && value.length === 4 ? value : defaults;
  
  useEffect(() => { if (!value || value.length !== 4) onChange(defaults); }, []);
  
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: T.r.m, border: "2px solid " + (i === 0 ? T.brand : T.g[200]), background: i === 0 ? T.brandLt : T.white, transition: "all .2s" }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? T.brand : T.g[200], color: i === 0 ? "#fff" : T.g[600], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
          <span style={{ fontSize: 18 }}>{icons[item]}</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: T.dark }}>{item}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <button onClick={() => move(i, -1)} disabled={i === 0} style={{ width: 28, height: 22, border: "1px solid " + T.g[200], borderRadius: 6, background: T.white, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.3 : 1, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", color: T.g[600] }}>↑</button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1} style={{ width: 28, height: 22, border: "1px solid " + T.g[200], borderRadius: 6, background: T.white, cursor: i === items.length - 1 ? "not-allowed" : "pointer", opacity: i === items.length - 1 ? 0.3 : 1, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", color: T.g[600] }}>↓</button>
          </div>
        </div>
      ))}
      <p style={{ fontSize: 11, color: T.g[400], marginTop: 4, textAlign: "center" }}>Use arrows to reorder. #1 gets highest priority.</p>
    </div>
  );
};

const STEPS = [{ label: "You", icon: "👤" }, { label: "Goals", icon: "🎯" }, { label: "Macros", icon: "📊" }, { label: "Meals", icon: "🍽" }, { label: "Cart", icon: "🛒" }];

const JourneyTracker = ({ steps, current }) => (
  <div style={{ padding: "14px 20px 10px", background: T.white }}>
    <div style={{ display: "flex", alignItems: "center" }}>
      {steps.map((s, i) => {
        const done = i < current; const active = i === current; const last = i === steps.length - 1;
        return <div key={i} style={{ display: "flex", alignItems: "center", flex: last ? "0 0 auto" : 1 }}>
          <div style={{ width: active ? 30 : 22, height: active ? 30 : 22, borderRadius: "50%", background: done ? T.green : active ? T.brand : T.g[200], display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s", flexShrink: 0, boxShadow: active ? "0 0 0 4px " + T.brand + "20" : "none" }}>
            {done ? <span style={{ color: "#fff", fontSize: 11 }}>✓</span> : <span style={{ fontSize: active ? 11 : 9, fontWeight: 800, color: active ? "#fff" : T.g[500] }}>{s.icon}</span>}
          </div>
          {!last && <div style={{ flex: 1, height: 2, margin: "0 3px", background: done ? T.green : T.g[200], borderRadius: 2 }} />}
        </div>;
      })}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
      {steps.map((s, i) => <span key={i} style={{ fontSize: 9, fontWeight: i === current ? 700 : 500, color: i <= current ? T.dark : T.g[400], textAlign: "center", flex: i === steps.length - 1 ? "0 0 auto" : 1 }}>{s.label}</span>)}
    </div>
  </div>
);

const Homepage = ({ onStart }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.white }}>
    <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>P</span></div>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.dark }}>Protein Planner</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: T.brand, padding: "3px 8px", background: T.brandLt, borderRadius: T.r.full }}>by Licious</span>
    </div>
    <div className="up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px" }}>
      <div style={{ margin: "0 auto 28px" }}>
        <svg viewBox="0 0 300 180" fill="none" style={{ width: 280, height: 168 }}>
          <ellipse cx="150" cy="105" rx="130" ry="65" fill={T.brandLt} opacity="0.5"/><ellipse cx="150" cy="110" rx="100" ry="45" fill={T.brandLt} opacity="0.3"/>
          <g transform="translate(45,30)"><circle cx="22" cy="18" r="16" fill="#FFD4A8"/><path d="M8 5C12-2 22-3 27 1C32-1 38 2 38 8C38 14 30 16 22 14C14 16 6 14 8 5Z" fill="#2C1810"/><circle cx="16" cy="16" r="2" fill={T.dark}/><circle cx="28" cy="16" r="2" fill={T.dark}/><path d="M17 23Q22 27 27 23" stroke={T.dark} strokeWidth="1.5" fill="none" strokeLinecap="round"/><rect x="8" y="38" width="28" height="38" rx="10" fill="#4F8FEA"/><rect x="32" y="55" width="14" height="12" rx="3" fill={T.g[700]}/></g>
          <g transform="translate(115,15)"><circle cx="28" cy="22" r="19" fill="#FBBF77"/><rect x="8" y="44" width="40" height="46" rx="12" fill={T.brand}/><circle cx="21" cy="18" r="2.5" fill={T.dark}/><circle cx="35" cy="18" r="2.5" fill={T.dark}/><path d="M21 29Q28 35 35 29" stroke={T.dark} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M5 2C10-5 22-5 28 0C34-4 46-3 50 3C52 8 48 15 28 13C8 15 3 8 5 2Z" fill="#1A0F08"/><g transform="translate(50,32) rotate(-20)"><rect x="0" y="0" width="9" height="24" rx="4.5" fill="#FBBF77"/><circle cx="4.5" cy="0" r="6" fill="#FBBF77"/></g></g>
          <g transform="translate(195,35)"><circle cx="22" cy="16" r="15" fill="#D4A88C"/><rect x="8" y="34" width="28" height="36" rx="9" fill="#22C55E"/><circle cx="16" cy="14" r="2" fill={T.dark}/><circle cx="28" cy="14" r="2" fill={T.dark}/><path d="M17 21Q22 25 27 21" stroke={T.dark} strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M7 6C10 0 18-1 22 2C26-1 34 0 37 6C38 10 34 14 22 12C10 14 6 10 7 6Z" fill="#0F0805"/></g>
          <text x="20" y="55" fontSize="16" opacity="0.8">🥚</text><text x="260" y="50" fontSize="14" opacity="0.8">🍗</text><text x="75" y="165" fontSize="13" opacity="0.6">🐟</text><text x="220" y="160" fontSize="13" opacity="0.6">🥩</text>
        </svg>
      </div>
      <h1 className="up1" style={{ fontSize: 26, fontWeight: 800, color: T.dark, lineHeight: 1.2, textAlign: "center", letterSpacing: "-0.03em", marginBottom: 12 }}>Pre-order your weekly<br/>protein supply</h1>
      <p className="up2" style={{ fontSize: 14, color: T.g[500], lineHeight: 1.6, textAlign: "center", maxWidth: 320, margin: "0 auto 24px" }}>Stop guessing. Know exactly how much protein you need, plan each meal, and pre-order fresh supplies from Licious for the whole week.</p>
      <div className="up3" style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
        {["🎯 Personalised", "📦 Pack-optimised", "💰 Cost-aware"].map((f, i) => <span key={i} style={{ padding: "5px 12px", borderRadius: T.r.full, background: T.g[50], border: "1px solid " + T.g[200], fontSize: 11, fontWeight: 600, color: T.g[600] }}>{f}</span>)}
      </div>
    </div>
    <div className="up4" style={{ padding: "0 24px 28px" }}>
      <Btn onClick={onStart} full style={{ padding: "16px", fontSize: 16, borderRadius: T.r.xl }}>Plan & Pre-Order Protein <span style={{ fontSize: 18 }}>→</span></Btn>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
        {["Calculate need", "→", "Fix weekly supply", "→", "Pre-order"].map((s, i) => <span key={i} style={{ fontSize: 11, fontWeight: i % 2 === 0 ? 600 : 400, color: i % 2 === 0 ? T.g[600] : T.g[300] }}>{s}</span>)}
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: T.g[400], marginTop: 4 }}>Takes ~2 minutes</p>
    </div>
  </div>
);

// NEW: MACRO FORK SCREEN
const MacroFork = ({ onKnowIt, onCalculate, onRestart }) => {
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const handleKnowIt = async () => {
    setLoading(true);
    setError(false);
    try {
      await onKnowIt(calories, protein);
    } catch (err) {
      console.error(err);
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.white }}>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid " + T.g[100] }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>P</span></div>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.dark }}>Protein Planner</span>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.brand, padding: "3px 8px", background: T.brandLt, borderRadius: T.r.full }}>by Licious</span>
        <button onClick={onRestart} style={{ width: 32, height: 32, borderRadius: T.r.m, border: "1px solid " + T.g[200], background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.g[400] }} title="Start over">✕</button>
      </div>
      
      <div className="up" style={{ flex: 1, padding: "28px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.dark, marginBottom: 6, letterSpacing: "-0.02em" }}>Let's plan your protein</h2>
        <p style={{ fontSize: 13, color: T.g[500], marginBottom: 24, lineHeight: 1.5 }}>Do you know your daily calorie and protein requirements?</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <NumberInput label="Daily calorie intake" value={calories} onChange={setCalories} unit="kcal" placeholder="e.g. 2500" />
          <NumberInput label="Daily protein from food" value={protein} onChange={setProtein} unit="g" placeholder="e.g. 150" />
          <div style={{ display: "flex", gap: 6, padding: "10px 12px", background: T.blueLt, borderRadius: T.r.m, border: "1px solid " + T.blue + "20" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 11, color: T.g[600], lineHeight: 1.4 }}>If you take protein supplements, deduct that amount. Enter only protein you need from food.</p>
          </div>
        </div>
        
        {error && (
          <div style={{ padding: "12px 16px", background: T.brandLt, borderRadius: T.r.m, border: "1px solid " + T.brand + "30", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: 13, color: T.brand, fontWeight: 600 }}>Something went wrong. Tap to retry.</span>
          </div>
        )}
      </div>

      <div style={{ padding: "16px 24px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn onClick={handleKnowIt} full disabled={!calories || !protein} loading={loading} style={{ fontSize: 16 }}>
          {error ? "Tap to retry ↻" : "Yes, I know it!"} {!error && <span style={{ fontSize: 18 }}>→</span>}
        </Btn>
        <Btn onClick={() => onCalculate(calories, protein)} v="secondary" full style={{ fontSize: 15 }} disabled={loading}>
          Help me calculate 🧮
        </Btn>
      </div>
    </div>
  );
};

// NEW: CALCULATOR DISCLAIMER SCREEN
const CalculatorDisclaimer = ({ onStart, onRestart }) => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.white }}>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid " + T.g[100] }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>Calculator</div></div>
        <button onClick={onRestart} style={{ width: 32, height: 32, borderRadius: T.r.m, border: "1px solid " + T.g[200], background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.g[400] }} title="Start over">✕</button>
      </div>

      <div className="up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.brandLt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>🧮</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.dark, marginBottom: 8, letterSpacing: "-0.02em" }}>Quick health calculator</h2>
          <p style={{ fontSize: 13, color: T.g[500], lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>We'll ask you a few questions about your body, activity level, and goals to calculate your personalised daily macros.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {[
            { icon: "📏", label: "Basic measurements (height, weight, age)" },
            { icon: "🎯", label: "Your fitness goal" },
            { icon: "🏃", label: "Activity level" },
            { icon: "🍗", label: "Protein preferences" }
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", background: T.g[50], borderRadius: T.r.m, border: "1px solid " + T.g[200] }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: T.dark }}>{item.label}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: T.g[400], marginBottom: 8 }}>Takes about 2 minutes</p>
      </div>

      <div style={{ padding: "16px 24px 32px" }}>
        <Btn onClick={onStart} full style={{ fontSize: 16, padding: "16px" }}>Let's go <span style={{ fontSize: 18 }}>→</span></Btn>
      </div>
    </div>
  );
};

const Onboarding = ({ sessionId, onComplete, onRestart }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "", height: "", weight: "", targetWeight: "", timeline: 12, activity: "", preferences: [], meals: 3 });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const sendMsg = async (msg) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(ENDPOINTS.onboarding, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message: msg }) });
      const text = await res.text();
      if (!text || text.trim() === '') throw new Error('Empty response');
      let data; try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (data.stage_complete) { setTimeout(() => onComplete(data.data_collected || data), 600); }
      return data;
    } catch (err) { 
      console.error(err); 
      setError(true);
      return null;
    } finally { setLoading(false); }
  };

  const formSteps = [
    { title: "Let's get to know you", sub: "Basic info to calculate your protein needs", ok: form.name && form.age && form.gender, go: () => sendMsg("My name is " + form.name + ", I am " + form.age + " years old, " + form.gender), ui: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="What's your name?" value={form.name} onChange={v => f("name", v)} placeholder="e.g. Karan" />
        <NumberInput label="Age" value={form.age} onChange={v => f("age", v)} unit="years" placeholder="28" />
        <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.g[600], marginBottom: 8 }}>Gender</label>
          <PillSelect options={[{ label: "Male", value: "Male", icon: "♂️" }, { label: "Female", value: "Female", icon: "♀️" }]} value={form.gender} onChange={v => f("gender", v)} /></div>
      </div>
    )},
    { title: "Your measurements", sub: "Used to calculate BMR and daily calorie needs", ok: form.height && form.weight, go: () => sendMsg("Height: " + form.height + "cm, Current weight: " + form.weight + "kg"), ui: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <NumberInput label="Height" value={form.height} onChange={v => f("height", v)} unit="cm" placeholder="175" />
        <NumberInput label="Current weight" value={form.weight} onChange={v => f("weight", v)} unit="kg" placeholder="85" />
      </div>
    )},
    { title: "What's your goal?", sub: "We'll plan your nutrition accordingly", ok: form.targetWeight && form.timeline, go: () => sendMsg("I want to reach " + form.targetWeight + "kg in " + form.timeline + " weeks. " + (Number(form.targetWeight) < Number(form.weight) ? "Goal: lose weight" : Number(form.targetWeight) > Number(form.weight) ? "Goal: gain muscle" : "Goal: maintain")), ui: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <NumberInput label="Target weight" value={form.targetWeight} onChange={v => f("targetWeight", v)} unit="kg" placeholder="75" />
        <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.g[600], marginBottom: 8 }}>Timeline</label>
          <PillSelect options={[{ label: "8 wks", value: 8 }, { label: "12 wks", value: 12 }, { label: "16 wks", value: 16 }, { label: "24 wks", value: 24 }]} value={form.timeline} onChange={v => f("timeline", v)} /></div>
      </div>
    )},
    { title: "How active are you?", sub: "This affects how many calories you burn daily", ok: form.activity, go: () => sendMsg("My activity level is " + form.activity), ui: (
      <PillSelect options={[{ label: "Sedentary", value: "Sedentary", icon: "🪑" }, { label: "Light", value: "Light", icon: "🚶" }, { label: "Moderate", value: "Moderate", icon: "🏃" }, { label: "Active", value: "Active", icon: "⚡" }, { label: "Very Active", value: "Very Active", icon: "🔥" }]} value={form.activity} onChange={v => f("activity", v)} />
    )},
    { title: "Rank your protein preferences", sub: "Use arrows to reorder — your top pick gets priority", ok: (form.preferences || []).length === 4, go: () => sendMsg("My protein preference ranking: 1. " + form.preferences[0] + ", 2. " + form.preferences[1] + ", 3. " + form.preferences[2] + ", 4. " + form.preferences[3]), ui: (
      <RankingUI value={form.preferences} onChange={v => f("preferences", v)} />
    )},
    { title: "Meals per day", sub: "We'll distribute protein across each meal", ok: form.meals, go: () => sendMsg(form.meals + " meals per day"), ui: (
      <PillSelect options={[{ label: "2 meals", value: 2 }, { label: "3 meals", value: 3 }, { label: "4 meals", value: 4 }]} value={form.meals} onChange={v => f("meals", v)} />
    )},
  ];

  const cur = formSteps[step];
  const handleNext = async () => { 
    if (!cur.ok) return; 
    const result = await cur.go(); 
    if (result && step < formSteps.length - 1) setStep(s => s + 1); 
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.white }}>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid " + T.g[100] }}>
        {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ width: 36, height: 36, borderRadius: T.r.m, border: "1px solid " + T.g[200], background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: T.g[500] }}>←</button>}
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>Set up profile</div></div>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.g[400] }}>{step + 1}/{formSteps.length}</span>
        <button onClick={onRestart} style={{ width: 32, height: 32, borderRadius: T.r.m, border: "1px solid " + T.g[200], background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.g[400] }} title="Start over">✕</button>
      </div>
      <JourneyTracker steps={STEPS} current={step < 3 ? 0 : 1} />
      <div key={step} className="si" style={{ flex: 1, padding: "28px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.dark, marginBottom: 6, letterSpacing: "-0.02em" }}>{cur.title}</h2>
        <p style={{ fontSize: 13, color: T.g[500], marginBottom: 24, lineHeight: 1.5 }}>{cur.sub}</p>
        {cur.ui}
        {error && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: T.brandLt, borderRadius: T.r.m, border: "1px solid " + T.brand + "30", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: 13, color: T.brand, fontWeight: 600 }}>Something went wrong. Tap Continue to retry.</span>
          </div>
        )}
      </div>
      <div style={{ padding: "16px 24px 32px" }}>
        <Btn onClick={handleNext} full disabled={!cur.ok} loading={loading}>{error ? "Tap to retry ↻" : "Continue"}{!error && step < formSteps.length - 1 && <span> →</span>}</Btn>
      </div>
    </div>
  );
};

const Results = ({ data, onContinue }) => {
  const macros = [
    { label: "Calories", val: data?.daily_calories || 0, unit: "kcal", color: T.brand, icon: "🔥" },
    { label: "Protein", val: data?.daily_protein_g || 0, unit: "g", color: T.green, icon: "💪" },
    { label: "Carbs", val: data?.daily_carbs_g || 0, unit: "g", color: T.blue, icon: "🌾" },
    { label: "Fat", val: data?.daily_fat_g || 0, unit: "g", color: T.amber, icon: "🫒" },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.white }}>
      <div style={{ background: "linear-gradient(150deg, " + T.dark + ", " + T.charcoal + ")", padding: "20px 24px 52px", borderRadius: "0 0 28px 28px" }}>
        <JourneyTracker steps={STEPS} current={2} />
        <div style={{ marginTop: 16 }}>
          <p className="fi" style={{ fontSize: 12, fontWeight: 700, color: T.brand, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Your personalised plan</p>
          <h2 className="up" style={{ fontSize: 22, fontWeight: 800, color: T.white, lineHeight: 1.3 }}>Here's what your body needs, {(data?.name || "").split(" ")[0]}</h2>
        </div>
      </div>
      <div style={{ padding: "0 20px", marginTop: -32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {macros.map((m, i) => <div key={i} className={"up" + i} style={{ padding: 16, background: T.white, borderRadius: T.r.l, border: "1px solid " + T.g[100], boxShadow: T.sh.m }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: T.g[500], textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</span><span style={{ fontSize: 14 }}>{m.icon}</span></div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}><span style={{ fontSize: 26, fontWeight: 800, color: m.color, fontFamily: mono }}>{m.val}</span><span style={{ fontSize: 12, fontWeight: 600, color: T.g[400] }}>{m.unit}</span></div>
          </div>)}
        </div>
      </div>
      <div className="up2" style={{ margin: "16px 20px 0", padding: 14, background: T.greenLt, borderRadius: T.r.m, border: "1px solid " + T.green + "18" }}>
        <p style={{ fontSize: 13, color: T.g[700], lineHeight: 1.5 }}><strong style={{ color: T.green }}>Next:</strong> Pick the right Licious products for each meal to hit <strong>{(data?.daily_protein_g || 0) + "g protein"}</strong></p>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ padding: "16px 24px 36px" }}><Btn onClick={onContinue} full>Pick Protein Sources <span>→</span></Btn></div>
    </div>
  );
};

// VISUAL MEAL PLANNING COMPONENTS (backend-driven)

// Helper: Calculate distribution as fallback when API returns zeros
const calculateDistribution = (label, target) => {
  const t = target || 150;
  switch(label) {
    case 'Equal': return { breakfast: Math.floor(t/3), lunch: Math.floor(t/3), dinner: t - 2*Math.floor(t/3) };
    case 'Heavy Breakfast': return { breakfast: Math.round(t*0.4), lunch: Math.round(t*0.3), dinner: t - Math.round(t*0.4) - Math.round(t*0.3) };
    case 'Heavy Lunch': return { breakfast: Math.round(t*0.3), lunch: Math.round(t*0.4), dinner: t - Math.round(t*0.3) - Math.round(t*0.4) };
    case 'Heavy Dinner': return { breakfast: Math.round(t*0.3), lunch: Math.round(t*0.3), dinner: t - 2*Math.round(t*0.3) };
    default: return { breakfast: Math.floor(t/3), lunch: Math.floor(t/3), dinner: t - 2*Math.floor(t/3) };
  }
};

// Collapsed Badge for previous responses
const CollapsedBadge = ({ type, data, fullData }) => {
  let text = "";
  switch (type) {
    case 'budget_setup':
      // Try multiple sources for distribution values
      const dist = fullData?.budget?.distribution || data?.budget?.distribution;
      const selectedLabel = fullData?.budget?.selected_distribution || data?.selected_distribution || data?.distributions?.[0]?.label || 'Distribution';
      const proteinTarget = fullData?.budget?.meal_budget_g || data?.protein_target || 150;
      
      // Check if we have valid (non-zero) values
      if (dist && dist.breakfast > 0) {
        text = `✓ ${selectedLabel} — ${dist.breakfast}g / ${dist.lunch}g / ${dist.dinner}g`;
      } else {
        // Fallback: Calculate distribution locally
        const calculated = calculateDistribution(selectedLabel, proteinTarget);
        text = `✓ ${selectedLabel} — ${calculated.breakfast}g / ${calculated.lunch}g / ${calculated.dinner}g`;
      }
      break;
    case 'source_select':
      text = "✓ Sources selected";
      break;
    case 'cut_select':
      text = "✓ Cut type selected";
      break;
    case 'product_select':
      const productCount = (data?.products || []).length;
      text = productCount > 0 ? `✓ ${productCount} product${productCount === 1 ? '' : 's'} selected` : "✓ Products selected";
      break;
    case 'portion_confirm':
      text = data?.meal_label ? `✓ ${data.meal_label} portions confirmed` : "✓ Portions confirmed";
      break;
    case 'meal_confirmed':
      const protein = data?.total_protein ? Math.round(data.total_protein * 10) / 10 : 0;
      text = data?.meal_label ? `✓ ${data.meal_label} locked — ${protein}g protein` : "✓ Meal locked";
      break;
    default:
      text = "✓ Step completed";
  }
  
  return (
    <div style={{ padding: "8px 12px", background: T.g[50], borderRadius: 10, fontSize: 12, color: T.g[600], fontWeight: 600, marginBottom: 8 }}>
      {text}
    </div>
  );
};

const DistributionSetup = ({ data, onSelect }) => {
  const [sel, setSel] = useState(null);
  const [supplement, setSupplement] = useState(false);
  const [supplementGrams, setSupplementGrams] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use fallback calculation if API returns 0 values
  const getDistributionValues = (d) => {
    if (d.breakfast > 0 || d.lunch > 0 || d.dinner > 0) {
      return [d.breakfast || 0, d.lunch || 0, d.dinner || 0];
    }
    // Fallback: calculate locally
    const calculated = calculateDistribution(d.label, data.protein_target);
    return [calculated.breakfast, calculated.lunch, calculated.dinner];
  };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Do you take protein supplements?</p>
      <div style={{ display: "flex", gap: 8, marginBottom: supplement ? 12 : 20 }}>
        <button onClick={() => setSupplement(false)} disabled={isSubmitting} style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "2px solid " + (!supplement ? T.brand : T.g[200]), background: !supplement ? T.brandLt : T.white, color: !supplement ? T.brand : T.g[600], fontSize: 13, fontWeight: !supplement ? 700 : 500, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.5 : 1 }}>No supplements</button>
        <button onClick={() => setSupplement(true)} disabled={isSubmitting} style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "2px solid " + (supplement ? T.brand : T.g[200]), background: supplement ? T.brandLt : T.white, color: supplement ? T.brand : T.g[600], fontSize: 13, fontWeight: supplement ? 700 : 500, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.5 : 1 }}>Yes, I take</button>
      </div>
      
      {supplement && (
        <div className="si" style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.g[600], marginBottom: 6, display: "block" }}>
            How many grams per day?
          </label>
          <input 
            type="number" 
            placeholder="e.g. 30" 
            value={supplementGrams} 
            onChange={e => setSupplementGrams(e.target.value)}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "12px 14px", border: "2px solid " + T.g[200], borderRadius: 14, fontSize: 16, fontWeight: 600, background: T.white, color: T.dark, opacity: isSubmitting ? 0.5 : 1 }}
          />
        </div>
      )}
      
      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>How to split your {data.protein_target}g protein?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(data.distributions || []).map(d => {
          const colors = [T.brand, T.green, T.blue];
          const meals = ["Bfast", "Lunch", "Dinner"];
          const values = getDistributionValues(d);
          const isSelected = sel === d.label;
          
          const handleSelect = () => {
            if (isSubmitting) return;
            setSel(d.label);
            setIsSubmitting(true);
            const msg = supplement && supplementGrams 
              ? `I take ${supplementGrams}g of supplement protein daily, ${d.label}, confirm`
              : `No supplements, ${d.label}, confirm`;
            onSelect(msg);
          };
          
          return (
            <button key={d.label} onClick={handleSelect} disabled={isSubmitting} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14,
              border: "2px solid " + (isSelected ? T.brand : T.g[200]), background: isSelected ? T.brandLt : T.white,
              cursor: isSubmitting ? "not-allowed" : "pointer", textAlign: "left",
              opacity: isSubmitting && !isSelected ? 0.5 : 1,
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{d.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? T.brand : T.dark, marginBottom: 6 }}>{d.label}</div>
                <div style={{ display: "flex", gap: 2, height: 6 }}>
                  {values.map((v, i) => (
                    <div key={i} style={{ flex: v, height: "100%", borderRadius: 3, background: isSelected ? colors[i] : T.g[200], opacity: isSelected ? 1 : 0.5, transition: "all .3s" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {meals.map((m, i) => (
                    <span key={m} style={{ fontSize: 10, color: isSelected ? colors[i] : T.g[400], fontWeight: 600 }}>{m} {values[i]}g</span>
                  ))}
                </div>
              </div>
              {isSelected && <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isSubmitting ? <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite" }} /> : <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SourceChips = ({ data, onSelect }) => {
  const [selected, setSelected] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxSources = 3;
  
  const handleSubmit = () => {
    if (selected.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    onSelect(selected.join(" and "));
  };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{data.meal_label}</p>
      <p style={{ fontSize: 11, color: T.g[400], marginBottom: 4 }}>{data.protein_target}g protein target</p>
      <p style={{ fontSize: 12, color: T.g[400], marginBottom: 12 }}>Choose up to 3 sources for this meal</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(data.available_sources || []).map(s => {
          const isSelected = selected.includes(s.name);
          const canSelect = selected.length < maxSources || isSelected;
          return (
            <button 
              key={s.name} 
              onClick={() => {
                if (isSubmitting) return;
                if (isSelected) {
                  setSelected(prev => prev.filter(n => n !== s.name));
                } else if (canSelect) {
                  setSelected(prev => [...prev, s.name]);
                }
              }}
              disabled={(!canSelect && !isSelected) || isSubmitting}
              style={{ 
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: T.r.full, 
                border: "2px solid " + (isSelected ? T.brand : T.g[200]), 
                background: isSelected ? T.brandLt : T.white, 
                color: isSelected ? T.brand : T.g[700], 
                fontSize: 14, fontWeight: isSelected ? 700 : 500, 
                cursor: (canSelect && !isSubmitting) ? "pointer" : "not-allowed", 
                transition: "all .2s", 
                whiteSpace: "nowrap",
                opacity: ((!canSelect && !isSelected) || isSubmitting) ? 0.5 : 1
              }}
            >
              {s.icon && <span style={{ fontSize: 18 }}>{s.icon}</span>}
              {s.name}
              {isSelected && "  ✓"}
            </button>
          );
        })}
      </div>
      <Btn onClick={handleSubmit} full disabled={selected.length === 0 || isSubmitting} loading={isSubmitting} style={{ marginTop: 16 }}>
        {isSubmitting ? "Submitting..." : "Continue →"}
      </Btn>
    </div>
  );
};

const CutChips = ({ data, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSelect = (cut) => {
    if (isSubmitting) return;
    setSelected(cut);
    setIsSubmitting(true);
    onSelect(cut);
  };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 12 }}>{data.category} cut preference</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(data.cuts || []).map(cut => {
          const isSelected = selected === cut;
          return (
            <button 
              key={cut} 
              onClick={() => handleSelect(cut)}
              disabled={isSubmitting}
              style={{ 
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: T.r.full, 
                border: "2px solid " + (isSelected ? T.brand : T.g[200]), 
                background: isSelected ? T.brandLt : T.white, 
                color: isSelected ? T.brand : T.g[700], 
                fontSize: 14, fontWeight: isSelected ? 700 : 500, 
                cursor: isSubmitting ? "not-allowed" : "pointer", 
                transition: "all .2s", 
                whiteSpace: "nowrap",
                opacity: isSubmitting && !isSelected ? 0.5 : 1
              }}
            >
              {cut}
              {isSelected && (isSubmitting ? <div style={{ width: 14, height: 14, border: "2px solid " + T.brand + "40", borderTopColor: T.brand, borderRadius: "50%", animation: "spin .6s linear infinite" }} /> : "  ✓")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ProductCardGrid = ({ data, onSelect }) => {
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const mealTarget = data.protein_target || 50;
  
  // Filter out products with price 0 (already purchased)
  const selectableProducts = (data.products || []).filter(p => p.price > 0);
  const alreadyOrderedProducts = (data.products || []).filter(p => p.price === 0);
  
  // Group selectable products by category
  const productsByCategory = selectableProducts.reduce((acc, p) => {
    const cat = p.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
  
  // Calculate rough protein estimate
  const totalSelectedProtein = selected.reduce((sum, productName) => {
    const product = selectableProducts.find(p => p.product_name === productName);
    if (!product) return sum;
    if (product.category === 'eggs') return sum + 6.5 * 4; // rough: 4 eggs
    return sum + (product.protein_per_100g || 20) * 1.2; // rough: 120g portion
  }, 0);
  
  const canSelectMore = totalSelectedProtein < mealTarget * 1.3;
  
  // Get selected sources for reminder
  const selectedSources = [...new Set(selectableProducts.filter(p => selected.includes(p.product_name)).map(p => p.category))];
  const allSources = [...new Set(selectableProducts.map(p => p.category))];
  const sourcesWithoutSelection = allSources.filter(s => !selectedSources.includes(s));
  
  // Handle product selection with SWAP logic (max 1 per category)
  const handleProductSelect = (product) => {
    if (submitted) return;
    const productName = product.product_name;
    const category = product.category || 'other';
    
    setSelected(prev => {
      const isSelected = prev.includes(productName);
      if (isSelected) {
        // Deselect
        return prev.filter(n => n !== productName);
      } else {
        // SWAP: Remove any existing selection from same category, then add new
        const filtered = prev.filter(n => {
          const p = selectableProducts.find(prod => prod.product_name === n);
          return p?.category !== category;
        });
        return [...filtered, productName];
      }
    });
  };
  
  const handleSubmit = () => {
    if (selected.length === 0 || submitted) return;
    setSubmitted(true);
    onSelect(selected.join(", "));
  };
  
  // Render products grouped by category with "Pick 1" label
  const renderCategoryGroup = (category, products) => {
    const categoryIcons = { chicken: '🍗', eggs: '🥚', fish: '🐟', mutton: '🥩' };
    const categoryLabels = { chicken: 'Chicken', eggs: 'Eggs', fish: 'Fish', mutton: 'Mutton' };
    
    return (
      <div key={category} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>
            {categoryIcons[category] || '🥩'} {categoryLabels[category] || category}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.brand, background: T.brandLt, padding: "3px 8px", borderRadius: 99 }}>
            Pick 1
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {products.map((p, i) => {
            const isSelected = selected.includes(p.product_name);
            const proteinDisplay = p.category === 'eggs'
              ? '6.5g/egg'
              : p.protein_per_100g 
                ? `${p.protein_per_100g}g/100g` 
                : '';
            
            return (
              <button key={i} onClick={() => handleProductSelect(p)} disabled={submitted} style={{
                padding: 8, borderRadius: 14, border: "2px solid " + (isSelected ? T.brand : T.g[200]),
                background: isSelected ? T.brandLt : T.white, cursor: submitted ? "not-allowed" : "pointer", textAlign: "left",
                boxShadow: isSelected ? "0 4px 12px " + T.brand + "15" : "0 1px 4px rgba(0,0,0,0.04)",
                opacity: submitted ? 0.7 : 1,
              }}>
                <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, background: T.g[100], overflow: "hidden", marginBottom: 8, position: "relative" }}>
                  {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🥩</div>}
                  {isSelected && (
                    <div style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.dark, lineHeight: 1.3, marginBottom: 4, minHeight: 28 }}>{p.product_name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: T.brand, fontFamily: mono }}>₹{p.price}</span>
                  {proteinDisplay && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: T.green, background: T.greenLt, padding: "2px 6px", borderRadius: 99 }}>
                      {proteinDisplay}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 10, color: T.g[400], marginTop: 3 }}>{p.pack_size_label}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="si" style={{ marginTop: 8 }}>
      <p style={{ fontSize: 12, color: T.g[400], marginBottom: 10 }}>Tap to select products (max 1 per category)</p>
      
      {!canSelectMore && (
        <div style={{ padding: "10px 14px", background: T.amberLt, border: "1px solid " + T.amber, borderRadius: 12, marginBottom: 8, fontSize: 12, color: T.amber, fontWeight: 600 }}>
          ⚠️ Selected products may exceed your {mealTarget}g target. You can adjust portions in the next step.
        </div>
      )}
      
      {/* Show already ordered products (from previous meals) */}
      {alreadyOrderedProducts.length > 0 && (
        <div style={{ marginBottom: 16, padding: 12, background: T.greenLt, borderRadius: 12, border: "1px solid " + T.green + "20" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 6 }}>✓ Already in your order</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {alreadyOrderedProducts.map((p, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: T.g[600], padding: "4px 10px", background: T.white, borderRadius: 99, border: "1px solid " + T.g[200] }}>
                {p.product_name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {Object.entries(productsByCategory).map(([category, products]) => renderCategoryGroup(category, products))}
      
      {sourcesWithoutSelection.length > 0 && selected.length > 0 && (
        <div style={{ padding: "8px 12px", background: T.blueLt, borderRadius: 10, fontSize: 12, color: T.blue, marginTop: 8 }}>
          💡 Don't forget to pick a {sourcesWithoutSelection.join(" and ")} product too!
        </div>
      )}
      
      <Btn onClick={handleSubmit} full disabled={selected.length === 0 || submitted} loading={submitted} style={{ marginTop: 16 }}>
        {submitted ? "Submitting..." : "Select These →"}
      </Btn>
    </div>
  );
};

const PortionConfirmCard = ({ data, onConfirm }) => {
  const [utilization, setUtilization] = useState({});
  const [locked, setLocked] = useState(false);
  const total = Math.round((data.portions || []).reduce((s, p) => s + p.protein_g, 0) * 10) / 10;
  
  const handleConfirm = () => {
    if (locked) return;
    setLocked(true);
    // Convert utilization object to message string
    const utilizationMsg = Object.entries(utilization).map(([product, choice]) => `${product}: ${choice}`).join(", ");
    const msg = `Lock ${data.meal_label}, utilization: ${utilizationMsg}`;
    onConfirm(msg);
  };
  
  return (
    <div className="si">
      {/* Portion Summary */}
      <div style={{ padding: 14, background: T.white, borderRadius: 16, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: T.dark }}>{data.meal_label} portions</p>
          <span style={{ fontSize: 11, fontWeight: 700, color: total >= data.protein_target ? T.green : T.amber, background: total >= data.protein_target ? T.greenLt : T.amberLt, padding: "3px 8px", borderRadius: 99 }}>
            {total >= data.protein_target ? "✓ Target met" : (Math.round(total * 10) / 10) + "/" + data.protein_target + "g"}
          </span>
        </div>
        {(data.portions || []).map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.dark }}>{p.product_name} ({p.quantity})</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.green, fontFamily: mono }}>{(Math.round(p.protein_g * 10) / 10)}g</span>
            </div>
            <div style={{ height: 5, background: T.g[100], borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: Math.min(100, (p.protein_g / data.protein_target) * 100) + "%", background: "linear-gradient(90deg, " + T.green + ", #34D399)", borderRadius: 3, transition: "width .6s ease" }} />
            </div>
            <span style={{ fontSize: 10, color: T.g[400], marginTop: 2, display: "block" }}>from {p.pack_info}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 0", borderTop: "1px solid " + T.g[100], marginTop: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.dark }}>Total</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: T.green, fontFamily: mono }}>{total.toFixed(1)}g / {data.protein_target}g</span>
        </div>
      </div>

      {/* Utilization Picker */}
      {(data.utilization_options || []).length > 0 && (
        <div style={{ padding: 14, background: T.white, borderRadius: 16, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: T.dark, marginBottom: 4 }}>Pack utilization</p>
          <p style={{ fontSize: 11, color: T.g[400], marginBottom: 12 }}>What to do with leftover portions?</p>
          {data.utilization_options.map((item, idx) => (
            <div key={idx} style={{ marginBottom: idx < data.utilization_options.length - 1 ? 16 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>{item.product_name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: T.amber, background: T.amberLt, padding: "2px 6px", borderRadius: 99 }}>{item.remaining}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(item.options || []).map((opt, i) => {
                  const isActive = utilization[item.product_name] === opt.value;
                  return (
                    <button key={i} onClick={() => setUtilization(p => ({ ...p, [item.product_name]: opt.value }))} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                      border: "2px solid " + (isActive ? T.brand : T.g[200]), background: isActive ? T.brandLt : T.white,
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (isActive ? T.brand : T.g[300]), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isActive && <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.brand }} />}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: isActive ? T.brand : T.g[600] }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Btn onClick={handleConfirm} full disabled={locked} loading={locked} style={{ marginTop: 16 }}>
        {locked ? "Locking..." : `Lock ${data.meal_label} ✓`}
      </Btn>
    </div>
  );
};

const MealBadge = ({ data }) => {
  return (
    <div className="si" style={{ padding: "12px 16px", background: T.greenLt, borderRadius: 14, border: "1px solid " + T.green + "20", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
        </div>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>{data.meal_label} locked</span>
          <span style={{ fontSize: 11, color: T.g[500], display: "block" }}>{data.total_protein}g protein</span>
        </div>
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.dark, fontFamily: mono }}>₹{data.running_price}</span>
    </div>
  );
};

// Error Retry Component
const ErrorRetry = ({ onRetry }) => (
  <div className="si" style={{ padding: 20, background: T.white, borderRadius: 16, border: "1px solid " + T.brand + "30", boxShadow: T.sh.m, marginTop: 8, textAlign: "center" }}>
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.brandLt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22 }}>⚠️</div>
    <p style={{ fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 4 }}>Something went wrong</p>
    <p style={{ fontSize: 12, color: T.g[500], marginBottom: 16 }}>Unable to connect. Please try again.</p>
    <button onClick={onRetry} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: T.r.l, background: T.brandLt, border: "2px solid " + T.brand, color: T.brand, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
      <span style={{ fontSize: 16 }}>↻</span> Tap to retry
    </button>
  </div>
);

// MEAL PLANNING WIZARD (replaces ChatScreen for Agent 2)
const MealPlanningWizard = ({ sessionId, onComplete, onRestart }) => {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const hasSent = useRef(false);

  useEffect(() => {
    if (!hasSent.current) {
      hasSent.current = true;
      send("Start planning my protein sources");
    }
  }, []);

  const send = async (message) => {
    // BUG FIX: Ensure message is always a string
    const msgText = typeof message === 'string' ? message : (typeof message === 'object' ? JSON.stringify(message) : String(message));
    if (!msgText.trim()) return;
    
    setLastMessage(msgText.trim());
    setError(null);
    setMsgs(p => [...p, { role: "user", text: msgText.trim() }]);
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.mealPlanning, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message: msgText.trim() }) });
      const raw = await res.text();
      
      // Check for empty response
      if (!raw || raw.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      let data;
      try {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        data = JSON.parse(cleaned);
      } catch {
        data = { message: raw };
      }
      setMsgs(p => [...p, { role: "bot", text: data.message || raw, data }]);
      if (data.stage_complete) {
        setDone(true);
        setTimeout(() => onComplete(data), 1500);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(true);
      // Remove the user message that failed
      setMsgs(p => p.slice(0, -1));
    }
    setLoading(false);
  };
  
  const handleRetry = () => {
    if (lastMessage) {
      send(lastMessage);
    } else {
      send("Start planning my protein sources");
    }
  };

  const renderUI = (msg) => {
    const { ui_type, ui_data } = msg.data || {};
    if (!ui_type || !ui_data) return null;

    switch (ui_type) {
      case 'budget_setup': return <DistributionSetup data={ui_data} onSelect={send} />;
      case 'source_select': return <SourceChips data={ui_data} onSelect={send} />;
      case 'cut_select': return <CutChips data={ui_data} onSelect={send} />;
      case 'product_select': return <ProductCardGrid data={ui_data} onSelect={send} />;
      case 'portion_confirm': return <PortionConfirmCard data={ui_data} onConfirm={send} />;
      case 'meal_confirmed': return <MealBadge data={ui_data} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg }}>
      <div style={{ padding: "10px 20px", background: T.white, borderBottom: "1px solid " + T.g[100], display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: T.r.m, background: "linear-gradient(135deg, " + T.green + ", #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14 }}>🍽</span></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>Meal Planning</div></div>
        <button onClick={onRestart} style={{ width: 30, height: 30, borderRadius: T.r.m, border: "1px solid " + T.g[200], background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: T.g[400] }} title="Start over">✕</button>
      </div>
      <JourneyTracker steps={STEPS} current={3} />
      <div className="no-sb" style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
        {msgs.map((m, i) => {
          if (m.role === "bot") {
            const isLatestBot = i === msgs.length - 1 || (i === msgs.length - 2 && loading);
            const ui = isLatestBot ? renderUI(m) : null;
            
            // Show collapsed badge for old bot messages with ui_type
            if (!isLatestBot && m.data?.ui_type) {
              return <CollapsedBadge key={i} type={m.data.ui_type} data={m.data.ui_data || {}} fullData={m.data || {}} />;
            }
            
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: T.g[400], marginBottom: 6, lineHeight: 1.4 }}>{m.text}</p>
                {ui || <div style={{ padding: "10px 14px", background: T.white, border: "1px solid " + T.g[100], borderRadius: 14, fontSize: 13, lineHeight: 1.6, color: T.g[700], boxShadow: T.sh.s }}>{m.text}</div>}
              </div>
            );
          }
          return null;
        })}
        {loading && <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: T.white, borderRadius: 14, border: "1px solid " + T.g[100], maxWidth: 70, boxShadow: T.sh.s }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.g[300], animation: "pulse 1.2s " + (i*.2) + "s ease-in-out infinite" }} />)}</div>}
        {error && !loading && <ErrorRetry onRetry={handleRetry} />}
        {done && <div className="si" style={{ textAlign: "center", padding: 16 }}><div style={{ width: 48, height: 48, borderRadius: "50%", background: T.greenLt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 22 }}>✓</div><p style={{ fontSize: 13, fontWeight: 700, color: T.green }}>All meals planned!</p></div>}
      </div>
    </div>
  );
};

// WEEKLY ORDER WIZARD (Agent 3)
const WeeklyOrderWizard = ({ sessionId, onComplete, onRestart }) => {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const hasSent = useRef(false);

  useEffect(() => {
    if (!hasSent.current) {
      hasSent.current = true;
      send("Build my weekly order");
    }
  }, []);

  const send = async (message) => {
    const msgText = typeof message === 'string' ? message : (typeof message === 'object' ? JSON.stringify(message) : String(message));
    if (!msgText.trim()) return;
    
    setLastMessage(msgText.trim());
    setError(null);
    setMsgs(p => [...p, { role: "user", text: msgText.trim() }]);
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.weeklyCart, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message: msgText.trim() }) });
      const raw = await res.text();
      
      if (!raw || raw.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      let data;
      try {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        data = JSON.parse(cleaned);
      } catch {
        data = { message: raw };
      }
      setMsgs(p => [...p, { role: "bot", text: data.message || raw, data }]);
      if (data.stage_complete) {
        setDone(true);
        setTimeout(() => onComplete(data), 1500);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(true);
      setMsgs(p => p.slice(0, -1));
    }
    setLoading(false);
  };
  
  const handleRetry = () => {
    if (lastMessage) {
      send(lastMessage);
    } else {
      send("Build my weekly order");
    }
  };

  const renderUI = (msg) => {
    const { ui_type, ui_data } = msg.data || {};
    if (!ui_type || !ui_data) return null;

    switch (ui_type) {
      case 'delivery_select': return <DeliverySelect data={ui_data} onSelect={send} />;
      case 'weekly_plan': return <WeeklyPlanReview data={ui_data} onConfirm={send} />;
      case 'cart_display': return <CartPreview data={ui_data} onConfirm={send} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg }}>
      <div style={{ padding: "10px 20px", background: T.white, borderBottom: "1px solid " + T.g[100], display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: T.r.m, background: "linear-gradient(135deg, " + T.amber + ", #FBBF24)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14 }}>🛒</span></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>Weekly Order</div></div>
        <button onClick={onRestart} style={{ width: 30, height: 30, borderRadius: T.r.m, border: "1px solid " + T.g[200], background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: T.g[400] }} title="Start over">✕</button>
      </div>
      <JourneyTracker steps={STEPS} current={4} />
      <div className="no-sb" style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
        {msgs.map((m, i) => {
          if (m.role === "bot") {
            const isLatestBot = i === msgs.length - 1 || (i === msgs.length - 2 && loading);
            const ui = isLatestBot ? renderUI(m) : null;
            
            if (!isLatestBot && m.data?.ui_type) {
              return <div key={i} style={{ padding: "8px 12px", background: T.g[50], borderRadius: 10, fontSize: 12, color: T.g[600], fontWeight: 600, marginBottom: 8 }}>✓ {m.data.ui_type === 'delivery_select' ? 'Delivery confirmed' : 'Step completed'}</div>;
            }
            
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: T.g[400], marginBottom: 6, lineHeight: 1.4 }}>{m.text}</p>
                {ui || <div style={{ padding: "10px 14px", background: T.white, border: "1px solid " + T.g[100], borderRadius: 14, fontSize: 13, lineHeight: 1.6, color: T.g[700], boxShadow: T.sh.s }}>{m.text}</div>}
              </div>
            );
          }
          return null;
        })}
        {loading && <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: T.white, borderRadius: 14, border: "1px solid " + T.g[100], maxWidth: 70, boxShadow: T.sh.s }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.g[300], animation: "pulse 1.2s " + (i*.2) + "s ease-in-out infinite" }} />)}</div>}
        {error && !loading && <ErrorRetry onRetry={handleRetry} />}
        {done && <div className="si" style={{ textAlign: "center", padding: 16 }}><div style={{ width: 48, height: 48, borderRadius: "50%", background: T.greenLt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 22 }}>🛒</div><p style={{ fontSize: 13, fontWeight: 700, color: T.green }}>Weekly order ready!</p></div>}
      </div>
    </div>
  );
};

// Agent 3 UI Components
const DeliverySelect = ({ data, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSelect = (option) => {
    if (isSubmitting) return;
    setSelected(option);
    setIsSubmitting(true);
    onSelect(option);
  };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 12 }}>Delivery preference</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(data.options || ['Single delivery', 'Multiple deliveries']).map(opt => {
          const isSelected = selected === opt;
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={isSubmitting} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14,
              border: "2px solid " + (isSelected ? T.brand : T.g[200]), background: isSelected ? T.brandLt : T.white,
              cursor: isSubmitting ? "not-allowed" : "pointer", textAlign: "left",
              opacity: isSubmitting && !isSelected ? 0.5 : 1,
            }}>
              <span style={{ fontSize: 20 }}>{opt.includes('Single') ? '📦' : '📦📦'}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? T.brand : T.dark }}>{opt}</span>
              {isSelected && <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isSubmitting ? <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite" }} /> : <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
              </div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const WeeklyPlanReview = ({ data, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onConfirm("Confirm weekly plan");
  };
  
  return (
    <div className="si" style={{ marginTop: 8 }}>
      <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 12 }}>Your Weekly Plan</p>
        {(data.days || data.meals || []).map((day, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < (data.days || data.meals || []).length - 1 ? "1px solid " + T.g[100] : "none" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{day.day || day.meal_label || `Day ${i + 1}`}</p>
            <p style={{ fontSize: 11, color: T.g[500] }}>{day.products?.join(', ') || day.summary || 'Protein portions planned'}</p>
          </div>
        ))}
      </div>
      <Btn onClick={handleConfirm} full disabled={isSubmitting} loading={isSubmitting} style={{ marginTop: 16 }}>
        {isSubmitting ? "Confirming..." : "Confirm Plan →"}
      </Btn>
    </div>
  );
};

const CartPreview = ({ data, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cart = data.cart || data.items || [];
  const total = data.total_cart_price || data.total || 0;
  
  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onConfirm("Finalize cart");
  };
  
  return (
    <div className="si" style={{ marginTop: 8 }}>
      <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>Cart Preview</p>
          <span style={{ fontSize: 16, fontWeight: 800, color: T.brand, fontFamily: mono }}>₹{total.toLocaleString()}</span>
        </div>
        {cart.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < cart.length - 1 ? "1px solid " + T.g[100] : "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: T.g[100], overflow: "hidden", flexShrink: 0 }}>
              {item.image_url ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🥩</div>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.dark }}>{item.product_name}</p>
              <p style={{ fontSize: 10, color: T.g[500] }}>{item.pack_size_label} x {item.packs_needed || 1}</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.brand, fontFamily: mono }}>₹{item.total_price || item.price}</span>
          </div>
        ))}
      </div>
      <Btn onClick={handleConfirm} full disabled={isSubmitting} loading={isSubmitting} style={{ marginTop: 16 }}>
        {isSubmitting ? "Finalizing..." : "Finalize Order →"}
      </Btn>
    </div>
  );
};

const FinalCart = ({ data }) => {
  const cart = data?.cart || [];
  const total = data?.total_cart_price || 0;
  const perDay = data?.price_per_day || 0;
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div style={{ background: "linear-gradient(150deg, " + T.dark + ", " + T.charcoal + ")", padding: "20px 20px 44px", borderRadius: "0 0 24px 24px" }}>
        <JourneyTracker steps={STEPS} current={5} />
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between" }}>
          <div><p style={{ fontSize: 10, color: T.g[400], textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 3 }}>Weekly Total</p><span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: mono }}>{"₹" + total.toLocaleString()}</span></div>
          <div style={{ textAlign: "right" }}><p style={{ fontSize: 10, color: T.g[400], textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 3 }}>Per Day</p><span style={{ fontSize: 28, fontWeight: 800, color: T.green, fontFamily: mono }}>{"₹" + perDay}</span></div>
        </div>
      </div>
      <div style={{ padding: "0 14px", marginTop: -22 }}>
        {cart.map((item, i) => <div key={i} className={"up" + Math.min(i, 4)} style={{ marginBottom: 10, background: T.white, borderRadius: T.r.l, border: "1px solid " + T.g[100], boxShadow: T.sh.m, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 12, padding: 12 }}>
            <div style={{ width: 68, height: 68, borderRadius: T.r.m, background: T.g[100], overflow: "hidden", flexShrink: 0 }}>
              {item.image_url ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🥩</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 2, lineHeight: 1.3 }}>{item.product_name}</h4>
              <p style={{ fontSize: 11, color: T.g[500], marginBottom: 5 }}>{item.pack_size_label + " x " + item.packs_needed}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.brand, fontFamily: mono }}>{"₹" + item.total_price}</span>
                {item.product_page_url && <a href={item.product_page_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, color: T.brand, textDecoration: "none", padding: "2px 8px", borderRadius: T.r.full, background: T.brandLt }}>View on Licious</a>}
              </div>
            </div>
          </div>
          {item.usage_description && <div style={{ padding: "6px 12px", background: T.g[50], borderTop: "1px solid " + T.g[100], fontSize: 11, color: T.g[500], fontWeight: 500 }}>{"📋 " + item.usage_description}</div>}
        </div>)}
      </div>
      <div style={{ padding: "20px 20px 36px" }}>
        <div style={{ padding: 14, background: T.greenLt, borderRadius: T.r.m, marginBottom: 12, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: T.green, fontWeight: 700 }}>Your weekly protein supply is ready!</p>
          <p style={{ fontSize: 12, color: T.g[500], marginTop: 3 }}>Open each product on Licious to add to cart</p>
        </div>
        <Btn onClick={() => window.location.reload()} v="secondary" full>Start Over</Btn>
      </div>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [sessionId, setSessionId] = useState(genId);
  const [userData, setUserData] = useState(null);
  const [cartData, setCartData] = useState(null);

  const handleRestart = () => {
    if (window.confirm("Start over? Your current progress will be lost.")) {
      setSessionId(genId());
      setUserData(null);
      setCartData(null);
      setScreen("home");
    }
  };

  const handleKnowIt = async (calories, protein) => {
    // Skip to meal planning with manual macros
    const msg = `I know my macros. Daily calories: ${calories}kcal, Daily protein from food: ${protein}g`;
    const res = await fetch(ENDPOINTS.mealPlanning, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message: msg }) });
    const text = await res.text();
    if (!text || text.trim() === '') throw new Error('Empty response');
    setUserData({ daily_calories: calories, daily_protein_g: protein });
    setScreen("meals");
  };

  return (
    <>
      <Styles />
      <Shell>
        {screen === "home" && <Homepage onStart={() => setScreen("macro_fork")} />}
        {screen === "macro_fork" && <MacroFork onKnowIt={handleKnowIt} onCalculate={() => setScreen("calculator_disclaimer")} onRestart={handleRestart} />}
        {screen === "calculator_disclaimer" && <CalculatorDisclaimer onStart={() => setScreen("onboarding")} onRestart={handleRestart} />}
        {screen === "onboarding" && <Onboarding sessionId={sessionId} onComplete={d => { setUserData(d); setScreen("results"); }} onRestart={handleRestart} />}
        {screen === "results" && <Results data={userData} onContinue={() => setScreen("meals")} />}
        {screen === "meals" && <MealPlanningWizard sessionId={sessionId} onComplete={() => setScreen("cart")} onRestart={handleRestart} />}
        {screen === "cart" && <FinalCart data={cartData} />}
      </Shell>
    </>
  );
}
