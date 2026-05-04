"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

const moderationLinks = [
  { label: "Image Moderation", href: "/image-moderation" },
  { label: "Video Moderation", href: "/video-moderation" },
  { label: "Text Moderation", href: "/text-moderation" },
] as const;

export function ExploreSidebar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isContactPage = pathname === "/contact";

  useEffect(() => {
    let isMounted = true;

    async function loadAuthState() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (isMounted) {
          setIsAuthenticated(response.ok);
          setIsAuthResolved(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAuthResolved(true);
        }
      }
    }

    void loadAuthState();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <aside className="solutions-sidebar">
      <Link href="/" className="solutions-brand">
        <span className="solutions-brand-title">
          Get<span>VeriSight</span>
        </span>
        <span className="solutions-brand-tagline">AI moderation platform</span>
      </Link>

      <button
        type="button"
        className={`solutions-sidebar-backdrop${isMobileMenuOpen ? " open" : ""}`}
        aria-label="Close explore menu"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className="solutions-sidebar-body">
        <div className="solutions-drawer-top">
          <button
            type="button"
            className="solutions-drawer-close"
            aria-label="Close explore menu"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span />
            <span />
          </button>
        </div>

        <div className="solutions-menu-group">
          <button
            type="button"
            className={`solutions-sidebar-link solutions-sidebar-toggle${
              isModerationOpen ? " open" : ""
            }`}
            aria-expanded={isModerationOpen}
            onClick={() => setIsModerationOpen((current) => !current)}
          >
            <span>Content Moderation</span>
            <span className="solutions-sidebar-caret">{isModerationOpen ? "-" : "+"}</span>
          </button>

          <nav
            className={`solutions-subnav${isModerationOpen ? " open" : ""}`}
            aria-label="Content moderation links"
            aria-hidden={!isModerationOpen}
          >
            {moderationLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`solutions-sidebar-link sublink${
                  pathname === link.href ? " active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav className="solutions-sidebar-nav" aria-label="Primary navigation">
          <Link
            href="/contact"
            className={`solutions-sidebar-link${isContactPage ? " active" : ""}`}
          >
            Contact Us
          </Link>

          {!isAuthResolved ? <div className="solutions-sidebar-auth-gap" aria-hidden="true" /> : null}
          {isAuthResolved && !isAuthenticated ? (
            <>
              <Link href="/login" className="solutions-sidebar-link">
                Login
              </Link>
              <Link href="/signup" className="solutions-sidebar-link signup">
                Signup
              </Link>
            </>
          ) : null}
          {isAuthResolved && isAuthenticated ? (
            <div className="solutions-sidebar-logout">
              <LogoutButton />
            </div>
          ) : null}
        </nav>
      </div>
    </aside>
  );
}
