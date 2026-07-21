# Seed Split Tool

Privacy-first browser utility for splitting seed phrases, passwords, and recovery secrets with Shamir's Secret Sharing.

## Current status

Version 0.2 adds a single scheme selector:

- **SLIP-39**: visible but disabled until the adapter passes official SLIP-0039 test vectors.
- **Banana Split**: visible but disabled until compatibility with `BananaSplit.html` is verified.
- **Generic Secret Sharing**: active implementation using the application's own `SST1` container.

`SST1` is not BIP39 or SLIP-39. Similar mathematics does not make formats compatible.

## Features

- Fully local processing with Web Crypto randomness
- Configurable K-of-N schemes
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

Open `http://localhost:3200`.

## Validate

```bash
npm run check
```

## Security

Use the downloaded static build on a trusted, preferably offline computer. JavaScript cannot guarantee complete removal of secrets from device memory. Do not store all shares together, photograph the entire set, or use an untrusted printer.

## License

MIT
