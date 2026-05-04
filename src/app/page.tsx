import Image from "next/image";
import Link from "next/link";
import { HumanReviewGallery } from "@/components/home/human-review-gallery";
import { WhyGetVeriSight } from "@/components/home/why-getverisight";

const moderationShowcaseCards = [
  {
    title: "Text Moderation",
    href: "/text-moderation",
    description:
      "Flag abusive language, spam, harassment, and unsafe written content before it reaches users.",
    icon: "text",
  },
  {
    title: "Image Moderation",
    href: "/image-moderation",
    description:
      "Screen uploaded images for nudity, violence, graphic material, and visual policy violations.",
    icon: "image",
  },
  {
    title: "Video Moderation",
    href: "/video-moderation",
    description:
      "Analyze video content frame by frame to surface unsafe scenes, risky moments, and policy concerns.",
    icon: "video",
  },
] as const;

function HomeModerationIcon({ type }: { type: "text" | "image" | "video" }) {
  if (type === "text") {
    return (
      <span className="nav-dropdown-icon" aria-hidden="true">
        <span className="material-symbols-outlined nav-dropdown-icon-glyph">
          text_snippet
        </span>
      </span>
    );
  }

  if (type === "image") {
    return (
      <span className="nav-dropdown-icon" aria-hidden="true">
        <svg
          className="nav-dropdown-svg-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M20.5 16l-4.5-4.5-4 4-2.5-2.5L3.5 19" />
        </svg>
      </span>
    );
  }

  return (
    <span className="nav-dropdown-icon" aria-hidden="true">
      <svg className="nav-dropdown-svg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h7a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 14 20H7a2.5 2.5 0 0 1-2.5-2.5v-11Z" />
        <path d="M18 10.2 22 7.6v8.8L18 13.8v-3.6Z" />
      </svg>
    </span>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="container hero hive-hero">
        <div className="hive-hero-copy">
          <h1>
            <span className="hive-hero-line">Moderate text, images, and video</span>
            <span className="hive-hero-line">from one intelligent workspace.</span>
          </h1>

          <h2>Built for faster decisions and safer digital experiences</h2>

          <p>
            GetVeriSight helps teams detect policy violations, review risky content,
            and act with confidence using structured moderation results across every
            major content format.
          </p>

          <Link href="/explore-models" className="hive-hero-link">
            Try GetVeriSight Moderation Model &rarr;
          </Link>

          <div className="hive-hero-actions">
            <Link href="/contact" className="hive-button-primary">
              Get in touch
            </Link>
            <Link href="/explore-models" className="hive-button-secondary">
              Explore models
            </Link>
          </div>
        </div>

        <div className="hive-hero-visual">
          <div className="hive-hero-diagram" />
          <div className="hive-hero-image-wrap">
            <Image
              src="/get veri home image.png"
              alt="GetVeriSight moderation engine preview"
              fill
              unoptimized
              className="hive-hero-image"
            />
          </div>
        </div>
      </section>

      <section className="oversight-section">
        <div className="container oversight-shell">
          <div className="oversight-copy">
            <h2>
              AI finds risk faster. Human review makes the final decision stronger.
            </h2>
            <p>
              GetVeriSight combines automated detection with reviewer-friendly
              context, so moderation teams can investigate edge cases, reduce false
              positives, and enforce policy more consistently.
            </p>
          </div>

          <div className="oversight-visual">
            <div className="oversight-illustration">
              <Image
                src="/home section 2.png"
                alt="Human oversight moderation workflow illustration"
                fill
                unoptimized
                className="oversight-illustration-image"
              />
            </div>
          </div>

          <div className="oversight-card-grid">
            {moderationShowcaseCards.map((card) => (
              <Link key={card.title} href={card.href} className="oversight-feature-card">
                <div className="oversight-feature-icon">
                  <HomeModerationIcon type={card.icon} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HumanReviewGallery />

      <WhyGetVeriSight />
    </main>
  );
}
