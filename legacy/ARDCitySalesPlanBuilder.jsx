import { useState, useCallback } from "react";

// ── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:        "#070D1A",
  surface:   "#0D1525",
  card:      "#111E35",
  border:    "#1A2C4A",
  borderHi:  "#2A4A7A",
  gold:      "#B8912A",
  goldLight: "#D4A843",
  goldFaint: "#B8912A22",
  navy:      "#0D1F3C",
  text:      "#DDE4F0",
  muted:     "#5A7090",
  dim:       "#8A9AB0",
  white:     "#FFFFFF",
};

const VERTICALS = [
  { id:"b2g",      label:"B2G",              fullName:"Business to Government",        color:"#1A6BB5", light:"#1A6BB530", icon:"🏛", tagline:"Govt Housing / Institutional Allotments" },
  { id:"b2c",      label:"B2C",              fullName:"Business to Consumer",           color:"#2E8B57", light:"#2E8B5730", icon:"🏠", tagline:"Direct Retail / End-User Sales" },
  { id:"b2b",      label:"B2B Corporate",    fullName:"Business to Business Corporate", color:"#B54A2A", light:"#B54A2A30", icon:"🏢", tagline:"Corporate Bulk / Employee Housing Schemes" },
  { id:"channel",  label:"Channel Partners", fullName:"Dealer & Channel Network",       color:"#7B4FA6", light:"#7B4FA630", icon:"🤝", tagline:"Franchise Dealers / Sub-Agents / Brokers" },
  { id:"diaspora", label:"Overseas/Diaspora","fullName":"Overseas Pakistani & Diaspora",color:"#1A8A8A", light:"#1A8A8A30", icon:"✈️", tagline:"NRP / UAE / UK / Saudi / Gulf Market" },
];

