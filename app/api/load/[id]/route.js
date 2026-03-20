import { NextResponse } from "next/server";
import { getPlanById } from "../../../../lib/planRepository";

export async function GET(_request, { params }) {
  try {
    const resolvedParams = await params;
    const record = await getPlanById(resolvedParams.id);

    if (!record) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
