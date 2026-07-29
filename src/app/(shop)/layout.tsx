import { Navbar } from "@/shared/components/layout/navbar.component";
import Footer from "@/shared/components/layout/footer.component";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-px min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
