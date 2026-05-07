import type { AiWritingCheck } from "@/lib/moderation/text/shared";

const AI_STYLE_PHRASES = [
  "additionally",
  "as a result",
  "as an ai",
  "crucial",
  "delve",
  "furthermore",
  "in conclusion",
  "in today's digital",
  "it is important to note",
  "moreover",
  "overall",
  "seamless",
  "streamline",
  "this article",
  "this guide",
  "ultimately",
  "unlock",
];

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function splitSentences(text: string) {
  return text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getWords(text: string) {
  return text
    .toLowerCase()
    .match(/[a-z0-9']+/g) ?? [];
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));

  return Math.sqrt(variance);
}

function countRepeatedTrigrams(words: string[]) {
  const counts = new Map<string, number>();

  for (let index = 0; index < words.length - 2; index += 1) {
    const key = words.slice(index, index + 3).join(" ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.values()).filter((count) => count > 1).length;
}

export function analyzeAiWriting(text: string): AiWritingCheck {
  const cleanText = text.trim();
  const words = getWords(cleanText);
  const sentences = splitSentences(cleanText);
  const signals: string[] = [];

  if (words.length < 25) {
    return {
      aiPercent: 35,
      humanPercent: 65,
      confidence: "Low",
      summary: "The sample is short, so the writing-pattern review has limited context.",
      signals: ["Short text sample"],
    };
  }

  let score = 34;

  const sentenceLengths = sentences.map((sentence) => getWords(sentence).length);
  const avgSentenceLength = average(sentenceLengths);
  const sentenceVariation = standardDeviation(sentenceLengths);
  const sentenceConsistency =
    avgSentenceLength > 0 ? sentenceVariation / avgSentenceLength : 0;

  if (sentences.length >= 4 && sentenceConsistency < 0.38) {
    score += 16;
    signals.push("Consistent sentence rhythm");
  } else if (sentenceConsistency > 0.75) {
    score -= 8;
    signals.push("Varied sentence rhythm");
  }

  const uniqueWordRatio = new Set(words).size / words.length;

  if (uniqueWordRatio < 0.46) {
    score += 12;
    signals.push("Repeated vocabulary patterns");
  } else if (uniqueWordRatio > 0.66) {
    score -= 10;
    signals.push("High vocabulary variety");
  }

  const phraseHits = AI_STYLE_PHRASES.filter((phrase) =>
    cleanText.toLowerCase().includes(phrase),
  );

  if (phraseHits.length > 0) {
    score += Math.min(18, phraseHits.length * 6);
    signals.push("Polished transition phrases");
  }

  const repeatedTrigrams = countRepeatedTrigrams(words);

  if (repeatedTrigrams > 0) {
    score += Math.min(14, repeatedTrigrams * 4);
    signals.push("Repeated phrase structure");
  }

  const punctuationCount = (cleanText.match(/[,:;]/g) ?? []).length;
  const punctuationDensity = punctuationCount / words.length;

  if (punctuationDensity > 0.085) {
    score += 7;
    signals.push("Formal punctuation pattern");
  } else if (punctuationDensity < 0.018 && words.length > 70) {
    score -= 6;
    signals.push("Conversational punctuation pattern");
  }

  const contractionCount = (cleanText.match(/\b\w+'(?:t|re|ve|ll|d|m|s)\b/gi) ?? [])
    .length;

  if (contractionCount >= 2) {
    score -= 8;
    signals.push("Conversational contractions");
  }

  const aiPercent = clampPercent(score);
  const humanPercent = 100 - aiPercent;
  const confidence =
    words.length >= 90 && signals.length >= 3
      ? "High"
      : words.length >= 45 && signals.length >= 2
        ? "Medium"
        : "Low";

  const summary =
    aiPercent >= 70
      ? "The text shows strong AI-style writing-pattern signals."
      : aiPercent >= 45
        ? "The text shows a mixed balance of AI-style and human-style writing signals."
        : "The text shows stronger human-style writing-pattern signals.";

  return {
    aiPercent,
    humanPercent,
    confidence,
    summary,
    signals: signals.length > 0 ? signals : ["Balanced writing patterns"],
  };
}
