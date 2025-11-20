// src/components/AdaptiveImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string; // optional extra classes applied to the <Image> element wrapper
  sizes?: string;
  priority?: boolean;
};

/**
 * AdaptiveImage chooses `object-fit: contain` for roughly square/tall images (posters/logos)
 * and `object-fit: cover` for wide images (landscapes/hero).
 *
 * This prevents posters (1200x1200) from being center-cropped while keeping cards uniform.
 */
export default function AdaptiveImage({ src, alt = "", className = "", sizes, priority = false }: Props) {
  const [fit, setFit] = useState<"cover" | "contain">("cover");

  return (
    <div className={`w-full h-full ${className}`} style={{ position: "relative" }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{
          objectFit: fit,
          objectPosition: "center",
        }}
        onLoadingComplete={(meta) => {
          // meta has naturalWidth/naturalHeight in client.
          const w = (meta as any)?.naturalWidth;
          const h = (meta as any)?.naturalHeight;
          if (!w || !h) return;

          const ratio = w / h;
          // If image is near-square (poster) or taller than wide, use contain.
          // Adjust thresholds as needed:
          if (ratio >= 0.9 && ratio <= 1.1) {
            setFit("contain"); // square posters
          } else if (ratio < 0.9) {
            setFit("contain"); // tall images (logos etc)
          } else {
            setFit("cover"); // wide images (hero, landscape)
          }
        }}
      />
    </div>
  );
}
