import { verifyJWT } from "@/lib/auth";
import { getChain } from "@/lib/chains";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, context) {
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

    const { chainId } = await context.params;
    const chain = await getChain(payload.email, chainId);

    if (!chain) {
      return NextResponse.json({ error: "Chain not found" }, { status: 404 });
    }

    return NextResponse.json(chain);
  } catch (error) {
    console.error("Error fetching chain:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
