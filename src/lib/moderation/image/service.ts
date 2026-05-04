import { env } from "@/lib/env";
import {
  defaultImageModerationResults,
  type ImageModerationResults,
} from "@/lib/moderation/image/shared";

export type ImageModerationResponse = {
  provider: "getverisight";
  resultsByCategory: ImageModerationResults;
  raw?: unknown;
};

const GETVERISIGHT_IMAGE_MODELS = [
  "nudity-2.1",
  "weapon",
  "violence",
  "gore-2.0",
  "self-harm",
  "offensive-2.0",
  "destruction",
  "military",
  "recreational_drug",
  "medical",
  "alcohol",
  "gambling",
  "tobacco",
  "money",
  "text",
  "text-content-2.0",
  "qr-content",
  "quality",
  "properties",
  "type",
].join(",");

const GETVERISIGHT_TEXT_CATEGORIES = [
  "sexual",
  "insult",
  "discriminatory",
  "inappropriate",
  "grawlix",
  "email",
  "phone_number",
  "link",
  "extremism",
  "medical",
  "drug",
  "weapon",
  "self_harm",
  "violence",
  "content_trade",
  "money_transaction",
].join(",");

export type ImageModerationRequest = {
  file: File;
};

function asPercent(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function getValue(source: unknown, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = source;

    for (const key of path) {
      if (!current || typeof current !== "object" || !(key in current)) {
        current = undefined;
        break;
      }

      current = (current as Record<string, unknown>)[key];
    }

    if (typeof current === "number") {
      return asPercent(current);
    }
  }

  return 0;
}

function scanHexColors(source: unknown, matches: string[] = []) {
  if (matches.length >= 6 || source == null) {
    return matches;
  }

  if (typeof source === "string") {
    const normalized = source.startsWith("#") ? source : `#${source}`;

    if (/^#[0-9a-f]{6}$/i.test(normalized) && !matches.includes(normalized)) {
      matches.push(normalized);
    }

    return matches;
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      scanHexColors(item, matches);
    }

    return matches;
  }

  if (typeof source === "object") {
    for (const value of Object.values(source)) {
      scanHexColors(value, matches);
    }
  }

  return matches;
}

