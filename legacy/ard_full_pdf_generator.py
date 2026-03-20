#!/usr/bin/env python3
import sys, json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    HRFlowable, Table, TableStyle, KeepTogether)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black

data = json.load(sys.stdin)
fd   = data.get("formData", {})
summary = data.get("summary", "")
kpi_data = data.get("kpi_data", {})
jd_data  = data.get("jd_data", {})
roles    = data.get("roles", [])
smart_tpl= data.get("smart_templates", {})
out = data.get("output_path", "/tmp/ard_full.pdf")
meta = fd.get("meta", {})

# PALETTE
GOLD   = HexColor("#B8912A"); GOLD2  = HexColor("#D4A843")
NAVY   = HexColor("#0D1F3C"); MIDBLUE= HexColor("#1A3A6B")
STEEL  = HexColor("#2C5282"); SLATE  = HexColor("#4A5568")
LGRAY  = HexColor("#EEF2F8"); DGRAY  = HexColor("#2D2D2D")
WHITE  = white

VERT_COLORS = {
  "b2g":HexColor("#1A4A7A"),"b2c":HexColor("#2E6B45"),
  "b2b":HexColor("#6B2E2E"),"channel":HexColor("#4A3070"),"diaspora":HexColor("#1A5A5A")
}
VERT_META = {
  "b2g":("B2G","Business to Government"),"b2c":("B2C","Business to Consumer"),
  "b2b":("B2B Corporate","Business to Business Corporate"),
  "channel":("Channel Partners","Dealer & Channel Network"),
  "diaspora":("Overseas/Diaspora","Overseas Pakistani & Diaspora"),
}
ROLE_COLORS = {
  "vp_sales":HexColor("#B8912A"),"b2g_mgr":HexColor("#1A4A7A"),
  "b2c_exec":HexColor("#2E6B45"),"b2c_team_lead":HexColor("#2E6B45"),
  "corp_sales_mgr":HexColor("#6B2E2E"),"dealer_mgr":HexColor("#4A3070"),
  "dealer_coord":HexColor("#4A3070"),"nrp_mgr":HexColor("#1A5A5A"),
  "crm_lead":HexColor("#B8912A"),"mkt_mgr":HexColor("#7A1E2E"),
}
KPI_CAT_COLORS = {"revenue":NAVY,"pipeline":MIDBLUE,"activity":HexColor("#2E6B45"),"quality":HexColor("#6B2E2E")}
KPI_CAT_LABELS = {"revenue":"Revenue KPIs","pipeline":"Pipeline KPIs","activity":"Activity KPIs","quality":"Quality KPIs"}

ss = getSampleStyleSheet()
def ps(name, **kw): return ParagraphStyle(name, parent=ss["Normal"], **kw)

