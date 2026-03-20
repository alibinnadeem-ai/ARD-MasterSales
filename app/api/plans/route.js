import { NextResponse } from "next/server";
import { listPlans } from "../../../lib/planRepository";

export async function GET() {
  try {
    const plans = await listPlans();
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
