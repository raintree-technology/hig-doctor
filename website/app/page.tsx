import AgentSkills from "@/components/AgentSkills";
import Audience from "@/components/Audience";
import AuditDemo from "@/components/AuditDemo";
import BeforeAfter from "@/components/BeforeAfter";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Install from "@/components/Install";

import Skills from "@/components/Skills";
import UseCases from "@/components/UseCases";
import { Separator } from "@/components/ui/separator";

function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <Separator className="opacity-60" />
    </div>
  );
}

async function getStars(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/raintree-technology/hig-doctor",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const stars = await getStars();
  return (
    <div className="photo-bg min-h-screen">
      <Header />
      <main id="main-content" className="relative z-10">
        <Hero stars={stars} />
        <SectionDivider />
        <AuditDemo />
        <SectionDivider />
        <UseCases />
        <SectionDivider />
        <BeforeAfter />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <Audience />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <AgentSkills />
        <SectionDivider />
        <Install />
        <SectionDivider />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
