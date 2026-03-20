const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  Header, Footer,
} = require("docx");
const fs = require("fs");

let raw = "";
process.stdin.on("data", d => raw += d);
process.stdin.on("end", () => {
  try { gen(JSON.parse(raw)); }
  catch(e) { process.stderr.write("ERR: "+e.message+"\n"+e.stack); process.exit(1); }
});

// ── PALETTE ─────────────────────────────────────────────────────
const GOLD="B8912A", NAVY="0D1F3C", STEEL="2C5282", SLATE="4A5568",
      DK="2D2D2D", LG="EEF2F8", WHITE="FFFFFF", GOLD2="D4A843";

const VERT_HEX = {b2g:"1A4A7A",b2c:"2E6B45",b2b:"6B2E2E",channel:"4A3070",diaspora:"1A5A5A"};
const VERT_NAMES = {
  b2g:["B2G","Business to Government"],
  b2c:["B2C","Business to Consumer"],
  b2b:["B2B Corporate","Business to Business Corporate"],
  channel:["Channel Partners","Dealer & Channel Network"],
  diaspora:["Overseas/Diaspora","Overseas Pakistani & Diaspora"],
};
const KPI_CATS = {
  revenue:{label:"Revenue KPIs",hex:"1A3A6B"},
  pipeline:{label:"Pipeline KPIs",hex:"2A4E8F"},
  activity:{label:"Activity KPIs",hex:"2E6B45"},
  quality:{label:"Quality KPIs",hex:"6B2E2E"},
};

// ── HELPERS ─────────────────────────────────────────────────────
const sp=(b=0,a=0)=>({spacing:{before:b,after:a}});
function bdr(c="CCCCCC"){return{style:BorderStyle.SINGLE,size:1,color:c};}
function bdrs(c="CCCCCC"){return{top:bdr(c),bottom:bdr(c),left:bdr(c),right:bdr(c)};}

function goldRule(){
  return new Paragraph({...sp(160,80),border:{bottom:{style:BorderStyle.SINGLE,size:6,color:GOLD,space:4}},children:[]});
}
function thinRule(){
  return new Paragraph({...sp(80,80),border:{bottom:{style:BorderStyle.SINGLE,size:1,color:"CCCCCC",space:2}},children:[]});
}
function pgBrk(){return new Paragraph({pageBreakBefore:true,children:[]});}

function H1(text,color=NAVY){
  return new Paragraph({heading:HeadingLevel.HEADING_1,...sp(400,160),
    children:[new TextRun({text,bold:true,size:32,color,font:"Garamond"})]});
}
function H2(text,color=STEEL){
  return new Paragraph({heading:HeadingLevel.HEADING_2,...sp(240,100),
    children:[new TextRun({text,bold:true,size:24,color,font:"Garamond"})]});
}
function H3(text,color=SLATE){
  return new Paragraph({...sp(180,60),
    children:[new TextRun({text:text.toUpperCase(),bold:true,size:17,color,font:"Arial",characterSpacing:40})]});
}
function body(text,indent=0){
  if(!text?.trim()) return [];
  return text.trim().split("\n").filter(l=>l.trim()).map(line=>
    new Paragraph({...sp(40,50),indent:indent?{left:indent}:undefined,
      children:[new TextRun({text:line.trim(),size:21,font:"Garamond",color:DK})]})
  );
}
function labelBlock(label,value,color=STEEL){
  if(!value?.trim()) return [];
  return [
    new Paragraph({...sp(160,50),
      children:[
        new TextRun({text:"▸  ",size:19,color,font:"Arial"}),
        new TextRun({text:label,bold:true,size:20,color,font:"Arial"}),
      ]}),
    ...body(value,320),
  ];
}
function infoTable(rows,colW=[2600,6400]){
  const f=rows.filter(r=>r[1]?.trim?.());
  if(!f.length) return [];
  const b=bdrs("DDDDDD");
  return [new Table({
    width:{size:9000,type:WidthType.DXA},columnWidths:colW,
    rows:f.map(([l,v],i)=>new TableRow({children:[
      new TableCell({borders:b,width:{size:colW[0],type:WidthType.DXA},
        shading:{fill:i%2===0?LG:"F5F7FB",type:ShadingType.CLEAR},
        margins:{top:80,bottom:80,left:140,right:80},
        children:[new Paragraph({children:[new TextRun({text:l,bold:true,size:19,font:"Arial",color:STEEL})]})]
      }),
      new TableCell({borders:b,width:{size:colW[1],type:WidthType.DXA},
        margins:{top:80,bottom:80,left:140,right:80},
        children:[new Paragraph({children:[new TextRun({text:v||"—",size:20,font:"Garamond",color:DK})]})]
      }),
    ]})),
  }),new Paragraph({...sp(120,0)})];
}

