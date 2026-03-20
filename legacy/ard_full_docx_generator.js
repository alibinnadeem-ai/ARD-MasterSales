const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  Header, Footer,
} = require("docx");
const fs = require("fs");

let raw = "";
process.stdin.on("data", d => raw += d);
process.stdin.on("end", () => {
  try { generate(JSON.parse(raw)); }
  catch(e) { process.stderr.write("Error: " + e.message); process.exit(1); }
});

// ── PALETTE ─────────────────────────────────────────────────────
const GOLD  = "B8912A"; const NAVY  = "0D1F3C"; const STEEL = "2C5282";
const SLATE = "4A5568"; const DKGRAY= "2D2D2D";

const VERT = {
  b2g:     { hex:"1A4A7A", label:"B2G",             name:"Business to Government" },
  b2c:     { hex:"2E6B45", label:"B2C",             name:"Business to Consumer" },
  b2b:     { hex:"6B2E2E", label:"B2B Corporate",   name:"Business to Business Corporate" },
  channel: { hex:"4A3070", label:"Channel Partners","name":"Dealer & Channel Network" },
  diaspora:{ hex:"1A5A5A", label:"Overseas/Diaspora","name":"Overseas Pakistani & Diaspora" },
};

const ROLE_COLORS = {
  vp_sales:"B8912A", b2g_mgr:"1A4A7A", b2c_exec:"2E6B45", b2c_team_lead:"2E6B45",
  corp_sales_mgr:"6B2E2E", dealer_mgr:"4A3070", dealer_coord:"4A3070",
  nrp_mgr:"1A5A5A", crm_lead:"B8912A", mkt_mgr:"7A1E2E",
};

// ── HELPERS ─────────────────────────────────────────────────────
const sp = (b=0,a=0) => ({ spacing: { before:b, after:a } });
const border = (c="CCCCCC") => ({ style:BorderStyle.SINGLE, size:1, color:c });
const borders = (c="CCCCCC") => ({ top:border(c), bottom:border(c), left:border(c), right:border(c) });

function goldRule() {
  return new Paragraph({ ...sp(160,80), border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:GOLD, space:4 }}, children:[] });
}
function thinRule() {
  return new Paragraph({ ...sp(80,80), border:{ bottom:{ style:BorderStyle.SINGLE, size:1, color:"CCCCCC", space:2 }}, children:[] });
}
function pageBreak() { return new Paragraph({ pageBreakBefore:true, children:[] }); }

function H1(text, color=NAVY) {
  return new Paragraph({ heading:HeadingLevel.HEADING_1, ...sp(400,160),
    children:[new TextRun({ text, bold:true, size:32, color, font:"Garamond" })] });
}
function H2(text, color=STEEL) {
  return new Paragraph({ heading:HeadingLevel.HEADING_2, ...sp(240,100),
    children:[new TextRun({ text, bold:true, size:24, color, font:"Garamond" })] });
}
function H3(text, color=SLATE) {
  return new Paragraph({ ...sp(180,60),
    children:[new TextRun({ text:text.toUpperCase(), bold:true, size:17, color, font:"Arial", characterSpacing:40 })] });
}
function bodyPara(text, indent=0) {
  if(!text?.trim()) return [];
  return text.trim().split("\n").filter(l=>l.trim()).map(line =>
    new Paragraph({ ...sp(40,50), indent: indent ? {left:indent} : undefined,
      children:[new TextRun({ text:line.trim(), size:21, font:"Garamond", color:DKGRAY })] })
  );
}
function labelBlock(label, value, color=STEEL) {
  if(!value?.trim()) return [];
  return [
    new Paragraph({ ...sp(160,50),
      children:[
        new TextRun({ text:"▸  ", size:19, color, font:"Arial" }),
        new TextRun({ text:label, bold:true, size:20, color, font:"Arial" }),
      ] }),
    ...bodyPara(value, 320),
  ];
}
function infoTable(rows, colW=[2800,6200]) {
  const filtered = rows.filter(r=>r[1]?.trim?.());
  if(!filtered.length) return [];
  const b = borders("DDDDDD");
  return [new Table({
    width:{ size:9000, type:WidthType.DXA }, columnWidths:colW,
    rows: filtered.map(([ lbl, val ], i) => new TableRow({ children:[
      new TableCell({ borders:b, width:{size:colW[0],type:WidthType.DXA},
        shading:{ fill: i%2===0?"EEF2F8":"F5F7FB", type:ShadingType.CLEAR },
        margins:{top:80,bottom:80,left:140,right:100},
        children:[new Paragraph({ children:[new TextRun({ text:lbl, bold:true, size:19, font:"Arial", color:STEEL })] })] }),
      new TableCell({ borders:b, width:{size:colW[1],type:WidthType.DXA},
        margins:{top:80,bottom:80,left:140,right:100},
        children:[new Paragraph({ children:[new TextRun({ text:val||"—", size:20, font:"Garamond", color:DKGRAY })] })] }),
    ]})),
  }), new Paragraph({ ...sp(120,0) })];
}

