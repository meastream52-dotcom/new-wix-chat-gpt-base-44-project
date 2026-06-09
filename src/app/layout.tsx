import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LayoutRouter } from "@/components/LayoutRouter";

export const metadata: Metadata = {
  title: "AutomateOS — AI Workforce for Your Business",
  description: "Your AI workforce — one dashboard. AI receptionist, sales, support, training, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0f1117] text-[#e6edf3]">
        <Providers>
          <LayoutRouter>{children}</LayoutRouter>
        </Providers>
      </body>
    </html>
  );
}
