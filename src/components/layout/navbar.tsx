"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

const moderationItems = [
  {
    title: "Text",
    href: "/text-moderation",
    icon: (
      <span className="material-symbols-outlined nav-dropdown-icon-glyph">text_snippet</span>
    ),
    description: "Detect profanity, abuse, hate speech, spam, and unsafe text content.",
  },
  {
    title: "Images",
    href: "/image-moderation",
    icon: (
      <svg
        className="nav-dropdown-svg-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M20.5 16l-4.5-4.5-4 4-2.5-2.5L3.5 19" />
      </svg>
    ),
    description: "Review nudity, violence, suggestive content, and visual policy violations.",
  },
  {
    title: "Video",
    href: "/video-moderation",
    icon: (
      <svg
        className="nav-dropdown-svg-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h7a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 14 20H7a2.5 2.5 0 0 1-2.5-2.5v-11Z" />
        <path d="M18 10.2 22 7.6v8.8L18 13.8v-3.6Z" />
      </svg>
    ),
    description: "Scan uploaded videos frame by frame for risky scenes and unsafe moments.",
  },
];

function CaretIcon({ open = false }: { open?: boolean }) {
  return (
    <span className={`nav-caret${open ? " open" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 12 12" fill="none">
        <path
          d="M3 4.5 6 7.5l3-3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function MenuIcon({ open = false }: { open?: boolean }) {
  return (
    <span className={`nav-menu-icon${open ? " open" : ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileModerationOpen, setIsMobileModerationOpen] = useState(false);
  const [isDesktopModerationOpen, setIsDesktopModerationOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isModerationSection = [
    "/image-moderation",
    "/text-moderation",
    "/video-moderation",
  ].includes(pathname);
  const isContactPage = pathname === "/contact";

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileModerationOpen(false);
    setIsDesktopModerationOpen(false);
    setPendingRoute(null);
  }, [pathname]);

  useEffect(() => {
    const routesToWarm = [
      "/",
      "/login",
      "/signup",
      "/contact",
      "/image-moderation",
      "/text-moderation",
      "/video-moderation",
    ];

    for (const route of routesToWarm) {
      router.prefetch(route);
    }
  }, [router]);

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
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    }

    void loadAuthState();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  function handleNavClick(href: string) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        href === pathname
      ) {
        return;
      }

      setPendingRoute(href);
    };
  }

  return (
    <header className="site-header">
      <div className="topbar">
        <span className={`topbar-progress${pendingRoute ? " active" : ""}`} aria-hidden="true" />
        <div className="container topbar-inner">
          <Link
            href="/"
            className={`brand brand-lockup${pendingRoute === "/" ? " loading" : ""}`}
            onClick={handleNavClick("/")}
          >
            <span className="brand-copy">
              <span className="brand-title">
                Get<span>VeriSight</span>
              </span>
              <span className="brand-tagline">AI moderation platform</span>
            </span>
          </Link>

          <nav className="main-nav nav-desktop">
            <div
              className={`nav-dropdown${isDesktopModerationOpen ? " open" : ""}`}
              onMouseEnter={() => setIsDesktopModerationOpen(true)}
              onMouseLeave={() => setIsDesktopModerationOpen(false)}
            >
              <button
                type="button"
                className={`main-nav-link nav-feature-link nav-trigger${
                  isModerationSection ? " active" : ""
                }`}
                aria-expanded={isDesktopModerationOpen}
                onClick={() => setIsDesktopModerationOpen((current) => !current)}
              >
                Content Moderation
                <CaretIcon open={isDesktopModerationOpen} />
              </button>

              <div className="nav-dropdown-panel">
                <div className="nav-dropdown-grid">
                  {moderationItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`nav-dropdown-card${pathname === item.href ? " active" : ""}${
                        pendingRoute === item.href ? " loading" : ""
                      }`}
                      onClick={handleNavClick(item.href)}
                    >
                      <div className="nav-dropdown-card-head">
                        <span className="nav-dropdown-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        <h3>{item.title}</h3>
                      </div>
                      <p>{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/contact"
              className={`main-nav-link${isContactPage ? " active" : ""}${
                pendingRoute === "/contact" ? " loading" : ""
              }`}
              onClick={handleNavClick("/contact")}
            >
              Contact Us
            </Link>
          </nav>

          <div className="nav-actions nav-desktop-actions">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className={`nav-link${pendingRoute === "/login" ? " loading" : ""}`}
                  onClick={handleNavClick("/login")}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={`nav-link nav-cta${pendingRoute === "/signup" ? " loading" : ""}`}
                  onClick={handleNavClick("/signup")}
                >
                  Signup
                </Link>
              </>
            ) : null}
            {isAuthenticated ? <LogoutButton /> : null}
          </div>

          <div className="nav-mobile-bar">
            {!isAuthenticated ? (
              <Link
                href="/signup"
                className={`nav-link nav-cta nav-mobile-cta${
                  pendingRoute === "/signup" ? " loading" : ""
                }`}
                onClick={handleNavClick("/signup")}
              >
                Signup
              </Link>
            ) : null}
            <button
              type="button"
              className="nav-menu-toggle"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <MenuIcon open={isMobileMenuOpen} />
            </button>
          </div>
        </div>

        <div className={`container nav-mobile-shell${isMobileMenuOpen ? " open" : ""}`}>
          <div className="nav-mobile-panel">
            <div className="nav-mobile-links">
              <button
                type="button"
                className={`nav-mobile-link nav-mobile-trigger${
                  isMobileModerationOpen ? " open" : ""
                }${isModerationSection ? " active" : ""}`}
                aria-expanded={isMobileModerationOpen}
                onClick={() => setIsMobileModerationOpen((current) => !current)}
              >
                <span>Content Moderation</span>
                <CaretIcon open={isMobileModerationOpen} />
              </button>

              <div
                className={`nav-mobile-dropdown${isMobileModerationOpen ? " open" : ""}`}
              >
                <div className="nav-mobile-dropdown-grid">
                  {moderationItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`nav-dropdown-card${pathname === item.href ? " active" : ""}${
                        pendingRoute === item.href ? " loading" : ""
                      }`}
                      onClick={handleNavClick(item.href)}
                    >
                      <div className="nav-dropdown-card-head">
                        <span className="nav-dropdown-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        <h3>{item.title}</h3>
                      </div>
                      <p>{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/contact"
                className={`nav-mobile-link${isContactPage ? " active" : ""}${
                  pendingRoute === "/contact" ? " loading" : ""
                }`}
                onClick={handleNavClick("/contact")}
              >
                Contact Us
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className={`nav-mobile-link${pendingRoute === "/login" ? " loading" : ""}`}
                    onClick={handleNavClick("/login")}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className={`nav-mobile-link nav-mobile-signup-link${
                      pendingRoute === "/signup" ? " loading" : ""
                    }`}
                    onClick={handleNavClick("/signup")}
                  >
                    Signup
                  </Link>
                </>
              ) : null}
              {isAuthenticated ? (
                <div className="nav-mobile-logout">
                  <LogoutButton />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