const CORE_SECTIONS = [
  { id:"meta", label:"Plan Overview", icon:"◈", color:C.goldLight,
    fields:[
      {id:"planTitle",        label:"Plan Title",                  type:"text",     ph:"e.g. ARD City Master Sales Plan 2025–2026"},
      {id:"development",      label:"Development Name",             type:"text",     ph:"ARD City"},
      {id:"location",         label:"Project Location",             type:"text",     ph:"e.g. Lahore / Rawalpindi / Islamabad"},
      {id:"developer",        label:"Developer / Company",          type:"text",     ph:"e.g. ARD Builders & Developers"},
      {id:"projectType",      label:"Project Type",                 type:"text",     ph:"e.g. Residential Township · Mixed-Use · Gated Community"},
      {id:"preparedBy",       label:"Prepared By",                  type:"text",     ph:"e.g. Ali Bin Nadeem, CTO – CyberX Inc."},
      {id:"date",             label:"Document Date",                type:"text",     ph:"e.g. March 2025"},
      {id:"planPeriod",       label:"Plan Period",                  type:"text",     ph:"e.g. April 2025 – March 2026 (12 months)"},
      {id:"totalRevenue",     label:"Total Revenue Target",         type:"text",     ph:"e.g. PKR 4.8 Billion"},
      {id:"totalInventory",   label:"Total Inventory",              type:"text",     ph:"e.g. 1,200 plots / 350 villas / 80 commercial units"},
      {id:"launchDate",       label:"Launch Date",                  type:"text",     ph:"e.g. April 20, 2025"},
      {id:"primaryMarkets",   label:"Primary Markets",              type:"text",     ph:"Pakistan domestic + UAE + UK + Saudi + Gulf diaspora"},
      {id:"regulatory",       label:"Regulatory Framework",         type:"text",     ph:"e.g. RERA registered · LDA approved · DHA sector"},
      {id:"productMix",       label:"Product Mix & Inventory",      type:"textarea", ph:"5 Marla residential: 450 units\n10 Marla plots: 300 units\nCommercial 4 Marla: 80 units\nVillas 1 Kanal: 60 units\n..."},
      {id:"pricingOverview",  label:"Pricing Overview",             type:"textarea", ph:"5 Marla: PKR 2.2M–2.8M\n10 Marla: PKR 4.5M–5.5M\nCommercial: PKR 8M–12M\n..."},
      {id:"keyDifferentiators",label:"Key Differentiators",         type:"textarea", ph:"Smart city infrastructure\nGated security with CCTV & biometric entry\nProximity to motorway interchange\nLDA/RERA approved\n..."},
      {id:"marketContext",    label:"Pakistan Real Estate Market Context", type:"textarea", ph:"Current market dynamics, interest rates, inflation impact, post-2024 recovery, policy context..."},
      {id:"ardCityPositioning",label:"ARD City Market Positioning", type:"textarea", ph:"How ARD City differentiates vs competitors (DHA, Bahria, LDA Avenue)..."},
      {id:"salesObjectives",  label:"Overall Sales Objectives",     type:"textarea", ph:"Objective 1: Achieve 40% inventory sold in Year 1\nObjective 2: Establish 200+ active channel partners\n..."},
      {id:"executiveSummary", label:"Executive Summary",            type:"textarea", ph:"Strategic overview of the plan, market opportunity, and revenue ambition..."},
    ],
  },
  { id:"timeline", label:"Timeline", icon:"◷", color:"#4A90D9",
    fields:[
      {id:"launchDate",        label:"Official Launch Date",            type:"text",     ph:"e.g. April 20, 2025"},
      {id:"phases",            label:"Execution Phases",                type:"textarea", ph:"Phase 1 (Month 1–2): Pre-launch & soft booking\nPhase 2 (Month 3–4): Grand launch & aggressive sales\nPhase 3 (Month 5–8): Acceleration & second inventory wave\nPhase 4 (Month 9–12): Close-out & handover preparation"},
      {id:"milestones",        label:"Key Milestones",                  type:"textarea", ph:"Month 1: Dealer network fully onboarded (200+ agents)\nMonth 2: 500K social media reach achieved\nMonth 3: 15% inventory sold\nMonth 6: 40% inventory sold\n..."},
      {id:"deliverySchedule",  label:"Delivery & Possession Schedule",  type:"textarea", ph:"Residential plots: 12 months post-booking\nCommercial: 18 months post-booking\nVillas: 24 months with construction milestones..."},
      {id:"reviewCadence",     label:"Review & Reporting Cadence",      type:"textarea", ph:"Weekly: Sales pipeline review\nMonthly: Revenue vs target report\nQuarterly: Board-level performance review"},
    ],
  },
  { id:"budget", label:"Budget", icon:"₿", color:"#D4823A",
    fields:[
      {id:"totalBudget",  label:"Total Sales & Marketing Budget",   type:"text",     ph:"e.g. PKR 80 Million"},
      {id:"breakdown",    label:"Budget by Vertical",                type:"textarea", ph:"B2G outreach: PKR 8M\nB2C digital + OOH: PKR 25M\nB2B corporate: PKR 6M\nChannel partners support: PKR 12M\nOverseas/diaspora: PKR 10M\nEvents: PKR 12M\nTechnology/CRM: PKR 5M\nContingency: PKR 8M"},
      {id:"marketing",    label:"Marketing & Advertising",           type:"textarea", ph:"Digital (Meta/Google/YouTube): PKR 15M\nOOH/Billboards: PKR 10M\nPrint/Radio: PKR 4M\nContent/PR: PKR 3M"},
      {id:"events",       label:"Events & Activations",              type:"text",     ph:"e.g. PKR 12M across 8 events (launch + quarterly)"},
      {id:"technology",   label:"Technology & CRM",                  type:"text",     ph:"e.g. PKR 5M — CRM, lead management, WhatsApp automation"},
      {id:"commissions",  label:"Commissions & Incentive Pool",      type:"textarea", ph:"Direct sales: 1.5%\nDealer network: 2.5%\nCorporate channel: 2%\nOverseas agents: 3%\nBonus pool (top performers): PKR 5M annual"},
      {id:"contingency",  label:"Contingency Reserve",               type:"text",     ph:"e.g. PKR 8M (10% of total)"},
    ],
  },
  { id:"events", label:"Events Strategy", icon:"◉", color:"#8A5FD4",
    fields:[
      {id:"launchEvent",    label:"Grand Launch Event",                      type:"textarea", ph:"Date: April 20, 2025\nVenue: Pearl Continental Lahore\nExpected attendance: 800+\nAgenda: Chairman address, project reveal, site tour, booking booths\nMedia: GEO, ARY, Dawn, Tribune..."},
      {id:"govtEvents",     label:"Government & Institutional Events (B2G)", type:"textarea", ph:"Ministry housing summits, provincial housing authority meetings, NAPHDA coordination sessions..."},
      {id:"corpEvents",     label:"Corporate Outreach Events (B2B)",         type:"textarea", ph:"Corporate lunch briefings at 20 companies (Q1)\nEmployee housing scheme presentations\nHR/admin department tie-ups..."},
      {id:"dealerMeets",    label:"Dealer & Channel Meets",                  type:"textarea", ph:"Monthly dealer briefings (Lahore, Islamabad, Karachi)\nQuarterly incentive ceremony\nAnnual dealer conference + international trip for top 10..."},
      {id:"diasporaEvents", label:"Overseas / Diaspora Events",              type:"textarea", ph:"Dubai property expo (May 2025)\nLondon NRP briefing (June 2025)\nRiyadh community event (Aug 2025)\nOnline webinar series monthly for overseas Pakistanis..."},
      {id:"onGround",       label:"On-Ground Activations & Roadshows",       type:"textarea", ph:"Mall activations (Lahore, Gujrat, Rawalpindi)\nUniversity & corporate campus visits\nMosque/community board notices in target neighborhoods..."},
      {id:"digital",        label:"Digital Events & Virtual Tours",          type:"textarea", ph:"360° virtual site tour on website\nMonthly Facebook/YouTube Live\nInstagram Reels project walkthroughs\nWhatsApp webinar Q&A sessions..."},
    ],
  },
  { id:"marketing", label:"Marketing Plan", icon:"◬", color:"#D44A6A",
    fields:[
      {id:"brand",       label:"Brand Positioning — ARD City",          type:"textarea", ph:"'Where Legacy Meets Living' — positioning as Pakistan's most intelligently planned gated community with smart infrastructure, investment-grade returns, and aspirational lifestyle..."},
      {id:"awareness",   label:"Awareness Phase (Top of Funnel)",        type:"textarea", ph:"Channels: Facebook Ads, YouTube pre-rolls, OOH billboards (motorway/GT road), Radio\nBudget: PKR 12M\nKPIs: 1M reach, 200K video views, 50K website visits (Month 1)"},
      {id:"leadGen",     label:"Lead Generation (Mid Funnel)",           type:"textarea", ph:"Meta lead forms, Google Search Ads, landing pages, WhatsApp broadcast lists\nLead magnet: 'Free ARD City Investment Report'\nTarget: 8,000 qualified leads/month\nCPL target: PKR 1,500"},
      {id:"conversion",  label:"Conversion Strategy (Bottom Funnel)",    type:"textarea", ph:"3-touch follow-up cadence (call + WhatsApp + site visit)\nSales script with objection handling\nSite visit protocol with VIP experience\nUrgency triggers: limited inventory phases, price increase announcements\nTarget: 10–12% conversion rate"},
      {id:"digital",     label:"Digital Marketing Channels & Tactics",   type:"textarea", ph:"Meta (Facebook/Instagram): Retargeting + lookalike audiences\nGoogle Ads: Search + Display + YouTube\nTikTok: Short-form project videos\nLinkedIn: B2B corporate outreach\nSEO: ARD City branded keywords"},
      {id:"traditional", label:"Traditional & OOH Marketing",            type:"textarea", ph:"Billboards: GT Road, Motorway M2, Lahore ring road, Islamabad expressway\nNewspaper: Dawn, Jang, The News full-page launch ads\nRadio: FM 101, FM 91, FM 103 (Lahore + Islamabad)\nTV: Geo News, ARY, Samaa sponsored segments"},
      {id:"overseas",    label:"Overseas / Diaspora Marketing",          type:"textarea", ph:"Urdu/English bilingual campaigns\nWhatsApp community broadcasts to NRP groups (UAE 200K, UK 80K, Saudi 150K)\nYouTube content in Urdu with project tour\nOverseas property expos: Dubai, London, Manchester"},
      {id:"content",     label:"Content & PR Strategy",                  type:"textarea", ph:"Monthly project update blog\nSuccess stories from buyers\nInvestment ROI comparison reports\nPress releases to major dailies + property portals (Zameen, Graana, OLX)"},
      {id:"kpis",        label:"Marketing KPIs & Targets",               type:"textarea", ph:"Monthly reach: 1M+\nMonthly leads: 8,000\nCPL: PKR 1,500\nSite visits: 400/month\nConversion: 10–12%\nMonthly revenue target: PKR 400M"},
    ],
  },
];

