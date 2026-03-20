import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function maybeGenerateSummary(payload) {
  if (payload.summary || !process.env.ANTHROPIC_API_KEY) return payload;

  try {
    const metaText = JSON.stringify(payload.formData?.meta || {}).slice(0, 2000);
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: 'Respond ONLY with JSON: {"summary":"...120-word executive summary..."}',
        messages: [{ role: "user", content: `ARD City plan: ${metaText}` }],
      }),
    });
    const data = await resp.json();
    const txt = data.content?.map((b) => b.text).join("") || "{}";
    const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
    payload.summary = parsed.summary || "";
  } catch {
    // Summary generation is optional and should not fail document generation.
  }

  return payload;
}

export async function POST(request) {
  try {
    const { generateDocx, generatePdf } = await import("../../../lib/ardGenerate.cjs").then((m) => m.default || m);

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "docx";
    const payload = await request.json();
    await maybeGenerateSummary(payload);

    if (type !== "docx" && type !== "pdf") {
      return NextResponse.json({ error: "type must be docx or pdf" }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), "ard-master-sales");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const jobId = crypto.randomUUID();
    const outPath = path.join(tempDir, `ard_${jobId}.${type}`);

    if (type === "docx") {
      await generateDocx(payload, outPath);
    } else {
      await generatePdf(payload, outPath);
    }

    if (!fs.existsSync(outPath)) {
      return NextResponse.json({ error: "Document generation failed — output not found" }, { status: 500 });
    }

    const mimeTypes = {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pdf: "application/pdf",
    };

    const filename = `ARD_City_Sales_Intelligence_${new Date().toISOString().slice(0, 10)}.${type}`;
    const fileBuffer = fs.readFileSync(outPath);

    try {
      fs.unlinkSync(outPath);
    } catch {
      // Ignore cleanup errors.
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeTypes[type],
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Generation failed" }, { status: 500 });
  }
}
