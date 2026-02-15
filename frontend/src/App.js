import { useState, useEffect, useRef } from "react";

const API_BASE = "https://karanbabbar.app.n8n.cloud/webhook";
const ENDPOINTS = {
  onboarding: `${API_BASE}/v2/onboarding`,
  mealPlanning: `${API_BASE}/v2/meal-planning`,
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
    {(Array.isArray(options) ? options : []).map((opt, idx) => {
      const sel = multi ? (Array.isArray(value) ? value : []).includes(opt?.value) : value === opt?.value;
      return <button key={(opt?.value || idx)} onClick={() => multi ? onChange(sel ? (Array.isArray(value) ? value : []).filter(v=>v!==opt?.value) : [...(Array.isArray(value) ? value : []), opt?.value]) : onChange(opt?.value)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: T.r.full, border: "2px solid " + (sel ? T.brand : T.g[200]), background: sel ? T.brandLt : T.white, color: sel ? T.brand : T.g[700], fontSize: 14, fontWeight: sel ? 700 : 500, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
        {opt?.icon && <span style={{ fontSize: 18 }}>{opt.icon}</span>}{opt?.label || ''}
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

// FIX 1: FormattedText component to render markdown-style bold text
const FormattedText = ({ text }) => {
  if (!text) return null;
  // Replace **bold** with actual bold spans
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p style={{ fontSize: 13, color: T.g[700], lineHeight: 1.6 }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 700, color: T.dark }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </p>
  );
};

// FIX 1: Chat input for text fallback when no ui_type
const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your response..."
        disabled={disabled}
        style={{ flex: 1, padding: "12px 14px", border: "2px solid " + T.g[200], borderRadius: T.r.m, fontSize: 14, fontWeight: 500, background: T.white, color: T.dark, opacity: disabled ? 0.5 : 1 }}
      />
      <button type="submit" disabled={!input.trim() || disabled} style={{ padding: "12px 20px", borderRadius: T.r.m, border: "none", background: input.trim() && !disabled ? T.brand : T.g[200], color: input.trim() && !disabled ? "#fff" : T.g[400], fontWeight: 700, cursor: input.trim() && !disabled ? "pointer" : "not-allowed", transition: "all .2s" }}>
        Send
      </button>
    </form>
  );
};

// V3: Running Cost Banner - persistent display during meal planning
const RunningCostBanner = ({ dailyCost, weeklyCost }) => {
  if (!dailyCost && !weeklyCost) return null;
  return (
    <div style={{ 
      position: "sticky", top: 0, zIndex: 10,
      padding: "10px 16px", 
      background: "linear-gradient(135deg, " + T.dark + ", " + T.charcoal + ")",
      borderRadius: T.r.m, 
      marginBottom: 12,
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      boxShadow: T.sh.m
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>💰</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.g[300] }}>Daily</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.white, fontFamily: mono }}>₹{dailyCost || 0}</span>
      </div>
      <div style={{ height: 16, width: 1, background: T.g[600] }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.g[300] }}>Weekly</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.green, fontFamily: mono }}>₹{weeklyCost || 0}</span>
      </div>
    </div>
  );
};

