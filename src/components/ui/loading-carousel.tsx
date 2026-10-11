/**
 * cult-ui LoadingCarousel, ported from Next.js + Tailwind v4 to Vite + Tailwind v3 and themed to
 * EstateIQ tokens. Changes from upstream:
 * - `next/image` -> plain <img loading="lazy" decoding="async">.
 * - Each tip carries its own `alt` (upstream auto-generated "Visual representation for tip: …").
 * - Autoplay is OFF under prefers-reduced-motion, pauses on hover/focus, and has a visible
 *   Pause/Play control (auto-moving content > 5s must be stoppable — DESIGN.md §17.5).
 * - Colours: surface/ink/accent tokens instead of shadcn muted/foreground/primary; no raw hex.
 * - Upstream's placeholder tips (third-party product promos) removed — `tips` is required.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronRight, Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

export interface Tip {
  text: string;
  image: string;
  /** Describes the image itself (not the tip) for screen readers. */
  alt: string;
  url?: string;
}

interface LoadingCarouselProps {
  tips: Tip[];
  className?: string;
  autoplayInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  showProgress?: boolean;
  aspectRatio?: "video" | "square" | "wide";
  textPosition?: "top" | "bottom";
  onTipChange?: (index: number) => void;
  backgroundTips?: boolean;
  backgroundGradient?: boolean;
  shuffleTips?: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const getTipKey = (tip: Tip) => `${tip.text}-${tip.image}`;

// Embla already slides the track; upstream ALSO translated each slide by ±100%, which left the
// previous slide hanging in view. Fade only — Embla owns the movement.
const carouselVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } },
};

const aspectRatioClasses = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-wide",
};

const tipTextCls = "text-center md:text-left text-h3 md:text-h2 font-semibold tracking-tight text-on-scrim break-words";

export function LoadingCarousel({
  onTipChange,
  className,
  tips,
  showProgress = true,
  aspectRatio = "video",
  showNavigation = false,
  showIndicators = true,
  backgroundTips = false,
  textPosition = "bottom",
  autoplayInterval = 4500,
  backgroundGradient = false,
  shuffleTips = false,
}: LoadingCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [displayTips] = useState(() => (shuffleTips ? shuffleArray(tips) : tips));

  const autoplay = useMemo(
    () => Autoplay({ delay: autoplayInterval, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true }),
    [autoplayInterval],
  );
  // No autoplay at all for reduced-motion users; they move slides with the indicators / arrow keys.
  const playing = !prefersReducedMotion && !paused;

  useEffect(() => {
    if (!api) return;
    const ap = api.plugins().autoplay;
    if (!ap) return;
    if (playing) ap.play();
    else ap.stop();
  }, [api, playing]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setDirection(api.scrollSnapList().indexOf(api.selectedScrollSnap()) - current);

    const onSelect = () => {
      const newIndex = api.selectedScrollSnap();
      setCurrent(newIndex);
      setDirection(api.scrollSnapList().indexOf(newIndex) - current);
      onTipChange?.(newIndex);
    };
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api, current, onTipChange]);

  const handleSelect = useCallback((index: number) => api?.scrollTo(index), [api]);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
      className={cn("mx-auto w-full max-w-6xl overflow-hidden rounded-card bg-surface border border-border shadow-md", className)}
    >
      <div className="w-full overflow-hidden">
        <Carousel setApi={setApi} plugins={[autoplay]} className="relative w-full" opts={{ loop: true }} aria-label="EstateIQ highlights">
          <CarouselContent>
            <AnimatePresence initial={false} custom={direction}>
              {displayTips.map((tip, index) => (
                <CarouselItem key={getTipKey(tip)} className="min-w-0" aria-label={`${index + 1} of ${displayTips.length}`}>
                  <motion.div
                    variants={carouselVariants}
                    initial={prefersReducedMotion ? false : "enter"}
                    animate="center"
                    exit={prefersReducedMotion ? undefined : "exit"}
                    custom={direction}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
                    className={`relative ${aspectRatioClasses[aspectRatio]} w-full overflow-hidden bg-bg`}
                  >
                    <img
                      src={tip.image}
                      alt={tip.alt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {backgroundGradient && (
                      <div className="absolute inset-0 bg-gradient-to-t from-scrim/80 via-scrim/20 to-transparent" aria-hidden="true" />
                    )}

                    {backgroundTips ? (
                      <motion.div
                        variants={textVariants}
                        initial={prefersReducedMotion ? false : "hidden"}
                        animate="visible"
                        className={`absolute ${textPosition === "top" ? "top-0" : "bottom-0"} inset-x-0 min-w-0 p-4 sm:p-6 md:p-8`}
                      >
                        {tip.url ? (
                          <a href={tip.url} className="block min-w-0 rounded-control">
                            <p className={tipTextCls}>{tip.text}</p>
                          </a>
                        ) : (
                          <p className={tipTextCls}>{tip.text}</p>
                        )}
                      </motion.div>
                    ) : null}
                  </motion.div>
                </CarouselItem>
              ))}
            </AnimatePresence>
          </CarouselContent>
          {showNavigation && (
            <>
              <CarouselPrevious className="left-2 h-10 w-10 active:scale-[0.96]" />
              <CarouselNext className="right-2 h-10 w-10 active:scale-[0.96]" />
            </>
          )}
        </Carousel>

        <div className="bg-surface p-4 sm:p-5">
          <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            {showIndicators && (
              <div className="flex w-full gap-2 overflow-x-auto pb-1 sm:pb-0">
                {displayTips.map((tip, index) => {
                  const isActive = index === current;
                  const isComplete = index < current;
                  return (
                    <button
                      key={getTipKey(tip)}
                      type="button"
                      className="flex h-10 min-w-8 flex-1 items-center rounded-pill transition-transform active:scale-[0.96] sm:min-w-0 sm:shrink"
                      onClick={() => handleSelect(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span className="relative h-1 w-full overflow-hidden rounded-pill bg-ink/10">
                        {showProgress ? (
                          isComplete ? (
                            <span className="absolute inset-0 rounded-pill bg-accent" />
                          ) : isActive ? (
                            <motion.span
                              key={`${current}-${playing}`}
                              initial={{ scaleX: playing ? 0 : 1 }}
                              animate={{ scaleX: 1 }}
                              transition={playing ? { duration: autoplayInterval / 1000, ease: "linear" } : { duration: 0 }}
                              className="absolute inset-0 origin-left rounded-pill bg-accent"
                            />
                          ) : null
                        ) : (
                          <span
                            className={cn(
                              "absolute inset-0 origin-left rounded-pill bg-accent transition-transform duration-base ease-out",
                              isActive ? "scale-x-100" : "scale-x-0",
                            )}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex min-w-0 items-center gap-3 text-ink-soft">
              {!prefersReducedMotion && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-pressed={paused}
                  aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                  className="grid size-8 place-items-center rounded-pill border border-border text-ink-soft transition hover:text-ink hover:bg-surface-hover"
                >
                  {paused ? <Play size={14} strokeWidth={1.5} /> : <Pause size={14} strokeWidth={1.5} />}
                </button>
              )}
              {backgroundTips ? (
                <span className="whitespace-nowrap text-body font-medium tnum">
                  {current + 1}/{displayTips.length}
                </span>
              ) : (
                <span className="block max-w-full break-words text-h3 font-semibold tracking-tight text-ink">
                  {displayTips[current]?.text}
                </span>
              )}
              {backgroundTips && <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} />}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LoadingCarousel;
