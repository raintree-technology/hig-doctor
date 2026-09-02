"use client";

import { Github, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BrandMark from "@/components/BrandMark";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  /** Section id for the home-page scrollspy */
  id?: string;
  /** Route prefix that marks this item active on subpages */
  route?: string;
}

const homeNavItems: NavItem[] = [
  { label: "Use Cases", href: "#use-cases", id: "use-cases" },
  { label: "How It Works", href: "#how-it-works", id: "how-it-works" },
  { label: "What's Included", href: "#skills", id: "skills" },
  { label: "Topics", href: "/topics", route: "/topics" },
  { label: "MCP", href: "/mcp", route: "/mcp" },
  { label: "Install", href: "#install", id: "install" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

const topicNavItems: NavItem[] = [
  { label: "Topics", href: "/topics", route: "/topics" },
  { label: "MCP", href: "/mcp", route: "/mcp" },
  { label: "Install", href: "/#install" },
];

export default function Header({
  variant = "home",
}: {
  variant?: "home" | "topic";
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Close mobile menu on scroll
      closeMenu();

      // Determine active section (only for home variant)
      if (variant === "home") {
        const offset = 100;
        let current: string | null = null;
        for (const item of homeNavItems) {
          if (!item.id) continue;
          const el = document.getElementById(item.id);
          if (el) {
            const top = el.getBoundingClientRect().top;
            if (top <= offset) {
              current = item.id;
            }
          }
        }
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [closeMenu, variant]);

  // Treat the full-screen mobile navigation as one contained task. Keep the
  // obscured page out of keyboard and assistive-technology navigation, cycle
  // focus within the menu, and return focus to the disclosure on dismissal.
  useEffect(() => {
    if (!menuOpen) return;
    const pageRegions = [
      document.querySelector<HTMLElement>("main"),
      document.querySelector<HTMLElement>("footer"),
    ].filter((region): region is HTMLElement => region !== null);
    const previousOverflow = document.body.style.overflow;

    for (const region of pageRegions) region.inert = true;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = [
        menuButtonRef.current,
        ...(mobileMenuRef.current?.querySelectorAll<HTMLAnchorElement>("a") ??
          []),
      ].filter(
        (element): element is HTMLAnchorElement | HTMLButtonElement =>
          element !== null,
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      for (const region of pageRegions) region.inert = false;
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  const navItems = variant === "home" ? homeNavItems : topicNavItems;

  const isItemActive = (item: NavItem) => {
    if (item.route && pathname?.startsWith(item.route)) return true;
    return variant === "home" && !!item.id && activeSection === item.id;
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-xl saturate-150 supports-[backdrop-filter]:bg-background/60"
          : "",
      )}
    >
      <nav
        aria-label="Main"
        className="flex h-16 items-center justify-between px-6 max-w-6xl mx-auto"
      >
        <a
          href={variant === "topic" ? "/" : "#"}
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
          aria-label="HIG Doctor home"
          tabIndex={menuOpen ? -1 : undefined}
        >
          <BrandMark className="h-5 w-5 text-foreground" aria-hidden="true" />
          HIG Doctor
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = isItemActive(item);
            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-full px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
                aria-current={
                  item.route && pathname?.startsWith(item.route)
                    ? "page"
                    : isActive
                      ? "true"
                      : undefined
                }
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/raintree-technology/hig-doctor"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
            aria-label="View on GitHub (opens in new tab)"
            tabIndex={menuOpen ? -1 : undefined}
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-border/60 bg-background/95 px-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden"
        >
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-6 py-4">
            <ul className="flex flex-col gap-1 list-none p-0">
              {navItems.map((item) => {
                const isActive = isItemActive(item);
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={() => closeMenu()}
                      aria-current={
                        item.route && pathname?.startsWith(item.route)
                          ? "page"
                          : undefined
                      }
                      className={cn(
                        "flex min-h-11 items-center rounded-lg px-3 py-3 text-base transition-colors",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