COVER_T  = ps("CT",  fontSize=38,textColor=NAVY,   fontName="Times-Bold",  alignment=1,spaceAfter=8,spaceBefore=60)
COVER_S  = ps("CS",  fontSize=16,textColor=GOLD,   fontName="Times-Roman", alignment=1,spaceAfter=4)
COVER_M  = ps("CM",  fontSize=9, textColor=SLATE,  fontName="Helvetica",   alignment=1,spaceAfter=3)
SECT_T   = ps("ST",  fontSize=19,textColor=NAVY,   fontName="Times-Bold",  spaceBefore=20,spaceAfter=6)
SECT_T2  = ps("ST2", fontSize=14,textColor=MIDBLUE,fontName="Times-Bold",  spaceBefore=14,spaceAfter=4)
SECT_T3  = ps("ST3", fontSize=10,textColor=STEEL,  fontName="Helvetica-Bold",spaceBefore=12,spaceAfter=3,characterSpacing=40)
LABEL    = ps("LBL", fontSize=10,textColor=MIDBLUE,fontName="Helvetica-Bold",spaceBefore=12,spaceAfter=3)
BODY     = ps("BOD", fontSize=10,textColor=DGRAY,  fontName="Times-Roman", spaceBefore=2,spaceAfter=4,leftIndent=14,leading=15)
ITAL     = ps("ITL", fontSize=10,textColor=SLATE,  fontName="Times-Italic",spaceBefore=2,spaceAfter=4,leftIndent=18,leading=15)
MONO     = ps("MNO", fontSize=9, textColor=STEEL,  fontName="Helvetica",   spaceBefore=2,spaceAfter=4)
AI_LBL   = ps("AIL", fontSize=9, textColor=GOLD,   fontName="Helvetica-Oblique",spaceBefore=6,spaceAfter=4)
TBL_H    = ps("TH",  fontSize=9, textColor=DGRAY,  fontName="Helvetica-Bold",leading=12)
TBL_B    = ps("TB",  fontSize=9, textColor=DGRAY,  fontName="Times-Roman", leading=13)
KPI_H    = ps("KH",  fontSize=8, textColor=WHITE,  fontName="Helvetica-Bold",leading=11)
KPI_B    = ps("KB",  fontSize=9, textColor=DGRAY,  fontName="Times-Roman", leading=12)

def safe(t):
    return str(t or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def gold_hr(): return HRFlowable(width="100%",thickness=2,color=GOLD,spaceAfter=8,spaceBefore=4)
def thin_hr(): return HRFlowable(width="100%",thickness=0.5,color=HexColor("#CCCCCC"),spaceAfter=6,spaceBefore=6)

def body_ps(text, indent=14):
    if not text or not text.strip(): return []
    s = ps(f"B{id(text)%9999}",fontSize=10,textColor=DGRAY,fontName="Times-Roman",
           spaceBefore=2,spaceAfter=4,leftIndent=indent,leading=15)
    return [Paragraph(safe(ln.strip()), s) for ln in text.strip().split("\n") if ln.strip()]

def lbl_block(label, value, color=STEEL):
    if not value or not str(value).strip(): return []
    s = ps(f"L{id(label)%9999}",fontSize=10,textColor=color,fontName="Helvetica-Bold",spaceBefore=12,spaceAfter=3)
    return [Paragraph(f"▸  {safe(label)}", s)] + body_ps(value)

def info_table(rows):
    filtered = [(l,v) for l,v in rows if v and str(v).strip()]
    if not filtered: return []
    tdata = [[Paragraph(safe(l),TBL_H),Paragraph(safe(v),TBL_B)] for l,v in filtered]
    t = Table(tdata, colWidths=[1.9*inch,5.3*inch])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[LGRAY,HexColor("#F7F9FC")]),
        ("GRID",(0,0),(-1,-1),0.5,HexColor("#DDDDDD")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),
    ]))
    return [t, Spacer(1,0.08*inch)]

def kpi_table(kpis, hdr_color=NAVY):
    if not kpis: return []
    hdrs = ["KPI","Target","Unit","Frequency","Vertical"]
    hdr_row = [Paragraph(h, KPI_H) for h in hdrs]
    rows = [hdr_row]
    for k in kpis:
        rows.append([
            Paragraph(safe(k.get("label","")), KPI_B),
            Paragraph(safe(k.get("target","")), KPI_B),
            Paragraph(safe(k.get("unit","")), KPI_B),
            Paragraph(safe(k.get("freq","")), KPI_B),
            Paragraph(safe(k.get("vertical","")).upper() if k.get("vertical")!="all" else "All", KPI_B),
        ])
    t = Table(rows, colWidths=[2.3*inch,1.1*inch,0.7*inch,1.1*inch,1.0*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),hdr_color),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[HexColor("#FAFAFA"),LGRAY]),
        ("GRID",(0,0),(-1,-1),0.5,HexColor("#DDDDDD")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
    ]))
    return [t, Spacer(1,0.1*inch)]