function kpiTable(kpiRows,hexColor=NAVY){
  if(!kpiRows?.length) return [];
  const b=bdrs("DDDDDD");
  const colW=[2800,1400,900,1300,1600];
  const hdr=new TableRow({children:["KPI","Target","Unit","Frequency","Vertical"].map((h,i)=>
    new TableCell({borders:b,width:{size:colW[i],type:WidthType.DXA},
      shading:{fill:hexColor,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:100,right:80},
      children:[new Paragraph({children:[new TextRun({text:h,bold:true,size:18,color:WHITE,font:"Arial"})]})]
    }))});
  const dataRows=kpiRows.map((k,ri)=>new TableRow({children:
    [k.label||"",k.target||"",k.unit||"",k.freq||"",k.vertical||""].map((v,ci)=>
      new TableCell({borders:b,width:{size:colW[ci],type:WidthType.DXA},
        shading:{fill:ri%2===0?"FAFAFA":LG,type:ShadingType.CLEAR},
        margins:{top:70,bottom:70,left:100,right:80},
        children:[new Paragraph({children:[new TextRun({text:v,size:19,font:ci===0?"Arial":"Garamond",color:DK})]})]
      }))
  }));
  return [new Table({width:{size:9000,type:WidthType.DXA},columnWidths:colW,rows:[hdr,...dataRows]}),
    new Paragraph({...sp(140,0)})];
}

function vertBanner(vKey){
  const [label,name]=VERT_NAMES[vKey], hex=VERT_HEX[vKey];
  return [
    pgBrk(),
    new Paragraph({...sp(0,0),shading:{fill:hex,type:ShadingType.CLEAR},
      children:[new TextRun({text:`  ${label}  ·  ${name}`,bold:true,size:28,color:WHITE,font:"Garamond"})]}),
    new Paragraph({...sp(0,120),shading:{fill:GOLD2,type:ShadingType.CLEAR},
      children:[new TextRun({text:"  ARD CITY  ·  SALES VERTICAL PLAN",size:17,color:NAVY,font:"Arial",characterSpacing:80})]}),
    thinRule(),
  ];
}

function sectionBanner(label,subLabel,hexColor){
  return [
    pgBrk(),
    new Paragraph({...sp(0,0),shading:{fill:hexColor,type:ShadingType.CLEAR},
      children:[new TextRun({text:`  ${label}`,bold:true,size:28,color:WHITE,font:"Garamond"})]}),
    new Paragraph({...sp(0,120),shading:{fill:GOLD2,type:ShadingType.CLEAR},
      children:[new TextRun({text:`  ARD CITY  ·  ${subLabel.toUpperCase()}`,size:17,color:NAVY,font:"Arial",characterSpacing:80})]}),
    thinRule(),
  ];
}

