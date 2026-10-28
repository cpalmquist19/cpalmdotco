"use client";

import { useId, useRef, useState } from "react";
import { CHAT_MODELS, type ModelId } from "@/lib/models";
import { ProviderLogo, logoFor } from "./provider-logos";
import { useDismiss } from "./use-dismiss";

const MODELS = CHAT_MODELS.map((m) => ({ ...m, logo: logoFor(m.provider) }));

// A controlled picker: the chat panel owns the selection and sends it with each message
export function ModelPicker({ value, onChange }: { value: ModelId; onChange: (id: ModelId) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const model = MODELS.find((m) => m.id === value) ?? MODELS[0];

  function select(id: ModelId) {
    onChange(id);
    setOpen(false);
  }

  useDismiss(rootRef, open, () => setOpen(false));

  return (
    <div ref={rootRef} className="relative w-40 shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Model: ${model.provider} ${model.name}`}
        title={`${model.provider} · ${model.name}`}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-full bg-white/10 pl-3 pr-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <span className="flex min-w-0 items-center gap-2">
          <ProviderLogo path={model.logo} className="size-5 shrink-0" />
          <span className="truncate">{model.name}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
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
          className="absolute bottom-full left-0 z-20 mb-3 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md"
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
