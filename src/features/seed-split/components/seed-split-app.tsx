"use client";

import { useMemo, useRef, useState } from "react";
import { countWords, downloadText, isErrorStatus, parseParts, scrollTo } from "../browser-utils";
import { recoverBanana, splitBanana } from "../lib/banana";
import {
  BIP39_LANGUAGES,
  type Bip39Language,
  type Bip39WordCount,
  convertBip39Mnemonic,
  generateBip39Mnemonic,
  mnemonicToBip39Entropy,
  walletSeedFingerprint,
} from "../lib/bip39-tools";
import { decodeShare, recoverSecret, splitSecret } from "../lib/shamir";
import { recoverSlip39, splitSlip39 } from "../lib/slip39";
import { SCHEMES, type SharingScheme, type WorkflowMode } from "../model";
import { ShareResults } from "./share-results";
import { GenerationWorkflow, RecoveryWorkflow, SchemeSelector, SplitWorkflow, WorkflowTabs } from "./workflow-panels";

export function SeedSplitApp() {
  const [mode, setMode] = useState<WorkflowMode>("generate");
  const [scheme, setScheme] = useState<SharingScheme>("slip39");
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

  const resultsRef = useRef<HTMLElement>(null);
  const recoveryRef = useRef<HTMLElement>(null);
  const recoveredRef = useRef<HTMLDivElement>(null);

  const words = countWords(secret);
  const schemeInfo = SCHEMES[scheme];
  const recoveryShares = useMemo(() => parseParts(recoveryInput, scheme), [recoveryInput, scheme]);
  const walletFingerprint = useMemo(() => {
    try { return bip39Entropy ? walletSeedFingerprint(secret, bip39Passphrase) : "—"; }
    catch { return "—"; }
  }, [secret, bip39Passphrase, bip39Entropy]);

  function generateSeed(): void {
    const generated = generateBip39Mnemonic(bip39Words, bip39Language);
    setSecret(generated.mnemonic);
    setBip39Entropy(generated.entropy);
    setSourceLanguage(bip39Language);
    setShares([]);
    setRecovered("");
    setVerified(false);
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
      setVerified(false);
      setStatus("Entropy не изменилась, но текст мнемоники и Wallet fingerprint изменились");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  function updateSecret(value: string): void {
    setSecret(value);
    setShares([]);
    setVerified(false);
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

  function selectScheme(nextScheme: SharingScheme): void {
    setScheme(nextScheme);
    setShares([]);
    setRecovered("");
    setRecoveryInput("");
    setStatus("");
    setVerified(false);
    if (nextScheme === "slip39" && secret.trim()) {
      try {
        const parsed = mnemonicToBip39Entropy(secret);
        setBip39Entropy(parsed.entropy);
        setSourceLanguage(parsed.language);
      } catch {
        setBip39Entropy("");
        setSourceLanguage(null);
      }
    }
  }

  function selectMode(nextMode: WorkflowMode): void {
    setMode(nextMode);
    setStatus("");
    if (nextMode === "recover") scrollTo(recoveryRef);
  }

  function changeTotal(nextTotal: number): void {
    setTotal(nextTotal);
    if (threshold > nextTotal) setThreshold(nextTotal);
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
      setStatus(`Создано частей: ${next.length}`);
      scrollTo(resultsRef);
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
      scrollTo(recoveredRef);
    } catch (error) {
      setRecovered("");
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  function clearAll(): void {
    setSecret(""); setShares([]); setRecoveryInput(""); setRecovered(""); setStatus(""); setVerified(false);
    setVisible(false); setPassphrase(""); setBip39Passphrase(""); setBip39Entropy(""); setSourceLanguage(null);
  }

  const setLabel = scheme === "generic" && shares[0] ? `НАБОР ${decodeShare(shares[0]).id}` : schemeInfo.shortLabel.toUpperCase();
  const joiner = scheme === "slip39" ? "\n" : "\n\n";
  const sourceLanguageLabel = sourceLanguage ? BIP39_LANGUAGES.find((item) => item.value === sourceLanguage)?.label ?? "не определён" : "не определён";

  return <main className="shell">
    <section className="hero"><div><span className="eyebrow">LOCAL · OFFLINE · OPEN SOURCE</span><h1>Seed Split Tool</h1><p>Создавайте, разделяйте и восстанавливайте seed-фразы локально. Данные не покидают устройство.</p></div><div className="offline-pill"><span /> Сеть не используется</div></section>
    <WorkflowTabs mode={mode} onChange={selectMode} />
    <SchemeSelector mode={mode} scheme={scheme} info={schemeInfo} onChange={selectScheme} />

    {mode === "generate" && <GenerationWorkflow secret={secret} visible={visible} words={words} entropy={bip39Entropy} walletFingerprint={walletFingerprint} sourceLanguageLabel={sourceLanguageLabel} bip39Words={bip39Words} bip39Language={bip39Language} bip39Passphrase={bip39Passphrase} onWordsChange={setBip39Words} onLanguageChange={changeLanguage} onPassphraseChange={setBip39Passphrase} onGenerate={generateSeed} onSecretChange={updateSecret} onToggleVisible={() => setVisible((value) => !value)} onCopy={() => navigator.clipboard.writeText(secret)} onPrint={() => window.print()} onDownload={() => downloadText("bip39-seed.txt", secret)} onContinue={() => { setScheme("slip39"); setMode("split"); setStatus("Сгенерированная seed-фраза передана в разделение"); }} />}

    {mode === "split" && <SplitWorkflow scheme={scheme} schemeInfo={schemeInfo} secret={secret} visible={visible} words={words} entropy={bip39Entropy} bananaTitle={bananaTitle} passphrase={passphrase} total={total} threshold={threshold} busy={busy} onSecretChange={updateSecret} onToggleVisible={() => setVisible((value) => !value)} onBananaTitleChange={setBananaTitle} onPassphraseChange={setPassphrase} onTotalChange={changeTotal} onThresholdChange={setThreshold} onCreate={createShares} />}

    {mode === "recover" && <RecoveryWorkflow recoveryRef={recoveryRef} recoveredRef={recoveredRef} scheme={scheme} schemeInfo={schemeInfo} input={recoveryInput} partCount={recoveryShares.length} language={bip39Language} passphrase={passphrase} busy={busy} recovered={recovered} onInputChange={setRecoveryInput} onLanguageChange={setBip39Language} onPassphraseChange={setPassphrase} onRestore={() => restore()} />}

    {status && <div className={isErrorStatus(status) ? "status error" : "status"}>{status}</div>}
    {mode === "split" && <ShareResults resultsRef={resultsRef} shares={shares} total={total} threshold={threshold} setLabel={setLabel} verified={verified} scheme={scheme} onCopy={(share) => navigator.clipboard.writeText(share)} onDownloadShare={(share, index) => downloadText(`seed-share-${index + 1}-of-${total}.txt`, share)} onVerify={() => { setRecoveryInput(shares.slice(0, threshold).join(joiner)); setStatus(""); setMode("recover"); scrollTo(recoveryRef); }} onPrint={() => window.print()} onDownloadAll={() => downloadText(`seed-split-${scheme}.txt`, shares.join(joiner))} onClear={clearAll} />}

    <footer className="app-footer"><span>Seed Split Tool</span><span>v0.5.3 · MIT License</span></footer>
  </main>;
}