function buildResults(payload: Record<string, unknown>): ImageModerationResults {
  const colors =
    scanHexColors(payload["colors"]).length > 0
      ? scanHexColors(payload["colors"])
      : scanHexColors(payload["color"]).length > 0
        ? scanHexColors(payload["color"])
      : defaultImageModerationResults.description[1].swatches ?? [];

  return {
    nudity: [
      {
        title: "Intensity classes",
        rows: [
          { label: "Sexual activity", value: getValue(payload, [["nudity", "sexual_activity"]]) },
          { label: "Sexual display", value: getValue(payload, [["nudity", "sexual_display"]]) },
          { label: "Erotica", value: getValue(payload, [["nudity", "erotica"]]) },
          { label: "Very suggestive", value: getValue(payload, [["nudity", "very_suggestive"]]) },
          { label: "Suggestive", value: getValue(payload, [["nudity", "suggestive"]]) },
          {
            label: "Mildly suggestive",
            value: getValue(payload, [["nudity", "mildly_suggestive"]]),
          },
          { label: "None", value: getValue(payload, [["nudity", "none"]]), tone: "red" },
        ],
      },
      {
        title: "Suggestive classes",
        rows: [
          { label: "Bikini", value: getValue(payload, [["nudity", "bikini"]]) },
          { label: "Cleavage", value: getValue(payload, [["nudity", "cleavage"]]) },
          { label: "Lingerie", value: getValue(payload, [["nudity", "lingerie"]]) },
          { label: "Male chest", value: getValue(payload, [["nudity", "male_chest"]]) },
          {
            label: "Male underwear",
            value: getValue(payload, [["nudity", "male_underwear"]]),
          },
          { label: "Minishort", value: getValue(payload, [["nudity", "minishort"]]) },
          { label: "Miniskirt", value: getValue(payload, [["nudity", "miniskirt"]]) },
          { label: "Nudity art", value: getValue(payload, [["nudity", "nudity_art"]]) },
          {
            label: "Other suggestive",
            value: getValue(payload, [["nudity", "other_suggestive"]]),
          },
          { label: "Sextoy", value: getValue(payload, [["nudity", "sextoy"]]) },
          {
            label: "Suggestive focus",
            value: getValue(payload, [["nudity", "suggestive_focus"]]),
          },
          {
            label: "Suggestive pose",
            value: getValue(payload, [["nudity", "suggestive_pose"]]),
          },
          {
            label: "Swimwear male",
            value: getValue(payload, [["nudity", "swimwear_male"]]),
          },
          {
            label: "Swimwear one piece",
            value: getValue(payload, [["nudity", "swimwear_one_piece"]]),
          },
          {
            label: "Visibly undressed",
            value: getValue(payload, [["nudity", "visibly_undressed"]]),
          },
        ],
      },
      {
        title: "Context",
        rows: [
          {
            label: "Other outdoor",
            value: getValue(payload, [["nudity", "context", "other_outdoor"]]),
            tone: "red",
          },
          {
            label: "People",
            value: getValue(payload, [["nudity", "context", "person"], ["face", "count"]]),
            tone: "red",
          },
          {
            label: "Plants / nature",
            value: getValue(payload, [["nudity", "context", "other_outdoor"]]),
          },
        ],
      },
    ],
    violence: [
      {
        title: "Violence",
        rows: [
          {
            label: "Physical violence",
            value: getValue(payload, [["violence", "physical_violence"]]),
          },
          { label: "Combat sport", value: getValue(payload, [["violence", "combat_sport"]]) },
        ],
      },
      {
        title: "Weapon classes",
        rows: [
          { label: "Firearm", value: getValue(payload, [["weapon", "classes", "firearm"]]) },
          {
            label: "Firearm gesture",
            value: getValue(payload, [["weapon", "classes", "firearm_gesture"]]),
          },
          {
            label: "Firearm toy",
            value: getValue(payload, [["weapon", "classes", "firearm_toy"]]),
          },
          { label: "Knife", value: getValue(payload, [["weapon", "classes", "knife"]]) },
        ],
      },
      {
        title: "Gore classes",
        rows: [
          { label: "Gore", value: getValue(payload, [["gore", "classes", "gore"]]) },
          {
            label: "Very bloody",
            value: getValue(payload, [["gore", "classes", "very_bloody"]]),
          },
          {
            label: "Slightly bloody",
            value: getValue(payload, [["gore", "classes", "slightly_bloody"]]),
          },
          { label: "Body organ", value: getValue(payload, [["gore", "classes", "body_organ"]]) },
          {
            label: "Serious injury",
            value: getValue(payload, [["gore", "classes", "serious_injury"]]),
          },
          {
            label: "Superficial injury",
            value: getValue(payload, [["gore", "classes", "superficial_injury"]]),
          },
          { label: "Corpse", value: getValue(payload, [["gore", "classes", "corpse"]]) },
          { label: "Skull", value: getValue(payload, [["gore", "classes", "skull"]]) },
          {
            label: "Unconscious",
            value: getValue(payload, [["gore", "classes", "unconscious"]]),
          },
          { label: "Body waste", value: getValue(payload, [["gore", "classes", "body_waste"]]) },
          {
            label: "Other gore",
            value: getValue(payload, [["gore", "classes", "other_gore"]]),
          },
        ],
      },
      {
        title: "Firearm type",
        rows: [{ label: "Animated", value: getValue(payload, [["weapon", "firearm_type", "animated"]]) }],
      },
      {
        title: "Gore type",
        rows: [
          { label: "Animated", value: getValue(payload, [["gore", "type", "animated"]]) },
          { label: "Fake", value: getValue(payload, [["gore", "type", "fake"]]) },
          { label: "Real", value: getValue(payload, [["gore", "type", "real"]]) },
        ],
      },
      {
        title: "Firearm action",
        rows: [
          {
            label: "Aiming threat",
            value: getValue(payload, [["weapon", "firearm_action", "aiming_threat"]]),
          },
          {
            label: "Aiming at camera",
            value: getValue(payload, [["weapon", "firearm_action", "aiming_at_camera"]]),
          },
          {
            label: "Aiming safe",
            value: getValue(payload, [["weapon", "firearm_action", "aiming_safe"]]),
          },
          {
            label: "In hand not aiming",
            value: getValue(payload, [["weapon", "firearm_action", "in_hand_not_aiming"]]),
          },
          {
            label: "Worn not in hand",
            value: getValue(payload, [["weapon", "firearm_action", "worn_not_in_hand"]]),
          },
          {
            label: "Not worn",
            value: getValue(payload, [["weapon", "firearm_action", "not_worn"]]),
          },
        ],
      },
      {
        title: "Self-harm",
        rows: [
          { label: "Self-harm", value: getValue(payload, [["self_harm", "self_harm"]]) },
          { label: "Real", value: getValue(payload, [["self_harm", "real"]]) },
        ],
      },
    ],
    hate: [
      {
        title: "Hate classes",
        rows: [
          { label: "Nazi", value: getValue(payload, [["offensive", "nazi"]]) },
          {
            label: "Asian swastika (not hate)",
            value: getValue(payload, [["offensive", "asian_swastika"]]),
          },
          { label: "Confederate", value: getValue(payload, [["offensive", "confederate"]]) },
          { label: "Supremacist", value: getValue(payload, [["offensive", "supremacist"]]) },
          { label: "Terrorist", value: getValue(payload, [["offensive", "terrorist"]]) },
          { label: "Middle finger", value: getValue(payload, [["offensive", "middle_finger"]]) },
        ],
      },
      {
        title: "Destruction & Fire classes",
        rows: [
          {
            label: "Building major damage",
            value: getValue(payload, [["destruction", "building_major_damage"]]),
          },
          {
            label: "Minor building damage",
            value: getValue(payload, [["destruction", "minor_building_damage"]]),
          },
          { label: "Building on fire", value: getValue(payload, [["destruction", "building_on_fire"]]) },
          { label: "Building burned", value: getValue(payload, [["destruction", "building_burned"]]) },
          {
            label: "Major vehicle damage",
            value: getValue(payload, [["destruction", "major_vehicle_damage"]]),
          },
          {
            label: "Minor vehicle damage",
            value: getValue(payload, [["destruction", "minor_vehicle_damage"]]),
          },
          { label: "Vehicle on fire", value: getValue(payload, [["destruction", "vehicle_on_fire"]]) },
          { label: "Vehicle burned", value: getValue(payload, [["destruction", "vehicle_burned"]]) },
          { label: "Wildfire", value: getValue(payload, [["destruction", "wildfire"]]) },
          { label: "Unsafe fire", value: getValue(payload, [["destruction", "unsafe_fire"]]) },
          { label: "Violent protest", value: getValue(payload, [["destruction", "violent_protest"]]) },
        ],
      },
      {
        title: "Military classes",
        rows: [
          {
            label: "Military equipment",
            value: getValue(payload, [["military", "equipment"]]),
          },
          {
            label: "Military personnel",
            value: getValue(payload, [["military", "personnel"]]),
          },
          {
            label: "Military profile photo",
            value: getValue(payload, [["military", "profile_photo"]]),
          },
        ],
      },
    ],
    substances: [
      {
        title: "Recreational drugs",
        rows: [
          {
            label: "Cannabis",
            value: getValue(payload, [["recreational_drug", "cannabis"]]),
          },
          {
            label: "Cannabis logo only",
            value: getValue(payload, [["recreational_drug", "cannabis_logo_only"]]),
          },
          {
            label: "Cannabis plant",
            value: getValue(payload, [["recreational_drug", "cannabis_plant"]]),
          },
          {
            label: "Cannabis drug",
            value: getValue(payload, [["recreational_drug", "cannabis_drug"]]),
          },
          {
            label: "Other recreational drug",
            value: getValue(payload, [["recreational_drug", "other_recreational_drug"]]),
          },
        ],
      },
      {
        title: "Tobacco",
        rows: [
          { label: "Regular tobacco", value: getValue(payload, [["tobacco", "regular_tobacco"]]) },
          {
            label: "Ambiguous tobacco",
            value: getValue(payload, [["tobacco", "ambiguous_tobacco"]]),
          },
        ],
      },
      {
        title: "Medical",
        rows: [
          { label: "Pills", value: getValue(payload, [["medical", "pills"]]) },
          { label: "Paraphernalia", value: getValue(payload, [["medical", "paraphernalia"]]) },
        ],
      },
      {
        title: "Alcohol",
        rows: [{ label: "Alcohol", value: getValue(payload, [["alcohol", "alcohol"]]) }],
      },
      {
        title: "Gambling",
        rows: [{ label: "Gambling", value: getValue(payload, [["gambling", "gambling"]]) }],
      },
      {
        title: "Money",
        rows: [{ label: "Money", value: getValue(payload, [["money", "money"]]) }],
      },
    ],
    text: [
      {
        title: "Text types",
        rows: [
          { label: "Natural Text", value: getValue(payload, [["text", "natural"]]) },
          { label: "Embedded Text", value: getValue(payload, [["text", "embedded"]]) },
        ],
      },
      {
        title: "QR code moderation",
        rows: [
          { label: "Personal", value: getValue(payload, [["qr", "personal"], ["qr-content", "personal"]]) },
          { label: "Link", value: getValue(payload, [["qr", "link"], ["qr-content", "link"]]) },
          { label: "Social", value: getValue(payload, [["qr", "social"], ["qr-content", "social"]]) },
          { label: "Spam", value: getValue(payload, [["qr", "spam"], ["qr-content", "spam"]]) },
          {
            label: "Profanity",
            value: getValue(payload, [["qr", "profanity"], ["qr-content", "profanity"]]),
          },
          {
            label: "Blacklist",
            value: getValue(payload, [["qr", "blacklist"], ["qr-content", "blacklist"]]),
          },
        ],
      },
      {
        title: "Text moderation",
        rows: [
          {
            label: "Profanity",
            value: getValue(payload, [["text_content", "profanity"], ["text-content", "profanity"]]),
          },
          {
            label: "Personal",
            value: getValue(payload, [["text_content", "personal"], ["text-content", "personal"]]),
          },
          { label: "Link", value: getValue(payload, [["text_content", "link"], ["text-content", "link"]]) },
          {
            label: "Social",
            value: getValue(payload, [["text_content", "social"], ["text-content", "social"]]),
          },
          {
            label: "Extremism",
            value: getValue(payload, [["text_content", "extremism"], ["text-content", "extremism"]]),
          },
          {
            label: "Medical",
            value: getValue(payload, [["text_content", "medical"], ["text-content", "medical"]]),
          },
          { label: "Drug", value: getValue(payload, [["text_content", "drug"], ["text-content", "drug"]]) },
          {
            label: "Weapon",
            value: getValue(payload, [["text_content", "weapon"], ["text-content", "weapon"]]),
          },
          {
            label: "Content-trade",
            value: getValue(payload, [["text_content", "content_trade"], ["text-content", "content_trade"]]),
          },
          {
            label: "Money-transaction",
            value: getValue(payload, [["text_content", "money_transaction"], ["text-content", "money_transaction"]]),
          },
          { label: "Spam", value: getValue(payload, [["text_content", "spam"], ["text-content", "spam"]]) },
          {
            label: "Violence",
            value: getValue(payload, [["text_content", "violence"], ["text-content", "violence"]]),
          },
          {
            label: "Self-harm",
            value: getValue(payload, [["text_content", "self_harm"], ["text-content", "self_harm"]]),
          },
        ],
      },
    ],
    description: [
      {
        title: "Quality",
        rows: [
          { label: "Quality score", value: getValue(payload, [["quality", "score"]]), tone: "red" },
          {
            label: "Sharpness",
            value: getValue(payload, [["sharpness"], ["properties", "sharpness"]]),
            tone: "red",
          },
          {
            label: "Brightness",
            value: getValue(payload, [["brightness"], ["properties", "brightness"]]),
            tone: "red",
          },
          {
            label: "Contrast",
            value: getValue(payload, [["contrast"], ["properties", "contrast"]]),
            tone: "red",
          },
        ],
      },
      {
        title: "Colors",
        rows: [],
        swatches: colors,
      },
      {
        title: "Image Type",
        rows: [
          { label: "Photo", value: getValue(payload, [["type", "photo"]]), tone: "red" },
          {
            label: "Illustration",
            value: getValue(payload, [["type", "illustration"]]),
          },
        ],
      },
    ],
  };
}

export function isImageModerationConfigured() {
  return Boolean(env.GETVERISIGHT_API_USER && env.GETVERISIGHT_API_SECRET);
}

export async function moderateImage(input: ImageModerationRequest): Promise<ImageModerationResponse> {
  if (!isImageModerationConfigured()) {
    throw new Error(
      "Image moderation is not configured. Add GETVERISIGHT_API_USER and GETVERISIGHT_API_SECRET to .env.local.",
    );
  }

  const form = new FormData();
  form.append("media", input.file, input.file.name);
  form.append("models", GETVERISIGHT_IMAGE_MODELS);
  form.append("text_categories", GETVERISIGHT_TEXT_CATEGORIES);
  form.append("api_user", env.GETVERISIGHT_API_USER as string);
  form.append("api_secret", env.GETVERISIGHT_API_SECRET as string);

  const response = await fetch("https://api.sightengine.com/1.0/check.json", {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error((payload.error as { message?: string } | undefined)?.message ?? "Image moderation request failed.");
  }

  return {
    provider: "getverisight",
    resultsByCategory: buildResults(payload),
    raw: payload,
  };
}
