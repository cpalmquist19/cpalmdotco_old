import { getKnowledge } from "@/lib/knowledge";

// A static route, so the file is written at build time. The URL ends in .txt, so `trailingSlash` leaves it
// alone, as with the site icon (D-026, D-035). The pack holds only what the pages already show.
export const dynamic = "force-static";

export function GET() {
  return new Response(getKnowledge().text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
