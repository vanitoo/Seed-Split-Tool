type SeedPrintCardProps = {
  secret: string;
};

export function SeedPrintCard({ secret }: SeedPrintCardProps) {
  const words = secret.trim().split(/\s+/).filter(Boolean);
  const slotCount = words.length <= 12 ? 12 : 24;
  const slots = Array.from({ length: slotCount }, (_, index) => words[index] ?? "");
  const firstColumn = slots.slice(0, slotCount / 2);
  const secondColumn = slots.slice(slotCount / 2);

  return (
    <section className="seed-print-sheet" aria-hidden="true">
      <div className="seed-print-card">
        <i className="crop crop-tl" /><i className="crop crop-tr" /><i className="crop crop-bl" /><i className="crop crop-br" />
        <div className="fold-line fold-one"><span>линия сгиба</span></div>
        <div className="fold-line fold-two"><span>линия сгиба</span></div>

        <section className="seed-print-warning">
          <div className="seed-print-brand">SEED SPLIT TOOL</div>
          <h1>РЕЗЕРВНАЯ SEED-ФРАЗА</h1>
          <p>Эта фраза даёт полный доступ к кошельку и связанным активам.</p>
          <strong>Никогда не вводите её на сайтах и не передавайте другим людям.</strong>
          <p>Храните карточку офлайн, в защищённом от воды, огня и постороннего доступа месте.</p>
          <div className="seed-print-note"><span>Название кошелька</span></div>
          <div className="seed-print-note"><span>Дата создания</span></div>
          <small>BIP-39 Passphrase намеренно не печатается. Храните её отдельно.</small>
        </section>

        <section className="seed-word-column">
          {firstColumn.map((word, index) => <div className="seed-word-row" key={index}><b>{index + 1}</b><span>{word}</span></div>)}
        </section>

        <section className="seed-word-column">
          {secondColumn.map((word, index) => <div className="seed-word-row" key={index}><b>{index + firstColumn.length + 1}</b><span>{word}</span></div>)}
        </section>
      </div>
      <p className="seed-print-help">Обрежьте по внешним меткам и сложите карточку по пунктирным линиям текстом внутрь.</p>
    </section>
  );
}
