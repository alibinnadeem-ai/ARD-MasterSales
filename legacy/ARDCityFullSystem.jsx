import { useState, useCallback, useRef } from "react";

// ── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:       "#060B14",
  surface:  "#0A1220",
  card:     "#0F1A2E",
  border:   "#172438",
  borderHi: "#243D5F",
  gold:     "#B8912A",
  goldL:    "#D4A843",
  goldF:    "#B8912A1A",
  navy:     "#0B1A30",
  text:     "#D8E2F0",
  muted:    "#4A6080",
  dim:      "#7A90A8",
  green:    "#2E8B57",
  red:      "#B54A2A",
  white:    "#FFFFFF",
};

const VERTICALS = [
  { id:"b2g",     label:"B2G",              icon:"🏛", color:"#1A6BB5", name:"Business to Government" },
  { id:"b2c",     label:"B2C",              icon:"🏠", color:"#2E8B57", name:"Business to Consumer" },
  { id:"b2b",     label:"B2B Corporate",    icon:"🏢", color:"#B54A2A", name:"Business to Business Corporate" },
  { id:"channel", label:"Channel Partners", icon:"🤝", color:"#7B4FA6", name:"Dealer & Channel Network" },
  { id:"diaspora",label:"Overseas/Diaspora",icon:"✈️", color:"#1A8A8A", name:"Overseas Pakistani & Diaspora" },
];

// ── JD ROLES (linked to verticals) ───────────────────────────────────────────
const JD_ROLES = [
  { id:"vp_sales",       title:"VP Sales & Revenue",        vertical:"all",      band:"C-Suite / VP",    color:"#B8912A" },
  { id:"b2g_mgr",        title:"B2G Sales Manager",         vertical:"b2g",      band:"Manager",         color:"#1A6BB5" },
  { id:"b2c_exec",       title:"B2C Sales Executive",       vertical:"b2c",      band:"Executive",       color:"#2E8B57" },
  { id:"b2c_team_lead",  title:"B2C Sales Team Lead",       vertical:"b2c",      band:"Team Lead",       color:"#2E8B57" },
  { id:"corp_sales_mgr", title:"Corporate Sales Manager",   vertical:"b2b",      band:"Manager",         color:"#B54A2A" },
  { id:"dealer_mgr",     title:"Channel & Dealer Manager",  vertical:"channel",  band:"Manager",         color:"#7B4FA6" },
  { id:"dealer_coord",   title:"Dealer Relationship Coordinator", vertical:"channel", band:"Coordinator", color:"#7B4FA6" },
  { id:"nrp_mgr",        title:"NRP/Overseas Sales Manager",vertical:"diaspora", band:"Manager",         color:"#1A8A8A" },
  { id:"crm_lead",       title:"CRM & Leads Manager",       vertical:"all",      band:"Manager",         color:"#B8912A" },
  { id:"mkt_mgr",        title:"Marketing Manager",         vertical:"all",      band:"Manager",         color:"#D44A6A" },
];

// ── KPI DEFINITIONS (linked to verticals + roles) ────────────────────────────
const KPI_LIBRARY = {
  revenue: [
    { id:"monthly_rev",    label:"Monthly Revenue",            unit:"PKR",     target:"400M",  freq:"Monthly", vertical:"all",     role:"vp_sales" },
    { id:"quarterly_rev",  label:"Quarterly Revenue",          unit:"PKR",     target:"1.2B",  freq:"Quarterly",vertical:"all",    role:"vp_sales" },
    { id:"b2g_rev",        label:"B2G Vertical Revenue",       unit:"PKR",     target:"50M/mo",freq:"Monthly", vertical:"b2g",     role:"b2g_mgr" },
    { id:"b2c_rev",        label:"B2C Vertical Revenue",       unit:"PKR",     target:"150M/mo",freq:"Monthly",vertical:"b2c",    role:"b2c_team_lead" },
    { id:"b2b_rev",        label:"B2B Corporate Revenue",      unit:"PKR",     target:"42M/mo",freq:"Monthly", vertical:"b2b",     role:"corp_sales_mgr" },
    { id:"channel_rev",    label:"Channel Partner Revenue",    unit:"PKR",     target:"116M/mo",freq:"Monthly",vertical:"channel", role:"dealer_mgr" },
    { id:"nrp_rev",        label:"NRP/Diaspora Revenue",       unit:"PKR",     target:"42M/mo",freq:"Monthly", vertical:"diaspora",role:"nrp_mgr" },
  ],
  pipeline: [
    { id:"leads_gen",      label:"Leads Generated",            unit:"leads",   target:"8,000", freq:"Monthly", vertical:"all",     role:"crm_lead" },
    { id:"cpl",            label:"Cost Per Lead (CPL)",        unit:"PKR",     target:"≤1,500",freq:"Monthly", vertical:"all",     role:"mkt_mgr" },
    { id:"site_visits",    label:"Site Visits",                unit:"visits",  target:"400",   freq:"Monthly", vertical:"b2c",     role:"b2c_team_lead" },
    { id:"conversion",     label:"Lead-to-Sale Conversion",    unit:"%",       target:"10–12", freq:"Monthly", vertical:"all",     role:"vp_sales" },
    { id:"followup_rate",  label:"Lead Follow-up Rate (24hr)", unit:"%",       target:"95",    freq:"Weekly",  vertical:"all",     role:"crm_lead" },
    { id:"pipeline_val",   label:"Active Pipeline Value",      unit:"PKR",     target:"2B",    freq:"Monthly", vertical:"all",     role:"vp_sales" },
  ],
  activity: [
    { id:"calls_day",      label:"Outbound Calls / Day",       unit:"calls",   target:"50",    freq:"Daily",   vertical:"b2c",     role:"b2c_exec" },
    { id:"presentations",  label:"Presentations / Month",      unit:"pres.",   target:"20",    freq:"Monthly", vertical:"b2b",     role:"corp_sales_mgr" },
    { id:"govt_meetings",  label:"Govt Meetings / Month",      unit:"mtgs",    target:"8",     freq:"Monthly", vertical:"b2g",     role:"b2g_mgr" },
    { id:"dealer_onboard", label:"New Dealers Onboarded",      unit:"dealers", target:"25/mo", freq:"Monthly", vertical:"channel", role:"dealer_mgr" },
    { id:"nrp_webinars",   label:"NRP Webinars / Quarter",     unit:"events",  target:"6",     freq:"Quarterly",vertical:"diaspora",role:"nrp_mgr" },
    { id:"mou_signed",     label:"MOUs Signed (Institutional)",unit:"MOUs",    target:"1/mo",  freq:"Monthly", vertical:"b2g,b2b", role:"vp_sales" },
  ],
  quality: [
    { id:"csat",           label:"Buyer Satisfaction Score",   unit:"/10",     target:"8.5+",  freq:"Monthly", vertical:"all",     role:"vp_sales" },
    { id:"dealer_active",  label:"Active Dealer Rate",         unit:"%",       target:"75",    freq:"Monthly", vertical:"channel", role:"dealer_mgr" },
    { id:"booking_cancel", label:"Booking Cancellation Rate",  unit:"%",       target:"≤5",    freq:"Monthly", vertical:"all",     role:"vp_sales" },
    { id:"data_quality",   label:"CRM Data Completeness",      unit:"%",       target:"90",    freq:"Weekly",  vertical:"all",     role:"crm_lead" },
  ],
};

