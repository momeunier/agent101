import { verifyJWT, updateUserProfile } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request) {
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

    const profile = await request.json();
    const updatedProfile = await updateUserProfile(payload.email, {
      ...profile,
      email: payload.email, // Ensure email cannot be changed
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
