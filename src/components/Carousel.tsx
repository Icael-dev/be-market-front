import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  images: string[];
  intervalMs?: number;
  autoPlay?: boolean;
}

export function Carousel({ images, intervalMs = 3000, autoPlay = true }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    if (!autoPlay || images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
  }, [autoPlay, images.length, intervalMs]);

  useEffect(() => {
    startTimer();
    return resetTimer;
  }, [startTimer, resetTimer, images.length, autoPlay, intervalMs]);

  useEffect(() => {
    resetTimer();
    startTimer();
  }, [index, startTimer, resetTimer]);

  const goTo = (i: number) => {
    setIndex((i + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="group relative">
      <div className="relative h-48 overflow-hidden rounded-lg sm:h-56 md:h-64">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-gray-900/80"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-gray-900/80"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
