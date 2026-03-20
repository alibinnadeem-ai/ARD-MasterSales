import { useState, useRef } from "react";

const SECTIONS = [
  {
    id: "meta",
    label: "Plan Overview",
    icon: "◈",
    color: "#C9A84C",
    fields: [
      { id: "planTitle", label: "Plan Title", type: "text", placeholder: "e.g. Grand City Phase 2 – Master Sales Plan 2025" },
      { id: "projectName", label: "Project / Development Name", type: "text", placeholder: "e.g. Grand City Kharian Phase 2" },
      { id: "preparedBy", label: "Prepared By", type: "text", placeholder: "e.g. Ali Bin Nadeem, CTO – CyberX Inc." },
      { id: "date", label: "Plan Date", type: "text", placeholder: "e.g. March 2025" },
      { id: "targetRevenue", label: "Target Revenue (PKR / USD)", type: "text", placeholder: "e.g. PKR 2.4 Billion" },
      { id: "planSummary", label: "Executive Summary", type: "textarea", placeholder: "High-level overview of the sales strategy, market context, and objectives..." },
    ],
  },
  {
    id: "productRelease",
    label: "Product Release Order",
    icon: "①",
    color: "#4CAF8A",
    fields: [
      { id: "products", label: "Products / Assets List", type: "textarea", placeholder: "List products in release priority order:\n1. Residential Plots (5 Marla)\n2. Commercial Plots (4 Marla)\n3. Villas (10 Marla)\n..." },
      { id: "sequencingRationale", label: "Sequencing Rationale", type: "textarea", placeholder: "Explain why this release order optimizes revenue, demand, and market absorption..." },
      { id: "absorptionStrategy", label: "Market Absorption Strategy", type: "textarea", placeholder: "How will you manage inventory release to avoid market saturation?" },
      { id: "pricingStructure", label: "Pricing Structure per Phase", type: "textarea", placeholder: "Phase 1: PKR 2.2M/Marla\nPhase 2: PKR 2.5M/Marla (10% increase)..." },
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: "◷",
    color: "#5B8DD9",
    fields: [
      { id: "launchDate", label: "Official Launch Date", type: "text", placeholder: "e.g. April 15, 2025" },
      { id: "phases", label: "Execution Phases", type: "textarea", placeholder: "Phase 1 (Weeks 1–4): Pre-launch & awareness\nPhase 2 (Weeks 5–8): Active sales launch\nPhase 3 (Weeks 9–16): Acceleration & second wave\nPhase 4 (Weeks 17–24): Close-out campaigns..." },
      { id: "milestones", label: "Key Milestones", type: "textarea", placeholder: "- Week 2: Dealer onboarding complete\n- Week 4: Social media reach 50K\n- Week 8: 20% inventory sold\n- Week 16: 60% inventory sold..." },
      { id: "deliverySchedule", label: "Delivery / Handover Schedule", type: "textarea", placeholder: "Estimated possession timelines and conditions..." },
    ],
  },
  {
    id: "budget",
    label: "Budget",
    icon: "₿",
    color: "#E07B54",
    fields: [
      { id: "totalBudget", label: "Total Sales & Marketing Budget", type: "text", placeholder: "e.g. PKR 45 Million" },
      { id: "marketingBudget", label: "Marketing Allocation", type: "textarea", placeholder: "Digital: PKR 12M\nOutdoor/OOH: PKR 8M\nPrint & Radio: PKR 3M\nContent & PR: PKR 2M..." },
      { id: "eventsBudget", label: "Events Allocation", type: "text", placeholder: "e.g. PKR 7M across 4 events" },
      { id: "technologyBudget", label: "Technology & CRM", type: "text", placeholder: "e.g. PKR 3M for CRM, lead management, analytics" },
      { id: "commissions", label: "Commission Structure", type: "textarea", placeholder: "Direct Sales Team: 1.5%\nDealer Network: 2.5%\nChannel Partners: 3%\nBonus threshold: 2% on exceeding 110% target..." },
      { id: "contingency", label: "Contingency Reserve", type: "text", placeholder: "e.g. PKR 5M (10% of total budget)" },
    ],
  },
  {
    id: "events",
    label: "Events Strategy",
    icon: "◉",
    color: "#9B6FD4",
    fields: [
      { id: "launchEvent", label: "Grand Launch Event", type: "textarea", placeholder: "Date, Venue, Expected Attendance, Agenda, Special Guests, Media Coverage..." },
      { id: "dealerMeets", label: "Dealer & Agent Meets", type: "textarea", placeholder: "Frequency, locations, objectives, incentive structures, agenda format..." },
      { id: "investorSessions", label: "Investor / HNI Sessions", type: "textarea", placeholder: "Private investor briefings, project site visits, financial return presentations..." },
      { id: "activations", label: "On-Ground Activations", type: "textarea", placeholder: "Roadshows, malls, housing societies, city-wise activations..." },
      { id: "digitalEvents", label: "Digital & Virtual Events", type: "textarea", placeholder: "Webinars, Facebook/YouTube Live sessions, virtual site tours..." },
    ],
  },
  {
    id: "marketing",
    label: "Marketing Plan",
    icon: "◬",
    color: "#D4546F",
    fields: [
      { id: "targetAudience", label: "Target Audience Segments", type: "textarea", placeholder: "1. Local investors (Kharian/Gujrat belt)\n2. Overseas Pakistanis (UAE, UK, Saudi)\n3. End-users (young families, salaried professionals)..." },
      { id: "awareness", label: "Awareness Phase (Top of Funnel)", type: "textarea", placeholder: "Channels: Facebook Ads, YouTube, Billboards, Radio\nMessage: Project credibility, track record, ROI...\nKPIs: 500K reach, 100K video views..." },
      { id: "leadGen", label: "Lead Generation (Mid Funnel)", type: "textarea", placeholder: "Lead magnets, landing pages, WhatsApp campaigns, dealer referrals, retargeting...\nTarget: 5,000 qualified leads/month..." },
      { id: "conversion", label: "Conversion Strategy (Bottom Funnel)", type: "textarea", placeholder: "Sales scripts, follow-up cadence, site visit protocol, payment plans, urgency triggers...\nTarget conversion rate: 8–12%..." },
      { id: "retention", label: "Retention & Referral", type: "textarea", placeholder: "Buyer loyalty program, referral bonuses, post-sale engagement..." },
      { id: "kpis", label: "Overall Marketing KPIs", type: "textarea", placeholder: "Monthly leads, CPL, site visits, conversion %, revenue vs target..." },
    ],
  },
];

const BRAND = {
  bg: "#0A0D14",
  surface: "#111520",
  card: "#161C2D",
  border: "#1E2A40",
  gold: "#C9A84C",
  goldLight: "#E8C87A",
  text: "#E8EAF0",
  muted: "#6B7A99",
};

const inputStyle = {
  width: "100%",
  background: "#0D1220",
  border: `1px solid ${BRAND.border}`,
  borderRadius: "6px",
  color: BRAND.text,
  fontSize: "13px",
  padding: "10px 12px",
  outline: "none",
  fontFamily: "'Georgia', serif",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

function Field({ field, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const style = {
    ...inputStyle,
    borderColor: focused ? BRAND.gold : BRAND.border,
    resize: field.type === "textarea" ? "vertical" : undefined,
    minHeight: field.type === "textarea" ? "90px" : undefined,
  };
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: BRAND.muted, textTransform: "uppercase", marginBottom: "6px", fontFamily: "monospace" }}>
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          style={style}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={e => onChange(field.id, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <input
          type="text"
          style={style}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={e => onChange(field.id, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}
    </div>
  );
}

export default function SalesPlanBuilder() {
  const [activeSection, setActiveSection] = useState("meta");
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(null);
  const [log, setLog] = useState("");
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());

  const handleChange = (sectionId, fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] || {}), [fieldId]: value },
    }));
  };

  const markComplete = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection);
  const currentData = formData[activeSection] || {};

  const buildPlanText = () => {
    let text = "";
    SECTIONS.forEach(sec => {
      text += `\n\n=== ${sec.label.toUpperCase()} ===\n`;
      sec.fields.forEach(f => {
        const val = formData[sec.id]?.[f.id];
        if (val) text += `${f.label}:\n${val}\n\n`;
      });
    });
    return text;
  };

  const handleAIEnhance = async () => {
    setAiEnhancing(true);
    const planText = buildPlanText();
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert real estate sales strategist. You review Sales Plans and provide a concise Executive Intelligence Brief — key strengths, gaps, and 3 strategic recommendations. Keep it sharp and actionable. Format as plain text sections: STRENGTHS, GAPS, RECOMMENDATIONS.`,
          messages: [{ role: "user", content: `Review this Sales Plan and provide an Executive Intelligence Brief:\n${planText}` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text).join("") || "No response";
      setLog(text);
    } catch (e) {
      setLog("Error: " + e.message);
    }
    setAiEnhancing(false);
  };

  const handleGenerate = async (type) => {
    setGenerating(true);
    setGeneratingDoc(type);
    const planData = JSON.stringify(formData);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a document generation assistant. Given a sales plan JSON, output ONLY a valid JSON object with key 'summary' containing a 150-word executive summary string and key 'ready' set to true. No markdown, no extra text.",
          messages: [{ role: "user", content: `Sales Plan Data: ${planData}` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text).join("") || "{}";
      let parsed = {};
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch {}
      // Post to backend for actual doc generation
      const genRes = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, summary: parsed.summary || "", type }),
      }).catch(() => null);
      if (!genRes || !genRes.ok) {
        setLog(`✅ Plan data compiled. In production, your ${type.toUpperCase()} would download now.\n\nExecutive Summary generated:\n${parsed.summary || "(No summary)"}`);
      } else {
        const blob = await genRes.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Sales_Plan_${Date.now()}.${type}`;
        a.click();
      }
    } catch (e) {
      setLog("Generation note: " + e.message);
    }
    setGenerating(false);
    setGeneratingDoc(null);
  };

  const filledCount = SECTIONS.reduce((acc, s) => {
    const sec = formData[s.id] || {};
    return acc + s.fields.filter(f => sec[f.id]?.trim?.()).length;
  }, 0);
  const totalFields = SECTIONS.reduce((a, s) => a + s.fields.length, 0);
  const progress = Math.round((filledCount / totalFields) * 100);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: BRAND.surface, borderBottom: `1px solid ${BRAND.border}`, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.18em", color: BRAND.gold, fontFamily: "monospace", textTransform: "uppercase", marginBottom: "4px" }}>Grand City · CyberX · Sales Intelligence</div>
          <div style={{ fontSize: "22px", fontWeight: "normal", color: BRAND.text, letterSpacing: "0.02em" }}>Master Sales Plan Builder</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: BRAND.muted, fontFamily: "monospace", marginBottom: "6px" }}>COMPLETION</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "120px", height: "4px", background: BRAND.border, borderRadius: "2px" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.goldLight})`, borderRadius: "2px", transition: "width 0.4s" }} />
            </div>
            <span style={{ fontSize: "14px", color: BRAND.gold, fontFamily: "monospace" }}>{progress}%</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: "220px", background: BRAND.surface, borderRight: `1px solid ${BRAND.border}`, padding: "24px 0", flexShrink: 0 }}>
          {SECTIONS.map((sec, i) => {
            const isActive = sec.id === activeSection;
            const isDone = completedSections.has(sec.id);
            const filled = Object.values(formData[sec.id] || {}).filter(v => v?.trim?.()).length;
            return (
              <div key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  padding: "12px 20px",
                  cursor: "pointer",
                  borderLeft: isActive ? `3px solid ${sec.color}` : "3px solid transparent",
                  background: isActive ? `${sec.color}12` : "transparent",
                  display: "flex", alignItems: "center", gap: "10px",
                  transition: "all 0.15s",
                  marginBottom: "2px",
                }}>
                <span style={{ fontSize: "16px", color: isActive ? sec.color : BRAND.muted, flexShrink: 0 }}>{sec.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", color: isActive ? BRAND.text : BRAND.muted, fontWeight: isActive ? "bold" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sec.label}</div>
                  {filled > 0 && <div style={{ fontSize: "10px", color: sec.color, fontFamily: "monospace" }}>{filled}/{sec.fields.length} fields</div>}
                </div>
                {isDone && <span style={{ color: "#4CAF8A", fontSize: "12px" }}>✓</span>}
              </div>
            );
          })}

          <div style={{ margin: "24px 16px 0", borderTop: `1px solid ${BRAND.border}`, paddingTop: "20px" }}>
            <div style={{ fontSize: "10px", color: BRAND.muted, fontFamily: "monospace", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.1em" }}>Export</div>
            <button onClick={() => handleGenerate("docx")} disabled={generating}
              style={{ width: "100%", padding: "9px", background: generating && generatingDoc === "docx" ? BRAND.border : BRAND.gold, color: BRAND.bg, border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", marginBottom: "8px", fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {generating && generatingDoc === "docx" ? "⟳ Generating..." : "⬇ WORD (.docx)"}
            </button>
            <button onClick={() => handleGenerate("pdf")} disabled={generating}
              style={{ width: "100%", padding: "9px", background: "transparent", color: BRAND.gold, border: `1px solid ${BRAND.gold}`, borderRadius: "5px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {generating && generatingDoc === "pdf" ? "⟳ Generating..." : "⬇ PDF"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto", maxWidth: "780px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
            <div>
              <div style={{ fontSize: "11px", color: currentSection.color, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                {currentSection.icon} Section {SECTIONS.indexOf(currentSection) + 1} of {SECTIONS.length}
              </div>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "normal", color: BRAND.text }}>{currentSection.label}</h2>
            </div>
            <button
              onClick={() => { markComplete(activeSection); const next = SECTIONS[SECTIONS.indexOf(currentSection) + 1]; if (next) setActiveSection(next.id); }}
              style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${currentSection.color}`, color: currentSection.color, borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontFamily: "monospace" }}>
              Save & Next →
            </button>
          </div>

          {currentSection.fields.map(field => (
            <Field key={field.id} field={field} value={currentData[field.id]} onChange={(fid, val) => handleChange(activeSection, fid, val)} />
          ))}

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: `1px solid ${BRAND.border}` }}>
            {SECTIONS.indexOf(currentSection) > 0 ? (
              <button onClick={() => setActiveSection(SECTIONS[SECTIONS.indexOf(currentSection) - 1].id)}
                style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${BRAND.border}`, color: BRAND.muted, borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontFamily: "monospace" }}>
                ← Previous
              </button>
            ) : <div />}
            {SECTIONS.indexOf(currentSection) < SECTIONS.length - 1 ? (
              <button onClick={() => { markComplete(activeSection); setActiveSection(SECTIONS[SECTIONS.indexOf(currentSection) + 1].id); }}
                style={{ padding: "8px 18px", background: currentSection.color, color: BRAND.bg, border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace" }}>
                Next Section →
              </button>
            ) : (
              <button onClick={handleAIEnhance} disabled={aiEnhancing}
                style={{ padding: "8px 18px", background: aiEnhancing ? BRAND.border : "#9B6FD4", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace" }}>
                {aiEnhancing ? "⟳ Analyzing..." : "✦ AI Review Plan"}
              </button>
            )}
          </div>
        </div>

        {/* Right Panel — AI Feedback */}
        <div style={{ width: "280px", background: BRAND.surface, borderLeft: `1px solid ${BRAND.border}`, padding: "24px 20px", flexShrink: 0 }}>
          <div style={{ fontSize: "10px", color: BRAND.muted, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>✦ AI Intelligence Brief</div>
          {log ? (
            <div style={{ fontSize: "12px", color: BRAND.text, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{log}</div>
          ) : (
            <div>
              <div style={{ fontSize: "12px", color: BRAND.muted, lineHeight: "1.7", marginBottom: "20px" }}>
                Complete all sections, then click <strong style={{ color: BRAND.gold }}>AI Review Plan</strong> on the final section for a strategic intelligence brief.
              </div>
              <div style={{ borderTop: `1px solid ${BRAND.border}`, paddingTop: "16px" }}>
                <div style={{ fontSize: "10px", color: BRAND.muted, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Plan Status</div>
                {SECTIONS.map(sec => {
                  const filled = Object.values(formData[sec.id] || {}).filter(v => v?.trim?.()).length;
                  const pct = Math.round((filled / sec.fields.length) * 100);
                  return (
                    <div key={sec.id} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                        <span style={{ color: BRAND.muted }}>{sec.label}</span>
                        <span style={{ color: sec.color, fontFamily: "monospace" }}>{pct}%</span>
                      </div>
                      <div style={{ height: "2px", background: BRAND.border, borderRadius: "1px" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: sec.color, borderRadius: "1px", transition: "width 0.3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {log && (
            <button onClick={() => setLog("")} style={{ marginTop: "16px", padding: "6px 12px", background: "transparent", border: `1px solid ${BRAND.border}`, color: BRAND.muted, borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontFamily: "monospace" }}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
