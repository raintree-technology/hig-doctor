// Demo code fixtures for the interactive landing-page audit.
//
// These strings intentionally contain HIG violations (and their fixes) so the
// browser-side auditor has something to detect. They are data, not rendered
// markup — excluded from the CLI scan via website/.higauditignore so the site
// doesn't flag its own teaching samples.

export type SampleKey =
  | "swiftui-bad"
  | "swiftui-good"
  | "react-bad"
  | "react-good"
  | "html-bad";

export interface Sample {
  label: string;
  framework: string;
  filename: string;
  code: string;
}

export const SAMPLES: Record<SampleKey, Sample> = {
  "swiftui-bad": {
    label: "SwiftUI (common mistakes)",
    framework: "SwiftUI",
    filename: "ContentView.swift",
    code: `import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome")
                    .foregroundColor(.red)
                    .font(.system(size: 28))

                Image(systemName: "star.fill")

                Button("Tap me") {
                    print("tapped")
                }
                .onTapGesture {
                    action()
                }
            }
        }
    }
}`,
  },
  "swiftui-good": {
    label: "SwiftUI (HIG-aligned)",
    framework: "SwiftUI",
    filename: "ContentView.swift",
    code: `import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Text("Welcome")
                    .foregroundStyle(.primary)
                    .font(.largeTitle)

                Image(systemName: "star.fill")
                    .accessibilityLabel("Favorite")
                    .accessibilityHint("Marks this item as a favorite")

                Button("Tap me", action: handleTap)
                    .buttonStyle(.borderedProminent)
            }
        }
    }
}`,
  },
  "react-bad": {
    label: "React (common mistakes)",
    framework: "React / Next.js",
    filename: "Hero.tsx",
    code: `export function Hero() {
  return (
    <div className="flex">
      <img src="/hero.png" />
      <div onClick={open} style={{ color: "#ff0000" }}>
        <h1 style={{ fontSize: "13px" }}></h1>
        <a href="/learn">click here</a>
      </div>
      <video src="/demo.mp4" autoPlay />
      <button onMouseOver={preview} tabIndex={3}></button>
    </div>
  );
}`,
  },
  "react-good": {
    label: "React (HIG-aligned)",
    framework: "React / Next.js",
    filename: "Hero.tsx",
    code: `export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="flex">
      <img src="/hero.png" alt="Product hero shot showing the dashboard" />
      <div>
        <h1 id="hero-title" className="text-foreground">Welcome</h1>
        <a href="/learn" aria-label="Learn more about the product">
          Read the overview
        </a>
      </div>
      <video src="/demo.mp4" controls>
        <track kind="captions" src="/demo.vtt" srcLang="en" label="English" />
      </video>
      <button
        onFocus={preview}
        onMouseOver={preview}
        aria-label="Preview"
      >
        <span aria-hidden="true">👁</span>
      </button>
    </section>
  );
}`,
  },
  "html-bad": {
    label: "HTML (common mistakes)",
    framework: "HTML",
    filename: "index.html",
    code: `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, user-scalable=no" />
    <style>
      body { overflow: hidden; }
      a:hover { color: red; }
      button:focus { outline: none; }
      .price { font-size: 10px; text-align: justify; }
    </style>
  </head>
  <body>
    <img src="/banner.jpg">
    <div class="nav">
      <div onClick="go('/a')">A</div>
      <h2></h2>
    </div>
    <marquee>Sale!</marquee>
  </body>
</html>`,
  },
};
