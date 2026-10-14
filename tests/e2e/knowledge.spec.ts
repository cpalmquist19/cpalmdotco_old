import { expect, test } from "@playwright/test";

test.describe("knowledge pack", () => {
  test("US-028: /knowledge.txt is plain text, holds a [src:about] section, and is marked noindex", async ({
    request,
  }) => {
    const response = await request.get("/knowledge.txt");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(response.headers()["x-robots-tag"]).toBe("noindex");
    const body = await response.text();
    expect(body).toContain("[src:about]");
    expect(body).toContain("[src:profile]");
  });

  test("US-028: /knowledge.txt does not redirect", async ({ request }) => {
    // trailingSlash would redirect /knowledge.txt to /knowledge.txt/ if the route had no extension (D-026).
    const response = await request.get("/knowledge.txt", { maxRedirects: 0 });

    expect(response.status()).toBe(200);
  });
});
