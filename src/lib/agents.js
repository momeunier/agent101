import redis from "./redis";

export async function createAgent(email, agent) {
  try {
    const agentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `agents:${email}:${agentId}`;

    await redis.hmset(key, {
      ...agent,
      id: agentId,
      createdAt: new Date().toISOString(),
    });

    // Add to user's agent list
    await redis.sadd(`agents:${email}`, agentId);

    return { id: agentId, ...agent };
  } catch (error) {
    console.error("Error creating agent:", error);
    throw new Error("Failed to create agent");
  }
}

export async function getAgents(email) {
  try {
    // Get all agent IDs for the user
    const agentIds = await redis.smembers(`agents:${email}`);

    // Get each agent's details
    const agents = await Promise.all(
      agentIds.map(async (id) => {
        const agent = await redis.hgetall(`agents:${email}:${id}`);
        return agent;
      })
    );

    // Sort by creation date
    return agents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw new Error("Failed to fetch agents");
  }
}

export async function deleteAgent(email, agentId) {
  try {
    // Remove agent details
    await redis.del(`agents:${email}:${agentId}`);
    // Remove from user's agent list
    await redis.srem(`agents:${email}`, agentId);
    return true;
  } catch (error) {
    console.error("Error deleting agent:", error);
    throw new Error("Failed to delete agent");
  }
}

export async function updateAgent(email, agentId, updates) {
  try {
    const key = `agents:${email}:${agentId}`;
    await redis.hmset(key, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { id: agentId, ...updates };
  } catch (error) {
    console.error("Error updating agent:", error);
    throw new Error("Failed to update agent");
  }
}

export async function runAgent(email, agentId) {
  try {
    // Get the agent details
    const agent = await redis.hgetall(`agents:${email}:${agentId}`);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Create a unique run ID
    const runId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const runKey = `runs:${email}:${agentId}:${runId}`;

    // Create run instance with agent data and status
    await redis.hmset(runKey, {
      ...agent,
      status: "Run",
      startedAt: new Date().toISOString(),
      runId,
    });

    // Set TTL for 24 hours
    await redis.expire(runKey, 24 * 60 * 60); // 24 hours in seconds

    return runId;
  } catch (error) {
    console.error("Error running agent:", error);
    throw new Error("Failed to run agent");
  }
}

// Add function to get runs for an agent
export async function getAgentRuns(email, agentId) {
  try {
    // Get all runs for this agent
    const runKeys = await redis.keys(`runs:${email}:${agentId}:*`);

    // Get details for each run
    const runs = await Promise.all(
      runKeys.map(async (key) => {
        const run = await redis.hgetall(key);
        return run;
      })
    );

    // Sort by start time, most recent first
    return runs.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  } catch (error) {
    console.error("Error getting agent runs:", error);
    throw new Error("Failed to get agent runs");
  }
}
