import Image from "next/image";
import Link from "next/link";
import { ExploreSidebar } from "@/components/explore/explore-sidebar";

const solutionCards = [
  {
    title: "Image Moderation",
    href: "/image-moderation",
    description:
      "Automatically detect nudity, violence, graphic content, and visual policy violations in uploaded images.",
    image: "/explore-models img1.PNG",
    alt: "Preview collage for image moderation",
  },
  {
    title: "Video Moderation",
    href: "/video-moderation",
    description:
      "Review unsafe scenes frame by frame and surface the strongest moderation signals across short videos.",
    image: "/explore-models img2.jpeg",
    alt: "Preview collage for video moderation",
  },
  {
    title: "Text Moderation",
    href: "/text-moderation",
    description:
      "Filter harmful text with ML scoring and rule-based policy checks in one streamlined workspace.",
    image: "/explore-models img3.jpg",
    alt: "Preview collage for text moderation",
  },
] as const;

export default function ExploreModelsPage() {
  return (
    <main className="solutions-page">
      <div className="solutions-layout">
        <ExploreSidebar />

        <section className="solutions-content">
          <div className="solutions-banner">Explore GetVeriSight moderation solutions</div>

          <div className="solutions-content-inner">
            <header className="solutions-header">
              <h1>Explore our solutions</h1>
              <p>
                Choose a moderation workflow to review text, images, or video in a
                workspace built for faster decisions and safer platforms.
              </p>
            </header>

            <div className="solutions-grid">
              {solutionCards.map((card) => (
                <Link key={card.title} href={card.href} className="solution-card">
                  <div className="solution-card-visual">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      unoptimized
                      className="solution-card-image"
                    />
                    <div className="solution-card-overlay" />
                  </div>

                  <div className="solution-card-copy">
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
