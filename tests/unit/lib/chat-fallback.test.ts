import { describe, expect, it } from "vitest";
import { fallbackFor } from "@/lib/chat-fallback";
import { commandOf } from "@/tests/unit/helpers/command";

const commands = [
  commandOf({ command: "/about", label: "About", answer: "/about/", order: 1 }),
  commandOf({ command: "/experience", label: "Experience", answer: "/experience/", order: 2 }),
  commandOf({ command: "/projects", label: "Projects", answer: "/projects/", order: 3 }),
  commandOf({ command: "/skills", label: "Skills", answer: "/skills/", order: 4 }),
  commandOf({ command: "/contact", label: "Contact", answer: "/contact/", order: 5 }),
];

describe("US-031", () => {
  it("US-031: a question naming a page's label gets that page", () => {
    expect(fallbackFor("What's your experience?", commands)).toBe("/experience/");
  });

  it("US-031: the label match ignores case and a plural s", () => {
    expect(fallbackFor("PROJECT ideas?", commands)).toBe("/projects/");
    expect(fallbackFor("show me projects", commands)).toBe("/projects/");
  });

  it("US-031: with two labels in the question, the one that comes last wins", () => {
    // "About" comes first in the question, so Projects, the later word, is the page.
    expect(fallbackFor("what do you know about projects", commands)).toBe("/projects/");
  });

  it("US-031: no label gives /about/", () => {
    expect(fallbackFor("How is the weather today?", commands)).toBe("/about/");
  });
});
