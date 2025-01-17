import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({
    message: "This is a protected API route",
    user: session.user,
  });
}
