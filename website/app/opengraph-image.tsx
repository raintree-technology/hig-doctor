import { ImageResponse } from "next/og";
import BrandMark from "@/components/BrandMark";

export const runtime = "nodejs";
export const alt = "HIG Doctor — Apple HIG skills, MCP tools, and audit CLI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#111318",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
          marginBottom: "28px",
        }}
      >
        <BrandMark width="104" height="104" fill="#f5f2ea" />
        <div
          style={{
            fontSize: "68px",
            fontWeight: 700,
            color: "#f5f2ea",
            letterSpacing: "-0.035em",
            lineHeight: 1,
          }}
        >
          HIG Doctor
        </div>
      </div>
      <div
        style={{
          fontSize: "27px",
          color: "rgba(245,242,234,0.62)",
          textAlign: "center",
          maxWidth: "780px",
          lineHeight: 1.4,
        }}
      >
        Apple HIG skills, MCP tools, and a universal interface audit CLI
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginTop: "40px",
          fontSize: "20px",
          color: "rgba(245,242,234,0.38)",
        }}
      >
        <span>14 skills</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
        <span>156 reference topics</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
        <span>Agent Skills spec</span>
      </div>
    </div>,
    { ...size },
  );
}
