import type { Bip39Language, Bip39WordCount } from "./lib/bip39-tools";

export type WorkflowMode = "generate" | "split" | "recover";
export type SharingScheme = "generic" | "slip39" | "banana";

export type SchemeInfo = {
  label: string;
  shortLabel: string;
  description: string;
  howItWorks: string;
  details: string[];
  strength: string;
};

export const SCHEMES: Record<SharingScheme, SchemeInfo> = {
  slip39: {
    label: "SLIP-39 (рекомендуется)",
    shortLabel: "SLIP-39",
    description: "Стандартные словесные части для резервного хранения BIP-39 seed-фразы.",
    howItWorks: "Программа берёт entropy исходной BIP-39 фразы и создаёт несколько независимых мнемонических частей.",
    details: ["Международный стандарт", "Совместим с поддерживающими SLIP-39 кошельками", "Можно защитить отдельным паролем"],
    strength: "★★★★★",
  },
  banana: {
    label: "Banana Split (защищённый режим)",
    shortLabel: "Banana Split",
    description: "Сначала шифрует секрет паролем, затем делит зашифрованные данные на несколько частей.",
    howItWorks: "Секрет сначала шифруется обязательным паролем. После этого зашифрованные данные делятся по схеме K из N.",
    details: ["Подходит для любого текста", "Для восстановления нужны части и пароль", "Пароль хранится отдельно"],
    strength: "★★★★★",
  },
  generic: {
    label: "Generic Secret Sharing",
    shortLabel: "Generic SST1",
    description: "Универсальное разделение любого текста на части в собственном формате SST1.",
    howItWorks: "Секрет делится математическим методом Шамира. Любые K частей восстанавливают данные, а меньшего количества недостаточно.",
    details: ["Работает с любым текстом", "Не требует отдельного пароля", "Для восстановления нужен совместимый формат SST1"],
    strength: "★★★★☆",
  },
};

export type SeedGenerationState = {
  words: Bip39WordCount;
  language: Bip39Language;
  entropy: string;
  sourceLanguage: Bip39Language | null;
  passphrase: string;
};
