const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, Header, Footer, ImageRun,
} = require("docx");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

async function generateDocx(payload, outPath) {
  const fd = payload.formData || {};
  const sections = payload.sections || [];
  // Load logo for header
  const logoPath = path.join(process.cwd(), "public", "LogoDark.png");
  let logoBuffer = null;
  try {
    logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;
  } catch (e) {
    console.warn("Logo not found:", logoPath);
  }
  const verticals = payload.verticals || [];
  const vertFields = payload.vertFields || [];
  const kpiCats = payload.kpiCats || [];
  const roles = payload.roles || [];
  const goalStatus = payload.goalStatus || {};
  const goalNotes = payload.goalNotes || {};
  const summary = payload.summary || "";
  const meta = fd.meta || {};

  const GOLD = "B8912A";
  const NAVY = "0D1F3C";
  const STEEL = "2C5282";
  const SLATE = "4A5568";

  const sp = (b = 0, a = 0) => ({ spacing: { before: b, after: a } });
  const bdr = (c = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 1, color: c });
  const bdrAll = (c = "CCCCCC") => ({ top: bdr(c), bottom: bdr(c), left: bdr(c), right: bdr(c) });

  function goldRule() {
    return new Paragraph({
      ...sp(140, 80),
      border: { bottom: { style: BorderStyle.SINGLE, size: 5, color: GOLD, space: 4 } },
      children: [],
    });
  }
  function thinRule() {
    return new Paragraph({
      ...sp(80, 80),
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD", space: 2 } },
      children: [],
    });
  }
  function pgBreak() {
    return new Paragraph({ pageBreakBefore: true, children: [] });
  }

  function H1(text, color = NAVY) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      ...sp(360, 120),
      children: [new TextRun({ text, bold: true, size: 30, color, font: "Garamond" })],
    });
  }
  function H2(text, color = STEEL) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      ...sp(220, 80),
      children: [new TextRun({ text, bold: true, size: 24, color, font: "Garamond" })],
    });
  }
  function labelBlk(label, value, color = STEEL) {
    if (!value || !String(value).trim()) return [];
    return [
      new Paragraph({
        ...sp(140, 40),
        children: [new TextRun({ text: `▸  ${label}`, bold: true, size: 20, color, font: "Arial" })],
      }),
      ...String(value)
        .trim()
        .split("\n")
        .filter((l) => l.trim())
        .map(
          (line) =>
            new Paragraph({
              ...sp(30, 40),
              indent: { left: 320 },
              children: [new TextRun({ text: line.trim(), size: 20, font: "Garamond", color: "2D2D2D" })],
            })
        ),
    ];
  }
  function infoTable(rows, colW = [2600, 6400]) {
    const filtered = rows.filter((r) => r[1] && String(r[1]).trim());
    if (!filtered.length) return [];
    const b = bdrAll("DDDDDD");
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
                shading: { fill: i % 2 === 0 ? "EEF2F8" : "F5F7FC", type: ShadingType.CLEAR },
                margins: { top: 70, bottom: 70, left: 120, right: 80 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: lbl, bold: true, size: 18, font: "Arial", color: STEEL })],
                  }),
                ],
              }),
              new TableCell({
                borders: b,
                width: { size: colW[1], type: WidthType.DXA },
                margins: { top: 70, bottom: 70, left: 120, right: 80 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: String(val || "—"), size: 19, font: "Garamond", color: "2D2D2D" })],
                  }),
                ],
              }),
            ],
          })
        ),
      }),
      new Paragraph({ ...sp(100, 0) }),
    ];
  }
  function vertBanner(v) {
    return [
      pgBreak(),
      new Paragraph({
        ...sp(0, 0),
        shading: { fill: (v.color || "#0D1F3C").replace("#", ""), type: ShadingType.CLEAR },
        children: [
          new TextRun({ text: `  ${v.label || "Vertical"}  ·  ${v.fullName || ""}`, bold: true, size: 26, color: "FFFFFF", font: "Garamond" }),
        ],
      }),
      new Paragraph({
        ...sp(0, 120),
        shading: { fill: GOLD, type: ShadingType.CLEAR },
        children: [new TextRun({ text: "  ARD CITY  ·  SALES VERTICAL PLAN", size: 16, color: NAVY, font: "Arial", characterSpacing: 80 })],
      }),
      thinRule(),
    ];
  }
  function kpiTable(kpis, hColor = NAVY) {
    const hdrs = ["KPI", "Target", "Unit", "Frequency", "Vertical"];
    const b = bdrAll("DDDDDD");
    const colWs = [2800, 1200, 800, 1300, 900];
    const hRow = new TableRow({
      children: hdrs.map((h, i) =>
        new TableCell({
          borders: b,
          shading: { fill: hColor.replace("#", ""), type: ShadingType.CLEAR },
          width: { size: colWs[i], type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 80, right: 60 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 17, color: "FFFFFF", font: "Arial" })] })],
        })
      ),
    });
    const rows = kpis.map((k, ri) =>
      new TableRow({
        children: [k.label || "", k.target || "—", k.unit || "", k.freq || "", k.vertical === "all" ? "All" : k.vertical || ""].map(
          (v, i) =>
            new TableCell({
              borders: b,
              width: { size: colWs[i], type: WidthType.DXA },
              shading: { fill: ri % 2 === 0 ? "FAFAFA" : "EEF2F8", type: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 80, right: 60 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(v), size: 18, font: i === 0 ? "Arial" : "Garamond", color: "2D2D2D" })],
                }),
              ],
            })
        ),
      })
    );
    return new Table({ width: { size: 9000, type: WidthType.DXA }, columnWidths: colWs, rows: [hRow, ...rows] });
  }

  const children = [];

  const metaTitle = (() => {
    const s = sections.find((x) => x.id === "meta");
    const f = s?.fields?.find((x) => x.label === "Plan Title");
    return f ? fd.meta?.[f.id] || "MASTER SALES PLAN" : "MASTER SALES PLAN";
  })();
  const metaDev = (() => {
    const s = sections.find((x) => x.id === "meta");
    const f = s?.fields?.find((x) => x.label.includes("Development"));
    return f ? fd.meta?.[f.id] || "ARD City" : "ARD City";
  })();
  const prepBy =
    (() => {
      const s = sections.find((x) => x.id === "meta");
      const f = s?.fields?.find((x) => x.label.includes("Prepared"));
      return f ? fd.meta?.[f.id] || "" : "";
    })() || meta.preparedBy || "";
  const planDate = meta.date || "";

  children.push(
    new Paragraph({ ...sp(0, 0), shading: { fill: NAVY, type: ShadingType.CLEAR }, children: [new TextRun({ text: "  ", size: 8 })] }),
    new Paragraph({ ...sp(0, 0), shading: { fill: GOLD, type: ShadingType.CLEAR }, children: [new TextRun({ text: "  ", size: 14 })] }),
    // Add logo to cover page if available
    ...(logoBuffer ? [
      new Paragraph({
        ...sp(600, 0),
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 200, height: 100 },
            type: "png",
          }),
        ],
      }),
    ] : []),
    new Paragraph({
      ...sp(300, 0),
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: metaDev.toUpperCase(), bold: true, size: 64, color: NAVY, font: "Garamond", characterSpacing: 180 })],
    }),
    new Paragraph({ ...sp(60, 0), alignment: AlignmentType.CENTER, children: [new TextRun({ text: metaTitle, size: 28, color: GOLD, font: "Garamond" })] }),
    new Paragraph({
      ...sp(20, 0),
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "SALES PLAN  ·  KPI FRAMEWORK  ·  SMART GOALS  ·  JOB DESCRIPTIONS", size: 14, color: SLATE, font: "Arial", characterSpacing: 80 })],
    }),
    new Paragraph({
      ...sp(180, 160),
      alignment: AlignmentType.CENTER,
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 1 },
      },
      children: [new TextRun({ text: "  CONFIDENTIAL  ·  STRATEGIC DOCUMENT  ", size: 16, color: SLATE, font: "Arial" })],
    })
  );

  children.push(
    ...infoTable([
      ["Development", metaDev],
      ["Prepared By", prepBy],
      ["Date", planDate],
      ["Total Revenue Target", meta.totalRevenue || ""],
      ["Total Inventory", meta.totalInventory || ""],
      ["Launch Date", meta.launchDate || ""],
      ["Plan Period", meta.planPeriod || ""],
      ["Regulatory", meta.regulatory || ""],
      ["Sales Verticals", verticals.map((v) => v.label).join(" · ") || "B2G · B2C · B2B · Channel · Diaspora"],
    ])
  );

  children.push(pgBreak(), H1("Executive Summary"), goldRule());
  if (summary) {
    children.push(new Paragraph({ ...sp(80, 60), children: [new TextRun({ text: "AI Strategic Intelligence Brief", italics: true, size: 19, color: GOLD, font: "Arial" })] }));
    summary
      .trim()
      .split("\n")
      .forEach((l) => {
        if (l.trim()) {
          children.push(new Paragraph({ ...sp(30, 50), indent: { left: 240 }, children: [new TextRun({ text: l.trim(), size: 20, font: "Garamond", color: "2D2D2D" })] }));
        }
      });
    children.push(thinRule());
  }

  sections.forEach((sec) => {
    children.push(pgBreak(), H1(sec.label, `#${NAVY}`), goldRule());
    (sec.fields || []).forEach((f) => {
      const val = fd[sec.id]?.[f.id];
      if (val && String(val).trim()) children.push(...labelBlk(f.label, val));
    });
  });

  verticals.forEach((v) => {
    const vData = fd[v.id] || {};
    const hasContent = vertFields.some((f) => vData[f.id] && String(vData[f.id]).trim());
    if (!hasContent) return;
    children.push(...vertBanner(v));
    children.push(
      ...infoTable([
        ["Vertical", `${v.label} — ${v.fullName}`],
        ...vertFields.slice(0, 4).map((f) => [f.label, vData[f.id] || ""]),
      ])
    );
    vertFields.slice(4).forEach((f) => {
      if (vData[f.id] && String(vData[f.id]).trim()) {
        children.push(...labelBlk(f.label, vData[f.id], `#${(v.color || "#2C5282").replace("#", "")}`));
      }
    });
  });

  children.push(pgBreak(), H1("KPI Framework", `#${NAVY}`), goldRule());
  children.push(new Paragraph({ ...sp(60, 120), children: [new TextRun({ text: "Key Performance Indicators linked to each vertical, role, and SMART goal.", size: 20, font: "Garamond", color: "2D2D2D" })] }));
  kpiCats.forEach((cat) => {
    if (!cat.kpis?.length) return;
    children.push(H2(`${cat.icon || ""} ${cat.label}`, `#${(cat.color || STEEL).replace("#", "")}`));
    children.push(kpiTable(cat.kpis, (cat.color || NAVY).replace("#", "")));
    children.push(new Paragraph({ ...sp(100, 0) }));
  });

  children.push(pgBreak(), H1("SMART Goals by Role", `#${NAVY}`), goldRule());
  roles.forEach((role) => {
    const goals = role.goals || [];
    if (!goals.length) return;
    const rc = (role.color || `#${NAVY}`).replace("#", "");
    children.push(
      new Paragraph({
        ...sp(240, 60),
        children: [
          new TextRun({ text: role.title, bold: true, size: 22, color: `#${rc}`, font: "Garamond" }),
          new TextRun({ text: `  [${role.band || ""}]`, size: 18, color: SLATE, font: "Arial" }),
        ],
      })
    );
    children.push(new Paragraph({ ...sp(0, 80), border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: rc, space: 2 } }, children: [] }));
    goals.forEach((g, i) => {
      const key = `${role.id}_${i}`;
      const status = goalStatus[key] || "pending";
      const note = goalNotes[key] || "";
      const statusColors = { pending: "888888", in_progress: "2A80D0", achieved: "3DA863", at_risk: "C44030" };
      children.push(
        new Paragraph({
          ...sp(120, 30),
          children: [
            new TextRun({ text: `Goal ${i + 1}  `, bold: true, size: 20, color: `#${rc}`, font: "Arial" }),
            new TextRun({ text: `[${g.category || "General"}]  `, size: 17, color: "888888", font: "Arial" }),
            new TextRun({ text: status.replace("_", " ").toUpperCase(), size: 16, color: statusColors[status] || "888888", font: "Arial" }),
          ],
        })
      );
      if (g.goal && String(g.goal).trim()) {
        String(g.goal)
          .split("\n")
          .forEach((l) => {
            if (l.trim()) children.push(new Paragraph({ ...sp(30, 30), indent: { left: 320 }, children: [new TextRun({ text: l.trim(), size: 20, font: "Garamond", color: "2D2D2D" })] }));
          });
      }
      children.push(new Paragraph({ ...sp(20, 30), indent: { left: 320 }, children: [new TextRun({ text: `Timeframe: ${g.timeframe || "TBD"}`, italics: true, size: 18, color: SLATE, font: "Arial" })] }));
      if (g.linked_kpis?.length) {
        children.push(new Paragraph({ ...sp(20, 60), indent: { left: 320 }, children: [new TextRun({ text: `KPIs: ${g.linked_kpis.join(" · ")}`, size: 17, color: "2A80D0", font: "Arial" })] }));
      }
      if (note && String(note).trim()) {
        children.push(new Paragraph({ ...sp(20, 60), indent: { left: 320 }, children: [new TextRun({ text: `Note: ${String(note).trim()}`, italics: true, size: 17, color: "888888", font: "Arial" })] }));
      }
    });
    children.push(thinRule());
  });

  children.push(pgBreak(), H1("Job Descriptions", `#${NAVY}`), goldRule());
  roles.forEach((role) => {
    const rc = (role.color || `#${NAVY}`).replace("#", "");
    children.push(
      pgBreak(),
      new Paragraph({
        ...sp(0, 0),
        shading: { fill: rc, type: ShadingType.CLEAR },
        children: [new TextRun({ text: `  ${role.title}  ·  ${role.band || ""}`, bold: true, size: 22, color: "FFFFFF", font: "Garamond" })],
      }),
      new Paragraph({
        ...sp(0, 140),
        shading: { fill: "EEF2F8", type: ShadingType.CLEAR },
        children: [
          new TextRun({ text: `  ARD CITY  ·  JOB DESCRIPTION  ·  ${(role.vertical === "all" ? "All Verticals" : role.vertical || "").toUpperCase()}`, size: 15, color: NAVY, font: "Arial", characterSpacing: 60 }),
        ],
      })
    );
    if (role.summary && String(role.summary).trim()) {
      children.push(new Paragraph({
        ...sp(120, 80),
        indent: { left: 180 },
        border: { left: { style: BorderStyle.SINGLE, size: 4, color: rc, space: 8 } },
        children: [new TextRun({ text: String(role.summary).trim(), italics: true, size: 19, color: SLATE, font: "Garamond" })],
      }));
    }
    if (role.responsibilities?.length) {
      children.push(new Paragraph({ ...sp(140, 50), children: [new TextRun({ text: "KEY RESPONSIBILITIES", bold: true, size: 17, color: `#${rc}`, font: "Arial", characterSpacing: 40 })] }));
      role.responsibilities.forEach((r, i) => {
        children.push(new Paragraph({ ...sp(30, 40), indent: { left: 300 }, children: [new TextRun({ text: `${i + 1}.  `, bold: true, size: 19, color: `#${rc}`, font: "Arial" }), new TextRun({ text: r, size: 19, font: "Garamond", color: "2D2D2D" })] }));
      });
    }
    if (role.requirements?.length) {
      children.push(new Paragraph({ ...sp(140, 50), children: [new TextRun({ text: "REQUIREMENTS", bold: true, size: 17, color: `#${rc}`, font: "Arial", characterSpacing: 40 })] }));
      role.requirements.forEach((r) => {
        children.push(new Paragraph({ ...sp(30, 40), indent: { left: 300 }, children: [new TextRun({ text: "•  ", size: 19, color: "888888", font: "Arial" }), new TextRun({ text: r, size: 19, font: "Garamond", color: "444444" })] }));
      });
    }
    if (role.kpis?.length) {
      children.push(new Paragraph({ ...sp(140, 50), children: [new TextRun({ text: "LINKED KPIs", bold: true, size: 17, color: "2A80D0", font: "Arial", characterSpacing: 40 })] }));
      children.push(new Paragraph({ ...sp(30, 60), indent: { left: 300 }, children: [new TextRun({ text: role.kpis.join("  ·  "), size: 18, color: "2A80D0", font: "Arial" })] }));
    }
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Garamond", size: 20 } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 30, bold: true, font: "Garamond", color: NAVY },
          paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: "Garamond", color: STEEL },
          paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 4 } },
                children: [
                  ...(logoBuffer ? [
                    new ImageRun({
                      data: logoBuffer,
                      transformation: { width: 100, height: 50 },
                      type: "png",
                    }),
                    new TextRun({ text: "  ", size: 16 }),
                  ] : []),
                  new TextRun({ text: `${metaDev.toUpperCase()}  ·  `, bold: true, size: 16, color: NAVY, font: "Arial", characterSpacing: 60 }),
                  new TextRun({ text: metaTitle, size: 16, color: SLATE, font: "Arial" }),
                  new TextRun({ text: "    CONFIDENTIAL", size: 14, color: "AAAAAA", font: "Arial" }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
                children: [
                  new TextRun({ text: prepBy, size: 14, color: "888888", font: "Arial" }),
                  new TextRun({ text: `   ·   ${planDate}   ·   ARD City Sales Intelligence Package`, size: 14, color: "AAAAAA", font: "Arial" }),
                ],
              }),
            ],
          }),
        },
        children: children.filter(Boolean),
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buf);
}

