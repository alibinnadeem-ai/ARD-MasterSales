#!/usr/bin/env python3
import sys, json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    HRFlowable, Table, TableStyle)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black

data   = json.load(sys.stdin)
fd     = data.get("formData", {})
ov     = fd.get("overview", {})
pr     = fd.get("product_release", {})
tl     = fd.get("timeline", {})
bud    = fd.get("budget", {})
ev     = fd.get("events", {})
mkt    = fd.get("marketing", {})
kpis   = data.get("kpis", {})
jds    = data.get("jds", {})
roles  = data.get("roles", [])
summary= data.get("summary", "")
out    = data.get("output_path", "/tmp/ard_complete.pdf")

# PALETTE
GOLD=HexColor("#B8912A"); GOLD2=HexColor("#D4A843"); NAVY=HexColor("#0D1F3C")
MIDBLUE=HexColor("#1A3A6B"); STEEL=HexColor("#2C5282"); SLATE=HexColor("#4A5568")
LGRAY=HexColor("#EEF2F8"); DGRAY=HexColor("#2D2D2D"); WHITE=white

VERT_COLORS={"b2g":HexColor("#1A4A7A"),"b2c":HexColor("#2E6B45"),"b2b":HexColor("#6B2E2E"),
             "channel":HexColor("#4A3070"),"diaspora":HexColor("#1A5A5A")}
VERT_META={"b2g":("B2G","Business to Government"),"b2c":("B2C","Business to Consumer"),
           "b2b":("B2B Corporate","Business to Business Corporate"),
           "channel":("Channel Partners","Dealer & Channel Network"),
           "diaspora":("Overseas/Diaspora","Overseas Pakistani & Diaspora")}
SEC_COLORS={"product_release":HexColor("#2E5A3A"),"timeline":NAVY,"budget":HexColor("#7A4010"),
            "events":HexColor("#4A1A70"),"marketing":HexColor("#6A1030"),
            "kpis":NAVY,"goals":HexColor("#2A5A2A"),"jds":HexColor("#3A0A50")}
KPI_CAT_COLORS={"revenue":NAVY,"pipeline":MIDBLUE,"activity":HexColor("#2E6B45"),"quality":HexColor("#6B2E2E")}
KPI_CAT_LABELS={"revenue":"Revenue KPIs","pipeline":"Pipeline KPIs","activity":"Activity KPIs","quality":"Quality KPIs"}

ss = getSampleStyleSheet()
def ps(name, **kw): return ParagraphStyle(name, parent=ss["Normal"], **kw)

CT=ps("CT",fontSize=36,textColor=NAVY,fontName="Times-Bold",alignment=1,spaceAfter=8,spaceBefore=60)
CS=ps("CS",fontSize=16,textColor=GOLD,fontName="Times-Roman",alignment=1,spaceAfter=4)
CM=ps("CM",fontSize=9,textColor=SLATE,fontName="Helvetica",alignment=1,spaceAfter=3)
ST=ps("ST",fontSize=18,textColor=NAVY,fontName="Times-Bold",spaceBefore=18,spaceAfter=6)
ST2=ps("ST2",fontSize=13,textColor=MIDBLUE,fontName="Times-Bold",spaceBefore=12,spaceAfter=4)
ST3=ps("ST3",fontSize=9,textColor=STEEL,fontName="Helvetica-Bold",spaceBefore=10,spaceAfter=3,characterSpacing=40)
LABEL=ps("LBL",fontSize=10,textColor=MIDBLUE,fontName="Helvetica-Bold",spaceBefore=11,spaceAfter=3)
BODY=ps("BOD",fontSize=10,textColor=DGRAY,fontName="Times-Roman",spaceBefore=2,spaceAfter=4,leftIndent=14,leading=15)
ITAL=ps("ITL",fontSize=10,textColor=SLATE,fontName="Times-Italic",spaceBefore=2,spaceAfter=4,leftIndent=18,leading=15)
MONO=ps("MNO",fontSize=9,textColor=STEEL,fontName="Helvetica",spaceBefore=2,spaceAfter=4)
AIL=ps("AIL",fontSize=9,textColor=GOLD,fontName="Helvetica-Oblique",spaceBefore=6,spaceAfter=4)
TH=ps("TH",fontSize=9,textColor=DGRAY,fontName="Helvetica-Bold",leading=12)
TB=ps("TB",fontSize=9,textColor=DGRAY,fontName="Times-Roman",leading=13)