// V3: NEW - Supplement Ask Component (first screen of meal planning)
const SupplementAsk = ({ data, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const originalProtein = data?.original_protein || 150;
  const mealsPerDay = data?.meals_per_day || 3;
  
  // DEFENSIVE: Ensure options is always an array
  let options = data?.options || [];
  if (!Array.isArray(options)) {
    options = [
      { label: "No supplements", value: "none", grams: 0 },
      { label: "25g (1 scoop whey)", value: "25", grams: 25 },
      { label: "30g supplement", value: "30", grams: 30 },
      { label: "50g supplement", value: "50", grams: 50 },
      { label: "Custom amount", value: "custom", grams: 0 }
    ];
  }
  
  const handleOptionSelect = (opt) => {
    if (isSubmitting) return;
    
    if (opt.value === "custom") {
      setShowCustomInput(true);
      setSelected("custom");
    } else {
      setSelected(opt.value);
      setIsSubmitting(true);
      onSelect({ supplement_grams: opt.grams || 0 });
    }
  };
  
  const handleCustomSubmit = () => {
    if (isSubmitting || !customAmount) return;
    setIsSubmitting(true);
    onSelect({ supplement_grams: Number(customAmount) || 0 });
  };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.brandLt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 22 }}>🥤</div>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.g[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Your daily protein target</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: T.brand, fontFamily: mono }}>{originalProtein}g</p>
        <p style={{ fontSize: 11, color: T.g[400], marginTop: 4 }}>{mealsPerDay} meals per day</p>
      </div>
      
      <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>Do you take protein supplements?</p>
      <p style={{ fontSize: 12, color: T.g[500], marginBottom: 14 }}>We'll deduct this from your food-based protein plan.</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(Array.isArray(options) ? options : []).map((opt, idx) => {
          const isSelected = selected === opt.value;
          const isCustom = opt.value === "custom";
          
          return (
            <button 
              key={opt.value || idx} 
              onClick={() => handleOptionSelect(opt)}
              disabled={isSubmitting && !isCustom}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14,
                border: "2px solid " + (isSelected ? T.brand : T.g[200]), 
                background: isSelected ? T.brandLt : T.white,
                cursor: isSubmitting ? "not-allowed" : "pointer", 
                textAlign: "left",
                opacity: isSubmitting && !isSelected ? 0.5 : 1,
                transition: "all .2s"
              }}
            >
              <div style={{ 
                width: 20, height: 20, borderRadius: "50%", 
                border: "2px solid " + (isSelected ? T.brand : T.g[300]),
                background: isSelected ? T.brand : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                {isSelected && !isCustom && (isSubmitting 
                  ? <div style={{ width: 10, height: 10, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite" }} />
                  : <span style={{ color: "#fff", fontSize: 10 }}>✓</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? T.brand : T.dark }}>{opt.label}</span>
                {opt.grams > 0 && <span style={{ fontSize: 11, color: T.g[400], marginLeft: 8 }}>({originalProtein - opt.grams}g from food)</span>}
              </div>
            </button>
          );
        })}
      </div>
      
      {showCustomInput && (
        <div className="si" style={{ marginTop: 12, padding: 12, background: T.g[50], borderRadius: 12, border: "1px solid " + T.g[200] }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.g[600], marginBottom: 6, display: "block" }}>
            Enter supplement amount (grams/day)
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", border: "2px solid " + T.g[200], borderRadius: 10, background: T.white, overflow: "hidden" }}>
              <input 
                type="number" 
                placeholder="e.g. 35" 
                value={customAmount} 
                onChange={e => setCustomAmount(e.target.value)}
                disabled={isSubmitting}
                style={{ flex: 1, padding: "10px 12px", border: "none", fontSize: 16, fontWeight: 600, background: "transparent", color: T.dark }}
              />
              <span style={{ padding: "0 12px", fontSize: 13, fontWeight: 600, color: T.g[400] }}>g</span>
            </div>
            <Btn onClick={handleCustomSubmit} disabled={!customAmount || isSubmitting} loading={isSubmitting}>
              Confirm
            </Btn>
          </div>
          {customAmount && (
            <p style={{ fontSize: 11, color: T.g[500], marginTop: 8 }}>
              You'll need <strong style={{ color: T.brand }}>{originalProtein - Number(customAmount)}g</strong> protein from food
            </p>
          )}
        </div>
      )}
    </div>
  );
};

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
// FIX 4: Now accepts msgs array to look for latest confirmed budget values
// V3: Collapsed Badge for previous responses
const CollapsedBadge = ({ type, data, fullData, msgs = [], msgIndex = 0 }) => {
  let text = "";
  switch (type) {
    case 'supplement_ask':
      const supplementG = data?.supplement_g || data?.grams || 0;
      text = supplementG > 0 ? `✓ ${supplementG}g supplements/day` : "✓ No supplements";
      break;
    case 'budget_setup':
      // Look for the confirmed distribution in subsequent messages
      let dist = null;
      let selectedLabel = 'Distribution';
      let proteinTarget = 150;
      
      for (let i = msgIndex + 1; i < msgs.length; i++) {
        const m = msgs[i];
        if (m.data?.budget?.distribution && m.data?.budget?.confirmed) {
          dist = m.data.budget.distribution;
          selectedLabel = m.data.budget.selected_distribution || selectedLabel;
          proteinTarget = m.data.budget.meal_budget_g || proteinTarget;
          break;
        }
        if (m.data?.budget?.distribution) {
          dist = m.data.budget.distribution;
          selectedLabel = m.data.budget.selected_distribution || selectedLabel;
          proteinTarget = m.data.budget.meal_budget_g || proteinTarget;
        }
      }
      
      // Fallback to current message data
      if (!dist) {
        dist = fullData?.budget?.distribution || data?.budget?.distribution;
        selectedLabel = fullData?.budget?.selected_distribution || data?.selected_distribution || data?.distributions?.[0]?.label || 'Distribution';
        proteinTarget = fullData?.budget?.meal_budget_g || data?.protein_target || 150;
      }
      
      if (dist && dist.breakfast > 0) {
        text = `✓ ${selectedLabel} — ${dist.breakfast}g / ${dist.lunch}g / ${dist.dinner}g`;
      } else {
        const calculated = calculateDistribution(selectedLabel, proteinTarget);
        text = `✓ ${selectedLabel} — ${calculated.breakfast}g / ${calculated.lunch}g / ${calculated.dinner}g`;
      }
      break;
    case 'source_select':
      const sources = data?.sources || [];
      text = sources.length > 0 ? `✓ Sources: ${sources.join(', ')}` : "✓ Sources selected";
      break;
    case 'cut_select':
      const cut = data?.cut || data?.category;
      text = cut ? `✓ Cut: ${cut}` : "✓ Cut type selected";
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
      text = data?.meal_label ? `✓ ${data.meal_label} locked — ${protein}g` : "✓ Meal locked";
      break;
    case 'consolidation':
      text = "✓ Meal plan confirmed";
      break;
    case 'weekly_summary':
      const totalPrice = data?.total_cart_price || 0;
      text = totalPrice > 0 ? `✓ Weekly cart — ₹${totalPrice}` : "✓ Weekly plan confirmed";
      break;
    case 'delivery_frequency':
      const freq = data?.frequency || '';
      const freqLabels = { daily: "Daily", every_2_days: "Every 2 days", every_3_days: "Every 3 days", weekly: "Weekly" };
      text = freq ? `✓ Delivery: ${freqLabels[freq] || freq}` : "✓ Delivery frequency selected";
      break;
    case 'delivery_select':
      const slot = data?.time_slot || data?.delivery_slot || '';
      const slotLabels = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };
      text = slot ? `✓ Time slot: ${slotLabels[slot] || slot}` : "✓ Time slot selected";
      break;
    case 'order_confirmed':
      text = "✓ Order confirmed!";
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

// V3: Budget Setup Component - shows protein deduction math + distribution selection
const DistributionSetup = ({ data, onSelect }) => {
  const [sel, setSel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // V3: New fields from backend
  const proteinTarget = data?.protein_target || 150;
  const supplementG = data?.supplement_g || 0;
  const originalProtein = data?.original_protein || proteinTarget + supplementG;
  const mealsPerDay = data?.meals_per_day || 3;
  
  // DEFENSIVE: Convert distributions from object to array if needed
  let rawDistributions = data?.distributions || [];
  let distributions = [];
  
  if (Array.isArray(rawDistributions)) {
    distributions = rawDistributions;
  } else if (typeof rawDistributions === 'object' && rawDistributions !== null) {
    const iconMap = { equal: "⚖️", heavy_breakfast: "🌅", heavy_lunch: "☀️", heavy_dinner: "🌙", custom: "🎯" };
    const labelMap = { equal: "Equal", heavy_breakfast: "Heavy Breakfast", heavy_lunch: "Heavy Lunch", heavy_dinner: "Heavy Dinner", custom: "Custom" };
    distributions = Object.entries(rawDistributions).map(([key, values]) => ({
      label: labelMap[key] || key,
      icon: iconMap[key] || "⚖️",
      values: values,
      ...(typeof values === 'object' ? values : {})
    }));
  }
  
  if (!Array.isArray(distributions)) distributions = [];
  
  // Get distribution values - V3 format uses nested "values" object
  const getDistributionValues = (d) => {
    // V3 format: { label, icon, values: { breakfast, lunch, dinner } }
    if (d?.values?.breakfast !== undefined) {
      return [d.values.breakfast || 0, d.values.lunch || 0, d.values.dinner || 0];
    }
    // Legacy format
    if (d?.breakfast > 0 || d?.lunch > 0 || d?.dinner > 0) {
      return [d.breakfast || 0, d.lunch || 0, d.dinner || 0];
    }
    // Fallback calculation
    const calculated = calculateDistribution(d?.label, proteinTarget);
    return [calculated.breakfast, calculated.lunch, calculated.dinner];
  };
  
  const handleSelect = (d) => {
    if (isSubmitting) return;
    setSel(d.label);
    setIsSubmitting(true);
    // V3: Send just the distribution label - supplement was already handled in supplement_ask
    onSelect({ distribution: d.label });
  };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      {/* V3: Show protein deduction math */}
      <div style={{ textAlign: "center", marginBottom: 16, padding: 14, background: T.g[50], borderRadius: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.g[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Protein from food</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: T.brand, fontFamily: mono }}>{proteinTarget}g</p>
        {supplementG > 0 && (
          <p style={{ fontSize: 11, color: T.g[500], marginTop: 6 }}>
            {originalProtein}g daily − {supplementG}g supplements = <strong style={{ color: T.brand }}>{proteinTarget}g</strong> from food
          </p>
        )}
      </div>
      
      <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>How to split across {mealsPerDay} meals?</p>
      <p style={{ fontSize: 12, color: T.g[500], marginBottom: 14 }}>Choose a distribution pattern</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(Array.isArray(distributions) ? distributions : []).map((d, idx) => {
          const colors = [T.brand, T.green, T.blue];
          const meals = ["Breakfast", "Lunch", "Dinner"];
          const values = getDistributionValues(d || {});
          const isSelected = sel === (d?.label || idx);
          
          return (
            <button key={d?.label || idx} onClick={() => handleSelect(d)} disabled={isSubmitting} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14,
              border: "2px solid " + (isSelected ? T.brand : T.g[200]), 
              background: isSelected ? T.brandLt : T.white,
              cursor: isSubmitting ? "not-allowed" : "pointer", 
              textAlign: "left",
              opacity: isSubmitting && !isSelected ? 0.5 : 1,
              transition: "all .2s"
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{d?.icon || "⚖️"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? T.brand : T.dark, marginBottom: 8 }}>{d?.label || "Option"}</div>
                {/* V3: Show prominent numbers for each meal */}
                <div style={{ display: "flex", gap: 6 }}>
                  {meals.map((m, i) => (
                    <div key={m} style={{ 
                      flex: 1, 
                      padding: "6px 8px", 
                      background: isSelected ? colors[i] + "15" : T.g[100], 
                      borderRadius: 8,
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: 10, color: T.g[500], display: "block" }}>{m}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: isSelected ? colors[i] : T.g[600], fontFamily: mono }}>{values[i]}g</span>
                    </div>
                  ))}
                </div>
              </div>
              {isSelected && (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isSubmitting 
                    ? <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite" }} /> 
                    : <span style={{ color: "#fff", fontSize: 11 }}>✓</span>
                  }
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// V3: Source Select Component - multi-select with carried portions info
const SourceChips = ({ data, onSelect }) => {
  const [selected, setSelected] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxSources = 3;
  
  // V3: Handle ui_data fields
  const mealLabel = data?.meal_label || data?.meal || "Meal";
  const proteinTarget = data?.protein_target || data?.target || 0;
  
  // V3: Carried portions from leftover packs
  const carriedPortions = data?.carried_portions || [];
  const carriedProtein = (Array.isArray(carriedPortions) ? carriedPortions : [])
    .reduce((sum, p) => sum + (p?.protein_g || 0), 0);
  const remainingTarget = Math.max(0, proteinTarget - carriedProtein);
  
  // DEFENSIVE: Ensure rawSources is always an array
  let rawSources = data?.available_sources || data?.sources || [];
  if (!Array.isArray(rawSources)) {
    if (typeof rawSources === 'object' && rawSources !== null) {
      rawSources = Object.keys(rawSources);
    } else if (typeof rawSources === 'string') {
      rawSources = [rawSources];
    } else {
      rawSources = [];
    }
  }
  
  const iconMap = { eggs: "🥚", chicken: "🍗", fish: "🐟", mutton: "🍖" };
  const sources = rawSources.map(s => 
    typeof s === 'string' 
      ? { name: s, icon: iconMap[(s || '').toLowerCase()] || "🍖" } 
      : { name: s?.name || 'Unknown', icon: s?.icon || iconMap[(s?.name || '').toLowerCase()] || '🍖' }
  );
  
  const handleSubmit = () => {
    if (selected.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    // V3: Send sources array
    onSelect({ sources: selected });
  };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: 10, 
          background: mealLabel === "Breakfast" ? T.brandLt : mealLabel === "Lunch" ? T.greenLt : T.blueLt,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>
          {mealLabel === "Breakfast" ? "🌅" : mealLabel === "Lunch" ? "☀️" : "🌙"}
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: T.dark }}>{mealLabel}</p>
          <p style={{ fontSize: 12, color: T.g[500] }}>{proteinTarget}g protein target</p>
        </div>
      </div>
      
      {/* V3: Show carried portions info */}
      {carriedProtein > 0 && (
        <div style={{ padding: "10px 12px", background: T.greenLt, borderRadius: 10, border: "1px solid " + T.green + "30", marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: T.green }}>
            ✓ {Math.round(carriedProtein * 10) / 10}g protein carried over from leftover packs
          </p>
          <p style={{ fontSize: 11, color: T.g[600], marginTop: 2 }}>
            Need <strong>{remainingTarget}g</strong> more from new products
          </p>
        </div>
      )}
      
      <p style={{ fontSize: 12, color: T.g[500], marginBottom: 12 }}>Choose 1-{maxSources} protein sources</p>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {(Array.isArray(sources) ? sources : []).map((s, idx) => {
          const sourceName = (s?.name || '').toLowerCase();
          const isSelected = selected.includes(sourceName);
          const canSelect = selected.length < maxSources || isSelected;
          
          return (
            <button 
              key={(s?.name || idx) + idx} 
              onClick={() => {
                if (isSubmitting) return;
                if (isSelected) {
                  setSelected(prev => prev.filter(n => n !== sourceName));
                } else if (canSelect) {
                  setSelected(prev => [...prev, sourceName]);
                }
              }}
              disabled={(!canSelect && !isSelected) || isSubmitting}
              style={{ 
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "14px 20px", borderRadius: 16, 
                border: "2px solid " + (isSelected ? T.brand : T.g[200]), 
                background: isSelected ? T.brandLt : T.white, 
                cursor: (canSelect && !isSubmitting) ? "pointer" : "not-allowed", 
                transition: "all .2s", 
                opacity: ((!canSelect && !isSelected) || isSubmitting) ? 0.5 : 1,
                minWidth: 80
              }}
            >
              <span style={{ fontSize: 28 }}>{s?.icon || "🍖"}</span>
              <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? T.brand : T.dark, textTransform: "capitalize" }}>
                {s?.name || 'Unknown'}
              </span>
              {isSelected && <span style={{ fontSize: 10, color: T.brand }}>✓ Selected</span>}
            </button>
          );
        })}
      </div>
      
      <Btn onClick={handleSubmit} full disabled={selected.length === 0 || isSubmitting} loading={isSubmitting} style={{ marginTop: 16 }}>
        {isSubmitting ? "Submitting..." : `Continue with ${selected.length} source${selected.length !== 1 ? 's' : ''} →`}
      </Btn>
    </div>
  );
};

// V3: Cut Select Component - single select, skipped for eggs
const CutChips = ({ data, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // V3: Handle ui_data fields
  const category = data?.category || data?.source || data?.protein_source || "Protein";
  const categoryIcon = { chicken: "🍗", fish: "🐟", mutton: "🍖" }[(category || '').toLowerCase()] || "🍖";
  
  // DEFENSIVE: Ensure cuts is always an array
  let rawCuts = data?.cuts || data?.cut_options || data?.options || [];
  let cuts = [];
  if (Array.isArray(rawCuts)) {
    cuts = rawCuts;
  } else if (typeof rawCuts === 'object' && rawCuts !== null) {
    cuts = Object.entries(rawCuts).map(([key, val]) => 
      typeof val === 'object' ? { name: key, ...val } : key
    );
  } else if (typeof rawCuts === 'string') {
    cuts = [rawCuts];
  }
  
  const handleSelect = (cut) => {
    if (isSubmitting) return;
    const cutName = typeof cut === 'string' ? cut : (cut?.name || cut?.label || cut);
    setSelected(cutName);
    setIsSubmitting(true);
    // V3: Send cut selection
    onSelect({ cut: cutName });
  };
  
  // Don't render if no cuts available
  if (!cuts || cuts.length === 0) {
    return (
      <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 12 }}>{category} cut preference</p>
        <p style={{ fontSize: 12, color: T.g[400] }}>No cut options available</p>
      </div>
    );
  }
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 28 }}>{categoryIcon}</span>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: T.dark, textTransform: "capitalize" }}>What type of {category}?</p>
          <p style={{ fontSize: 12, color: T.g[500] }}>Select your preferred cut</p>
        </div>
      </div>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {cuts.map((cut, idx) => {
          const cutName = typeof cut === 'string' ? cut : (cut?.name || cut?.label || `Option ${idx + 1}`);
          const isSelected = selected === cutName;
          
          return (
            <button 
              key={cutName + idx} 
              onClick={() => handleSelect(cutName)}
              disabled={isSubmitting}
              style={{ 
                display: "flex", alignItems: "center", gap: 8, 
                padding: "12px 20px", borderRadius: T.r.full, 
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
              {cutName}
              {isSelected && (
                isSubmitting 
                  ? <div style={{ width: 14, height: 14, border: "2px solid " + T.brand + "40", borderTopColor: T.brand, borderRadius: "50%", animation: "spin .6s linear infinite" }} /> 
                  : <span style={{ marginLeft: 4 }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// V3: Product Select Component - GROUP BY SOURCE with "pick 1" per category
const ProductCardGrid = ({ data, onSelect }) => {
  const [selected, setSelected] = useState({});  // V3: { source: productName }
  const [submitted, setSubmitted] = useState(false);
  
  // V3: Handle ui_data fields
  const mealLabel = data?.meal_label || data?.meal || "Meal";
  const proteinTarget = data?.protein_target || data?.target || 50;
  const sourcesSelected = data?.sources_selected || [];
  
  // V3: products_by_source is the preferred grouping structure
  const productsBySourceMap = data?.products_by_source || {};
  
  // DEFENSIVE: Ensure rawProducts is always an array
  let rawProducts = data?.products || data?.items || [];
  if (!Array.isArray(rawProducts)) {
    if (typeof rawProducts === 'object' && rawProducts !== null) {
      rawProducts = Object.values(rawProducts);
    } else {
      rawProducts = [];
    }
  }
  
  // V3: Group products by category/source
  const productsByCategory = {};
  
  // Use products_by_source keys if available, otherwise derive from products
  const sourceKeys = Object.keys(productsBySourceMap).length > 0 
    ? Object.keys(productsBySourceMap)
    : [...new Set((Array.isArray(rawProducts) ? rawProducts : []).map(p => (p?.category || p?.source || 'other').toLowerCase()))];
  
  sourceKeys.forEach(source => {
    const sourceProducts = (Array.isArray(rawProducts) ? rawProducts : [])
      .filter(p => (p?.category || p?.source || '').toLowerCase() === source.toLowerCase());
    if (sourceProducts.length > 0) {
      productsByCategory[source] = sourceProducts;
    }
  });
  
  // Calculate how many sources need selections
  const totalSourcesToSelect = Object.keys(productsByCategory).length;
  const selectedCount = Object.keys(selected).length;
  const allSourcesSelected = selectedCount >= totalSourcesToSelect;
  
  // Handle product selection - V3: one product per source category
  const handleProductSelect = (product, sourceCategory) => {
    if (submitted) return;
    const productName = product?.product_name || product?.name;
    const category = (sourceCategory || product?.category || product?.source || 'other').toLowerCase();
    
    setSelected(prev => {
      // If same product is already selected, deselect
      if (prev[category] === productName) {
        const { [category]: _, ...rest } = prev;
        return rest;
      }
      // Otherwise select this product for the category (replaces any previous)
      return { ...prev, [category]: productName };
    });
  };
  
  const handleSubmit = () => {
    if (!allSourcesSelected || submitted) return;
    setSubmitted(true);
    // V3: Send array of selected product names
    onSelect({ products: Object.values(selected) });
  };
  
  const categoryIcons = { chicken: '🍗', eggs: '🥚', fish: '🐟', mutton: '🍖' };
  const categoryLabels = { chicken: 'Chicken', eggs: 'Eggs', fish: 'Fish', mutton: 'Mutton' };
  
  // Render a category section with its products
  const renderCategorySection = (category, products) => {
    const icon = categoryIcons[(category || '').toLowerCase()] || '🍖';
    const label = categoryLabels[(category || '').toLowerCase()] || category;
    const selectedProduct = selected[category.toLowerCase()];
    
    // V3: For chicken/fish/mutton, show cut type in header if available
    const cutType = products[0]?.cut_type;
    const headerLabel = cutType ? `${label} (${cutType})` : label;
    
    return (
      <div key={category} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>
            {icon} {headerLabel}
          </span>
          <span style={{ 
            fontSize: 10, fontWeight: 700, 
            color: selectedProduct ? T.green : T.brand, 
            background: selectedProduct ? T.greenLt : T.brandLt, 
            padding: "4px 10px", borderRadius: 99 
          }}>
            {selectedProduct ? "✓ Selected" : "Pick 1"}
          </span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(Array.isArray(products) ? products : []).map((p, i) => {
            const productName = p?.product_name || p?.name || 'Product';
            const productCategory = (p?.category || p?.source || category || 'other').toLowerCase();
            const isSelected = selected[productCategory] === productName;
            
            // V3: Show protein_per_pack for better comparison
            const proteinPerPack = p?.protein_per_pack || 0;
            const proteinDisplay = productCategory === 'eggs'
              ? `${proteinPerPack}g/pack`
              : p?.protein_per_100g 
                ? `${p.protein_per_100g}g/100g` 
                : proteinPerPack ? `${Math.round(proteinPerPack)}g/pack` : '';
            
            return (
              <button key={i} onClick={() => handleProductSelect(p, category)} disabled={submitted} style={{
                padding: 10, borderRadius: 14, 
                border: "2px solid " + (isSelected ? T.brand : T.g[200]),
                background: isSelected ? T.brandLt : T.white, 
                cursor: submitted ? "not-allowed" : "pointer", 
                textAlign: "left",
                boxShadow: isSelected ? "0 4px 12px " + T.brand + "20" : "0 1px 4px rgba(0,0,0,0.04)",
                opacity: submitted ? 0.7 : 1,
                transition: "all .2s"
              }}>
                <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, background: T.g[100], overflow: "hidden", marginBottom: 8, position: "relative" }}>
                  {p?.image_url ? (
                    <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{icon}</div>
                  )}
                  {isSelected && (
                    <div style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.dark, lineHeight: 1.3, marginBottom: 4, minHeight: 32 }}>{productName}</p>
                <p style={{ fontSize: 10, color: T.g[500], marginBottom: 6 }}>{p?.pack_size_label || p?.pack_size || ''}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.brand, fontFamily: mono }}>₹{p?.price || 0}</span>
                  {proteinDisplay && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: T.green, background: T.greenLt, padding: "3px 6px", borderRadius: 99 }}>
                      {proteinDisplay}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="si" style={{ marginTop: 8 }}>
      {/* Header */}
      <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: 10, 
            background: mealLabel === "Breakfast" ? T.brandLt : mealLabel === "Lunch" ? T.greenLt : T.blueLt,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>
            {mealLabel === "Breakfast" ? "🌅" : mealLabel === "Lunch" ? "☀️" : "🌙"}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: T.dark }}>{mealLabel} — Pick products</p>
            <p style={{ fontSize: 12, color: T.g[500] }}>{proteinTarget}g protein target</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: T.g[400] }}>Select 1 product from each category below</p>
      </div>
      
      {/* V3: Render each category section */}
      {Object.entries(productsByCategory).map(([category, products]) => 
        renderCategorySection(category, products)
      )}
      
      {/* Selection status */}
      {selectedCount > 0 && !allSourcesSelected && (
        <div style={{ padding: "10px 14px", background: T.amberLt, border: "1px solid " + T.amber + "40", borderRadius: 12, marginBottom: 12, fontSize: 12, color: T.amber, fontWeight: 600 }}>
          ⚠️ Select 1 product from each category ({selectedCount}/{totalSourcesToSelect} selected)
        </div>
      )}
      
      <Btn onClick={handleSubmit} full disabled={!allSourcesSelected || submitted} loading={submitted} style={{ marginTop: 8 }}>
        {submitted ? "Submitting..." : allSourcesSelected ? "Select These Products →" : `Select from all categories (${selectedCount}/${totalSourcesToSelect})`}
      </Btn>
    </div>
  );
};

// V3: Portion Confirm Component - portions summary + utilization options per product
const PortionConfirmCard = ({ data, onConfirm }) => {
  const [utilization, setUtilization] = useState({});
  const [locked, setLocked] = useState(false);
  
  // V3: Handle ui_data fields
  const mealLabel = data?.meal_label || data?.meal || "Meal";
  const proteinTarget = data?.protein_target || data?.target || 50;
  const price = data?.price || 0;
  
  // DEFENSIVE: Ensure portions is always an array
  let portions = data?.portions || data?.items || [];
  if (!Array.isArray(portions)) {
    if (typeof portions === 'object' && portions !== null) {
      portions = Object.values(portions);
    } else {
      portions = [];
    }
  }
  
  // DEFENSIVE: Ensure utilizationOptions is always an array
  let utilizationOptions = data?.utilization_options || data?.leftover_options || [];
  if (!Array.isArray(utilizationOptions)) {
    if (typeof utilizationOptions === 'object' && utilizationOptions !== null) {
      utilizationOptions = Object.values(utilizationOptions);
    } else {
      utilizationOptions = [];
    }
  }
  
  const totalProtein = data?.total_protein || (Array.isArray(portions) ? portions : []).reduce((s, p) => s + (p?.protein_g || p?.protein || 0), 0);
  const total = Math.round(totalProtein * 10) / 10;
  
  // V3: Check if all products with utilization options have been selected
  const allUtilizationSelected = (Array.isArray(utilizationOptions) ? utilizationOptions : []).every(
    item => utilization[item?.product_name || item?.name]
  );
  
  const handleUtilizationSelect = (productName, value) => {
    if (locked) return;
    setUtilization(prev => ({ ...prev, [productName]: value }));
  };
  
  const handleConfirm = () => {
    if (locked) return;
    // V3: Check if all utilization options are selected
    if ((Array.isArray(utilizationOptions) ? utilizationOptions : []).length > 0 && !allUtilizationSelected) return;
    setLocked(true);
    // V3: Send utilization map
    onConfirm({ utilization: utilization });
  };
  
  const categoryIcons = { chicken: '🍗', eggs: '🥚', fish: '🐟', mutton: '🍖' };
  
  return (
    <div className="si">
      {/* Section 1: Portions Summary */}
      <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{mealLabel === "Breakfast" ? "🌅" : mealLabel === "Lunch" ? "☀️" : "🌙"}</span>
            <p style={{ fontSize: 15, fontWeight: 800, color: T.dark }}>{mealLabel}</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: total >= proteinTarget ? T.green : T.amber, background: total >= proteinTarget ? T.greenLt : T.amberLt, padding: "4px 10px", borderRadius: 99 }}>
            {total >= proteinTarget ? "✓ Target met" : `${total}/${proteinTarget}g`}
          </span>
        </div>
        
        {(Array.isArray(portions) ? portions : []).map((p, i) => {
          const productName = p?.product_name || p?.name || "Product";
          const category = (p?.category || '').toLowerCase();
          const icon = categoryIcons[category] || '🍖';
          const proteinG = p?.protein_g || p?.protein || 0;
          const quantity = p?.quantity || p?.qty || "";
          const packInfo = p?.pack_info || p?.pack || "";
          const remaining = p?.remaining || "";
          
          return (
            <div key={i} style={{ padding: "12px 0", borderBottom: i < portions.length - 1 ? "1px solid " + T.g[100] : "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {p?.image_url ? (
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: T.g[100], overflow: "hidden", flexShrink: 0 }}>
                    <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  </div>
                ) : (
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>{productName}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.green, fontFamily: mono }}>{Math.round(proteinG * 10) / 10}g</span>
                  </div>
                  {quantity && <p style={{ fontSize: 12, color: T.g[600], marginBottom: 2 }}>{quantity} → {Math.round(proteinG * 10) / 10}g protein</p>}
                  {packInfo && <p style={{ fontSize: 11, color: T.g[400] }}>{packInfo}</p>}
                  {remaining && <p style={{ fontSize: 11, color: T.amber, fontWeight: 600, marginTop: 4 }}>• {remaining}</p>}
                </div>
              </div>
              
              {/* Progress bar */}
              <div style={{ height: 4, background: T.g[100], borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
                <div style={{ height: "100%", width: Math.min(100, (proteinG / proteinTarget) * 100) + "%", background: "linear-gradient(90deg, " + T.green + ", #34D399)", borderRadius: 2, transition: "width .6s ease" }} />
              </div>
            </div>
          );
        })}
        
        {/* Total & Price */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0", borderTop: "1px solid " + T.g[100], marginTop: 8 }}>
          <div>
            <span style={{ fontSize: 12, color: T.g[500] }}>Total protein</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.green, fontFamily: mono, marginLeft: 8 }}>{total}g</span>
            <span style={{ fontSize: 12, color: T.g[400] }}> / {proteinTarget}g</span>
          </div>
          {price > 0 && (
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 10, color: T.g[500], display: "block" }}>Est. meal cost</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: T.brand, fontFamily: mono }}>₹{price}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: V3 Utilization Options */}
      {(Array.isArray(utilizationOptions) ? utilizationOptions : []).length > 0 && (
        <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: T.dark, marginBottom: 4 }}>Pack utilization</p>
          <p style={{ fontSize: 12, color: T.g[500], marginBottom: 14 }}>What to do with leftover portions?</p>
          
          {(Array.isArray(utilizationOptions) ? utilizationOptions : []).map((item, idx) => {
            const itemProductName = item?.product_name || item?.name || "Product";
            const itemRemaining = item?.remaining || item?.leftover || "";
            const itemRemainingAmount = item?.remaining_amount || 0;
            const itemOptions = Array.isArray(item?.options) ? item.options : [];
            const selectedValue = utilization[itemProductName];
            
            return (
              <div key={idx} style={{ marginBottom: idx < utilizationOptions.length - 1 ? 20 : 0, padding: 14, background: T.g[50], borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>{itemProductName}</span>
                  {itemRemainingAmount > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.amber, background: T.amberLt, padding: "2px 8px", borderRadius: 99 }}>
                      {itemRemainingAmount} remaining
                    </span>
                  )}
                </div>
                {itemRemaining && <p style={{ fontSize: 11, color: T.g[500], marginBottom: 10 }}>{itemRemaining}</p>}
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(Array.isArray(itemOptions) ? itemOptions : []).map((opt, optIdx) => {
                    const optValue = opt?.value || opt?.label || `option_${optIdx}`;
                    const optLabel = opt?.label || opt?.value || `Option ${optIdx + 1}`;
                    const isSelected = selectedValue === optValue;
                    const days = opt?.days;
                    const switchProduct = opt?.product;
                    
                    return (
                      <button 
                        key={optIdx} 
                        onClick={() => handleUtilizationSelect(itemProductName, optValue)}
                        disabled={locked}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                          borderRadius: 10, border: "2px solid " + (isSelected ? T.brand : T.g[200]),
                          background: isSelected ? T.brandLt : T.white, cursor: locked ? "not-allowed" : "pointer",
                          textAlign: "left", opacity: locked ? 0.7 : 1, transition: "all .2s"
                        }}
                      >
                        <div style={{ 
                          width: 18, height: 18, borderRadius: "50%", 
                          border: "2px solid " + (isSelected ? T.brand : T.g[300]),
                          background: isSelected ? T.brand : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                        }}>
                          {isSelected && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? T.brand : T.dark }}>
                            {optLabel}
                          </span>
                          {days && <span style={{ fontSize: 10, color: T.g[400], marginLeft: 6 }}>({days} days)</span>}
                          {switchProduct && <span style={{ fontSize: 10, color: T.green, marginLeft: 6 }}>→ {switchProduct}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lock Button */}
      <Btn 
        onClick={handleConfirm} 
        full 
        disabled={((Array.isArray(utilizationOptions) ? utilizationOptions : []).length > 0 && !allUtilizationSelected) || locked} 
        loading={locked} 
        style={{ marginTop: 14 }}
      >
        {locked ? "Locking..." : `Lock ${mealLabel} →`}
      </Btn>
      
      {(Array.isArray(utilizationOptions) ? utilizationOptions : []).length > 0 && !allUtilizationSelected && !locked && (
        <p style={{ fontSize: 11, color: T.g[400], textAlign: "center", marginTop: 8 }}>
          Select utilization for all products to continue
        </p>
      )}
    </div>
  );
};

// V3: Meal Confirmed Badge with Edit button + running cost display
const MealBadge = ({ data, onEdit }) => {
  const mealLabel = data?.meal_label || data?.meal || "Meal";
  const totalProtein = data?.total_protein || data?.protein || 0;
  const runningPriceDaily = data?.running_price_daily || data?.running_price || data?.price || 0;
  const runningPriceWeekly = data?.running_price_weekly || runningPriceDaily * 7;
  
  // V3: days_covered info
  const daysCovered = data?.days_covered || [];
  const products = data?.products || [];
  
  return (
    <div className="si" style={{ marginTop: 8 }}>
      {/* Meal Confirmed Card */}
      <div style={{ padding: "14px 16px", background: T.greenLt, borderRadius: 14, border: "1px solid " + T.green + "30" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14 }}>✓</span>
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.green }}>{mealLabel} locked</span>
              <span style={{ fontSize: 12, color: T.g[600], display: "block" }}>{Math.round(totalProtein * 10) / 10}g protein</span>
            </div>
          </div>
          
          {/* V3: Edit button */}
          {onEdit && (
            <button 
              onClick={() => onEdit({ edit_meal: mealLabel.toLowerCase() })}
              style={{ 
                fontSize: 12, fontWeight: 600, color: T.brand, 
                background: T.white, border: "1px solid " + T.brand + "40", 
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4
              }}
            >
              ✏️ Edit
            </button>
          )}
        </div>
        
        {/* V3: Show products and days covered */}
        {(Array.isArray(daysCovered) ? daysCovered : []).length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + T.green + "20" }}>
            {daysCovered.map((item, i) => (
              <p key={i} style={{ fontSize: 11, color: T.g[600], marginBottom: 2 }}>
                • {item?.product_name} <span style={{ color: T.g[400] }}>({item?.days} day{item?.days !== 1 ? 's' : ''})</span>
              </p>
            ))}
          </div>
        )}
        
        {(Array.isArray(daysCovered) ? daysCovered : []).length === 0 && (Array.isArray(products) ? products : []).length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + T.green + "20" }}>
            {products.map((p, i) => (
              <p key={i} style={{ fontSize: 11, color: T.g[600], marginBottom: 2 }}>• {p}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* V3: Running Cost Banner */}
      <div style={{ 
        marginTop: 8, padding: "10px 14px", 
        background: T.dark, borderRadius: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12 }}>📊</span>
          <span style={{ fontSize: 11, color: T.g[400] }}>Daily so far:</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.white, fontFamily: mono }}>₹{runningPriceDaily}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: T.g[400] }}>Est. weekly:</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.green, fontFamily: mono }}>₹{runningPriceWeekly}</span>
        </div>
      </div>
    </div>
  );
};

