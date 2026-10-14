import { describe, expect, it } from "vitest";
import { askedThread, historyState, messagesFor, threadFromState } from "@/lib/conversation";
import type { Command } from "@/lib/content-schemas";

// A minimal command. The thread only reads its name, label, answer and intro, so the other fields are fixed.
function command(name: string, label: string): Command {
  return {
    command: name,
    label,
    description: `${label} description`,
    answer: `${name}/`,
    chip: true,
    order: 1,
    icon: "user",
  };
}

const about = command("/about", "About");
const skills = command("/skills", "Skills");
const commands = [about, skills];

describe("US-023 F2.3: the conversation thread", () => {
  it("US-023: asking a command adds the visitor message and then its answer", () => {
    const thread = askedThread([], "/about");

    expect(messagesFor(thread, commands)).toEqual([
      { role: "visitor", command: about },
      { role: "bot", command: about },
    ]);
    expect(messagesFor(askedThread(thread, "/skills"), commands)).toEqual([
      { role: "visitor", command: about },
      { role: "bot", command: about },
      { role: "visitor", command: skills },
      { role: "bot", command: skills },
    ]);
  });

  it("US-023: history state holding known command names becomes a thread", () => {
    // Next adds its own keys to the state object, so an unknown key must not stop the thread being read.
    const state = { __NA: true, turns: ["/about", "/skills"] };

    expect(threadFromState(state, commands)).toEqual(["/about", "/skills"]);
    expect(threadFromState(historyState(["/skills"]), commands)).toEqual(["/skills"]);
  });

  it("US-023: history state of any other shape gives an empty thread", () => {
    for (const state of [
      null,
      undefined,
      "turns",
      3,
      [],
      {},
      { turns: "/about" },
      { turns: [1] },
    ]) {
      expect(threadFromState(state, commands)).toEqual([]);
    }
  });

  it("US-023: a command name that is no longer in commands.json is dropped", () => {
    const state = { turns: ["/about", "/removed", "/skills"] };

    expect(threadFromState(state, commands)).toEqual(["/about", "/skills"]);
    expect(messagesFor(["/removed"], commands)).toEqual([]);
  });
});
