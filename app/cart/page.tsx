"use client";
import Cart from "@/components/cart";
import FooterSection from "@/components/footer";

const CartPage = () => {
  return (
    <div className="pt-px min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col gap-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Cart />
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default CartPage;