// ── SMART GOAL TEMPLATES (linked to roles + verticals) ───────────────────────
const SMART_TEMPLATES = {
  vp_sales: [
    { goal:"Achieve PKR 4.8B in total sales revenue by March 2026 across all 5 verticals, tracked monthly against the sales plan targets.", category:"Revenue", timeframe:"12 months", linked_kpis:["monthly_rev","conversion","pipeline_val"] },
    { goal:"Establish and maintain a 250+ active registered dealer network by end of Month 2, with 75% activity rate maintained monthly thereafter.", category:"Channel", timeframe:"2 months (onboarding) + ongoing", linked_kpis:["dealer_onboard","dealer_active"] },
    { goal:"Sign minimum 3 B2G/B2B institutional MOUs in Year 1, representing combined value of PKR 1.1B, with first MOU by Month 4.", category:"Institutional", timeframe:"Month 4, 7, 10", linked_kpis:["mou_signed","b2g_rev"] },
  ],
  b2g_mgr: [
    { goal:"Secure 3 signed government housing allotment MOUs (NAPHDA, Armed Forces, Provincial) representing 200 units / PKR 600M by Month 12.", category:"Revenue", timeframe:"12 months", linked_kpis:["b2g_rev","mou_signed","govt_meetings"] },
    { goal:"Conduct minimum 8 official government/institutional presentations per month, with proposal submission within 5 working days of each meeting.", category:"Activity", timeframe:"Monthly", linked_kpis:["govt_meetings"] },
  ],
  b2c_exec: [
    { goal:"Generate and follow up on minimum 50 outbound calls daily, achieving 95% same-day follow-up on all incoming leads with documented CRM entries.", category:"Activity", timeframe:"Daily/Weekly", linked_kpis:["calls_day","followup_rate","data_quality"] },
    { goal:"Convert minimum 10% of assigned leads to site visits and achieve 12% booking conversion rate on site visits monthly.", category:"Conversion", timeframe:"Monthly", linked_kpis:["site_visits","conversion"] },
  ],
  b2c_team_lead: [
    { goal:"Lead team to deliver 400+ site visits and PKR 150M in monthly B2C revenue, with ≤5% booking cancellation rate.", category:"Revenue & Quality", timeframe:"Monthly", linked_kpis:["b2c_rev","site_visits","booking_cancel"] },
  ],
  corp_sales_mgr: [
    { goal:"Close 8 corporate housing scheme MOUs with firms of 500+ employees by Month 8, representing 150 units / PKR 500M.", category:"Revenue", timeframe:"8 months", linked_kpis:["b2b_rev","presentations","mou_signed"] },
    { goal:"Deliver 20 formal corporate presentations per month in Months 2–4, with proposal follow-up within 3 working days.", category:"Activity", timeframe:"Month 2–4", linked_kpis:["presentations"] },
  ],
  dealer_mgr: [
    { goal:"Recruit and onboard 250 active registered dealers across 10 cities by end of Month 2, with dedicated WhatsApp group and portal access for each.", category:"Network", timeframe:"Month 2", linked_kpis:["dealer_onboard","dealer_active"] },
    { goal:"Maintain 75%+ active dealer rate monthly, defined as minimum 1 verified lead submission per month per dealer.", category:"Quality", timeframe:"Monthly", linked_kpis:["dealer_active","channel_rev"] },
  ],
  dealer_coord: [
    { goal:"Support onboarding of 25 new dealers per month, ensuring 100% portal activation, training completion, and marketing kit delivery within 48 hours.", category:"Onboarding", timeframe:"Monthly", linked_kpis:["dealer_onboard"] },
  ],
  nrp_mgr: [
    { goal:"Generate 5,000 qualified NRP leads per quarter across UAE, UK, Saudi Arabia through digital channels and property expos, achieving PKR 125M quarterly NRP revenue.", category:"Revenue", timeframe:"Quarterly", linked_kpis:["nrp_rev","nrp_webinars"] },
    { goal:"Execute minimum 2 overseas property expo participations per quarter and 6 NRP webinars per quarter with 200+ attendees each.", category:"Activity", timeframe:"Quarterly", linked_kpis:["nrp_webinars"] },
  ],
  crm_lead: [
    { goal:"Maintain 95% lead follow-up rate within 24 hours and 90% CRM data completeness across all verticals, with weekly quality audit reports.", category:"Quality", timeframe:"Weekly", linked_kpis:["followup_rate","data_quality","leads_gen"] },
  ],
  mkt_mgr: [
    { goal:"Generate 8,000+ qualified leads per month at CPL ≤ PKR 1,500, achieving 1M monthly reach across digital and OOH channels by Month 3.", category:"Marketing", timeframe:"Monthly", linked_kpis:["leads_gen","cpl"] },
  ],
};

