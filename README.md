# Seed Split Tool

Privacy-first browser utility for splitting seed phrases, passwords, and recovery secrets with Shamir's Secret Sharing.

## Current status

Version 0.1 implements the local `SST1` format. It is **not** BIP39 or SLIP-39 compatible. Keep a copy of this application with your shares. SLIP-39 import/export is planned as a separate standards adapter.

## Features

- Fully local processing with Web Crypto randomness
- Configurable K-of-N schemes (2–16 shares)
- Integrity checksum and set identifiers
- Duplicate and mixed-set detection
- Guided backup verification
- Print and text export
- Static GitHub Pages build
- No accounts, analytics, cookies, or server

## Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm run check
```

## Security

Use the downloaded static build on a trusted, preferably offline computer. JavaScript cannot guarantee complete removal of secrets from device memory. Do not store all shares together, photograph the entire set, or use an untrusted printer.

## License

MIT
