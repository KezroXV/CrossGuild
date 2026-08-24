import { expect, test } from "@playwright/test";
import {
  expectLoggedIn,
  expectLoginRedirect,
  login,
} from "./helpers/auth";

test.describe("Admin access control", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects unauthenticated users from /admin to login", async ({
    page,
  }) => {
    await page.goto("/admin");

    await page.waitForURL(/\/login/);
    expectLoginRedirect(page.url(), "/admin");
    await expect(page.getByText("Welcome To CrossGuild")).toBeVisible();
  });

  test("blocks non-admin users from /admin", async ({ page }) => {
    await login(page);
    await expectLoggedIn(page);

    await page.goto("/admin");

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).not.toBeVisible();
  });
});
