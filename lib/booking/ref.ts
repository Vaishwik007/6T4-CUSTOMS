/**
 * Booking reference generator — short, human-friendly token that goes on
 * WhatsApp messages, emails, and admin lookups. Mirrors the `6T4-B-XXXXX`
 * convention used by the legacy WhatsApp handoff form.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip 0/O/1/I

export function generateBookingRef(): string {
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `6T4-B-${suffix}`;
}