// ── JD CONTENT TEMPLATES ────────────────────────────────────────────────────
const JD_CONTENT = {
  vp_sales: {
    summary: "Lead ARD City's entire sales revenue operation across all 5 verticals (B2G, B2C, B2B, Channel, Diaspora). Own the P&L for PKR 4.8B Year 1 revenue target. Build, manage and inspire a high-performance sales organization of 30+ people.",
    responsibilities: [
      "Own and deliver ARD City Year 1 sales target of PKR 4.8B across all verticals",
      "Build, recruit, and lead the full sales organization (executives, team leads, managers)",
      "Develop and execute the Master Sales Plan in coordination with marketing and project teams",
      "Establish institutional partnerships with government bodies, corporates, and overseas channels",
      "Provide weekly and monthly performance reports to Chairman/CEO with variance analysis",
      "Manage pricing strategy, incentive structures, and dealer commission framework",
      "Chair weekly sales command meetings with all vertical heads",
      "Represent ARD City at launch events, investor sessions, and government briefings",
    ],
    requirements: [
      "15+ years in Pakistan real estate sales, minimum 5 years at VP/Director level",
      "Track record of closing PKR 1B+ annual real estate revenue",
      "Deep network across LDA, NAPHDA, housing authorities, and corporate sector",
      "Experience managing multi-city dealer networks of 100+ agents",
      "Proficiency in CRM systems (Salesforce/HubSpot or equivalent)",
      "Strong English and Urdu communication, presentation skills",
      "MBA preferred; B.Com/BBA minimum",
    ],
    kpis: ["monthly_rev","quarterly_rev","conversion","pipeline_val","mou_signed","csat","booking_cancel"],
    smart_goals: "vp_sales",
  },
  b2g_mgr: {
    summary: "Own ARD City's government and institutional sales vertical. Build relationships with housing ministries, NAPHDA, armed forces housing trusts, and civil service cooperatives to secure bulk allotment MOUs representing PKR 600M in Year 1 revenue.",
    responsibilities: [
      "Develop and execute the B2G sales strategy for ARD City",
      "Build relationships with Federal/Provincial Housing Ministries, NAPHDA, and housing directorates",
      "Prepare and submit formal housing scheme proposals to government bodies",
      "Coordinate compliance documentation, title deeds, and LDA/RERA certification packages",
      "Conduct minimum 8 official government presentations per month",
      "Track legislation and government housing policy changes affecting B2G pipeline",
      "Represent ARD City in government tenders and housing authority meetings",
      "Liaise with legal team on MOU drafting and institutional agreements",
    ],
    requirements: [
      "10+ years experience, minimum 5 years in government sales or institutional real estate",
      "Existing relationships with Housing Ministry, NAPHDA, or military housing trusts",
      "Understanding of government procurement processes and housing allotment frameworks",
      "Strong proposal writing and formal presentation skills",
      "Experience handling institutional bulk real estate transactions (50+ unit deals)",
      "Master's in Public Administration, Business, or Law preferred",
    ],
    kpis: ["b2g_rev","govt_meetings","mou_signed"],
    smart_goals: "b2g_mgr",
  },
  b2c_exec: {
    summary: "Direct retail sales of ARD City residential plots, villas, and apartments to individual buyers and investors. Manage full sales cycle from lead qualification through booking, ensuring exceptional buyer experience.",
    responsibilities: [
      "Handle inbound leads from digital, referral, and dealer channels — follow up within 1 hour",
      "Conduct 50+ outbound calls daily to qualified prospects in pipeline",
      "Schedule and conduct site visits with professional VIP protocol",
      "Present payment plans, pricing, and project details clearly and persuasively",
      "Process booking documentation, token receipts, and file completion",
      "Maintain complete and accurate CRM records for all interactions",
      "Achieve monthly booking targets assigned by Team Lead",
      "Participate in on-ground activations, mall events, and dealer roadshows",
    ],
    requirements: [
      "2–5 years real estate sales experience in Pakistan residential market",
      "Strong interpersonal and persuasion skills",
      "Familiarity with Zameen.com, Graana.com, and property portals",
      "Proficient in WhatsApp Business, Excel, and basic CRM tools",
      "Valid CNIC, own vehicle preferred",
      "BBA/B.Com graduate; real estate certification a plus",
    ],
    kpis: ["calls_day","site_visits","conversion","followup_rate"],
    smart_goals: "b2c_exec",
  },
  b2c_team_lead: {
    summary: "Lead a team of 8–12 B2C Sales Executives to collectively achieve PKR 150M monthly revenue from direct consumer sales. Coach, motivate, and manage performance while maintaining quality standards.",
    responsibilities: [
      "Manage and coach a team of 8–12 B2C Sales Executives",
      "Assign leads, review pipeline daily, and remove conversion blockers",
      "Conduct weekly 1-on-1 performance reviews with each executive",
      "Ensure 95% lead follow-up rate and 90% CRM data quality across team",
      "Own team target of 400 site visits and PKR 150M revenue monthly",
      "Resolve escalated buyer complaints and booking issues",
      "Liaise with marketing for lead quality feedback and campaign adjustments",
      "Report weekly to VP Sales on team performance, pipeline health, and forecasts",
    ],
    requirements: [
      "5+ years real estate sales, 2+ years in team leadership role",
      "Proven track record managing a sales team of 5+ people",
      "Strong coaching and motivational skills",
      "Experience with CRM-based pipeline management",
      "BBA/MBA graduate preferred",
    ],
    kpis: ["b2c_rev","site_visits","conversion","booking_cancel","followup_rate"],
    smart_goals: "b2c_team_lead",
  },
  corp_sales_mgr: {
    summary: "Drive ARD City's B2B Corporate vertical — securing employee housing scheme agreements with large corporations, banks, telecom companies, and government enterprises. Target PKR 500M from 150 units sold through corporate bulk channel.",
    responsibilities: [
      "Identify, approach, and pitch 20+ large corporates per month for employee housing partnerships",
      "Develop corporate-specific sales materials, presentations, and ROI calculators",
      "Negotiate and close Employee Housing Scheme MOUs with HR/Admin/Finance decision makers",
      "Coordinate with legal team on corporate agreement structuring",
      "Manage relationships with bank HR departments for mortgage product integration",
      "Represent ARD City at corporate HR conferences and CIPD Pakistan events",
      "Develop bulk pricing proposals and custom payment plan structures",
      "Maintain corporate account register and pipeline in CRM",
    ],
    requirements: [
      "8+ years B2B sales experience, minimum 3 years in real estate or employee benefits",
      "Existing corporate network across Lahore/Islamabad (FMCG, telecom, banking, textile)",
      "Experienced in long-cycle B2B deal management and proposal writing",
      "Familiar with corporate HR processes and employee benefit structuring",
      "MBA preferred; strong English communication essential",
    ],
    kpis: ["b2b_rev","presentations","mou_signed"],
    smart_goals: "corp_sales_mgr",
  },
  dealer_mgr: {
    summary: "Build and manage ARD City's national dealer and channel partner network — targeting 250 active agents across 10 cities. Own channel revenue of PKR 1.4B (40% of total sales) through an incentivized, well-trained dealer ecosystem.",
    responsibilities: [
      "Design and launch AREC (ARD Real Estate Club) dealer program from scratch",
      "Recruit, onboard, and activate 250 registered dealers across 10 cities",
      "Organize monthly dealer meets in Lahore, Islamabad, Karachi, Gujrat, Faisalabad",
      "Manage dealer commission payouts, incentive trips, and annual conference",
      "Provide marketing co-op support (PKR 50K/quarter per active dealer)",
      "Manage dealer portal access, inventory visibility, and booking tools",
      "Monitor dealer performance and enforce minimum activity thresholds",
      "Resolve dealer disputes, commission queries, and escalations promptly",
    ],
    requirements: [
      "8+ years real estate channel management experience in Pakistan",
      "Existing network of 100+ registered property agents/dealers",
      "Experience running dealer incentive programs and channel events",
      "Strong understanding of property documentation, RERA, and commission structures",
      "High-energy, field-oriented with ability to travel across major cities",
    ],
    kpis: ["dealer_onboard","dealer_active","channel_rev"],
    smart_goals: "dealer_mgr",
  },
  dealer_coord: {
    summary: "Support the Dealer Manager in onboarding, training, and activating new channel partners. Handle day-to-day dealer communications, documentation, portal access, and marketing kit distribution.",
    responsibilities: [
      "Process dealer registration applications and complete KYC documentation",
      "Provide portal access, login credentials, and onboarding training within 48 hours of approval",
      "Distribute marketing kits (brochures, digital assets, pricing sheets) to all new dealers",
      "Maintain dealer database with updated contact info, city, and activity status",
      "Coordinate dealer meet logistics (venue, invites, attendance tracking, incentive disbursement)",
      "Respond to dealer queries on commission, inventory, and bookings within 4 hours",
      "Track monthly dealer activity and flag inactive accounts to Dealer Manager",
      "Support quarterly incentive calculation and documentation",
    ],
    requirements: [
      "2–4 years experience in sales coordination or channel support",
      "Strong organizational and communication skills",
      "Proficient in Excel, WhatsApp Business, and CRM/portal tools",
      "Real estate background preferred",
      "BBA/B.Com graduate",
    ],
    kpis: ["dealer_onboard","data_quality"],
    smart_goals: "dealer_coord",
  },
  nrp_mgr: {
    summary: "Own ARD City's Overseas Pakistani and NRP sales channel across UAE, UK, Saudi Arabia, and Gulf. Generate PKR 500M in Year 1 from diaspora buyers through digital campaigns, property expos, and community networks.",
    responsibilities: [
      "Develop and execute the overseas/diaspora sales strategy for ARD City",
      "Manage WhatsApp NRP broadcast groups across UAE (200K+), UK (80K), Saudi (150K+)",
      "Represent ARD City at Dubai, London, and Riyadh property expos",
      "Host bi-weekly NRP webinars in Urdu with 200+ attendees",
      "Manage overseas agent network with 3% commission structure",
      "Coordinate Roshan Digital Account and OPF registration processes for NRP buyers",
      "Develop Urdu-language marketing content with design team",
      "Handle NRP buyer onboarding including power of attorney documentation",
      "Report NRP pipeline and quarterly revenue to VP Sales",
    ],
    requirements: [
      "8+ years experience with overseas Pakistani market — ideally has lived/worked in UAE or UK",
      "Fluent Urdu and English; Arabic a strong plus",
      "Deep understanding of NRP investment motivations and Roshan Digital framework",
      "Network in Pakistani diaspora communities across at least 2 countries",
      "Experience with property expo participation and international roadshows",
      "Ability to travel internationally as required",
    ],
    kpis: ["nrp_rev","nrp_webinars","leads_gen"],
    smart_goals: "nrp_mgr",
  },
  crm_lead: {
    summary: "Manage ARD City's CRM platform, lead quality, data hygiene, and sales reporting infrastructure across all verticals. Ensure every lead is tracked, followed up, and properly nurtured through the sales funnel.",
    responsibilities: [
      "Own and administer CRM platform (Salesforce/HubSpot or equivalent) for all verticals",
      "Define and enforce lead qualification, tagging, and pipeline stage standards",
      "Monitor and report daily/weekly lead follow-up rates across all teams",
      "Build automated lead routing, follow-up reminders, and WhatsApp integration",
      "Produce weekly pipeline health report and monthly funnel analytics for VP Sales",
      "Train all sales executives on CRM usage and data entry standards",
      "Manage lead source attribution and marketing ROI reporting",
      "Conduct weekly data quality audits and remediation",
    ],
    requirements: [
      "5+ years in CRM administration or sales operations",
      "Hands-on experience with Salesforce, HubSpot, or similar enterprise CRM",
      "Strong analytical skills and comfort with data visualization (Power BI/Tableau a plus)",
      "Experience building automated workflows and lead scoring models",
      "Real estate or high-volume sales background preferred",
      "BBA/BS in IT or Business; Salesforce/HubSpot certification preferred",
    ],
    kpis: ["leads_gen","followup_rate","data_quality"],
    smart_goals: "crm_lead",
  },
  mkt_mgr: {
    summary: "Lead all marketing activities for ARD City's launch and ongoing sales campaigns. Own the complete marketing funnel from brand awareness through lead generation, managing PKR 25M digital and OOH budget to deliver 8,000+ qualified leads per month.",
    responsibilities: [
      "Develop and execute ARD City's integrated marketing plan across digital, OOH, print, and events",
      "Manage Meta (Facebook/Instagram), Google, YouTube, and TikTok advertising campaigns",
      "Own lead generation target of 8,000/month at CPL ≤ PKR 1,500",
      "Manage Zameen.com, Graana.com, and OLX premium listings",
      "Oversee creative production — brochures, videos, 3D renders, virtual tours",
      "Plan and execute grand launch event, dealer meets, and on-ground activations",
      "Manage PR strategy including press releases and media relationships",
      "Develop overseas/NRP marketing content in Urdu and English",
      "Report weekly on campaign performance, lead quality, and CPL trends",
    ],
    requirements: [
      "8+ years marketing experience, minimum 3 years in Pakistan real estate or property sector",
      "Demonstrated experience managing PKR 20M+ digital ad budgets",
      "Proficiency in Meta Business Manager, Google Ads, and marketing analytics",
      "Experience with real estate portals and property marketing in Pakistan",
      "Strong creative direction ability and vendor management skills",
      "MBA in Marketing preferred; Bachelor's in Marketing/Communications minimum",
    ],
    kpis: ["leads_gen","cpl"],
    smart_goals: "mkt_mgr",
  },
};

