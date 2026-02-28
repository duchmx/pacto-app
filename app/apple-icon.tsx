import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Icon shown when adding the app to iPhone home screen.
 * To use your own: replace with app/apple-icon.png (180×180 recommended).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 88,
          fontWeight: 700,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f8fafc",
          borderRadius: 32,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
