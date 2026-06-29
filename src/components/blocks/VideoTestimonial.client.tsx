"use client";

import * as React from "react";

/**
 * VideoTestimonialPlayer — the inline-player swap island for the testimonial
 * `video` variant (mockup `components/video-testimonial`). The renderer emits a
 * static, editable poster `<button class="video-thumbnail">` (16/9 image +
 * `.play-btn` + CC chip) as a server component; this island only owns the
 * click-to-play behaviour: on first click it replaces the poster button with a
 * real `<video>` (controls, captions, poster) in the same slot — exactly like
 * the mockup JS — so the experience meets WCAG AA.
 *
 * Degrades gracefully: with JS disabled the poster button renders a wrapping
 * `<a href={video}>` fallback (in the renderer) so the video file is still
 * reachable; this island suppresses that navigation once hydrated and swaps in
 * the player instead.
 *
 * Token-only: this island sets NO colors — all styling (poster, play button,
 * CC chip, inline player) lives in the renderer's token classes + the global
 * `.video-thumbnail`/`.video-inline-player` patterns. No hex / rgba here.
 */
export function VideoTestimonialPlayer({
  video,
  captions,
  poster,
  label,
  children,
}: {
  video: string;
  captions?: string;
  poster?: string;
  label: string;
  children: React.ReactNode;
}) {
  const slotRef = React.useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = React.useState(false);

  function handleActivate(e: React.MouseEvent) {
    // Suppress the no-JS <a href={video}> fallback navigation; swap in player.
    e.preventDefault();
    if (playing) return;
    setPlaying(true);
  }

  React.useEffect(() => {
    if (!playing) return;
    const video = slotRef.current?.querySelector("video");
    video?.focus();
    const p = video?.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* controls remain visible if autoplay is blocked */
      });
    }
  }, [playing]);

  return (
    <div ref={slotRef} onClick={handleActivate} className="contents" data-nocms-component="video-testimonial.client">
      {playing ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- caption <track> appended below when present
        <video
          className="video-inline-player block w-full aspect-video rounded-[var(--radius)] bg-[var(--color-rich-brown)] shadow-[var(--shadow-lg)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          controls
          preload="metadata"
          controlsList="nodownload"
          playsInline
          aria-label={label}
          poster={poster}
        >
          <source src={video} type="video/mp4" />
          {captions ? (
            <track kind="captions" src={captions} srcLang="en" label="English" default />
          ) : null}
        </video>
      ) : (
        children
      )}
    </div>
  );
}
