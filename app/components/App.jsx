import { useState, useCallback, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// ARD CITY — FULLY DYNAMIC SALES INTELLIGENCE SYSTEM
// Every element is add / edit / remove capable:
//  • Sections  • Fields within sections  • Verticals
//  • KPI categories & individual KPIs   • SMART Goals per role
//  • JD Roles & every field inside JDs  • Sales Plan content
// ═══════════════════════════════════════════════════════════════════════

const C = {
  bg:"#060B14", surface:"#0A1220", card:"#0D1830", card2:"#101F3A",
  border:"#162238", borderHi:"#2A4060",
  gold:"#B8912A", goldL:"#D4A843", goldD:"#8A6B1A", goldF:"#B8912A15",
  navy:"#0B1A30", text:"#D8E2F0", muted:"#4A6080", dim:"#7A90A8",
  greenL:"#3DA863", redL:"#C44030", blueL:"#2A80D0", purple:"#8A5FD4",
  white:"#FFFFFF",
};

const uid = () => Math.random().toString(36).slice(2, 9);

const VERT_PALETTE = ["#1A6BB5","#2E8B57","#B54A2A","#7B4FA6","#1A8A8A","#D44A6A","#D4823A","#4A90D9"];
const VERT_ICONS   = ["🏛","🏠","🏢","🤝","✈️","🏗","💼","🌐","🏦","🎯"];

const DEFAULT_VERTICALS = [
  {id:"b2g",     label:"B2G",              fullName:"Business to Government",        color:"#1A6BB5", icon:"🏛", tagline:"Govt Housing / Institutional Allotments"},
  {id:"b2c",     label:"B2C",              fullName:"Business to Consumer",           color:"#2E8B57", icon:"🏠", tagline:"Direct Retail / End-User Sales"},
  {id:"b2b",     label:"B2B Corporate",    fullName:"Business to Business Corporate", color:"#B54A2A", icon:"🏢", tagline:"Corporate Bulk / Employee Housing"},
  {id:"channel", label:"Channel Partners", fullName:"Dealer & Channel Network",       color:"#7B4FA6", icon:"🤝", tagline:"Franchise Dealers / Sub-Agents / Brokers"},
  {id:"diaspora",label:"Overseas/Diaspora",fullName:"Overseas Pakistani & Diaspora",  color:"#1A8A8A", icon:"✈️", tagline:"NRP / UAE / UK / Saudi / Gulf Market"},
];

const mkId = () => uid();

const DEFAULT_SECTIONS = () => [
  {id:"meta", label:"Plan Overview", icon:"◈", color:C.goldL, fields:[
    {id:mkId(),label:"Plan Title",type:"text",ph:"ARD City Master Sales Plan 2025–2026"},
    {id:mkId(),label:"Development Name",type:"text",ph:"ARD City"},
    {id:mkId(),label:"Project Location",type:"text",ph:"Lahore – Motorway M-2 Interchange"},
    {id:mkId(),label:"Developer / Company",type:"text",ph:"ARD Builders & Developers"},
    {id:mkId(),label:"Project Type",type:"text",ph:"Residential Township · Mixed-Use · Gated Community"},
    {id:mkId(),label:"Prepared By",type:"text",ph:"Ali Bin Nadeem, CTO – CyberX Inc."},
    {id:mkId(),label:"Document Date",type:"text",ph:"March 2025"},
    {id:mkId(),label:"Plan Period",type:"text",ph:"April 2025 – March 2026"},
    {id:mkId(),label:"Total Revenue Target",type:"text",ph:"PKR 4.8 Billion"},
    {id:mkId(),label:"Total Inventory",type:"text",ph:"1,200 plots | 350 villas | 80 commercial"},
    {id:mkId(),label:"Launch Date",type:"text",ph:"April 20, 2025"},
    {id:mkId(),label:"Primary Markets",type:"text",ph:"Pakistan domestic + UAE + UK + Saudi + Gulf"},
    {id:mkId(),label:"Regulatory Framework",type:"text",ph:"LDA Approved · RERA Registered"},
    {id:mkId(),label:"Product Mix & Inventory",type:"textarea",ph:"5 Marla: 450 units\n10 Marla: 300 units\nVillas: 60 units\nCommercial: 80 units"},
    {id:mkId(),label:"Pricing Overview",type:"textarea",ph:"5 Marla: PKR 2.5M–3.2M\n10 Marla: PKR 4.8M–6.0M"},
    {id:mkId(),label:"Key Differentiators",type:"textarea",ph:"Smart city infra, LDA approved, M-2 adjacency..."},
    {id:mkId(),label:"Market Context",type:"textarea",ph:"Post-IMF stabilization, remittances up 22% YoY..."},
    {id:mkId(),label:"ARD City Positioning",type:"textarea",ph:"Premium mid-market vs DHA, above general schemes..."},
    {id:mkId(),label:"Sales Objectives",type:"textarea",ph:"Year 1: 40% inventory sold\n250+ active dealers\n3 B2G MOUs"},
    {id:mkId(),label:"Executive Summary",type:"textarea",ph:"Strategic overview of the 5-vertical go-to-market..."},
  ]},
  {id:"productRelease", label:"Product Release Order", icon:"①", color:"#4CAF8A", fields:[
    {id:mkId(),label:"Products / Assets (Release Order)",type:"textarea",ph:"1. Residential Plots (5 Marla)\n2. Commercial (4 Marla)\n3. Villas (10 Marla)"},
    {id:mkId(),label:"Sequencing Rationale",type:"textarea",ph:"Residential first for base demand..."},
    {id:mkId(),label:"Market Absorption Strategy",type:"textarea",ph:"30% inventory release per quarter..."},
    {id:mkId(),label:"Pricing Structure per Phase",type:"textarea",ph:"Phase 1: PKR 2.5M/Marla\nPhase 2: PKR 2.8M (+12%)"},
    {id:mkId(),label:"Reserved / Restricted Inventory",type:"textarea",ph:"B2G allotment: 200 units\nCorporate: 100 units"},
  ]},
  {id:"timeline", label:"Timeline", icon:"◷", color:"#4A90D9", fields:[
    {id:mkId(),label:"Official Launch Date",type:"text",ph:"April 20, 2025"},
    {id:mkId(),label:"Execution Phases",type:"textarea",ph:"Phase 1 (Month 1–2): Pre-launch\nPhase 2 (Month 3–4): Grand launch"},
    {id:mkId(),label:"Key Milestones",type:"textarea",ph:"Month 1: 250 dealers\nMonth 3: 15% sold\nMonth 6: 40% sold"},
    {id:mkId(),label:"Delivery & Possession Schedule",type:"textarea",ph:"Residential: 12 months\nCommercial: 18 months"},
    {id:mkId(),label:"Review & Reporting Cadence",type:"textarea",ph:"Weekly: Pipeline\nMonthly: Revenue vs target"},
  ]},
  {id:"budget", label:"Budget", icon:"₿", color:"#D4823A", fields:[
    {id:mkId(),label:"Total Sales & Marketing Budget",type:"text",ph:"PKR 80 Million"},
    {id:mkId(),label:"Budget by Vertical",type:"textarea",ph:"B2G: PKR 8M\nB2C: PKR 22M\nB2B: PKR 6M\nChannel: PKR 12M\nOverseas: PKR 10M"},
    {id:mkId(),label:"Marketing & Advertising",type:"textarea",ph:"Digital: PKR 14M\nOOH: PKR 10M\nPrint: PKR 4M"},
    {id:mkId(),label:"Events & Activations",type:"text",ph:"PKR 12M across 8 events"},
    {id:mkId(),label:"Technology & CRM",type:"text",ph:"PKR 5M — CRM, WhatsApp automation"},
    {id:mkId(),label:"Commissions & Incentives",type:"textarea",ph:"Direct: 1.5%\nDealer: 2.5%\nCorporate: 2%\nOverseas: 3%"},
    {id:mkId(),label:"Contingency Reserve",type:"text",ph:"PKR 8M (10%)"},
  ]},
  {id:"events", label:"Events Strategy", icon:"◉", color:"#8A5FD4", fields:[
    {id:mkId(),label:"Grand Launch Event",type:"textarea",ph:"Date: April 20, 2025\nVenue: Pearl Continental\nAttendance: 800+"},
    {id:mkId(),label:"Government & Institutional Events",type:"textarea",ph:"Housing Ministry briefing, NAPHDA roadshow"},
    {id:mkId(),label:"Corporate Outreach Events",type:"textarea",ph:"20 companies roadshow Month 2–3"},
    {id:mkId(),label:"Dealer & Channel Meets",type:"textarea",ph:"Monthly: Lahore, Islamabad, Karachi, Gujrat"},
    {id:mkId(),label:"Investor / HNI Sessions",type:"textarea",ph:"Quarterly private briefings, site visits VIP protocol"},
    {id:mkId(),label:"Overseas / Diaspora Events",type:"textarea",ph:"Dubai Expo May 2025\nLondon NRP June 2025"},
    {id:mkId(),label:"On-Ground Activations",type:"textarea",ph:"Mall activations: Packages Mall, Emporium"},
    {id:mkId(),label:"Digital Events & Virtual Tours",type:"textarea",ph:"360° virtual tour\nMonthly Facebook/YouTube Live"},
  ]},
  {id:"marketing", label:"Marketing Plan", icon:"◬", color:"#D44A6A", fields:[
    {id:mkId(),label:"Brand Positioning",type:"textarea",ph:"'Where Legacy Meets Living' — smart city, investment-grade..."},
    {id:mkId(),label:"Awareness Phase (Top of Funnel)",type:"textarea",ph:"Facebook/Instagram, YouTube, OOH M-2 corridor\nKPIs: 1M reach"},
    {id:mkId(),label:"Lead Generation (Mid Funnel)",type:"textarea",ph:"Meta lead ads, Google Search, Zameen/Graana\nTarget: 8,000 leads/month CPL PKR 1,500"},
    {id:mkId(),label:"Conversion Strategy (Bottom Funnel)",type:"textarea",ph:"3-touch: WhatsApp + call + site visit\nTarget: 10–12% conversion"},
    {id:mkId(),label:"Digital Marketing Channels",type:"textarea",ph:"Meta retargeting, Google Ads, TikTok, LinkedIn B2B"},
    {id:mkId(),label:"Traditional & OOH Marketing",type:"textarea",ph:"Billboards GT Road + M-2, Dawn/Jang ads, Radio FM 101/91"},
    {id:mkId(),label:"Overseas / Diaspora Marketing",type:"textarea",ph:"Bilingual campaigns, NRP WhatsApp UAE/UK/Saudi"},
    {id:mkId(),label:"Content & PR Strategy",type:"textarea",ph:"Monthly construction blog, buyer stories, ROI reports"},
    {id:mkId(),label:"Retention & Referral",type:"textarea",ph:"PKR 50K referral bonus, monthly buyer newsletter"},
    {id:mkId(),label:"Marketing KPIs",type:"textarea",ph:"Reach: 1M/month\nLeads: 8,000\nCPL: PKR 1,500\nConversion: 10–12%"},
  ]},
];

const DEFAULT_VERT_FIELDS = () => [
  {id:mkId(),label:"Objective",type:"text",ph:"Primary goal for this vertical..."},
  {id:mkId(),label:"Target Segment",type:"textarea",ph:"Buyer/client profile, demographics..."},
  {id:mkId(),label:"Revenue Target",type:"text",ph:"e.g. PKR 600M"},
  {id:mkId(),label:"Timeline",type:"text",ph:"e.g. Month 1–6"},
  {id:mkId(),label:"Value Proposition",type:"textarea",ph:"Why ARD City for this vertical..."},
  {id:mkId(),label:"Sales Approach",type:"textarea",ph:"How this vertical is activated..."},
  {id:mkId(),label:"Pricing & Payment",type:"textarea",ph:"Special payment plans, bulk pricing..."},
  {id:mkId(),label:"Lead Generation",type:"textarea",ph:"How leads are sourced..."},
  {id:mkId(),label:"Stakeholders",type:"textarea",ph:"Decision makers / approvers..."},
  {id:mkId(),label:"Partnerships / MOUs",type:"textarea",ph:"Formal agreements required..."},
  {id:mkId(),label:"Incentives & Commission",type:"textarea",ph:"Commission tiers, bonuses..."},
  {id:mkId(),label:"KPIs & Success Metrics",type:"textarea",ph:"How success is measured..."},
  {id:mkId(),label:"Risks & Mitigation",type:"textarea",ph:"Key risks and responses..."},
  {id:mkId(),label:"Notes",type:"textarea",ph:"Additional context..."},
];

const DEFAULT_KPI_CATS = () => [
  {id:mkId(), label:"Revenue KPIs", icon:"💰", color:"#B8912A", kpis:[
    {id:mkId(),label:"Monthly Revenue",unit:"PKR",target:"400M",freq:"Monthly",vertical:"all",role:"VP Sales"},
    {id:mkId(),label:"Quarterly Revenue",unit:"PKR",target:"1.2B",freq:"Quarterly",vertical:"all",role:"VP Sales"},
    {id:mkId(),label:"B2G Vertical Revenue",unit:"PKR",target:"50M/mo",freq:"Monthly",vertical:"b2g",role:"B2G Manager"},
    {id:mkId(),label:"B2C Vertical Revenue",unit:"PKR",target:"150M/mo",freq:"Monthly",vertical:"b2c",role:"B2C Team Lead"},
    {id:mkId(),label:"Channel Partner Revenue",unit:"PKR",target:"116M/mo",freq:"Monthly",vertical:"channel",role:"Dealer Manager"},
    {id:mkId(),label:"NRP/Diaspora Revenue",unit:"PKR",target:"42M/mo",freq:"Monthly",vertical:"diaspora",role:"NRP Manager"},
  ]},
  {id:mkId(), label:"Pipeline KPIs", icon:"🔄", color:"#2A80D0", kpis:[
    {id:mkId(),label:"Leads Generated",unit:"leads",target:"8,000",freq:"Monthly",vertical:"all",role:"CRM Lead"},
    {id:mkId(),label:"Cost Per Lead (CPL)",unit:"PKR",target:"≤1,500",freq:"Monthly",vertical:"all",role:"Marketing Mgr"},
    {id:mkId(),label:"Site Visits",unit:"visits",target:"400",freq:"Monthly",vertical:"b2c",role:"B2C Team Lead"},
    {id:mkId(),label:"Lead-to-Sale Conversion",unit:"%",target:"10–12",freq:"Monthly",vertical:"all",role:"VP Sales"},
    {id:mkId(),label:"Lead Follow-up Rate (24hr)",unit:"%",target:"95",freq:"Weekly",vertical:"all",role:"CRM Lead"},
  ]},
  {id:mkId(), label:"Activity KPIs", icon:"⚡", color:"#3DA863", kpis:[
    {id:mkId(),label:"Outbound Calls / Day",unit:"calls",target:"50",freq:"Daily",vertical:"b2c",role:"B2C Executive"},
    {id:mkId(),label:"Corporate Presentations/Month",unit:"pres.",target:"20",freq:"Monthly",vertical:"b2b",role:"Corp Sales Mgr"},
    {id:mkId(),label:"Govt Meetings / Month",unit:"meetings",target:"8",freq:"Monthly",vertical:"b2g",role:"B2G Manager"},
    {id:mkId(),label:"New Dealers Onboarded",unit:"dealers",target:"25/mo",freq:"Monthly",vertical:"channel",role:"Dealer Manager"},
    {id:mkId(),label:"MOUs Signed",unit:"MOUs",target:"1/mo",freq:"Monthly",vertical:"all",role:"VP Sales"},
  ]},
  {id:mkId(), label:"Quality KPIs", icon:"✅", color:"#8A5FD4", kpis:[
    {id:mkId(),label:"Buyer Satisfaction Score",unit:"/10",target:"8.5+",freq:"Monthly",vertical:"all",role:"VP Sales"},
    {id:mkId(),label:"Active Dealer Rate",unit:"%",target:"75",freq:"Monthly",vertical:"channel",role:"Dealer Manager"},
    {id:mkId(),label:"Booking Cancellation Rate",unit:"%",target:"≤5",freq:"Monthly",vertical:"all",role:"VP Sales"},
    {id:mkId(),label:"CRM Data Completeness",unit:"%",target:"90",freq:"Weekly",vertical:"all",role:"CRM Lead"},
  ]},
];

const DEFAULT_ROLES = () => [
  {id:mkId(),title:"VP Sales & Revenue",vertical:"all",band:"C-Suite / VP",color:"#B8912A",
   summary:"Lead ARD City's entire sales revenue operation across all 5 verticals.",
   responsibilities:["Own and deliver PKR 4.8B sales target","Build the full sales organization","Develop and execute the Master Sales Plan","Establish institutional partnerships","Provide weekly performance reports"],
   requirements:["15+ years Pakistan real estate, 5+ years VP level","Track record PKR 1B+ annual revenue","Deep network LDA, NAPHDA, housing authorities","MBA preferred"],
   kpis:["Monthly Revenue","Lead-to-Sale Conversion","MOUs Signed","Buyer Satisfaction Score"],
   goals:[]},
  {id:mkId(),title:"B2G Sales Manager",vertical:"b2g",band:"Manager",color:"#1A6BB5",
   summary:"Own ARD City's government and institutional sales vertical. Secure PKR 600M in B2G allotments.",
   responsibilities:["Develop and execute B2G sales strategy","Build Ministry/NAPHDA relationships","Prepare formal housing proposals","Conduct 8+ govt presentations/month"],
   requirements:["10+ years, 5+ in govt sales","Existing NAPHDA/ministry relationships","Strong proposal writing skills","Master's preferred"],
   kpis:["B2G Vertical Revenue","Govt Meetings / Month","MOUs Signed"],
   goals:[]},
  {id:mkId(),title:"B2C Sales Executive",vertical:"b2c",band:"Executive",color:"#2E8B57",
   summary:"Direct retail sales of ARD City residential plots, villas, and apartments to individual buyers.",
   responsibilities:["Follow up all leads within 1 hour","50+ outbound calls daily","Schedule and conduct site visits","Process booking documentation"],
   requirements:["2–5 years real estate sales","Strong persuasion skills","BBA/B.Com graduate"],
   kpis:["Outbound Calls / Day","Site Visits","Lead-to-Sale Conversion"],
   goals:[]},
  {id:mkId(),title:"Channel & Dealer Manager",vertical:"channel",band:"Manager",color:"#7B4FA6",
   summary:"Build and manage ARD City's national dealer network — 250 active agents across 10 cities.",
   responsibilities:["Launch AREC dealer program","Onboard 250 dealers across 10 cities","Monthly dealer meets in 5+ cities","Manage commission and incentive trips"],
   requirements:["8+ years real estate channel management","Network of 100+ registered agents","Dealer incentive program experience"],
   kpis:["New Dealers Onboarded","Active Dealer Rate","Channel Partner Revenue"],
   goals:[]},
  {id:mkId(),title:"NRP / Overseas Sales Manager",vertical:"diaspora",band:"Manager",color:"#1A8A8A",
   summary:"Own ARD City's NRP sales channel across UAE, UK, Saudi Arabia and Gulf.",
   responsibilities:["Manage WhatsApp NRP broadcasts UAE/UK/Saudi","Represent at property expos","Host bi-weekly NRP webinars","Coordinate Roshan Digital Account"],
   requirements:["8+ years overseas Pakistani market","Fluent Urdu/English","Ability to travel internationally"],
   kpis:["NRP/Diaspora Revenue","Leads Generated"],
   goals:[]},
  {id:mkId(),title:"Marketing Manager",vertical:"all",band:"Manager",color:"#D44A6A",
   summary:"Lead all ARD City marketing campaigns. Own 8,000 leads/month at CPL ≤ PKR 1,500.",
   responsibilities:["Manage Meta, Google, YouTube, TikTok ads","Own CPL target PKR 1,500","Oversee creative production and PR","Plan and execute launch event"],
   requirements:["8+ years marketing, 3+ Pakistan real estate","PKR 20M+ digital ad budget experience"],
   kpis:["Leads Generated","Cost Per Lead (CPL)"],
   goals:[]},
];

const MODULES = [
  {id:"salesplan",label:"Sales Plan",icon:"📋",color:C.goldL},
  {id:"kpis",label:"KPIs",icon:"📊",color:C.blueL},
  {id:"smartgoals",label:"SMART Goals",icon:"🎯",color:C.greenL},
  {id:"jds",label:"Job Descriptions",icon:"👤",color:C.purple},
  {id:"export",label:"Export",icon:"⬇️",color:C.goldL},
];

// ── BUTTON ────────────────────────────────────────────────────────────
function Btn({children,onClick,variant="ghost",color=C.gold,disabled,style={}}) {
  const [h,setH]=useState(false);
  const base={padding:"5px 10px",border:"none",borderRadius:"4px",cursor:disabled?"not-allowed":"pointer",
    fontSize:"10px",fontFamily:"monospace",fontWeight:"600",transition:"all 0.12s",opacity:disabled?0.45:1,...style};
  const vs={
    gold:{background:h?C.goldL:C.gold,color:C.navy,border:"none"},
    outline:{background:h?`${color}18`:"transparent",color,border:`1px solid ${color}`},
    ghost:{background:h?`${C.muted}15`:"transparent",color:C.muted,border:`1px solid ${C.border}`},
    danger:{background:h?"#C44030":"transparent",color:h?C.white:C.redL,border:`1px solid #C4403050`},
    green:{background:h?C.greenL:"transparent",color:h?C.navy:C.greenL,border:`1px solid ${C.greenL}50`},
  };
  return <button style={{...base,...(vs[variant]||vs.ghost)}} onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}</button>;
}

