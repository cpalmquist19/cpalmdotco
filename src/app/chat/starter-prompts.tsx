import { SpotlightCard } from "../spotlight-card";

const CHAT_PROMPTS = [
  "How does Relay's evaluation harness work?",
  "What roles is Caleb looking for?",
  "What does Relay do, and why did Caleb build it?",
  "How did Caleb go from QA to building AI systems?",
];

/** What the card shows before the first message: questions to start with */
export function StarterPrompts({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-4 xl:flex-[1_1_0%] xl:py-3">
      <p className="mb-1.5 shrink-0 px-1 text-lg leading-tight text-[#9cc3ff]">Try asking</p>
      {/* Scrolls inside the card when there are more suggestions than fit. The thin, blue-tinted scrollbar matches the card */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-1 pr-1 md:max-lg:grid md:max-lg:auto-rows-min md:max-lg:grid-cols-2 [scrollbar-color:rgba(79,134,240,0.45)_transparent] [scrollbar-width:thin]">
        {CHAT_PROMPTS.map((prompt) => (
          <SpotlightCard key={prompt} as="div" spotlightRadius={180} className="relative shrink-0 rounded-2xl">
            <button
              type="button"
              onClick={() => onSend(prompt)}
              disabled={disabled}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#4f86f0]/30 bg-gradient-to-br from-[#4f86f0]/[0.12] to-[#4f86f0]/[0.04] px-5 py-3.5 text-left text-[15px] leading-snug text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-blue-400/60 hover:from-[#4f86f0]/[0.2] hover:to-[#4f86f0]/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
            >
              <span>{prompt}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 shrink-0 text-[#9fb0cc] transition-all group-hover:translate-x-0.5 group-hover:text-blue-300"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}
