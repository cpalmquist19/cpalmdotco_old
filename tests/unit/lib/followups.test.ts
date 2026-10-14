import { describe, expect, it } from "vitest";
import { followupsFor } from "@/lib/followups";
import { commandOf } from "@/tests/unit/helpers/command";

const commands = [
  commandOf({
    command: "/about",
    label: "About",
    answer: "/about/",
    order: 1,
    question: "What's your background?",
  }),
  commandOf({
    command: "/experience",
    label: "Experience",
    answer: "/experience/",
    order: 2,
    question: "Where have you worked?",
  }),
  commandOf({
    command: "/projects",
    label: "Projects",
    answer: "/projects/",
    order: 3,
    question: "What have you built?",
  }),
  commandOf({
    command: "/skills",
    label: "Skills",
    answer: "/skills/",
    order: 4,
    question: "What do you work with?",
  }),
  commandOf({ command: "/contact", label: "Contact", answer: "/contact/", order: 5 }),
];

const none: never[] = [];

describe("US-030", () => {
  it("US-030: follow-ups skip the page the answer linked, including a project under /projects/", () => {
    const followups = followupsFor({
      links: [{ label: "Atlas API test harness", href: "/projects/atlas-api/" }],
      commands,
      asked: none,
    });

    expect(followups).not.toContain("What have you built?");
    expect(followups).toEqual([
      "What's your background?",
      "Where have you worked?",
      "What do you work with?",
    ]);
  });

  it("US-030: questions the visitor already asked come last", () => {
    // Two pages are linked, so only About, Projects and Skills can be offered. About was asked, so it goes last.
    const followups = followupsFor({
      links: [
        { label: "Experience", href: "/experience/" },
        { label: "Contact", href: "/contact/" },
      ],
      commands,
      asked: ["  what's YOUR background? "],
    });

    expect(followups).toEqual([
      "What have you built?",
      "What do you work with?",
      "What's your background?",
    ]);
  });

  it("US-030: at most three, in order, and every one is a question from commands.json", () => {
    const followups = followupsFor({ links: [], commands, asked: none });

    expect(followups).toEqual([
      "What's your background?",
      "Where have you worked?",
      "What have you built?",
    ]);
    const questions = commands.flatMap((command) => (command.question ? [command.question] : []));
    for (const followup of followups) expect(questions).toContain(followup);
  });

  it("US-030: a command with no question is never offered", () => {
    const followups = followupsFor({
      links: [{ label: "Experience", href: "/experience/" }],
      commands,
      asked: none,
    });

    // Contact has no question, and Experience is linked, so only three questions can be left.
    expect(followups).toEqual([
      "What's your background?",
      "What have you built?",
      "What do you work with?",
    ]);
    expect(followups).toHaveLength(3);
    const onlyContact = followupsFor({
      links: [],
      commands: [
        commandOf({ command: "/contact", label: "Contact", answer: "/contact/", order: 1 }),
      ],
      asked: none,
    });
    expect(onlyContact).toEqual([]);
  });
});
