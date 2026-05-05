import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";

const faqLinks = [
  { label: "Text Moderation", href: "/text-moderation" },
  { label: "Image Moderation", href: "/image-moderation" },
  { label: "Video Moderation", href: "/video-moderation" },
] as const;

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="container contact-section">
        <div className="contact-shell">
          <div className="contact-intro">
            <h3>Have a Question?</h3>

            <p>
              At GetVeriSight, we focus on clear, practical support for teams building
              moderation workflows. If you have any questions, please use the form
              below to contact us.
            </p>

            <p>
              If you are exploring one of our moderation modules, you can start with
              these quick links before sending a message:
            </p>

            <ul className="contact-faq-list">
              {faqLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="contact-form-card">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