def safe(t): return str(t or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def gold_hr(): return HRFlowable(width="100%",thickness=2,color=GOLD,spaceAfter=8,spaceBefore=4)
def thin_hr(): return HRFlowable(width="100%",thickness=0.5,color=HexColor("#CCCCCC"),spaceAfter=6,spaceBefore=6)

def body_ps(text, indent=14):
    if not text or not text.strip(): return []
    s=ps(f"BP{abs(hash(text))%9999}",fontSize=10,textColor=DGRAY,fontName="Times-Roman",
         spaceBefore=2,spaceAfter=4,leftIndent=indent,leading=15)
    return [Paragraph(safe(ln.strip()),s) for ln in text.strip().split("\n") if ln.strip()]

def lbl_block(label, value, color=STEEL):
    if not value or not str(value).strip(): return []
    s=ps(f"L{abs(hash(label))%9999}",fontSize=10,textColor=color,fontName="Helvetica-Bold",spaceBefore=11,spaceAfter=3)
    return [Paragraph(f"▸  {safe(label)}",s)] + body_ps(value)

def info_table(rows):
    f=[(l,v) for l,v in rows if v and str(v).strip()]
    if not f: return []
    td=[[Paragraph(safe(l),TH),Paragraph(safe(v),TB)] for l,v in f]
    t=Table(td,colWidths=[1.9*inch,5.3*inch])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[LGRAY,HexColor("#F7F9FC")]),
        ("GRID",(0,0),(-1,-1),0.5,HexColor("#DDDDDD")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),
    ]))
    return [t,Spacer(1,0.08*inch)]

def kpi_table(kpi_rows,hdr_color=NAVY):
    if not kpi_rows: return []
    KH=ps("KH",fontSize=8,textColor=WHITE,fontName="Helvetica-Bold",leading=11)
    KB=ps("KB",fontSize=9,textColor=DGRAY,fontName="Times-Roman",leading=12)
    hdrs=[["KPI","Target","Unit","Frequency","Vertical"]]
    rows_data=[[Paragraph(safe(k.get("label","")),KB),Paragraph(safe(k.get("target","")),KB),
                Paragraph(safe(k.get("unit","")),KB),Paragraph(safe(k.get("freq","")),KB),
                Paragraph(safe(k.get("vertical","")),KB)] for k in kpi_rows]
    hdr_row=[[Paragraph(h,KH) for h in hdrs[0]]]
    t=Table(hdr_row+rows_data,colWidths=[2.3*inch,1.1*inch,0.7*inch,1.1*inch,1.0*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),hdr_color),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[HexColor("#FAFAFA"),LGRAY]),
        ("GRID",(0,0),(-1,-1),0.5,HexColor("#DDDDDD")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
    ]))
    return [t,Spacer(1,0.1*inch)]

def section_banner(label, sublabel, color):
    ts=ps(f"BT{abs(hash(label))%9999}",fontSize=15,textColor=WHITE,fontName="Times-Bold")
    gs=ps(f"BG{abs(hash(label))%9999}",fontSize=8,textColor=NAVY,fontName="Helvetica-Bold",characterSpacing=60)
    return [PageBreak(),
        Table([[Paragraph(f"  {label}",ts)]],colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),color),("TOPPADDING",(0,0),(-1,-1),9),
                               ("BOTTOMPADDING",(0,0),(-1,-1),9),("LEFTPADDING",(0,0),(-1,-1),12)])),
        Table([[Paragraph(f"  ARD CITY  ·  {sublabel.upper()}",gs)]],colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),GOLD2),("TOPPADDING",(0,0),(-1,-1),4),
                               ("BOTTOMPADDING",(0,0),(-1,-1),4),("LEFTPADDING",(0,0),(-1,-1),12)])),
        thin_hr()]

def vert_banner(vkey):
    vc=VERT_COLORS[vkey]; label,name=VERT_META[vkey]
    ts=ps(f"VT{vkey}",fontSize=15,textColor=WHITE,fontName="Times-Bold")
    gs=ps(f"VG{vkey}",fontSize=8,textColor=NAVY,fontName="Helvetica-Bold",characterSpacing=60)
    return [PageBreak(),
        Table([[Paragraph(f"  {label}  ·  {name}",ts)]],colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),vc),("TOPPADDING",(0,0),(-1,-1),9),
                               ("BOTTOMPADDING",(0,0),(-1,-1),9),("LEFTPADDING",(0,0),(-1,-1),12)])),
        Table([[Paragraph("  ARD CITY  ·  SALES VERTICAL PLAN",gs)]],colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),GOLD2),("TOPPADDING",(0,0),(-1,-1),4),
                               ("BOTTOMPADDING",(0,0),(-1,-1),4),("LEFTPADDING",(0,0),(-1,-1),12)])),
        thin_hr()]

