import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  Header, Footer,
} from "docx";

// ── PALETTE ──────────────────────────────────────────────────────────
const GOLD   = "B8912A";
const NAVY   = "0D1F3C";
const STEEL  = "2C5282";
const SLATE  = "4A5568";
const DGRAY  = "2D2D2D";
const WHITE  = "FFFFFF";

// ── HELPERS ───────────────────────────────────────────────────────────
const sp  = (b = 0, a = 0) => ({ spacing: { before: b, after: a } });
const brd = (c = "DDDDDD", sz = 1) => ({ style: BorderStyle.SINGLE, size: sz, color: c });
const allBorders = (c = "DDDDDD") => ({ top: brd(c), bottom: brd(c), left: brd(c), right: brd(c) });

function goldRule() {
  return new Paragraph({
    ...sp(160, 80),
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 4 } },
    children: [],
  });
}

function thinRule() {
  return new Paragraph({
    ...sp(80, 80),
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 2 } },
    children: [],
  });
}

function H1(text, color = NAVY) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    ...sp(400, 160),
    children: [new TextRun({ text, bold: true, size: 32, color, font: "Garamond" })],
  });
}

function H2(text, color = STEEL) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    ...sp(240, 100),
    children: [new TextRun({ text, bold: true, size: 24, color, font: "Garamond" })],
  });
}

function H3(text, color = SLATE) {
  return new Paragraph({
    ...sp(180, 60),
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 17, color, font: "Arial", characterSpacing: 40 })],
  });
}

function bodyLines(text, indent = 0) {
  if (!text?.trim()) return [];
  return text.trim().split("\n").filter(l => l.trim()).map(line =>
    new Paragraph({
      ...sp(40, 50),
      indent: indent ? { left: indent } : undefined,
      children: [new TextRun({ text: line.trim(), size: 21, font: "Garamond", color: DGRAY })],
    })
  );
}

function labelBlock(label, value, color = STEEL) {
  if (!value?.trim()) return [];
  return [
    new Paragraph({
      ...sp(160, 50),
      children: [
        new TextRun({ text: "▸  ", size: 19, color, font: "Arial" }),
        new TextRun({ text: label, bold: true, size: 20, color, font: "Arial" }),
      ],
    }),
    ...bodyLines(value, 320),
  ];
}

function infoTable(rows, colW = [2800, 6200]) {
  const filtered = rows.filter(([, v]) => v?.trim?.());
  if (!filtered.length) return [];
  const b = allBorders("DDDDDD");
  return [
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: colW,
      rows: filtered.map(([lbl, val], i) =>
        new TableRow({
          children: [
            new TableCell({
              borders: b,
              width: { size: colW[0], type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? "EEF2F8" : "F5F7FB", type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 140, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: lbl, bold: true, size: 19, font: "Arial", color: STEEL })] })],
            }),
            new TableCell({
              borders: b,
              width: { size: colW[1], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 140, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: val?.trim() || "—", size: 20, font: "Garamond", color: DGRAY })] })],
            }),
          ],
        })
      ),
    }),
    new Paragraph({ ...sp(120, 0) }),
  ];
}

function kpiTable(kpis, headerColor = NAVY) {
  if (!kpis?.length) return [];
  const b = allBorders("DDDDDD");
  const hdrs = ["KPI", "Target", "Unit", "Frequency", "Vertical", "Owner"];
  const widths = [2400, 1200, 900, 1200, 1100, 1200];

  const hdrRow = new TableRow({
    children: hdrs.map((h, i) =>
      new TableCell({
        borders: b,
        width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: headerColor, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 100, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: WHITE, font: "Arial" })] })],
      })
    ),
  });

  const dataRows = kpis.map((k, ri) =>
    new TableRow({
      children: [k.label, k.target, k.unit, k.freq, k.vertical === "all" ? "All" : (k.vertical || "—"), k.role || "—"].map((v, i) =>
        new TableCell({
          borders: b,
          width: { size: widths[i], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? "FAFAFA" : "F0F4F8", type: ShadingType.CLEAR },
          margins: { top: 70, bottom: 70, left: 100, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: String(v || "—"), size: 19, font: i === 0 ? "Arial" : "Garamond", color: DGRAY })] })],
        })
      ),
    })
  );

  return [new Table({ width: { size: 9000, type: WidthType.DXA }, columnWidths: widths, rows: [hdrRow, ...dataRows] }), new Paragraph({ ...sp(120, 0) })];
}

