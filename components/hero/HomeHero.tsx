"use client";

import { useState } from "react";
import { PillInput } from "@/components/hero/PillInput";
import { RotatingHeadline } from "@/components/hero/RotatingHeadline";

type Props = { greeting: string; pool: string[] };

// The home page's top half. The headline stops while the input has focus (F1.4).
export function HomeHero({ greeting, pool }: Props) {
  const [inputFocused, setInputFocused] = useState(false);
  return (
    <div>
      <RotatingHeadline greeting={greeting} pool={pool} paused={inputFocused} />
      <div className="mt-8 max-w-2xl">
        <PillInput onFocusChange={setInputFocused} />
      </div>
    </div>
  );
}
