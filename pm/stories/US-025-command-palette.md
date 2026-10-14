---
id: US-025
title: Slash command palette
sprint: S04
status: todo
owner: Claude
points: 5
priority: P0
depends_on: [US-022, US-023]
spec: F3.1–F3.5; CommandPalette
---

# US-025 · Slash command palette

As a **power user**, I want a `/` palette, so that I can jump to any topic from the keyboard.

## Acceptance criteria

- [ ] `/` in an empty input opens the palette above the input; under 640 px it opens as a bottom sheet (F3.1)
- [ ] Text after `/` filters the commands by name and description with fuzzy matching, best match first (F3.2)
- [ ] ↑ and ↓ move the highlight and wrap at the ends. Enter or Tab runs the highlighted command. Esc closes and keeps the typed text (F3.3)
- [ ] The input is `role="combobox"` with `aria-expanded` and `aria-activedescendant`, and the list is a `listbox` of `option`s (F3.4)
- [ ] The "More" chip opens the same palette (F3.5)
- [ ] Running a command does what clicking its chip does (same `ask`, same inline answer, same `pushState`) and clears the input

## Files to touch

- `lib/fuzzy.ts`: pure `rankCommands(commands, query)`, best match first (D-034)
- `components/palette/CommandPalette.tsx`: the `listbox` of `option`s, as a popover above the input, or a bottom sheet under 640 px
- `components/palette/useCommandPalette.ts`: the open state, the query, the highlight and the key handling. Returns the props for the input and the palette, so US-032's `ChatInput` reuses it
- `components/hero/PillInput.tsx`: combobox wiring and the palette's anchor
- `components/hero/HomeHero.tsx`: passes every command to the input, and opens the palette from the "More" chip
- `components/chips/ChipRow.tsx`: the "More" chip, a button that is hidden when JavaScript is off
- `tests/unit/lib/fuzzy.test.ts`
- `tests/e2e/palette.spec.ts`

## Out of scope

- Sending free text, `/api/chat` and streaming: US-029 and US-032. Enter on text that isn't a `/` command still does nothing new here
- Sidebar items and "Surprise me": US-024
- Running a command whose `answer` is `"model"`: none exist yet. US-032 makes them reach the chat
- Replacing `PillInput` with `ChatInput` (auto-grow, send button, counter): US-032. It keeps the palette by reusing the hook
- Command arguments, history, or recently used ordering
- Changing the chips, the provider or `ask` beyond adding the "More" chip: US-023

## Tests to add

`tests/unit/lib/fuzzy.test.ts`:

- `US-025 F3.2: an empty query returns every command in order`
- `US-025 F3.2: matching ignores case`
- `US-025 F3.2: letters must appear in order, so "pjt" matches "projects" and "ptj" does not`
- `US-025 F3.2: a name prefix ranks above a later match in the name`
- `US-025 F3.2: a name match ranks above a description match`
- `US-025 F3.2: ties are broken by order`
- `US-025 F3.2: a query that matches nothing returns an empty list`

`tests/e2e/palette.spec.ts`:

- `US-025 F3.1: typing / in an empty input opens the palette above the input @desktop-only`
- `US-025 F3.1: the palette is a bottom sheet under 640 px @mobile-only`
- `US-025 F3.1: a / typed after other text does not open it`
- `US-025 F3.2: text after / filters by name and description`
- `US-025 F3.3: arrow keys move the highlight and wrap at both ends`
- `US-025 F3.3: Enter runs the highlighted command`
- `US-025 F3.3: Tab runs the highlighted command and focus stays in the input`
- `US-025 F3.3: Esc closes the palette and keeps the typed text`
- `US-025 F3.4: the input is a combobox and the list is a listbox of options`
- `US-025 F3.4: aria-activedescendant follows the highlight`
- `US-025 F3.5: the More chip opens the palette with every command`
- `US-025: the More chip is not shown with JavaScript off`
- `US-025: palette entries come from commands.json, chip or not`

## Notes

- **The ARIA pattern** is the WAI-ARIA combobox with a listbox popup: the input has `role="combobox"`, `aria-controls` (the listbox id), `aria-expanded`, `aria-autocomplete="list"` and `aria-activedescendant` (the highlighted option's id). Focus stays in the input the whole time. Options get `role="option"` and `aria-selected` on the highlighted one.
- **When it opens.** While the input's value starts with `/` and has no space. The query is the text after the `/`. Esc closes it and keeps the text. It reopens when the visitor types again. Nothing opens it for a `/` typed after other text.
- **Fuzzy matching (D-034).** Case-insensitive subsequence match over the command name (without the slash) and the description. Rank: name prefix, then a match at a word start in the name, then any subsequence in the name, then a match in the description. Ties by `order`. No package.
- **Every command is listed**, including `chip: false` ones, in `order`.
- **Running.** Enter or Tab calls the same `ask(command)` as a chip click (US-023's provider), clears the input, closes the palette, and leaves focus in the input. Call `preventDefault` on Tab only while the palette is open and a command is highlighted, or keyboard users get trapped.
- **Nothing matches.** Show one line, "No commands match", outside the `listbox` with `role="status"`, because an empty `listbox` fails axe's `aria-required-children`.
- **"More".** A `<button>` styled as a chip with a Lucide icon (`Ellipsis`; check the name exists in the pinned `lucide-react`). Under `@media (scripting: none)` it's hidden, because the palette needs JavaScript. Clicking it opens the palette with an empty query and focuses the input.
- **Bottom sheet.** Fixed to the bottom edge under 640 px. On iOS the on-screen keyboard can cover a fixed bottom sheet, so confirm it sits above the keyboard on a real device in US-041. Don't use a fixed wait or a device check in the test.
- **Motion.** Anything animated uses `motion-safe:` (CODING § 5).
- **US-032 inherits this.** Keep the palette logic in the hook, so `ChatInput` can take it without a rewrite.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Scoped in US-072. Added US-023 to `depends_on`: the "More" chip lives in US-023's chip row and both stories change `HomeHero.tsx`. Added a criterion that running a command behaves like a chip click. Recorded D-034 · — · —