function vertBanner(color, label, name) {
  return [
    new Paragraph({
      pageBreakBefore: true,
      ...sp(0, 0),
      shading: { fill: color.replace("#", ""), type: ShadingType.CLEAR },
      children: [new TextRun({ text: `  ${label}  ·  ${name}`, bold: true, size: 28, color: WHITE, font: "Garamond" })],
    }),
    new Paragraph({
      ...sp(0, 120),
      shading: { fill: GOLD, type: ShadingType.CLEAR },
      children: [new TextRun({ text: "  ARD CITY  ·  SALES VERTICAL PLAN", size: 17, color: NAVY, font: "Arial", characterSpacing: 80 })],
    }),
    thinRule(),
  ];
}

function jdBanner(title, band, color) {
  const c = color.replace("#", "");
  return [
    new Paragraph({
      pageBreakBefore: true,
      ...sp(0, 0),
      shading: { fill: c, type: ShadingType.CLEAR },
      children: [new TextRun({ text: `  ${title}  ·  ${band}`, bold: true, size: 24, color: WHITE, font: "Garamond" })],
    }),
    new Paragraph({
      ...sp(0, 140),
      shading: { fill: "EEF2F8", type: ShadingType.CLEAR },
      children: [new TextRun({ text: "  ARD CITY  ·  JOB DESCRIPTION", size: 16, color: NAVY, font: "Arial", characterSpacing: 80 })],
    }),
    new Paragraph({ ...sp(80, 0) }),
  ];
}

