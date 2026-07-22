import type { RefObject } from "react";
import {
  BIP39_LANGUAGES,
  BIP39_WORD_COUNTS,
  compactFingerprint,
  type Bip39Language,
  type Bip39WordCount,
} from "../lib/bip39-tools";
import type { SchemeInfo, SharingScheme, WorkflowMode } from "../model";
import { SeedPrintCard } from "./seed-print-card";

type GenerationProps = {
  secret: string;
  visible: boolean;
  words: number;
  entropy: string;
  walletFingerprint: string;
  sourceLanguageLabel: string;
  bip39Words: Bip39WordCount;
  bip39Language: Bip39Language;
  bip39Passphrase: string;
  onWordsChange: (value: Bip39WordCount) => void;
  onLanguageChange: (value: Bip39Language) => void;
  onPassphraseChange: (value: string) => void;
  onGenerate: () => void;
  onSecretChange: (value: string) => void;
  onToggleVisible: () => void;
  onCopy: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onContinue: () => void;
};

export function GenerationWorkflow({
  secret,
  visible,
  words,
  entropy,
  walletFingerprint,
  sourceLanguageLabel,
  bip39Words,
  bip39Language,
  bip39Passphrase,
  onWordsChange,
  onLanguageChange,
  onPassphraseChange,
  onGenerate,
  onSecretChange,
  onToggleVisible,
  onCopy,
  onPrint,
  onDownload,
  onContinue,
}: GenerationProps) {
  return (
    <>
      <section className="workspace generator-workspace">
        <div className="panel input-panel">
          <section className="seed-generator standalone-generator">
            <div className="section-title"><span>01</span><div><h2>Генератор BIP-39</h2><p>Создаёт новую seed-фразу локально через Web Crypto</p></div></div>
            <div className="generator-controls">
              <label>Количество слов<select value={bip39Words} onChange={(event) => onWordsChange(Number(event.target.value) as Bip39WordCount)}>{BIP39_WORD_COUNTS.map((count) => <option key={count} value={count}>{count} слов</option>)}</select></label>
              <label>Официальный словарь<select value={bip39Language} onChange={(event) => onLanguageChange(event.target.value as Bip39Language)}>{BIP39_LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select></label>
              <button type="button" onClick={onGenerate}>Сгенерировать seed</button>
            </div>
            <label className="bip39-passphrase"><span className="label-with-help">BIP-39 Passphrase <span className="help-tip" tabIndex={0} aria-label="Подсказка о BIP-39 Passphrase">ⓘ<span className="help-bubble">Используется как дополнительный пароль.<br />Не входит в seed-фразу.<br />Потеря пароля лишает доступа к созданному кошельку.</span></span></span><input type="password" value={bip39Passphrase} onChange={(event) => onPassphraseChange(event.target.value)} placeholder="Храните отдельно" autoComplete="new-password" /></label>
            <div className="entropy-proof"><div><span>Словарь</span><strong>{sourceLanguageLabel}</strong></div><div><span>Entropy</span><code>{compactFingerprint(entropy)}</code></div><div><span className="label-with-help">Wallet fingerprint <span className="help-tip" tabIndex={0}>ⓘ<span className="help-bubble">Короткий отпечаток производного wallet seed. Помогает увидеть изменение языка или Passphrase.</span></span></span><code>{walletFingerprint}</code></div></div>
          </section>
          <div className="section-title"><span>02</span><div><h2>Созданная seed-фраза</h2><p>Проверьте язык, количество слов и сохраните фразу безопасным способом</p></div></div>
          <div className="secret-wrap"><textarea value={secret} onChange={(event) => onSecretChange(event.target.value)} className={visible ? "" : "masked"} placeholder="Нажмите «Сгенерировать seed»" spellCheck={false} autoComplete="off" /><button className="ghost" onClick={onToggleVisible}>{visible ? "Скрыть" : "Показать"}</button></div>
          <div className="meta"><span>{secret.length} символов</span><span>{words} слов</span><span>{entropy ? "BIP-39 корректна" : "Seed ещё не создана"}</span></div>
          {secret && <div className="generation-actions"><button onClick={onCopy}>Копировать</button><button onClick={onPrint}>Печатать</button><button onClick={onDownload}>Скачать</button><button className="primary-inline" onClick={onContinue}>Перейти к разделению →</button></div>}
        </div>
        <aside className="panel algorithm-panel"><div className="algorithm-symbol">◇</div><h3>Генерация BIP-39</h3><ul className="check-list"><li>Криптографически случайная entropy</li><li>Официальные словари BIP-39</li><li>Работает полностью локально</li></ul><div className="flow-diagram"><span>Entropy</span><b>↓</b><span>BIP-39 слова</span><b>↓</b><span>Wallet</span></div></aside>
      </section>
      {secret && <SeedPrintCard secret={secret} />}
    </>
  );
}

type SplitProps = {
  scheme: SharingScheme;
  schemeInfo: SchemeInfo;
  secret: string;
  visible: boolean;
  words: number;
  entropy: string;
  bananaTitle: string;
  passphrase: string;
  total: number;
  threshold: number;
  busy: boolean;
  onSecretChange: (value: string) => void;
  onToggleVisible: () => void;
  onBananaTitleChange: (value: string) => void;
  onPassphraseChange: (value: string) => void;
  onTotalChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onCreate: () => void;
};

function SchemeCharacteristics({ info }: { info: SchemeInfo }) {
  return (
    <div className="scheme-characteristics">
      <h4>Характеристики</h4>
      <dl>
        <div><dt>Алгоритм</dt><dd>{info.algorithm}</dd></div>
        <div><dt>Совместимость</dt><dd>{info.compatibility}</dd></div>
        <div><dt>Пароль</dt><dd>{info.password}</dd></div>
      </dl>
    </div>
  );
}

export function SplitWorkflow({
  scheme,
  schemeInfo,
  secret,
  visible,
  words,
  entropy,
  bananaTitle,
  passphrase,
  total,
  threshold,
  busy,
  onSecretChange,
  onToggleVisible,
  onBananaTitleChange,
  onPassphraseChange,
  onTotalChange,
  onThresholdChange,
  onCreate,
}: SplitProps) {
  return (
    <section className="workspace">
      <div className="panel input-panel">
        <div className="section-title"><span>01</span><div><h2>Исходный секрет</h2><p>{scheme === "slip39" ? "BIP-39 seed-фраза в любом официальном словаре" : "Seed-фраза, пароль, ключ или произвольный текст"}</p></div></div>
        <div className="secret-wrap"><textarea value={secret} onChange={(event) => onSecretChange(event.target.value)} className={visible ? "" : "masked"} placeholder="Введите секрет здесь…" spellCheck={false} autoComplete="off" /><button className="ghost" onClick={onToggleVisible}>{visible ? "Скрыть" : "Показать"}</button></div>
        <div className="meta"><span>{secret.length} символов</span><span>{words} слов</span>{scheme === "slip39" && <span>{entropy ? "BIP-39 корректна" : "BIP-39 не распознана"}</span>}</div>
        {(scheme === "slip39" || scheme === "banana") && <div className="compat-fields">{scheme === "banana" && <label>Название набора<input value={bananaTitle} onChange={(event) => onBananaTitleChange(event.target.value)} /></label>}<label>{scheme === "banana" ? "Пароль для шифрования (обязательно)" : "Пароль SLIP-39 для защиты частей (необязательно)"}<input type="password" value={passphrase} onChange={(event) => onPassphraseChange(event.target.value)} autoComplete="new-password" placeholder="Введите пароль" /></label></div>}
        <div className="section-title settings-title"><span>02</span><div><h2>Схема хранения</h2><p>Сколько частей создать и сколько нужно для восстановления</p></div></div>
        <div className="settings-grid"><label>Всего частей<strong>{total}</strong><input type="range" min="2" max="10" value={total} onChange={(event) => onTotalChange(Number(event.target.value))} /></label><label>Нужно частей<strong>{threshold}</strong><input type="range" min="2" max={total} value={threshold} onChange={(event) => onThresholdChange(Number(event.target.value))} /></label></div>
        <div className="preset-row">{[[2, 3], [3, 5], [4, 7]].map(([required, count]) => <button key={`${required}-${count}`} onClick={() => { onThresholdChange(required); onTotalChange(count); }}>{required} из {count}</button>)}</div>
        <button className="primary" disabled={busy || !secret.trim() || (scheme === "slip39" && !entropy) || (scheme === "banana" && !passphrase)} onClick={onCreate}>{busy ? "Обработка…" : `Создать ${total} частей`}</button>
      </div>
      <aside className="panel algorithm-panel">
        <div className="algorithm-symbol">◇</div><h3>{schemeInfo.shortLabel}</h3>
        <ul className="check-list">{schemeInfo.details.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="algorithm-metrics"><div><span>Нужно частей</span><strong>{threshold}</strong></div><div><span>Всего частей</span><strong>{total}</strong></div></div>
        <SchemeCharacteristics info={schemeInfo} />
        <div className="flow-diagram"><span>Seed</span><b>↓</b><span>{schemeInfo.shortLabel}</span><b>↓</b><span>{total} частей</span></div>
      </aside>
    </section>
  );
}

type RecoveryProps = {
  recoveryRef: RefObject<HTMLElement | null>;
  recoveredRef: RefObject<HTMLDivElement | null>;
  scheme: SharingScheme;
  schemeInfo: SchemeInfo;
  input: string;
  partCount: number;
  language: Bip39Language;
  passphrase: string;
  busy: boolean;
  recovered: string;
  onInputChange: (value: string) => void;
  onLanguageChange: (value: Bip39Language) => void;
  onPassphraseChange: (value: string) => void;
  onRestore: () => void;
};

export function RecoveryWorkflow({
  recoveryRef,
  recoveredRef,
  scheme,
  schemeInfo,
  input,
  partCount,
  language,
  passphrase,
  busy,
  recovered,
  onInputChange,
  onLanguageChange,
  onPassphraseChange,
  onRestore,
}: RecoveryProps) {
  return (
    <section ref={recoveryRef} className="workspace recovery-workspace">
      <div className="panel recovery-panel">
        <div className="section-title"><span>01</span><div><h2>Добавьте части</h2><p>{scheme === "slip39" ? "Каждая мнемоника с новой строки" : "Разделяйте части пустой строкой"}</p></div></div>
        <textarea value={input} onChange={(event) => onInputChange(event.target.value)} placeholder={scheme === "generic" ? "SST1-…\n\nSST1-…" : scheme === "slip39" ? "SLIP-39 mnemonic one…\nSLIP-39 mnemonic two…" : "{\"v\":1,…}\n\n{\"v\":1,…}"} spellCheck={false} />
        {scheme === "slip39" && <div className="compat-fields"><label>Язык восстановленной BIP-39 фразы<select value={language} onChange={(event) => onLanguageChange(event.target.value as Bip39Language)}>{BIP39_LANGUAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>}
        {(scheme === "slip39" || scheme === "banana") && <div className="compat-fields"><label>{scheme === "banana" ? "Пароль для расшифровки" : "Пароль SLIP-39"}<input type="password" value={passphrase} onChange={(event) => onPassphraseChange(event.target.value)} placeholder="Введите пароль" /></label></div>}
        <div className="meta"><span>Распознано частей: {partCount}</span></div>
        <button className="primary" disabled={busy || partCount === 0 || (scheme === "banana" && !passphrase)} onClick={onRestore}>{busy ? "Проверка…" : "Восстановить секрет"}</button>
        {recovered && <div ref={recoveredRef} className="result-secret"><span>Восстановленный секрет</span><pre>{recovered}</pre></div>}
      </div>
      <aside className="panel algorithm-panel recovery-info-panel">
        <div className="algorithm-symbol">↺</div><h3>Восстановление · {schemeInfo.shortLabel}</h3>
        <p className="panel-intro">Программа проверит формат и объединит достаточное количество частей локально, без отправки данных в сеть.</p>
        <ul className="check-list">{schemeInfo.recoveryNotes.map((item) => <li key={item}>{item}</li>)}</ul>
        <SchemeCharacteristics info={schemeInfo} />
        <div className="recovery-counter"><span>Сейчас распознано</span><strong>{partCount}</strong><small>частей</small></div>
      </aside>
    </section>
  );
}

export function WorkflowTabs({ mode, onChange }: { mode: WorkflowMode; onChange: (mode: WorkflowMode) => void }) {
  return <div className="tabs main-tabs" role="tablist" aria-label="Основные инструменты"><button className={mode === "generate" ? "active" : ""} onClick={() => onChange("generate")}>Генерация</button><button className={mode === "split" ? "active" : ""} onClick={() => onChange("split")}>Разделить seed</button><button className={mode === "recover" ? "active" : ""} onClick={() => onChange("recover")}>Восстановить</button></div>;
}

export function SchemeSelector({ mode, scheme, info, onChange }: { mode: WorkflowMode; scheme: SharingScheme; info: SchemeInfo; onChange: (scheme: SharingScheme) => void }) {
  if (mode === "generate") return null;
  return <section className="panel scheme-panel"><label htmlFor="scheme-select"><strong>{mode === "split" ? "Схема разделения" : "Формат частей"}</strong></label><select id="scheme-select" value={scheme} onChange={(event) => onChange(event.target.value as SharingScheme)}><option value="slip39">SLIP-39 · готово</option><option value="banana">Banana Split · готово</option><option value="generic">Generic SST1 · готово</option></select><p>{info.description}</p></section>;
}
