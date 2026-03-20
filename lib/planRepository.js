import { ensureSchema, query } from "./db";

export async function savePlan(record) {
  await ensureSchema();

  await query(
    `
      INSERT INTO sales_plans (id, name, saved_at, record)
      VALUES ($1, $2, $3, $4::jsonb)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        saved_at = EXCLUDED.saved_at,
        record = EXCLUDED.record
    `,
    [record.id, record.name, record.savedAt, JSON.stringify(record)]
  );

  return { id: record.id, name: record.name, savedAt: record.savedAt };
}

export async function getPlanById(id) {
  await ensureSchema();
  const result = await query(`SELECT record FROM sales_plans WHERE id = $1`, [id]);
  if (!result.rowCount) return null;
  return result.rows[0].record;
}

export async function listPlans() {
  await ensureSchema();
  const result = await query(
    `SELECT id, name, saved_at FROM sales_plans ORDER BY saved_at DESC`
  );
  return result.rows.map((r) => ({
    id: r.id,
    name: r.name,
    savedAt: r.saved_at instanceof Date ? r.saved_at.toISOString() : r.saved_at,
  }));
}

export async function deletePlan(id) {
  await ensureSchema();
  await query(`DELETE FROM sales_plans WHERE id = $1`, [id]);
  return { success: true };
}
