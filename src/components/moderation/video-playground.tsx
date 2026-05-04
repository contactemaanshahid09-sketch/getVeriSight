"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultVideoModerationResult,
  formatDuration,
  type VideoModerationDetection,
  type VideoModerationFrame,
  type VideoModerationResult,
} from "@/lib/moderation/video/shared";
import { requireAuthForModeration } from "@/lib/auth-client";

type VideoModerationApiResponse = {
  message?: string;
  result?: VideoModerationResult;
  raw?: unknown;
};

function groupDetections(detections: VideoModerationDetection[], severity: "high" | "low") {
  return detections.filter((item) => item.severity === severity);
}

export function VideoPlayground() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VideoModerationResult>(defaultVideoModerationResult);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [viewMode, setViewMode] = useState<"simple" | "json">("simple");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const activeFrame = useMemo(() => {
    if (result.frames.length === 0) {
      return null;
    }

    const currentMs = currentTime * 1000;

    return result.frames.reduce((closest, frame) => {
      if (!closest) {
        return frame;
      }

      const currentDelta = Math.abs(frame.positionMs - currentMs);
      const closestDelta = Math.abs(closest.positionMs - currentMs);
      return currentDelta < closestDelta ? frame : closest;
    }, result.frames[0] as VideoModerationFrame | null);
  }, [currentTime, result.frames]);

  const highDetections = activeFrame ? groupDetections(activeFrame.detections, "high") : [];
  const lowDetections = activeFrame ? groupDetections(activeFrame.detections, "low") : [];
  const durationLabel =
    videoRef.current?.duration && Number.isFinite(videoRef.current.duration)
      ? formatDuration(videoRef.current.duration)
      : result.durationLabel;

  async function analyzeVideo(file: File) {
    const isAuthenticated = await requireAuthForModeration();

    if (!isAuthenticated) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(defaultVideoModerationResult);
    setRawResult(null);
    setCurrentTime(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/moderation/video", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as VideoModerationApiResponse;

      if (!response.ok || !payload.result) {
        throw new Error(payload.message ?? "Video moderation failed.");
      }

      setResult(payload.result);
      setRawResult(payload.raw ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Video moderation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleVideoSelection(file?: File) {
    if (!file || !file.type.startsWith("video/")) {
      return;
    }

    const isAuthenticated = await requireAuthForModeration();

    if (!isAuthenticated) {
      return;
    }

    const probeUrl = URL.createObjectURL(file);
    const probeVideo = document.createElement("video");
    probeVideo.preload = "metadata";
    probeVideo.src = probeUrl;

    probeVideo.onloadedmetadata = () => {
      const duration = probeVideo.duration;
      URL.revokeObjectURL(probeUrl);

      if (!Number.isFinite(duration) || duration > 60) {
        setError("Upload videos up to 60 seconds or less");
        return;
      }

      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }

      const nextUrl = URL.createObjectURL(file);
      setVideoUrl(nextUrl);
      setError(null);
      void analyzeVideo(file);
    };

    probeVideo.onerror = () => {
      URL.revokeObjectURL(probeUrl);
      setError("Unable to read this video. Please upload a valid video file.");
    };
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    void handleVideoSelection(event.target.files?.[0]);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void handleVideoSelection(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function jumpToFrame(frame: VideoModerationFrame) {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.currentTime = frame.positionMs / 1000;
    setCurrentTime(frame.positionMs / 1000);
  }

  return (
    <section className="container video-page">
      <div className="moderation-header">
        <h2>Video Moderation Playground</h2>
        <p>
          Upload a short video, review frame-level risk signals, and inspect the
          strongest detections in a streamlined moderation workspace.
        </p>
      </div>

      <div className="video-shell">
        <div className="video-shell-grid">
          <section className="video-stage-panel">
            <div className="video-stage-head">
              <div>
                <h3>Video Review</h3>
                <p>
                  Scan short videos for nudity, violence, weapons, substances, and
                  other visual policy concerns.
                </p>
              </div>

              <label className="video-upload-button">
                Upload
                <input type="file" accept="video/*" onChange={handleInputChange} hidden />
              </label>
            </div>

            <div
              className="video-stage"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {videoUrl ? (
                <video
                  ref={videoRef}
                  className="video-player"
                  src={videoUrl}
                  controls
                  playsInline
                  onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                  onLoadedMetadata={(event) => setCurrentTime(event.currentTarget.currentTime)}
                />
              ) : (
                <div className="video-empty-state">
                  <p>Upload a short video to begin moderation.</p>
                </div>
              )}
            </div>

            <div className="video-meta-row">
              <div className="video-meta-block">
                <span>Current</span>
                <strong>{formatDuration(currentTime)}</strong>
              </div>
              <div className="video-meta-block">
                <span>Duration</span>
                <strong>{durationLabel}</strong>
              </div>
            </div>

            <div className="video-timeline-shell">
              <div className="video-timeline-scale">
                {result.frames.map((frame) => {
                  const percent =
                    result.durationMs > 0 ? (frame.positionMs / result.durationMs) * 100 : 0;

                  return (
                    <button
                      key={frame.id}
                      type="button"
                      className={`video-scale-tick${
                        activeFrame?.id === frame.id ? " active" : ""
                      }`}
                      style={{ left: `${percent}%` }}
                      onClick={() => jumpToFrame(frame)}
                      aria-label={`Jump to ${frame.timestampLabel}`}
                    />
                  );
                })}
              </div>

              <div className="video-timeline-lanes">
                <div className="video-timeline-lane">
                  <span>high</span>
                  <div className="video-timeline-track">
                    {result.frames.map((frame) => {
                      const left =
                        result.durationMs > 0 ? (frame.positionMs / result.durationMs) * 100 : 0;

                      return (
                        <button
                          key={`${frame.id}-high`}
                          type="button"
                          className={`video-timeline-segment ${frame.level}${
                            activeFrame?.id === frame.id ? " active" : ""
                          }`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(2, 100 / Math.max(result.frames.length, 1) - 0.8)}%`,
                          }}
                          onClick={() => jumpToFrame(frame)}
                          aria-label={`Review frame at ${frame.timestampLabel}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {isAnalyzing ? <p className="video-status-text">Analyzing video...</p> : null}
            {error ? <p className="video-status-text error">{error}</p> : null}
          </section>

          <aside className="video-results-panel">
            <div className="video-results-head">
              <h3>Results</h3>
              <div className="video-results-tabs">
                <button
                  type="button"
                  className={`video-results-tab${viewMode === "simple" ? " active" : ""}`}
                  onClick={() => setViewMode("simple")}
                >
                  Simple
                </button>
                <button
                  type="button"
                  className={`video-results-tab${viewMode === "json" ? " active" : ""}`}
                  onClick={() => setViewMode("json")}
                >
                  JSON
                </button>
              </div>
            </div>

            <div className="video-results-card">
              {viewMode === "simple" ? (
                <>
                  <div className="video-results-group">
                    <div className="video-results-group-head high">
                      <span className="video-results-dot" />
                      <strong>High</strong>
                      <span>{activeFrame?.timestampLabel ?? "--:--"}</span>
                    </div>

                    <div className="video-results-tags">
                      {highDetections.length > 0 ? (
                        highDetections.map((item) => (
                          <span key={`${item.label}-${item.value}`} className="video-result-tag high">
                            {item.label}:{item.value.toFixed(2)}
                          </span>
                        ))
                      ) : (
                        <p className="video-results-empty">No high-risk detections on this frame.</p>
                      )}
                    </div>
                  </div>

                  <div className="video-results-group">
                    <div className="video-results-group-head low">
                      <span className="video-results-dot" />
                      <strong>Low</strong>
                      <span>{activeFrame?.detections.length ?? 0} signals</span>
                    </div>

                    <div className="video-results-tags">
                      {lowDetections.length > 0 ? (
                        lowDetections.map((item) => (
                          <span key={`${item.label}-${item.value}`} className="video-result-tag low">
                            {item.label}:{item.value.toFixed(2)}
                          </span>
                        ))
                      ) : (
                        <p className="video-results-empty">No low-risk detections on this frame.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <pre className="video-json-view">
                  {rawResult ? JSON.stringify(rawResult, null, 2) : "Upload a video to inspect raw JSON."}
                </pre>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
