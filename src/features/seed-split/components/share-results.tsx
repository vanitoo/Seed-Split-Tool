import type { RefObject } from "react";
import type { SharingScheme } from "../model";

type Props = {
  resultsRef: RefObject<HTMLElement | null>;
  shares: string[];
  total: number;
  threshold: number;
  setLabel: string;
  verified: boolean;
  scheme: SharingScheme;
  onCopy: (share: string) => void;
  onDownloadShare: (share: string, index: number) => void;
  onVerify: () => void;
  onPrint: () => void;
  onDownloadAll: () => void;
  onClear: () => void;
};

export function ShareResults({
  resultsRef,
  shares,
  total,
  threshold,
  setLabel,
  verified,
  onCopy,
  onDownloadShare,
  onVerify,
  onPrint,
  onDownloadAll,
  onClear,
}: Props) {
  if (shares.length === 0) return null;

  return (
    <section ref={resultsRef} className="results">
      <div className="results-head">
        <div>
          <span className="eyebrow">{setLabel}</span>
          <h2>Ваши части готовы</h2>
          <p>Для восстановления требуется {threshold} из {total} частей.</p>
        </div>
        <div className={verified ? "verify-badge ok" : "verify-badge"}>
          {verified ? "✓ Набор проверен" : "Набор ещё не проверен"}
        </div>
      </div>

      <div className="share-grid">
        {shares.map((share, index) => (
          <article className="share-card" key={`${index}-${share}`}>
            <header>
              <span>ЧАСТЬ {index + 1}</span>
              <b>{index + 1}/{total}</b>
            </header>
            <div className="share-code">{share}</div>
            <footer>
              <button onClick={() => onCopy(share)}>Копировать</button>
              <button onClick={() => onDownloadShare(share, index)}>Скачать</button>
            </footer>
          </article>
        ))}
      </div>

      <div className="verify-panel">
        <div>
          <h3>Проверьте резервную копию</h3>
          <p>Восстановите секрет из любых {threshold} частей до того, как разнесёте их по разным местам.</p>
        </div>
        <button onClick={onVerify}>Проверить сейчас</button>
      </div>

      <div className="actions">
        <button onClick={onPrint}>Печать</button>
        <button onClick={onDownloadAll}>Скачать весь набор</button>
        <button className="danger" onClick={onClear}>Очистить всё</button>
      </div>
    </section>
  );
}
