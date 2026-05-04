"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

const serviceOptions = [
  "General Inquiry",
  "Text Moderation",
  "Image Moderation",
  "Video Moderation",
] as const;

type ServiceOption = (typeof serviceOptions)[number];

type ContactFormState = {
  loading: boolean;
  error: string;
  success: string;
};

const initialState: ContactFormState = {
  loading: false,
  error: "",
  success: "",
};

export function ContactForm() {
  const [selectedService, setSelectedService] = useState<ServiceOption>(serviceOptions[0]);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [state, setState] = useState<ContactFormState>(initialState);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsServiceOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsServiceOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, error: "", success: "" });
    const form = event.currentTarget;

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      service: selectedService,
      message: String(formData.get("message") ?? ""),
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({
        loading: false,
        error: data.message ?? "Unable to send your message right now.",
        success: "",
      });
      return;
    }

    form.reset();
    setSelectedService(serviceOptions[0]);
    setState({
      loading: false,
      error: "",
      success: data.message ?? "Your message has been sent successfully.",
    });
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field">
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" name="name" type="text" required />
      </div>

      <div className="contact-field">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" required />
      </div>

      <div className="contact-field">
        <label htmlFor="contact-service">Service</label>
        <div
          ref={dropdownRef}
          className={`contact-select${isServiceOpen ? " open" : ""}`}
        >
          <input
            id="contact-service"
            name="service"
            type="hidden"
            value={selectedService}
          />
          <button
            type="button"
            className="contact-select-trigger"
            aria-haspopup="listbox"
            aria-expanded={isServiceOpen}
            onClick={() => setIsServiceOpen((current) => !current)}
          >
            <span>{selectedService}</span>
            <span className="contact-select-arrow" aria-hidden="true">
              v
            </span>
          </button>

          <div className="contact-select-menu" role="listbox" aria-label="Service options">
            {serviceOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selectedService === option}
                className={`contact-select-option${
                  selectedService === option ? " selected" : ""
                }`}
                onClick={() => {
                  setSelectedService(option);
                  setIsServiceOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="contact-field">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={8} required />
      </div>

      {state.error ? <div className="message error">{state.error}</div> : null}
      {state.success ? <div className="message success">{state.success}</div> : null}

      <button type="submit" className="contact-submit-button" disabled={state.loading}>
        {state.loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
