import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  await cookieStore.delete("auth_token");
  return NextResponse.json({ message: "Logged out successfully" });
}
