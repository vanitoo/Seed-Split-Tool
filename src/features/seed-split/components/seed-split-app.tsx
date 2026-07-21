"use client";

import { useMemo, useState } from "react";
import { recoverBanana, splitBanana } from "../lib/banana";
import {
  BIP39_LANGUAGES,
  BIP39_WORD_COUNTS,
  type Bip39Language,
  type Bip39WordCount,
  compactFingerprint,
  convertBip39Mnemonic,
  generateBip39Mnemonic,
  mnemonicToBip39Entropy,
  walletSeedFingerprint,
} from "../lib/bip39-tools";
import { decodeShare, recoverSecret, splitSecret } from "../lib/shamir";
import { recoverSlip39, splitSlip39 } from "../lib/slip39";

type Mode = "split" | "recover";
type Scheme = "generic" | "slip39" | "banana";

type SchemeInfo = {
  label: string;
  description: string;
  howItWorks: string;
  details: string[];
};

const SCHEMES: Record<Scheme, SchemeInfo> = {
  slip39: {
    label: "SLIP-39 (рекомендуется)",
    description: "Стандартные словесные части для резервного хранения BIP-39 seed-фразы.",
    howItWorks: "Программа берёт entropy исходной BIP-39 фразы и создаёт несколько независимых мнемонических частей SLIP-39.",
    details: [
      "Для восстановления достаточно выбранного количества частей",
      "Можно добавить отдельный пароль SLIP-39",
      "Подходит для совместимого аппаратного и программного кошелька",
    ],
  },
  banana: {
    label: "Banana Split (защищённый режим)",
    description: "Сначала шифрует секрет паролем, затем делит зашифрованные данные на несколько частей.",
    howItWorks: "Секрет шифруется обязательным паролем. Уже зашифрованные данные делятся по схеме K из N, поэтому для восстановления нужны и части, и пароль.",
    details: [
      "Подходит для seed-фраз, паролей и любого текста",
      "Без правильного пароля восстановление невозможно",
      "Пароль нельзя хранить вместе со всеми частями",
    ],
  },
  generic: {
    label: "Generic Secret Sharing",
    description: "Универсальное разделение любого текста на части в собственном формате SST1.",
    howItWorks: "Секрет делится математическим методом Шамира. Любые K частей восстанавливают данные, а меньшее количество недостаточно.",
    details: [
      "Работает с любым текстом или ключом",
      "Не требует отдельного пароля",
      "Для восстановления нужен этот инструмент или совместимый формат SST1",
    ],
  },
};

function wordCount(value: string): number {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}

