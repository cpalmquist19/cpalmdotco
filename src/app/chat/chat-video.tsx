"use client";

import Image from "next/image";
import { useState } from "react";
import { asset } from "@/lib/asset";
import type { ChatPhase } from "./types";
import { usePrefersReducedMotion } from "./use-reduced-motion";

// ready: idle loop · receive: plays once when a message is submitted · send: loops while the reply streams in
type VideoMode = "ready" | "receive" | "send";

const VIDEO_MODE: Record<ChatPhase, VideoMode> = { idle: "ready", waiting: "receive", streaming: "send" };

const VIDEO_SRC: Record<VideoMode, string> = {
  ready: "/beame/beam-e-ready-opt.mp4",
  receive: "/beame/beam-e-receive-data-opt.mp4",
  send: "/beame/beam-e-send-data-opt.mp4",
};

// The send clip starts, and restarts each time it loops, this many seconds in, skipping its slow opening
const SEND_START_SECONDS = 2;

/** BEAM-E at the top of the card, animated to match what the chat is doing, with an Online / Responding badge */
export function ChatVideo({ phase }: { phase: ChatPhase }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const videoMode = VIDEO_MODE[phase];

  return (
    // The still image sits underneath so something shows if the video cannot load; the video fades in over it once it has a frame.
    // Visitors who have asked for less motion get the still image alone, and the clips are never downloaded
    <div className={`relative aspect-[3.56] shrink-0 overflow-hidden max-sm:aspect-[4.2] md:max-xl:aspect-[4.4] md:max-xl:max-h-28 xl:aspect-auto xl:min-h-[4rem] xl:flex-[0.65_1_0%] xl:shrink bg-[#0a0f20] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)]`}>
      <Image
        src={asset("/beame/BEAM-E.jpg")}
        alt=""
        fill
        sizes="(min-width: 768px) 480px, 100vw"
        // Above the fold and the largest paint on the page, so it must not wait to be lazy-loaded
        loading="eager"
        fetchPriority="high"
        className="object-cover object-[50%_35%]"
      />
      {!reduceMotion && (
        <video
          aria-hidden="true"
          src={asset(VIDEO_SRC[videoMode])}
          autoPlay
          muted
          playsInline
          loop={videoMode === "ready"}
          onLoadedMetadata={(event) => {
            if (videoMode === "send") event.currentTarget.currentTime = SEND_START_SECONDS;
          }}
          onEnded={(event) => {
            // The send clip loops by hand so it comes back to the start point instead of 0:00
            if (videoMode !== "send") return;
            event.currentTarget.currentTime = SEND_START_SECONDS;
            void event.currentTarget.play();
          }}
          onLoadedData={() => setVideoFailed(false)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 size-full object-cover object-[50%_35%] transition-opacity duration-300 ${
            videoFailed ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
      {/* Fade into the card body so the video doesn't end on a hard edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent"
      />
      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur-md">
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        {phase === "idle" ? "Online" : "Responding…"}
      </span>
    </div>
  );
}