// V3: NEW - Consolidation Component (after all meals confirmed)
const Consolidation = ({ data, onAction }) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const suggestions = data?.suggestions || [];
  const totalDailyPrice = data?.total_daily_price || 0;
  const totalWeeklyPrice = data?.total_weekly_price || 0;
  
  // DEFENSIVE: Ensure meals_summary is always an array
  let mealsSummary = data?.meals_summary || [];
  if (!Array.isArray(mealsSummary)) {
    mealsSummary = typeof mealsSummary === 'object' ? Object.values(mealsSummary) : [];
  }
  
  const mealIcons = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" };
  
  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onAction({ confirm: true });
  };
  
  const handleEditMeal = (mealLabel) => {
    if (isSubmitting) return;
    setShowEditMenu(false);
    onAction({ edit_meal: mealLabel.toLowerCase() });
  };
  
  return (
    <div className="si" style={{ marginTop: 8 }}>
      {/* Header */}
      <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>📋</span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: T.dark }}>Your Meal Plan Summary</p>
            <p style={{ fontSize: 12, color: T.g[500] }}>Review before building weekly plan</p>
          </div>
        </div>
        
        {/* Meals Summary */}
        {(Array.isArray(mealsSummary) ? mealsSummary : []).map((meal, idx) => {
          const label = meal?.label || "Meal";
          const targetG = meal?.target_g || 0;
          const actualG = meal?.actual_g || 0;
          const products = meal?.products || [];
          const isOnTarget = actualG >= targetG * 0.95;
          
          return (
            <div key={idx} style={{ padding: "14px 0", borderBottom: idx < mealsSummary.length - 1 ? "1px solid " + T.g[100] : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{mealIcons[label] || "🍽"}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>{label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isOnTarget ? T.green : T.amber }}>
                    {Math.round(actualG * 10) / 10}g / {targetG}g {isOnTarget ? "✓" : ""}
                  </span>
                  <button 
                    onClick={() => handleEditMeal(label)}
                    style={{ 
                      fontSize: 11, fontWeight: 600, color: T.brand, 
                      background: T.brandLt, border: "none", 
                      borderRadius: 6, padding: "4px 10px", cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div style={{ marginLeft: 26 }}>
                {(Array.isArray(products) ? products : []).map((p, i) => (
                  <p key={i} style={{ fontSize: 12, color: T.g[600], marginBottom: 2 }}>• {p}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Cost Summary */}
      <div style={{ padding: 16, background: T.dark, borderRadius: 14, marginBottom: 12, display: "flex", justifyContent: "space-around" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 10, color: T.g[400], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Daily Cost</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: T.white, fontFamily: mono }}>₹{totalDailyPrice}</p>
        </div>
        <div style={{ width: 1, background: T.g[600] }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 10, color: T.g[400], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Weekly Cost</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: T.green, fontFamily: mono }}>₹{totalWeeklyPrice}</p>
        </div>
      </div>
      
      {/* Suggestions */}
      {(Array.isArray(suggestions) ? suggestions : []).length > 0 && (
        <div style={{ padding: 14, background: T.blueLt, borderRadius: 12, border: "1px solid " + T.blue + "30", marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 8 }}>💡 Savings Opportunity</p>
          {suggestions.map((s, i) => (
            <p key={i} style={{ fontSize: 12, color: T.g[600], marginBottom: 4 }}>{s}</p>
          ))}
        </div>
      )}
      
      {(Array.isArray(suggestions) ? suggestions : []).length === 0 && (
        <div style={{ padding: 12, background: T.greenLt, borderRadius: 10, marginBottom: 12, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>✓ Your selection is already optimized!</p>
        </div>
      )}
      
      {/* Action Buttons - V3: Clear CTA buttons, no text input */}
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={handleConfirm} full disabled={isSubmitting} loading={isSubmitting} style={{ flex: 2 }}>
          {isSubmitting ? "Building..." : "✅ Build My Weekly Plan"}
        </Btn>
        <div style={{ position: "relative", flex: 1 }}>
          <Btn onClick={() => setShowEditMenu(!showEditMenu)} v="secondary" full disabled={isSubmitting}>
            ✏️ Modify
          </Btn>
          {showEditMenu && (
            <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 6, background: T.white, borderRadius: 10, border: "1px solid " + T.g[200], boxShadow: T.sh.m, overflow: "hidden", zIndex: 10 }}>
              {["Breakfast", "Lunch", "Dinner"].map(m => (
                <button key={m} onClick={() => handleEditMeal(m)} style={{ display: "block", width: "100%", padding: "10px 14px", border: "none", borderBottom: m !== "Dinner" ? "1px solid " + T.g[100] : "none", background: "transparent", fontSize: 13, fontWeight: 500, color: T.dark, cursor: "pointer", textAlign: "left" }}>
                  Edit {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// V3: Weekly Summary Component - Detailed 7-day view with accordion + editable cart
const WeeklySummary = ({ data, onAction }) => {
  const [activeTab, setActiveTab] = useState("plan");
  const [expandedDay, setExpandedDay] = useState(1);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // V3: Handle ui_data fields
  const dailyProtein = data?.daily_protein || 104;
  const dailyCost = data?.daily_cost || 0;
  const totalCartPrice = data?.total_cart_price || 0;
  const distribution = data?.distribution || {};
  
  // DEFENSIVE: Ensure arrays
  let weeklyPlan = data?.weekly_plan || [];
  if (!Array.isArray(weeklyPlan)) {
    weeklyPlan = typeof weeklyPlan === 'object' ? Object.values(weeklyPlan) : [];
  }
  
  let cart = data?.cart || [];
  if (!Array.isArray(cart)) {
    cart = typeof cart === 'object' ? Object.values(cart) : [];
  }
  
  const mealIcons = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" };
  
  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onAction({ confirm: true });
  };
  
  const handleEditMeal = (mealLabel) => {
    if (isSubmitting) return;
    setShowEditMenu(false);
    onAction({ edit_meal: mealLabel.toLowerCase() });
  };
  
  return (
    <div className="si" style={{ marginTop: 8 }}>
      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: 4, padding: 4, background: T.g[100], borderRadius: 12, marginBottom: 12 }}>
        <button onClick={() => setActiveTab("plan")} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", background: activeTab === "plan" ? T.white : "transparent", color: activeTab === "plan" ? T.dark : T.g[500], fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: activeTab === "plan" ? T.sh.s : "none" }}>
          📅 7-Day Plan
        </button>
        <button onClick={() => setActiveTab("cart")} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", background: activeTab === "cart" ? T.white : "transparent", color: activeTab === "cart" ? T.dark : T.g[500], fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: activeTab === "cart" ? T.sh.s : "none" }}>
          🛒 Cart ({cart.length})
        </button>
      </div>
      
      {/* TAB 1: 7-Day Plan */}
      {activeTab === "plan" && (
        <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>Daily protein: {dailyProtein}g from food</p>
            {data?.supplement_g > 0 && (
              <p style={{ fontSize: 11, color: T.g[500] }}>+ {data.supplement_g}g supplements</p>
            )}
          </div>
          
          {/* Accordion for each day */}
          {(Array.isArray(weeklyPlan) ? weeklyPlan : []).map((day, i) => {
            const dayNum = day?.day || i + 1;
            const isExpanded = expandedDay === dayNum;
            const meals = day?.meals || [];
            
            return (
              <div key={i} style={{ borderBottom: i < weeklyPlan.length - 1 ? "1px solid " + T.g[100] : "none" }}>
                <button 
                  onClick={() => setExpandedDay(isExpanded ? null : dayNum)}
                  style={{ width: "100%", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>Day {dayNum}</span>
                  <span style={{ fontSize: 12, color: T.g[400] }}>{isExpanded ? "▲" : "▼"}</span>
                </button>
                
                {isExpanded && (
                  <div style={{ paddingBottom: 12 }}>
                    {(Array.isArray(meals) ? meals : []).map((meal, mi) => {
                      const mealLabel = meal?.meal_label || "Meal";
                      const mealProducts = meal?.products || [];
                      const mealProtein = meal?.total_protein_g || 0;
                      
                      return (
                        <div key={mi} style={{ padding: "8px 12px", marginBottom: 6, background: T.g[50], borderRadius: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>
                              {mealIcons[mealLabel] || "🍽"} {mealLabel}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: T.green }}>{Math.round(mealProtein * 10) / 10}g</span>
                          </div>
                          {(Array.isArray(mealProducts) ? mealProducts : []).map((p, pi) => (
                            <p key={pi} style={{ fontSize: 11, color: T.g[600], marginLeft: 22, marginBottom: 2 }}>
                              • {p?.product_name || p} {p?.quantity && `(${p.quantity})`}
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* TAB 2: Shopping Cart */}
      {activeTab === "cart" && (
        <div style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>Weekly Shopping Cart</p>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.brand, fontFamily: mono }}>₹{totalCartPrice.toLocaleString()}</span>
          </div>
          
          {(Array.isArray(cart) ? cart : []).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < cart.length - 1 ? "1px solid " + T.g[100] : "none" }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: T.g[100], overflow: "hidden", flexShrink: 0 }}>
                {item?.image_url ? (
                  <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🥩</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 2 }}>{item?.product_name || 'Product'}</p>
                <p style={{ fontSize: 11, color: T.g[500], marginBottom: 4 }}>
                  {item?.pack_size_label || ''} × {item?.packs_needed || 1} = <span style={{ color: T.brand, fontWeight: 700 }}>₹{item?.total_price || item?.price || 0}</span>
                </p>
                {/* V3: Change button for cart items */}
                <button 
                  onClick={() => handleEditMeal("breakfast")} // Simplified - backend handles routing
                  style={{ fontSize: 10, fontWeight: 600, color: T.g[500], background: T.g[100], border: "none", borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}
                >
                  Change
                </button>
              </div>
            </div>
          ))}
          
          {/* Cost summary */}
          <div style={{ marginTop: 12, padding: "12px 0", borderTop: "1px solid " + T.g[100], display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: T.g[500] }}>Daily cost: ~₹{dailyCost}/day</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>Weekly: ₹{totalCartPrice.toLocaleString()}</span>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <Btn onClick={handleConfirm} full disabled={isSubmitting} loading={isSubmitting} style={{ flex: 2 }}>
          {isSubmitting ? "Processing..." : "✅ Confirm & Choose Delivery"}
        </Btn>
        <div style={{ position: "relative", flex: 1 }}>
          <Btn onClick={() => setShowEditMenu(!showEditMenu)} v="secondary" full disabled={isSubmitting}>
            ✏️ Edit
          </Btn>
          {showEditMenu && (
            <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 6, background: T.white, borderRadius: 10, border: "1px solid " + T.g[200], boxShadow: T.sh.m, overflow: "hidden", zIndex: 10 }}>
              {["Breakfast", "Lunch", "Dinner"].map(m => (
                <button key={m} onClick={() => handleEditMeal(m)} style={{ display: "block", width: "100%", padding: "10px 14px", border: "none", borderBottom: m !== "Dinner" ? "1px solid " + T.g[100] : "none", background: "transparent", fontSize: 13, fontWeight: 500, color: T.dark, cursor: "pointer", textAlign: "left" }}>
                  Edit {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// V3: NEW - Delivery Frequency Component
const DeliveryFrequency = ({ data, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // DEFENSIVE: Ensure frequencies is always an array
  let frequencies = data?.frequencies || [];
  if (!Array.isArray(frequencies)) {
    frequencies = [
      { label: "Daily (fresh every day)", value: "daily" },
      { label: "Every 2 days", value: "every_2_days" },
      { label: "Every 3 days", value: "every_3_days" },
      { label: "Weekly (once a week)", value: "weekly" }
    ];
  }
  
  const handleSelect = (freq) => {
    if (isSubmitting) return;
    const freqValue = typeof freq === 'string' ? freq : (freq?.value || freq?.label);
    setSelected(freqValue);
    setIsSubmitting(true);
    // V3: Send frequency selection
    onSelect({ frequency: freqValue });
  };
  
  const freqIcons = { daily: "📦", every_2_days: "📦📦", every_3_days: "📦📦📦", weekly: "🗓️" };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 32 }}>🚚</span>
        <p style={{ fontSize: 16, fontWeight: 800, color: T.dark, marginTop: 8 }}>How often would you like delivery?</p>
        <p style={{ fontSize: 12, color: T.g[500], marginTop: 4 }}>Choose based on your storage preference</p>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(Array.isArray(frequencies) ? frequencies : []).map((freq, idx) => {
          const freqValue = typeof freq === 'string' ? freq : (freq?.value || `freq_${idx}`);
          const freqLabel = typeof freq === 'string' ? freq : (freq?.label || `Option ${idx + 1}`);
          const isSelected = selected === freqValue;
          
          return (
            <button 
              key={freqValue + idx} 
              onClick={() => handleSelect(freq)}
              disabled={isSubmitting}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14,
                border: "2px solid " + (isSelected ? T.brand : T.g[200]), 
                background: isSelected ? T.brandLt : T.white,
                cursor: isSubmitting ? "not-allowed" : "pointer", 
                textAlign: "left",
                opacity: isSubmitting && !isSelected ? 0.5 : 1,
                transition: "all .2s"
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{freqIcons[freqValue] || "📦"}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? T.brand : T.dark }}>{freqLabel}</span>
              {isSelected && (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSubmitting 
                    ? <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite" }} /> 
                    : <span style={{ color: "#fff", fontSize: 11 }}>✓</span>
                  }
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// NEW: Time Slot Selection component (replaces old DeliverySelect)
const TimeSlotSelect = ({ data, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // DEFENSIVE: Ensure time_slots is always an array
  let timeSlots = data?.time_slots || data?.options || [];
  if (!Array.isArray(timeSlots)) {
    if (typeof timeSlots === 'object' && timeSlots !== null) {
      timeSlots = Object.entries(timeSlots).map(([key, val]) => 
        typeof val === 'object' ? { value: key, ...val } : { value: key, label: val }
      );
    } else {
      timeSlots = [
        { value: 'morning', label: 'Morning (8am - 12pm)' },
        { value: 'afternoon', label: 'Afternoon (12pm - 4pm)' },
        { value: 'evening', label: 'Evening (4pm - 8pm)' }
      ];
    }
  }
  
  const handleSelect = (slot) => {
    if (isSubmitting) return;
    const slotValue = typeof slot === 'string' ? slot : (slot?.value || slot?.label);
    setSelected(slotValue);
    setIsSubmitting(true);
    // Send structured JSON
    onSelect({ time_slot: slotValue });
  };
  
  const slotIcons = { morning: '🌅', afternoon: '☀️', evening: '🌙', night: '🌙' };
  
  return (
    <div className="si" style={{ padding: 16, background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, marginTop: 8 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 12 }}>Choose delivery time slot</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(Array.isArray(timeSlots) ? timeSlots : []).map((slot, idx) => {
          const slotValue = typeof slot === 'string' ? slot : (slot?.value || slot?.label || `slot_${idx}`);
          const slotLabel = typeof slot === 'string' ? slot : (slot?.label || slot?.value || `Slot ${idx + 1}`);
          const isSelected = selected === slotValue;
          const icon = slotIcons[slotValue.toLowerCase()] || '📦';
          
          return (
            <button key={slotValue + idx} onClick={() => handleSelect(slot)} disabled={isSubmitting} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14,
              border: "2px solid " + (isSelected ? T.brand : T.g[200]), background: isSelected ? T.brandLt : T.white,
              cursor: isSubmitting ? "not-allowed" : "pointer", textAlign: "left",
              opacity: isSubmitting && !isSelected ? 0.5 : 1,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? T.brand : T.dark }}>{slotLabel}</span>
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

// V3: Order Confirmed component (final state)
const OrderConfirmed = ({ data }) => {
  // V3: Handle ui_data fields
  const deliverySlot = data?.delivery_slot || 'Scheduled';
  const deliveryFrequency = data?.delivery_frequency || '';
  const totalCartPrice = data?.total_cart_price || 0;
  const dailyCost = data?.daily_cost || Math.round(totalCartPrice / 7);
  const dailyProtein = data?.daily_protein || 104;
  const supplementG = data?.supplement_g || 0;
  
  // DEFENSIVE: Ensure arrays
  let cart = data?.cart || [];
  if (!Array.isArray(cart)) {
    cart = typeof cart === 'object' ? Object.values(cart) : [];
  }
  
  const frequencyLabels = {
    daily: "Daily",
    every_2_days: "Every 2 days",
    every_3_days: "Every 3 days",
    weekly: "Weekly"
  };
  
  const slotLabels = {
    morning: "Morning (7-9 AM)",
    afternoon: "Afternoon (12-2 PM)",
    evening: "Evening (5-7 PM)"
  };
  
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Success Header */}
      <div style={{ background: "linear-gradient(150deg, " + T.green + ", #34D399)", padding: "24px 20px 48px", borderRadius: "0 0 28px 28px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 36 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Your Protein Plan is Set!</h2>
          
          {/* V3: Show delivery frequency + slot */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 99 }}>
              📦 {frequencyLabels[deliveryFrequency] || deliveryFrequency || "Delivery scheduled"}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 99 }}>
              ⏰ {slotLabels[deliverySlot] || deliverySlot}
            </span>
          </div>
        </div>
        
        {/* Cost & Protein Summary */}
        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-around", padding: "14px 0", background: "rgba(255,255,255,0.1)", borderRadius: 14 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 4 }}>Weekly</p>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: mono }}>₹{totalCartPrice.toLocaleString()}</span>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 4 }}>Daily</p>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: mono }}>~₹{dailyCost}</span>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 4 }}>Protein</p>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: mono }}>{dailyProtein + supplementG}g</span>
          </div>
        </div>
      </div>
      
      {/* Cart Items */}
      <div style={{ padding: "0 16px", marginTop: -20 }}>
        <div style={{ background: T.white, borderRadius: 18, border: "1px solid " + T.g[100], boxShadow: T.sh.m, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid " + T.g[100] }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.dark }}>🛒 Your Cart ({cart.length} items)</p>
          </div>
          {(Array.isArray(cart) ? cart : []).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: i < cart.length - 1 ? "1px solid " + T.g[100] : "none" }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: T.g[100], overflow: "hidden", flexShrink: 0 }}>
                {item?.image_url ? (
                  <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🥩</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 2, lineHeight: 1.3 }}>{item?.product_name || 'Product'}</h4>
                <p style={{ fontSize: 11, color: T.g[500], marginBottom: 4 }}>{item?.pack_size_label || ''} × {item?.packs_needed || 1}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.brand, fontFamily: mono }}>₹{item?.total_price || item?.price || 0}</span>
                  {item?.product_page_url && (
                    <a href={item.product_page_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, color: T.brand, textDecoration: "none", padding: "3px 10px", borderRadius: T.r.full, background: T.brandLt }}>
                      View →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* V3: Action Buttons */}
      <div style={{ padding: "20px 16px 36px" }}>
        {supplementG > 0 && (
          <div style={{ padding: 12, background: T.blueLt, borderRadius: 10, marginBottom: 12, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: T.blue, fontWeight: 600 }}>
              🥤 {dailyProtein}g from food + {supplementG}g supplements = {dailyProtein + supplementG}g total daily protein
            </p>
          </div>
        )}
        
        <div style={{ padding: 14, background: T.greenLt, borderRadius: T.r.m, marginBottom: 16, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.green, fontWeight: 700 }}>🎉 Your weekly protein supply is ready!</p>
          <p style={{ fontSize: 11, color: T.g[600], marginTop: 4 }}>Open each product on Licious to add to your cart</p>
        </div>
        
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => window.location.reload()} v="secondary" full style={{ flex: 1 }}>
            Start Over
          </Btn>
          <Btn onClick={() => {}} full style={{ flex: 1 }}>
            Share Plan
          </Btn>
        </div>
      </div>
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
      // Send structured JSON to trigger the meal planning flow
      send({ message: "start" });
    }
  }, []);

  // Send function that handles both string and JSON payloads
  const send = async (input) => {
    // Prepare the message payload
    let messagePayload;
    if (typeof input === 'string') {
      messagePayload = input.trim();
    } else if (typeof input === 'object' && input !== null) {
      messagePayload = input; // Send object directly as message
    } else {
      messagePayload = String(input || '').trim();
    }
    
    if (!messagePayload || (typeof messagePayload === 'string' && !messagePayload)) return;
    
    const displayText = typeof messagePayload === 'object' ? JSON.stringify(messagePayload) : messagePayload;
    setLastMessage(messagePayload);
    setError(null);
    setMsgs(p => [...p, { role: "user", text: displayText }]);
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.mealPlanning, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ session_id: sessionId, message: messagePayload }) 
      });
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
      
      // Check for order_confirmed ui_type - this marks the end of the flow
      if (data.ui_type === 'order_confirmed') {
        setDone(true);
        // Pass the full order data to parent
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
      send({ message: "start" });
    }
  };

  // V3: Known ui_types that have visual components
  const knownUiTypes = [
    'supplement_ask',      // V3: NEW
    'budget_setup', 
    'source_select', 
    'cut_select', 
    'product_select', 
    'portion_confirm', 
    'meal_confirmed', 
    'consolidation',       // V3: NEW
    'weekly_summary', 
    'delivery_frequency',  // V3: NEW
    'delivery_select', 
    'order_confirmed'
  ];

  const renderUI = (msg, isLatest) => {
    const uiType = msg.data?.ui_type;
    const uiData = msg.data?.ui_data;
    
    // If we have a recognized ui_type with data, render the visual component
    if (uiType && uiData && knownUiTypes.includes(uiType)) {
      switch (uiType) {
        // V3: NEW - First screen
        case 'supplement_ask': return <SupplementAsk data={uiData} onSelect={send} />;
        case 'budget_setup': return <DistributionSetup data={uiData} onSelect={send} />;
        case 'source_select': return <SourceChips data={uiData} onSelect={send} />;
        case 'cut_select': return <CutChips data={uiData} onSelect={send} />;
        case 'product_select': return <ProductCardGrid data={uiData} onSelect={send} />;
        case 'portion_confirm': return <PortionConfirmCard data={uiData} onConfirm={send} />;
        case 'meal_confirmed': return <MealBadge data={uiData} onEdit={send} />;
        // V3: NEW - After all meals confirmed
        case 'consolidation': return <Consolidation data={uiData} onAction={send} />;
        // V3: Updated with edit functionality
        case 'weekly_summary': return <WeeklySummary data={uiData} onAction={send} />;
        // V3: NEW - Before delivery slot
        case 'delivery_frequency': return <DeliveryFrequency data={uiData} onSelect={send} />;
        case 'delivery_select': return <TimeSlotSelect data={uiData} onSelect={send} />;
        case 'order_confirmed': return <OrderConfirmed data={uiData} />;
        default: return null;
      }
    }
    
    // FALLBACK - Show text + input for ANY unrecognized response (only for latest message)
    if (isLatest) {
      const text = msg.data?.message || msg.text || '';
      return (
        <div style={{ padding: "14px 16px", background: T.white, border: "1px solid " + T.g[100], borderRadius: 14, boxShadow: T.sh.s }}>
          <FormattedText text={text} />
          <ChatInput onSend={send} disabled={loading} />
        </div>
      );
    }
    
    return null;
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
        {(Array.isArray(msgs) ? msgs : []).map((m, i) => {
          if (m?.role === "bot") {
            const isLatestBot = i === (Array.isArray(msgs) ? msgs : []).length - 1 || (i === (Array.isArray(msgs) ? msgs : []).length - 2 && loading);
            
            // Show collapsed badge for old bot messages with ui_type
            if (!isLatestBot && m.data?.ui_type) {
              return <CollapsedBadge key={i} type={m.data.ui_type} data={m.data.ui_data || {}} fullData={m.data || {}} msgs={msgs} msgIndex={i} />;
            }
            
            // For latest message OR old messages without ui_type, render normally
            const ui = renderUI(m, isLatestBot);
            
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                {isLatestBot && m.text && !m.data?.ui_type && (
                  <p style={{ fontSize: 12, color: T.g[400], marginBottom: 6, lineHeight: 1.4 }}>{m.text}</p>
                )}
                {ui}
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

// FinalCart is kept as a standalone view for legacy support
const FinalCart = ({ data }) => {
  // DEFENSIVE: Ensure cart is always an array
  let cart = data?.cart || [];
  if (!Array.isArray(cart)) {
    if (typeof cart === 'object' && cart !== null) {
      cart = Object.values(cart);
    } else {
      cart = [];
    }
  }
  
  const total = data?.total_cart_price || 0;
  const perDay = data?.price_per_day || (cart.length > 0 ? Math.round(total / 7) : 0);
  const deliverySlot = data?.delivery_slot || '';
  
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div style={{ background: "linear-gradient(150deg, " + T.green + ", #34D399)", padding: "20px 20px 44px", borderRadius: "0 0 24px 24px" }}>
        <JourneyTracker steps={STEPS} current={5} />
        {deliverySlot && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 8 }}>Delivery: {deliverySlot}</p>}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between" }}>
          <div><p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 3 }}>Weekly Total</p><span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: mono }}>{"₹" + total.toLocaleString()}</span></div>
          <div style={{ textAlign: "right" }}><p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 3 }}>Per Day</p><span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: mono }}>{"₹" + perDay}</span></div>
        </div>
      </div>
      <div style={{ padding: "0 14px", marginTop: -22 }}>
        {(Array.isArray(cart) ? cart : []).map((item, i) => <div key={i} className={"up" + Math.min(i, 4)} style={{ marginBottom: 10, background: T.white, borderRadius: T.r.l, border: "1px solid " + T.g[100], boxShadow: T.sh.m, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 12, padding: 12 }}>
            <div style={{ width: 68, height: 68, borderRadius: T.r.m, background: T.g[100], overflow: "hidden", flexShrink: 0 }}>
              {item?.image_url ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🥩</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 2, lineHeight: 1.3 }}>{item?.product_name || 'Product'}</h4>
              <p style={{ fontSize: 11, color: T.g[500], marginBottom: 5 }}>{(item?.pack_size_label || '') + " × " + (item?.packs_needed || 1)}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.brand, fontFamily: mono }}>{"₹" + (item?.total_price || item?.price || 0)}</span>
                {item?.product_page_url && <a href={item.product_page_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, color: T.brand, textDecoration: "none", padding: "2px 8px", borderRadius: T.r.full, background: T.brandLt }}>View on Licious</a>}
              </div>
            </div>
          </div>
          {item?.usage_description && <div style={{ padding: "6px 12px", background: T.g[50], borderTop: "1px solid " + T.g[100], fontSize: 11, color: T.g[500], fontWeight: 500 }}>{"📋 " + item.usage_description}</div>}
        </div>)}
      </div>
      <div style={{ padding: "20px 20px 36px" }}>
        <div style={{ padding: 14, background: T.greenLt, borderRadius: T.r.m, marginBottom: 12, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: T.green, fontWeight: 700 }}>🎉 Your weekly protein supply is ready!</p>
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
  
  // Handler for when meal planning completes (now includes order_confirmed)
  const handleMealPlanningComplete = (data) => {
    // Flow complete: order_confirmed received from merged Agent 2+3
    setCartData(data?.ui_data || data);
    setScreen("cart");
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
        {screen === "meals" && <MealPlanningWizard sessionId={sessionId} onComplete={handleMealPlanningComplete} onRestart={handleRestart} />}
        {screen === "cart" && <FinalCart data={cartData} />}
      </Shell>
    </>
  );
}
