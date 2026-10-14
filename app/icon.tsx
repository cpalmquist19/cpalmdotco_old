import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/content";
import { getInitials } from "@/lib/initials";
import { THEME_COLORS } from "@/lib/theme";

// Next.js links this icon from every page, so the browser tab shows it (US-050).
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// ImageResponse can't read CSS variables, so the colours come from THEME_COLORS, which holds the
// --bg values from globals.css: the tile is the dark background and the letters the light one.
export default function Icon() {
  const initials = getInitials(getProfile().name);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: THEME_COLORS.dark,
        color: THEME_COLORS.light,
        fontSize: 14,
      }}
    >
      {initials}
    </div>,
    { ...size },
  );
}
