import Link from "next/link";

const productLinks = [
  { label: "Text Moderation", href: "/text-moderation" },
  { label: "Image Moderation", href: "/image-moderation" },
  { label: "Video Moderation", href: "/video-moderation" },
] as const;

const modelItems = [
  "Nudity Detection",
  "Alcohol Detection",
  "Drug Detection",
  "Gore Detection",
  "Hate Detection",
  "Violence Detection",
  "Weapon Detection",
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <Link href="/" className="site-footer-brand-name">
            Get<span>VeriSight</span>
          </Link>
          <p>Cloud-Based AI Models | Data Labeling</p>
        </div>

        <div className="site-footer-column">
          <h2>Products</h2>
          <nav aria-label="Products footer links">
            {productLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer-column">
          <h2>Models</h2>
          <div className="site-footer-list" aria-label="Models list">
            {modelItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="site-footer-column">
          <h2>Company</h2>
          <nav aria-label="Company footer links">
            <Link href="/contact">Contact Us</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
