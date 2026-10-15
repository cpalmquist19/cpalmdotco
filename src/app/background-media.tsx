"use client";

import { useEffect, useRef, useState } from "react";

const PLAYED_COOKIE = "background-video-played";

function hasPlayed() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${PLAYED_COOKIE}=`));
}

function markPlayed() {
  document.cookie = `${PLAYED_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

/**
 * Full-bleed page background. The static mountain image is always rendered
 * underneath; the video fades in only once it is actually playing, plays a
 * single time, then fades back out to the image. Once it has finished, a
 * cookie records that so later loads and refreshes show only the image. If
 * the video fails to load or autoplay is blocked it never reports "playing",
 * so the image stays.
 */
export function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Play from an effect instead of the autoPlay attribute so the cookie can
  // be checked first. Muted playback is allowed without a user gesture.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasPlayed()) return;
    video.play().catch(() => {});
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[url('/distance.jpg')] bg-cover bg-center"
      />
      <video
        ref={videoRef}
        aria-hidden="true"
        muted
        playsInline
        preload="auto"
        onPlaying={() => setShowVideo(true)}
        onEnded={() => {
          markPlayed();
          setShowVideo(false);
        }}
        className={`absolute inset-0 -z-10 size-full object-cover object-center transition-opacity duration-700 ${
          showVideo ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/background.webm" type="video/webm" />
        <source src="/background-opt.mp4" type="video/mp4" />
      </video>
    </>
  );
}