// ── MAIN GENERATOR ───────────────────────────────────────────────
async function gen(payload){
  const fd=payload.formData||{}, ov=fd.overview||{};
  const pr=fd.product_release||{}, tl=fd.timeline||{};
  const bud=fd.budget||{}, ev=fd.events||{}, mkt=fd.marketing||{};
  const kpis=payload.kpis||{}, jdsData=payload.jds||{};
  const roles=payload.roles||[], summary=payload.summary||"";
  const children=[];

  // ── COVER ──────────────────────────────────────────────────────
  children.push(
    new Paragraph({...sp(0,0),shading:{fill:NAVY,type:ShadingType.CLEAR},children:[new TextRun({text:"  ",size:8})]}),
    new Paragraph({...sp(0,0),shading:{fill:GOLD,type:ShadingType.CLEAR},children:[new TextRun({text:"  ",size:16})]}),
    new Paragraph({...sp(900,0),alignment:AlignmentType.CENTER,
      children:[new TextRun({text:"ARD CITY",bold:true,size:72,color:NAVY,font:"Garamond",characterSpacing:200})]}),
    new Paragraph({...sp(60,0),alignment:AlignmentType.CENTER,
      children:[new TextRun({text:ov.planTitle||"MASTER SALES PLAN",size:34,color:GOLD,font:"Garamond"})]}),
    new Paragraph({...sp(16,0),alignment:AlignmentType.CENTER,
      children:[new TextRun({text:"SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS",
        size:15,color:SLATE,font:"Arial",characterSpacing:100})]}),
    new Paragraph({...sp(200,200),alignment:AlignmentType.CENTER,
      border:{top:{style:BorderStyle.SINGLE,size:4,color:GOLD,space:1},bottom:{style:BorderStyle.SINGLE,size:4,color:GOLD,space:1}},
      children:[new TextRun({text:"  CONFIDENTIAL  ·  STRATEGIC DOCUMENT  ·  FOR AUTHORISED USE ONLY  ",size:16,color:SLATE,font:"Arial"})]}),
  );
  children.push(new Paragraph({...sp(400,160)}));
  children.push(...infoTable([
    ["Development",ov.development||"ARD City"],["Location",ov.location||""],
    ["Developer",ov.developer||""],["Project Type",ov.projectType||""],
    ["Prepared By",ov.preparedBy||""],["Document Date",ov.date||""],
    ["Plan Period",ov.planPeriod||""],["Total Revenue Target",ov.totalRevenue||""],
    ["Total Inventory",ov.totalInventory||""],["Launch Date",ov.launchDate||""],
    ["Primary Markets",ov.primaryMarkets||""],["Regulatory Framework",ov.regulatory||""],
    ["Sales Verticals","B2G  ·  B2C  ·  B2B Corporate  ·  Channel Partners  ·  Overseas/Diaspora"],
  ],[2600,6400]));

  // ── EXECUTIVE SUMMARY ──────────────────────────────────────────
  children.push(pgBrk(),H1("Executive Summary"),goldRule());
  if(summary){
    children.push(H3("AI Strategic Intelligence Brief",GOLD));
    children.push(...body(summary));
    children.push(thinRule());
  }
  if(ov.executiveSummary) children.push(...labelBlock("Strategic Overview",ov.executiveSummary));
  if(ov.marketContext) children.push(...labelBlock("Pakistan Real Estate Market Context",ov.marketContext));
  if(ov.positioning) children.push(...labelBlock("ARD City Market Positioning",ov.positioning));
  if(ov.salesObjectives) children.push(...labelBlock("Overall Sales Objectives",ov.salesObjectives));
  if(ov.productMix) children.push(...labelBlock("Product Mix & Inventory",ov.productMix));
  if(ov.pricingOverview) children.push(...labelBlock("Pricing Overview",ov.pricingOverview));
  if(ov.keyDifferentiators) children.push(...labelBlock("Key Differentiators",ov.keyDifferentiators));

  // ── PRODUCT RELEASE ORDER ──────────────────────────────────────
  children.push(...sectionBanner("Product Release Order","Master Sales Plan — Product Sequencing","2E5A3A"));
  if(pr.releaseRationale) children.push(...labelBlock("Release Strategy Rationale",pr.releaseRationale,"#2E5A3A"));
  ["phase1Products","phase2Products","phase3Products","phase4Products"].forEach((k,i)=>{
    if(pr[k]) children.push(...labelBlock(`Phase ${i+1}`,pr[k],"#2E5A3A"));
  });
  if(pr.absorptionStrategy) children.push(...labelBlock("Market Absorption Strategy",pr.absorptionStrategy));
  if(pr.pricingEscalation) children.push(...labelBlock("Pricing Escalation Plan",pr.pricingEscalation));
  if(pr.inventoryReserves) children.push(...labelBlock("Inventory Reserve Policy",pr.inventoryReserves));
  if(pr.productKPIs) children.push(...labelBlock("Product Release KPIs",pr.productKPIs));

  // ── TIMELINE ──────────────────────────────────────────────────
  children.push(...sectionBanner("Timeline & Execution Phases","Master Sales Plan — Timeline",NAVY));
  if(tl.launchDate) children.push(...infoTable([["Official Launch Date",tl.launchDate]]));
  ["preLaunchPhase","launchPhase","accelerationPhase","closingPhase"].forEach((k,i)=>{
    const labels=["Pre-Launch Phase (Phase 0)","Grand Launch Phase (Phase 1)",
                  "Acceleration Phase (Phase 2)","Closing & Consolidation (Phase 3)"];
    if(tl[k]) children.push(...labelBlock(labels[i],tl[k],`#${NAVY}`));
  });
  if(tl.milestones) children.push(...labelBlock("Key Milestones & Checkpoints",tl.milestones));
  if(tl.deliverySchedule) children.push(...labelBlock("Delivery & Possession Schedule",tl.deliverySchedule));
  if(tl.reviewCadence) children.push(...labelBlock("Reporting & Review Cadence",tl.reviewCadence));
  if(tl.timelineRisks) children.push(...labelBlock("Timeline Risks & Contingencies",tl.timelineRisks));

  // ── BUDGET ────────────────────────────────────────────────────
  children.push(...sectionBanner("Budget Allocation","Master Sales Plan — Budget","7A4010"));
  if(bud.totalBudget) children.push(...infoTable([["Total Sales & Marketing Budget",bud.totalBudget]]));
  if(bud.budgetRationale) children.push(...labelBlock("Budget Rationale",bud.budgetRationale));
  const budFields=[
    ["marketingBudget","Marketing & Advertising"],["eventsBudget","Events & Activations"],
    ["technologyBudget","Technology & CRM"],["commissions","Commission & Incentive Structure"],
    ["salesOpsBudget","Sales Operations"],["contingency","Contingency Reserve"],
    ["budgetKPIs","Budget Performance KPIs"],["phaseWiseBudget","Phase-Wise Budget Release"],
  ];
  budFields.forEach(([k,l])=>{ if(bud[k]) children.push(...labelBlock(l,bud[k])); });

  // ── EVENTS STRATEGY ───────────────────────────────────────────
  children.push(...sectionBanner("Events & Activations Strategy","Master Sales Plan — Events","4A1A70"));
  if(ev.eventsOverview) children.push(...labelBlock("Events Strategy Overview",ev.eventsOverview));
  const evFields=[
    ["grandLaunch","Grand Launch Event"],["dealerMeets","Dealer & Channel Meets"],
    ["govtEvents","Government & Institutional Events (B2G)"],["corporateEvents","Corporate Outreach Events (B2B)"],
    ["investorSessions","Investor & HNI Sessions"],["diasporaEvents","Overseas / Diaspora Events"],
    ["onGround","On-Ground Activations & Roadshows"],["digitalEvents","Digital & Virtual Events"],
    ["eventsKPIs","Events KPIs & Targets"],
  ];
  evFields.forEach(([k,l])=>{ if(ev[k]) children.push(...labelBlock(l,ev[k])); });

  // ── MARKETING PLAN ────────────────────────────────────────────
  children.push(...sectionBanner("Integrated Marketing Plan","Master Sales Plan — Marketing","6A1030"));
  const mktFields=[
    ["brandPositioning","Brand Positioning & Identity"],["targetAudience","Target Audience Segments"],
    ["awarenessPhase","Awareness Phase — Top of Funnel"],["leadGenPhase","Lead Generation — Mid Funnel"],
    ["conversionPhase","Conversion Strategy — Bottom Funnel"],["digitalMarketing","Digital Marketing — Channels & Tactics"],
    ["traditionalMarketing","Traditional & OOH Marketing"],["overseasMarketing","Overseas / Diaspora Marketing"],
    ["contentStrategy","Content & PR Strategy"],["marketingKPIs","Marketing KPIs & Monthly Targets"],
    ["crmStrategy","CRM & Lead Management Strategy"],
  ];
  mktFields.forEach(([k,l])=>{ if(mkt[k]) children.push(...labelBlock(l,mkt[k])); });

  // ── 5 VERTICAL PLANS ─────────────────────────────────────────
  Object.keys(VERT_NAMES).forEach(vKey=>{
    const vData=fd[vKey]||{};
    children.push(...vertBanner(vKey));
    const [label,name]=VERT_NAMES[vKey], hex=VERT_HEX[vKey];
    children.push(...infoTable([
      ["Vertical",`${label} — ${name}`],["Objective",vData.objective||""],
      ["Target Segment (brief)",vData.targetSegment?.split("\n")[0]||""],
      ["Revenue Target",vData.revenueTarget||""],["Timeline Priority",vData.timeline||""],
      ["Primary Contact",vData.contactType||""],
    ]));
    const vFields=[
      ["targetSegment","Full Target Segment Profile"],["valueProp","Value Proposition"],
      ["products","Key Products / Offerings"],["salesApproach","Sales Approach & Strategy"],
      ["pricing","Pricing & Payment Structure"],["leadGen","Lead Generation Channels"],
      ["stakeholders","Decision Makers / Stakeholders"],["partnerships","Partnership / MOU Structure"],
      ["incentives","Incentives & Commission"],["marketing","Vertical Marketing Support"],
      ["kpis","Vertical KPIs & Targets"],["risks","Risks & Mitigation"],["notes","Notes"],
    ];
    vFields.forEach(([k,l])=>{ if(vData[k]) children.push(...labelBlock(l,vData[k],"#"+hex)); });
  });

  // ── KPI FRAMEWORK ─────────────────────────────────────────────
  children.push(...sectionBanner("KPI Framework","Performance Management",NAVY));
  children.push(...body("All KPIs are linked to the sales plan targets, verticals, and individual roles. Track actuals weekly; review in monthly Sales Command meeting."));
  Object.entries(kpis).forEach(([cat,rows])=>{
    if(!rows?.length) return;
    const cm=KPI_CATS[cat]||{label:cat,hex:NAVY};
    children.push(H2(cm.label,"#"+cm.hex));
    children.push(...kpiTable(rows,cm.hex));
  });

  // ── SMART GOALS ──────────────────────────────────────────────
  children.push(...sectionBanner("SMART Goals by Role","Linked Objectives — Specific · Measurable · Achievable · Relevant · Time-bound","2A5A2A"));
  children.push(...body("Each role's SMART goals cascade directly from the Master Sales Plan revenue targets and KPI framework above. Goals are tracked in the weekly Sales Command meeting."));
  children.push(new Paragraph({...sp(200,0)}));

  roles.forEach(role=>{
    const jd=jdsData[role.id]||{};
    if(!jd.smartGoals?.trim()) return;
    const rc=role.color?.replace("#","")||GOLD;
    children.push(
      new Paragraph({...sp(280,60),children:[
        new TextRun({text:role.title,bold:true,size:24,color:"#"+rc,font:"Garamond"}),
        new TextRun({text:`  [${role.band}  ·  ${role.vertical}]`,size:18,color:SLATE,font:"Arial"}),
      ]}),
      new Paragraph({...sp(0,80),border:{bottom:{style:BorderStyle.SINGLE,size:2,color:rc,space:2}},children:[]}),
    );

    // Parse goals by line and number them
    const goalLines=jd.smartGoals.trim().split("\n").filter(l=>l.trim());
    goalLines.forEach((line,i)=>{
      const isGoal=/^goal\s*\d/i.test(line.trim());
      children.push(new Paragraph({...sp(isGoal?120:40,50),indent:{left:isGoal?240:480},
        children:[
          isGoal ? new TextRun({text:`${i+1}.  `,bold:true,size:20,color:"#"+rc,font:"Arial"}) : new TextRun({text:""}),
          new TextRun({text:line.replace(/^goal\s*\d+[:\.]?\s*/i,"").trim(),size:21,font:"Garamond",color:DK}),
        ]
      }));
    });

    if(jd.kpisLinked?.trim()){
      children.push(new Paragraph({...sp(80,120),indent:{left:240},
        children:[
          new TextRun({text:"Linked KPIs: ",bold:true,size:18,color:"4A90D9",font:"Arial"}),
          new TextRun({text:jd.kpisLinked.trim(),size:18,color:"4A90D9",font:"Arial"}),
        ]
      }));
    }
    children.push(thinRule());
  });

  // ── JOB DESCRIPTIONS ─────────────────────────────────────────
  children.push(...sectionBanner("Job Descriptions","ARD City Sales Command — Role Profiles","3A0A50"));
  children.push(...body("All 10 roles report within the ARD City Sales Command structure. Each JD is directly linked to the KPI framework and SMART goals in this plan."));

  roles.forEach(role=>{
    const jd=jdsData[role.id]||{};
    const rc=role.color?.replace("#","")||GOLD;
    children.push(pgBrk());
    children.push(
      new Paragraph({...sp(0,0),shading:{fill:rc,type:ShadingType.CLEAR},
        children:[new TextRun({text:`  ${role.title}  ·  ${role.band}`,bold:true,size:24,color:WHITE,font:"Garamond"})]}),
      new Paragraph({...sp(0,140),shading:{fill:LG,type:ShadingType.CLEAR},
        children:[new TextRun({text:`  ARD CITY  ·  JOB DESCRIPTION  ·  ${role.vertical.toUpperCase()} VERTICAL`,size:16,color:NAVY,font:"Arial",characterSpacing:60})]}),
    );

    if(jd.summary){
      children.push(new Paragraph({...sp(160,100),indent:{left:200},
        border:{left:{style:BorderStyle.SINGLE,size:4,color:rc,space:8}},
        children:[new TextRun({text:jd.summary.trim(),size:20,italics:true,color:SLATE,font:"Garamond"})]}));
    }

    const jdSections=[
      ["responsibilities","Key Responsibilities"],
      ["requirements","Qualifications & Requirements"],
      ["kpisLinked","Linked KPIs & Targets"],
      ["smartGoals","SMART Goals"],
    ];
    jdSections.forEach(([key,sLabel])=>{
      if(!jd[key]?.trim()) return;
      children.push(H3(sLabel,"#"+rc));
      const lines=jd[key].trim().split("\n").filter(l=>l.trim());
      lines.forEach((line,i)=>{
        children.push(new Paragraph({...sp(40,50),indent:{left:360},
          children:[
            new TextRun({text:key==="responsibilities"?`${i+1}.  `:"•  ",size:19,color:"#"+rc,font:"Arial"}),
            new TextRun({text:line.trim(),size:20,font:"Garamond",color:DK}),
          ]
        }));
      });
    });
  });

  // ── BUILD ─────────────────────────────────────────────────────
  const doc=new Document({
    styles:{
      default:{document:{run:{font:"Garamond",size:22}}},
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
      properties:{page:{size:{width:12240,height:15840},margin:{top:1200,right:1200,bottom:1200,left:1200}}},
      headers:{default:new Header({children:[
        new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:4,color:GOLD,space:4}},children:[
          new TextRun({text:"ARD CITY  ·  ",bold:true,size:17,color:NAVY,font:"Arial",characterSpacing:60}),
          new TextRun({text:ov.planTitle||"Master Sales Plan",size:17,color:SLATE,font:"Arial"}),
          new TextRun({text:"    CONFIDENTIAL",size:15,color:"AAAAAA",font:"Arial"}),
        ]}),
      ]})},
      footers:{default:new Footer({children:[
        new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:2,color:"CCCCCC",space:4}},children:[
          new TextRun({text:ov.preparedBy||"ARD City Sales Command",size:15,color:"888888",font:"Arial"}),
          new TextRun({text:`   ·   ${ov.date||""}   ·   Sales Intelligence Package  ·  All Rights Reserved`,size:15,color:"AAAAAA",font:"Arial"}),
        ]}),
      ]})},
      children:children.filter(Boolean),
    }],
  });

  const buf=await Packer.toBuffer(doc);
  fs.writeFileSync("/tmp/ard_complete.docx",buf);
  process.stdout.write(JSON.stringify({success:true,path:"/tmp/ard_complete.docx"}));
}
