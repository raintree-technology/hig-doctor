import { ImageResponse } from "next/og";
import BrandMark from "@/components/BrandMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#3157c8",
      }}
    >
      <BrandMark width="108" height="108" fill="#f5f2ea" />
    </div>,
    { ...size },
  );
}
