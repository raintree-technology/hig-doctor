import { Separator } from "@/components/ui/separator";

// Inline X (Twitter) glyph — avoids pulling the entire FontAwesome runtime
// (3 packages + a JS-injected stylesheet that causes an icon FOUC) for one icon.
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10">
      <Separator />
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Mobile */}
        <div className="flex flex-col items-center gap-4 text-[13px] text-muted-foreground sm:hidden">
          <nav aria-label="Footer links" className="flex items-center gap-6">
            <a
              href="https://agentskills.io"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Agent Skills
            </a>
            <a
              href="https://github.com/raintree-technology/hig-doctor"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/raintree-technology/hig-doctor/blob/main/CONTRIBUTING.md"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Contributing
            </a>
            <a
              href="https://x.com/raintree_tech"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors p-1"
              aria-label="X (opens in new tab)"
            >
              <XIcon className="h-4 w-4" />
            </a>
          </nav>
          <p>
            <a
              href="https://github.com/raintree-technology/hig-doctor/blob/main/LICENSE"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              MIT License
            </a>
            {" · "}
            <a
              href="https://raintree.technology"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Raintree Technology
            </a>
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex sm:items-center sm:justify-between text-[13px] text-muted-foreground">
          <nav aria-label="Footer" className="flex items-center gap-6">
            <a
              href="https://agentskills.io"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Agent Skills
            </a>
            <a
              href="https://github.com/raintree-technology/hig-doctor"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/raintree-technology/hig-doctor/blob/main/LICENSE"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              MIT License
            </a>
            <a
              href="https://github.com/raintree-technology/hig-doctor/blob/main/CONTRIBUTING.md"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Contributing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://raintree.technology"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Raintree Technology
            </a>
            <a
              href="https://x.com/raintree_tech"
              target="_blank"
              hrefLang="en"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors p-1"
              aria-label="X (opens in new tab)"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
