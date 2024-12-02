import jwt from "jsonwebtoken";
import redis from "./redis";
import crypto from "crypto";

const TOKEN_EXPIRY = "24h";
const MAGIC_LINK_EXPIRY = 60 * 10; // 10 minutes in seconds

export async function createMagicLink(email) {
  try {
    const token = crypto.randomBytes(32).toString("hex");

    // Set the magic link token in Redis
    await redis.set(`magic_link:${token}`, email, "EX", MAGIC_LINK_EXPIRY);

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      console.log("Magic Link:", magicLink);
    } else {
      // TODO: Implement email sending in production
    }

    return magicLink;
  } catch (error) {
    console.error("Error creating magic link:", error);
    throw new Error("Failed to create magic link");
  }
}

export async function verifyMagicLink(token) {
  try {
    const email = await redis.get(`magic_link:${token}`);
    if (!email) return null;

    // Delete the token after use
    await redis.del(`magic_link:${token}`);
    return email;
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return null;
  }
}

export function createJWT(email) {
  try {
    return jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
  } catch (error) {
    console.error("Error creating JWT:", error);
    throw new Error("Failed to create authentication token");
  }
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return null;
  }
}

export async function getUserProfile(email) {
  try {
    const profile = await redis.hgetall(`user:${email}`);
    return profile || { email };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { email };
  }
}

export async function updateUserProfile(email, profile) {
  try {
    await redis.hmset(`user:${email}`, profile);
    return profile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update profile");
  }
}
