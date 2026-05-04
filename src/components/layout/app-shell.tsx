"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExploreModelsPage = pathname === "/explore-models";

  return (
    <div className="shell">
      {!isExploreModelsPage ? <Navbar /> : null}
      {children}
      {!isExploreModelsPage ? <Footer /> : null}
    </div>
  );
}
