import { HomeHero } from "@/components/hero/HomeHero";
import { getCommands, getProfile } from "@/lib/content";

// Prerendered at build time, like the content pages. The build fails if this page needs a request (F5.5).
export const dynamic = "error";

export default function Home() {
  const profile = getProfile();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 lg:px-8">
      <HomeHero greeting={profile.greeting} pool={profile.headlinePool} commands={getCommands()} />
    </main>
  );
}
