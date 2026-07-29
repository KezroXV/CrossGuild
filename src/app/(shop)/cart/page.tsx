import type { Metadata } from "next";
import CartView from "@/features/cart/views/cart.view";

export const metadata: Metadata = { title: "Cart | CrossGuild" };

export default function CartPage() {
  return <CartView />;
}
