import { expect, type Locator } from "@playwright/test";

// `page.goto` can return before React has hydrated the page (WebKit, mostly), and a click before
// then reaches the server-rendered element, which has no handler yet, and is dropped without an error.
// React marks every element it has hydrated with a `__reactProps$<id>` key, so wait for that.
// It's a React internal: if React changes it, this wait times out loudly rather than passing (D-038).
// The 15 s limit is for a loaded machine, where one WebKit call alone has taken 4 s and the default
// 5 s allowed two attempts. A page that is ready costs nothing extra.
export async function waitForHydration(element: Locator) {
  await expect
    .poll(
      () =>
        element.evaluate((node) =>
          Object.keys(node).some((key) => key.startsWith("__reactProps$")),
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
}
