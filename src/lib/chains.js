import redis from "./redis";
import { ChainStatus } from "./constants";

export async function createChain(email, chain) {
  try {
    const chainId = `chain_${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const key = `chains:${email}:${chainId}`;

    await redis.hmset(key, {
      ...chain,
      id: chainId,
      owner: email,
      status: chain.status || ChainStatus.TODO,
      createdAt: new Date().toISOString(),
    });

    // Add to user's chain list
    await redis.sadd(`chains:${email}`, chainId);

    return { id: chainId, ...chain };
  } catch (error) {
    console.error("Error creating chain:", error);
    throw new Error("Failed to create chain");
  }
}

export async function getChains(email) {
  try {
    const chainIds = await redis.smembers(`chains:${email}`);

    const chains = await Promise.all(
      chainIds.map(async (id) => {
        const chain = await redis.hgetall(`chains:${email}:${id}`);
        return chain;
      })
    );

    return chains.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching chains:", error);
    throw new Error("Failed to fetch chains");
  }
}

export async function getChain(email, chainId) {
  try {
    const chain = await redis.hgetall(`chains:${email}:${chainId}`);
    if (!chain || Object.keys(chain).length === 0) {
      return null;
    }
    return chain;
  } catch (error) {
    console.error("Error fetching chain:", error);
    throw new Error("Failed to fetch chain");
  }
}

export async function updateChainStatus(email, chainId, status) {
  try {
    const key = `chains:${email}:${chainId}`;
    await redis.hset(key, "status", status);
    return true;
  } catch (error) {
    console.error("Error updating chain status:", error);
    throw new Error("Failed to update chain status");
  }
}
