import { ImageResponse } from "next/og";
import {
  APP_NAME,
  APP_SERIES_LABEL,
  APP_TAGLINE,
  APP_TRUST_LINE,
} from "@/lib/brand";

export const runtime = "edge";
export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(145deg, #0d1210 0%, #14241c 48%, #1a4d3a 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#2dd4a0",
                color: "#0d1210",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              HC
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 38, fontWeight: 800, display: "flex" }}>
                Habit<span style={{ color: "#2dd4a0" }}>Check</span>
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: 1,
                  display: "flex",
                }}
              >
                {APP_SERIES_LABEL}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
                display: "flex",
                maxWidth: 980,
              }}
            >
              {APP_TAGLINE}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.35,
                maxWidth: 900,
                display: "flex",
              }}
            >
              {APP_TRUST_LINE}
            </div>
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            {["Facts in code", "Coach is optional", "No streak theater"].map(
              (chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    padding: "12px 24px",
                    borderRadius: 999,
                    background: "rgba(45,212,160,0.12)",
                    border: "1px solid rgba(45,212,160,0.35)",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  {chip}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
