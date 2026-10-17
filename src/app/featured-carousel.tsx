"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

const CONTROL_STYLES =
  "flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#0c1226]/90 text-white transition-colors hover:bg-[#16203d] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0c1226]/90";

/**
 * Horizontal carousel for the featured cards. Each child is one slide: one
 * card on small screens, two from md up, four from lg up (set on the slides
 * by the parent). The track is a native scroll-snap
 * container, so swiping and trackpad scrolling work too; the buttons jump to
 * the previous or next slide and disable themselves at either end.
 */
export function FeaturedCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function updateControls() {
      if (!track) return;
      const { scrollLeft, scrollWidth, clientWidth } = track;
      setCanScrollPrev(scrollLeft > 1);
      setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
    }

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, []);

  function scrollToSlide(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.children) as HTMLElement[];
    // Distance between two neighbouring slides, gap included. Scroll-snap
    // then settles the position on a slide edge.
    const step =
      slides.length > 1
        ? slides[1].offsetLeft - slides[0].offsetLeft
        : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul
        ref={trackRef}
        className="relative -m-2 flex min-h-0 flex-1 snap-x snap-mandatory scroll-p-2 gap-4 lg:justify-start overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {/*
      <div className="mt-4 flex shrink-0 justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollToSlide(-1)}
          disabled={!canScrollPrev}
          aria-label="Previous project"
          className={CONTROL_STYLES}
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollToSlide(1)}
          disabled={!canScrollNext}
          aria-label="Next project"
          className={CONTROL_STYLES}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
      */}
    </div>
  );
}