// ── EDITABLE TEXT ─────────────────────────────────────────────────────
function ET({value,onChange,ph="",multi=false,style={},ac=C.goldL}) {
  const [f,setF]=useState(false);
  const base={width:"100%",boxSizing:"border-box",background:C.bg,
    border:`1px solid ${f?ac:C.border}`,borderRadius:"4px",color:C.text,fontSize:"12px",
    padding:"7px 10px",outline:"none",fontFamily:"Georgia,serif",transition:"border-color 0.12s",
    boxShadow:f?`0 0 0 2px ${ac}18`:"none",...style};
  return multi
    ?<textarea value={value} placeholder={ph} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{...base,minHeight:"70px",resize:"vertical"}}/>
    :<input type="text" value={value} placeholder={ph} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={base}/>;
}

// ── TAG LIST ──────────────────────────────────────────────────────────
function TagList({items,onAdd,onRemove,ph="Add...",color=C.gold}) {
  const [d,setD]=useState("");
  const go=()=>{const t=d.trim();if(t){onAdd(t);setD("");}};
  return(
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"5px"}}>
        {items.map((it,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:"3px",fontSize:"10px",color,
            background:`${color}14`,border:`1px solid ${color}40`,padding:"2px 7px",borderRadius:"12px",fontFamily:"monospace"}}>
            {it}
            <span onClick={()=>onRemove(i)} style={{cursor:"pointer",color:C.redL,fontSize:"12px",lineHeight:1}}>×</span>
          </span>
        ))}
        {items.length===0&&<span style={{fontSize:"10px",color:C.muted,fontStyle:"italic"}}>None yet</span>}
      </div>
      <div style={{display:"flex",gap:"5px"}}>
        <input value={d} onChange={e=>setD(e.target.value)} placeholder={ph}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();go();}}}
          style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,color:C.text,
            fontSize:"11px",padding:"5px 9px",borderRadius:"4px",outline:"none",fontFamily:"Georgia,serif"}}/>
        <Btn onClick={go} variant="green">+</Btn>
      </div>
    </div>
  );
}

