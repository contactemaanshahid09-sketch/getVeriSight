"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  defaultImageModerationResults,
  type ImageModerationResults,
  type ModerationCategoryKey,
} from "@/lib/moderation/image/shared";
import { requireAuthForModeration } from "@/lib/auth-client";

const resultSections = [
  {
    key: "nudity",
    title: "Nudity",
    subtitle: "Adult content & suggestiveness",
  },
  {
    key: "violence",
    title: "Violence, Gore, Weapons",
    subtitle: "Gore, violence, self-harm, weapons",
  },
  {
    key: "hate",
    title: "Hate & Sensitive Topics",
    subtitle: "Offensive, hateful or sensitive content",
  },
  {
    key: "substances",
    title: "Substances & Vices",
    subtitle: "Drugs, alcohol, tobacco, gambling",
  },
  {
    key: "text",
    title: "Text & QR content",
    subtitle: "Text and QR code analysis",
  },
  {
    key: "description",
    title: "Content description",
    subtitle: "Image quality and type",
  },
];

const defaultPreview = "/placeholder-girl.jpg";

export function ImagePlayground() {
  const [previewUrl, setPreviewUrl] = useState(defaultPreview);
  const [activeCategory, setActiveCategory] = useState<ModerationCategoryKey>("violence");
  const [resultsByCategory, setResultsByCategory] =
    useState<ImageModerationResults>(defaultImageModerationResults);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const previewSrc = useMemo(() => previewUrl, [previewUrl]);
  const activeColumns = resultsByCategory[activeCategory];

  async function analyzeFile(file: File) {
    const isAuthenticated = await requireAuthForModeration();

    if (!isAuthenticated) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/moderation/image", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        message?: string;
        resultsByCategory?: ImageModerationResults;
      };

      if (!response.ok || !payload.resultsByCategory) {
        throw new Error(payload.message ?? "Image moderation failed.");
      }

      setResultsByCategory(payload.resultsByCategory);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Image moderation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function updatePreview(file?: File) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const isAuthenticated = await requireAuthForModeration();

    if (!isAuthenticated) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    void analyzeFile(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    void updatePreview(event.target.files?.[0]);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void updatePreview(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  return (
    <section className="container moderation-page">
      <div className="moderation-header">
        <h2>Image Moderation Playground</h2>
        <p>
          Upload an image to inspect category-level signals, review policy-related
          risk areas, and understand what the model is detecting.
        </p>
      </div>

      <div className="moderation-shell">
        <div className="moderation-shell-grid">
          <div
            className="moderation-drop-panel"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="moderation-preview-wrap">
              <label className="moderation-preview-trigger">
                <Image
                  src={previewSrc}
                  alt="Preview for image moderation"
                  width={900}
                  height={620}
                  className="moderation-preview-image"
                  unoptimized
                />
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
            </div>
            <div className="moderation-drop-caption-wrap">
              <p className="moderation-drop-caption">
                <label className="moderation-upload-link">
                  Upload
                  <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>{" "}
                or drop image anywhere
              </p>
              {isAnalyzing ? <p className="moderation-drop-status">Analyzing image...</p> : null}
              {analysisError ? <p className="moderation-drop-status error">{analysisError}</p> : null}
            </div>
          </div>

          <aside className="moderation-results-panel">
            <div className="moderation-results-grid">
              <div className="moderation-section-rail">
                {resultSections.map((section) => (
                  <button
                    key={section.title}
                    type="button"
                    className={`moderation-section-card${
                      activeCategory === section.key ? " active" : ""
                    }`}
                      onClick={() => setActiveCategory(section.key as ModerationCategoryKey)}
                  >
                    <h3>{section.title}</h3>
                    <p>{section.subtitle}</p>
                  </button>
                ))}
              </div>

              <div
                className={`moderation-metrics-panel${
                  activeCategory === "nudity" ? " nudity-layout" : ""
                }${activeCategory === "violence" ? " violence-layout" : ""}${
                  activeCategory === "hate" ? " hate-layout" : ""
                }${activeCategory === "substances" ? " substances-layout" : ""}${
                  activeCategory === "text" ? " text-layout" : ""
                }${activeCategory === "description" ? " description-layout" : ""}`}
              >
                {activeColumns.map((column) => (
                  <section key={column.title} className="moderation-metric-column">
                    <div className="moderation-metric-head">
                      <h3>{column.title}</h3>
                    </div>

                    {column.swatches ? (
                      <div className="moderation-color-swatches">
                        {column.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="moderation-color-swatch"
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="moderation-metric-rows">
                        {column.rows.map((row) => (
                          <div key={row.label} className="moderation-metric-row">
                            <span>{row.label}</span>
                            <div className="moderation-bar-track">
                              <div
                                className={`moderation-bar-fill${row.tone ? ` ${row.tone}` : ""}`}
                                style={{ width: `${row.value}%` }}
                              />
                            </div>
                            <strong>{row.value}%</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
