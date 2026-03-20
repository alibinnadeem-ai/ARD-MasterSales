const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat, Header, Footer, TabStopType, TabStopPosition,
} = require("docx");
const fs = require("fs");

// Read plan data from stdin
let input = "";
process.stdin.on("data", d => input += d);
process.stdin.on("end", () => {
  const { formData, summary } = JSON.parse(input);
  generateDocx(formData, summary);
});

const GOLD = "C9A84C";
const DARK = "0A0D14";
const MIDBLUE = "1E2A40";

function heading1(text, color = "1E3A5F") {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 6 } },
    children: [new TextRun({ text, bold: true, size: 30, color, font: "Arial" })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: "2E5090", font: "Arial" })],
  });
}

function body(text, options = {}) {
  if (!text?.trim()) return null;
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [new TextRun({ text: text.trim(), size: 22, font: "Arial", color: "2D2D2D", ...options })],
  });
}

function labeledBlock(label, value) {
  if (!value?.trim()) return [];
  const lines = value.trim().split("\n").filter(l => l.trim());
  return [
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [new TextRun({ text: label, bold: true, size: 22, color: "1E3A5F", font: "Arial" })],
    }),
    ...lines.map(line => new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: { left: 360 },
      children: [new TextRun({ text: line, size: 21, font: "Arial", color: "333333" })],
    })),
  ];
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 1 } },
    children: [],
  });
}

function sectionCover(icon, title, color = "1E3A5F") {
  return [
    new Paragraph({ spacing: { before: 480, after: 120 }, alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: `${icon}  ${title.toUpperCase()}`, bold: true, size: 36, color, font: "Arial", allCaps: false })],
    }),
    divider(),
  ];
}

