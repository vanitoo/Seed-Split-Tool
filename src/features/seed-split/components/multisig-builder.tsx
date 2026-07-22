"use client";

import { useMemo, useState } from "react";

type Signer = {
  name: string;
  fingerprint: string;
  derivation: string;
  xpub: string;
};

const EMPTY_SIGNER = (index: number): Signer => ({
  name: `Signer ${String.fromCharCode(65 + index)}`,
  fingerprint: "",
  derivation: "48'/0'/0'/2'",
  xpub: "",
});

function normalizeFingerprint(value: string): string {
  return value.replace(/[^0-9a-f]/gi, "").slice(0, 8).toUpperCase();
}

function normalizePath(value: string): string {
  return value.trim().replace(/^m\//i, "");
}

function isExtendedPublicKey(value: string): boolean {
  return /^(xpub|tpub|ypub|upub|zpub|vpub)[1-9A-HJ-NP-Za-km-z]{80,120}$/.test(value.trim());
}

export function MultisigBuilder() {
  const [total, setTotal] = useState(3);
  const [threshold, setThreshold] = useState(2);
  const [network, setNetwork] = useState<"mainnet" | "testnet">("mainnet");
  const [signers, setSigners] = useState<Signer[]>(() => Array.from({ length: 3 }, (_, index) => EMPTY_SIGNER(index)));
  const [copied, setCopied] = useState(false);

  function changeTotal(nextTotal: number): void {
    setTotal(nextTotal);
    setThreshold((current) => Math.min(current, nextTotal));
    setSigners((current) => Array.from({ length: nextTotal }, (_, index) => current[index] ?? EMPTY_SIGNER(index)));
  }

  function updateSigner(index: number, patch: Partial<Signer>): void {
    setSigners((current) => current.map((signer, signerIndex) => signerIndex === index ? { ...signer, ...patch } : signer));
    setCopied(false);
  }

  const signerErrors = useMemo(() => signers.map((signer) => {
    if (!/^[0-9A-F]{8}$/.test(normalizeFingerprint(signer.fingerprint))) return "Fingerprint должен содержать 8 hex-символов";
    if (!normalizePath(signer.derivation)) return "Укажите путь деривации";
    if (!isExtendedPublicKey(signer.xpub)) return "Укажите корректный extended public key";
    if (network === "mainnet" && !/^(xpub|ypub|zpub)/.test(signer.xpub.trim())) return "Для mainnet ожидается xpub/ypub/zpub";
    if (network === "testnet" && !/^(tpub|upub|vpub)/.test(signer.xpub.trim())) return "Для testnet ожидается tpub/upub/vpub";
    return "";
  }), [signers, network]);

  const descriptor = useMemo(() => {
    if (signerErrors.some(Boolean)) return "";
    const keys = signers.map((signer) => `[${normalizeFingerprint(signer.fingerprint)}/${normalizePath(signer.derivation)}]${signer.xpub.trim()}/0/*`);
    return `wsh(sortedmulti(${threshold},${keys.join(",")}))`;
  }, [signers, signerErrors, threshold]);

  async function copyDescriptor(): Promise<void> {
    if (!descriptor) return;
    await navigator.clipboard.writeText(descriptor);
    setCopied(true);
  }

  return (
    <section className="workspace multisig-workspace">
      <div className="panel input-panel">
        <div className="section-title"><span>01</span><div><h2>Политика кошелька</h2><p>Bitcoin P2WSH multisig с descriptor формата sortedmulti</p></div></div>
        <div className="multisig-policy-grid">
          <label>Сеть<select value={network} onChange={(event) => setNetwork(event.target.value as "mainnet" | "testnet")}><option value="mainnet">Bitcoin Mainnet</option><option value="testnet">Bitcoin Testnet</option></select></label>
          <label>Всего подписантов<select value={total} onChange={(event) => changeTotal(Number(event.target.value))}>{[2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
          <label>Нужно подписей<select value={threshold} onChange={(event) => setThreshold(Number(event.target.value))}>{Array.from({ length: total }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} из {total}</option>)}</select></label>
        </div>

        <div className="section-title settings-title"><span>02</span><div><h2>Публичные ключи подписантов</h2><p>Seed-фразы и приватные ключи сюда вводить нельзя</p></div></div>
        <div className="signer-list">
          {signers.map((signer, index) => <article className="signer-card" key={index}>
            <div className="signer-heading"><strong>{signer.name}</strong><span>{index + 1} / {total}</span></div>
            <label>Название<input value={signer.name} onChange={(event) => updateSigner(index, { name: event.target.value })} /></label>
            <div className="signer-meta-grid">
              <label>Master fingerprint<input value={signer.fingerprint} onChange={(event) => updateSigner(index, { fingerprint: normalizeFingerprint(event.target.value) })} placeholder="A1B2C3D4" /></label>
              <label>Путь деривации<input value={signer.derivation} onChange={(event) => updateSigner(index, { derivation: event.target.value })} placeholder="48'/0'/0'/2'" /></label>
            </div>
            <label>Extended public key<textarea value={signer.xpub} onChange={(event) => updateSigner(index, { xpub: event.target.value.trim() })} placeholder={network === "mainnet" ? "xpub... / zpub..." : "tpub... / vpub..."} spellCheck={false} /></label>
            {signerErrors[index] && <small className="field-error">{signerErrors[index]}</small>}
          </article>)}
        </div>

        <div className="section-title settings-title"><span>03</span><div><h2>Wallet descriptor</h2><p>Сохраните его вместе с fingerprints, путями и xpub всех участников</p></div></div>
        <div className="descriptor-output">
          <pre>{descriptor || "Заполните корректные публичные данные всех подписантов"}</pre>
          <div className="generation-actions"><button disabled={!descriptor} onClick={copyDescriptor}>{copied ? "Скопировано" : "Копировать descriptor"}</button></div>
        </div>
      </div>

      <aside className="panel algorithm-panel">
        <div className="algorithm-symbol">⌘</div><h3>{threshold} из {total}</h3>
        <ul className="check-list"><li>Только Bitcoin P2WSH на первом этапе</li><li>Ключи сортируются через sortedmulti</li><li>Приватные данные не требуются</li><li>Descriptor можно импортировать в совместимый координатор</li></ul>
        <div className="algorithm-metrics"><div><span>Порог</span><strong>{threshold}</strong></div><div><span>Ключей</span><strong>{total}</strong></div></div>
        <div className="multisig-warning"><strong>Важно</strong><p>Этот модуль не создаёт аппаратные ключи, не подписывает транзакции и не проверяет контрольные суммы descriptor. Перед использованием с реальными средствами проверьте конфигурацию в Sparrow или другом совместимом кошельке.</p></div>
        <div className="flow-diagram"><span>{total} независимых ключа</span><b>↓</b><span>{threshold} подписей</span><b>↓</b><span>P2WSH multisig</span></div>
      </aside>
    </section>
  );
}
