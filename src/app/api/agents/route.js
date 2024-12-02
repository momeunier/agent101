import { verifyJWT } from "@/lib/auth";
import { createAgent, getAgents, deleteAgent, updateAgent } from "@/lib/agents";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Get all agents for the user
export async function GET() {
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

    const agents = await getAgents(payload.email);
    return NextResponse.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new agent
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

    const agentData = await request.json();
    const agent = await createAgent(payload.email, agentData);
    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete an agent
export async function DELETE(request) {
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
    await deleteAgent(payload.email, agentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update an agent
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

    const { agentId, ...updates } = await request.json();
    const agent = await updateAgent(payload.email, agentId, updates);
    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
