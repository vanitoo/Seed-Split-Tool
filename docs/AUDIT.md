# Seed Split Tool — audit

Date: 2026-07-22  
Release reviewed: **v0.4.0**

## Scope

Reviewed areas:

- BIP-39 generation and official wordlist conversion;
- BIP-39 Passphrase handling and Wallet fingerprint display;
- SLIP-39 split and recovery data flow;
- Banana encrypted sharing primitives;
- Generic Shamir primitive and SST1 container;
- three-tab generation, split, and recovery workflow;
- dependency installation and lockfile use;
- GitHub Actions and GitHub Pages production build.

## Implemented safeguards

### Cryptographic regression tests

Deterministic round-trip checks cover:

- BIP-39 entropy → mnemonic → entropy;
- SLIP-39 2-of-3 split and recovery;
- Generic Shamir 3-of-5 split and recovery;
- Banana encryption, 2-of-3 recovery, and rejection of a wrong password.

Run them with:

```bash
npm run test:crypto
```

### Production verification

The project checks:

- cryptographic smoke tests;
- TypeScript;
- ESLint;
- optimized Next.js production build;
- GitHub Pages static deployment.

The SLIP-39 TypeScript adapter now explicitly models the library's runtime byte interface so local operation and production builds use the same data representation.

### Backup verification workflow

Created shares can be passed directly into the recovery tab. The interface scrolls to the relevant result and allows the user to confirm that a threshold subset restores the original secret before distributing the shares.

### Contextual BIP-39 guidance

Technical explanations are shown next to the controls where they matter:

- BIP-39 Passphrase is identified as a separate value that is not part of the mnemonic;
- Wallet fingerprint is identified as a short fingerprint of the derived wallet seed;
- changing the mnemonic language produces a different mnemonic and therefore a different derived wallet seed.

## Remaining risks

### High: recovery must be tested independently

A backup should not be trusted only because the same application that created it can restore it. Before using real funds, verify SLIP-39 shares with an independent compatible implementation or supported hardware wallet.

### High: BIP-39 Passphrase is separate from the mnemonic

The optional BIP-39 Passphrase is not part of the 12 or 24 mnemonic words and is not automatically included in a SLIP-39 backup. Losing it makes the intended wallet inaccessible.

The SLIP-39 password and BIP-39 Passphrase are different values with different purposes.

### Medium: wordlist conversion changes the derived wallet

Converting the same entropy to another official BIP-39 wordlist preserves entropy but changes the mnemonic text. BIP-39 derives the wallet seed from that text, so the resulting wallet changes.

### Medium: external cryptographic dependencies

The project depends on third-party implementations including `slip39`, `secrets.js-grempe`, `scryptsy`, and `tweetnacl`. Smoke tests reduce accidental regressions but are not a cryptographic audit of those libraries.

Exact dependency pinning and a dedicated dependency review are planned during the next project revision.

### Medium: no browser end-to-end test yet

Current automated tests verify cryptographic primitives and the production build, but they do not yet drive the browser through the full workflow:

1. generate a seed;
2. create shares;
3. choose a threshold subset;
4. restore the secret;
5. compare the result.

A browser end-to-end suite should be added before version 1.0.

### Low: sensitive clipboard exposure

Copying a seed or share places it in the operating-system clipboard, where clipboard history and other applications may retain it. Clipboard handling should be reviewed during the next revision.

### Low: JavaScript memory lifecycle

The application clears React state when requested, but JavaScript and browser engines cannot guarantee immediate removal of every previous value from memory.

## UX review for v0.4.0

Implemented:

- separate Generation, Split, and Recovery tabs;
- shared state between workflows;
- contextual BIP-39 tooltips;
- Wallet fingerprint terminology;
- algorithm summaries and threshold metrics;
- smooth scrolling to shares, recovery input, and restored secret;
- responsive footer with release version;
- removal of the large technical warning above the main workflow.

## Release recommendation

Current status: suitable for continued development, testing, and carefully controlled use.

Before using with significant funds:

- verify recovery independently;
- test on a trusted offline machine;
- store passwords separately from shares;
- confirm that the chosen wallet supports the intended recovery format.

Before version 1.0:

- add independent SLIP-39 compatibility vectors;
- add browser end-to-end tests;
- review and pin cryptographic dependencies;
- complete the planned architecture, UX, accessibility, and security revision;
- publish a documented recovery procedure.