// ── FIELD EDITOR ──────────────────────────────────────────────────────
function FieldEditor({field,value,onChangeValue,onChangeField,onDelete,ac=C.goldL}) {
  const [el,setEl]=useState(false);
  const [ld,setLd]=useState(field.label);
  const [tm,setTm]=useState(false);
  const commit=()=>{onChangeField("label",ld.trim()||field.label);setEl(false);};
  return(
    <div style={{marginBottom:"13px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"}}>
        <div style={{flex:1}}>
          {el
            ?<input autoFocus value={ld} onChange={e=>setLd(e.target.value)}
                onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();}}
                style={{fontSize:"10px",fontWeight:"700",letterSpacing:"0.07em",color:C.text,textTransform:"uppercase",
                  fontFamily:"monospace",background:C.card2,border:`1px solid ${ac}`,borderRadius:"3px",
                  padding:"2px 7px",outline:"none"}}/>
            :<label onClick={()=>setEl(true)} title="Click to rename"
                style={{fontSize:"10px",fontWeight:"700",letterSpacing:"0.07em",color:C.muted,
                  textTransform:"uppercase",fontFamily:"monospace",cursor:"text",userSelect:"none"}}>
                {field.label} <span style={{color:C.border,fontSize:"9px"}}>✎</span>
              </label>
          }
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setTm(p=>!p)}
            style={{fontSize:"9px",color:C.dim,background:C.card2,border:`1px solid ${C.border}`,
              borderRadius:"3px",padding:"2px 7px",cursor:"pointer",fontFamily:"monospace"}}>
            {field.type==="textarea"?"¶":"—"} ▾
          </button>
          {tm&&(
            <div style={{position:"absolute",right:0,top:"100%",background:C.card,border:`1px solid ${C.border}`,
              borderRadius:"4px",zIndex:50,marginTop:"2px",overflow:"hidden",minWidth:"110px"}}>
              {["text","textarea"].map(t=>(
                <div key={t} onClick={()=>{onChangeField("type",t);setTm(false);}}
                  style={{padding:"6px 12px",cursor:"pointer",fontSize:"10px",fontFamily:"monospace",
                    color:field.type===t?ac:C.dim,background:field.type===t?`${ac}12`:"transparent"}}>
                  {t==="text"?"— Single line":"¶ Multi-line"}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={onDelete} title="Remove field"
          style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",
            fontSize:"14px",padding:"0 4px",lineHeight:1}}>×</button>
      </div>
      <ET value={value||""} onChange={v=>onChangeValue(field.id,v)}
        ph={field.ph||""} multi={field.type==="textarea"} ac={ac}/>
    </div>
  );
}

// ── KPI ROW ───────────────────────────────────────────────────────────
function KPIRow({kpi,actual,onUpdate,onUpdateKPI,onDelete,verticals}) {
  const [ed,setEd]=useState(false);
  const [ea,setEa]=useState(false);
  const [av,setAv]=useState(actual||"");
  const vc=verticals.find(v=>v.id===kpi.vertical)||{color:C.gold};
  if(ed) return(
    <div style={{background:C.card2,border:`1px solid ${vc.color}40`,borderRadius:"5px",padding:"12px",marginBottom:"8px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"8px"}}>
        {["label","target","unit","freq","role"].map(k=>(
          <div key={k}>
            <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"2px"}}>{k}</div>
            <input value={kpi[k]||""} onChange={e=>onUpdateKPI(k,e.target.value)}
              style={{width:"100%",boxSizing:"border-box",background:C.bg,border:`1px solid ${C.border}`,color:C.text,
                fontSize:"11px",padding:"4px 7px",borderRadius:"3px",outline:"none",fontFamily:"Georgia,serif"}}/>
          </div>
        ))}
        <div>
          <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"2px"}}>vertical</div>
          <select value={kpi.vertical} onChange={e=>onUpdateKPI("vertical",e.target.value)}
            style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:"11px",padding:"4px 7px",borderRadius:"3px",outline:"none"}}>
            <option value="all">All Verticals</option>
            {verticals.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"flex",gap:"6px"}}>
        <Btn onClick={()=>setEd(false)} variant="green">✓ Done</Btn>
        <Btn onClick={onDelete} variant="danger">× Remove KPI</Btn>
      </div>
    </div>
  );
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"5px",padding:"9px 12px",
      marginBottom:"6px",borderLeft:`3px solid ${vc.color}`,display:"flex",alignItems:"center",gap:"9px"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:"11.5px",color:C.text,fontWeight:"600",marginBottom:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kpi.label}</div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          <span style={{fontSize:"8px",color:vc.color,fontFamily:"monospace"}}>{kpi.vertical==="all"?"ALL":kpi.vertical.toUpperCase()}</span>
          <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace"}}>{kpi.freq}</span>
          {kpi.role&&<span style={{fontSize:"8px",color:C.dim,fontFamily:"monospace"}}>→ {kpi.role}</span>}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",marginBottom:"1px"}}>TARGET</div>
        <div style={{fontSize:"13px",color:C.goldL,fontFamily:"monospace",fontWeight:"bold"}}>{kpi.target}</div>
        <div style={{fontSize:"8px",color:C.muted}}>{kpi.unit}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",marginBottom:"1px"}}>ACTUAL</div>
        {ea
          ?<input autoFocus value={av} onChange={e=>setAv(e.target.value)}
              onBlur={()=>{onUpdate(av);setEa(false);}}
              onKeyDown={e=>{if(e.key==="Enter"){onUpdate(av);setEa(false);}}}
              style={{width:"60px",background:C.surface,border:`1px solid ${C.goldL}`,color:C.text,
                fontSize:"12px",padding:"2px 5px",borderRadius:"3px",textAlign:"right",fontFamily:"monospace",outline:"none"}}/>
          :<div onClick={()=>setEa(true)} style={{cursor:"pointer",fontSize:"12px",
              color:actual?C.greenL:C.muted,fontFamily:"monospace",fontWeight:"bold",
              padding:"1px 5px",borderRadius:"3px",border:`1px solid ${actual?"#3DA86330":C.border}`,minWidth:"40px",textAlign:"right"}}>
              {actual||"—"}
            </div>
        }
      </div>
      <button onClick={()=>setEd(true)} style={{background:"transparent",border:`1px solid ${C.border}`,
        color:C.dim,cursor:"pointer",fontSize:"10px",padding:"3px 6px",borderRadius:"3px",fontFamily:"monospace",flexShrink:0}}>✎</button>
    </div>
  );
}

