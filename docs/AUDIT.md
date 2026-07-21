# Seed Split Tool — audit

Date: 2026-07-21

## Scope

Reviewed areas:

- BIP-39 generation and wordlist conversion;
- SLIP-39 split/recovery data flow;
- Banana encrypted sharing primitives;
- Generic Shamir primitive;
- dependency installation and lockfile use;
- GitHub Actions checks.

## Fixed during this audit

### 1. No cryptographic regression tests — fixed

The previous CI checked TypeScript, ESLint and the Next.js build, but did not prove that a generated backup could be restored.

Added deterministic round-trip checks for:

- BIP-39 entropy → mnemonic → entropy;
- SLIP-39 2-of-3 split and recovery;
- Generic Shamir 3-of-5 split and recovery;
- Banana encryption, 2-of-3 recovery and rejection of a wrong password.

Command:

```bash
npm run test:crypto
```

### 2. Non-reproducible CI install — fixed

CI previously used `npm install`, which may resolve newer dependency versions than the committed lockfile.

CI now uses:

```bash
npm ci
```

A separate lockfile consistency job also verifies that `package.json` and `package-lock.json` agree.

### 3. Narrow runtime coverage — improved

Checks now run on Node.js 20 and Node.js 22.

### 4. No dependency vulnerability gate — improved

CI now fails on critical npm dependency advisories:

```bash
npm audit --audit-level=critical
```

## Remaining risks

### High: recovery must be tested outside this application

A backup should not be trusted only because the same application that created it can restore it. Before using real funds, verify SLIP-39 shares with an independent compatible implementation or hardware wallet.

### High: BIP-39 passphrase is separate from the mnemonic

The optional BIP-39 passphrase is not part of the 12/24 words and is not automatically stored inside the SLIP-39 backup. Losing it produces a different wallet and makes the intended wallet inaccessible.

The SLIP-39 passphrase and BIP-39 passphrase are different values with different purposes.

### Medium: wordlist conversion changes the wallet seed

Converting the same entropy to another official BIP-39 wordlist preserves entropy but changes the mnemonic text. BIP-39 derives the wallet seed from that text, so the resulting wallet changes.

The UI must continue to display this distinction clearly.

### Medium: external cryptographic dependencies

The project depends on third-party implementations including `slip39`, `secrets.js-grempe`, `scryptsy` and `tweetnacl`. Smoke tests reduce accidental regressions but are not a cryptographic audit of those libraries.

Pinning exact dependency versions should be considered before a stable release.

### Medium: no browser end-to-end test yet

Current automated tests verify cryptographic primitives and the production build. They do not yet click through the browser flow:

1. generate seed;
2. create shares;
3. choose a threshold subset;
4. restore;
5. compare the restored entropy.

A Playwright test should be added before declaring version 1.0 stable.

### Low: sensitive clipboard exposure

Copying a seed or share places it in the operating-system clipboard, where clipboard history and other applications may retain it. The UI should warn users and optionally clear copied values after a short delay.

## Release recommendation

Current status: suitable for continued development and controlled testing.

Before using with significant funds:

- add independent SLIP-39 compatibility vectors;
- add browser end-to-end tests;
- pin and review cryptographic dependencies;
- test recovery on an offline machine;
- publish a documented recovery procedure.
