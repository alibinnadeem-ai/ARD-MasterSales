import { NextResponse } from "next/server";
import { deletePlan } from "../../../../lib/planRepository";

export async function DELETE(_request, { params }) {
  try {
    const resolvedParams = await params;
    return NextResponse.json(await deletePlan(resolvedParams.id));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