// ── GOAL EDITOR ───────────────────────────────────────────────────────
function GoalEditor({goal,status,note,onUpdateGoal,onUpdateStatus,onUpdateNote,onDelete}) {
  const [open,setOpen]=useState(false);
  const [en,setEn]=useState(note||"");
  const SC={pending:C.muted,in_progress:C.blueL,achieved:C.greenL,at_risk:C.redL};
  const SL={pending:"Pending",in_progress:"In Progress",achieved:"Achieved ✓",at_risk:"At Risk ⚠"};
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"6px",marginBottom:"7px",overflow:"hidden"}}>
      <div style={{padding:"9px 12px",display:"flex",alignItems:"flex-start",gap:"8px"}}>
        <div style={{flexShrink:0,width:"7px",height:"7px",borderRadius:"50%",background:SC[status||"pending"],marginTop:"5px"}}/>
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>setOpen(p=>!p)}>
          <div style={{fontSize:"11px",color:C.text,lineHeight:"1.5",marginBottom:"3px"}}>{goal.goal||<em style={{color:C.muted}}>Click to write goal text...</em>}</div>
          <div style={{display:"flex",gap:"5px"}}>
            <span style={{fontSize:"8px",color:C.gold,fontFamily:"monospace",background:C.goldF,padding:"1px 6px",borderRadius:"3px"}}>{goal.category||"General"}</span>
            <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace"}}>⏱ {goal.timeframe||"TBD"}</span>
          </div>
        </div>
        <select value={status||"pending"} onChange={e=>onUpdateStatus(e.target.value)}
          onClick={e=>e.stopPropagation()}
          style={{background:C.surface,border:`1px solid ${SC[status||"pending"]}40`,color:SC[status||"pending"],
            fontSize:"9px",padding:"3px 5px",borderRadius:"3px",cursor:"pointer",fontFamily:"monospace",outline:"none",flexShrink:0}}>
          {Object.entries(SL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={onDelete} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:"13px",padding:"0 2px",flexShrink:0}}>×</button>
      </div>
      {open&&(
        <div style={{padding:"0 12px 12px",borderTop:`1px solid ${C.border}`}}>
          <div style={{marginTop:"10px",marginBottom:"7px"}}>
            <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"3px"}}>Goal Text</div>
            <ET value={goal.goal||""} onChange={v=>onUpdateGoal("goal",v)} ph="Write the SMART goal..." multi ac={C.greenL}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"7px"}}>
            <div>
              <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"2px"}}>Category</div>
              <ET value={goal.category||""} onChange={v=>onUpdateGoal("category",v)} ph="e.g. Revenue" ac={C.greenL}/>
            </div>
            <div>
              <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"2px"}}>Timeframe</div>
              <ET value={goal.timeframe||""} onChange={v=>onUpdateGoal("timeframe",v)} ph="e.g. 12 months" ac={C.greenL}/>
            </div>
          </div>
          <div style={{marginBottom:"7px"}}>
            <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"4px"}}>Linked KPIs</div>
            <TagList items={goal.linked_kpis||[]} color={C.blueL}
              onAdd={t=>onUpdateGoal("linked_kpis",[...(goal.linked_kpis||[]),t])}
              onRemove={i=>onUpdateGoal("linked_kpis",(goal.linked_kpis||[]).filter((_,x)=>x!==i))}
              ph="Add KPI name..."/>
          </div>
          <div>
            <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"3px"}}>Progress Notes</div>
            <ET value={en} onChange={v=>{setEn(v);onUpdateNote(v);}} ph="Progress notes..." multi ac={C.greenL}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ── JD ROLE EDITOR ────────────────────────────────────────────────────
