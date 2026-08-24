import { expect, type Page } from "@playwright/test";

export const E2E_USER = {
  name: process.env.E2E_USER_NAME ?? "E2E User",
  email: process.env.E2E_USER_EMAIL ?? "e2e-user@crossguild.test",
  password: process.env.E2E_USER_PASSWORD ?? "e2e-password-123",
};

export async function login(
  page: Page,
  options?: { callbackUrl?: string }
) {
  const loginPath = options?.callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(options.callbackUrl)}`
    : "/login";

  await page.goto(loginPath);
  await page.getByLabel("Email").fill(E2E_USER.email);
  await page.getByLabel("Password").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15_000,
  });
  await waitForAuthenticatedSession(page);
}

export async function logout(page: Page) {
  const csrfResponse = await page.request.get("/api/auth/csrf");
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };

  await page.request.post("/api/auth/signout", {
    form: {
      csrfToken,
      callbackUrl: "/",
    },
  });

  await page.goto("/");
  await expectLoggedOut(page);
}

export async function waitForAuthenticatedSession(page: Page) {
  await page.waitForFunction(async () => {
    const response = await fetch("/api/auth/session");
    const session = await response.json();
    return Boolean(session?.user);
  });
}

export async function expectLoggedIn(page: Page) {
  await expect(page.getByRole("link", { name: "Login" })).not.toBeVisible();
}

export async function expectLoggedOut(page: Page) {
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
}

export function expectLoginRedirect(pageUrl: string, callbackPath: string) {
  const url = new URL(pageUrl);
  expect(url.pathname).toBe("/login");
  expect(url.searchParams.get("callbackUrl")).toBe(callbackPath);
}
