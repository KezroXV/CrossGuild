import { expect, test } from "@playwright/test";
import {
  E2E_USER,
  expectLoggedIn,
  expectLoggedOut,
  expectLoginRedirect,
  login,
  logout,
} from "./helpers/auth";

test.describe("Authentication", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects unauthenticated users from protected routes to login", async ({
    page,
  }) => {
    await page.goto("/profile");

    await page.waitForURL(/\/login/);
    expectLoginRedirect(page.url(), "/profile");
    await expect(page.getByText("Welcome To CrossGuild")).toBeVisible();
  });

  test("logs in and redirects to callback URL", async ({ page }) => {
    await login(page, { callbackUrl: "/profile" });
    await expectLoggedIn(page);

    await expect(page).toHaveURL(/\/profile/);
  });

  test("logs in and redirects to home by default", async ({ page }) => {
    await login(page);
    await expectLoggedIn(page);

    await expect(page).toHaveURL("/");
  });

  test("redirects logged-in users away from login page", async ({ page }) => {
    await login(page);
    await expectLoggedIn(page);

    await page.goto("/login");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Login" })).not.toBeVisible();
  });

  test("logs out and returns to unauthenticated state", async ({ page }) => {
    await login(page);
    await expectLoggedIn(page);

    await logout(page);
    await expectLoggedOut(page);
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_USER.email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