function kpiTable(kpis, color=NAVY) {
  const hdrs = ["KPI","Target","Unit","Frequency","Vertical"];
  const b = borders("DDDDDD");
  const hdrRow = new TableRow({ children: hdrs.map((h,i) =>
    new TableCell({ borders:b, shading:{fill:color,type:ShadingType.CLEAR},
      width:{size:[2800,1400,1000,1400,1400][i], type:WidthType.DXA},
      margins:{top:80,bottom:80,left:100,right:80},
      children:[new Paragraph({ children:[new TextRun({ text:h, bold:true, size:18, color:"FFFFFF", font:"Arial" })] })] })
  )});
  const dataRows = kpis.map((k,ri) => new TableRow({ children:[
    [k.label, k.target, k.unit, k.freq, k.vertical==="all"?"All":k.vertical.toUpperCase()]
    .map((v,i) => new TableCell({ borders:b,
      width:{size:[2800,1400,1000,1400,1400][i],type:WidthType.DXA},
      shading:{fill:ri%2===0?"FAFAFA":"F0F4F8",type:ShadingType.CLEAR},
      margins:{top:70,bottom:70,left:100,right:80},
      children:[new Paragraph({ children:[new TextRun({ text:v||"—", size:19, font:i===0?"Arial":"Garamond", color:DKGRAY })] })] }))
  ]}));
  return new Table({ width:{size:9000,type:WidthType.DXA}, columnWidths:[2800,1400,1000,1400,1400],
    rows:[hdrRow,...dataRows] });
}

function smartGoalBlock(goal, idx, color=STEEL) {
  const items = [];
  items.push(new Paragraph({ ...sp(160,50),
    children:[
      new TextRun({ text:`Goal ${idx+1}  `, bold:true, size:20, color, font:"Arial" }),
      new TextRun({ text:`[${goal.category}]`, size:18, color:"888888", font:"Arial" }),
    ] }));
  items.push(...bodyPara(goal.goal, 240));
  items.push(new Paragraph({ ...sp(60,20), indent:{left:240},
    children:[new TextRun({ text:`Timeframe: ${goal.timeframe}`, size:18, italics:true, color:SLATE, font:"Arial" })] }));
  if(goal.linked_kpis?.length) {
    items.push(new Paragraph({ ...sp(40,80), indent:{left:240},
      children:[new TextRun({ text:`Linked KPIs: ${goal.linked_kpis.join(" · ")}`, size:17, color:"4A90D9", font:"Arial" })] }));
  }
  return items;
}

function jdBlock(roleId, role, jd, color) {
  const items = [];
  items.push(H2(role.title, "#" + (ROLE_COLORS[roleId]||NAVY)));
  items.push(infoTable([
    ["Band / Level", role.band],
    ["Vertical", role.vertical==="all"?"All Verticals":role.vertical.toUpperCase()],
  ])[0]);
  items.push(new Paragraph({ ...sp(120,60), indent:{left:200},
    border:{ left:{ style:BorderStyle.SINGLE, size:4, color:color, space:8 }},
    children:[new TextRun({ text:jd.summary, size:20, italics:true, color:SLATE, font:"Garamond" })] }));
  
  items.push(H3("Key Responsibilities", "#" + (ROLE_COLORS[roleId]||NAVY)));
  jd.responsibilities.forEach((r,i) => {
    items.push(new Paragraph({ ...sp(40,50), indent:{left:360},
      children:[
        new TextRun({ text:`${i+1}.  `, bold:true, size:19, color, font:"Arial" }),
        new TextRun({ text:r, size:20, font:"Garamond", color:DKGRAY }),
      ] }));
  });

  items.push(H3("Requirements", "#" + (ROLE_COLORS[roleId]||NAVY)));
  jd.requirements.forEach(r => {
    items.push(new Paragraph({ ...sp(40,50), indent:{left:360},
      children:[
        new TextRun({ text:"•  ", size:19, color, font:"Arial" }),
        new TextRun({ text:r, size:20, font:"Garamond", color:DKGRAY }),
      ] }));
  });

  items.push(H3("Linked KPIs & Targets", "#" + (ROLE_COLORS[roleId]||NAVY)));
  items.push(new Paragraph({ ...sp(40,80), indent:{left:360},
    children:[new TextRun({ text:jd.kpis.join("  ·  "), size:19, color:"4A90D9", font:"Arial" })] }));

  return items;
}