const VERT_FIELDS = [
  {id:"objective",    label:"Vertical Objective",            type:"text",     ph:"Primary sales goal for this vertical..."},
  {id:"targetSegment",label:"Target Segment",               type:"textarea", ph:"Specific buyer/client profile, demographics, geography, purchasing power..."},
  {id:"revenueTarget",label:"Revenue Target",               type:"text",     ph:"e.g. PKR 800M from this vertical"},
  {id:"timeline",     label:"Vertical Timeline",            type:"text",     ph:"e.g. Month 1–6 (Phase 1 priority)"},
  {id:"contactType",  label:"Primary Contact / Entry Point",type:"text",     ph:"e.g. Housing Ministry, HR Director, Registered Broker, NRP community leader"},
  {id:"valueProp",    label:"Value Proposition",            type:"textarea", ph:"Why ARD City specifically for this vertical — ROI, lifestyle, policy alignment..."},
  {id:"products",     label:"Key Products / Offerings",     type:"textarea", ph:"Which inventory types are most relevant to this vertical..."},
  {id:"salesApproach",label:"Sales Approach & Strategy",    type:"textarea", ph:"How will this vertical be approached — channels, pitch, relationship model..."},
  {id:"pricing",      label:"Pricing & Payment Structure",  type:"textarea", ph:"Special payment plans, bulk pricing, installment schedules for this vertical..."},
  {id:"leadGen",      label:"Lead Generation Channels",     type:"textarea", ph:"How leads are sourced for this vertical..."},
  {id:"stakeholders", label:"Decision Makers / Stakeholders",type:"textarea",ph:"Who approves the purchase decision in this vertical..."},
  {id:"partnerships", label:"Partnership / MOU Structure",  type:"textarea", ph:"Any formal agreements, MoUs, or tie-ups required..."},
  {id:"incentives",   label:"Incentives & Commission",      type:"textarea", ph:"Special incentives, commission tiers, bonuses for this vertical..."},
  {id:"marketing",    label:"Marketing Support Plan",       type:"textarea", ph:"Specific marketing materials, campaigns, collateral for this vertical..."},
  {id:"kpis",         label:"KPIs & Success Metrics",       type:"textarea", ph:"How success is measured for this vertical — leads, conversions, revenue..."},
  {id:"risks",        label:"Risks & Mitigation",           type:"textarea", ph:"Key risks and how to manage them for this vertical..."},
  {id:"notes",        label:"Notes / Special Considerations",type:"textarea",ph:"Any additional context, local dynamics, or instructions..."},
];

