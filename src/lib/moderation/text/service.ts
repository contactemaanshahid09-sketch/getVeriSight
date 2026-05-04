import { env } from "@/lib/env";
import {
  defaultTextModerationResult,
  type TextLanguage,
  type TextModerationMatch,
  type TextModerationScore,
  type TextModerationUiResult,
} from "@/lib/moderation/text/shared";

const GETVERISIGHT_TEXT_RULE_CATEGORIES = [
  "profanity",
  "personal",
  "link",
  "drug",
  "weapon",
  "spam",
  "content-trade",
  "money-transaction",
  "extremism",
  "violence",
  "self-harm",
  "medical",
].join(",");

function getMlModels(language: TextLanguage) {
  // Inference from provider behavior: self-harm classification support is narrower
  // than the general text model, so keep it enabled only for English to avoid hard API errors.
  return language === "en" ? "general,self-harm" : "general";
}

const RULE_CATEGORY_KEYS = [
  "profanity",
  "personal",
  "link",
  "drug",
  "weapon",
  "spam",
  "content-trade",
  "money-transaction",
  "extremism",
  "violence",
  "self-harm",
  "medical",
] as const;

const ML_CLASS_KEYS = [
  { key: "sexual", label: "Sexual" },
  { key: "discriminatory", label: "Discriminatory" },
  { key: "insulting", label: "Insulting" },
  { key: "violent", label: "Violent" },
  { key: "toxic", label: "Toxic" },
  { key: "self_harm", label: "Self-harm" },
] as const;

type RuleCategoryKey = (typeof RULE_CATEGORY_KEYS)[number];

export type TextModerationRequest = {
  text: string;
  language: TextLanguage;
};

export type TextModerationResponse = {
  provider: "getverisight";
  result: TextModerationUiResult;
  raw?: unknown;
};

function asPercent(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function scoreTone(value: number): TextModerationScore["tone"] {
  if (value >= 75) {
    return "danger";
  }

  if (value >= 30) {
    return "warning";
  }

  return "safe";
}

function humanizeRuleLabel(key: string) {
  return key
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getMatches(
  payload: Record<string, unknown>,
  category: RuleCategoryKey,
): TextModerationMatch[] {
  const bucket = payload[category];

  if (!bucket || typeof bucket !== "object") {
    return [];
  }

  const matches = (bucket as { matches?: unknown }).matches;

  if (!Array.isArray(matches)) {
    return [];
  }

  return matches
    .map((match): TextModerationMatch | null => {
      if (!match || typeof match !== "object") {
        return null;
      }

      const item = match as Record<string, unknown>;

      return {
        category,
        type: typeof item.type === "string" ? item.type : "match",
        match: typeof item.match === "string" ? item.match : "",
        intensity: typeof item.intensity === "string" ? item.intensity : undefined,
        start: typeof item.start === "number" ? item.start : 0,
        end: typeof item.end === "number" ? item.end : 0,
      };
    })
    .filter((match): match is TextModerationMatch => Boolean(match && match.match));
}

function buildResult(payload: Record<string, unknown>, language: TextLanguage): TextModerationUiResult {
  const moderationClasses =
    payload.moderation_classes && typeof payload.moderation_classes === "object"
      ? (payload.moderation_classes as Record<string, unknown>)
      : {};

  const mlScores = ML_CLASS_KEYS.map(({ key, label }) => {
    const value = asPercent(moderationClasses[key]);
    return {
      label,
      value,
      tone: scoreTone(value),
    };
  });

  const matches = RULE_CATEGORY_KEYS.flatMap((category) => getMatches(payload, category)).sort(
    (a, b) => a.start - b.start,
  );

  const ruleScores = RULE_CATEGORY_KEYS.map((category) => {
    const categoryMatches = matches.filter((match) => match.category === category);
    const maxScore = categoryMatches.length > 0 ? Math.min(100, categoryMatches.length * 35) : 0;

    return {
      label: humanizeRuleLabel(category),
      value: maxScore,
      tone: scoreTone(maxScore),
    };
  });

  const filterResults = RULE_CATEGORY_KEYS.map((category) => {
    const categoryMatches = matches.filter((match) => match.category === category);

    if (categoryMatches.length === 0) {
      return null;
    }

    return {
      category: humanizeRuleLabel(category),
      hits: categoryMatches.length,
      topType: categoryMatches[0]?.type ?? "match",
    };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const overallScore = Math.max(
    ...mlScores.map((score) => score.value),
    ...ruleScores.map((score) => score.value),
    0,
  );

  const verdict =
    overallScore >= 75 ? "Block" : overallScore >= 30 ? "Review" : "Safe";

  const summary =
    verdict === "Block"
      ? "High-risk patterns detected. This text should be blocked or escalated."
      : verdict === "Review"
        ? "Moderation signals were detected. This text should be reviewed."
        : "No strong moderation signals detected in this text.";

  return {
    language,
    overallScore,
    verdict,
    summary,
    mlScores,
    ruleScores,
    filterResults,
    matches,
  };
}

export function isTextModerationConfigured() {
  return Boolean(env.GETVERISIGHT_API_USER && env.GETVERISIGHT_API_SECRET);
}

export async function moderateText(input: TextModerationRequest): Promise<TextModerationResponse> {
  if (!isTextModerationConfigured()) {
    throw new Error(
      "Text moderation is not configured. Add GETVERISIGHT_API_USER and GETVERISIGHT_API_SECRET to .env.local.",
    );
  }

  const form = new FormData();
  form.append("text", input.text);
  form.append("lang", input.language);
  form.append("mode", "rules,ml");
  form.append("categories", GETVERISIGHT_TEXT_RULE_CATEGORIES);
  form.append("models", getMlModels(input.language));
  form.append("api_user", env.GETVERISIGHT_API_USER as string);
  form.append("api_secret", env.GETVERISIGHT_API_SECRET as string);

  const response = await fetch("https://api.sightengine.com/1.0/text/check.json", {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      (payload.error as { message?: string } | undefined)?.message ??
        "Text moderation request failed.",
    );
  }

  return {
    provider: "getverisight",
    result: input.text.trim() ? buildResult(payload, input.language) : defaultTextModerationResult,
    raw: payload,
  };
}
