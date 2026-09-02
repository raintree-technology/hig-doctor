import { Bot, Building2, Code2, Palette } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const audiences = [
  {
    icon: Code2,
    title: "Indie iOS developers",
    description:
      "Retrieve relevant HIG references without leaving your AI-assisted development workflow.",
  },
  {
    icon: Palette,
    title: "Design teams",
    description:
      "Give supported AI tools the same structured reference set so team members can start from consistent source material.",
  },
  {
    icon: Building2,
    title: "Agencies and consultancies",
    description:
      "Use attributed HIG references during client reviews, then verify recommendations against Apple's current documentation.",
  },
  {
    icon: Bot,
    title: "Teams building AI features",
    description:
      "Use platform-specific references when reviewing AI-generated interfaces before release.",
  },
];

export default function Audience() {
  return (
    <section
      id="audience"
      aria-labelledby="audience-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2
            id="audience-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            Built for how you work
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Use the same structured HIG reference set across individual and team
            workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {audiences.map((audience) => (
            <Card key={audience.title} className="h-full">
              <div className="flex gap-4 p-6">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <audience.icon
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <CardTitle className="text-base mb-2">
                    {audience.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {audience.description}
                  </CardDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
