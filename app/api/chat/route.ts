import { createChatHandler } from "@/lib/chat";
import { anthropicProvider } from "@/lib/chat-provider";

// The Node runtime, and never prerendered: every request streams a fresh answer. The key is read
// per request inside the provider, so `next build` needs none.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createChatHandler(anthropicProvider());
