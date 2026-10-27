import Image from "next/image";
import { asset } from "@/lib/asset";

/** Bot avatar on the left and Caleb's photo on the right, the same size, with the copy centered between them */
export function ChatHeader() {
  return (
    <header className="grid shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 border-b border-white/10 px-5 py-2.5 max-sm:grid-cols-[2.5rem_1fr]">
      <div className="size-10 overflow-hidden rounded-full bg-slate-700 ring-1 ring-[#4f86f0]/40">
        <Image
          src={asset("/beame/BEAM-E-avatar.jpg")}
          alt="BEAM-E"
          width={160}
          height={160}
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 text-center max-sm:text-left">
        <h2 className="text-base font-semibold leading-tight tracking-tight text-white">
          Ask me about Caleb
        </h2>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#9fb0cc]">
          I can explain his projects, technical decisions, trade-offs, and point you to evidence.
        </p>
      </div>
      <div className="size-10 overflow-hidden rounded-full bg-slate-700 ring-1 ring-white/20 max-sm:hidden">
        <Image
          src={asset("/caleb_headshot.jpg")}
          alt=""
          width={96}
          height={96}
          className="size-full object-cover"
        />
      </div>
    </header>
  );
}