function generatePdf(payload, outPath) {
  return new Promise((resolve, reject) => {
    const jsScript = path.join(process.cwd(), "backend", "generators", "pdf_generator.js");
    const input = JSON.stringify({ ...payload, output_path: outPath });
    const proc = spawn("node", [jsScript], { stdio: ["pipe", "pipe", "pipe"] });
    proc.stdin.write(input);
    proc.stdin.end();
    const stdoutChunks = [];
    let stderr = "";
    proc.stdout.on("data", (d) => stdoutChunks.push(Buffer.from(d)));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`PDF generation failed (code ${code}): ${stderr.slice(0, 500)}`));
      }

      const stdoutBuffer = Buffer.concat(stdoutChunks);

      // The JS generator writes to file, check if file exists
      if (fs.existsSync(outPath)) {
        return resolve({ success: true, mode: "file" });
      }

      // If not, try to parse as JSON for error messages
      const stdout = stdoutBuffer.toString("utf8");
      try {
        const r = JSON.parse(stdout);
        if (r.success) resolve(r);
        else reject(new Error(r.error || "PDF failed"));
      } catch {
        reject(new Error(`PDF output parse error: ${stdout.slice(0, 200)}`));
      }
    });
  });
}

module.exports = {
  generateDocx,
  generatePdf,
};
