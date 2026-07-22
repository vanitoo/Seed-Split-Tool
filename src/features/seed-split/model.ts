import type { Bip39Language, Bip39WordCount } from "./lib/bip39-tools";

export type WorkflowMode = "generate" | "split" | "recover" | "multisig";
export type SharingScheme = "generic" | "slip39" | "banana";

export type SchemeInfo = {
  label: string;
  shortLabel: string;
  description: string;
  howItWorks: string;
  details: string[];
  algorithm: string;
  compatibility: string;
  password: string;
  recoveryNotes: string[];
};

export const SCHEMES: Record<SharingScheme, SchemeInfo> = {
  slip39: {
    label: "SLIP-39 (рекомендуется)",
    shortLabel: "SLIP-39",
    description: "Стандартные словесные части для резервного хранения BIP-39 seed-фразы.",
    howItWorks: "Программа берёт entropy исходной BIP-39 фразы и создаёт несколько независимых мнемонических частей.",
    details: ["Международный стандарт", "Совместим с поддерживающими SLIP-39 кошельками", "Можно защитить отдельным паролем"],
    algorithm: "SLIP-39",
    compatibility: "Кошельки с поддержкой SLIP-39",
    password: "Необязателен",
    recoveryNotes: ["Добавьте каждую мнемоническую часть с новой строки", "Используйте тот же пароль SLIP-39, если он задавался", "Язык влияет только на вид восстановленной BIP-39 фразы"],
  },
  banana: {
    label: "Banana Split (защищённый режим)",
    shortLabel: "Banana Split",
    description: "Сначала шифрует секрет паролем, затем делит зашифрованные данные на несколько частей.",
    howItWorks: "Секрет сначала шифруется обязательным паролем. После этого зашифрованные данные делятся по схеме K из N.",
    details: ["Подходит для любого текста", "Для восстановления нужны части и пароль", "Пароль хранится отдельно"],
    algorithm: "Banana Split",
    compatibility: "Только Seed Split Tool",
    password: "Обязателен",
    recoveryNotes: ["Разделяйте части пустой строкой", "Без исходного пароля восстановление невозможно", "Пароль не содержится внутри частей и должен храниться отдельно"],
  },
  generic: {
    label: "Generic Secret Sharing",
    shortLabel: "Generic SST1",
    description: "Универсальное разделение любого текста на части в собственном формате SST1.",
    howItWorks: "Секрет делится математическим методом Шамира. Любые K частей восстанавливают данные, а меньшего количества недостаточно.",
    details: ["Работает с любым текстом", "Не требует отдельного пароля", "Для восстановления нужен совместимый формат SST1"],
    algorithm: "Shamir Secret Sharing",
    compatibility: "Формат SST1 / Seed Split Tool",
    password: "Не используется",
    recoveryNotes: ["Разделяйте части SST1 пустой строкой", "Все части должны относиться к одному набору", "Дубликаты не увеличивают количество доступных частей"],
  },
};

export type SeedGenerationState = {
  words: Bip39WordCount;
  language: Bip39Language;
  entropy: string;
  sourceLanguage: Bip39Language | null;
  passphrase: string;
};
