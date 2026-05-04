type Tone = "red";

export type ModerationRow = {
  label: string;
  value: number;
  tone?: Tone;
};

export type ModerationColumn = {
  title: string;
  rows: ModerationRow[];
  swatches?: string[];
};

export type ModerationCategoryKey =
  | "nudity"
  | "violence"
  | "hate"
  | "substances"
  | "text"
  | "description";

export type ImageModerationResults = Record<ModerationCategoryKey, ModerationColumn[]>;

export const defaultImageModerationResults: ImageModerationResults = {
  nudity: [
    {
      title: "Intensity classes",
      rows: [
        { label: "Sexual activity", value: 0 },
        { label: "Sexual display", value: 0 },
        { label: "Erotica", value: 0 },
        { label: "Very suggestive", value: 0 },
        { label: "Suggestive", value: 1 },
        { label: "Mildly suggestive", value: 4 },
        { label: "None", value: 95, tone: "red" },
      ],
    },
    {
      title: "Suggestive classes",
      rows: [
        { label: "Bikini", value: 0 },
        { label: "Cleavage", value: 0 },
        { label: "Lingerie", value: 0 },
        { label: "Male chest", value: 0 },
        { label: "Male underwear", value: 0 },
        { label: "Minishort", value: 0 },
        { label: "Miniskirt", value: 0 },
        { label: "Nudity art", value: 0 },
        { label: "Other suggestive", value: 0 },
        { label: "Sextoy", value: 0 },
        { label: "Suggestive focus", value: 0 },
        { label: "Suggestive pose", value: 0 },
        { label: "Swimwear male", value: 0 },
        { label: "Swimwear one piece", value: 0 },
        { label: "Visibly undressed", value: 0 },
      ],
    },
    {
      title: "Context",
      rows: [
        { label: "Other outdoor", value: 91, tone: "red" },
        { label: "People", value: 88, tone: "red" },
        { label: "Plants / nature", value: 42 },
      ],
    },
  ],
  violence: [
    {
      title: "Violence",
      rows: [
        { label: "Physical violence", value: 0 },
        { label: "Combat sport", value: 0 },
      ],
    },
    {
      title: "Weapon classes",
      rows: [
        { label: "Firearm", value: 0 },
        { label: "Firearm gesture", value: 0 },
        { label: "Firearm toy", value: 0 },
        { label: "Knife", value: 0 },
      ],
    },
    {
      title: "Gore classes",
      rows: [
        { label: "Gore", value: 0 },
        { label: "Very bloody", value: 0 },
        { label: "Slightly bloody", value: 0 },
        { label: "Body organ", value: 0 },
        { label: "Serious injury", value: 0 },
        { label: "Superficial injury", value: 0 },
        { label: "Corpse", value: 0 },
        { label: "Skull", value: 0 },
        { label: "Unconscious", value: 0 },
        { label: "Body waste", value: 0 },
        { label: "Other gore", value: 0 },
      ],
    },
    {
      title: "Firearm type",
      rows: [{ label: "Animated", value: 0 }],
    },
    {
      title: "Gore type",
      rows: [
        { label: "Animated", value: 0 },
        { label: "Fake", value: 0 },
        { label: "Real", value: 0 },
      ],
    },
    {
      title: "Firearm action",
      rows: [
        { label: "Aiming threat", value: 0 },
        { label: "Aiming at camera", value: 0 },
        { label: "Aiming safe", value: 0 },
        { label: "In hand not aiming", value: 0 },
        { label: "Worn not in hand", value: 0 },
        { label: "Not worn", value: 0 },
      ],
    },
    {
      title: "Self-harm",
      rows: [
        { label: "Self-harm", value: 0 },
        { label: "Real", value: 0 },
      ],
    },
  ],
  hate: [
    {
      title: "Hate classes",
      rows: [
        { label: "Nazi", value: 0 },
        { label: "Asian swastika (not hate)", value: 0 },
        { label: "Confederate", value: 0 },
        { label: "Supremacist", value: 0 },
        { label: "Terrorist", value: 0 },
        { label: "Middle finger", value: 0 },
      ],
    },
    {
      title: "Destruction & Fire classes",
      rows: [
        { label: "Building major damage", value: 0 },
        { label: "Minor building damage", value: 0 },
        { label: "Building on fire", value: 0 },
        { label: "Building burned", value: 0 },
        { label: "Major vehicle damage", value: 0 },
        { label: "Minor vehicle damage", value: 0 },
        { label: "Vehicle on fire", value: 0 },
        { label: "Vehicle burned", value: 0 },
        { label: "Wildfire", value: 0 },
        { label: "Unsafe fire", value: 0 },
        { label: "Violent protest", value: 0 },
      ],
    },
    {
      title: "Military classes",
      rows: [
        { label: "Military equipment", value: 0 },
        { label: "Military personnel", value: 0 },
        { label: "Military profile photo", value: 0 },
      ],
    },
  ],
  substances: [
    {
      title: "Recreational drugs",
      rows: [
        { label: "Cannabis", value: 0 },
        { label: "Cannabis logo only", value: 0 },
        { label: "Cannabis plant", value: 0 },
        { label: "Cannabis drug", value: 0 },
        { label: "Other recreational drug", value: 0 },
      ],
    },
    {
      title: "Tobacco",
      rows: [
        { label: "Regular tobacco", value: 0 },
        { label: "Ambiguous tobacco", value: 0 },
      ],
    },
    {
      title: "Medical",
      rows: [
        { label: "Pills", value: 0 },
        { label: "Paraphernalia", value: 0 },
      ],
    },
    {
      title: "Alcohol",
      rows: [{ label: "Alcohol", value: 0 }],
    },
    {
      title: "Gambling",
      rows: [{ label: "Gambling", value: 0 }],
    },
    {
      title: "Money",
      rows: [{ label: "Money", value: 0 }],
    },
  ],
  text: [
    {
      title: "Text types",
      rows: [
        { label: "Natural Text", value: 0 },
        { label: "Embedded Text", value: 0 },
      ],
    },
    {
      title: "QR code moderation",
      rows: [
        { label: "Personal", value: 0 },
        { label: "Link", value: 0 },
        { label: "Social", value: 0 },
        { label: "Spam", value: 0 },
        { label: "Profanity", value: 0 },
        { label: "Blacklist", value: 0 },
      ],
    },
    {
      title: "Text moderation",
      rows: [
        { label: "Profanity", value: 0 },
        { label: "Personal", value: 0 },
        { label: "Link", value: 0 },
        { label: "Social", value: 0 },
        { label: "Extremism", value: 0 },
        { label: "Medical", value: 0 },
        { label: "Drug", value: 0 },
        { label: "Weapon", value: 0 },
        { label: "Content-trade", value: 0 },
        { label: "Money-transaction", value: 0 },
        { label: "Spam", value: 0 },
        { label: "Violence", value: 0 },
        { label: "Self-harm", value: 0 },
      ],
    },
  ],
  description: [
    {
      title: "Quality",
      rows: [
        { label: "Quality score", value: 80, tone: "red" },
        { label: "Sharpness", value: 99, tone: "red" },
        { label: "Brightness", value: 29, tone: "red" },
        { label: "Contrast", value: 92, tone: "red" },
      ],
    },
    {
      title: "Colors",
      rows: [],
      swatches: ["#27321f", "#a8741e", "#d1bdad", "#a6b39f", "#8d8971", "#c34157"],
    },
    {
      title: "Image Type",
      rows: [
        { label: "Photo", value: 99, tone: "red" },
        { label: "Illustration", value: 0 },
      ],
    },
  ],
};
