'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedProduct {
  id: string;
  slug: string;
  title: string;
  image: { url: string; alt: string };
}

interface FeaturedCarouselProps {
  products: FeaturedProduct[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = products.length;

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (count > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % count);
      }, 5000);
    }
  }, [count]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [resetAutoplay]);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % count) + count) % count);
      resetAutoplay();
    },
    [count, resetAutoplay]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (dragOffset < -threshold) {
      goTo(current + 1);
    } else if (dragOffset > threshold) {
      goTo(current - 1);
    }
    setDragOffset(0);
  };

  if (count === 0) return null;

  // Single product — no carousel controls needed
  if (count === 1) {
    const p = products[0];
    return (
      <Link href={`/shop/${p.slug}`} className="block relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1] rounded overflow-hidden group">
        <Image
          src={p.image.url}
          alt={p.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Featured</p>
          <h3 className="text-xl sm:text-2xl font-display text-white line-clamp-2">{p.title}</h3>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative select-none">
      {/* Carousel track */}
      <div
        ref={trackRef}
        className="overflow-hidden rounded touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${current * 100}% + ${isDragging ? dragOffset : 0}px))`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="relative w-full flex-shrink-0 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1] group"
              draggable={false}
              onClick={(e) => {
                // Prevent navigation if user was dragging
                if (Math.abs(dragOffset) > 5) e.preventDefault();
              }}
            >
              <Image
                src={p.image.url}
                alt={p.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={p.id === products[0].id}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Featured</p>
                <h3 className="text-xl sm:text-2xl font-display text-white line-clamp-2">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo(current - 1)}
        aria-label="Previous product"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-accent"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo(current + 1)}
        aria-label="Next product"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-accent"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {products.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goTo(i)}
            aria-label={`Go to product ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-accent' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