// Build full nav
const NAV = [
  ...CORE_SECTIONS.map(s => ({ ...s, kind: "core" })),
  ...VERTICALS.map(v => ({ id: v.id, label: v.label, icon: v.icon, color: v.color, kind: "vertical", fullName: v.fullName, tagline: v.tagline })),
];

function Field({ f, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: "100%", boxSizing: "border-box", background: "#070D1A",
    border: `1px solid ${focused ? C.goldLight : C.border}`,
    borderRadius: "4px", color: C.text, fontSize: "13px",
    padding: "9px 12px", outline: "none", fontFamily: "'Georgia', serif",
    transition: "border-color 0.15s",
  };
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em",
        color: C.muted, textTransform: "uppercase", marginBottom: "6px", fontFamily: "monospace" }}>
        {f.label}
      </label>
      {f.type === "textarea"
        ? <textarea style={{ ...base, minHeight: "88px", resize: "vertical" }}
            placeholder={f.ph} value={value || ""}
            onChange={e => onChange(f.id, e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        : <input type="text" style={base} placeholder={f.ph} value={value || ""}
            onChange={e => onChange(f.id, e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      }
    </div>
  );
}

function SectionProgress({ secId, formData, fields }) {
  const filled = fields.filter(f => formData[secId]?.[f.id]?.trim?.()).length;
  const pct = Math.round(filled / fields.length * 100);
  return { filled, total: fields.length, pct };
}

export default function ARDCitySalesPlan() {
  const [active, setActive] = useState("meta");
  const [formData, setFormData] = useState({});
  const [aiLog, setAiLog] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [generating, setGenerating] = useState(null); // 'docx' | 'pdf' | null
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  const handleChange = useCallback((secId, fieldId, val) => {
    setFormData(prev => ({ ...prev, [secId]: { ...(prev[secId] || {}), [fieldId]: val } }));
  }, []);

  const totalFilled = NAV.reduce((acc, s) => {
    const fields = s.kind === "core"
      ? CORE_SECTIONS.find(c => c.id === s.id)?.fields || []
      : VERT_FIELDS;
    return acc + fields.filter(f => formData[s.id]?.[f.id]?.trim?.()).length;
  }, 0);
  const totalFields = NAV.reduce((acc, s) => {
    const fields = s.kind === "core"
      ? CORE_SECTIONS.find(c => c.id === s.id)?.fields || []
      : VERT_FIELDS;
    return acc + fields.length;
  }, 0);
  const globalPct = Math.round(totalFilled / totalFields * 100);

  const buildPlanText = () => {
    let t = `ARD CITY SALES PLAN\n\n`;
    CORE_SECTIONS.forEach(s => {
      t += `== ${s.label.toUpperCase()} ==\n`;
      s.fields.forEach(f => { const v = formData[s.id]?.[f.id]; if(v?.trim()) t += `${f.label}: ${v}\n`; });
      t += "\n";
    });
    VERTICALS.forEach(v => {
      t += `== ${v.label} — ${v.fullName} ==\n`;
      VERT_FIELDS.forEach(f => { const val = formData[v.id]?.[f.id]; if(val?.trim()) t += `${f.label}: ${val}\n`; });
      t += "\n";
    });
    return t;
  };

  const handleAIReview = async () => {
    setAiLoading(true);
    setAiLog("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a senior real estate sales strategist with expertise in Pakistan's property market. You review sales plans for large residential developments. Analyze the provided ARD City Sales Plan and produce a sharp Executive Intelligence Brief in 3 sections: STRENGTHS (what's well-planned), GAPS (what's missing or weak), STRATEGIC RECOMMENDATIONS (3 specific, actionable priorities). Be direct and expert. Pakistan market context: post-2024 economic recovery, high inflation, overseas Pakistani remittance demand, interest rate sensitivity, LDA/RERA compliance landscape.`,
          messages: [{ role: "user", content: `Review this ARD City Sales Plan:\n\n${buildPlanText()}` }],
        }),
      });
      const data = await res.json();
      setAiLog(data.content?.map(b => b.text).join("") || "No response.");
    } catch(e) { setAiLog("Error: " + e.message); }
    setAiLoading(false);
  };

  const handleGenerate = async (type) => {
    setGenerating(type);
    let aiSummary = "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a real estate document writer. Respond ONLY with a JSON object {\"summary\": \"...\"} containing a 120-word executive summary. No markdown, no extra text.",
          messages: [{ role: "user", content: buildPlanText() }],
        }),
      });
      const d = await res.json();
      const txt = d.content?.map(b => b.text).join("") || "{}";
      try { aiSummary = JSON.parse(txt.replace(/```json|```/g,"").trim()).summary || ""; } catch{}
    } catch{}

    const payload = { formData, summary: aiSummary, output_path: `/tmp/ard_sales_plan.${type}` };

    try {
      const genRes = await fetch(`/api/ard-generate?type=${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (genRes.ok) {
        const blob = await genRes.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ARD_City_Sales_Plan_${Date.now()}.${type}`;
        a.click();
        showToast(`✓ ${type.toUpperCase()} downloaded successfully`);
      } else {
        showToast(`✓ Plan compiled. Connect backend to download ${type.toUpperCase()}.`);
      }
    } catch {
      showToast(`✓ Plan compiled. Backend required for ${type.toUpperCase()} export.`);
    }
    setGenerating(null);
  };

  // Active section fields
  const activeNav = NAV.find(n => n.id === active);
  const fields = activeNav?.kind === "core"
    ? CORE_SECTIONS.find(c => c.id === active)?.fields || []
    : VERT_FIELDS;
  const vert = activeNav?.kind === "vertical" ? VERTICALS.find(v => v.id === active) : null;
  const activeColor = vert ? vert.color : (activeNav?.color || C.goldLight);

  const { pct: activePct } = SectionProgress({ secId: active, formData, fields });

  const navIdx = NAV.findIndex(n => n.id === active);
  const prevSec = navIdx > 0 ? NAV[navIdx - 1] : null;
  const nextSec = navIdx < NAV.length - 1 ? NAV[navIdx + 1] : null;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"'Georgia', serif", display:"flex", flexDirection:"column" }}>

      {/* TOPBAR */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div>
            <div style={{ fontSize:"10px", color:C.gold, fontFamily:"monospace",
              letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:"2px" }}>
              ARD CITY  ·  SALES INTELLIGENCE COMMAND
            </div>
            <div style={{ fontSize:"18px", letterSpacing:"0.04em", color:C.text }}>
              Master Sales Plan Builder
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"10px", color:C.muted, fontFamily:"monospace", marginBottom:"4px" }}>OVERALL COMPLETION</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ width:"140px", height:"3px", background:C.border, borderRadius:"2px" }}>
                <div style={{ width:`${globalPct}%`, height:"100%",
                  background:`linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
                  borderRadius:"2px", transition:"width 0.4s" }} />
              </div>
              <span style={{ fontSize:"13px", color:C.gold, fontFamily:"monospace", minWidth:"34px" }}>{globalPct}%</span>
            </div>
          </div>
          <button onClick={handleAIReview} disabled={aiLoading}
            style={{ padding:"8px 16px", background:"transparent",
              border:`1px solid ${C.gold}`, color:C.goldLight, borderRadius:"4px",
              fontSize:"11px", cursor:"pointer", fontFamily:"monospace", letterSpacing:"0.05em" }}>
            {aiLoading ? "⟳ Analyzing..." : "✦ AI Review"}
          </button>
          <button onClick={() => handleGenerate("docx")} disabled={!!generating}
            style={{ padding:"8px 14px", background:C.gold, color:C.navy,
              border:"none", borderRadius:"4px", fontSize:"11px", fontWeight:"bold",
              cursor:"pointer", fontFamily:"monospace" }}>
            {generating==="docx" ? "⟳" : "⬇ DOCX"}
          </button>
          <button onClick={() => handleGenerate("pdf")} disabled={!!generating}
            style={{ padding:"8px 14px", background:"transparent",
              border:`1px solid ${C.gold}`, color:C.goldLight,
              borderRadius:"4px", fontSize:"11px", fontWeight:"bold",
              cursor:"pointer", fontFamily:"monospace" }}>
            {generating==="pdf" ? "⟳" : "⬇ PDF"}
          </button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* SIDEBAR */}
        <div style={{ width:"210px", background:C.surface, borderRight:`1px solid ${C.border}`,
          overflowY:"auto", flexShrink:0, paddingBottom:"24px" }}>

          {/* Core sections */}
          <div style={{ padding:"16px 14px 6px", fontSize:"9px", color:C.muted,
            fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.12em" }}>
            Core Plan
          </div>
          {CORE_SECTIONS.map(s => {
            const { pct } = SectionProgress({ secId: s.id, formData, fields: s.fields });
            const isActive = active === s.id;
            return (
              <div key={s.id} onClick={() => setActive(s.id)}
                style={{ padding:"9px 14px", cursor:"pointer",
                  borderLeft: isActive ? `3px solid ${s.color}` : "3px solid transparent",
                  background: isActive ? `${s.color}14` : "transparent",
                  display:"flex", alignItems:"center", gap:"8px", marginBottom:"1px",
                  transition:"background 0.12s" }}>
                <span style={{ fontSize:"13px", color: isActive ? s.color : C.muted }}>{s.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"11.5px", color: isActive ? C.text : C.dim,
                    fontWeight: isActive ? "bold" : "normal",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.label}</div>
                  {pct > 0 && <div style={{ fontSize:"9px", color:s.color, fontFamily:"monospace" }}>{pct}%</div>}
                </div>
              </div>
            );
          })}

          {/* Verticals */}
          <div style={{ padding:"16px 14px 6px", fontSize:"9px", color:C.muted,
            fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.12em", marginTop:"8px",
            borderTop:`1px solid ${C.border}` }}>
            Sales Verticals
          </div>
          {VERTICALS.map(v => {
            const { pct } = SectionProgress({ secId: v.id, formData, fields: VERT_FIELDS });
            const isActive = active === v.id;
            return (
              <div key={v.id} onClick={() => setActive(v.id)}
                style={{ padding:"9px 14px", cursor:"pointer",
                  borderLeft: isActive ? `3px solid ${v.color}` : "3px solid transparent",
                  background: isActive ? `${v.color}18` : "transparent",
                  display:"flex", alignItems:"center", gap:"8px", marginBottom:"1px" }}>
                <span style={{ fontSize:"13px" }}>{v.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"11px", color: isActive ? C.text : C.dim,
                    fontWeight: isActive ? "bold" : "normal",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.label}</div>
                  <div style={{ fontSize:"9px", color: pct > 0 ? v.color : C.muted, fontFamily:"monospace" }}>
                    {pct > 0 ? `${pct}%` : v.tagline.slice(0,22)+"…"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", maxWidth:"820px" }}>

          {/* Section header */}
          <div style={{ marginBottom:"24px" }}>
            {vert ? (
              <div style={{ padding:"16px 20px", borderRadius:"6px",
                background:`${vert.color}18`, border:`1px solid ${vert.color}40`, marginBottom:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px" }}>
                  <span style={{ fontSize:"22px" }}>{vert.icon}</span>
                  <div>
                    <div style={{ fontSize:"18px", color:C.text, fontWeight:"normal" }}>{vert.fullName}</div>
                    <div style={{ fontSize:"11px", color:vert.color, fontFamily:"monospace", letterSpacing:"0.06em" }}>
                      {vert.tagline}
                    </div>
                  </div>
                </div>
                <div style={{ height:"2px", background:C.border, borderRadius:"1px", marginTop:"10px" }}>
                  <div style={{ width:`${activePct}%`, height:"100%", background:vert.color,
                    borderRadius:"1px", transition:"width 0.3s" }} />
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
                <div>
                  <div style={{ fontSize:"11px", color:activeColor, fontFamily:"monospace",
                    letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>
                    {activeNav?.icon} {activeNav?.label}
                  </div>
                  <div style={{ height:"2px", width:"60px", background:activeColor, borderRadius:"1px" }} />
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"10px", color:C.muted, fontFamily:"monospace" }}>Section completion</div>
                  <div style={{ fontSize:"16px", color:activeColor, fontFamily:"monospace" }}>{activePct}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Fields */}
          {fields.map(f => (
            <Field key={f.id} f={f} value={formData[active]?.[f.id]}
              onChange={(fid, val) => handleChange(active, fid, val)} />
          ))}

          {/* Nav buttons */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"28px",
            paddingTop:"20px", borderTop:`1px solid ${C.border}` }}>
            {prevSec ? (
              <button onClick={() => setActive(prevSec.id)}
                style={{ padding:"8px 16px", background:"transparent",
                  border:`1px solid ${C.border}`, color:C.muted,
                  borderRadius:"4px", fontSize:"11px", cursor:"pointer", fontFamily:"monospace" }}>
                ← {prevSec.label}
              </button>
            ) : <div />}
            {nextSec ? (
              <button onClick={() => setActive(nextSec.id)}
                style={{ padding:"8px 18px", background:activeColor, color:"#070D1A",
                  border:"none", borderRadius:"4px", fontSize:"11px",
                  fontWeight:"bold", cursor:"pointer", fontFamily:"monospace" }}>
                {nextSec.label} →
              </button>
            ) : (
              <button onClick={handleAIReview} disabled={aiLoading}
                style={{ padding:"8px 18px", background:aiLoading?"#1A2A4A":"#5A3FA0",
                  color:C.text, border:"none", borderRadius:"4px", fontSize:"11px",
                  fontWeight:"bold", cursor:"pointer", fontFamily:"monospace" }}>
                {aiLoading ? "⟳ Analyzing..." : "✦ AI Strategic Review"}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — AI + Vertical Status */}
        <div style={{ width:"260px", background:C.surface, borderLeft:`1px solid ${C.border}`,
          overflowY:"auto", padding:"20px 16px", flexShrink:0 }}>

          {aiLog ? (
            <div>
              <div style={{ fontSize:"10px", color:C.gold, fontFamily:"monospace",
                textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"12px" }}>
                ✦ AI Intelligence Brief
              </div>
              <div style={{ fontSize:"11.5px", color:C.text, lineHeight:"1.75", whiteSpace:"pre-wrap" }}>
                {aiLog}
              </div>
              <button onClick={() => setAiLog("")}
                style={{ marginTop:"14px", padding:"5px 10px", background:"transparent",
                  border:`1px solid ${C.border}`, color:C.muted,
                  borderRadius:"3px", fontSize:"10px", cursor:"pointer", fontFamily:"monospace" }}>
                Clear
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:"10px", color:C.muted, fontFamily:"monospace",
                textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"14px" }}>
                Vertical Status
              </div>
              {VERTICALS.map(v => {
                const { pct } = SectionProgress({ secId: v.id, formData, fields: VERT_FIELDS });
                return (
                  <div key={v.id} style={{ marginBottom:"12px", cursor:"pointer" }}
                    onClick={() => setActive(v.id)}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      fontSize:"10px", marginBottom:"3px" }}>
                      <span style={{ color: pct > 0 ? C.text : C.muted }}>
                        {v.icon} {v.label}
                      </span>
                      <span style={{ color:v.color, fontFamily:"monospace" }}>{pct}%</span>
                    </div>
                    <div style={{ height:"2px", background:C.border, borderRadius:"1px" }}>
                      <div style={{ width:`${pct}%`, height:"100%",
                        background:v.color, borderRadius:"1px", transition:"width 0.3s" }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop:"20px", paddingTop:"16px", borderTop:`1px solid ${C.border}` }}>
                <div style={{ fontSize:"10px", color:C.muted, fontFamily:"monospace",
                  textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"12px" }}>
                  Core Sections
                </div>
                {CORE_SECTIONS.map(s => {
                  const { pct } = SectionProgress({ secId: s.id, formData, fields: s.fields });
                  return (
                    <div key={s.id} style={{ marginBottom:"10px", cursor:"pointer" }}
                      onClick={() => setActive(s.id)}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        fontSize:"10px", marginBottom:"3px" }}>
                        <span style={{ color: pct > 0 ? C.text : C.muted }}>{s.icon} {s.label}</span>
                        <span style={{ color:s.color, fontFamily:"monospace" }}>{pct}%</span>
                      </div>
                      <div style={{ height:"2px", background:C.border, borderRadius:"1px" }}>
                        <div style={{ width:`${pct}%`, height:"100%",
                          background:s.color, borderRadius:"1px", transition:"width 0.3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop:"20px", paddingTop:"16px", borderTop:`1px solid ${C.border}` }}>
                <div style={{ fontSize:"10px", color:C.muted, fontFamily:"monospace", marginBottom:"10px",
                  textTransform:"uppercase", letterSpacing:"0.1em" }}>Export Plan</div>
                <button onClick={() => handleGenerate("docx")} disabled={!!generating}
                  style={{ width:"100%", padding:"9px", background: generating==="docx" ? C.border : C.gold,
                    color: generating==="docx" ? C.muted : C.navy,
                    border:"none", borderRadius:"4px", fontSize:"11px",
                    fontWeight:"bold", cursor:"pointer", fontFamily:"monospace", marginBottom:"8px" }}>
                  {generating==="docx" ? "⟳ Generating..." : "⬇ WORD (.docx)"}
                </button>
                <button onClick={() => handleGenerate("pdf")} disabled={!!generating}
                  style={{ width:"100%", padding:"9px", background:"transparent",
                    color: generating==="pdf" ? C.muted : C.goldLight,
                    border:`1px solid ${generating==="pdf" ? C.border : C.gold}`,
                    borderRadius:"4px", fontSize:"11px", fontWeight:"bold",
                    cursor:"pointer", fontFamily:"monospace" }}>
                  {generating==="pdf" ? "⟳ Generating..." : "⬇ PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:"24px", right:"24px",
          background:"#0D2A1A", border:`1px solid #2E8B57`,
          color:"#90EE90", padding:"10px 18px", borderRadius:"6px",
          fontSize:"12px", fontFamily:"monospace", zIndex:9999,
          boxShadow:"0 4px 20px #00000060" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
