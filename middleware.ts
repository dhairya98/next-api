import { NextResponse } from "next/server";
import { authMiddleware } from "./middlewares/api/authMiddleWare";

// Path to protect
export const config = {
  matcher: "/api/:path*",
};

export default function middleware(request: Request) {
  const authResult = authMiddleware(request);
  if (!authResult?.isValid && request.url.includes("/api/blogs")) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  return NextResponse.next();
}
