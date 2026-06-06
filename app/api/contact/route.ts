import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/admin/email";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import { getClientIp } from "@/lib/admin/context";

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[\d\s-]{7,20}$/, "Invalid phone"),
  email: z.string().email().optional().or(z.literal("")),
  service: z.enum(["Tuning", "Service", "Fabrication", "Parts", "General", "tuning", "service", "fabrication", "parts", "general"]),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers) ?? "unknown";
  const rl = await checkRateLimit({
    identifier: ip,
    kind: "customer",
    maxAttempts: 5,
    windowMinutes: 60,
  });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const parsed = ContactSchema.safeParse(
    await req.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, phone, email, service, message } = parsed.data;

  await sendContactEmail({
    from_name: name,
    from_phone: phone,
    from_email: email || undefined,
    service,
    message,
  });

  return NextResponse.json({ ok: true });
}