function downloadText(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseParts(value: string, scheme: Scheme): string[] {
  if (scheme === "slip39") return value.split(/\n/u).map((item) => item.trim()).filter(Boolean);
  return value.split(/\n\s*\n/u).map((item) => item.trim()).filter(Boolean);
}

export function SeedSplitApp() {
  const [mode, setMode] = useState<Mode>("split");
  const [scheme, setScheme] = useState<Scheme>("slip39");
  const [secret, setSecret] = useState("");
  const [visible, setVisible] = useState(false);
  const [total, setTotal] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [shares, setShares] = useState<string[]>([]);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recovered, setRecovered] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [bip39Passphrase, setBip39Passphrase] = useState("");
  const [bananaTitle, setBananaTitle] = useState("Seed Split Tool");
  const [bip39Words, setBip39Words] = useState<Bip39WordCount>(12);
  const [bip39Language, setBip39Language] = useState<Bip39Language>("english");
  const [bip39Entropy, setBip39Entropy] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<Bip39Language | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);

  const words = wordCount(secret);
  const schemeInfo = SCHEMES[scheme];
  const recoveryShares = useMemo(() => parseParts(recoveryInput, scheme), [recoveryInput, scheme]);
  const walletFingerprint = useMemo(() => {
    try {
      return bip39Entropy ? walletSeedFingerprint(secret, bip39Passphrase) : "—";
    } catch {
      return "—";
    }
  }, [secret, bip39Passphrase, bip39Entropy]);

  function generateSeed(): void {
    const generated = generateBip39Mnemonic(bip39Words, bip39Language);
    setSecret(generated.mnemonic);
    setBip39Entropy(generated.entropy);
    setSourceLanguage(bip39Language);
    setShares([]);
    setRecovered("");
    setStatus(`Создана BIP-39 фраза: ${bip39Words} слов`);
  }

  function changeLanguage(nextLanguage: Bip39Language): void {
    setBip39Language(nextLanguage);
    if (!secret.trim()) return;
    try {
      const converted = convertBip39Mnemonic(secret, nextLanguage);
      setSecret(converted.mnemonic);
      setBip39Entropy(converted.entropy);
      setSourceLanguage(converted.sourceLanguage);
      setShares([]);
      setStatus("Entropy не изменилась, но текст мнемоники и производный wallet seed изменились");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  function updateSecret(value: string): void {
    setSecret(value);
    setShares([]);
    if (scheme !== "slip39" || !value.trim()) {
      setBip39Entropy("");
      setSourceLanguage(null);
      return;
    }
    try {
      const parsed = mnemonicToBip39Entropy(value);
      setBip39Entropy(parsed.entropy);
      setSourceLanguage(parsed.language);
    } catch {
      setBip39Entropy("");
      setSourceLanguage(null);
    }
  }

  async function createShares(): Promise<void> {
    setBusy(true);
    setStatus("");
    setVerified(false);
    try {
      let next: string[];
      if (scheme === "slip39") next = splitSlip39(secret, total, threshold, passphrase);
      else if (scheme === "banana") next = await splitBanana(secret, bananaTitle.trim() || "Seed Split Tool", passphrase, total, threshold);
      else next = await splitSecret(secret, total, threshold);
      setShares(next);
      setStatus("Части созданы только в памяти этого браузера");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function restore(input = recoveryShares): Promise<void> {
    setBusy(true);
    setStatus("");
    try {
      let result: string;
      if (scheme === "slip39") result = recoverSlip39(input, passphrase, bip39Language);
      else if (scheme === "banana") result = await recoverBanana(input, passphrase);
      else result = await recoverSecret(input);
      setRecovered(result);
      setStatus("Секрет успешно восстановлен и проверен");
      if (shares.length && result.trim() === secret.trim()) setVerified(true);
    } catch (error) {
      setRecovered("");
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  function clearAll(): void {
    setSecret("");
    setShares([]);
    setRecoveryInput("");
    setRecovered("");
    setStatus("");
    setVerified(false);
    setVisible(false);
    setPassphrase("");
    setBip39Passphrase("");
    setBip39Entropy("");
    setSourceLanguage(null);
  }

  const setLabel = scheme === "generic" && shares[0] ? `НАБОР ${decodeShare(shares[0]).id}` : scheme === "slip39" ? "SLIP-39" : "BANANA SPLIT";
  const joiner = scheme === "slip39" ? "\n" : "\n\n";
  const sourceLanguageLabel = sourceLanguage ? BIP39_LANGUAGES.find((item) => item.value === sourceLanguage)?.label : "не определён";

  return <main className="shell">
    <section className="hero"><div><span className="eyebrow">LOCAL · OFFLINE · OPEN SOURCE</span><h1>Seed Split Tool</h1><p>Разделите seed-фразу или другой секрет по схеме K из N. Ни одна часть не покидает устройство.</p></div><div className="offline-pill"><span /> Сеть не используется</div></section>
    <section className="warning"><strong>Важно:</strong> BIP-39 passphrase не записывается в мнемонику. Смена официального словаря сохраняет entropy, но меняет итоговый wallet seed.</section>

    <section className="panel scheme-panel">
      <label htmlFor="scheme-select"><strong>Схема разделения</strong></label>
      <select id="scheme-select" value={scheme} onChange={(event) => { setScheme(event.target.value as Scheme); setShares([]); setRecovered(""); setRecoveryInput(""); setStatus(""); }}>
        <option value="slip39">SLIP-39 · готово</option>
        <option value="banana">Banana Split · готово</option>
        <option value="generic">Generic SST1 · готово</option>
      </select>
      <p>{schemeInfo.description}</p>
    </section>

    <div className="tabs" role="tablist"><button className={mode === "split" ? "active" : ""} onClick={() => setMode("split")}>Разделить секрет</button><button className={mode === "recover" ? "active" : ""} onClick={() => setMode("recover")}>Восстановить</button></div>

    {mode === "split" ? <section className="workspace"><div className="panel input-panel">
      {scheme === "slip39" && <section className="seed-generator">
        <div className="section-title"><span>00</span><div><h2>Генератор BIP-39</h2><p>Создаёт entropy локально через Web Crypto</p></div></div>
        <div className="generator-controls">
          <label>Количество слов<select value={bip39Words} onChange={(event) => setBip39Words(Number(event.target.value) as Bip39WordCount)}>{BIP39_WORD_COUNTS.map((count) => <option key={count} value={count}>{count} слов</option>)}</select></label>
          <label>Официальный словарь<select value={bip39Language} onChange={(event) => changeLanguage(event.target.value as Bip39Language)}>{BIP39_LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select></label>
          <button type="button" onClick={generateSeed}>Сгенерировать seed</button>
        </div>
        <label className="bip39-passphrase">BIP-39 passphrase («25-е слово», необязательно)<input type="password" value={bip39Passphrase} onChange={(event) => setBip39Passphrase(event.target.value)} placeholder="Не входит в мнемонику — храните отдельно" autoComplete="new-password" /></label>
        <div className="entropy-proof"><div><span>Исходный словарь</span><strong>{sourceLanguageLabel}</strong></div><div><span>Entropy</span><code>{compactFingerprint(bip39Entropy)}</code></div><div><span>Wallet seed</span><code>{walletFingerprint}</code></div></div>
      </section>}

      <div className="section-title"><span>01</span><div><h2>Исходный секрет</h2><p>{scheme === "slip39" ? "BIP-39 seed-фраза в любом официальном словаре" : "Seed-фраза, пароль, ключ или произвольный текст"}</p></div></div>
      <div className="secret-wrap"><textarea value={secret} onChange={(event) => updateSecret(event.target.value)} className={visible ? "" : "masked"} placeholder="Введите секрет здесь…" spellCheck={false} autoComplete="off" /><button className="ghost" onClick={() => setVisible((value) => !value)}>{visible ? "Скрыть" : "Показать"}</button></div>
      <div className="meta"><span>{secret.length} символов</span><span>{words} слов</span>{scheme === "slip39" && <span>{bip39Entropy ? "BIP-39 корректна" : "BIP-39 не распознана"}</span>}</div>
      {(scheme === "slip39" || scheme === "banana") && <div className="compat-fields">
        {scheme === "banana" && <label>Название набора<input value={bananaTitle} onChange={(event) => setBananaTitle(event.target.value)} /></label>}
        <label>{scheme === "banana" ? "Пароль для шифрования (обязательно)" : "Пароль SLIP-39 для защиты частей (необязательно)"}<input type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} autoComplete="new-password" placeholder="Введите пароль" /></label>
      </div>}
      <div className="section-title settings-title"><span>02</span><div><h2>Схема хранения</h2><p>Сколько частей создать и сколько нужно для восстановления</p></div></div>
      <div className="settings-grid"><label>Всего частей<strong>{total}</strong><input type="range" min="2" max="10" value={total} onChange={(event) => { const n = Number(event.target.value); setTotal(n); if (threshold > n) setThreshold(n); }} /></label><label>Нужно частей<strong>{threshold}</strong><input type="range" min="2" max={total} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></label></div>
      <div className="preset-row">{[[2,3],[3,5],[4,7]].map(([k,n]) => <button key={`${k}-${n}`} onClick={() => { setThreshold(k); setTotal(n); }}>{k} из {n}</button>)}</div>
      <button className="primary" disabled={busy || !secret.trim() || (scheme === "slip39" && !bip39Entropy) || (scheme === "banana" && !passphrase)} onClick={createShares}>{busy ? "Обработка…" : `Создать ${total} частей`}</button>
    </div><aside className="panel explainer"><div className="lock-art">◇</div><h3>Как работает {schemeInfo.label}</h3><p>{schemeInfo.howItWorks}</p><ul>{schemeInfo.details.map((item) => <li key={item}>{item}</li>)}</ul></aside></section> : <section className="panel recovery-panel">
      <div className="section-title"><span>01</span><div><h2>Добавьте части</h2><p>{scheme === "slip39" ? "Каждая мнемоника с новой строки" : "Разделяйте части пустой строкой"}</p></div></div>
      <textarea value={recoveryInput} onChange={(event) => setRecoveryInput(event.target.value)} placeholder={scheme === "generic" ? "SST1-…\n\nSST1-…" : scheme === "slip39" ? "SLIP-39 mnemonic one…\nSLIP-39 mnemonic two…" : "{\"v\":1,…}\n\n{\"v\":1,…}"} spellCheck={false} />
      {scheme === "slip39" && <div className="compat-fields"><label>Язык восстановленной BIP-39 фразы<select value={bip39Language} onChange={(event) => setBip39Language(event.target.value as Bip39Language)}>{BIP39_LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select></label></div>}
      {(scheme === "slip39" || scheme === "banana") && <div className="compat-fields"><label>{scheme === "banana" ? "Пароль для расшифровки" : "Пароль SLIP-39"}<input type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="Введите пароль" /></label></div>}
      <div className="meta"><span>Распознано частей: {recoveryShares.length}</span></div>
      <button className="primary" disabled={busy || recoveryShares.length === 0 || (scheme === "banana" && !passphrase)} onClick={() => restore()}>{busy ? "Проверка…" : "Восстановить секрет"}</button>
      {recovered && <div className="result-secret"><span>Восстановленный секрет</span><pre>{recovered}</pre></div>}
    </section>}

    {status && <div className={status.includes("Некоррект") || status.includes("Нужно") || status.includes("Невер") || status.includes("повреж") || status.includes("Не удалось") || status.includes("неожиданной") ? "status error" : "status"}>{status}</div>}
    {mode === "split" && shares.length > 0 && <section className="results"><div className="results-head"><div><span className="eyebrow">{setLabel}</span><h2>Ваши части готовы</h2><p>Для восстановления требуется {threshold} из {total} частей.</p></div><div className={verified ? "verify-badge ok" : "verify-badge"}>{verified ? "✓ Набор проверен" : "Набор ещё не проверен"}</div></div>
      <div className="share-grid">{shares.map((share, index) => <article className="share-card" key={`${index}-${share}`}><header><span>ЧАСТЬ {index + 1}</span><b>{index + 1}/{total}</b></header><div className="share-code">{share}</div><footer><button onClick={() => navigator.clipboard.writeText(share)}>Копировать</button><button onClick={() => downloadText(`seed-share-${index + 1}-of-${total}.txt`, share)}>Скачать</button></footer></article>)}</div>
      <div className="verify-panel"><div><h3>Проверьте резервную копию</h3><p>Восстановите секрет из любых {threshold} частей до того, как разнесёте их по разным местам.</p></div><button onClick={() => { setMode("recover"); setRecoveryInput(shares.slice(0, threshold).join(joiner)); }}>Проверить сейчас</button></div>
      <div className="actions"><button onClick={() => window.print()}>Печать</button><button onClick={() => downloadText(`seed-split-${scheme}.txt`, shares.join(joiner))}>Скачать весь набор</button><button className="danger" onClick={clearAll}>Очистить всё</button></div>
    </section>}
  </main>;
}
