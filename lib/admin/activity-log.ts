import { createAdminSupabase } from "@/lib/supabase/admin";

export type ActivityAction =
  | "login"
  | "logout"
  | "login_failed"
  | "password_changed"
  | "admin_created"
  | "admin_deleted"
  | "admin_role_changed"
  | "admin_reset_password"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "stock_adjusted"
  | "bulk_import"
  | "order_status_changed"
  | "invoice_generated"
  | "notification_marked_read"
  | "settings_changed";

export async function logActivity({
  adminId,
  adminUsername,
  action,
  targetType,
  targetId,
  metadata,
  ip,
  userAgent
}: {
  adminId?: string | null;
  adminUsername?: string | null;
  action: ActivityAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const supa = createAdminSupabase();
  if (!supa) return;
  await supa.from("admin_activity_log").insert({
    admin_id: adminId ?? null,
    admin_username: adminUsername ?? null,
    action,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata: metadata ?? null,
    ip: ip ?? null,
    user_agent: userAgent ?? null
  });
}