# ── BUILD STORY ───────────────────────────────────────────────────
story=[]

# COVER
story+=[Spacer(1,0.6*inch),Paragraph("ARD CITY",CT),
        Paragraph(safe(ov.get("planTitle","MASTER SALES PLAN")),CS),
        Paragraph("SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS",
          ps("CSB",fontSize=9,textColor=SLATE,fontName="Helvetica",alignment=1,characterSpacing=80)),
        gold_hr()]
for lbl,key in [("Development","development"),("Location","location"),("Developer","developer"),
                ("Project Type","projectType"),("Prepared By","preparedBy"),("Date","date"),
                ("Plan Period","planPeriod"),("Revenue Target","totalRevenue"),
                ("Total Inventory","totalInventory"),("Launch Date","launchDate"),
                ("Primary Markets","primaryMarkets"),("Regulatory","regulatory")]:
    if ov.get(key): story.append(Paragraph(f"{lbl}: {safe(ov[key])}",CM))

# EXECUTIVE SUMMARY
story+=section_banner("Executive Summary","Strategic Overview",NAVY)
if summary: story+=[Paragraph("AI Strategic Intelligence Brief",AIL)]+body_ps(summary)+[thin_hr()]
for l,k in [("Strategic Overview","executiveSummary"),("Market Context","marketContext"),
            ("ARD City Positioning","positioning"),("Sales Objectives","salesObjectives"),
            ("Product Mix","productMix"),("Pricing Overview","pricingOverview"),("Key Differentiators","keyDifferentiators")]:
    story+=lbl_block(l,ov.get(k,""))

# PRODUCT RELEASE ORDER
story+=section_banner("Product Release Order","Master Sales Plan — Product Sequencing",HexColor("#2E5A3A"))
if pr.get("releaseRationale"): story+=lbl_block("Release Strategy Rationale",pr["releaseRationale"],HexColor("#2E5A3A"))
for i,k in enumerate(["phase1Products","phase2Products","phase3Products","phase4Products"]):
    if pr.get(k): story+=lbl_block(f"Phase {i+1}",pr[k],HexColor("#2E5A3A"))
for l,k in [("Market Absorption Strategy","absorptionStrategy"),("Pricing Escalation Plan","pricingEscalation"),
            ("Inventory Reserve Policy","inventoryReserves"),("Product Release KPIs","productKPIs")]:
    story+=lbl_block(l,pr.get(k,""))

# TIMELINE
story+=section_banner("Timeline & Execution Phases","Master Sales Plan — Timeline",NAVY)
if tl.get("launchDate"): story+=info_table([("Official Launch Date",tl["launchDate"])])
for l,k in [("Pre-Launch Phase (Phase 0)","preLaunchPhase"),("Grand Launch Phase (Phase 1)","launchPhase"),
            ("Acceleration Phase (Phase 2)","accelerationPhase"),("Closing & Consolidation","closingPhase"),
            ("Key Milestones & Checkpoints","milestones"),("Delivery & Possession Schedule","deliverySchedule"),
            ("Reporting & Review Cadence","reviewCadence"),("Timeline Risks & Contingencies","timelineRisks")]:
    story+=lbl_block(l,tl.get(k,""))

# BUDGET
story+=section_banner("Budget Allocation","Master Sales Plan — Budget",HexColor("#7A4010"))
if bud.get("totalBudget"): story+=info_table([("Total Sales & Marketing Budget",bud["totalBudget"])])
for l,k in [("Budget Rationale","budgetRationale"),("Marketing & Advertising","marketingBudget"),
            ("Events & Activations","eventsBudget"),("Technology & CRM","technologyBudget"),
            ("Commission & Incentive Structure","commissions"),("Sales Operations","salesOpsBudget"),
            ("Contingency Reserve","contingency"),("Budget Performance KPIs","budgetKPIs"),
            ("Phase-Wise Budget Release","phaseWiseBudget")]:
    story+=lbl_block(l,bud.get(k,""))

# EVENTS
story+=section_banner("Events & Activations Strategy","Master Sales Plan — Events",HexColor("#4A1A70"))
for l,k in [("Events Strategy Overview","eventsOverview"),("Grand Launch Event","grandLaunch"),
            ("Dealer & Channel Meets","dealerMeets"),("Government & Institutional Events","govtEvents"),
            ("Corporate Outreach Events","corporateEvents"),("Investor & HNI Sessions","investorSessions"),
            ("Overseas / Diaspora Events","diasporaEvents"),("On-Ground Activations","onGround"),
            ("Digital & Virtual Events","digitalEvents"),("Events KPIs & Targets","eventsKPIs")]:
    story+=lbl_block(l,ev.get(k,""))

