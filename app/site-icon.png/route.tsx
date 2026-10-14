import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/content";
import { getInitials } from "@/lib/initials";
import { THEME_COLORS } from "@/lib/theme";

// The `icon.tsx` convention is served at /icon, which has no file extension, so `trailingSlash`
// redirects it on every first load. A route with an extension is left alone (US-069).
export const dynamic = "force-static";

const SIZE = 32;

// ImageResponse can't read CSS variables, so the colours come from THEME_COLORS, which holds the
// --bg values from globals.css: the tile is the dark background and the letters the light one.
export function GET() {
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
    { width: SIZE, height: SIZE },
  );
}
