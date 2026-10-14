import { RATE_LIMIT_PER_DAY, RATE_LIMIT_PER_MINUTE } from "@/lib/chat-limits";
import { createChatHandler } from "@/lib/chat";
import { anthropicProvider } from "@/lib/chat-provider";
import { createRateLimiter } from "@/lib/ratelimit";

// The Node runtime, and never prerendered: every request streams a fresh answer. The key is read
// per request inside the provider, so `next build` needs none.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// An answer may take up to its 20 s limit, so the function must be allowed to run that long (US-031).
export const maxDuration = 30;

// One limiter for every request this server instance handles (D-045).
const limiter = createRateLimiter({ perMinute: RATE_LIMIT_PER_MINUTE, perDay: RATE_LIMIT_PER_DAY });

export const POST = createChatHandler(anthropicProvider(), { rateLimiter: limiter });
