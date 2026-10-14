---
id: US-024
title: Wire sidebar items to the chat
sprint: S04
status: todo
owner: Claude
points: 3
priority: P1
depends_on: [US-022, US-023]
spec: F0.2; F0.3; F2.3
---

# US-024 · Wire sidebar items to the chat

As a **visitor**, I want sidebar items to answer in the chat, so that the sidebar and chips behave the same way.

## Acceptance criteria

- [ ] On the home page, a plain click on an ASK ABOUT item does what clicking its chip does: the label appears as a visitor message, the answer appears below it, and `history.pushState` sets the item's page URL. The item keeps its `href` (F0.2, F2.3)
- [ ] A click with a modifier key, or a middle click, follows the link and is not intercepted (F0.2)
- [ ] With JavaScript off, and on a real content page (a reload of `/about/`, or a direct visit), an item is a plain link and loads its page (F0.2)
- [ ] In the mobile drawer, an item asks in the chat and closes the drawer (F0.2, F0.3)
- [ ] The loader fails the build when a command in `profile.sidebar.askAbout` has `answer: "model"`, because the sidebar would render `href="model"` (F0.2)

## Files to touch

- `lib/click.ts`: pure `isPlainClick({ button, metaKey, ctrlKey, shiftKey, altKey })`, moved out of `Chip.tsx` so the chips and the sidebar share one rule
- `components/chips/Chip.tsx`: uses `isPlainClick`. Behaviour doesn't change
- `components/shell/Sidebar.tsx`: each ASK ABOUT `Link` gets an `onClick` that asks the command while the home page is mounted
- `lib/content.ts`: a check in `commandProblems` that every `askAbout` command has a page `answer`
- `tests/unit/lib/click.test.ts`
- `tests/unit/lib/content.test.ts`: the loader check, next to the unknown-command test
- `tests/e2e/sidebar-chat.spec.ts`: the sidebar tests below, in a new file so no unfinished story's spec is shared

## Out of scope

- PROJECTS items, the social row and the identity link. They aren't questions, so they stay plain links (D-040)
- "New chat" clearing the thread: US-032. Its `TODO(US-032)` in `Sidebar.tsx` stays
- What the answer holds: D-032, and `Message`. The sidebar calls the same `ask`, so a change there changes both
- Showing a thread on a content page, or a `current page` style on the item
- Changing `ConversationProvider`, `HomeHero` or `SkipLink`. This story only reads `ask` and `homeMounted`
- Choosing a palette option by tap or click: raised in US-026's Notes, not a sidebar matter
- Changing `content/commands.json` or `content/profile.json`
- The existing sidebar and drawer tests in `shell.spec.ts` and `drawer.spec.ts`, which US-060 and US-075 also change. None of them needs an edit (see Notes)

## Tests to add

`tests/unit/lib/click.test.ts`:

- `US-024 F0.2: a primary click with no modifier is a plain click`
- `US-024 F0.2: a middle or right click is not`
- `US-024 F0.2: each of Ctrl, Cmd, Shift and Alt makes it not plain`

`tests/unit/lib/content.test.ts`:

- `US-024 F0.2: an askAbout command whose answer is "model" fails`
- `US-024 F0.2: a command that isn't in askAbout may answer "model"`

`tests/e2e/sidebar-chat.spec.ts`:

- `US-024 F0.2: a sidebar click shows the label and the inline answer, and pushes the page URL @desktop-only`
- `US-024 F0.2: Back restores the thread from before the sidebar click @desktop-only`
- `US-024 F0.2: a sidebar item still has its href after a click @desktop-only`
- `US-024 F0.2: a click with a modifier key is not intercepted @desktop-only`
- `US-024 F0.2: in the collapsed rail an item asks in the chat @desktop-only`
- `US-024 F0.2: on a real content page an item loads its page and shows no thread @desktop-only`
- `US-024 F0.2: a PROJECTS item still loads its case study @desktop-only`
- `US-024 F0.2: with JavaScript off a sidebar item loads its page @desktop-only` (a `describe` with `test.use({ javaScriptEnabled: false })`)
- `US-024 F0.2: in the drawer an item asks in the chat and closes the drawer @mobile-only`

## Notes

