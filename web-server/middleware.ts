import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Middleware to set a cookie with a unique user id
export function middleware(req: NextRequest) {
  // Get the user id from the cookie
  let userId = req.cookies.get("userId")?.value;

  // If the user id is not set, generate a new one and set it in the cookie
  if (!userId) {
    // Generate a new user id
    userId = uuidv4();

    // Set the user id in the cookie
    const res = NextResponse.next();
    res.cookies.set("userId", userId, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return res;
  }

  return NextResponse.next();
}
