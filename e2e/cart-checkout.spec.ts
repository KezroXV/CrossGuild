import { expect, test } from "@playwright/test";
import {
  expectLoggedIn,
  login,
} from "./helpers/auth";

test.describe("Cart and checkout flow", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("adds a product to cart and displays it on the cart page", async ({
    page,
  }) => {
    await login(page);
    await expectLoggedIn(page);

    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();

    const productLink = page.getByRole("link", { name: "Learn More" }).first();
    const hasProducts = (await productLink.count()) > 0;

    test.skip(!hasProducts, "No published products available for cart E2E test");

    await productLink.click();
    await expect(page.getByRole("button", { name: /Add to Cart/i })).toBeVisible();

    await page.getByRole("button", { name: /Add to Cart/i }).click();
    await expect(page.getByText(/a été ajouté à votre panier/i)).toBeVisible({
      timeout: 10_000,
    });

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    await expect(page.getByText(/item(s)? in your cart/i)).toBeVisible();
    await expect(page.getByText("Your cart is empty")).not.toBeVisible();
    await expect(page.getByText("Checkout", { exact: true })).toBeVisible();
  });

  test("shows sign-in prompt when viewing cart while logged out", async ({
    page,
  }) => {
    await page.goto("/cart");

    await expect(page.getByText("Sign in to view your cart")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});
