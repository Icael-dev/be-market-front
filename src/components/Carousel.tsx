import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      setIndex(i => (i + 1) % images.length);
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
    <div className="relative group">
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-xl">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-900/80 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-900/80 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
