import Image from "next/image";

const featureItems: Array<{
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
}> = [
  {
    title: "Fast Decision Support",
    description:
      "Surface moderation signals quickly so teams can review more content, respond faster, and keep operations moving.",
    iconSrc: "/speedometer outline icon.PNG",
    iconAlt: "Speedometer icon",
  },
  {
    title: "Simple To Integrate",
    description:
      "Connect moderation workflows into your product with developer-friendly endpoints for text, image, and video analysis.",
    iconSrc: "/bolt outline icon.PNG",
    iconAlt: "Bolt icon",
  },
  {
    title: "Built For Safer Outcomes",
    description:
      "Combine model outputs with clear review context to improve consistency, reduce missed violations, and support better decisions.",
    iconSrc: "/target outline icon.PNG",
    iconAlt: "Target icon",
  },
  {
    title: "Operationally Secure",
    description:
      "Protect sensitive content with controlled workflows, secure handling, and better visibility into how moderation is performed.",
    iconSrc: "/lock outline icon.PNG",
    iconAlt: "Lock icon",
  },
];

export function WhyGetVeriSight() {
  return (
    <section className="container section why-section">
      <div className="why-heading">
        <span className="why-eyebrow">Why Teams Choose GetVeriSight</span>
      </div>

      <div className="why-grid">
        {featureItems.map((item) => (
          <article key={item.title} className="why-item">
            <div className="why-icon" aria-hidden="true">
              <Image
                src={item.iconSrc}
                alt={item.iconAlt}
                width={46}
                height={46}
                unoptimized
                className="why-icon-image"
              />
            </div>
            <div className="why-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
