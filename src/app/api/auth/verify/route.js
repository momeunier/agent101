import { verifyMagicLink, createJWT } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=invalid-token", request.url)
      );
    }

    const email = await verifyMagicLink(token);
    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=expired-token", request.url)
      );
    }

    const jwt = createJWT(email);
    const cookieStore = await cookies();

    await cookieStore.set("auth_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=server-error", request.url)
    );
  }
}
