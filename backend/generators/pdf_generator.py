#!/usr/bin/env python3
"""
ARD City Sales Intelligence — Dynamic PDF Generator
Accepts full plan JSON from stdin, writes PDF to output_path
"""
import sys, json, os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    HRFlowable, Table, TableStyle, KeepTogether)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.utils import ImageReader
from PIL import Image

data = json.load(sys.stdin)
fd         = data.get("formData", {})
sections   = data.get("sections", [])
verticals  = data.get("verticals", [])
vert_fields= data.get("vertFields", [])
kpi_cats   = data.get("kpiCats", [])
roles      = data.get("roles", [])
goal_status= data.get("goalStatus", {})
goal_notes = data.get("goalNotes", {})
summary    = data.get("summary", "")
out        = data.get("output_path", "/tmp/ard_plan.pdf")

# ── LOAD LOGO ─────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
logo_path = os.path.join(script_dir, "public", "LogoDark.png")
logo_img = None
logo_width, logo_height = 0, 0
try:
    if os.path.exists(logo_path):
        pil_img = Image.open(logo_path)
        logo_width, logo_height = pil_img.size
        # Resize for header (smaller)
        logo_img_header = ImageReader(logo_path)
        # Resize for cover (larger)
        logo_img_cover = ImageReader(logo_path)
        logo_img = True
except Exception as e:
    print(f"Warning: Logo not found at {logo_path}: {e}", file=sys.stderr)

# ── HELPERS ─────────────────────────────────────────────────────────────────
def hx(c): return HexColor(c if c.startswith("#") else "#"+c)

def safehx(c, fallback="#1A3A6B"):
    try: return hx(c)
    except: return hx(fallback)

GOLD   = hx("#B8912A"); GOLD2  = hx("#D4A843")
NAVY   = hx("#0D1F3C"); MIDBLUE= hx("#1A3A6B")
STEEL  = hx("#2C5282"); SLATE  = hx("#4A5568")
LGRAY  = hx("#EEF2F8"); DGRAY  = hx("#2D2D2D")
WHITE  = white

ss = getSampleStyleSheet()
def ps(name, **kw): return ParagraphStyle(name, parent=ss["Normal"], **kw)

COVER_T = ps("CT", fontSize=36,textColor=NAVY,  fontName="Times-Bold",  alignment=1,spaceAfter=8,spaceBefore=60)
COVER_S = ps("CS", fontSize=16,textColor=GOLD,  fontName="Times-Roman", alignment=1,spaceAfter=4)
COVER_M = ps("CM", fontSize=9, textColor=SLATE, fontName="Helvetica",   alignment=1,spaceAfter=3)
SECT_T  = ps("ST", fontSize=18,textColor=NAVY,  fontName="Times-Bold",  spaceBefore=20,spaceAfter=6)
SECT_T2 = ps("S2", fontSize=13,textColor=MIDBLUE,fontName="Times-Bold", spaceBefore=14,spaceAfter=4)
LABEL   = ps("LB", fontSize=10,textColor=MIDBLUE,fontName="Helvetica-Bold",spaceBefore=11,spaceAfter=3)
BODY    = ps("BO", fontSize=10,textColor=DGRAY,  fontName="Times-Roman",spaceBefore=2,spaceAfter=4,leftIndent=14,leading=15)
ITAL    = ps("IT", fontSize=10,textColor=SLATE,  fontName="Times-Italic",spaceBefore=2,spaceAfter=4,leftIndent=16,leading=15)
MONO    = ps("MO", fontSize=9, textColor=STEEL,  fontName="Helvetica",  spaceBefore=2,spaceAfter=4)
AI_LBL  = ps("AL", fontSize=9, textColor=GOLD,   fontName="Helvetica-Oblique",spaceBefore=6,spaceAfter=4)
TBL_H   = ps("TH", fontSize=9, textColor=DGRAY,  fontName="Helvetica-Bold",leading=12)
TBL_B   = ps("TB", fontSize=9, textColor=DGRAY,  fontName="Times-Roman",leading=13)
KPI_H   = ps("KH", fontSize=8, textColor=WHITE,  fontName="Helvetica-Bold",leading=11)
KPI_B   = ps("KB", fontSize=9, textColor=DGRAY,  fontName="Times-Roman",leading=12)

