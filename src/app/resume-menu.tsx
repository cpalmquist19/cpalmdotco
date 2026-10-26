"use client";

import { useEffect, useId, useRef, useState } from "react";
import { asset } from "@/lib/asset";

// Every icon shares the same page outline; only the mark inside it and the tint change
const FORMAT_ICONS = {
  text: { color: "text-slate-300", mark: <path d="M9 12h6M9 15h6M9 18h4" /> },
  pdf: { color: "text-red-300", mark: <path d="M12 11l-3.5 7h7z" /> },
  word: { color: "text-blue-300", mark: <path d="M8 12l1.5 6 2.5-6 2.5 6L16 12" /> },
};

const RESUME_FORMATS = [
  { label: "Plain Text", file: "Caleb-Palmquist-Resume.txt", ext: "TXT", icon: FORMAT_ICONS.text },
  { label: "PDF", file: "Caleb-Palmquist-Resume.pdf", ext: "PDF", icon: FORMAT_ICONS.pdf },
  { label: "Word", file: "Caleb-Palmquist-Resume.docx", ext: "DOCX", icon: FORMAT_ICONS.word },
];

function FormatIcon({ icon }: { icon: (typeof FORMAT_ICONS)[keyof typeof FORMAT_ICONS] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-[1.125rem] shrink-0 ${icon.color}`}
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      {icon.mark}
    </svg>
  );
}

// Nav pill that opens a small menu of resume downloads
// The menu stays mounted and fades/scales in, so opening and closing both animate
// align "end" lines the menu up with the pill's right edge, for the narrow row under the header where a centered menu would run off screen
export function ResumeMenu({ align = "center", compact = false }: { align?: "center" | "end"; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const menuId = useId();

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
    <li ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex items-center gap-1.5 rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
          compact ? "px-2.5 py-2" : "px-3 py-2 lg:pl-4 lg:pr-3.5"
        } ${
          open
            ? "border-[#9cc3ff]/25 bg-[#9cc3ff]/15 text-white"
            : "border-transparent text-[#b6c2d8] hover:bg-[#9cc3ff]/10 hover:text-white"
        }`}
      >
        Resume
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-3.5 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="Resume"
        inert={!open}
        className={`absolute top-full z-30 mt-3 w-48 rounded-xl border border-[#9cc3ff]/15 bg-[#0e1428]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md transition-[opacity,transform,visibility] duration-200 ease-out ${
          align === "end" ? "right-0 origin-top-right" : "left-1/2 -translate-x-1/2 origin-top"
        } ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-95 opacity-0"}`}
      >
        {RESUME_FORMATS.map(({ label, file, ext, icon }) => (
          <a
            key={file}
            role="menuitem"
            href={asset(`/resume/${file}`)}
            download={file}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none"
          >
            <FormatIcon icon={icon} />
            <span className="flex-1">{label}</span>
            <span className="font-mono text-[10px] tracking-wider text-slate-500">{ext}</span>
          </a>
        ))}
      </div>
    </li>
  );
}
