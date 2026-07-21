# Seed Split Tool

Privacy-first browser application for generating, splitting, and recovering seed phrases and other secrets locally.

The application works entirely in the browser. Seed phrases, passwords, shares, and recovered secrets are not sent to a server.

## Features

- BIP-39 seed phrase generator
- Official BIP-39 wordlists
- Entropy fingerprint and Wallet fingerprint
- Optional BIP-39 Passphrase
- SLIP-39 split and recovery
- Password-protected Banana Split mode
- Generic Shamir Secret Sharing in the project-specific `SST1` format
- Configurable K-of-N recovery schemes
- Guided backup verification
- Print and text export
- Smooth navigation between generation, splitting, and recovery
- Static GitHub Pages deployment
- No accounts, analytics, cookies, or backend

## Workflows

The interface is divided into three tabs:

1. **Generation** — create a new BIP-39 mnemonic locally.
2. **Split seed** — split a mnemonic or another secret into K-of-N shares.
3. **Recover** — combine the required shares and restore the original secret.

Generated seed phrases remain available when moving to the split workflow. Created shares can also be passed directly to the recovery workflow for verification.

## Architecture

The application container coordinates shared workflow state and cryptographic operations. Generation, splitting, recovery, scheme selection, and share results are implemented as separate presentation components. Scheme metadata and browser helpers are isolated from the main React component.

Cryptographic adapters live under `src/features/seed-split/lib` and are kept separate from the interface.

## Supported schemes

### SLIP-39

Creates mnemonic shares from the entropy of a valid BIP-39 phrase. Any configured threshold subset can recover the entropy and recreate a BIP-39 mnemonic in the selected language.

Use independent compatible software or hardware to verify important backups before storing significant funds.

### Banana Split

Encrypts the secret with a required password and then splits the encrypted payload into K-of-N shares.

Recovery requires both:

- the configured number of shares;
- the correct password.

This implementation does not claim compatibility with unrelated tools named `BananaSplit.html`.

### Generic SST1

Splits arbitrary text using Shamir's Secret Sharing and stores each share in the project's versioned `SST1` container.

`SST1` is not BIP-39 or SLIP-39 and requires this project or another implementation of the same format for recovery.

## Local development

Requirements:

- Node.js 22 recommended
- npm

```bash
npm ci
npm run dev
```

Open:

```text
http://localhost:3200
```

## Validation

Run the complete verification pipeline:

```bash
npm run check
```

Run only the official SLIP-39 compatibility vectors:

```bash
npm run test:slip39-vectors
```

The complete pipeline includes:

- cryptographic round-trip smoke tests;
- official SLIP-39 compatibility vectors;
- TypeScript checks;
- ESLint;
- production build.

## Security notes

- Use the downloaded static build on a trusted, preferably offline computer.
- Never store all shares in the same place.
- Store BIP-39, SLIP-39, and Banana passwords separately from the shares.
- Verify recovery before relying on a backup.
- Clipboard history, browser extensions, screen capture tools, and printers may expose sensitive data.
- JavaScript cannot guarantee immediate removal of secrets from device memory.

See [`docs/AUDIT.md`](docs/AUDIT.md) for the current risk assessment.

## Project status

Current release: **v0.5.1**

The architecture revision is complete and its React refs lint regression is fixed. Dependency pinning, browser end-to-end tests, accessibility, offline recovery verification, and final security review remain planned before version 1.0.

See [`ROADMAP.md`](ROADMAP.md), [`VERSION.md`](VERSION.md), and [`CHANGELOG.md`](CHANGELOG.md).

## License

MIT
