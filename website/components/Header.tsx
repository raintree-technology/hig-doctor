"use client";

import { Github, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const homeNavItems = [
  { label: "Use Cases", href: "#use-cases", id: "use-cases" },
  { label: "How It Works", href: "#how-it-works", id: "how-it-works" },
  { label: "What's Included", href: "#skills", id: "skills" },
  { label: "Install", href: "#install", id: "install" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

const topicNavItems = [
  { label: "Topics", href: "/topics" },
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

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Close mobile menu on scroll
      setMenuOpen(false);

      // Determine active section (only for home variant)
      if (variant === "home") {
        const offset = 100;
        let current: string | null = null;
        for (const item of homeNavItems) {
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
  }, [variant]);

  // Close mobile menu on outside click or Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        // Return focus to the menu toggle button
        const toggle = headerRef.current?.querySelector<HTMLButtonElement>(
          "button[aria-expanded]",
        );
        toggle?.focus();
      }
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, closeMenu]);

  const navItems = variant === "home" ? homeNavItems : topicNavItems;

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
          aria-label="Apple HIG Skills home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M12 20.5c-4.5 0-7.5-4-7.5-8 0-3.5 2.5-5.5 5-5.5 1.2 0 2 .5 2.5.5s1.3-.5 2.5-.5c2.5 0 5 2 5 5.5 0 4-3 8-7.5 8z" />
            <path d="M12 7V3" />
            <path d="M12 3c1.5 0 3 1 3 2.5" />
          </svg>
          HIG Skills
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive =
              variant === "home" &&
              "id" in item &&
              activeSection === (item as (typeof homeNavItems)[0]).id;
            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm transition-all relative px-3 py-1.5 rounded-full",
                  isActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
                aria-current={isActive ? "true" : undefined}
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
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-[grid-template-rows] duration-300 ease-out grid",
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="min-h-0">
          <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl px-6 py-3">
            <div className="flex flex-col gap-1" role="menu">
              {navItems.map((item) => {
                const isActive =
                  variant === "home" &&
                  "id" in item &&
                  activeSection === (item as (typeof homeNavItems)[0]).id;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    role="menuitem"
                    tabIndex={menuOpen ? 0 : -1}
                    className={cn(
                      "text-sm transition-colors py-2",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
