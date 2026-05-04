import { env } from "@/lib/env";
import {
  defaultVideoModerationResult,
  formatDuration,
  type VideoModerationDetection,
  type VideoModerationFrame,
  type VideoModerationResult,
} from "@/lib/moderation/video/shared";

export type VideoModerationRequest = {
  file: File;
};

export type VideoModerationResponse = {
  provider: "getverisight";
  result: VideoModerationResult;
  raw?: unknown;
};

const GETVERISIGHT_VIDEO_MODELS = [
  "nudity-2.1",
  "violence",
  "weapon",
  "gore-2.0",
  "self-harm",
  "offensive",
  "recreational_drug",
  "medical",
  "alcohol",
  "gambling",
  "tobacco",
  "money",
].join(",");

const DETECTION_PATHS = [
  { label: "sexual_activity", paths: [["nudity", "sexual_activity"]] },
  { label: "sexual_display", paths: [["nudity", "sexual_display"]] },
  { label: "erotica", paths: [["nudity", "erotica"]] },
  { label: "suggestive", paths: [["nudity", "suggestive"]] },
  { label: "bikini", paths: [["nudity", "suggestive_classes", "bikini"], ["nudity", "bikini"]] },
  { label: "cleavage", paths: [["nudity", "suggestive_classes", "cleavage"], ["nudity", "cleavage"]] },
  { label: "lingerie", paths: [["nudity", "suggestive_classes", "lingerie"], ["nudity", "lingerie"]] },
  { label: "male_chest", paths: [["nudity", "suggestive_classes", "male_chest"], ["nudity", "male_chest"]] },
  {
    label: "male_underwear",
    paths: [["nudity", "suggestive_classes", "male_underwear"], ["nudity", "male_underwear"]],
  },
  {
    label: "swimwear_one_piece",
    paths: [["nudity", "suggestive_classes", "swimwear_one_piece"], ["nudity", "swimwear_one_piece"]],
  },
  { label: "violence", paths: [["violence", "physical_violence"]] },
  { label: "combat_sport", paths: [["violence", "combat_sport"]] },
  { label: "firearm", paths: [["weapon", "classes", "firearm"]] },
  { label: "knife", paths: [["weapon", "classes", "knife"]] },
  { label: "firearm_gesture", paths: [["weapon", "classes", "firearm_gesture"]] },
  { label: "gore", paths: [["gore", "classes", "gore"]] },
  { label: "very_bloody", paths: [["gore", "classes", "very_bloody"]] },
  { label: "serious_injury", paths: [["gore", "classes", "serious_injury"]] },
  { label: "self_harm", paths: [["self_harm", "self_harm"]] },
  { label: "terrorist", paths: [["offensive", "terrorist"]] },
  { label: "middle_finger", paths: [["offensive", "middle_finger"]] },
  { label: "cannabis", paths: [["recreational_drug", "cannabis"]] },
  { label: "pills", paths: [["medical", "pills"]] },
  { label: "alcohol", paths: [["alcohol", "alcohol"]] },
  { label: "gambling", paths: [["gambling", "gambling"]] },
  { label: "tobacco", paths: [["tobacco", "regular_tobacco"]] },
  { label: "money", paths: [["money", "money"]] },
] as const;

function asPercent(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function getNestedValue(source: unknown, path: readonly string[]) {
  let current: unknown = source;

  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return 0;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return asPercent(current);
}

function getBestValue(source: unknown, paths: readonly (readonly string[])[]) {
  return paths.reduce((best, path) => Math.max(best, getNestedValue(source, path)), 0);
}

function getFrameLevel(risk: number) {
  if (risk >= 75) {
    return "high";
  }

  if (risk >= 30) {
    return "moderate";
  }

  return "low";
}

function getSeverity(value: number): VideoModerationDetection["severity"] {
  return value >= 75 ? "high" : "low";
}

function buildDetections(frame: Record<string, unknown>) {
  const detections: VideoModerationDetection[] = [];

  for (const definition of DETECTION_PATHS) {
    const value = getBestValue(frame, definition.paths);

    if (value <= 0) {
      continue;
    }

    detections.push({
      label: definition.label,
      value,
      severity: getSeverity(value),
    });
  }

  return detections.sort((a, b) => b.value - a.value);
}

function buildResult(payload: Record<string, unknown>) {
  const data = payload.data;
  const rawFrames =
    data && typeof data === "object" && Array.isArray((data as { frames?: unknown }).frames)
      ? ((data as { frames: unknown[] }).frames ?? [])
      : [];

  const frames = rawFrames
    .map((frame, index): VideoModerationFrame | null => {
      if (!frame || typeof frame !== "object") {
        return null;
      }

      const record = frame as Record<string, unknown>;
      const info =
        record.info && typeof record.info === "object"
          ? (record.info as Record<string, unknown>)
          : {};
      const positionMs =
        typeof info.position === "number" ? Math.max(0, Math.round(info.position)) : index * 2000;
      const detections = buildDetections(record);
      const risk = detections.reduce((best, detection) => Math.max(best, detection.value), 0);

      return {
        id:
          typeof info.id === "string"
            ? info.id
            : `frame-${positionMs}-${index}`,
        positionMs,
        timestampLabel: formatDuration(positionMs / 1000),
        risk,
        level: getFrameLevel(risk),
        detections,
      };
    })
    .filter((frame): frame is VideoModerationFrame => Boolean(frame));

  const durationMs =
    frames.length > 0 ? Math.max(...frames.map((frame) => frame.positionMs)) : 0;

  return {
    durationMs,
    durationLabel: formatDuration(durationMs / 1000),
    frames,
  } satisfies VideoModerationResult;
}

export function isVideoModerationConfigured() {
  return Boolean(env.GETVERISIGHT_API_USER && env.GETVERISIGHT_API_SECRET);
}

export async function moderateVideo(input: VideoModerationRequest): Promise<VideoModerationResponse> {
  if (!isVideoModerationConfigured()) {
    throw new Error(
      "Video moderation is not configured. Add GETVERISIGHT_API_USER and GETVERISIGHT_API_SECRET to .env.local.",
    );
  }

  const form = new FormData();
  form.append("media", input.file, input.file.name);
  form.append("models", GETVERISIGHT_VIDEO_MODELS);
  form.append("api_user", env.GETVERISIGHT_API_USER as string);
  form.append("api_secret", env.GETVERISIGHT_API_SECRET as string);

  const response = await fetch("https://api.sightengine.com/1.0/video/check-sync.json", {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      (payload.error as { message?: string } | undefined)?.message ??
        "Video moderation request failed.",
    );
  }

  return {
    provider: "getverisight",
    result: buildResult(payload) ?? defaultVideoModerationResult,
    raw: payload,
  };
}
