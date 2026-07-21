import { BIP39_LANGUAGES, BIP39_WORD_COUNTS, type Bip39Language, type Bip39WordCount, compactFingerprint } from "../lib/bip39-tools";
import type { SchemeInfo, SharingScheme, WorkflowMode } from "../model";

type GenerationProps = {
  secret: string; visible: boolean; words: number; entropy: string; walletFingerprint: string; sourceLanguageLabel: string;
  bip39Words: Bip39WordCount; bip39Language: Bip39Language; bip39Passphrase: string;
  onWordsChange: (value: Bip39WordCount) => void; onLanguageChange: (value: Bip39Language) => void; onPassphraseChange: (value: string) => void;
  onGenerate: () => void; onSecretChange: (value: string) => void; onToggleVisible: () => void; onCopy: () => void; onDownload: () => void; onContinue: () => void;
};

export function GenerationWorkflow(props: GenerationProps) {
  return <section className="workspace generator-workspace"><div className="panel input-panel">
    <section className="seed-generator standalone-generator"><div className="section-title"><span>01</span><div><h2>Генератор BIP-39</h2><p>Создаёт новую seed-фразу локально через Web Crypto</p></div></div>
      <div className="generator-controls"><label>Количество слов<select value={props.bip39Words} onChange={(e) => props.onWordsChange(Number(e.target.value) as Bip39WordCount)}>{BIP39_WORD_COUNTS.map((count) => <option key={count} value={count}>{count} слов</option>)}</select></label><label>Официальный словарь<select value={props.bip39Language} onChange={(e) => props.onLanguageChange(e.target.value as Bip39Language)}>{BIP39_LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select></label><button type="button" onClick={props.onGenerate}>Сгенерировать seed</button></div>
      <label className="bip39-passphrase"><span className="label-with-help">BIP-39 Passphrase <span className="help-tip" tabIndex={0} aria-label="Подсказка о BIP-39 Passphrase">ⓘ<span className="help-bubble">Используется как дополнительный пароль.<br />Не входит в seed-фразу.<br />Потеря пароля лишает доступа к созданному кошельку.</span></span></span><input type="password" value={props.bip39Passphrase} onChange={(e) => props.onPassphraseChange(e.target.value)} placeholder="Храните отдельно" autoComplete="new-password" /></label>
      <div className="entropy-proof"><div><span>Словарь</span><strong>{props.sourceLanguageLabel}</strong></div><div><span>Entropy</span><code>{compactFingerprint(props.entropy)}</code></div><div><span className="label-with-help">Wallet fingerprint <span className="help-tip" tabIndex={0}>ⓘ<span className="help-bubble">Короткий отпечаток производного wallet seed. Помогает увидеть изменение языка или Passphrase.</span></span></span><code>{props.walletFingerprint}</code></div></div>
    </section>
    <div className="section-title"><span>02</span><div><h2>Созданная seed-фраза</h2><p>Проверьте язык, количество слов и сохраните фразу безопасным способом</p></div></div>
    <div className="secret-wrap"><textarea value={props.secret} onChange={(e) => props.onSecretChange(e.target.value)} className={props.visible ? "" : "masked"} placeholder="Нажмите «Сгенерировать seed»" spellCheck={false} autoComplete="off" /><button className="ghost" onClick={props.onToggleVisible}>{props.visible ? "Скрыть" : "Показать"}</button></div>
    <div className="meta"><span>{props.secret.length} символов</span><span>{props.words} слов</span><span>{props.entropy ? "BIP-39 корректна" : "Seed ещё не создана"}</span></div>
    {props.secret && <div className="generation-actions"><button onClick={props.onCopy}>Копировать</button><button onClick={props.onDownload}>Скачать</button><button className="primary-inline" onClick={props.onContinue}>Перейти к разделению →</button></div>}
  </div><aside className="panel algorithm-panel"><div className="algorithm-symbol">◇</div><h3>Генерация BIP-39</h3><ul className="check-list"><li>Криптографически случайная entropy</li><li>Официальные словари BIP-39</li><li>Работает полностью локально</li></ul><div className="flow-diagram"><span>Entropy</span><b>↓</b><span>BIP-39 слова</span><b>↓</b><span>Wallet</span></div></aside></section>;
}

type SplitProps = { scheme: SharingScheme; schemeInfo: SchemeInfo; secret: string; visible: boolean; words: number; entropy: string; bananaTitle: string; passphrase: string; total: number; threshold: number; busy: boolean; onSecretChange:(v:string)=>void; onToggleVisible:()=>void; onBananaTitleChange:(v:string)=>void; onPassphraseChange:(v:string)=>void; onTotalChange:(v:number)=>void; onThresholdChange:(v:number)=>void; onCreate:()=>void; };
export function SplitWorkflow(props: SplitProps) {
  return <section className="workspace"><div className="panel input-panel"><div className="section-title"><span>01</span><div><h2>Исходный секрет</h2><p>{props.scheme === "slip39" ? "BIP-39 seed-фраза в любом официальном словаре" : "Seed-фраза, пароль, ключ или произвольный текст"}</p></div></div>
    <div className="secret-wrap"><textarea value={props.secret} onChange={(e) => props.onSecretChange(e.target.value)} className={props.visible ? "" : "masked"} placeholder="Введите секрет здесь…" spellCheck={false} autoComplete="off" /><button className="ghost" onClick={props.onToggleVisible}>{props.visible ? "Скрыть" : "Показать"}</button></div>
    <div className="meta"><span>{props.secret.length} символов</span><span>{props.words} слов</span>{props.scheme === "slip39" && <span>{props.entropy ? "BIP-39 корректна" : "BIP-39 не распознана"}</span>}</div>
    {(props.scheme === "slip39" || props.scheme === "banana") && <div className="compat-fields">{props.scheme === "banana" && <label>Название набора<input value={props.bananaTitle} onChange={(e) => props.onBananaTitleChange(e.target.value)} /></label>}<label>{props.scheme === "banana" ? "Пароль для шифрования (обязательно)" : "Пароль SLIP-39 для защиты частей (необязательно)"}<input type="password" value={props.passphrase} onChange={(e) => props.onPassphraseChange(e.target.value)} autoComplete="new-password" placeholder="Введите пароль" /></label></div>}
    <div className="section-title settings-title"><span>02</span><div><h2>Схема хранения</h2><p>Сколько частей создать и сколько нужно для восстановления</p></div></div>
    <div className="settings-grid"><label>Всего частей<strong>{props.total}</strong><input type="range" min="2" max="10" value={props.total} onChange={(e) => props.onTotalChange(Number(e.target.value))} /></label><label>Нужно частей<strong>{props.threshold}</strong><input type="range" min="2" max={props.total} value={props.threshold} onChange={(e) => props.onThresholdChange(Number(e.target.value))} /></label></div>
    <div className="preset-row">{[[2,3],[3,5],[4,7]].map(([k,n]) => <button key={`${k}-${n}`} onClick={() => { props.onThresholdChange(k); props.onTotalChange(n); }}>{k} из {n}</button>)}</div>
    <button className="primary" disabled={props.busy || !props.secret.trim() || (props.scheme === "slip39" && !props.entropy) || (props.scheme === "banana" && !props.passphrase)} onClick={props.onCreate}>{props.busy ? "Обработка…" : `Создать ${props.total} частей`}</button>
  </div><aside className="panel algorithm-panel"><div className="algorithm-symbol">◇</div><h3>{props.schemeInfo.shortLabel}</h3><ul className="check-list">{props.schemeInfo.details.map((item) => <li key={item}>{item}</li>)}</ul><div className="algorithm-metrics"><div><span>Нужно частей</span><strong>{props.threshold}</strong></div><div><span>Всего частей</span><strong>{props.total}</strong></div></div><div className="strength"><span>Стойкость</span><strong>{props.schemeInfo.strength}</strong></div><div className="flow-diagram"><span>Seed</span><b>↓</b><span>{props.schemeInfo.shortLabel}</span><b>↓</b><span>{props.total} частей</span></div></aside></section>;
}

type RecoveryProps = { recoveryRef: React.RefObject<HTMLElement | null>; recoveredRef: React.RefObject<HTMLDivElement | null>; scheme: SharingScheme; input:string; partCount:number; language:Bip39Language; passphrase:string; busy:boolean; recovered:string; onInputChange:(v:string)=>void; onLanguageChange:(v:Bip39Language)=>void; onPassphraseChange:(v:string)=>void; onRestore:()=>void; };
export function RecoveryWorkflow(props: RecoveryProps) {
  return <section ref={props.recoveryRef} className="panel recovery-panel"><div className="section-title"><span>01</span><div><h2>Добавьте части</h2><p>{props.scheme === "slip39" ? "Каждая мнемоника с новой строки" : "Разделяйте части пустой строкой"}</p></div></div>
    <textarea value={props.input} onChange={(e) => props.onInputChange(e.target.value)} placeholder={props.scheme === "generic" ? "SST1-…\n\nSST1-…" : props.scheme === "slip39" ? "SLIP-39 mnemonic one…\nSLIP-39 mnemonic two…" : "{\"v\":1,…}\n\n{\"v\":1,…}"} spellCheck={false} />
    {props.scheme === "slip39" && <div className="compat-fields"><label>Язык восстановленной BIP-39 фразы<select value={props.language} onChange={(e) => props.onLanguageChange(e.target.value as Bip39Language)}>{BIP39_LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}</select></label></div>}
    {(props.scheme === "slip39" || props.scheme === "banana") && <div className="compat-fields"><label>{props.scheme === "banana" ? "Пароль для расшифровки" : "Пароль SLIP-39"}<input type="password" value={props.passphrase} onChange={(e) => props.onPassphraseChange(e.target.value)} placeholder="Введите пароль" /></label></div>}
    <div className="meta"><span>Распознано частей: {props.partCount}</span></div><button className="primary" disabled={props.busy || props.partCount === 0 || (props.scheme === "banana" && !props.passphrase)} onClick={props.onRestore}>{props.busy ? "Проверка…" : "Восстановить секрет"}</button>
    {props.recovered && <div ref={props.recoveredRef} className="result-secret"><span>Восстановленный секрет</span><pre>{props.recovered}</pre></div>}
  </section>;
}

export function WorkflowTabs({ mode, onChange }: { mode: WorkflowMode; onChange: (mode: WorkflowMode) => void }) {
  return <div className="tabs main-tabs" role="tablist" aria-label="Основные инструменты"><button className={mode === "generate" ? "active" : ""} onClick={() => onChange("generate")}>Генерация</button><button className={mode === "split" ? "active" : ""} onClick={() => onChange("split")}>Разделить seed</button><button className={mode === "recover" ? "active" : ""} onClick={() => onChange("recover")}>Восстановить</button></div>;
}

export function SchemeSelector({ mode, scheme, info, onChange }: { mode: WorkflowMode; scheme: SharingScheme; info: SchemeInfo; onChange:(scheme:SharingScheme)=>void }) {
  if (mode === "generate") return null;
  return <section className="panel scheme-panel"><label htmlFor="scheme-select"><strong>{mode === "split" ? "Схема разделения" : "Формат частей"}</strong></label><select id="scheme-select" value={scheme} onChange={(e) => onChange(e.target.value as SharingScheme)}><option value="slip39">SLIP-39 · готово</option><option value="banana">Banana Split · готово</option><option value="generic">Generic SST1 · готово</option></select><p>{info.description}</p></section>;
}
