import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Tab/favicon icon (replaces default Next.js icon).
 * To use your own: replace this file with app/icon.png or app/favicon.ico.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f8fafc",
          borderRadius: 6,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
