import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Dynamic Open Graph image generator.
 *
 * Usage:
 *   /api/og?title=Your%20Title&subtitle=Optional&eyebrow=Optional
 *
 * Cached at edge for one year — different query strings = different cache keys.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "6T4 Customs").slice(0, 80);
  const subtitle = (searchParams.get("subtitle") ?? "Built Different. Tuned Brutal.").slice(0, 120);
  const eyebrow = (searchParams.get("eyebrow") ?? "Hyderabad · Performance Garage").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(225,5,0,0.22) 0%, transparent 55%), linear-gradient(135deg, #0a0a0a 0%, #000 60%, #1a0000 100%)",
          color: "#e6e6e6",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 18,
              color: "#E10500",
              letterSpacing: 8,
              textTransform: "uppercase",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
          >
            <span style={{ display: "inline-block", width: 32, height: 2, background: "#E10500" }} />
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              color: "#e6e6e6",
              fontWeight: 900,
              lineHeight: 1.0,
              textTransform: "uppercase",
              letterSpacing: -2
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#9aa0a6",
              marginTop: 24,
              maxWidth: 920,
              lineHeight: 1.3
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 32
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: "#e6e6e6",
              fontWeight: 900,
              letterSpacing: 6,
              textTransform: "uppercase"
            }}
          >
            6T4 CUSTOMS
          </div>
          <div style={{ fontSize: 18, color: "#9aa0a6", letterSpacing: 4, textTransform: "uppercase" }}>
            6t4customs.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  );
}