// ── MODULES ─────────────────────────────────────────────────────────────────
const MODULES = [
  { id:"salesplan",  label:"Sales Plan",   icon:"📋", color:C.goldL,   desc:"5-Vertical Master Sales Plan" },
  { id:"kpis",       label:"KPIs",         icon:"📊", color:"#4A90D9", desc:"Performance Indicators Dashboard" },
  { id:"smartgoals", label:"SMART Goals",  icon:"🎯", color:"#2E8B57", desc:"Role-Linked SMART Objectives" },
  { id:"jds",        label:"Job Descriptions", icon:"👤", color:"#7B4FA6", desc:"Linked Roles & JDs" },
  { id:"export",     label:"Export",       icon:"⬇️", color:"#B8912A", desc:"Generate DOCX & PDF" },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: KPI Card
function KPICard({ kpi, formData, onUpdate }) {
  const vc = VERTICALS.find(v => v.id === kpi.vertical) || { color: C.gold };
  const actual = formData?.kpi_actuals?.[kpi.id] || "";
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(actual);

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"6px",
      padding:"14px 16px", borderLeft:`3px solid ${vc.color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
        <div style={{ fontSize:"11px", color:vc.color, fontFamily:"monospace",
          textTransform:"uppercase", letterSpacing:"0.08em" }}>{kpi.freq}</div>
        <div style={{ fontSize:"9px", color:C.muted, fontFamily:"monospace",
          background:C.surface, padding:"2px 6px", borderRadius:"3px" }}>
          {kpi.vertical === "all" ? "ALL VERTICALS" : kpi.vertical.toUpperCase()}
        </div>
      </div>
      <div style={{ fontSize:"13px", color:C.text, marginBottom:"6px", fontWeight:"600" }}>{kpi.label}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:"9px", color:C.muted, fontFamily:"monospace", marginBottom:"2px" }}>TARGET</div>
          <div style={{ fontSize:"16px", color:C.goldL, fontFamily:"monospace", fontWeight:"bold" }}>{kpi.target}</div>
          <div style={{ fontSize:"9px", color:C.muted }}>{kpi.unit}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"9px", color:C.muted, fontFamily:"monospace", marginBottom:"2px" }}>ACTUAL</div>
          {edit ? (
            <input autoFocus value={val}
              onChange={e => setVal(e.target.value)}
              onBlur={() => { onUpdate(kpi.id, val); setEdit(false); }}
              onKeyDown={e => { if(e.key==="Enter") { onUpdate(kpi.id, val); setEdit(false); } }}
              style={{ width:"80px", background:C.surface, border:`1px solid ${C.goldL}`,
                color:C.text, fontSize:"14px", padding:"3px 6px", borderRadius:"3px",
                textAlign:"right", fontFamily:"monospace", outline:"none" }} />
          ) : (
            <div onClick={() => setEdit(true)} style={{ cursor:"pointer",
              fontSize:"16px", color: actual ? "#4CAF8A" : C.muted,
              fontFamily:"monospace", fontWeight:"bold",
              padding:"2px 6px", borderRadius:"3px",
              border:`1px solid ${actual ? "#4CAF8A30" : C.border}` }}>
              {actual || "—"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// COMPONENT: SMART Goal Row
function SMARTGoalRow({ roleId, goalIdx, goal, formData, onUpdate }) {
  const key = `${roleId}_${goalIdx}`;
  const status = formData?.goal_status?.[key] || "pending";
  const note = formData?.goal_notes?.[key] || "";
  const [expanded, setExpanded] = useState(false);
  const [editNote, setEditNote] = useState(note);

  const STATUS_OPTS = ["pending","in_progress","achieved","at_risk"];
  const STATUS_COLOR = { pending:C.muted, in_progress:"#4A90D9", achieved:"#2E8B57", at_risk:"#B54A2A" };
  const STATUS_LABEL = { pending:"Pending", in_progress:"In Progress", achieved:"Achieved ✓", at_risk:"At Risk ⚠️" };

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"6px",
      marginBottom:"10px", overflow:"hidden" }}>
      <div style={{ padding:"12px 16px", cursor:"pointer", display:"flex",
        alignItems:"flex-start", gap:"12px" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ flexShrink:0, width:"8px", height:"8px", borderRadius:"50%",
          background:STATUS_COLOR[status], marginTop:"5px" }} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:"12px", color:C.text, lineHeight:"1.5", marginBottom:"4px" }}>
            {goal.goal}
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"9px", color:C.gold, fontFamily:"monospace",
              background:C.goldF, padding:"2px 6px", borderRadius:"3px" }}>
              {goal.category}
            </span>
            <span style={{ fontSize:"9px", color:C.muted, fontFamily:"monospace" }}>
              ⏱ {goal.timeframe}
            </span>
          </div>
        </div>
        <select value={status}
          onChange={e => { e.stopPropagation(); onUpdate(key, "status", e.target.value); }}
          onClick={e => e.stopPropagation()}
          style={{ background:C.surface, border:`1px solid ${STATUS_COLOR[status]}40`,
            color:STATUS_COLOR[status], fontSize:"10px", padding:"4px 6px",
            borderRadius:"4px", cursor:"pointer", fontFamily:"monospace", outline:"none" }}>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      {expanded && (
        <div style={{ padding:"0 16px 12px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ marginTop:"10px", marginBottom:"8px" }}>
            <div style={{ fontSize:"9px", color:C.muted, fontFamily:"monospace",
              textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"4px" }}>
              Linked KPIs
            </div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {goal.linked_kpis.map(kid => {
                const k = Object.values(KPI_LIBRARY).flat().find(k=>k.id===kid);
                return k ? (
                  <span key={kid} style={{ fontSize:"9px", fontFamily:"monospace",
                    color:"#4A90D9", background:"#4A90D914",
                    padding:"2px 8px", borderRadius:"3px", border:"1px solid #4A90D930" }}>
                    {k.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <textarea placeholder="Progress notes..."
            value={editNote}
            onChange={e => setEditNote(e.target.value)}
            onBlur={() => onUpdate(key, "note", editNote)}
            style={{ width:"100%", boxSizing:"border-box",
              background:"#070D1A", border:`1px solid ${C.border}`,
              color:C.dim, fontSize:"11px", padding:"7px 10px",
              borderRadius:"4px", resize:"vertical", minHeight:"60px",
              outline:"none", fontFamily:"Georgia, serif" }} />
        </div>
      )}
    </div>
  );
}

// COMPONENT: JD Card
function JDCard({ role, formData, onSelect, isSelected }) {
  const vc = VERTICALS.find(v => v.id === role.vertical);
  const jd = JD_CONTENT[role.id];

  return (
    <div onClick={() => onSelect(role.id)}
      style={{ background: isSelected ? `${role.color}18` : C.card,
        border: `1px solid ${isSelected ? role.color : C.border}`,
        borderRadius:"6px", padding:"14px 16px", cursor:"pointer",
        transition:"all 0.15s", marginBottom:"8px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:"13px", color:C.text, fontWeight:"600", marginBottom:"4px" }}>
            {role.title}
          </div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"9px", color:role.color, fontFamily:"monospace",
              background:`${role.color}18`, padding:"2px 7px", borderRadius:"3px" }}>
              {role.band}
            </span>
            {vc && (
              <span style={{ fontSize:"9px", color:vc.color, fontFamily:"monospace",
                background:`${vc.color}14`, padding:"2px 7px", borderRadius:"3px" }}>
                {vc.icon} {vc.label}
              </span>
            )}
            {role.vertical === "all" && (
              <span style={{ fontSize:"9px", color:C.gold, fontFamily:"monospace",
                background:C.goldF, padding:"2px 7px", borderRadius:"3px" }}>
                ◈ All Verticals
              </span>
            )}
          </div>
        </div>
        <div style={{ fontSize:"10px", color: isSelected ? role.color : C.muted,
          fontFamily:"monospace" }}>{isSelected ? "◉ OPEN" : "○"}</div>
      </div>
      {isSelected && jd && (
        <div style={{ marginTop:"14px", borderTop:`1px solid ${C.border}`, paddingTop:"14px" }}>
          <div style={{ fontSize:"11px", color:C.dim, lineHeight:"1.6", marginBottom:"12px",
            fontStyle:"italic", borderLeft:`2px solid ${role.color}`, paddingLeft:"10px" }}>
            {jd.summary}
          </div>
          <div style={{ marginBottom:"12px" }}>
            <div style={{ fontSize:"10px", color:role.color, fontFamily:"monospace",
              textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"6px" }}>
              Key Responsibilities
            </div>
            {jd.responsibilities.map((r,i) => (
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"5px" }}>
                <span style={{ color:role.color, fontSize:"10px", marginTop:"2px", flexShrink:0 }}>▸</span>
                <span style={{ fontSize:"11px", color:C.text, lineHeight:"1.5" }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:"12px" }}>
            <div style={{ fontSize:"10px", color:role.color, fontFamily:"monospace",
              textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"6px" }}>
              Requirements
            </div>
            {jd.requirements.map((r,i) => (
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"5px" }}>
                <span style={{ color:C.muted, fontSize:"10px", marginTop:"2px", flexShrink:0 }}>•</span>
                <span style={{ fontSize:"11px", color:C.dim, lineHeight:"1.5" }}>{r}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize:"10px", color:"#4A90D9", fontFamily:"monospace",
              textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"6px" }}>
              Linked KPIs
            </div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {jd.kpis.map(kid => {
                const k = Object.values(KPI_LIBRARY).flat().find(k=>k.id===kid);
                return k ? (
                  <span key={kid} style={{ fontSize:"9px", fontFamily:"monospace",
                    color:"#4A90D9", background:"#4A90D914",
                    padding:"2px 8px", borderRadius:"3px", border:"1px solid #4A90D930" }}>
                    {k.label}: {k.target} {k.unit}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SALES PLAN SECTION CONFIG (condensed - key fields per vertical)
const SP_META_FIELDS = [
  {id:"planTitle",label:"Plan Title",type:"text",ph:"ARD City Master Sales Plan 2025–2026"},
  {id:"development",label:"Development",type:"text",ph:"ARD City"},
  {id:"location",label:"Location",type:"text",ph:"e.g. Lahore – Motorway Interchange"},
  {id:"developer",label:"Developer",type:"text",ph:"ARD Builders & Developers"},
  {id:"preparedBy",label:"Prepared By",type:"text",ph:"Ali Bin Nadeem, CTO – CyberX Inc."},
  {id:"date",label:"Document Date",type:"text",ph:"March 2025"},
  {id:"planPeriod",label:"Plan Period",type:"text",ph:"April 2025 – March 2026"},
  {id:"totalRevenue",label:"Total Revenue Target",type:"text",ph:"PKR 4.8 Billion"},
  {id:"totalInventory",label:"Total Inventory",type:"text",ph:"1,200 plots | 350 villas | 80 commercial"},
  {id:"launchDate",label:"Launch Date",type:"text",ph:"April 20, 2025"},
  {id:"productMix",label:"Product Mix",type:"textarea",ph:"5 Marla: 450\n10 Marla: 300\nCommercial: 80\nVillas: 60"},
  {id:"pricingOverview",label:"Pricing Overview",type:"textarea",ph:"5 Marla: PKR 2.5M–3.2M\n10 Marla: PKR 4.8M–6.0M"},
  {id:"keyDifferentiators",label:"Key Differentiators",type:"textarea",ph:"Smart city infra, LDA approved, M-2 adjacency..."},
  {id:"executiveSummary",label:"Executive Summary",type:"textarea",ph:"Strategic overview..."},
];

const SP_VERT_FIELDS = [
  {id:"objective",label:"Objective",type:"text",ph:"Primary goal for this vertical..."},
  {id:"targetSegment",label:"Target Segment",type:"textarea",ph:"Buyer/client profile..."},
  {id:"revenueTarget",label:"Revenue Target",type:"text",ph:"e.g. PKR 600M"},
  {id:"valueProp",label:"Value Proposition",type:"textarea",ph:"Why ARD City for this vertical..."},
  {id:"salesApproach",label:"Sales Approach",type:"textarea",ph:"How this vertical is activated..."},
  {id:"pricing",label:"Pricing & Payment",type:"textarea",ph:"Special pricing, payment plans..."},
  {id:"leadGen",label:"Lead Generation",type:"textarea",ph:"How leads are sourced..."},
  {id:"partnerships",label:"Partnerships / MOUs",type:"textarea",ph:"Agreements required..."},
  {id:"incentives",label:"Incentives & Commission",type:"textarea",ph:"Commission structure..."},
  {id:"kpis",label:"Vertical KPIs",type:"textarea",ph:"Targets for this vertical..."},
  {id:"risks",label:"Risks & Mitigation",type:"textarea",ph:"Key risks..."},
];

// ── FIELD COMPONENT ──────────────────────────────────────────────────────────
function SPField({ f, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width:"100%", boxSizing:"border-box", background:"#060B14",
    border:`1px solid ${focused ? C.goldL : C.border}`,
    borderRadius:"4px", color:C.text, fontSize:"12px",
    padding:"8px 11px", outline:"none", fontFamily:"Georgia, serif",
    transition:"border-color 0.15s",
  };
  return (
    <div style={{ marginBottom:"14px" }}>
      <label style={{ display:"block", fontSize:"10px", fontWeight:"700",
        letterSpacing:"0.09em", color:C.muted, textTransform:"uppercase",
        marginBottom:"5px", fontFamily:"monospace" }}>{f.label}</label>
      {f.type==="textarea"
        ? <textarea style={{...base,minHeight:"72px",resize:"vertical"}}
            placeholder={f.ph} value={value||""}
            onChange={e=>onChange(f.id,e.target.value)}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
        : <input type="text" style={base} placeholder={f.ph} value={value||""}
            onChange={e=>onChange(f.id,e.target.value)}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
      }
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ARDCitySystem() {
  const [module, setModule] = useState("salesplan");
  const [spSection, setSpSection] = useState("meta"); // sales plan sub-nav
  const [kpiFilter, setKpiFilter] = useState("all"); // all / vertical id / category
  const [selectedJD, setSelectedJD] = useState(null);
  const [goalRole, setGoalRole] = useState("vp_sales");
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(null);
  const [aiLog, setAiLog] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),4000); };

  const setField = useCallback((section, field, val) => {
    setFormData(prev => ({ ...prev, [section]: { ...(prev[section]||{}), [field]: val } }));
  }, []);

  const setKPIActual = useCallback((kpiId, val) => {
    setFormData(prev => ({
      ...prev,
      kpi_actuals: { ...(prev.kpi_actuals||{}), [kpiId]: val }
    }));
  }, []);

  const setGoalUpdate = useCallback((key, type, val) => {
    setFormData(prev => ({
      ...prev,
      [`goal_${type === "status" ? "status" : "notes"}`]: {
        ...(prev[`goal_${type === "status" ? "status" : "notes"}`]||{}),
        [key]: val
      }
    }));
  }, []);

  // Compute overall plan completion
  const planPct = (() => {
    let filled = 0, total = 0;
    SP_META_FIELDS.forEach(f => { total++; if(formData.meta?.[f.id]?.trim?.()) filled++; });
    VERTICALS.forEach(v => SP_VERT_FIELDS.forEach(f => { total++; if(formData[v.id]?.[f.id]?.trim?.()) filled++; }));
    return total ? Math.round(filled/total*100) : 0;
  })();

  // AI Review
  const handleAIReview = async () => {
    setAiLoading(true); setAiLog("");
    const planText = Object.entries(formData).filter(([k]) => k !== "kpi_actuals" && !k.startsWith("goal_"))
      .map(([k,v]) => `${k.toUpperCase()}: ${JSON.stringify(v)}`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`You are a senior real estate sales strategist expert in Pakistan's property market. Review this ARD City Sales Plan data and provide a sharp 3-section brief: STRENGTHS, GAPS, TOP 3 RECOMMENDATIONS. Be direct and Pakistan-market-specific.`,
          messages:[{role:"user",content:`ARD City Sales Plan:\n${planText}`}],
        }),
      });
      const d = await res.json();
      setAiLog(d.content?.map(b=>b.text).join("")||"No response.");
    } catch(e) { setAiLog("Error: "+e.message); }
    setAiLoading(false);
  };

  // Generate docs
  const handleGenerate = async type => {
    setGenerating(type);
    let summary = "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`Respond ONLY with JSON: {"summary":"...120 word executive summary..."}`,
          messages:[{role:"user",content:`ARD City Sales Plan: ${JSON.stringify(formData.meta||{})}`}],
        }),
      });
      const d = await res.json();
      try { summary = JSON.parse(d.content.map(b=>b.text).join("").replace(/```json|```/g,"").trim()).summary||""; } catch{}
    } catch{}
    try {
      const res = await fetch(`/api/ard-generate?type=${type}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ formData, summary, kpi_data: KPI_LIBRARY,
          jd_data: JD_CONTENT, roles: JD_ROLES, smart_templates: SMART_TEMPLATES }),
      });
      if(res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href=url; a.download=`ARD_City_Sales_Intelligence_${Date.now()}.${type}`; a.click();
        showToast(`✓ ${type.toUpperCase()} downloaded`);
      } else { showToast(`✓ Ready. Backend needed to download ${type.toUpperCase()}.`); }
    } catch { showToast(`✓ Plan compiled. Connect backend for ${type.toUpperCase()} export.`); }
    setGenerating(null);
  };

  // All KPIs flattened
  const allKPIs = Object.values(KPI_LIBRARY).flat();
  const filteredKPIs = kpiFilter === "all" ? allKPIs
    : Object.keys(KPI_LIBRARY).includes(kpiFilter) ? KPI_LIBRARY[kpiFilter]
    : allKPIs.filter(k => k.vertical === kpiFilter || k.vertical.includes(kpiFilter));

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column"}}>

      {/* TOP BAR */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{fontSize:"9px",color:C.gold,fontFamily:"monospace",letterSpacing:"0.2em",
            textTransform:"uppercase",marginBottom:"2px"}}>ARD CITY  ·  SALES INTELLIGENCE COMMAND</div>
          <div style={{fontSize:"17px",letterSpacing:"0.03em"}}>
            Master Sales Plan  <span style={{color:C.gold}}>+</span> KPIs  <span style={{color:C.gold}}>+</span> Goals  <span style={{color:C.gold}}>+</span> JDs
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginRight:"8px"}}>
            <div style={{width:"100px",height:"3px",background:C.border,borderRadius:"2px"}}>
              <div style={{width:`${planPct}%`,height:"100%",
                background:`linear-gradient(90deg,${C.gold},${C.goldL})`,borderRadius:"2px",transition:"width 0.4s"}}/>
            </div>
            <span style={{fontSize:"11px",color:C.gold,fontFamily:"monospace"}}>{planPct}% plan</span>
          </div>
          <button onClick={handleAIReview} disabled={aiLoading}
            style={{padding:"7px 13px",background:"transparent",border:`1px solid ${C.gold}`,
              color:C.goldL,borderRadius:"4px",fontSize:"10px",cursor:"pointer",fontFamily:"monospace"}}>
            {aiLoading?"⟳":"✦"} AI Review
          </button>
          <button onClick={()=>handleGenerate("docx")} disabled={!!generating}
            style={{padding:"7px 13px",background:generating==="docx"?C.border:C.gold,
              color:C.navy,border:"none",borderRadius:"4px",fontSize:"10px",
              fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
            {generating==="docx"?"⟳":"⬇"} DOCX
          </button>
          <button onClick={()=>handleGenerate("pdf")} disabled={!!generating}
            style={{padding:"7px 13px",background:"transparent",
              border:`1px solid ${generating==="pdf"?C.border:C.gold}`,
              color:generating==="pdf"?C.muted:C.goldL,borderRadius:"4px",
              fontSize:"10px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
            {generating==="pdf"?"⟳":"⬇"} PDF
          </button>
        </div>
      </div>

      {/* MODULE NAV */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        display:"flex",padding:"0 24px",flexShrink:0}}>
        {MODULES.map(m=>(
          <div key={m.id} onClick={()=>setModule(m.id)}
            style={{padding:"10px 18px",cursor:"pointer",fontSize:"12px",
              borderBottom:`2px solid ${module===m.id?m.color:"transparent"}`,
              color:module===m.id?C.text:C.muted,display:"flex",alignItems:"center",gap:"7px",
              transition:"all 0.15s",marginRight:"4px"}}>
            <span>{m.icon}</span>
            <span style={{fontWeight:module===m.id?"600":"normal"}}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* BODY */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── SALES PLAN MODULE ─────────────────────────────────────────── */}
        {module==="salesplan" && (
          <>
            {/* sidebar */}
            <div style={{width:"190px",background:C.surface,borderRight:`1px solid ${C.border}`,
              overflowY:"auto",flexShrink:0,padding:"12px 0"}}>
              <div style={{padding:"8px 14px 4px",fontSize:"9px",color:C.muted,
                fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>Core</div>
              {[{id:"meta",label:"Plan Overview",icon:"◈",color:C.goldL}].map(s=>(
                <div key={s.id} onClick={()=>setSpSection(s.id)}
                  style={{padding:"8px 14px",cursor:"pointer",
                    borderLeft:spSection===s.id?`3px solid ${s.color}`:"3px solid transparent",
                    background:spSection===s.id?`${s.color}12`:"transparent",
                    fontSize:"11px",color:spSection===s.id?C.text:C.dim}}>
                  {s.icon} {s.label}
                </div>
              ))}
              <div style={{padding:"10px 14px 4px",fontSize:"9px",color:C.muted,
                fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:"8px",
                borderTop:`1px solid ${C.border}`}}>Verticals</div>
              {VERTICALS.map(v=>{
                const filled = SP_VERT_FIELDS.filter(f=>formData[v.id]?.[f.id]?.trim?.()).length;
                const pct = Math.round(filled/SP_VERT_FIELDS.length*100);
                return (
                  <div key={v.id} onClick={()=>setSpSection(v.id)}
                    style={{padding:"8px 14px",cursor:"pointer",
                      borderLeft:spSection===v.id?`3px solid ${v.color}`:"3px solid transparent",
                      background:spSection===v.id?`${v.color}14`:"transparent"}}>
                    <div style={{fontSize:"11px",color:spSection===v.id?C.text:C.dim}}>
                      {v.icon} {v.label}
                    </div>
                    {pct>0&&<div style={{fontSize:"9px",color:v.color,fontFamily:"monospace"}}>{pct}%</div>}
                  </div>
                );
              })}
            </div>
            {/* main */}
            <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
              {spSection==="meta" ? (
                <>
                  <div style={{fontSize:"10px",color:C.goldL,fontFamily:"monospace",
                    letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"16px"}}>
                    ◈ Plan Overview & Configuration
                  </div>
                  {SP_META_FIELDS.map(f=>(
                    <SPField key={f.id} f={f}
                      value={formData.meta?.[f.id]}
                      onChange={(fid,val)=>setField("meta",fid,val)} />
                  ))}
                </>
              ) : (
                (() => {
                  const v = VERTICALS.find(vv=>vv.id===spSection);
                  if(!v) return null;
                  return (
                    <>
                      <div style={{padding:"12px 16px",borderRadius:"6px",marginBottom:"20px",
                        background:`${v.color}14`,border:`1px solid ${v.color}40`}}>
                        <div style={{fontSize:"15px",color:C.text,marginBottom:"2px"}}>
                          {v.icon} {v.fullName || v.name}
                        </div>
                        <div style={{fontSize:"10px",color:v.color,fontFamily:"monospace"}}>{v.label} VERTICAL PLAN</div>
                      </div>
                      {SP_VERT_FIELDS.map(f=>(
                        <SPField key={f.id} f={f}
                          value={formData[v.id]?.[f.id]}
                          onChange={(fid,val)=>setField(v.id,fid,val)} />
                      ))}
                    </>
                  );
                })()
              )}
            </div>
          </>
        )}

        {/* ── KPIs MODULE ───────────────────────────────────────────────── */}
        {module==="kpis" && (
          <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
            <div style={{marginBottom:"20px"}}>
              <div style={{fontSize:"10px",color:"#4A90D9",fontFamily:"monospace",
                letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>
                📊 KPI Dashboard — Click any actual to edit
              </div>
              {/* filter bar */}
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"20px"}}>
                {[{id:"all",label:"All KPIs",color:C.goldL},
                  ...Object.keys(KPI_LIBRARY).map(k=>({id:k,label:k.toUpperCase(),color:"#4A90D9"})),
                  ...VERTICALS.map(v=>({id:v.id,label:`${v.icon} ${v.label}`,color:v.color}))
                ].map(f=>(
                  <button key={f.id} onClick={()=>setKpiFilter(f.id)}
                    style={{padding:"5px 12px",background:kpiFilter===f.id?`${f.color}20`:"transparent",
                      border:`1px solid ${kpiFilter===f.id?f.color:C.border}`,
                      color:kpiFilter===f.id?f.color:C.muted,borderRadius:"4px",
                      fontSize:"10px",cursor:"pointer",fontFamily:"monospace"}}>
                    {f.label}
                  </button>
                ))}
              </div>
              {/* KPI cards by category */}
              {Object.entries(KPI_LIBRARY).map(([cat, kpis]) => {
                const visible = kpis.filter(k=>filteredKPIs.includes(k));
                if(!visible.length) return null;
                return (
                  <div key={cat} style={{marginBottom:"24px"}}>
                    <div style={{fontSize:"10px",color:C.muted,fontFamily:"monospace",
                      textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"10px",
                      paddingBottom:"6px",borderBottom:`1px solid ${C.border}`}}>
                      {cat === "revenue" ? "💰 Revenue KPIs" : cat === "pipeline" ? "🔄 Pipeline KPIs" :
                       cat === "activity" ? "⚡ Activity KPIs" : "✅ Quality KPIs"}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"10px"}}>
                      {visible.map(kpi=>(
                        <KPICard key={kpi.id} kpi={kpi} formData={formData} onUpdate={setKPIActual} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SMART GOALS MODULE ────────────────────────────────────────── */}
        {module==="smartgoals" && (
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            {/* role picker */}
            <div style={{width:"200px",background:C.surface,borderRight:`1px solid ${C.border}`,
              overflowY:"auto",flexShrink:0,padding:"12px 0"}}>
              <div style={{padding:"8px 14px 6px",fontSize:"9px",color:C.muted,
                fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>Select Role</div>
              {JD_ROLES.filter(r=>SMART_TEMPLATES[r.id]).map(role=>{
                const goals = SMART_TEMPLATES[role.id]||[];
                const achieved = goals.filter((_,i)=>formData.goal_status?.[`${role.id}_${i}`]==="achieved").length;
                return (
                  <div key={role.id} onClick={()=>setGoalRole(role.id)}
                    style={{padding:"9px 14px",cursor:"pointer",
                      borderLeft:goalRole===role.id?`3px solid ${role.color}`:"3px solid transparent",
                      background:goalRole===role.id?`${role.color}14`:"transparent"}}>
                    <div style={{fontSize:"11px",color:goalRole===role.id?C.text:C.dim,marginBottom:"2px"}}>
                      {role.title}
                    </div>
                    <div style={{fontSize:"9px",color:role.color,fontFamily:"monospace"}}>
                      {achieved}/{goals.length} achieved
                    </div>
                  </div>
                );
              })}
            </div>
            {/* goals content */}
            <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
              {(() => {
                const role = JD_ROLES.find(r=>r.id===goalRole);
                const goals = SMART_TEMPLATES[goalRole]||[];
                const jd = JD_CONTENT[goalRole];
                return (
                  <>
                    <div style={{padding:"12px 16px",borderRadius:"6px",marginBottom:"20px",
                      background:`${role.color}14`,border:`1px solid ${role.color}40`,
                      display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:"14px",color:C.text,marginBottom:"2px"}}>{role.title}</div>
                        <div style={{fontSize:"10px",color:role.color,fontFamily:"monospace"}}>{role.band}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"9px",color:C.muted,fontFamily:"monospace",marginBottom:"3px"}}>LINKED KPIs</div>
                        <div style={{display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                          {(jd?.kpis||[]).slice(0,3).map(kid=>{
                            const k = Object.values(KPI_LIBRARY).flat().find(k=>k.id===kid);
                            return k ? <span key={kid} style={{fontSize:"8px",color:"#4A90D9",
                              fontFamily:"monospace",background:"#4A90D914",
                              padding:"1px 5px",borderRadius:"2px"}}>{k.label}</span> : null;
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{fontSize:"10px",color:C.muted,fontFamily:"monospace",
                      textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"12px"}}>
                      🎯 SMART Goals — {goals.length} objectives · Click to expand &amp; track progress
                    </div>
                    {goals.map((goal,i)=>(
                      <SMARTGoalRow key={i} roleId={goalRole} goalIdx={i}
                        goal={goal} formData={formData} onUpdate={setGoalUpdate} />
                    ))}
                    {goals.length===0&&(
                      <div style={{color:C.muted,fontSize:"12px",fontStyle:"italic",padding:"20px 0"}}>
                        No SMART goals configured for this role.
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── JDs MODULE ────────────────────────────────────────────────── */}
        {module==="jds" && (
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            {/* vertical filter */}
            <div style={{width:"190px",background:C.surface,borderRight:`1px solid ${C.border}`,
              overflowY:"auto",flexShrink:0,padding:"12px 0"}}>
              <div style={{padding:"8px 14px 4px",fontSize:"9px",color:C.muted,
                fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>Filter by Vertical</div>
              {[{id:"all",label:"All Roles",icon:"◈",color:C.goldL},
                ...VERTICALS.map(v=>({...v,name:v.label}))
              ].map(f=>(
                <div key={f.id} onClick={()=>setKpiFilter(f.id)}
                  style={{padding:"8px 14px",cursor:"pointer",fontSize:"11px",
                    borderLeft:kpiFilter===f.id?`3px solid ${f.color}`:"3px solid transparent",
                    background:kpiFilter===f.id?`${f.color}12`:"transparent",
                    color:kpiFilter===f.id?C.text:C.dim}}>
                  {f.icon} {f.label||f.name}
                </div>
              ))}
            </div>
            {/* JD list */}
            <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
              <div style={{fontSize:"10px",color:"#7B4FA6",fontFamily:"monospace",
                letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"16px"}}>
                👤 Job Descriptions — Linked to KPIs & SMART Goals · Click to expand
              </div>
              {JD_ROLES
                .filter(r => kpiFilter==="all" || r.vertical===kpiFilter || r.vertical==="all")
                .map(role=>(
                  <JDCard key={role.id} role={role} formData={formData}
                    isSelected={selectedJD===role.id}
                    onSelect={id=>setSelectedJD(selectedJD===id?null:id)} />
                ))}
            </div>
          </div>
        )}

        {/* ── EXPORT MODULE ─────────────────────────────────────────────── */}
        {module==="export" && (
          <div style={{flex:1,overflowY:"auto",padding:"32px 40px"}}>
            <div style={{maxWidth:"600px"}}>
              <div style={{fontSize:"10px",color:C.goldL,fontFamily:"monospace",
                letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"24px"}}>
                ⬇️ Export — Full Sales Intelligence Package
              </div>
              {[
                {title:"Master Sales Plan + KPIs + Goals + JDs",desc:"Complete 60+ page strategic document including all 5 vertical plans, KPI framework, SMART goals per role, and full job descriptions.",type:"docx",icon:"📄"},
                {title:"PDF Export",desc:"Print-ready PDF version with ARD City branding, gold headers, section dividers, and executive cover page.",type:"pdf",icon:"📑"},
              ].map(item=>(
                <div key={item.type} style={{background:C.card,border:`1px solid ${C.border}`,
                  borderRadius:"8px",padding:"24px",marginBottom:"16px"}}>
                  <div style={{fontSize:"16px",color:C.text,marginBottom:"6px"}}>{item.icon} {item.title}</div>
                  <div style={{fontSize:"12px",color:C.dim,lineHeight:"1.6",marginBottom:"16px"}}>{item.desc}</div>
                  <button onClick={()=>handleGenerate(item.type)} disabled={!!generating}
                    style={{padding:"10px 24px",
                      background:item.type==="docx"?C.gold:"transparent",
                      color:item.type==="docx"?C.navy:C.goldL,
                      border:`1px solid ${C.gold}`,borderRadius:"5px",
                      fontSize:"12px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
                    {generating===item.type?"⟳ Generating...":
                      `⬇ Download ${item.type.toUpperCase()}`}
                  </button>
                </div>
              ))}
              <div style={{background:C.card,border:`1px solid ${C.border}`,
                borderRadius:"8px",padding:"20px",marginTop:"8px"}}>
                <div style={{fontSize:"11px",color:C.muted,lineHeight:"1.7"}}>
                  <div style={{color:C.goldL,fontFamily:"monospace",fontSize:"10px",
                    textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>
                    What's included in the export
                  </div>
                  {["Cover page with ARD City branding & key plan metadata",
                    "Executive Summary (AI-generated + manual)",
                    "Plan Overview with inventory, pricing & differentiators",
                    "5 Vertical Plans: B2G, B2C, B2B, Channel, Overseas/Diaspora",
                    "Master Timeline & Execution Phases",
                    "Budget Allocation breakdown",
                    "Events & Activations Strategy",
                    "Integrated Marketing Plan",
                    "KPI Framework (Revenue, Pipeline, Activity, Quality)",
                    "SMART Goals per role (linked to KPIs)",
                    "10 Job Descriptions with responsibilities & requirements",
                  ].map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:"8px",marginBottom:"5px"}}>
                      <span style={{color:C.green,flexShrink:0}}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI PANEL (right) */}
        {aiLog && (
          <div style={{width:"260px",background:C.surface,borderLeft:`1px solid ${C.border}`,
            overflowY:"auto",padding:"18px 16px",flexShrink:0}}>
            <div style={{fontSize:"10px",color:C.gold,fontFamily:"monospace",
              textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"12px"}}>
              ✦ AI Intelligence Brief
            </div>
            <div style={{fontSize:"11px",color:C.text,lineHeight:"1.75",whiteSpace:"pre-wrap"}}>
              {aiLog}
            </div>
            <button onClick={()=>setAiLog("")}
              style={{marginTop:"14px",padding:"5px 10px",background:"transparent",
                border:`1px solid ${C.border}`,color:C.muted,
                borderRadius:"3px",fontSize:"10px",cursor:"pointer",fontFamily:"monospace"}}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",bottom:"20px",right:"20px",
          background:"#0D2A1A",border:"1px solid #2E8B57",color:"#90EE90",
          padding:"10px 18px",borderRadius:"6px",fontSize:"11px",
          fontFamily:"monospace",zIndex:9999,boxShadow:"0 4px 20px #00000070"}}>
          {toast}
        </div>
      )}
    </div>
  );
}