def safe(t): return str(t or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def gold_hr(): return HRFlowable(width="100%",thickness=2,color=GOLD,spaceAfter=8,spaceBefore=4)
def thin_hr(): return HRFlowable(width="100%",thickness=0.5,color=hx("#CCCCCC"),spaceAfter=6,spaceBefore=6)

def body_ps(text, indent=14, style=None):
    if not text or not str(text).strip(): return []
    s = style or ps(f"B{id(text)%9999}",fontSize=10,textColor=DGRAY,fontName="Times-Roman",
                    spaceBefore=2,spaceAfter=4,leftIndent=indent,leading=15)
    return [Paragraph(safe(ln.strip()), s) for ln in str(text).strip().split("\n") if ln.strip()]

def lbl_block(label, value, color=STEEL):
    if not value or not str(value).strip(): return []
    s = ps(f"L{abs(hash(label))%9999}",fontSize=10,textColor=color,fontName="Helvetica-Bold",
           spaceBefore=11,spaceAfter=3)
    return [Paragraph(f"▸  {safe(label)}", s)] + body_ps(value)

def info_table(rows):
    filtered = [(l,v) for l,v in rows if v and str(v).strip()]
    if not filtered: return []
    tdata = [[Paragraph(safe(l),TBL_H), Paragraph(safe(v),TBL_B)] for l,v in filtered]
    t = Table(tdata, colWidths=[1.9*inch, 5.3*inch])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[LGRAY,hx("#F7F9FC")]),
        ("GRID",(0,0),(-1,-1),0.5,hx("#DDDDDD")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),
    ]))
    return [t, Spacer(1,0.07*inch)]

def kpi_table(kpis, hdr_color=NAVY):
    if not kpis: return []
    rows = [[Paragraph(h, KPI_H) for h in ["KPI","Target","Unit","Freq","Vertical"]]]
    for k in kpis:
        vert = "All" if k.get("vertical")=="all" else str(k.get("vertical","")).upper()
        rows.append([Paragraph(safe(k.get("label","")),KPI_B),
                     Paragraph(safe(k.get("target","")),KPI_B),
                     Paragraph(safe(k.get("unit","")),KPI_B),
                     Paragraph(safe(k.get("freq","")),KPI_B),
                     Paragraph(safe(vert),KPI_B)])
    t = Table(rows, colWidths=[2.3*inch,1.0*inch,0.75*inch,1.0*inch,1.15*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),hdr_color),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[hx("#FAFAFA"),LGRAY]),
        ("GRID",(0,0),(-1,-1),0.5,hx("#DDDDDD")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
    ]))
    return [t, Spacer(1,0.08*inch)]