async function generateDocx(formData, summary) {
  const meta = formData.meta || {};
  const pr = formData.productRelease || {};
  const tl = formData.timeline || {};
  const bud = formData.budget || {};
  const ev = formData.events || {};
  const mkt = formData.marketing || {};

  const children = [];

  // ── COVER PAGE ──
  children.push(
    new Paragraph({ spacing: { before: 1440 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: meta.planTitle || "MASTER SALES PLAN", bold: true, size: 56, color: "1E3A5F", font: "Arial" })],
    }),
    new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: meta.projectName || "", size: 28, color: GOLD, font: "Arial" })],
    }),
    new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: GOLD, space: 6 } },
      children: [],
    }),
    new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Prepared by: ${meta.preparedBy || ""}`, size: 22, color: "555555", font: "Arial" })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Date: ${meta.date || ""}   |   Target Revenue: ${meta.targetRevenue || ""}`, size: 22, color: "555555", font: "Arial" })],
    }),
  );

  // ── EXECUTIVE SUMMARY ──
  if (summary || meta.planSummary) {
    children.push(new Paragraph({ pageBreakBefore: true }));
    children.push(...sectionCover("◈", "Executive Summary"));
    if (summary) {
      children.push(new Paragraph({ spacing: { before: 120, after: 160 },
        children: [new TextRun({ text: "AI-Generated Summary", bold: true, italics: true, size: 20, color: GOLD, font: "Arial" })],
      }));
      children.push(body(summary));
    }
    if (meta.planSummary) {
      children.push(new Paragraph({ spacing: { before: 200 } }));
      children.push(...labeledBlock("Strategic Overview", meta.planSummary));
    }
  }

  // ── PRODUCT RELEASE ORDER ──
  children.push(new Paragraph({ pageBreakBefore: true }));
  children.push(...sectionCover("①", "Product Release Order", "2E6B45"));
  if (pr.products) children.push(...labeledBlock("Products & Assets (In Release Order)", pr.products));
  if (pr.sequencingRationale) children.push(...labeledBlock("Sequencing Rationale", pr.sequencingRationale));
  if (pr.absorptionStrategy) children.push(...labeledBlock("Market Absorption Strategy", pr.absorptionStrategy));
  if (pr.pricingStructure) children.push(...labeledBlock("Pricing Structure per Phase", pr.pricingStructure));

  // ── TIMELINE ──
  children.push(new Paragraph({ pageBreakBefore: true }));
  children.push(...sectionCover("◷", "Timeline & Execution Phases", "2A4E8F"));
  if (tl.launchDate) children.push(...labeledBlock("Official Launch Date", tl.launchDate));
  if (tl.phases) children.push(...labeledBlock("Execution Phases", tl.phases));
  if (tl.milestones) children.push(...labeledBlock("Key Milestones", tl.milestones));
  if (tl.deliverySchedule) children.push(...labeledBlock("Delivery & Handover Schedule", tl.deliverySchedule));

  // ── BUDGET ──
  children.push(new Paragraph({ pageBreakBefore: true }));
  children.push(...sectionCover("₿", "Budget Allocation", "8C4A1A"));
  if (bud.totalBudget) children.push(...labeledBlock("Total Budget", bud.totalBudget));
  if (bud.marketingBudget) children.push(...labeledBlock("Marketing Allocation", bud.marketingBudget));
  if (bud.eventsBudget) children.push(...labeledBlock("Events Allocation", bud.eventsBudget));
  if (bud.technologyBudget) children.push(...labeledBlock("Technology & CRM", bud.technologyBudget));
  if (bud.commissions) children.push(...labeledBlock("Commission Structure", bud.commissions));
  if (bud.contingency) children.push(...labeledBlock("Contingency Reserve", bud.contingency));

  // ── EVENTS ──
  children.push(new Paragraph({ pageBreakBefore: true }));
  children.push(...sectionCover("◉", "Events Strategy", "5A2E8A"));
  if (ev.launchEvent) children.push(...labeledBlock("Grand Launch Event", ev.launchEvent));
  if (ev.dealerMeets) children.push(...labeledBlock("Dealer & Agent Meets", ev.dealerMeets));
  if (ev.investorSessions) children.push(...labeledBlock("Investor / HNI Sessions", ev.investorSessions));
  if (ev.activations) children.push(...labeledBlock("On-Ground Activations", ev.activations));
  if (ev.digitalEvents) children.push(...labeledBlock("Digital & Virtual Events", ev.digitalEvents));

  // ── MARKETING ──
  children.push(new Paragraph({ pageBreakBefore: true }));
  children.push(...sectionCover("◬", "Marketing Plan", "7A1E2E"));
  if (mkt.targetAudience) children.push(...labeledBlock("Target Audience Segments", mkt.targetAudience));
  if (mkt.awareness) children.push(...labeledBlock("Awareness Phase – Top of Funnel", mkt.awareness));
  if (mkt.leadGen) children.push(...labeledBlock("Lead Generation – Mid Funnel", mkt.leadGen));
  if (mkt.conversion) children.push(...labeledBlock("Conversion Strategy – Bottom Funnel", mkt.conversion));
  if (mkt.retention) children.push(...labeledBlock("Retention & Referral", mkt.retention));
  if (mkt.kpis) children.push(...labeledBlock("Overall Marketing KPIs", mkt.kpis));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: "Arial", color: "1E3A5F" },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: "2E5090" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1296, bottom: 1440, left: 1296 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 4 } },
            children: [
              new TextRun({ text: meta.planTitle || "Master Sales Plan", bold: true, size: 18, color: "1E3A5F", font: "Arial" }),
              new TextRun({ text: `  |  ${meta.projectName || ""}`, size: 18, color: "888888", font: "Arial" }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
            children: [
              new TextRun({ text: "Confidential  |  ", size: 16, color: "888888", font: "Arial" }),
              new TextRun({ text: meta.preparedBy || "", size: 16, color: "888888", font: "Arial" }),
            ],
          })],
        }),
      },
      children: children.filter(Boolean),
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/tmp/sales_plan_output.docx", buffer);
  process.stdout.write(JSON.stringify({ success: true, path: "/tmp/sales_plan_output.docx" }));
}
