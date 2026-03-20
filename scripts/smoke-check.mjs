import { writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const baseUrl = process.env.CHECK_BASE_URL || "http://localhost:3000";

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

async function expectJson(res, label) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    fail(`[${label}] Expected JSON response, got: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    fail(`[${label}] HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

async function checkHealth() {
  const res = await fetch(`${baseUrl}/api/health`);
  const data = await expectJson(res, "health");
  if (data.status !== "ok") {
    fail(`[health] Unexpected status: ${JSON.stringify(data)}`);
  }
  log("PASS health");
}

function buildPayload(title, summary) {
  return {
    formData: {
      meta: {
        planTitle: title,
        preparedBy: "Smoke Check",
        date: "2026-03-20",
      },
    },
    sections: [
      {
        id: "meta",
        label: "Plan Overview",
        fields: [{ id: "f1", label: "Plan Title" }],
      },
    ],
    verticals: [],
    vertFields: [],
    kpiCats: [],
    roles: [],
    goalStatus: {},
    goalNotes: {},
    summary,
  };
}

async function checkDocx() {
  const payload = buildPayload("Smoke DOCX", "Smoke DOCX summary");
  const res = await fetch(`${baseUrl}/api/ard-generate?type=docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    fail(`[docx] HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
    fail(`[docx] Unexpected content-type: ${ct}`);
  }

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.length < 1000) {
    fail(`[docx] File too small: ${buf.length} bytes`);
  }

  const out = path.join(tmpdir(), "ard_smoke.docx");
  writeFileSync(out, buf);
  log(`PASS docx (${buf.length} bytes)`);
}

async function checkPdf() {
  const payload = buildPayload("Smoke PDF", "Smoke PDF summary");
  const res = await fetch(`${baseUrl}/api/ard-generate?type=pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    fail(`[pdf] HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/pdf")) {
    fail(`[pdf] Unexpected content-type: ${ct}`);
  }

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.length < 1000) {
    fail(`[pdf] File too small: ${buf.length} bytes`);
  }
  if (buf.slice(0, 4).toString() !== "%PDF") {
    fail("[pdf] Missing PDF signature");
  }

  const out = path.join(tmpdir(), "ard_smoke.pdf");
  writeFileSync(out, buf);
  const header = readFileSync(out).slice(0, 4).toString();
  if (header !== "%PDF") {
    fail("[pdf] Persisted file signature check failed");
  }
  log(`PASS pdf (${buf.length} bytes)`);
}

async function checkPersistence() {
  const saveRes = await fetch(`${baseUrl}/api/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Plan",
      formData: { meta: { planTitle: "Smoke Plan" } },
      sections: [],
      verticals: [],
      vertFields: [],
      kpiCats: [],
      roles: [],
      goalStatus: {},
      goalNotes: {},
      summary: "",
    }),
  });
  const saved = await expectJson(saveRes, "save");
  if (!saved.id) {
    fail("[save] Missing id in response");
  }

  const listRes = await fetch(`${baseUrl}/api/plans`);
  const plans = await expectJson(listRes, "plans");
  if (!Array.isArray(plans)) {
    fail("[plans] Expected array");
  }

  const loadRes = await fetch(`${baseUrl}/api/load/${saved.id}`);
  const loaded = await expectJson(loadRes, "load");
  if (loaded.id !== saved.id) {
    fail("[load] Loaded id does not match saved id");
  }

  const delRes = await fetch(`${baseUrl}/api/plans/${saved.id}`, { method: "DELETE" });
  const deleted = await expectJson(delRes, "delete");
  if (!deleted.success) {
    fail("[delete] Expected success=true");
  }

  log("PASS persistence");
}

async function main() {
  log(`Running smoke checks against ${baseUrl}`);
  if (!process.env.DATABASE_URL) {
    log("WARN no DATABASE_URL found in environment; persistence checks may fail.");
  }
  await checkHealth();
  await checkPersistence();
  await checkDocx();
  await checkPdf();
  log("Smoke check completed successfully.");
}

main().catch((err) => fail(`Smoke check failed: ${err.message}`));