def vert_banner(v):
    vc = safehx(v.get("color","#1A3A6B"))
    bt = ps(f"VT{v.get('id','')}",fontSize=14,textColor=WHITE,fontName="Times-Bold")
    bg = ps(f"VG{v.get('id','')}",fontSize=8, textColor=NAVY, fontName="Helvetica-Bold",characterSpacing=60)
    return [
        PageBreak(),
        Table([[Paragraph(f"  {v.get('label','')}  ·  {v.get('fullName','')}", bt)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),vc),
                               ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        Table([[Paragraph("  ARD CITY  ·  SALES VERTICAL PLAN", bg)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),GOLD2),
                               ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        thin_hr(),
    ]

def role_banner(role):
    rc = safehx(role.get("color","#1A3A6B"))
    ts = ps(f"RT{role.get('id','')}",fontSize=13,textColor=WHITE,fontName="Times-Bold")
    bs = ps(f"RB{role.get('id','')}",fontSize=8, textColor=NAVY, fontName="Helvetica-Bold",characterSpacing=60)
    vert_str = "All Verticals" if role.get("vertical")=="all" else str(role.get("vertical","")).upper()
    return [
        PageBreak(),
        Table([[Paragraph(f"  {role.get('title','')}  ·  {role.get('band','')}", ts)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),rc),
                               ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        Table([[Paragraph(f"  ARD CITY  ·  JOB DESCRIPTION  ·  {vert_str}", bs)]],
              colWidths=[7.2*inch],
              style=TableStyle([("BACKGROUND",(0,0),(-1,-1),LGRAY),
                               ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
                               ("LEFTPADDING",(0,0),(-1,-1),12)])),
        Spacer(1,0.08*inch),
    ]

# ── GET META VALUES ──────────────────────────────────────────────────────────
def get_meta_val(field_label_contains):
    sec = next((s for s in sections if s.get("id")=="meta"), None)
    if not sec: return fd.get("meta",{}).get(field_label_contains.lower().replace(" ","_"),"")
    f = next((f for f in sec.get("fields",[]) if field_label_contains.lower() in f.get("label","").lower()), None)
    if not f: return ""
    return (fd.get("meta") or {}).get(f.get("id",""), "")

dev_name    = get_meta_val("Development") or "ARD City"
plan_title  = get_meta_val("Plan Title") or "MASTER SALES PLAN"
prepared_by = get_meta_val("Prepared") or ""
plan_date   = get_meta_val("Date") or ""
rev_target  = get_meta_val("Revenue") or ""
inventory   = get_meta_val("Inventory") or ""
launch_date = get_meta_val("Launch") or ""
plan_period = get_meta_val("Period") or ""

# ── BUILD STORY ──────────────────────────────────────────────────────────────
story = []

# COVER - Use logo instead of "ARD CITY" text
from reportlab.platypus import Image
if logo_img:
    # Calculate aspect ratio for cover logo (approx 2.5 inches wide)
    cover_logo_width = 2.5 * inch
    cover_logo_height = (logo_height / logo_width) * cover_logo_width
    story += [Spacer(1,0.4*inch), Image(logo_path, width=cover_logo_width, height=cover_logo_height, hAlign="CENTER"),
              Paragraph(safe(plan_title), COVER_S),
              Paragraph("SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS",
                ps("CSUB",fontSize=9,textColor=SLATE,fontName="Helvetica",alignment=1,characterSpacing=80)),
              gold_hr()]
else:
    story += [Spacer(1,0.6*inch), Paragraph(dev_name.upper(), COVER_T),
              Paragraph(safe(plan_title), COVER_S),
              Paragraph("SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS",
                ps("CSUB",fontSize=9,textColor=SLATE,fontName="Helvetica",alignment=1,characterSpacing=80)),
              gold_hr()]
for label, val in [("Development",dev_name),("Prepared By",prepared_by),("Date",plan_date),
                   ("Revenue Target",rev_target),("Inventory",inventory),
                   ("Launch Date",launch_date),("Plan Period",plan_period)]:
    if val: story.append(Paragraph(f"{label}: {safe(val)}", COVER_M))

# EXECUTIVE SUMMARY
story += [PageBreak(), Paragraph("Executive Summary", SECT_T), gold_hr()]
if summary:
    story += [Paragraph("AI Strategic Intelligence Brief", AI_LBL)] + body_ps(summary) + [thin_hr()]

# DYNAMIC CORE SECTIONS
for sec in sections:
    sec_data = fd.get(sec.get("id",""), {})
    has_content = any(sec_data.get(f.get("id",""),"").strip() for f in sec.get("fields",[]))
    if not has_content: continue
    story += [PageBreak(), Paragraph(safe(sec.get("label","")), SECT_T), gold_hr()]
    for f in sec.get("fields",[]):
        val = sec_data.get(f.get("id",""), "")
        if val and val.strip():
            story += lbl_block(f.get("label",""), val)

# DYNAMIC VERTICALS
for v in verticals:
    vd = fd.get(v.get("id",""), {})
    if not any(vd.get(f.get("id",""),"").strip() for f in vert_fields): continue
    story += vert_banner(v)
    vc = safehx(v.get("color","#1A3A6B"))
    story += info_table([(f.get("label",""), vd.get(f.get("id",""),"")) for f in vert_fields[:4]])
    for f in vert_fields[4:]:
        val = vd.get(f.get("id",""), "")
        if val and val.strip():
            story += lbl_block(f.get("label",""), val, vc)

# KPI FRAMEWORK
story += [PageBreak(), Paragraph("KPI Framework", SECT_T), gold_hr(),
          Paragraph("Key Performance Indicators linked to each vertical, role, and SMART goal.", BODY)]
for cat in kpi_cats:
    if not cat.get("kpis"): continue
    cat_color = safehx(cat.get("color","#1A3A6B"))
    story += [Paragraph(f"{cat.get('icon','')} {safe(cat.get('label',''))}", SECT_T2)]
    story += kpi_table(cat.get("kpis",[]), cat_color)

# SMART GOALS
story += [PageBreak(), Paragraph("SMART Goals by Role", SECT_T), gold_hr()]
STATUS_COLORS = {"pending":"#888888","in_progress":"#2A80D0","achieved":"#3DA863","at_risk":"#C44030"}
for role in roles:
    goals = role.get("goals",[])
    if not goals: continue
    rc = safehx(role.get("color","#1A3A6B"))
    gt = ps(f"GT{role.get('id','')}",fontSize=13,textColor=rc,fontName="Times-Bold",spaceBefore=18,spaceAfter=4)
    story += [Paragraph(f"{safe(role.get('title',''))}  [{safe(role.get('band',''))}]", gt), thin_hr()]
    for i, g in enumerate(goals):
        key = f"{role.get('id','')}_{i}"
        status = goal_status.get(key,"pending")
        note   = goal_notes.get(key,"")
        sc = hx(STATUS_COLORS.get(status,"#888888"))
        gn_s = ps(f"GN{i}",fontSize=10,textColor=rc,fontName="Helvetica-Bold",spaceBefore=11,spaceAfter=3)
        st_s = ps(f"ST{i}",fontSize=9, textColor=sc, fontName="Helvetica-Oblique",spaceBefore=2,spaceAfter=3)
        story += [Paragraph(f"Goal {i+1}  [{safe(g.get('category','General'))}]", gn_s)]
        story += body_ps(g.get("goal",""))
        story += [Paragraph(f"Timeframe: {safe(g.get('timeframe','TBD'))}  ·  Status: {status.replace('_',' ').title()}", st_s)]
        if g.get("linked_kpis"):
            story += [Paragraph(f"Linked KPIs: {' · '.join(g['linked_kpis'])}", MONO)]
        if note and note.strip():
            story += [Paragraph(f"Note: {safe(note.strip())}", ITAL)]

# JOB DESCRIPTIONS
story += [PageBreak(), Paragraph("Job Descriptions", SECT_T), gold_hr()]
for role in roles:
    story += role_banner(role)
    rc = safehx(role.get("color","#1A3A6B"))
    story += info_table([("Band / Level",role.get("band","")),
                         ("Vertical","All Verticals" if role.get("vertical")=="all" else str(role.get("vertical","")).upper())])
    if role.get("summary"):
        story += [Paragraph(safe(role["summary"]), ITAL)]
    rsp_s = ps(f"RS{role.get('id','')}",fontSize=10,textColor=rc,fontName="Helvetica-Bold",
               spaceBefore=11,spaceAfter=4,characterSpacing=30)
    if role.get("responsibilities"):
        story += [Paragraph("KEY RESPONSIBILITIES", rsp_s)]
        for i,r in enumerate(role["responsibilities"]):
            story += [Paragraph(f"{i+1}.  {safe(r)}", BODY)]
    if role.get("requirements"):
        story += [Paragraph("REQUIREMENTS", rsp_s)]
        for r in role["requirements"]:
            story += [Paragraph(f"•  {safe(r)}", BODY)]
    if role.get("kpis"):
        story += [Paragraph("LINKED KPIs", rsp_s), Paragraph("  ·  ".join(role["kpis"]), MONO)]

# ── HEADER / FOOTER ──────────────────────────────────────────────────────────
def on_first(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GOLD); canvas.rect(0,0,letter[0],0.42*inch,fill=1,stroke=0)
    canvas.setFillColor(NAVY); canvas.rect(0,letter[1]-0.22*inch,letter[0],0.22*inch,fill=1,stroke=0)
    canvas.setFillColor(white); canvas.setFont("Helvetica",7)
    canvas.drawString(0.5*inch,0.15*inch,"CONFIDENTIAL")
    # Use logo in footer instead of "ARD CITY" text
    if logo_img:
        footer_logo_width = 0.8 * inch
        footer_logo_height = (logo_height / logo_width) * footer_logo_width
        canvas.drawImage(logo_path, letter[0]-0.5*inch-footer_logo_width, 0.12*inch,
                      width=footer_logo_width, height=footer_logo_height, mask='auto')
    else:
        canvas.drawRightString(letter[0]-0.5*inch,0.15*inch,f"{dev_name.upper()}  ·  SALES INTELLIGENCE PACKAGE")
    canvas.restoreState()

def on_later(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(1)
    canvas.line(0.6*inch,0.62*inch,letter[0]-0.6*inch,0.62*inch)
    canvas.setFont("Helvetica",7); canvas.setFillColor(SLATE)
    canvas.drawString(0.6*inch,0.42*inch,f"{safe(plan_title)}  ·  CONFIDENTIAL")
    canvas.drawRightString(letter[0]-0.6*inch,0.42*inch,f"Page {doc.page}")
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(0.5)
    canvas.line(0.6*inch,letter[1]-0.47*inch,letter[0]-0.6*inch,letter[1]-0.47*inch)
    # Use logo in header instead of "ARD CITY" text
    if logo_img:
        header_logo_width = 1.2 * inch
        header_logo_height = (logo_height / logo_width) * header_logo_width
        canvas.drawImage(logo_path, 0.6*inch, letter[1]-0.42*inch-header_logo_height,
                      width=header_logo_width, height=header_logo_height, mask='auto')
    else:
        canvas.setFont("Helvetica-Bold",7); canvas.setFillColor(NAVY)
        canvas.drawString(0.6*inch,letter[1]-0.36*inch,dev_name.upper())
    canvas.setFont("Helvetica",7); canvas.setFillColor(SLATE)
    canvas.drawRightString(letter[0]-0.6*inch,letter[1]-0.36*inch,safe(prepared_by))
    canvas.restoreState()

import io as _io
_buf = _io.BytesIO()
doc_pdf = SimpleDocTemplate(_buf, pagesize=letter,
    rightMargin=0.75*inch, leftMargin=0.75*inch,
    topMargin=0.62*inch, bottomMargin=0.82*inch,
    title=f"{dev_name} — {plan_title}", author=prepared_by)
doc_pdf.build(story, onFirstPage=on_first, onLaterPages=on_later)
sys.stdout.buffer.write(_buf.getvalue())
