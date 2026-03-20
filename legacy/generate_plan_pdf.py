#!/usr/bin/env python3
import sys, json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import KeepTogether

data = json.load(sys.stdin)
formData = data.get("formData", {})
summary = data.get("summary", "")
output_path = data.get("output_path", "/tmp/sales_plan_output.pdf")

meta = formData.get("meta", {})
pr = formData.get("productRelease", {})
tl = formData.get("timeline", {})
bud = formData.get("budget", {})
ev = formData.get("events", {})
mkt = formData.get("marketing", {})

GOLD = HexColor("#C9A84C")
DARK_BLUE = HexColor("#1E3A5F")
MID_BLUE = HexColor("#2E5090")
GRAY = HexColor("#555555")
LIGHT_GRAY = HexColor("#F5F5F5")
DARK_GRAY = HexColor("#333333")

styles = getSampleStyleSheet()

TITLE_STYLE = ParagraphStyle("PlanTitle", parent=styles["Normal"],
    fontSize=28, textColor=DARK_BLUE, fontName="Helvetica-Bold",
    spaceAfter=12, spaceBefore=60, alignment=1)

SUBTITLE_STYLE = ParagraphStyle("PlanSubtitle", parent=styles["Normal"],
    fontSize=14, textColor=GOLD, fontName="Helvetica",
    spaceAfter=6, alignment=1)

META_STYLE = ParagraphStyle("Meta", parent=styles["Normal"],
    fontSize=10, textColor=GRAY, fontName="Helvetica",
    spaceAfter=4, alignment=1)

SECTION_TITLE = ParagraphStyle("SectionTitle", parent=styles["Normal"],
    fontSize=18, textColor=DARK_BLUE, fontName="Helvetica-Bold",
    spaceBefore=24, spaceAfter=8)

LABEL_STYLE = ParagraphStyle("Label", parent=styles["Normal"],
    fontSize=11, textColor=MID_BLUE, fontName="Helvetica-Bold",
    spaceBefore=14, spaceAfter=4)

BODY_STYLE = ParagraphStyle("Body", parent=styles["Normal"],
    fontSize=10, textColor=DARK_GRAY, fontName="Helvetica",
    spaceBefore=2, spaceAfter=4, leftIndent=14, leading=15)

AI_NOTE = ParagraphStyle("AiNote", parent=styles["Normal"],
    fontSize=9, textColor=GOLD, fontName="Helvetica-Oblique",
    spaceBefore=6, spaceAfter=6)

story = []

def gold_line():
    return HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=8, spaceBefore=4)

def gray_line():
    return HRFlowable(width="100%", thickness=0.5, color=HexColor("#CCCCCC"), spaceAfter=6, spaceBefore=6)

def labeled_block(label, value):
    if not value or not value.strip():
        return []
    items = []
    items.append(Paragraph(label, LABEL_STYLE))
    for line in value.strip().split("\n"):
        if line.strip():
            safe_line = line.strip().replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            items.append(Paragraph(safe_line, BODY_STYLE))
    return items

def section_header(icon, title):
    items = [
        Spacer(1, 0.2 * inch),
        Paragraph(f"{icon}  {title.upper()}", SECTION_TITLE),
        gold_line(),
    ]
    return items

# ── COVER PAGE ──
story.append(Spacer(1, 1.5 * inch))
story.append(Paragraph(meta.get("planTitle") or "MASTER SALES PLAN", TITLE_STYLE))
story.append(Paragraph(meta.get("projectName") or "", SUBTITLE_STYLE))
story.append(gold_line())
if meta.get("preparedBy"):
    story.append(Paragraph(f"Prepared by: {meta['preparedBy']}", META_STYLE))
line2_parts = []
if meta.get("date"): line2_parts.append(f"Date: {meta['date']}")
if meta.get("targetRevenue"): line2_parts.append(f"Target Revenue: {meta['targetRevenue']}")
if line2_parts:
    story.append(Paragraph("   |   ".join(line2_parts), META_STYLE))

