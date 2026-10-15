"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-bleed page background. The static mountain image is always rendered
 * underneath; the video fades in only once it is actually playing, plays a
 * single time, then fades back out to the image. If the video fails to load
 * or autoplay is blocked it never reports "playing", so the image stays.
 */
export function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  // The "playing" event can fire before hydration attaches the handler.
  useEffect(() => {
    const video = videoRef.current;
    if (video && !video.paused && !video.ended && video.readyState >= 3) {
      setShowVideo(true);
    }
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
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={() => setShowVideo(true)}
        onEnded={() => setShowVideo(false)}
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
