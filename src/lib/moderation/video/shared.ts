export type VideoModerationSeverity = "high" | "low";

export type VideoModerationDetection = {
  label: string;
  value: number;
  severity: VideoModerationSeverity;
};

export type VideoModerationFrame = {
  id: string;
  positionMs: number;
  timestampLabel: string;
  risk: number;
  level: "high" | "moderate" | "low";
  detections: VideoModerationDetection[];
};

export type VideoModerationResult = {
  durationMs: number;
  durationLabel: string;
  frames: VideoModerationFrame[];
};

export const defaultVideoModerationResult: VideoModerationResult = {
  durationMs: 0,
  durationLabel: "00:00",
  frames: [],
};

export function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