// ── MAIN GENERATOR ────────────────────────────────────────────────────
export async function generateDocx(payload) {
  const {
    formData = {},
    sections = [],
    verticals = [],
    vertFields = [],
    kpiCats = [],
    roles = [],
    goalStatus = {},
    goalNotes = {},
    summary = "",
  } = payload;

  const meta = formData.meta || {};
  const children = [];

  // ─ COVER PAGE ──────────────────────────────────────────────────────
  children.push(
    new Paragraph({ ...sp(0, 0), shading: { fill: NAVY, type: ShadingType.CLEAR }, children: [new TextRun({ text: "  ", size: 8 })] }),
    new Paragraph({ ...sp(0, 0), shading: { fill: GOLD, type: ShadingType.CLEAR }, children: [new TextRun({ text: "  ", size: 16 })] }),
    new Paragraph({
      ...sp(900, 0), alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "ARD CITY", bold: true, size: 72, color: NAVY, font: "Garamond", characterSpacing: 200 })],
    }),
    new Paragraph({
      ...sp(60, 0), alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: meta["Plan Title"] || meta["planTitle"] || "MASTER SALES PLAN", size: 34, color: GOLD, font: "Garamond" })],
    }),
    new Paragraph({
      ...sp(20, 0), alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS", size: 16, color: SLATE, font: "Arial", characterSpacing: 100 })],
    }),
    new Paragraph({
      ...sp(200, 200), alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 1 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 1 } },
      children: [new TextRun({ text: "  CONFIDENTIAL  ·  STRATEGIC DOCUMENT  ", size: 17, color: SLATE, font: "Arial" })],
    }),
  );

  // Cover info table - pull from first section (meta) fields
  const metaSection = sections.find(s => s.id === "meta") || sections[0];
  if (metaSection) {
    const coverRows = metaSection.fields.slice(0, 12).map(f => [f.label, formData[metaSection.id]?.[f.id] || ""]);
    coverRows.push(["Sales Verticals", verticals.map(v => v.label).join(" · ") || "B2G · B2C · B2B · Channel · Diaspora"]);
    children.push(...infoTable(coverRows, [2400, 6600]));
  }

  // ─ EXECUTIVE SUMMARY ───────────────────────────────────────────────
  children.push(new Paragraph({ pageBreakBefore: true }), H1("Executive Summary"), goldRule());
  if (summary) {
    children.push(H3("AI Strategic Brief", GOLD));
    children.push(...bodyLines(summary));
    children.push(thinRule());
  }

  // ─ ALL CORE SECTIONS ───────────────────────────────────────────────
  for (const sec of sections) {
    const secData = formData[sec.id] || {};
    const hasContent = sec.fields.some(f => secData[f.id]?.trim?.());
    if (!hasContent) continue;

    children.push(new Paragraph({ pageBreakBefore: true }), H1(sec.label), goldRule());

    for (const field of sec.fields) {
      const val = secData[field.id];
      if (val?.trim?.()) {
        children.push(...labelBlock(field.label, val, `#${STEEL}`));
      }
    }
  }

  // ─ VERTICAL PLANS ──────────────────────────────────────────────────
  for (const vert of verticals) {
    const vertData = formData[vert.id] || {};
    const hasContent = vertFields.some(f => vertData[f.id]?.trim?.());
    if (!hasContent) continue;

    const color = vert.color?.replace("#", "") || NAVY;
    children.push(...vertBanner(vert.color || "#1A4A7A", vert.label, vert.fullName || vert.label));
    children.push(...infoTable([
      ["Vertical", `${vert.label} — ${vert.fullName || vert.label}`],
      ...(vertFields.slice(0, 4).map(f => [f.label, vertData[f.id] || ""])),
    ]));

    for (const field of vertFields) {
      const val = vertData[field.id];
      if (val?.trim?.()) {
        children.push(...labelBlock(field.label, val, vert.color || `#${STEEL}`));
      }
    }
  }

  // ─ KPI FRAMEWORK ───────────────────────────────────────────────────
  if (kpiCats?.length) {
    children.push(new Paragraph({ pageBreakBefore: true }), H1("KPI Framework"), goldRule());
    children.push(...bodyLines("The following Key Performance Indicators are linked to each sales vertical and role. Track actuals weekly and review monthly."));
    children.push(new Paragraph({ ...sp(200, 0) }));

    for (const cat of kpiCats) {
      if (!cat.kpis?.length) continue;
      children.push(H2(`${cat.icon || ""} ${cat.label}`, cat.color?.replace("#", "") ? STEEL : STEEL));
      children.push(...kpiTable(cat.kpis, cat.color?.replace("#", "") || NAVY));
    }
  }

  // ─ SMART GOALS ─────────────────────────────────────────────────────
  const rolesWithGoals = roles.filter(r => r.goals?.length > 0);
  if (rolesWithGoals.length) {
    children.push(new Paragraph({ pageBreakBefore: true }), H1("SMART Goals by Role"), goldRule());
    children.push(...bodyLines("Each SMART goal is Specific, Measurable, Achievable, Relevant, and Time-bound — cascading from the Master Sales Plan targets."));

    for (const role of rolesWithGoals) {
      const color = role.color?.replace("#", "") || NAVY;
      children.push(
        new Paragraph({
          ...sp(280, 80),
          children: [
            new TextRun({ text: role.title, bold: true, size: 24, color, font: "Garamond" }),
            new TextRun({ text: `  [${role.band}]`, size: 19, color: SLATE, font: "Arial" }),
          ],
        }),
        new Paragraph({ ...sp(0, 100), border: { bottom: { style: BorderStyle.SINGLE, size: 2, color, space: 2 } }, children: [] }),
      );

      role.goals.forEach((goal, i) => {
        const statusKey = `${role.id}_${i}`;
        const status = goalStatus[statusKey] || "pending";
        const note = goalNotes[statusKey] || "";

        children.push(
          new Paragraph({
            ...sp(160, 50),
            children: [
              new TextRun({ text: `Goal ${i + 1}  `, bold: true, size: 20, color, font: "Arial" }),
              new TextRun({ text: `[${goal.category || "General"}]  `, size: 18, color: "888888", font: "Arial" }),
              new TextRun({ text: status.replace("_", " ").toUpperCase(), size: 16, color: status === "achieved" ? "3DA863" : status === "at_risk" ? "C44030" : "4A6080", font: "Arial" }),
            ],
          }),
          ...bodyLines(goal.goal || "", 240),
          new Paragraph({
            ...sp(60, 20), indent: { left: 240 },
            children: [new TextRun({ text: `Timeframe: ${goal.timeframe || "TBD"}`, size: 18, italics: true, color: SLATE, font: "Arial" })],
          }),
        );

        if (goal.linked_kpis?.length) {
          children.push(new Paragraph({
            ...sp(40, 60), indent: { left: 240 },
            children: [new TextRun({ text: `Linked KPIs: ${goal.linked_kpis.join(" · ")}`, size: 17, color: "2A80D0", font: "Arial" })],
          }));
        }
        if (note) {
          children.push(new Paragraph({
            ...sp(40, 80), indent: { left: 240 },
            children: [new TextRun({ text: `Progress: ${note}`, size: 17, italics: true, color: SLATE, font: "Garamond" })],
          }));
        }
      });
      children.push(thinRule());
    }
  }

  // ─ JOB DESCRIPTIONS ────────────────────────────────────────────────
  const rolesWithJD = roles.filter(r => r.summary || r.responsibilities?.length > 0);
  if (rolesWithJD.length) {
    children.push(new Paragraph({ pageBreakBefore: true }), H1("Job Descriptions"), goldRule());
    children.push(...bodyLines("All roles link directly to the KPI framework and SMART goals in this plan."));

    for (const role of rolesWithJD) {
      const color = role.color?.replace("#", "") || NAVY;
      children.push(...jdBanner(role.title, role.band || "Manager", role.color || "#1A4A7A"));
      children.push(...infoTable([
        ["Band / Level", role.band || ""],
        ["Vertical", role.vertical === "all" ? "All Verticals" : (role.vertical || "")],
      ]));

      if (role.summary) {
        children.push(
          new Paragraph({
            ...sp(120, 60), indent: { left: 200 },
            border: { left: { style: BorderStyle.SINGLE, size: 4, color, space: 8 } },
            children: [new TextRun({ text: role.summary, size: 20, italics: true, color: SLATE, font: "Garamond" })],
          })
        );
      }

      if (role.responsibilities?.length) {
        children.push(H3("Key Responsibilities", color));
        role.responsibilities.forEach((r, i) => {
          children.push(new Paragraph({
            ...sp(40, 50), indent: { left: 360 },
            children: [
              new TextRun({ text: `${i + 1}.  `, bold: true, size: 19, color, font: "Arial" }),
              new TextRun({ text: r, size: 20, font: "Garamond", color: DGRAY }),
            ],
          }));
        });
      }

      if (role.requirements?.length) {
        children.push(H3("Requirements", color));
        role.requirements.forEach(r => {
          children.push(new Paragraph({
            ...sp(40, 50), indent: { left: 360 },
            children: [
              new TextRun({ text: "•  ", size: 19, color, font: "Arial" }),
              new TextRun({ text: r, size: 20, font: "Garamond", color: DGRAY }),
            ],
          }));
        });
      }

      if (role.kpis?.length) {
        children.push(H3("Linked KPIs & Targets", color));
        children.push(new Paragraph({
          ...sp(40, 80), indent: { left: 360 },
          children: [new TextRun({ text: role.kpis.join("  ·  "), size: 19, color: "2A80D0", font: "Arial" })],
        }));
      }
    }
  }

  // ─ BUILD DOCUMENT ──────────────────────────────────────────────────
  const planTitle = meta["Plan Title"] || meta["planTitle"] || "Master Sales Plan";
  const preparedBy = meta["Prepared By"] || meta["preparedBy"] || "ARD City";
  const docDate = meta["Document Date"] || meta["date"] || "";

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Garamond", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Garamond", color: NAVY },
          paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Garamond", color: STEEL },
          paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 4 } },
            children: [
              new TextRun({ text: "ARD CITY  ·  ", bold: true, size: 17, color: NAVY, font: "Arial", characterSpacing: 60 }),
              new TextRun({ text: planTitle, size: 17, color: SLATE, font: "Arial" }),
              new TextRun({ text: "    CONFIDENTIAL", size: 15, color: "AAAAAA", font: "Arial" }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
            children: [
              new TextRun({ text: preparedBy, size: 15, color: "888888", font: "Arial" }),
              new TextRun({ text: docDate ? `   ·   ${docDate}` : "", size: 15, color: "AAAAAA", font: "Arial" }),
              new TextRun({ text: "   ·   Sales Intelligence Package", size: 15, color: "AAAAAA", font: "Arial" }),
            ],
          })],
        }),
      },
      children: children.filter(Boolean),
    }],
  });

  return Packer.toBuffer(doc);
}
