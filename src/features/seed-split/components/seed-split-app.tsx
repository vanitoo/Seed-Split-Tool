"use client";

import { useMemo, useState } from "react";
import { decodeShare, recoverSecret, splitSecret } from "../lib/shamir";

type Mode = "split" | "recover";
type Scheme = "generic" | "slip39" | "banana";

const SCHEMES: Record<Scheme, { label: string; description: string; ready: boolean }> = {
  slip39: {
    label: "SLIP-39 (рекомендуется)",
    description: "Стандартные мнемонические части, совместимые с реализациями SLIP-39.",
    ready: false,
  },
  banana: {
    label: "Banana Split (legacy)",
    description: "Режим совместимости с резервными копиями BananaSplit.html.",
    ready: false,
  },
  generic: {
    label: "Generic Secret Sharing",
    description: "Универсальный собственный формат SST1 для любого текста или секрета.",
    ready: true,
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

export function SeedSplitApp() {
  const [mode, setMode] = useState<Mode>("split");
  const [scheme, setScheme] = useState<Scheme>("generic");
  const [secret, setSecret] = useState("");
  const [visible, setVisible] = useState(false);
  const [total, setTotal] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [shares, setShares] = useState<string[]>([]);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recovered, setRecovered] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);

  const words = wordCount(secret);
  const schemeInfo = SCHEMES[scheme];
  const recoveryShares = useMemo(
    () => recoveryInput.split(/\n\s*\n/u).map((value) => value.trim()).filter(Boolean),
    [recoveryInput],
  );

  async function createShares(): Promise<void> {
    if (!schemeInfo.ready) {
      setStatus(`${schemeInfo.label}: модуль ещё не подключён`);
      return;
    }
    setBusy(true);
    setStatus("");
    setVerified(false);
    try {
      const next = await splitSecret(secret, total, threshold);
      setShares(next);
      setStatus("Части созданы только в памяти этого браузера");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Неизвестная ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function restore(input = recoveryShares): Promise<void> {
    if (!schemeInfo.ready) {
      setStatus(`${schemeInfo.label}: модуль ещё не подключён`);
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const result = await recoverSecret(input);
      setRecovered(result);
      setStatus("Секрет успешно восстановлен и проверен");
      if (shares.length && result === secret.normalize("NFC")) setVerified(true);
    } catch (error) {
      setRecovered("");
      setStatus(error instanceof Error ? error.message : "Неизвестная ошибка");
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
  }

  return <main className="shell">
    <section className="hero">
      <div><span className="eyebrow">LOCAL · OFFLINE · OPEN SOURCE</span><h1>Seed Split Tool</h1><p>Разделите seed-фразу или другой секрет по схеме K из N. Ни одна часть не покидает устройство.</p></div>
      <div className="offline-pill"><span /> Сеть не используется</div>
    </section>

    <section className="warning"><strong>Важно:</strong> выбранная схема определяет совместимость частей. <code>SST1</code> является собственным форматом приложения; SLIP-39 и Banana Split подключаются отдельными адаптерами.</section>

    <section className="panel scheme-panel">
      <label htmlFor="scheme-select"><strong>Схема разделения</strong></label>
      <select id="scheme-select" value={scheme} onChange={(event) => { setScheme(event.target.value as Scheme); setShares([]); setRecovered(""); setStatus(""); }}>
        <option value="slip39">SLIP-39 (рекомендуется) · в разработке</option>
        <option value="banana">Banana Split (legacy) · в разработке</option>
        <option value="generic">Generic Secret Sharing · готово</option>
      </select>
      <p>{schemeInfo.description}</p>
    </section>

    <div className="tabs" role="tablist">
      <button className={mode === "split" ? "active" : ""} onClick={() => setMode("split")}>Разделить секрет</button>
      <button className={mode === "recover" ? "active" : ""} onClick={() => setMode("recover")}>Восстановить</button>
    </div>

    {mode === "split" ? <section className="workspace">
      <div className="panel input-panel">
        <div className="section-title"><span>01</span><div><h2>Исходный секрет</h2><p>Seed-фраза, пароль, ключ или произвольный текст</p></div></div>
        <div className="secret-wrap">
          <textarea value={secret} onChange={(event) => setSecret(event.target.value)} className={visible ? "" : "masked"} placeholder="Введите секрет здесь…" spellCheck={false} autoComplete="off" />
          <button className="ghost" onClick={() => setVisible((value) => !value)}>{visible ? "Скрыть" : "Показать"}</button>
        </div>
        <div className="meta"><span>{secret.length} символов</span><span>{words} слов</span><span>Unicode NFKD</span></div>

        <div className="section-title settings-title"><span>02</span><div><h2>Схема хранения</h2><p>Сколько частей создать и сколько нужно для восстановления</p></div></div>
        <div className="settings-grid">
          <label>Всего частей<strong>{total}</strong><input type="range" min="2" max="10" value={total} onChange={(event) => { const n = Number(event.target.value); setTotal(n); if (threshold > n) setThreshold(n); }} /></label>
          <label>Нужно частей<strong>{threshold}</strong><input type="range" min="2" max={total} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></label>
        </div>
        <div className="preset-row">{[[2,3],[3,5],[4,7]].map(([k,n]) => <button key={`${k}-${n}`} onClick={() => { setThreshold(k); setTotal(n); }}>{k} из {n}</button>)}</div>
        <button className="primary" disabled={busy || !secret.trim() || !schemeInfo.ready} onClick={createShares}>{busy ? "Обработка…" : schemeInfo.ready ? `Создать ${total} частей` : "Модуль ещё не подключён"}</button>
      </div>

      <aside className="panel explainer"><div className="lock-art">◇</div><h3>Как это работает</h3><p>Алгоритм Шамира создаёт математически независимые части. Любых {threshold} частей достаточно, а {threshold - 1} не раскрывают исходный секрет.</p><ul><li>Храните части в разных местах</li><li>Не фотографируйте весь набор</li><li>Обязательно проверьте восстановление</li></ul></aside>
    </section> : <section className="panel recovery-panel">
      <div className="section-title"><span>01</span><div><h2>Добавьте части</h2><p>Разделяйте части пустой строкой</p></div></div>
      <textarea value={recoveryInput} onChange={(event) => setRecoveryInput(event.target.value)} placeholder={scheme === "generic" ? "SST1-…\n\nSST1-…" : "Вставьте части выбранной схемы"} spellCheck={false} />
      <div className="meta"><span>Распознано частей: {recoveryShares.length}</span></div>
      <button className="primary" disabled={busy || recoveryShares.length === 0 || !schemeInfo.ready} onClick={() => restore()}>{busy ? "Проверка…" : schemeInfo.ready ? "Восстановить секрет" : "Модуль ещё не подключён"}</button>
      {recovered && <div className="result-secret"><span>Восстановленный секрет</span><pre>{recovered}</pre></div>}
    </section>}

    {status && <div className={status.includes("ошиб") || status.includes("Нужно") || status.includes("не ") ? "status error" : "status"}>{status}</div>}

    {mode === "split" && shares.length > 0 && <section className="results">
      <div className="results-head"><div><span className="eyebrow">НАБОР {decodeShare(shares[0]).id}</span><h2>Ваши части готовы</h2><p>Для восстановления требуется {threshold} из {total} частей.</p></div><div className={verified ? "verify-badge ok" : "verify-badge"}>{verified ? "✓ Набор проверен" : "Набор ещё не проверен"}</div></div>
      <div className="share-grid">{shares.map((share, index) => <article className="share-card" key={share}>
        <header><span>ЧАСТЬ {index + 1}</span><b>{index + 1}/{total}</b></header>
        <div className="share-code">{share}</div>
        <footer><button onClick={() => navigator.clipboard.writeText(share)}>Копировать</button><button onClick={() => downloadText(`seed-share-${index + 1}-of-${total}.txt`, share)}>Скачать</button></footer>
      </article>)}</div>
      <div className="verify-panel"><div><h3>Проверьте резервную копию</h3><p>Вставьте любые {threshold} созданные части. Это единственный разумный способ узнать, что резервная копия действительно работает.</p></div><button onClick={() => { setMode("recover"); setRecoveryInput(shares.slice(0, threshold).join("\n\n")); }}>Проверить сейчас</button></div>
      <div className="actions"><button onClick={() => window.print()}>Печать</button><button onClick={() => downloadText(`seed-split-${decodeShare(shares[0]).id}.txt`, shares.join("\n\n"))}>Скачать весь набор</button><button className="danger" onClick={clearAll}>Очистить всё</button></div>
    </section>}
  </main>;
}
