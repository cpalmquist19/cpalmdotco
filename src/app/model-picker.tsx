"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CHAT_MODELS, DEFAULT_MODEL_ID, type ModelId } from "@/lib/models";

const ANTHROPIC_LOGO =
  "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z";

const OPENAI_LOGO =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";

const LOGO_BY_PROVIDER: Record<string, string> = {
  Anthropic: ANTHROPIC_LOGO,
  OpenAI: OPENAI_LOGO,
};

const MODELS = CHAT_MODELS.map((m) => ({ ...m, logo: LOGO_BY_PROVIDER[m.provider] }));

function ProviderLogo({ path, className }: { path: string; className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

// "chip" is the compact, outlined pill used by the /v3 chat card and reads "Name (Provider)"
// "mini" is the same chip, smaller and sized in rem so it scales with the /v5 layout
// Pass value and onChange to control the selection from outside; without them the picker keeps its own choice
export function ModelPicker({
  variant = "default",
  value,
  onChange,
}: {
  variant?: "default" | "chip" | "mini";
  value?: ModelId;
  onChange?: (id: ModelId) => void;
}) {
  const isMini = variant === "mini";
  const isChip = variant === "chip" || isMini;
  const [localId, setLocalId] = useState<ModelId>(DEFAULT_MODEL_ID);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const modelId = value ?? localId;
  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];

  function select(id: ModelId) {
    setLocalId(id);
    onChange?.(id);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative shrink-0 ${isChip ? "max-w-full" : "w-40"}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Model: ${model.provider} ${model.name}`}
        title={`${model.provider} · ${model.name}`}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={
          isMini
            ? "flex h-[1.6rem] max-w-full items-center gap-[0.4rem] rounded-full border border-white/10 bg-white/[0.06] pl-[0.65rem] pr-[0.5rem] text-[0.75rem] text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            : isChip
            ? "flex h-9 max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] pl-3 pr-2.5 text-[13px] text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            : "flex h-10 w-full items-center justify-between gap-2 rounded-full bg-white/10 pl-3 pr-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          <ProviderLogo
            path={model.logo}
            className={isMini ? "size-[0.8rem] shrink-0" : isChip ? "size-4 shrink-0" : "size-5 shrink-0"}
          />
          <span className="truncate">
            {isChip ? `${model.name} (${model.provider})` : model.name}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isMini ? "size-[0.8rem]" : "size-4"} shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Model"
          className="absolute bottom-full left-0 z-20 mb-3 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0e1428]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          {MODELS.map((m) => {
            const selected = m.id === model.id;
            return (
              <button
                key={m.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => select(m.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? "bg-blue-500/20 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ProviderLogo path={m.logo} className="size-4 shrink-0" />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{m.name}</span>
                  <span className="block text-xs text-slate-400">{m.provider}</span>
                </span>
                {selected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 shrink-0 text-blue-300"
                    aria-hidden="true"
                  >
                    <path d="M5 12l4 4 10-10" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