function JDRoleEditor({role,isOpen,onToggle,onUpdate,onDelete,verticals}) {
  return(
    <div style={{background:isOpen?`${role.color}10`:C.card,border:`1px solid ${isOpen?role.color:C.border}`,
      borderRadius:"6px",marginBottom:"7px",overflow:"hidden",transition:"all 0.15s"}}>
      <div style={{padding:"11px 13px",display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"}} onClick={onToggle}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"12px",color:C.text,fontWeight:"600",marginBottom:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{role.title}</div>
          <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
            <span style={{fontSize:"8px",color:role.color,fontFamily:"monospace",background:`${role.color}18`,padding:"1px 6px",borderRadius:"3px"}}>{role.band}</span>
            <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace"}}>{role.vertical==="all"?"All Verticals":role.vertical}</span>
          </div>
        </div>
        <span style={{fontSize:"9px",color:isOpen?role.color:C.muted,fontFamily:"monospace",flexShrink:0}}>{isOpen?"▼":"▶"}</span>
        <button onClick={e=>{e.stopPropagation();onDelete();}}
          style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:"13px",padding:"0 2px",flexShrink:0}}>×</button>
      </div>
      {isOpen&&(
        <div style={{padding:"0 13px 14px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"7px",marginTop:"10px",marginBottom:"10px"}}>
            <div>
              <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"2px"}}>Title</div>
              <ET value={role.title} onChange={v=>onUpdate("title",v)} ac={role.color}/>
            </div>
            <div>
              <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"2px"}}>Band</div>
              <ET value={role.band} onChange={v=>onUpdate("band",v)} ac={role.color}/>
            </div>
            <div>
              <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"2px"}}>Vertical</div>
              <select value={role.vertical} onChange={e=>onUpdate("vertical",e.target.value)}
                style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:"11px",padding:"5px 7px",borderRadius:"4px",outline:"none"}}>
                <option value="all">All Verticals</option>
                {verticals.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
            <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase"}}>Accent Color</span>
            <input type="color" value={role.color} onChange={e=>onUpdate("color",e.target.value)}
              style={{width:"30px",height:"22px",border:"none",borderRadius:"3px",cursor:"pointer"}}/>
            <span style={{fontSize:"9px",color:C.muted,fontFamily:"monospace"}}>{role.color}</span>
          </div>
          <div style={{marginBottom:"9px"}}>
            <div style={{fontSize:"8px",color:role.color,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:"3px"}}>Summary</div>
            <ET value={role.summary||""} onChange={v=>onUpdate("summary",v)} ph="Role summary..." multi ac={role.color}/>
          </div>
          <div style={{marginBottom:"9px"}}>
            <div style={{fontSize:"8px",color:role.color,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:"5px"}}>Responsibilities</div>
            <TagList items={role.responsibilities||[]} color={role.color}
              onAdd={t=>onUpdate("responsibilities",[...(role.responsibilities||[]),t])}
              onRemove={i=>onUpdate("responsibilities",(role.responsibilities||[]).filter((_,x)=>x!==i))}
              ph="Add responsibility..."/>
          </div>
          <div style={{marginBottom:"9px"}}>
            <div style={{fontSize:"8px",color:role.color,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:"5px"}}>Requirements</div>
            <TagList items={role.requirements||[]} color={C.dim}
              onAdd={t=>onUpdate("requirements",[...(role.requirements||[]),t])}
              onRemove={i=>onUpdate("requirements",(role.requirements||[]).filter((_,x)=>x!==i))}
              ph="Add requirement..."/>
          </div>
          <div>
            <div style={{fontSize:"8px",color:C.blueL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:"5px"}}>Linked KPIs</div>
            <TagList items={role.kpis||[]} color={C.blueL}
              onAdd={t=>onUpdate("kpis",[...(role.kpis||[]),t])}
              onRemove={i=>onUpdate("kpis",(role.kpis||[]).filter((_,x)=>x!==i))}
              ph="Add KPI name..."/>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════
export default function ARDCityDynamic() {
  const [module,setModule]=useState("salesplan");
  const [sections,setSections]=useState(DEFAULT_SECTIONS);
  const [verticals,setVerticals]=useState(DEFAULT_VERTICALS);
  const [vertFields,setVertFields]=useState(DEFAULT_VERT_FIELDS);
  const [formData,setFormData]=useState({});
  const [spSection,setSpSection]=useState("meta");
  const [completedSections,setCompletedSections]=useState(new Set());
  const [kpiCats,setKpiCats]=useState(DEFAULT_KPI_CATS);
  const [kpiActuals,setKpiActuals]=useState({});
  const [roles,setRoles]=useState(DEFAULT_ROLES);
  const [activeRoleId,setActiveRoleId]=useState(null);
  const [goalStatus,setGoalStatus]=useState({});
  const [goalNotes,setGoalNotes]=useState({});
  const [openJD,setOpenJD]=useState(null);
  const [jdFilter,setJdFilter]=useState("all");
  const [aiLog,setAiLog]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [generating,setGenerating]=useState(null);
  const [toast,setToast]=useState("");
  const [search,setSearch]=useState("");

  useEffect(()=>{if(roles.length&&!activeRoleId)setActiveRoleId(roles[0].id);},[roles]);

  const showToast=useCallback(msg=>{setToast(msg);setTimeout(()=>setToast(""),3500);},[]);

  // ── SECTION OPS ───────────────────────────────────────────────────
  const addSection=()=>{const id=mkId();setSections(p=>[...p,{id,label:"New Section",icon:"◆",color:C.muted,fields:[{id:mkId(),label:"Field 1",type:"textarea",ph:"Enter details..."}]}]);setSpSection(id);};
  const updSec=(id,k,v)=>setSections(p=>p.map(s=>s.id===id?{...s,[k]:v}:s));
  const delSec=(id)=>{setSections(p=>p.filter(s=>s.id!==id));setSpSection(sections.find(s=>s.id!==id)?.id||verticals[0]?.id||"");};
  const addField=(sid)=>setSections(p=>p.map(s=>s.id===sid?{...s,fields:[...s.fields,{id:mkId(),label:"New Field",type:"textarea",ph:"Enter details..."}]}:s));
  const updField=(sid,fid,k,v)=>setSections(p=>p.map(s=>s.id===sid?{...s,fields:s.fields.map(f=>f.id===fid?{...f,[k]:v}:f)}:s));
  const delField=(sid,fid)=>setSections(p=>p.map(s=>s.id===sid?{...s,fields:s.fields.filter(f=>f.id!==fid)}:s));

  // ── VERTICAL OPS ──────────────────────────────────────────────────
  const addVert=()=>{const id=mkId(),ci=verticals.length%VERT_PALETTE.length;setVerticals(p=>[...p,{id,label:"New",fullName:"New Vertical",color:VERT_PALETTE[ci],icon:VERT_ICONS[ci],tagline:"Describe..."}]);setSpSection(id);};
  const updVert=(id,k,v)=>setVerticals(p=>p.map(vt=>vt.id===id?{...vt,[k]:v}:vt));
  const delVert=(id)=>{setVerticals(p=>p.filter(vt=>vt.id!==id));if(spSection===id)setSpSection(sections[0]?.id||"");};
  const addVF=()=>setVertFields(p=>[...p,{id:mkId(),label:"New Field",type:"textarea",ph:"Enter details..."}]);
  const updVF=(fid,k,v)=>setVertFields(p=>p.map(f=>f.id===fid?{...f,[k]:v}:f));
  const delVF=(fid)=>setVertFields(p=>p.filter(f=>f.id!==fid));

  const setField=useCallback((sec,fid,val)=>{setFormData(p=>({...p,[sec]:{...(p[sec]||{}),[fid]:val}}));},[]);

  // ── KPI OPS ───────────────────────────────────────────────────────
  const addKpiCat=()=>setKpiCats(p=>[...p,{id:mkId(),label:"New Category",icon:"📌",color:C.muted,kpis:[]}]);
  const updKpiCat=(cid,k,v)=>setKpiCats(p=>p.map(c=>c.id===cid?{...c,[k]:v}:c));
  const delKpiCat=(cid)=>setKpiCats(p=>p.filter(c=>c.id!==cid));
  const addKpi=(cid)=>setKpiCats(p=>p.map(c=>c.id===cid?{...c,kpis:[...c.kpis,{id:mkId(),label:"New KPI",unit:"",target:"—",freq:"Monthly",vertical:"all",role:""}]}:c));
  const updKpi=(cid,kid,k,v)=>setKpiCats(p=>p.map(c=>c.id===cid?{...c,kpis:c.kpis.map(k2=>k2.id===kid?{...k2,[k]:v}:k2)}:c));
  const delKpi=(cid,kid)=>setKpiCats(p=>p.map(c=>c.id===cid?{...c,kpis:c.kpis.filter(k=>k.id!==kid)}:c));

  // ── ROLE/GOAL OPS ─────────────────────────────────────────────────
  const addRole=()=>{const r={id:mkId(),title:"New Role",vertical:"all",band:"Manager",color:C.muted,summary:"",responsibilities:[],requirements:[],kpis:[],goals:[]};setRoles(p=>[...p,r]);setActiveRoleId(r.id);};
  const updRole=(rid,k,v)=>setRoles(p=>p.map(r=>r.id===rid?{...r,[k]:v}:r));
  const delRole=(rid)=>{setRoles(p=>p.filter(r=>r.id!==rid));const next=roles.find(r=>r.id!==rid);setActiveRoleId(next?.id||null);};
  const addGoal=(rid)=>setRoles(p=>p.map(r=>r.id===rid?{...r,goals:[...r.goals,{id:mkId(),goal:"",category:"General",timeframe:"12 months",linked_kpis:[]}]}:r));
  const updGoal=(rid,gid,k,v)=>setRoles(p=>p.map(r=>r.id===rid?{...r,goals:r.goals.map(g=>g.id===gid?{...g,[k]:v}:g)}:r));
  const delGoal=(rid,gid)=>setRoles(p=>p.map(r=>r.id===rid?{...r,goals:r.goals.filter(g=>g.id!==gid)}:r));

  // ── JD OPS (uses same roles array) ───────────────────────────────
  const updJD=updRole; const delJD=delRole;
  const addJDRole=()=>{const r={id:mkId(),title:"New Role",vertical:"all",band:"Manager",color:C.muted,summary:"",responsibilities:[],requirements:[],kpis:[],goals:[]};setRoles(p=>[...p,r]);setOpenJD(r.id);};

  // ── AI ────────────────────────────────────────────────────────────
  const handleAI=async()=>{
    setAiLoading(true);setAiLog("");
    let t="ARD CITY SALES PLAN\n\n";
    sections.forEach(s=>{t+=`== ${s.label.toUpperCase()} ==\n`;s.fields.forEach(f=>{const v=formData[s.id]?.[f.id];if(v?.trim())t+=`${f.label}: ${v}\n`;});t+="\n";});
    verticals.forEach(v=>{t+=`== ${v.label} ==\n`;vertFields.forEach(f=>{const val=formData[v.id]?.[f.id];if(val?.trim())t+=`${f.label}: ${val}\n`;});t+="\n";});
    try{
      const res=await fetch("/api/ai-review",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({content:`Review this ARD City Sales Plan:\n\n${t}`})});
      const d=await res.json();setAiLog(d.content?.map(b=>b.text).join("")||d.error||"No response.");
    }catch(e){setAiLog("Error: "+e.message);}
    setAiLoading(false);
  };

  // ── EXPORT ────────────────────────────────────────────────────────
  const handleGenerate=async(type)=>{
    setGenerating(type);
    try{
      const res=await fetch(`/api/ard-generate?type=${type}`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({formData,sections,verticals,vertFields,kpiCats,roles,goalStatus,goalNotes})});
      if(res.ok){const b=await res.blob();const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`ARD_City_${Date.now()}.${type}`;a.click();showToast(`✓ ${type.toUpperCase()} downloaded`);}
      else showToast(`Plan compiled — backend needed for ${type.toUpperCase()}`);
    }catch{showToast(`Plan compiled — connect backend for export`);}
    setGenerating(null);
  };

  // ── COMPUTED ──────────────────────────────────────────────────────
  const allSections=[
    ...sections.map(s=>({...s,kind:"core"})),
    ...verticals.map(v=>({id:v.id,label:v.label,icon:v.icon,color:v.color,kind:"vert",vertData:v,fields:vertFields})),
  ];
  const activeSec=allSections.find(s=>s.id===spSection)||allSections[0];
  const navIdx=allSections.findIndex(s=>s.id===spSection);
  const prevSec=navIdx>0?allSections[navIdx-1]:null;
  const nextSec=navIdx<allSections.length-1?allSections[navIdx+1]:null;
  const activeColor=activeSec?.color||C.goldL;

  const globalPct=(()=>{
    let f=0,t=0;
    sections.forEach(s=>{s.fields.forEach(fi=>{t++;if(formData[s.id]?.[fi.id]?.trim?.())f++;});});
    verticals.forEach(v=>{vertFields.forEach(fi=>{t++;if(formData[v.id]?.[fi.id]?.trim?.())f++;});});
    return t?Math.round(f/t*100):0;
  })();

  const activeRole=roles.find(r=>r.id===activeRoleId);
  const filteredJDs=jdFilter==="all"?roles:roles.filter(r=>r.vertical===jdFilter||r.vertical==="all");
  const searchResults=search.trim()?allSections.filter(s=>s.label.toLowerCase().includes(search.toLowerCase())||(s.fields||[]).some(f=>f.label.toLowerCase().includes(search.toLowerCase()))):[];

  // ════════════════════════════════════════════════════════════════
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* TOP BAR */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
        <img
          src="/Logo.png"
          alt="ARD City logo"
          style={{height:"38px",width:"38px",objectFit:"contain",borderRadius:"4px",border:`1px solid ${C.border}`,padding:"3px",background:C.card}}
        />
        <div style={{flexShrink:0}}>
          <div style={{fontSize:"8px",color:C.gold,fontFamily:"monospace",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:"1px"}}>ARD CITY · SALES INTELLIGENCE COMMAND</div>
          <div style={{fontSize:"14px"}}>Sales Plan <span style={{color:C.gold}}>·</span> KPIs <span style={{color:C.gold}}>·</span> Goals <span style={{color:C.gold}}>·</span> JDs <span style={{fontSize:"9px",color:C.muted,marginLeft:"4px"}}>— fully editable</span></div>
        </div>
        <div style={{flex:1,position:"relative",maxWidth:"210px"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sections..."
            style={{width:"100%",boxSizing:"border-box",background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:"10px",padding:"5px 9px 5px 23px",borderRadius:"4px",outline:"none",fontFamily:"monospace"}}/>
          <span style={{position:"absolute",left:"7px",top:"6px",color:C.muted,fontSize:"10px"}}>⌕</span>
          {search&&searchResults.length>0&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.card,border:`1px solid ${C.border}`,borderRadius:"4px",zIndex:100,boxShadow:"0 6px 18px #00000070",marginTop:"2px"}}>
              {searchResults.slice(0,5).map(s=>(
                <div key={s.id} onClick={()=>{setModule("salesplan");setSpSection(s.id);setSearch("");}}
                  style={{padding:"6px 10px",cursor:"pointer",fontSize:"10px",color:C.dim,borderBottom:`1px solid ${C.border}`,display:"flex",gap:"6px",alignItems:"center"}}>
                  <span style={{color:s.color}}>{s.icon}</span><span>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"7px",marginLeft:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
            <div style={{width:"70px",height:"2px",background:C.border,borderRadius:"2px"}}>
              <div style={{width:`${globalPct}%`,height:"100%",background:`linear-gradient(90deg,${C.gold},${C.goldL})`,borderRadius:"2px",transition:"width 0.4s"}}/>
            </div>
            <span style={{fontSize:"10px",color:C.gold,fontFamily:"monospace"}}>{globalPct}%</span>
          </div>
          <Btn onClick={handleAI} disabled={aiLoading} variant="outline" color={C.gold}>{aiLoading?"⟳":"✦"} AI</Btn>
          <Btn onClick={()=>handleGenerate("docx")} disabled={!!generating} variant="gold">{generating==="docx"?"⟳":"⬇"} DOCX</Btn>
          <Btn onClick={()=>handleGenerate("pdf")} disabled={!!generating} variant="outline" color={C.goldL}>{generating==="pdf"?"⟳":"⬇"} PDF</Btn>
        </div>
      </div>

      {/* MODULE NAV */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",padding:"0 16px",flexShrink:0}}>
        {MODULES.map(m=>(
          <button key={m.id} onClick={()=>setModule(m.id)}
            style={{padding:"7px 13px",background:"transparent",border:"none",borderBottom:`2px solid ${module===m.id?m.color:"transparent"}`,
              color:module===m.id?C.text:C.muted,fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",
              fontWeight:module===m.id?"600":"normal",fontFamily:"Georgia,serif",marginRight:"2px",whiteSpace:"nowrap"}}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ══ SALES PLAN ══════════════════════════════════════════ */}
        {module==="salesplan"&&(
          <>
            {/* SIDEBAR */}
            <div style={{width:"182px",background:C.surface,borderRight:`1px solid ${C.border}`,overflowY:"auto",flexShrink:0,paddingBottom:"14px"}}>
              <div style={{padding:"9px 11px 3px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.09em"}}>Sections</span>
                <button onClick={addSection} title="Add section" style={{background:"transparent",border:`1px solid ${C.border}`,color:C.greenL,cursor:"pointer",fontSize:"10px",padding:"1px 5px",borderRadius:"3px"}}>+</button>
              </div>
              {sections.map(s=>{
                const f=s.fields.filter(fi=>formData[s.id]?.[fi.id]?.trim?.()).length;
                const pct=s.fields.length?Math.round(f/s.fields.length*100):0;
                const ia=spSection===s.id,id2=completedSections.has(s.id);
                return(
                  <div key={s.id} onClick={()=>setSpSection(s.id)}
                    style={{padding:"6px 11px",cursor:"pointer",borderLeft:ia?`3px solid ${s.color}`:"3px solid transparent",
                      background:ia?`${s.color}10`:"transparent",display:"flex",alignItems:"center",gap:"6px",marginBottom:"1px"}}>
                    <span style={{fontSize:"10px",color:ia?s.color:C.muted,flexShrink:0}}>{s.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"10px",color:ia?C.text:C.dim,fontWeight:ia?"600":"normal",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</div>
                      <div style={{height:"1.5px",background:C.border,borderRadius:"1px",marginTop:"2px"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:s.color,borderRadius:"1px",transition:"width 0.3s"}}/>
                      </div>
                    </div>
                    {id2&&<span style={{color:C.greenL,fontSize:"9px",flexShrink:0}}>✓</span>}
                  </div>
                );
              })}
              <div style={{padding:"9px 11px 3px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"8px",borderTop:`1px solid ${C.border}`}}>
                <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.09em"}}>Verticals</span>
                <button onClick={addVert} title="Add vertical" style={{background:"transparent",border:`1px solid ${C.border}`,color:C.greenL,cursor:"pointer",fontSize:"10px",padding:"1px 5px",borderRadius:"3px"}}>+</button>
              </div>
              {verticals.map(v=>{
                const pct=vertFields.length?Math.round(vertFields.filter(f=>formData[v.id]?.[f.id]?.trim?.()).length/vertFields.length*100):0;
                const ia=spSection===v.id;
                return(
                  <div key={v.id} onClick={()=>setSpSection(v.id)}
                    style={{padding:"6px 11px",cursor:"pointer",borderLeft:ia?`3px solid ${v.color}`:"3px solid transparent",
                      background:ia?`${v.color}10`:"transparent",marginBottom:"1px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <span style={{fontSize:"10px",flexShrink:0}}>{v.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:"10px",color:ia?C.text:C.dim,fontWeight:ia?"600":"normal",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.label}</div>
                        <div style={{fontSize:"8px",color:pct>0?v.color:C.muted,fontFamily:"monospace"}}>{pct>0?`${pct}%`:v.tagline.slice(0,16)+"…"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MAIN CONTENT */}
            <div style={{flex:1,overflowY:"auto",padding:"18px 22px",minWidth:0}}>
              {activeSec?.kind==="vert"?(
                <>
                  <div style={{padding:"11px 14px",borderRadius:"6px",marginBottom:"14px",
                    background:`${activeSec.color}10`,border:`1px solid ${activeSec.color}40`,
                    display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"10px",flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:"200px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"7px"}}>
                        <select value={activeSec.vertData.icon} onChange={e=>updVert(activeSec.id,"icon",e.target.value)}
                          style={{background:C.card2,border:`1px solid ${C.border}`,color:C.text,fontSize:"14px",padding:"2px 5px",borderRadius:"3px",outline:"none"}}>
                          {VERT_ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}
                        </select>
                        <ET value={activeSec.vertData.fullName} onChange={v=>updVert(activeSec.id,"fullName",v)} ac={activeSec.color}
                          style={{fontSize:"14px",color:C.text,fontWeight:"600",background:"transparent",border:"none",borderBottom:`1px solid ${activeSec.color}50`,borderRadius:0,padding:"2px 4px"}}/>
                      </div>
                      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center"}}>
                        <ET value={activeSec.vertData.label} onChange={v=>updVert(activeSec.id,"label",v)} ph="Short label" ac={activeSec.color}
                          style={{fontSize:"9px",fontFamily:"monospace",color:activeSec.color,background:`${activeSec.color}14`,borderColor:`${activeSec.color}40`,padding:"2px 7px",borderRadius:"3px",width:"80px"}}/>
                        <ET value={activeSec.vertData.tagline} onChange={v=>updVert(activeSec.id,"tagline",v)} ph="Tagline" ac={activeSec.color}
                          style={{fontSize:"9px",fontFamily:"monospace",color:C.muted,background:"transparent",borderColor:C.border,padding:"2px 7px",borderRadius:"3px",flex:1,minWidth:"100px"}}/>
                        <input type="color" value={activeSec.vertData.color} onChange={e=>updVert(activeSec.id,"color",e.target.value)} style={{width:"26px",height:"20px",border:"none",borderRadius:"3px",cursor:"pointer"}}/>
                      </div>
                    </div>
                    <Btn onClick={()=>delVert(activeSec.id)} variant="danger">× Remove</Btn>
                  </div>
                  {vertFields.map(f=>(
                    <FieldEditor key={f.id} field={f}
                      value={formData[activeSec.id]?.[f.id]}
                      onChangeValue={(fid,val)=>setField(activeSec.id,fid,val)}
                      onChangeField={(k,v)=>updVF(f.id,k,v)}
                      onDelete={()=>delVF(f.id)}
                      ac={activeSec.color}/>
                  ))}
                  <div style={{display:"flex",gap:"7px",marginTop:"10px",paddingTop:"10px",borderTop:`1px solid ${C.border}`}}>
                    <Btn onClick={addVF} variant="green">+ Add Shared Vertical Field</Btn>
                    <span style={{fontSize:"9px",color:C.muted,fontFamily:"monospace",alignSelf:"center"}}>Applies to all verticals</span>
                  </div>
                </>
              ):(
                <>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px",gap:"10px",flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"7px",flex:1}}>
                      <select value={activeSec?.icon||"◈"} onChange={e=>updSec(spSection,"icon",e.target.value)}
                        style={{background:C.card2,border:`1px solid ${C.border}`,color:activeColor,fontSize:"14px",padding:"3px 5px",borderRadius:"4px",outline:"none"}}>
                        {["◈","◷","₿","◉","◬","①","②","③","⬡","★","♦","▲"].map(ic=><option key={ic} value={ic}>{ic}</option>)}
                      </select>
                      <ET value={activeSec?.label||""} onChange={v=>updSec(spSection,"label",v)} ac={activeColor}
                        style={{fontSize:"15px",fontWeight:"normal",color:C.text,background:"transparent",border:"none",borderBottom:`1px solid ${activeColor}50`,borderRadius:0,padding:"2px 4px"}}/>
                      <input type="color" value={activeColor} onChange={e=>updSec(spSection,"color",e.target.value)} style={{width:"26px",height:"20px",border:"none",borderRadius:"3px",cursor:"pointer"}}/>
                    </div>
                    <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                      <Btn onClick={()=>{setCompletedSections(p=>new Set([...p,spSection]));if(nextSec)setSpSection(nextSec.id);}} variant="outline" color={activeColor}>Save & Next →</Btn>
                      <Btn onClick={()=>delSec(spSection)} variant="danger">× Section</Btn>
                    </div>
                  </div>
                  {(activeSec?.fields||[]).map(f=>(
                    <FieldEditor key={f.id} field={f}
                      value={formData[spSection]?.[f.id]}
                      onChangeValue={(fid,val)=>setField(spSection,fid,val)}
                      onChangeField={(k,v)=>updField(spSection,f.id,k,v)}
                      onDelete={()=>delField(spSection,f.id)}
                      ac={activeColor}/>
                  ))}
                  <div style={{marginTop:"10px",paddingTop:"10px",borderTop:`1px solid ${C.border}`}}>
                    <Btn onClick={()=>addField(spSection)} variant="green">+ Add Field</Btn>
                  </div>
                </>
              )}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:"16px",paddingTop:"12px",borderTop:`1px solid ${C.border}`}}>
                {prevSec?<Btn onClick={()=>setSpSection(prevSec.id)}>← {prevSec.label}</Btn>:<div/>}
                {nextSec?<Btn onClick={()=>{setCompletedSections(p=>new Set([...p,spSection]));setSpSection(nextSec.id);}} variant="outline" color={activeColor}>{nextSec.label} →</Btn>:<div/>}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{width:"210px",background:C.surface,borderLeft:`1px solid ${C.border}`,overflowY:"auto",padding:"12px 11px",flexShrink:0}}>
              {aiLog?(
                <div>
                  <div style={{fontSize:"8px",color:C.gold,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"7px"}}>✦ AI Brief</div>
                  <div style={{fontSize:"10px",color:C.text,lineHeight:"1.75",whiteSpace:"pre-wrap"}}>{aiLog}</div>
                  <Btn onClick={()=>setAiLog("")} style={{marginTop:"9px"}}>Clear</Btn>
                </div>
              ):(
                <div>
                  <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"9px"}}>Plan Status</div>
                  {sections.map(s=>{
                    const pct=s.fields.length?Math.round(s.fields.filter(f=>formData[s.id]?.[f.id]?.trim?.()).length/s.fields.length*100):0;
                    return(
                      <div key={s.id} style={{marginBottom:"6px",cursor:"pointer"}} onClick={()=>setSpSection(s.id)}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",marginBottom:"1px"}}>
                          <span style={{color:pct>0?C.text:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"125px"}}>{s.icon} {s.label}</span>
                          <span style={{color:s.color,fontFamily:"monospace",flexShrink:0}}>{pct}%</span>
                        </div>
                        <div style={{height:"2px",background:C.border,borderRadius:"1px"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:s.color,borderRadius:"1px",transition:"width 0.3s"}}/>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{marginTop:"9px",paddingTop:"8px",borderTop:`1px solid ${C.border}`}}>
                    <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",marginBottom:"6px"}}>Verticals</div>
                    {verticals.map(v=>{
                      const pct=vertFields.length?Math.round(vertFields.filter(f=>formData[v.id]?.[f.id]?.trim?.()).length/vertFields.length*100):0;
                      return(
                        <div key={v.id} style={{marginBottom:"5px",cursor:"pointer"}} onClick={()=>setSpSection(v.id)}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",marginBottom:"1px"}}>
                            <span style={{color:pct>0?C.text:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"125px"}}>{v.icon} {v.label}</span>
                            <span style={{color:v.color,fontFamily:"monospace",flexShrink:0}}>{pct}%</span>
                          </div>
                          <div style={{height:"2px",background:C.border,borderRadius:"1px"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:v.color,borderRadius:"1px",transition:"width 0.3s"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{marginTop:"9px",paddingTop:"7px",borderTop:`1px solid ${C.border}`}}>
                    <Btn onClick={()=>handleGenerate("docx")} disabled={!!generating} variant="gold" style={{width:"100%",marginBottom:"5px"}}>{generating==="docx"?"⟳":"⬇"} WORD</Btn>
                    <Btn onClick={()=>handleGenerate("pdf")} disabled={!!generating} variant="outline" color={C.goldL} style={{width:"100%"}}>{generating==="pdf"?"⟳":"⬇"} PDF</Btn>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ KPI DASHBOARD ══════════════════════════════════════ */}
        {module==="kpis"&&(
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
              <span style={{fontSize:"9px",color:C.blueL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>📊 KPI Dashboard — ✎ edit · × remove · + add</span>
              <Btn onClick={addKpiCat} variant="green">+ Add Category</Btn>
            </div>
            {kpiCats.map(cat=>(
              <div key={cat.id} style={{marginBottom:"18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"8px",paddingBottom:"5px",borderBottom:`1px solid ${C.border}`}}>
                  <select value={cat.icon} onChange={e=>updKpiCat(cat.id,"icon",e.target.value)}
                    style={{background:C.card2,border:`1px solid ${C.border}`,color:C.text,fontSize:"13px",padding:"2px 4px",borderRadius:"3px",outline:"none"}}>
                    {["💰","🔄","⚡","✅","📌","🎯","📈","🏆","⚙"].map(ic=><option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <ET value={cat.label} onChange={v=>updKpiCat(cat.id,"label",v)} ac={cat.color}
                    style={{fontSize:"10px",fontWeight:"700",fontFamily:"monospace",color:C.text,background:"transparent",borderColor:"transparent",borderBottom:`1px solid ${cat.color}60`,borderRadius:0,padding:"2px 3px",width:"160px"}}/>
                  <input type="color" value={cat.color} onChange={e=>updKpiCat(cat.id,"color",e.target.value)} style={{width:"24px",height:"18px",border:"none",borderRadius:"3px",cursor:"pointer"}}/>
                  <div style={{flex:1}}/>
                  <Btn onClick={()=>addKpi(cat.id)} variant="green" style={{fontSize:"9px"}}>+ KPI</Btn>
                  <Btn onClick={()=>delKpiCat(cat.id)} variant="danger" style={{fontSize:"9px"}}>× Cat</Btn>
                </div>
                {cat.kpis.map(kpi=>(
                  <KPIRow key={kpi.id} kpi={kpi}
                    actual={kpiActuals[kpi.id]}
                    onUpdate={v=>setKpiActuals(p=>({...p,[kpi.id]:v}))}
                    onUpdateKPI={(k,v)=>updKpi(cat.id,kpi.id,k,v)}
                    onDelete={()=>delKpi(cat.id,kpi.id)}
                    verticals={verticals}/>
                ))}
                {cat.kpis.length===0&&<div style={{padding:"10px 14px",color:C.muted,fontSize:"11px",fontStyle:"italic",border:`1px dashed ${C.border}`,borderRadius:"5px",textAlign:"center"}}>No KPIs — click + KPI to add</div>}
              </div>
            ))}
          </div>
        )}

        {/* ══ SMART GOALS ════════════════════════════════════════ */}
        {module==="smartgoals"&&(
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            <div style={{width:"178px",background:C.surface,borderRight:`1px solid ${C.border}`,overflowY:"auto",flexShrink:0,padding:"9px 0"}}>
              <div style={{padding:"7px 11px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Roles</span>
                <button onClick={addRole} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.greenL,cursor:"pointer",fontSize:"10px",padding:"1px 5px",borderRadius:"3px"}}>+</button>
              </div>
              {roles.map(role=>{
                const ac=role.goals.filter((_,i)=>goalStatus[`${role.id}_${i}`]==="achieved").length;
                const ip=role.goals.filter((_,i)=>goalStatus[`${role.id}_${i}`]==="in_progress").length;
                const ar=role.goals.filter((_,i)=>goalStatus[`${role.id}_${i}`]==="at_risk").length;
                const isA=activeRoleId===role.id;
                return(
                  <div key={role.id} onClick={()=>setActiveRoleId(role.id)}
                    style={{padding:"7px 11px",cursor:"pointer",borderLeft:isA?`3px solid ${role.color}`:"3px solid transparent",
                      background:isA?`${role.color}10`:"transparent",marginBottom:"1px"}}>
                    <div style={{fontSize:"10px",color:isA?C.text:C.dim,marginBottom:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{role.title}</div>
                    <div style={{display:"flex",gap:"4px"}}>
                      <span style={{fontSize:"8px",color:C.greenL,fontFamily:"monospace"}}>{ac}✓</span>
                      {ip>0&&<span style={{fontSize:"8px",color:C.blueL,fontFamily:"monospace"}}>{ip}▶</span>}
                      {ar>0&&<span style={{fontSize:"8px",color:C.redL,fontFamily:"monospace"}}>{ar}⚠</span>}
                      <span style={{fontSize:"8px",color:C.muted,fontFamily:"monospace"}}>/{role.goals.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
              {activeRole?(
                <>
                  <div style={{padding:"11px 13px",borderRadius:"6px",marginBottom:"12px",
                    background:`${activeRole.color}10`,border:`1px solid ${activeRole.color}40`,
                    display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"9px",flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:"180px"}}>
                      <ET value={activeRole.title} onChange={v=>updRole(activeRole.id,"title",v)} ac={activeRole.color}
                        style={{fontSize:"13px",color:C.text,fontWeight:"600",background:"transparent",border:"none",borderBottom:`1px solid ${activeRole.color}50`,borderRadius:0,padding:"2px 4px",marginBottom:"5px"}}/>
                      <div style={{display:"flex",gap:"6px",alignItems:"center",flexWrap:"wrap"}}>
                        <ET value={activeRole.band||""} onChange={v=>updRole(activeRole.id,"band",v)} ph="Band" ac={activeRole.color}
                          style={{fontSize:"9px",fontFamily:"monospace",color:activeRole.color,background:`${activeRole.color}14`,border:`1px solid ${activeRole.color}40`,padding:"2px 7px",borderRadius:"3px",width:"100px"}}/>
                        <select value={activeRole.vertical} onChange={e=>updRole(activeRole.id,"vertical",e.target.value)}
                          style={{background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:"9px",padding:"2px 6px",borderRadius:"3px",outline:"none",fontFamily:"monospace"}}>
                          <option value="all">All Verticals</option>
                          {verticals.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
                        </select>
                        <input type="color" value={activeRole.color} onChange={e=>updRole(activeRole.id,"color",e.target.value)} style={{width:"24px",height:"18px",border:"none",borderRadius:"3px",cursor:"pointer"}}/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                      <Btn onClick={()=>addGoal(activeRole.id)} variant="green">+ Goal</Btn>
                      <Btn onClick={()=>delRole(activeRole.id)} variant="danger">× Role</Btn>
                    </div>
                  </div>
                  <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>🎯 SMART Goals — click to expand &amp; edit</div>
                  {activeRole.goals.map((goal,i)=>(
                    <GoalEditor key={goal.id} goal={goal}
                      status={goalStatus[`${activeRole.id}_${i}`]}
                      note={goalNotes[`${activeRole.id}_${i}`]}
                      onUpdateGoal={(k,v)=>updGoal(activeRole.id,goal.id,k,v)}
                      onUpdateStatus={v=>setGoalStatus(p=>({...p,[`${activeRole.id}_${i}`]:v}))}
                      onUpdateNote={v=>setGoalNotes(p=>({...p,[`${activeRole.id}_${i}`]:v}))}
                      onDelete={()=>delGoal(activeRole.id,goal.id)}/>
                  ))}
                  {activeRole.goals.length===0&&<div style={{padding:"18px",color:C.muted,fontSize:"11px",fontStyle:"italic",textAlign:"center",border:`1px dashed ${C.border}`,borderRadius:"5px"}}>No goals yet — click + Goal to add</div>}
                </>
              ):(
                <div style={{padding:"28px",color:C.muted,fontSize:"11px",textAlign:"center"}}>Select a role or click + to add one.</div>
              )}
            </div>
          </div>
        )}

        {/* ══ JOB DESCRIPTIONS ═══════════════════════════════════ */}
        {module==="jds"&&(
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            <div style={{width:"164px",background:C.surface,borderRight:`1px solid ${C.border}`,overflowY:"auto",flexShrink:0,padding:"9px 0"}}>
              <div style={{padding:"7px 11px 4px",fontSize:"8px",color:C.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Filter</div>
              {[{id:"all",label:"All Roles",icon:"◈",color:C.goldL},...verticals.map(v=>({id:v.id,label:v.label,icon:v.icon,color:v.color}))].map(f=>(
                <div key={f.id} onClick={()=>setJdFilter(f.id)}
                  style={{padding:"6px 11px",cursor:"pointer",fontSize:"10px",borderLeft:jdFilter===f.id?`3px solid ${f.color}`:"3px solid transparent",
                    background:jdFilter===f.id?`${f.color}10`:"transparent",color:jdFilter===f.id?C.text:C.dim}}>
                  {f.icon} {f.label}
                </div>
              ))}
              <div style={{margin:"9px 11px",paddingTop:"8px",borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:"8px",color:C.muted,fontFamily:"monospace",marginBottom:"3px"}}>TOTAL JDs</div>
                <div style={{fontSize:"18px",color:C.goldL,fontFamily:"monospace",fontWeight:"bold"}}>{roles.length}</div>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
                <span style={{fontSize:"9px",color:C.purple,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>👤 {filteredJDs.length} JDs — click to expand &amp; edit all fields</span>
                <Btn onClick={addJDRole} variant="green">+ Add Role</Btn>
              </div>
              {filteredJDs.map(role=>(
                <JDRoleEditor key={role.id} role={role}
                  isOpen={openJD===role.id}
                  onToggle={()=>setOpenJD(openJD===role.id?null:role.id)}
                  onUpdate={(k,v)=>updJD(role.id,k,v)}
                  onDelete={()=>delJD(role.id)}
                  verticals={verticals}/>
              ))}
            </div>
          </div>
        )}

        {/* ══ EXPORT ═════════════════════════════════════════════ */}
        {module==="export"&&(
          <div style={{flex:1,overflowY:"auto",padding:"24px 30px"}}>
            <div style={{maxWidth:"520px"}}>
              <div style={{fontSize:"9px",color:C.goldL,fontFamily:"monospace",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"18px"}}>⬇ Export — Fully Dynamic Package</div>
              {[{type:"docx",icon:"📄",title:"Word Document (.docx)",v:"gold"},{type:"pdf",icon:"📑",title:"PDF Document",v:"outline"}].map(item=>(
                <div key={item.type} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"16px",marginBottom:"10px"}}>
                  <div style={{fontSize:"14px",color:C.text,marginBottom:"4px"}}>{item.icon} {item.title}</div>
                  <div style={{fontSize:"10px",color:C.dim,lineHeight:"1.6",marginBottom:"11px"}}>
                    {sections.length} sections + {verticals.length} verticals + {kpiCats.reduce((a,c)=>a+c.kpis.length,0)} KPIs + {roles.reduce((a,r)=>a+r.goals.length,0)} goals + {roles.length} JDs
                  </div>
                  <Btn onClick={()=>handleGenerate(item.type)} disabled={!!generating} variant={item.v} color={C.goldL}>
                    {generating===item.type?"⟳ Generating...":` ⬇ Download ${item.type.toUpperCase()}`}
                  </Btn>
                </div>
              ))}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"14px"}}>
                <div style={{fontSize:"8px",color:C.goldL,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>What's exported</div>
                {["All sections and fields exactly as configured","Custom verticals with colors and all field data","All KPI categories with targets and live actuals","SMART goals per role with linked KPIs, status, notes","All job descriptions — title, band, summary, responsibilities, requirements, KPIs","AI-generated executive summary","ARD City branded headers and footers"].map((it,i)=>(
                  <div key={i} style={{display:"flex",gap:"6px",marginBottom:"4px"}}>
                    <span style={{color:C.greenL,flexShrink:0,fontSize:"9px"}}>✓</span>
                    <span style={{fontSize:"10px",color:C.dim}}>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast&&<div style={{position:"fixed",bottom:"16px",right:"16px",background:C.bg,border:`1px solid ${C.greenL}`,color:C.greenL,padding:"8px 14px",borderRadius:"5px",fontSize:"10px",fontFamily:"monospace",zIndex:9999,boxShadow:"0 4px 20px #00000070"}}>{toast}</div>}
    </div>
  );
}
