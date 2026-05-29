import TopicCopyButton from "./TopicCopyButton";
import UpdateNotify from "./UpdateNotify";

const INSTALL_COMMAND = "npx skills add raintree-technology/hig-doctor";

export default function TopicCTA() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Get HIG guidance in your AI
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Install Apple HIG Skills and get expert design guidance directly in
          Claude Code.
        </p>
        <div className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3">
          <code className="text-sm text-muted-foreground font-mono">
            {INSTALL_COMMAND}
          </code>
          <TopicCopyButton text={INSTALL_COMMAND} />
        </div>
        <div className="mt-10 max-w-sm mx-auto">
          <UpdateNotify />
        </div>
      </div>
    </section>
  );
}
