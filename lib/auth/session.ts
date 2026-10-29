import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production",
);

export interface SessionPayLoad {
  userId: string;
  fullName: string;
  role: string;
}

// Create Session
export async function createSession(payload: SessionPayLoad) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

// Get Session
export async function getSession(): Promise<SessionPayLoad | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayLoad;
  } catch {
    return null;
  }
}

// Delete Cookie
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