# MARKETING
story+=section_banner("Integrated Marketing Plan","Master Sales Plan — Marketing",HexColor("#6A1030"))
for l,k in [("Brand Positioning & Identity","brandPositioning"),("Target Audience Segments","targetAudience"),
            ("Awareness Phase — Top of Funnel","awarenessPhase"),("Lead Generation — Mid Funnel","leadGenPhase"),
            ("Conversion Strategy — Bottom Funnel","conversionPhase"),("Digital Marketing","digitalMarketing"),
            ("Traditional & OOH Marketing","traditionalMarketing"),("Overseas / Diaspora Marketing","overseasMarketing"),
            ("Content & PR Strategy","contentStrategy"),("Marketing KPIs & Targets","marketingKPIs"),
            ("CRM & Lead Management","crmStrategy")]:
    story+=lbl_block(l,mkt.get(k,""))

# 5 VERTICALS
for vkey in ["b2g","b2c","b2b","channel","diaspora"]:
    vd=fd.get(vkey,{}); vc=VERT_COLORS[vkey]; label,name=VERT_META[vkey]
    story+=vert_banner(vkey)
    story+=info_table([("Vertical",f"{label} — {name}"),("Objective",vd.get("objective","")),
        ("Revenue Target",vd.get("revenueTarget","")),("Timeline",vd.get("timeline","")),
        ("Primary Contact",vd.get("contactType",""))])
    for l,k in [("Target Segment Profile","targetSegment"),("Value Proposition","valueProp"),
                ("Key Products / Offerings","products"),("Sales Approach","salesApproach"),
                ("Pricing & Payment","pricing"),("Lead Generation","leadGen"),
                ("Decision Makers","stakeholders"),("Partnership / MOU","partnerships"),
                ("Incentives & Commission","incentives"),("Marketing Support","marketing"),
                ("Vertical KPIs","kpis"),("Risks & Mitigation","risks"),("Notes","notes")]:
        story+=lbl_block(l,vd.get(k,""),vc)

# KPIs
story+=section_banner("KPI Framework","Performance Management",NAVY)
story+=body_ps("All KPIs linked to sales plan targets, verticals, and roles. Track actuals weekly; review in monthly Sales Command meeting.")
for cat,rows in kpis.items():
    if not rows: continue
    cc=KPI_CAT_COLORS.get(cat,NAVY)
    story+=[Paragraph(KPI_CAT_LABELS.get(cat,cat.upper()),ST2)]+kpi_table(rows,cc)

# SMART GOALS
story+=section_banner("SMART Goals by Role","Specific · Measurable · Achievable · Relevant · Time-bound",HexColor("#2A5A2A"))
story+=body_ps("Each role's SMART goals cascade from the Master Sales Plan targets and KPI framework. Tracked in weekly Sales Command meeting.")
story.append(Spacer(1,0.15*inch))

for role in roles:
    jd=jds.get(role["id"],{})
    if not jd.get("smartGoals","").strip(): continue
    rc=HexColor(role.get("color","#B8912A"))
    gt=ps(f"GT{role['id']}",fontSize=13,textColor=rc,fontName="Times-Bold",spaceBefore=18,spaceAfter=4)
    story+=[Paragraph(f"{role['title']}  [{role['band']}  ·  {role['vertical']}]",gt),thin_hr()]
    lines=jd["smartGoals"].strip().split("\n")
    for i,line in enumerate(lines):
        if line.strip():
            is_goal=line.strip().lower().startswith("goal")
            s=ps(f"GL{role['id']}{i}",fontSize=10,textColor=rc if is_goal else DGRAY,
                 fontName="Helvetica-Bold" if is_goal else "Times-Roman",
                 spaceBefore=10 if is_goal else 3,spaceAfter=3,leftIndent=20 if is_goal else 36,leading=15)
            story.append(Paragraph(safe(line.strip()),s))
    if jd.get("kpisLinked","").strip():
        story.append(Paragraph(f"Linked KPIs: {safe(jd['kpisLinked'])}",
            ps(f"KL{role['id']}",fontSize=9,textColor=HexColor("#4A90D9"),fontName="Helvetica",
               spaceBefore=6,spaceAfter=10,leftIndent=20)))

# JOB DESCRIPTIONS
story+=section_banner("Job Descriptions","ARD City Sales Command — Role Profiles",HexColor("#3A0A50"))
story+=body_ps("All roles link directly to the KPI framework and SMART goals in this plan.")