- **What exists.** `Sidebar` is already a client component under `ConversationProvider` (mounted by `AppShell`), and `MobileDrawer` renders the same `Sidebar` inside a `<dialog>`. `useConversation()` returns `ask` and `homeMounted`. Each ASK ABOUT item is a `next/link` `Link` with `href={command.answer}`. `Chip` has the click rule inline.
- **The click rule.** The same as the chips: a plain primary-button click with no modifier calls `event.preventDefault()` and `ask(command)`. Any other click is left to the `Link`. `next/link` skips its own navigation when the handler has called `preventDefault`.
- **Ask only while the home page is mounted.** The thread lives in `HomeHero`. A sidebar click on a real content page has no thread to show, and `pushState` there would put `/skills/` in the address bar over the About page. So the handler asks only when `homeMounted` is true, and otherwise does nothing, so the `Link` navigates as it does today. Use `homeMounted`, not `usePathname() === "/"`: after a chip click the pathname is `/about/` while the home page is still on screen, and the sidebar must ask again then. That is the same reasoning as `SkipLink`. Caleb can redirect this reading: F0.2 says "asks its question in the chat" and the chat is only on the home page until a later story changes that.
- **Before hydration.** `homeMounted` is false on the server and until `HomeHero`'s effect runs, so the item is a plain link until the page is interactive. That is the F2.2 behaviour, and it means no click is lost.
- **The drawer.** `MobileDrawer`'s `closeOnLink` closes the dialog for any click that lands inside an `<a>`, whether or not the handler prevented the default, so no change is needed there. Check the drawer test closes it and the thread shows the answer behind it.
- **The loader check.** In `commandProblems`, after the unknown-command check, for each name in `profile.sidebar.askAbout` that resolves to a command: if `answer === "model"`, add `problem("profile.json", "sidebar.askAbout", '"<name>" answers with the model, so it has no page for the sidebar to link to')`. A command outside `askAbout` may still answer `"model"` (US-032 adds them), and a chip can't (US-022's schema rule). `answer` is already validated as `"model"` or a site path, so there's no third case.
- **Tests.**
  - The sidebar and the chips share accessible names (US-023's Log). Scope every sidebar lookup to `page.getByRole("complementary", { name: "Sidebar" })`, and in the drawer to `page.getByRole("dialog", { name: "Menu" })`.
  - Use `waitForHydration` from `tests/e2e/helpers/hydration.ts` on the item before the first click (D-038), and no fixed waits (CODING § 9).
  - Build expectations from `commands.json` and `profile.json`, as `shell.spec.ts` and `chips.spec.ts` do, because US-049 replaces the placeholder content. Assert the answer the way `chips.spec.ts` does, so a change under D-032 changes one place.
  - `visitor-message` and `thread` test ids already exist on `HomeHero` and `Message`.
  - The "real content page" test loads `/about/` directly, clicks another ASK ABOUT item, and expects the new page's `<h1>` and no `thread` element.
  - The modifier-click test uses the document-level listener that `chips.spec.ts` uses to read `defaultPrevented`.
  - The JS-off test clicks an item from `/`: the sidebar is server-rendered, and the click must load the real page.
- **Existing tests stay as they are.** `US-005 F0.2` reads `href`s, which don't change. `US-006: following a link closes the drawer` clicks an item on the home page: the drawer still closes, now because the item asked in the chat, so the test passes unchanged. Its title is no longer exact, so leave it for US-075, which already edits `drawer.spec.ts`.
- **Shared files.** `lib/content.ts` is also changed by US-028, US-029 and US-067, and `tests/unit/lib/content.test.ts` by US-067. Both US-028 and US-067 now list US-024 in `depends_on` (added in US-078), so this story goes first and they build on its `commandProblems`.
- **Estimate 2 → 3** (US-078): the story now carries the loader check and the shared click helper.

## Log

<!-- Newest first: YYYY-MM-DD · what changed · PR/commit · test result -->
2026-10-14 · Scoped by US-078: criteria for the click, modifier click, real content page, JavaScript off, drawer and the loader check US-022 deferred here. Files, out of scope, tests and notes written. Estimate 2 → 3. US-028 and US-067 now depend on it · this commit · —