def vert_banner(vkey):
    vc = VERT_COLORS[vkey]; label, name = VERT_META[vkey]
    bt = ps(f"VT{vkey}",fontSize=15,textColor=WHITE,fontName="Times-Bold")
    bg = ps(f"VG{vkey}",fontSize=8, textColor=NAVY, fontName="Helvetica-Bold",characterSpacing=60)
    return [
        PageBreak(),
        Table([[Paragraph(f"  {label}  ·  {name}", bt)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),vc),
                               ("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        Table([[Paragraph("  ARD CITY  ·  SALES VERTICAL PLAN", bg)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),GOLD2),
                               ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        thin_hr(),
    ]

def jd_banner(role, color):
    title_s = ps(f"JDT{role['id']}",fontSize=14,textColor=WHITE,fontName="Times-Bold")
    band_s  = ps(f"JDB{role['id']}",fontSize=8, textColor=NAVY,fontName="Helvetica-Bold",characterSpacing=60)
    return [
        PageBreak(),
        Table([[Paragraph(f"  {role['title']}  ·  {role['band']}", title_s)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),color),
                               ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        Table([[Paragraph("  ARD CITY  ·  JOB DESCRIPTION", band_s)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),LGRAY),
                               ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        Spacer(1,0.1*inch),
    ]

# ── BUILD ──────────────────────────────────────────────────────────────
story = []

# COVER
story += [Spacer(1,0.6*inch), Paragraph("ARD CITY", COVER_T),
          Paragraph(safe(meta.get("planTitle","MASTER SALES PLAN")), COVER_S),
          Paragraph("SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS",
            ps("CSUB",fontSize=9,textColor=SLATE,fontName="Helvetica",alignment=1,characterSpacing=80)),
          gold_hr()]
for label, key in [("Development","development"),("Location","location"),("Prepared By","preparedBy"),
                   ("Date","date"),("Plan Period","planPeriod"),("Revenue Target","totalRevenue"),
                   ("Total Inventory","totalInventory"),("Launch Date","launchDate")]:
    if meta.get(key): story.append(Paragraph(f"{label}: {safe(meta[key])}", COVER_M))

# EXEC SUMMARY
story += [PageBreak(), Paragraph("Executive Summary", SECT_T), gold_hr()]
if summary: story += [Paragraph("AI Strategic Brief", AI_LBL)] + body_ps(summary) + [thin_hr()]
for label, key in [("Strategic Overview","executiveSummary"),("Market Context","marketContext"),
                   ("ARD City Positioning","ardCityPositioning"),("Sales Objectives","salesObjectives")]:
    story += lbl_block(label, meta.get(key,""))

# PLAN OVERVIEW
story += [PageBreak(), Paragraph("Plan Overview", SECT_T), gold_hr()]
story += info_table([("Project",meta.get("development","")),("Location",meta.get("location","")),
    ("Inventory",meta.get("totalInventory","")),("Revenue Target",meta.get("totalRevenue","")),
    ("Plan Duration",meta.get("planPeriod","")),("Launch Date",meta.get("launchDate","")),
    ("Regulatory",meta.get("regulatory","LDA/RERA"))])
for l,k in [("Product Mix","productMix"),("Pricing Overview","pricingOverview"),("Differentiators","keyDifferentiators")]:
    story += lbl_block(l, meta.get(k,""))

# TIMELINE & BUDGET
tl = fd.get("timeline",{}); bud = fd.get("budget",{})
story += [PageBreak(), Paragraph("Timeline & Budget", SECT_T), gold_hr()]
for l,k in [("Launch Date","launchDate"),("Phases","phases"),("Milestones","milestones"),
            ("Delivery Schedule","deliverySchedule"),("Review Cadence","reviewCadence")]:
    story += lbl_block(l, tl.get(k,""))
story += [Paragraph("Budget Allocation", SECT_T2)]
for l,k in [("Total Budget","totalBudget"),("By Vertical","breakdown"),
            ("Marketing","marketing"),("Events","events"),("Technology","technology"),
            ("Commissions","commissions"),("Contingency","contingency")]:
    story += lbl_block(l, bud.get(k,""))

# 5 VERTICALS
for vkey in ["b2g","b2c","b2b","channel","diaspora"]:
    vd = fd.get(vkey,{})
    story += vert_banner(vkey)
    vc = VERT_COLORS[vkey]; label, name = VERT_META[vkey]
    story += info_table([("Vertical",f"{label} — {name}"),("Objective",vd.get("objective","")),
        ("Target Segment",vd.get("targetSegment","")),("Revenue Target",vd.get("revenueTarget","")),
        ("Timeline",vd.get("timeline",""))])
    for l,k in [("Value Proposition","valueProp"),("Sales Approach","salesApproach"),
                ("Pricing & Payment","pricing"),("Lead Generation","leadGen"),
                ("Partnerships / MOUs","partnerships"),("Incentives","incentives"),
                ("KPIs & Targets","kpis"),("Risks","risks")]:
        story += lbl_block(l, vd.get(k,""), vc)

# EVENTS & MARKETING
ev = fd.get("events",{}); mkt = fd.get("marketing",{})
story += [PageBreak(), Paragraph("Events & Marketing Plan", SECT_T), gold_hr()]
for l,k in [("Grand Launch","launchEvent"),("Government Events","govtEvents"),("Corporate Events","corpEvents"),
            ("Dealer Meets","dealerMeets"),("Overseas Events","diasporaEvents"),
            ("On-Ground Activations","onGround"),("Digital Events","digital")]:
    story += lbl_block(l, ev.get(k,""))
story += [Paragraph("Integrated Marketing Plan", SECT_T2)]
for l,k in [("Brand Positioning","brand"),("Awareness","awareness"),("Lead Generation","leadGen"),
            ("Conversion","conversion"),("Digital Channels","digital"),("Traditional & OOH","traditional"),
            ("Overseas Marketing","overseas"),("Content & PR","content"),("Marketing KPIs","kpis")]:
    story += lbl_block(l, mkt.get(k,""))

# KPI FRAMEWORK
story += [PageBreak(), Paragraph("KPI Framework", SECT_T), gold_hr(),
          Paragraph("Key Performance Indicators linked to each vertical, role, and SMART goal. Track actuals weekly.", BODY)]
for cat, kpis in kpi_data.items():
    if not kpis: continue
    cat_color = KPI_CAT_COLORS.get(cat, NAVY)
    story += [Paragraph(KPI_CAT_LABELS.get(cat,cat.upper()), SECT_T2)]
    story += kpi_table(kpis, cat_color)

# SMART GOALS
story += [PageBreak(), Paragraph("SMART Goals by Role", SECT_T), gold_hr(),
          Paragraph("Each goal is Specific, Measurable, Achievable, Relevant, and Time-bound — cascading from Master Sales Plan targets.", BODY)]

for role_id, goals in smart_tpl.items():
    if not goals: continue
    role = next((r for r in roles if r["id"]==role_id), None)
    if not role: continue
    rc = ROLE_COLORS.get(role_id, NAVY)
    goal_title = ps(f"GT{role_id}",fontSize=13,textColor=rc,fontName="Times-Bold",spaceBefore=20,spaceAfter=4)
    story += [Paragraph(f"{role['title']}  [{role['band']}]", goal_title), thin_hr()]
    for i, g in enumerate(goals):
        gnum = ps(f"GN{role_id}{i}",fontSize=10,textColor=rc,fontName="Helvetica-Bold",spaceBefore=12,spaceAfter=3)
        story += [Paragraph(f"Goal {i+1}  [{g.get('category','')}]", gnum)]
        story += body_ps(g.get("goal",""))
        story += [Paragraph(f"Timeframe: {safe(g.get('timeframe',''))}", ITAL)]
        if g.get("linked_kpis"):
            story += [Paragraph(f"Linked KPIs: {' · '.join(g['linked_kpis'])}", MONO)]

# JOB DESCRIPTIONS
story += [PageBreak(), Paragraph("Job Descriptions", SECT_T), gold_hr(),
          Paragraph("All roles link directly to the KPI framework and SMART goals in this plan.", BODY)]

for role in roles:
    jd = jd_data.get(role["id"])
    if not jd: continue
    rc = ROLE_COLORS.get(role["id"], NAVY)
    story += jd_banner(role, rc)
    story += info_table([("Band / Level",role.get("band","")),("Vertical",role.get("vertical","").upper() if role.get("vertical")!="all" else "All Verticals")])
    story += [Paragraph(safe(jd.get("summary","")), ITAL)]
    resp_title = ps(f"RT{role['id']}",fontSize=10,textColor=rc,fontName="Helvetica-Bold",spaceBefore=12,spaceAfter=4,characterSpacing=30)
    story += [Paragraph("KEY RESPONSIBILITIES", resp_title)]
    for i,r in enumerate(jd.get("responsibilities",[])):
        story += [Paragraph(f"{i+1}.  {safe(r)}", BODY)]
    story += [Paragraph("REQUIREMENTS", resp_title)]
    for r in jd.get("requirements",[]):
        story += [Paragraph(f"•  {safe(r)}", BODY)]
    story += [Paragraph("LINKED KPIs & TARGETS", resp_title),
              Paragraph("  ·  ".join(jd.get("kpis",[])), MONO)]

# HEADER / FOOTER
def on_first(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GOLD); canvas.rect(0,0,letter[0],0.4*inch,fill=1,stroke=0)
    canvas.setFillColor(NAVY); canvas.rect(0,letter[1]-0.22*inch,letter[0],0.22*inch,fill=1,stroke=0)
    canvas.setFillColor(white); canvas.setFont("Helvetica",7)
    canvas.drawString(0.5*inch,0.15*inch,"CONFIDENTIAL")
    canvas.drawRightString(letter[0]-0.5*inch,0.15*inch,"ARD CITY  ·  SALES INTELLIGENCE PACKAGE")
    canvas.restoreState()

def on_later(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(1)
    canvas.line(0.6*inch,0.65*inch,letter[0]-0.6*inch,0.65*inch)
    canvas.setFont("Helvetica",7); canvas.setFillColor(SLATE)
    canvas.drawString(0.6*inch,0.44*inch,f"ARD City  ·  {safe(meta.get('planTitle','Sales Intelligence Plan'))}  ·  CONFIDENTIAL")
    canvas.drawRightString(letter[0]-0.6*inch,0.44*inch,f"Page {doc.page}")
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(0.5)
    canvas.line(0.6*inch,letter[1]-0.48*inch,letter[0]-0.6*inch,letter[1]-0.48*inch)
    canvas.setFont("Helvetica-Bold",7); canvas.setFillColor(NAVY)
    canvas.drawString(0.6*inch,letter[1]-0.37*inch,"ARD CITY")
    canvas.setFont("Helvetica",7); canvas.setFillColor(SLATE)
    canvas.drawRightString(letter[0]-0.6*inch,letter[1]-0.37*inch,safe(meta.get("preparedBy","")))
    canvas.restoreState()

doc_pdf = SimpleDocTemplate(out, pagesize=letter,
    rightMargin=0.75*inch, leftMargin=0.75*inch,
    topMargin=0.65*inch, bottomMargin=0.85*inch,
    title=f"ARD City — {meta.get('planTitle','Sales Intelligence Plan')}",
    author=meta.get("preparedBy",""))
doc_pdf.build(story, onFirstPage=on_first, onLaterPages=on_later)
print(json.dumps({"success":True,"path":out}))