// ── MAIN GENERATOR ───────────────────────────────────────────────
async function generate(payload) {
  const fd = payload.formData || {};
  const meta = fd.meta || {};
  const summary = payload.summary || "";
  const kpi_data = payload.kpi_data || {};
  const jd_data = payload.jd_data || {};
  const roles = payload.roles || [];
  const smart_tpl = payload.smart_templates || {};
  const children = [];

  // ─ COVER ─────────────────────────────────────────────────────
  children.push(
    new Paragraph({ ...sp(0,0), shading:{fill:NAVY,type:ShadingType.CLEAR},
      children:[new TextRun({text:"  ",size:8})] }),
    new Paragraph({ ...sp(0,0), shading:{fill:GOLD,type:ShadingType.CLEAR},
      children:[new TextRun({text:"  ",size:16})] }),
    new Paragraph({ ...sp(1000,0), alignment:AlignmentType.CENTER,
      children:[new TextRun({text:"ARD CITY",bold:true,size:72,color:NAVY,font:"Garamond",characterSpacing:200})] }),
    new Paragraph({ ...sp(60,0), alignment:AlignmentType.CENTER,
      children:[new TextRun({text:meta.planTitle||"MASTER SALES PLAN",size:34,color:GOLD,font:"Garamond"})] }),
    new Paragraph({ ...sp(20,0), alignment:AlignmentType.CENTER,
      children:[new TextRun({text:"SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS",
        size:16,color:SLATE,font:"Arial",characterSpacing:100})] }),
    new Paragraph({ ...sp(200,200), alignment:AlignmentType.CENTER,
      border:{top:{style:BorderStyle.SINGLE,size:4,color:GOLD,space:1},bottom:{style:BorderStyle.SINGLE,size:4,color:GOLD,space:1}},
      children:[new TextRun({text:"  CONFIDENTIAL  ·  STRATEGIC DOCUMENT  ",size:17,color:SLATE,font:"Arial"})] }),
  );
  children.push(...infoTable([
    ["Development", meta.development||"ARD City"],
    ["Location", meta.location||""],
    ["Prepared By", meta.preparedBy||""],
    ["Date", meta.date||""],
    ["Plan Period", meta.planPeriod||""],
    ["Total Revenue Target", meta.totalRevenue||""],
    ["Total Inventory", meta.totalInventory||""],
    ["Launch Date", meta.launchDate||""],
    ["Sales Verticals","B2G · B2C · B2B Corporate · Channel Partners · Overseas/Diaspora"],
  ], [2400,6600]));

  // ─ EXECUTIVE SUMMARY ─────────────────────────────────────────
  children.push(pageBreak(), H1("Executive Summary"), goldRule());
  if(summary) { children.push(H3("AI Strategic Brief",GOLD)); children.push(...bodyPara(summary)); children.push(thinRule()); }
  if(meta.executiveSummary) children.push(...labelBlock("Strategic Overview", meta.executiveSummary));
  if(meta.marketContext) children.push(...labelBlock("Pakistan Real Estate Market Context", meta.marketContext));
  if(meta.ardCityPositioning) children.push(...labelBlock("ARD City Market Positioning", meta.ardCityPositioning));
  if(meta.salesObjectives) children.push(...labelBlock("Overall Sales Objectives", meta.salesObjectives));

  // ─ PLAN OVERVIEW ────────────────────────────────────────────
  children.push(pageBreak(), H1("Plan Overview"), goldRule());
  children.push(...infoTable([
    ["Project", meta.development||""],["Location", meta.location||""],
    ["Total Inventory", meta.totalInventory||""],["Revenue Target", meta.totalRevenue||""],
    ["Plan Duration", meta.planPeriod||""],["Launch Date", meta.launchDate||""],
    ["Regulatory", meta.regulatory||"LDA/RERA"],
  ]));
  if(meta.productMix) children.push(...labelBlock("Product Mix",meta.productMix));
  if(meta.pricingOverview) children.push(...labelBlock("Pricing Overview",meta.pricingOverview));
  if(meta.keyDifferentiators) children.push(...labelBlock("Key Differentiators",meta.keyDifferentiators));

  // ─ TIMELINE & BUDGET ────────────────────────────────────────
  const tl = fd.timeline||{}, bud = fd.budget||{}, ev = fd.events||{};
  children.push(pageBreak(), H1("Timeline & Budget"), goldRule());
  ["launchDate","phases","milestones","deliverySchedule","reviewCadence"].forEach(k=>{
    if(tl[k]) children.push(...labelBlock(k.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase()), tl[k]));
  });
  children.push(H2("Budget Allocation","#"+STEEL));
  if(bud.totalBudget) children.push(...labelBlock("Total Budget",bud.totalBudget));
  if(bud.breakdown) children.push(...labelBlock("Breakdown by Vertical",bud.breakdown));
  if(bud.commissions) children.push(...labelBlock("Commission Structure",bud.commissions));

  // ─ 5 VERTICAL PLANS ─────────────────────────────────────────
  Object.entries(VERT).forEach(([vKey, vc]) => {
    const vData = fd[vKey]||{};
    children.push(pageBreak());
    children.push(new Paragraph({ ...sp(0,0), shading:{fill:vc.hex,type:ShadingType.CLEAR},
      children:[new TextRun({text:`  ${vc.label}  ·  ${vc.name}`,bold:true,size:28,color:"FFFFFF",font:"Garamond"})] }));
    children.push(new Paragraph({ ...sp(0,120), shading:{fill:GOLD,type:ShadingType.CLEAR},
      children:[new TextRun({text:"  ARD CITY  ·  SALES VERTICAL PLAN",size:17,color:NAVY,font:"Arial",characterSpacing:80})] }));
    children.push(thinRule());
    children.push(...infoTable([
      ["Vertical", `${vc.label} — ${vc.name}`],
      ["Objective", vData.objective||""],
      ["Target Segment", vData.targetSegment||""],
      ["Revenue Target", vData.revenueTarget||""],
      ["Timeline", vData.timeline||""],
    ]));
    ["valueProp","products","salesApproach","pricing","leadGen","stakeholders","partnerships",
     "incentives","marketing","kpis","risks","notes"].forEach(k => {
      if(vData[k]) children.push(...labelBlock(
        {valueProp:"Value Proposition",products:"Key Products / Offerings",salesApproach:"Sales Approach",
         pricing:"Pricing & Payment",leadGen:"Lead Generation",stakeholders:"Decision Makers",
         partnerships:"Partnership / MOU",incentives:"Incentives & Commission",
         marketing:"Marketing Support",kpis:"KPIs & Targets",risks:"Risks & Mitigation",notes:"Notes"}[k]||k, vData[k], "#"+vc.hex));
    });
  });

  // ─ EVENTS & MARKETING ───────────────────────────────────────
  children.push(pageBreak(), H1("Events & Marketing Plan"), goldRule());
  ["launchEvent","govtEvents","corpEvents","dealerMeets","diasporaEvents","onGround","digital"].forEach(k=>{
    if(ev[k]) children.push(...labelBlock(
      {launchEvent:"Grand Launch Event",govtEvents:"Government Events (B2G)",corpEvents:"Corporate Events (B2B)",
       dealerMeets:"Dealer & Channel Meets",diasporaEvents:"Overseas/Diaspora Events",
       onGround:"On-Ground Activations",digital:"Digital Events"}[k]||k, ev[k]));
  });
  const mkt = fd.marketing||{};
  children.push(H2("Integrated Marketing Plan"));
  ["brand","awareness","leadGen","conversion","digital","traditional","overseas","content","kpis"].forEach(k=>{
    if(mkt[k]) children.push(...labelBlock(
      {brand:"Brand Positioning",awareness:"Awareness Phase",leadGen:"Lead Generation",
       conversion:"Conversion Strategy",digital:"Digital Marketing",traditional:"Traditional & OOH",
       overseas:"Overseas Marketing",content:"Content & PR",kpis:"Marketing KPIs"}[k]||k, mkt[k]));
  });

  // ─── KPI FRAMEWORK ────────────────────────────────────────────
  children.push(pageBreak(), H1("KPI Framework", NAVY), goldRule());
  children.push(...bodyPara("The following Key Performance Indicators are linked to each sales vertical, role, and SMART goal. Actuals should be tracked weekly and reviewed in the monthly sales command meeting."));
  children.push(new Paragraph({...sp(200,0)}));

  const KPI_CATS = {
    revenue:"💰 Revenue KPIs", pipeline:"🔄 Pipeline KPIs",
    activity:"⚡ Activity KPIs", quality:"✅ Quality KPIs",
  };
  Object.entries(kpi_data).forEach(([cat, kpis]) => {
    if(!kpis?.length) return;
    children.push(H2(KPI_CATS[cat]||cat.toUpperCase(), "#"+STEEL));
    children.push(kpiTable(kpis, {revenue:NAVY,pipeline:"2A4E8F",activity:"2E6B45",quality:"6B2E2E"}[cat]||NAVY));
    children.push(new Paragraph({...sp(120,0)}));
  });

  // ─── SMART GOALS ─────────────────────────────────────────────
  children.push(pageBreak(), H1("SMART Goals by Role", NAVY), goldRule());
  children.push(...bodyPara("Each SMART goal is Specific, Measurable, Achievable, Relevant, and Time-bound. Goals are directly linked to the KPI framework above and cascade from the Master Sales Plan targets."));
  
  Object.entries(smart_tpl).forEach(([roleId, goals]) => {
    if(!goals?.length) return;
    const role = roles.find(r=>r.id===roleId);
    if(!role) return;
    const color = ROLE_COLORS[roleId]||NAVY;
    children.push(new Paragraph({ ...sp(280,80),
      children:[
        new TextRun({text:role.title, bold:true, size:24, color:"#"+color, font:"Garamond"}),
        new TextRun({text:`  [${role.band}]`, size:19, color:SLATE, font:"Arial"}),
      ] }));
    children.push(new Paragraph({ ...sp(0,100),
      border:{ bottom:{ style:BorderStyle.SINGLE, size:2, color, space:2}}, children:[] }));
    goals.forEach((g,i) => children.push(...smartGoalBlock(g, i, "#"+color)));
    children.push(thinRule());
  });

  // ─── JOB DESCRIPTIONS ─────────────────────────────────────────
  children.push(pageBreak(), H1("Job Descriptions", NAVY), goldRule());
  children.push(...bodyPara("The following Job Descriptions define each sales role, its responsibilities, requirements, and direct linkage to the KPI framework and SMART goals established in this plan. All roles report within the ARD City Sales Command structure."));

  roles.forEach(role => {
    const jd = jd_data[role.id];
    if(!jd) return;
    const color = ROLE_COLORS[role.id]||NAVY;
    children.push(pageBreak());
    children.push(new Paragraph({ ...sp(0,0), shading:{fill:color,type:ShadingType.CLEAR},
      children:[new TextRun({text:`  ${role.title}  ·  ${role.band}`,bold:true,size:24,color:"FFFFFF",font:"Garamond"})] }));
    children.push(new Paragraph({ ...sp(0,160), shading:{fill:"F0F4F8",type:ShadingType.CLEAR},
      children:[new TextRun({text:`  ARD CITY  ·  JOB DESCRIPTION`,size:16,color:NAVY,font:"Arial",characterSpacing:80})] }));
    children.push(...jdBlock(role.id, role, jd, "#"+color));
  });

  // ─── BUILD DOC ────────────────────────────────────────────────
  const doc = new Document({
    styles:{
      default:{ document:{ run:{ font:"Garamond", size:22 } } },
      paragraphStyles:[
        {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
          run:{size:32,bold:true,font:"Garamond",color:NAVY},
          paragraph:{spacing:{before:400,after:160},outlineLevel:0}},
        {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
          run:{size:24,bold:true,font:"Garamond",color:STEEL},
          paragraph:{spacing:{before:240,after:100},outlineLevel:1}},
      ],
    },
    sections:[{
      properties:{ page:{size:{width:12240,height:15840},margin:{top:1200,right:1200,bottom:1200,left:1200}} },
      headers:{ default: new Header({ children:[
        new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:4,color:GOLD,space:4}},
          children:[
            new TextRun({text:"ARD CITY  ·  ",bold:true,size:17,color:NAVY,font:"Arial",characterSpacing:60}),
            new TextRun({text:meta.planTitle||"Sales Intelligence Plan",size:17,color:SLATE,font:"Arial"}),
            new TextRun({text:"    CONFIDENTIAL",size:15,color:"AAAAAA",font:"Arial"}),
          ] }),
      ]})},
      footers:{ default: new Footer({ children:[
        new Paragraph({ border:{top:{style:BorderStyle.SINGLE,size:2,color:"CCCCCC",space:4}},
          children:[
            new TextRun({text:meta.preparedBy||"ARD City",size:15,color:"888888",font:"Arial"}),
            new TextRun({text:`   ·   ${meta.date||""}   ·   Sales Intelligence Package`,size:15,color:"AAAAAA",font:"Arial"}),
          ] }),
      ]})},
      children: children.filter(Boolean),
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync("/tmp/ard_full.docx", buf);
  process.stdout.write(JSON.stringify({success:true,path:"/tmp/ard_full.docx"}));
}
