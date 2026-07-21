import { entropyToMnemonic, mnemonicToEntropy, validateMnemonic, wordlists } from "bip39";

export type Bip39Language =
  | "english"
  | "japanese"
  | "korean"
  | "spanish"
  | "chinese_simplified"
  | "chinese_traditional"
  | "french"
  | "italian"
  | "czech"
  | "portuguese";

export const BIP39_LANGUAGES: Array<{ value: Bip39Language; label: string }> = [
  { value: "english", label: "English" },
  { value: "japanese", label: "日本語" },
  { value: "korean", label: "한국어" },
  { value: "spanish", label: "Español" },
  { value: "chinese_simplified", label: "简体中文" },
  { value: "chinese_traditional", label: "繁體中文" },
  { value: "french", label: "Français" },
  { value: "italian", label: "Italiano" },
  { value: "czech", label: "Čeština" },
  { value: "portuguese", label: "Português" },
];

export const BIP39_WORD_COUNTS = [12, 15, 18, 21, 24] as const;
export type Bip39WordCount = (typeof BIP39_WORD_COUNTS)[number];

function getWordlist(language: Bip39Language): string[] {
  const list = wordlists[language];
  if (!list) throw new Error(`BIP-39 словарь ${language} недоступен`);
  return list;
}

function entropyBytesForWords(words: Bip39WordCount): number {
  return ((words / 3) * 32) / 8;
}

export function generateBip39Mnemonic(words: Bip39WordCount, language: Bip39Language): { mnemonic: string; entropy: string } {
  const entropy = new Uint8Array(entropyBytesForWords(words));
  crypto.getRandomValues(entropy);
  const entropyHex = Array.from(entropy, (value) => value.toString(16).padStart(2, "0")).join("");
  return { mnemonic: entropyToMnemonic(entropyHex, getWordlist(language)), entropy: entropyHex };
}

export function detectBip39Language(mnemonic: string): Bip39Language | null {
  const normalized = mnemonic.trim().normalize("NFKD");
  for (const { value } of BIP39_LANGUAGES) {
    if (validateMnemonic(normalized, getWordlist(value))) return value;
  }
  return null;
}

export function mnemonicToBip39Entropy(mnemonic: string, language?: Bip39Language): { entropy: string; language: Bip39Language } {
  const normalized = mnemonic.trim().normalize("NFKD");
  const detected = language && validateMnemonic(normalized, getWordlist(language)) ? language : detectBip39Language(normalized);
  if (!detected) throw new Error("Не удалось распознать корректную BIP-39 фразу в официальных словарях");
  return { entropy: mnemonicToEntropy(normalized, getWordlist(detected)), language: detected };
}

export function convertBip39Mnemonic(mnemonic: string, targetLanguage: Bip39Language): { mnemonic: string; entropy: string; sourceLanguage: Bip39Language } {
  const source = mnemonicToBip39Entropy(mnemonic);
  return {
    mnemonic: entropyToMnemonic(source.entropy, getWordlist(targetLanguage)),
    entropy: source.entropy,
    sourceLanguage: source.language,
  };
}

export function entropyFingerprint(entropy: string): string {
  if (!entropy) return "—";
  return `${entropy.slice(0, 8)}…${entropy.slice(-8)}`;
}