# ── EXECUTIVE SUMMARY ──
if summary or meta.get("planSummary"):
    story.append(PageBreak())
    story.extend(section_header("◈", "Executive Summary"))
    if summary:
        story.append(Paragraph("AI-Generated Strategic Summary", AI_NOTE))
        story.append(Paragraph(summary.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;"), BODY_STYLE))
    if meta.get("planSummary"):
        story.extend(labeled_block("Strategic Overview", meta.get("planSummary")))

# ── PRODUCT RELEASE ORDER ──
story.append(PageBreak())
story.extend(section_header("①", "Product Release Order"))
for label, key in [("Products & Assets", "products"), ("Sequencing Rationale", "sequencingRationale"),
                   ("Market Absorption Strategy", "absorptionStrategy"), ("Pricing Structure", "pricingStructure")]:
    story.extend(labeled_block(label, pr.get(key, "")))

# ── TIMELINE ──
story.append(PageBreak())
story.extend(section_header("◷", "Timeline & Execution Phases"))
for label, key in [("Official Launch Date", "launchDate"), ("Execution Phases", "phases"),
                   ("Key Milestones", "milestones"), ("Delivery & Handover Schedule", "deliverySchedule")]:
    story.extend(labeled_block(label, tl.get(key, "")))

# ── BUDGET ──
story.append(PageBreak())
story.extend(section_header("₿", "Budget Allocation"))
for label, key in [("Total Budget", "totalBudget"), ("Marketing Allocation", "marketingBudget"),
                   ("Events Allocation", "eventsBudget"), ("Technology & CRM", "technologyBudget"),
                   ("Commission Structure", "commissions"), ("Contingency Reserve", "contingency")]:
    story.extend(labeled_block(label, bud.get(key, "")))

# ── EVENTS ──
story.append(PageBreak())
story.extend(section_header("◉", "Events Strategy"))
for label, key in [("Grand Launch Event", "launchEvent"), ("Dealer & Agent Meets", "dealerMeets"),
                   ("Investor / HNI Sessions", "investorSessions"), ("On-Ground Activations", "activations"),
                   ("Digital & Virtual Events", "digitalEvents")]:
    story.extend(labeled_block(label, ev.get(key, "")))

# ── MARKETING PLAN ──
story.append(PageBreak())
story.extend(section_header("◬", "Marketing Plan"))
for label, key in [("Target Audience Segments", "targetAudience"), ("Awareness Phase – Top of Funnel", "awareness"),
                   ("Lead Generation – Mid Funnel", "leadGen"), ("Conversion Strategy – Bottom Funnel", "conversion"),
                   ("Retention & Referral", "retention"), ("Overall Marketing KPIs", "kpis")]:
    story.extend(labeled_block(label, mkt.get(key, "")))

def first_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GOLD)
    canvas.rect(0, 0, letter[0], 0.4*inch, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(0.75*inch, 0.15*inch, "CONFIDENTIAL")
    canvas.drawRightString(letter[0]-0.75*inch, 0.15*inch, meta.get("planTitle","Master Sales Plan"))
    canvas.restoreState()

def later_pages(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1)
    canvas.line(0.75*inch, 0.55*inch, letter[0]-0.75*inch, 0.55*inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(0.75*inch, 0.35*inch, f"Confidential  |  {meta.get('preparedBy','')}")
    canvas.drawRightString(letter[0]-0.75*inch, 0.35*inch, f"Page {doc.page}")
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(HexColor("#AAAAAA"))
    canvas.drawCentredString(letter[0]/2, letter[1]-0.4*inch, f"{meta.get('planTitle','')}  |  {meta.get('projectName','')}")
    canvas.restoreState()

doc_pdf = SimpleDocTemplate(
    output_path, pagesize=letter,
    rightMargin=0.9*inch, leftMargin=0.9*inch,
    topMargin=0.75*inch, bottomMargin=0.85*inch,
    title=meta.get("planTitle","Master Sales Plan"),
    author=meta.get("preparedBy",""),
)
doc_pdf.build(story, onFirstPage=first_page, onLaterPages=later_pages)
print(json.dumps({"success": True, "path": output_path}))
