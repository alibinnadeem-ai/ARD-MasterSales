import { NextResponse } from "next/server";
import { savePlan } from "../../../lib/planRepository";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, ...planData } = body;

    const planId = id || crypto.randomUUID();
    const planName =
      name ||
      planData?.formData?.meta?.planTitle ||
      `Plan ${new Date().toLocaleDateString()}`;

    const record = {
      id: planId,
      name: planName,
      savedAt: new Date().toISOString(),
      ...planData,
    };

    const saved = await savePlan(record);
    return NextResponse.json({ success: true, ...saved });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