for role in roles:
    jd=jds.get(role["id"],{})
    rc=HexColor(role.get("color","#B8912A"))
    ts=ps(f"JT{role['id']}",fontSize=14,textColor=WHITE,fontName="Times-Bold")
    gs=ps(f"JG{role['id']}",fontSize=8,textColor=NAVY,fontName="Helvetica-Bold",characterSpacing=60)
    story+=[PageBreak(),
        Table([[Paragraph(f"  {role['title']}  ·  {role['band']}",ts)]],colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),rc),("TOPPADDING",(0,0),(-1,-1),8),
                               ("BOTTOMPADDING",(0,0),(-1,-1),8),("LEFTPADDING",(0,0),(-1,-1),12)])),
        Table([[Paragraph(f"  ARD CITY  ·  JOB DESCRIPTION  ·  {role['vertical'].upper()} VERTICAL",gs)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),LGRAY),("TOPPADDING",(0,0),(-1,-1),4),
                               ("BOTTOMPADDING",(0,0),(-1,-1),4),("LEFTPADDING",(0,0),(-1,-1),12)])),
        Spacer(1,0.1*inch),
    ]
    if jd.get("summary","").strip():
        story.append(Paragraph(safe(jd["summary"]),ITAL))
    for sec_key,sec_label in [("responsibilities","Key Responsibilities"),
                               ("requirements","Qualifications & Requirements"),
                               ("kpisLinked","Linked KPIs & Targets"),("smartGoals","SMART Goals")]:
        if not jd.get(sec_key,"").strip(): continue
        sh=ps(f"JH{role['id']}{sec_key}",fontSize=9,textColor=rc,fontName="Helvetica-Bold",
              spaceBefore=12,spaceAfter=4,characterSpacing=30)
        story.append(Paragraph(sec_label.upper(),sh))
        lines=jd[sec_key].strip().split("\n")
        for i,line in enumerate(lines):
            if line.strip():
                bs=ps(f"JB{role['id']}{sec_key}{i}",fontSize=10,textColor=DGRAY,fontName="Times-Roman",
                      spaceBefore=3,spaceAfter=3,leftIndent=16,leading=15)
                prefix=f"{i+1}.  " if sec_key=="responsibilities" else "•  "
                story.append(Paragraph(f"{prefix}{safe(line.strip())}",bs))

# ── BUILD ────────────────────────────────────────────────────────
def on_first(canvas,doc):
    canvas.saveState()
    canvas.setFillColor(GOLD); canvas.rect(0,0,letter[0],0.4*inch,fill=1,stroke=0)
    canvas.setFillColor(NAVY); canvas.rect(0,letter[1]-0.22*inch,letter[0],0.22*inch,fill=1,stroke=0)
    canvas.setFillColor(WHITE); canvas.setFont("Helvetica",7)
    canvas.drawString(0.5*inch,0.15*inch,"CONFIDENTIAL  ·  FOR AUTHORISED USE ONLY")
    canvas.drawRightString(letter[0]-0.5*inch,0.15*inch,"ARD CITY  ·  SALES INTELLIGENCE PACKAGE")
    canvas.restoreState()

def on_later(canvas,doc):
    canvas.saveState()
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(1)
    canvas.line(0.6*inch,0.65*inch,letter[0]-0.6*inch,0.65*inch)
    canvas.setFont("Helvetica",7.5); canvas.setFillColor(SLATE)
    canvas.drawString(0.6*inch,0.44*inch,f"ARD City  ·  {safe(ov.get('planTitle','Sales Intelligence Plan'))}  ·  CONFIDENTIAL")
    canvas.drawRightString(letter[0]-0.6*inch,0.44*inch,f"Page {doc.page}")
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(0.5)
    canvas.line(0.6*inch,letter[1]-0.5*inch,letter[0]-0.6*inch,letter[1]-0.5*inch)
    canvas.setFont("Helvetica-Bold",7); canvas.setFillColor(NAVY)
    canvas.drawString(0.6*inch,letter[1]-0.38*inch,"ARD CITY")
    canvas.setFont("Helvetica",7); canvas.setFillColor(SLATE)
    canvas.drawRightString(letter[0]-0.6*inch,letter[1]-0.38*inch,safe(ov.get("preparedBy","")))
    canvas.restoreState()

doc_pdf=SimpleDocTemplate(out,pagesize=letter,rightMargin=0.75*inch,leftMargin=0.75*inch,
    topMargin=0.65*inch,bottomMargin=0.85*inch,
    title=f"ARD City — {ov.get('planTitle','Sales Intelligence Plan')}",
    author=ov.get("preparedBy",""))
doc_pdf.build(story,onFirstPage=on_first,onLaterPages=on_later)
print(json.dumps({"success":True,"path":out}))
