#!/usr/bin/env node
/**
 * ARD City Sales Intelligence — Dynamic PDF Generator (JavaScript)
 * Accepts full plan JSON from stdin, writes PDF to output_path
 * Uses pdfkit for serverless/Vercel compatibility
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const GOLD = '#B8912A';
const GOLD2 = '#D4A843';
const NAVY = '#0D1F3C';
const MIDBLUE = '#1A3A6B';
const STEEL = '#2C5282';
const SLATE = '#4A5568';
const LGRAY = '#EEF2F8';
const DGRAY = '#2D2D2D';
const WHITE = '#FFFFFF';

// Font sizes
const COVER_TITLE = 36;
const COVER_SUBTITLE = 16;
const COVER_META = 9;
const SECTION_TITLE = 18;
const SECTION_SUBTITLE = 13;
const LABEL = 10;
const BODY = 10;
const TABLE_HEADER = 9;
const TABLE_BODY = 9;

// Status colors
const STATUS_COLORS = {
  pending: '#888888',
  in_progress: '#2A80D0',
  achieved: '#3DA863',
  at_risk: '#C44030'
};

// Parse input from stdin
let inputData = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(inputData);
    const fd = data.formData || {};
    const sections = data.sections || [];
    const verticals = data.verticals || [];
    const vertFields = data.vertFields || [];
    const kpiCats = data.kpiCats || [];
    const roles = data.roles || [];
    const goalStatus = data.goalStatus || {};
    const goalNotes = data.goalNotes || {};
    const summary = data.summary || '';
    const outPath = data.output_path || '/tmp/ard_plan.pdf';

    // Load logo
    const scriptDir = path.join(__dirname, '..', '..');
    const logoPath = path.join(scriptDir, 'public', 'Logo.png');
    let logoBuffer = null;
    let logoDimensions = { width: 200, height: 80 };
    try {
      if (fs.existsSync(logoPath)) {
        logoBuffer = fs.readFileSync(logoPath);
        logoDimensions = { width: 200, height: 80 };
      }
    } catch (e) {
      console.warn(`Logo not found at ${logoPath}: ${e.message}`);
    }

    // Get meta values
    const getMetaVal = (fieldLabelContains) => {
      const sec = sections.find(s => s.id === 'meta');
      if (!sec) return fd.meta?.[fieldLabelContains.toLowerCase().replace(' ', '_')] || '';
      const f = sec.fields?.find(f => f.label && f.label.toLowerCase().includes(fieldLabelContains.toLowerCase()));
      if (!f) return '';
      return fd.meta?.[f.id] || '';
    };

    const devName = getMetaVal('Development') || 'ARD City';
    const planTitle = getMetaVal('Plan Title') || 'MASTER SALES PLAN';
    const preparedBy = getMetaVal('Prepared') || '';
    const planDate = getMetaVal('Date') || '';
    const revTarget = getMetaVal('Revenue') || '';
    const inventory = getMetaVal('Inventory') || '';
    const launchDate = getMetaVal('Launch') || '';
    const planPeriod = getMetaVal('Period') || '';

    // Create PDF document
    const doc = new PDFDocument({
      size: 'letter',
      margins: { top: 60, bottom: 70, left: 54, right: 54 }
    });

    // Write to a buffer instead of file for serverless
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      try {
        fs.writeFileSync(outPath, pdfBuffer);
        console.log(JSON.stringify({ success: true }));
      } catch (err) {
        console.error(JSON.stringify({ success: false, error: err.message }));
        process.exit(1);
      }
    });

    // Store page references for headers/footers
    let currentPage = 1;
    doc.on('pageAdded', () => {
      currentPage++;
    });

    // Helper function for text wrapping
    function wrapText(text, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = doc.widthOfString(currentLine + ' ' + word);
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    }

    // ==================== COVER PAGE ====================
    doc.rect(0, 0, doc.page.width, 40).fill(GOLD);
    doc.rect(0, doc.page.height - 20, doc.page.width, 20).fill(NAVY);
    doc.fill(WHITE).fontSize(7).text('CONFIDENTIAL', 36, 12);
    doc.fill(WHITE).fontSize(7).text(`${devName.toUpperCase()} · SALES INTELLIGENCE PACKAGE`,
      doc.page.width - 54 - 12, 12, { align: 'right' });

    if (logoBuffer) {
      const coverLogoWidth = 180;
      const coverLogoHeight = (logoDimensions.height / logoDimensions.width) * coverLogoWidth;
      doc.image(logoBuffer, (doc.page.width - coverLogoWidth) / 2, 80, { width: coverLogoWidth });
      doc.moveDown(1);
    } else {
      doc.moveDown(3);
      doc.fill(NAVY).font('Helvetica-Bold').fontSize(COVER_TITLE).text(devName.toUpperCase(), { align: 'center' });
    }
    doc.moveDown(0.5);
    doc.fill(GOLD).font('Times-Roman').fontSize(COVER_SUBTITLE).text(planTitle, { align: 'center' });
    doc.moveDown(0.5);
    doc.fill(SLATE).font('Helvetica').fontSize(9).text(
      'SALES PLAN · KPI FRAMEWORK · SMART GOALS · JOB DESCRIPTIONS',
      { align: 'center', characterSpacing: 5 }
    );
    doc.moveDown(1);

    // Gold horizontal line
    doc.moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).lineWidth(2).stroke(GOLD);

    const metaInfo = [
      ['Development', devName],
      ['Prepared By', preparedBy],
      ['Date', planDate],
      ['Revenue Target', revTarget],
      ['Inventory', inventory],
      ['Launch Date', launchDate],
      ['Plan Period', planPeriod]
    ].filter(([_, v]) => v && v.trim());

    metaInfo.forEach(([label, value]) => {
      doc.fill(SLATE).font('Helvetica').fontSize(COVER_META).text(`${label}: ${value}`, { align: 'center' });
    });

    // ==================== EXECUTIVE SUMMARY ====================
    doc.addPage();
    doc.fill(NAVY).font('Times-Bold').fontSize(SECTION_TITLE).text('Executive Summary');
    doc.moveDown(0.2);
    doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(2).stroke(GOLD);

    if (summary) {
      doc.fill(GOLD).font('Helvetica-Oblique').fontSize(9).text('AI Strategic Intelligence Brief');
      doc.moveDown(0.3);
      doc.fill(DGRAY).font('Times-Roman').fontSize(BODY);
      const summaryLines = wrapText(summary, 480);
      summaryLines.forEach(line => {
        if (line.trim()) {
          doc.text(line.trim(), { indent: 20 });
        }
      });
      doc.moveDown(0.2);
      doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(0.5).stroke('#CCCCCC');
    }

    // ==================== DYNAMIC CORE SECTIONS ====================
    sections.forEach(sec => {
      const secData = fd[sec.id] || {};
      const hasContent = sec.fields?.some(f => secData[f.id]?.trim);
      if (!hasContent) return;

      doc.addPage();
      doc.fill(NAVY).font('Times-Bold').fontSize(SECTION_TITLE).text(sec.label);
      doc.moveDown(0.2);
      doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(2).stroke(GOLD);

      sec.fields?.forEach(f => {
        const val = secData[f.id];
        if (val && val.trim()) {
          doc.moveDown(0.3);
          doc.fill(MIDBLUE).font('Helvetica-Bold').fontSize(LABEL).text(`▸  ${f.label}`);
          doc.fill(DGRAY).font('Times-Roman').fontSize(BODY);
          val.split('\n').forEach(line => {
            if (line.trim()) {
              doc.text(line.trim(), { indent: 20 });
            }
          });
        }
      });
    });

    // ==================== DYNAMIC VERTICALS ====================
    verticals.forEach(v => {
      const vData = fd[v.id] || {};
      const hasContent = vertFields.some(f => vData[f.id]?.trim);
      if (!hasContent) return;

      doc.addPage();

      // Vertical banner
      const vColor = v.color || MIDBLUE;
      doc.rect(0, doc.y, doc.page.width, 30).fill(vColor);
      doc.fill(WHITE).font('Times-Bold').fontSize(14).text(
        `  ${v.label || 'Vertical'} · ${v.fullName || ''}`,
        0, doc.y - 24
      );
      doc.rect(0, doc.y + 10, doc.page.width, 20).fill(GOLD);
      doc.fill(NAVY).font('Helvetica-Bold').fontSize(8).text(
        '  ARD CITY · SALES VERTICAL PLAN',
        0, doc.y + 4, { characterSpacing: 6 }
      );
      doc.moveDown(0.5);
      doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(0.5).stroke('#CCCCCC');
      doc.moveDown(0.3);

      // Info table for first 4 fields
      const infoRows = [
        ['Vertical', `${v.label} — ${v.fullName}`],
        ...vertFields.slice(0, 4).map(f => [f.label, vData[f.id] || ''])
      ].filter(([_, val]) => val && val.trim());

      if (infoRows.length > 0) {
        const tableTop = doc.y;
        const rowHeight = 20;
        const colWidths = [130, 380];
        const xStart = 54;

        infoRows.forEach((row, i) => {
          const y = tableTop + i * rowHeight;
          doc.rect(xStart, y, colWidths[0], rowHeight).fill(i % 2 === 0 ? LGRAY : '#F7F9FC');
          doc.rect(xStart + colWidths[0], y, colWidths[1], rowHeight).fill(i % 2 === 0 ? '#F7F9FC' : LGRAY);
          doc.stroke('#DDDDDD');
          doc.fill(STEEL).font('Helvetica-Bold').fontSize(TABLE_HEADER);
          doc.text(row[0], xStart + 10, y + 5);
          doc.fill(DGRAY).font('Times-Roman').fontSize(TABLE_BODY);
          doc.text(row[1], xStart + colWidths[0] + 10, y + 5);
        });
        doc.y = tableTop + infoRows.length * rowHeight + 20;
      }

      // Remaining fields as label blocks
      vertFields.slice(4).forEach(f => {
        const val = vData[f.id];
        if (val && val.trim()) {
          doc.moveDown(0.3);
          doc.fill(vColor).font('Helvetica-Bold').fontSize(LABEL).text(`▸  ${f.label}`);
          doc.fill(DGRAY).font('Times-Roman').fontSize(BODY);
          val.split('\n').forEach(line => {
            if (line.trim()) {
              doc.text(line.trim(), { indent: 20 });
            }
          });
        }
      });
    });

    // ==================== KPI FRAMEWORK ====================
    doc.addPage();
    doc.fill(NAVY).font('Times-Bold').fontSize(SECTION_TITLE).text('KPI Framework');
    doc.moveDown(0.2);
    doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(2).stroke(GOLD);
    doc.moveDown(0.2);
    doc.fill(DGRAY).font('Times-Roman').fontSize(BODY).text(
      'Key Performance Indicators linked to each vertical, role, and SMART goal.'
    );

    kpiCats.forEach(cat => {
      if (!cat.kpis?.length) return;

      doc.moveDown(0.4);
      const catColor = cat.color || MIDBLUE;
      doc.fill(catColor).font('Times-Bold').fontSize(SECTION_SUBTITLE).text(
        `${cat.icon || ''} ${cat.label}`
      );

      // KPI table
      const headers = ['KPI', 'Target', 'Unit', 'Freq', 'Vertical'];
      const colWidths = [160, 70, 50, 65, 80];
      const tableTop = doc.y;
      const rowHeight = 18;
      const xStart = 54;

      // Header row
      doc.rect(xStart, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(catColor);
      headers.forEach((h, i) => {
        doc.fill(WHITE).font('Helvetica-Bold').fontSize(KPI_HEADER).text(
          h,
          xStart + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 6,
          tableTop + 4
        );
      });

      // Data rows
      cat.kpis.forEach((k, i) => {
        const y = tableTop + (i + 1) * rowHeight;
        const bgColor = i % 2 === 0 ? '#FAFAFA' : LGRAY;
        colWidths.forEach((w, j) => {
          doc.rect(xStart + colWidths.slice(0, j).reduce((a, b) => a + b, 0), y, w, rowHeight).fill(bgColor);
          doc.stroke('#DDDDDD');
        });
        const vert = k.vertical === 'all' ? 'All' : (k.vertical || '').toUpperCase();
        const values = [k.label || '', k.target || '', k.unit || '', k.freq || '', vert];
        values.forEach((val, j) => {
          doc.fill(DGRAY).font('Times-Roman').fontSize(KPI_BODY).text(
            val || '—',
            xStart + colWidths.slice(0, j).reduce((a, b) => a + b, 0) + 6,
            y + 3
          );
        });
      });

      doc.y = tableTop + (cat.kpis.length + 1) * rowHeight + 25;
    });

    // ==================== SMART GOALS ====================
    doc.addPage();
    doc.fill(NAVY).font('Times-Bold').fontSize(SECTION_TITLE).text('SMART Goals by Role');
    doc.moveDown(0.2);
    doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(2).stroke(GOLD);

    roles.forEach(role => {
      const goals = role.goals || [];
      if (!goals.length) return;

      doc.moveDown(0.3);
      const rColor = role.color || MIDBLUE;
      doc.fill(rColor).font('Times-Bold').fontSize(13).text(
        `${role.title} [${role.band || ''}]`
      );
      doc.y -= 2;
      doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(2).stroke(rColor);

      goals.forEach((g, i) => {
        const key = `${role.id}_${i}`;
        const status = goalStatus[key] || 'pending';
        const note = goalNotes[key] || '';
        const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;

        doc.moveDown(0.3);
        doc.fill(rColor).font('Helvetica-Bold').fontSize(10).text(`Goal ${i + 1}`);
        doc.fill('#888888').font('Helvetica').fontSize(9).text(` [${g.category || 'General'}] `);
        doc.fill(statusColor).font('Helvetica-Oblique').fontSize(9).text(
          `Status: ${status.replace('_', ' ').toUpperCase()}`
        );

        if (g.goal && g.goal.trim()) {
          doc.fill(DGRAY).font('Times-Roman').fontSize(BODY);
          g.goal.split('\n').forEach(line => {
            if (line.trim()) {
              doc.text(line.trim(), { indent: 20 });
            }
          });
        }

        doc.moveDown(0.1);
        doc.fill(SLATE).font('Helvetica-Oblique').fontSize(9).text(
          `Timeframe: ${g.timeframe || 'TBD'}`, { indent: 20 }
        );

        if (g.linked_kpis?.length) {
          doc.fill('#2A80D0').font('Courier').fontSize(9).text(
            `Linked KPIs: ${g.linked_kpis.join(' · ')}`, { indent: 20 }
          );
        }

        if (note && note.trim()) {
          doc.fill('#888888').font('Times-Italic').fontSize(BODY).text(
            `Note: ${note.trim()}`, { indent: 20 }
          );
        }
      });

      doc.moveDown(0.1);
      doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(0.5).stroke('#CCCCCC');
    });

    // ==================== JOB DESCRIPTIONS ====================
    doc.addPage();
    doc.fill(NAVY).font('Times-Bold').fontSize(SECTION_TITLE).text('Job Descriptions');
    doc.moveDown(0.2);
    doc.moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).lineWidth(2).stroke(GOLD);

    roles.forEach(role => {
      doc.addPage();

      const rColor = role.color || MIDBLUE;
      const vertStr = role.vertical === 'all' ? 'All Verticals' : (role.vertical || '').toUpperCase();

      // Role banner
      doc.rect(0, 0, doc.page.width, 32).fill(rColor);
      doc.fill(WHITE).font('Times-Bold').fontSize(13).text(
        `  ${role.title} · ${role.band || ''}`,
        0, 12
      );
      doc.rect(0, 32, doc.page.width, 20).fill(LGRAY);
      doc.fill(NAVY).font('Helvetica-Bold').fontSize(8).text(
        `  ARD CITY · JOB DESCRIPTION · ${vertStr}`,
        0, 40, { characterSpacing: 5 }
      );
      doc.moveDown(0.3);

      // Info table
      const infoRows = [
        ['Band / Level', role.band || ''],
        ['Vertical', vertStr]
      ];
      infoRows.forEach(([label, value]) => {
        doc.fill(rColor).font('Helvetica-Bold').fontSize(10).text(`▸  ${label}`);
        doc.fill(DGRAY).font('Times-Roman').fontSize(BODY).text(`: ${value}`, { continued: true });
      });

      if (role.summary) {
        doc.moveDown(0.3);
        doc.fill(SLATE).font('Times-Italic').fontSize(BODY).text(role.summary);
      }

      if (role.responsibilities?.length) {
        doc.moveDown(0.3);
        doc.fill(rColor).font('Helvetica-Bold').fontSize(10).text('KEY RESPONSIBILITIES', { characterSpacing: 2 });
        role.responsibilities.forEach((r, i) => {
          doc.moveDown(0.1);
          doc.fill(rColor).font('Helvetica-Bold').fontSize(BODY).text(`${i + 1}. `, { continued: true });
          doc.fill(DGRAY).font('Times-Roman').fontSize(BODY).text(r);
        });
      }

      if (role.requirements?.length) {
        doc.moveDown(0.3);
        doc.fill(rColor).font('Helvetica-Bold').fontSize(10).text('REQUIREMENTS', { characterSpacing: 2 });
        role.requirements.forEach(r => {
          doc.moveDown(0.1);
          doc.fill('#888888').font('Helvetica').fontSize(BODY).text('• ', { continued: true });
          doc.fill('#444444').font('Times-Roman').fontSize(BODY).text(r);
        });
      }

      if (role.kpis?.length) {
        doc.moveDown(0.3);
        doc.fill('#2A80D0').font('Helvetica-Bold').fontSize(10).text('LINKED KPIs', { characterSpacing: 2 });
        doc.fill('#2A80D0').font('Courier').fontSize(BODY).text(role.kpis.join('  ·  '));
      }
    });

    // ==================== ADD HEADERS/FOOTERS TO ALL PAGES ====================
    // We can't modify previous pages in pdfkit, so we skip headers for now
    // The PDF is functional, just without dynamic headers/footers

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error(JSON.stringify({ success: false, error: error.message || error.toString() }));
    process.exit(1);
  }
});
