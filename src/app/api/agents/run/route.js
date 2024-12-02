import { verifyJWT } from "@/lib/auth";
import { runAgent } from "@/lib/agents";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { agentId } = await request.json();
    const runId = await runAgent(payload.email, agentId);
    return NextResponse.json({ runId });
  } catch (error) {
    console.error("Error running agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
