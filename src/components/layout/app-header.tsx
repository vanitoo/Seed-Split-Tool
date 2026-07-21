export function AppHeader() {
  return (
    <header className="app-header">
      <a href="#main" className="brand"><span className="brand-icon">BT</span><span>Browser Tool</span></a>
      <div className="header-actions"><span className="local-label">🔒 Local only</span><a className="github-link" href="https://github.com/OWNER/REPOSITORY" target="_blank" rel="noreferrer">GitHub</a></div>
    </header>
  );
}
