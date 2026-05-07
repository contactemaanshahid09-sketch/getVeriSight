export type TextLanguage = "en" | "es" | "fr" | "de" | "it" | "pt" | "tr";

export type TextExample = {
  label: string;
  translations: Record<TextLanguage, string>;
};

export type TextModerationMatch = {
  category: string;
  type: string;
  match: string;
  intensity?: string;
  start: number;
  end: number;
};

export type TextModerationScore = {
  label: string;
  value: number;
  tone?: "danger" | "warning" | "safe";
};

export type TextFilterResult = {
  category: string;
  hits: number;
  topType: string;
};

export type AiWritingCheck = {
  aiPercent: number;
  humanPercent: number;
  confidence: "Low" | "Medium" | "High";
  summary: string;
  signals: string[];
};

export type TextModerationUiResult = {
  language: string;
  overallScore: number;
  verdict: "Safe" | "Review" | "Block";
  summary: string;
  aiWritingCheck: AiWritingCheck;
  mlScores: TextModerationScore[];
  ruleScores: TextModerationScore[];
  filterResults: TextFilterResult[];
  matches: TextModerationMatch[];
};

export const textLanguageOptions: Array<{ value: TextLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "tr", label: "Turkish" },
];

export const textModerationExamples: TextExample[] = [
  {
    label: "Harassment",
    translations: {
      en: "How dare you tease me like that. You're acting like an idiot.",
      es: "Como te atreves a burlarte de mi asi. Estas actuando como un idiota.",
      fr: "Comment oses-tu te moquer de moi comme ca ? Tu te comportes comme un idiot.",
      de: "Wie kannst du mich so verspotten? Du benimmst dich wie ein Idiot.",
      it: "Come osi prenderti gioco di me cosi? Ti stai comportando da idiota.",
      pt: "Como voce ousa zombar de mim assim? Voce esta agindo como um idiota.",
      tr: "Bana boyle sataşmaya nasil cüret edersin? Aptal gibi davraniyorsun.",
    },
  },
  {
    label: "Spam",
    translations: {
      en: "Click this link now to win a free phone today.",
      es: "Haz clic en este enlace ahora para ganar un telefono gratis hoy.",
      fr: "Cliquez sur ce lien maintenant pour gagner un telephone gratuit aujourd'hui.",
      de: "Klicke jetzt auf diesen Link, um heute ein kostenloses Handy zu gewinnen.",
      it: "Fai clic su questo link adesso per vincere un telefono gratis oggi.",
      pt: "Clique neste link agora para ganhar um celular gratis hoje.",
      tr: "Bugun ucretsiz telefon kazanmak icin hemen bu baglantiya tikla.",
    },
  },
  {
    label: "Self-harm",
    translations: {
      en: "Sometimes I feel like hurting myself and I don't know what to do.",
      es: "A veces siento ganas de hacerme dano y no se que hacer.",
      fr: "Parfois j'ai envie de me faire du mal et je ne sais pas quoi faire.",
      de: "Manchmal habe ich das Gefuhl, mir selbst wehzutun, und ich weiss nicht, was ich tun soll.",
      it: "A volte mi sento come se volessi farmi del male e non so cosa fare.",
      pt: "As vezes sinto vontade de me machucar e nao sei o que fazer.",
      tr: "Bazen kendime zarar vermek istiyorum ve ne yapacagimi bilmiyorum.",
    },
  },
  {
    label: "Safe",
    translations: {
      en: "Hello brother, I hope your day is going well.",
      es: "Hola hermano, espero que tu dia vaya bien.",
      fr: "Salut mon frere, j'espere que ta journee se passe bien.",
      de: "Hallo Bruder, ich hoffe, dein Tag lauft gut.",
      it: "Ciao fratello, spero che la tua giornata stia andando bene.",
      pt: "Ola irmao, espero que seu dia esteja indo bem.",
      tr: "Merhaba kardesim, umarim gunun iyi geciyordur.",
    },
  },
];

export const defaultTextModerationResult: TextModerationUiResult = {
  language: "en",
  overallScore: 0,
  verdict: "Safe",
  summary: "No moderation signals yet. Enter text to analyze it.",
  aiWritingCheck: {
    aiPercent: 0,
    humanPercent: 0,
    confidence: "Low",
    summary: "Enter text to review writing-pattern signals.",
    signals: [],
  },
  mlScores: [
    { label: "Sexual", value: 0, tone: "safe" },
    { label: "Discriminatory", value: 0, tone: "safe" },
    { label: "Insulting", value: 0, tone: "safe" },
    { label: "Violent", value: 0, tone: "safe" },
    { label: "Toxic", value: 0, tone: "safe" },
    { label: "Self-harm", value: 0, tone: "safe" },
  ],
  ruleScores: [
    { label: "Profanity", value: 0, tone: "safe" },
    { label: "Personal", value: 0, tone: "safe" },
    { label: "Link", value: 0, tone: "safe" },
    { label: "Drug", value: 0, tone: "safe" },
    { label: "Weapon", value: 0, tone: "safe" },
    { label: "Violence", value: 0, tone: "safe" },
    { label: "Self-harm", value: 0, tone: "safe" },
    { label: "Medical", value: 0, tone: "safe" },
    { label: "Extremism", value: 0, tone: "safe" },
    { label: "Spam", value: 0, tone: "safe" },
    { label: "Content trade", value: 0, tone: "safe" },
    { label: "Money transaction", value: 0, tone: "safe" },
  ],
  filterResults: [],
  matches: [],
};
