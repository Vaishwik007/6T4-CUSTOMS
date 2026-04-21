import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/context";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    admin: {
      id: admin.sub,
      username: admin.username,
      role: admin.role,
      forcePasswordChange: admin.fpc ?? false
    }
  });
}
