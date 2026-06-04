import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found — Apple HIG Skills",
  description: "The page you were looking for doesn’t exist.",
  // Next.js already serves this with a 404 status (so it is never a soft 404);
  // the explicit noindex makes the indexing policy unambiguous per the spec.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="photo-bg min-h-screen">
      <Header variant="topic" />
      <main
        id="main-content"
        className="relative z-10 flex min-h-[70vh] items-center justify-center px-6 pt-20"
      >
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
            404
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            Page not found
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
            That page doesn’t exist or may have moved. Browse the full set of
            Apple Human Interface Guidelines topics, or head back home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <a href="/topics">Browse all HIG topics</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/">Back to home</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
