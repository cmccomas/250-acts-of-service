import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "./types";

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "acts-admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
