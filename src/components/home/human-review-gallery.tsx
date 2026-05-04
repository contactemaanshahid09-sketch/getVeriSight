"use client";

import Image from "next/image";
import { useState } from "react";

const reviewImages = [
  {
    src: "/section-3 img1.jpg",
    alt: "Blurred moderation example one",
  },
  {
    src: "/section-3 img2.jpg",
    alt: "Blurred moderation example two",
  },
  {
    src: "/section-3 img3.jpg",
    alt: "Blurred moderation example three",
  },
  {
    src: "/section-3 img4.jpg",
    alt: "Blurred moderation example four",
  },
  {
    src: "/section-3 img5.jpg",
    alt: "Blurred moderation example five",
  },
  {
    src: "/section-3 img6.jpg",
    alt: "Blurred moderation example six",
  },
] as const;

export function HumanReviewGallery() {
  const [revealed, setRevealed] = useState<boolean[]>(
    () => reviewImages.map(() => false),
  );

  return (
    <section className="container section human-review-section">
      <div className="human-review-heading">
        <h2>Why review teams still need the final say.</h2>
        <p>
          These examples show how sensitive content can slip past automated systems
          alone. Human review adds the judgment needed for nuanced, policy-aware
          moderation. Some images may be disturbing. Click to reveal.
        </p>
      </div>

      <div className="human-review-grid">
        {reviewImages.map((image, index) => {
          const isRevealed = revealed[index];

          return (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className={`human-review-tile${isRevealed ? " revealed" : ""}`}
              onClick={() =>
                setRevealed((current) =>
                  current.map((value, valueIndex) =>
                    valueIndex === index ? !value : value,
                  ),
                )
              }
              aria-pressed={isRevealed}
              aria-label={isRevealed ? "Blur image again" : "Reveal image"}
            >
              <span className="human-review-image-wrap">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  unoptimized
                  className="human-review-image"
                />
              </span>
              {!isRevealed ? (
                <span className="human-review-overlay">Click to reveal</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
