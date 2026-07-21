# Seed Split Tool — project revision

Date: 2026-07-22  
Reviewed version: 0.4.0

## Result

The project is structurally sound for an offline browser utility and has a clear separation between UI and cryptographic adapters. The revision focused on hardening existing behavior rather than adding features.

## Changes applied

### SST1 validation

- Added strict validation for version, set ID, share number, threshold, total, checksum, and encoded data.
- Added practical range checks for all numeric fields.
- Added rejection of conflicting shares that use the same share number.
- Added checksum consistency validation across all supplied shares.
- Added safe handling for malformed Base64URL and JSON input.
- Added integer validation for split parameters.

### Banana Split validation

- Added structured JSON parsing errors.
- Added validation for version, title, threshold, share data, and nonce.
- Added nonce length validation before decryption.
- Added consistent Unicode normalization for passphrases.
- Added safer errors for malformed, mixed, or non-UTF-8 payloads.
- Added validation for split parameters and empty secrets.

### Application metadata

- Updated title and description to reflect BIP-39, SLIP-39, Banana Split, and SST1.
- Added application name, search keywords, and indexing metadata.

### Security documentation

- Replaced the generic template with a project-specific security policy.
- Documented the browser/offline threat model and responsible disclosure process.
- Added a checklist for using the tool with significant funds.

## Architecture assessment

### Good

- Cryptographic operations are isolated under `src/features/seed-split/lib`.
- The application is statically exportable and suitable for GitHub Pages.
- No server-side secret processing is required.
- CI checks cryptographic round trips, TypeScript, ESLint, production build, lockfile consistency, and critical dependency advisories.
- The UI clearly separates generation, splitting, and recovery workflows.

### Technical debt

- `seed-split-app.tsx` is still a large component and should eventually be split into workflow components and shared UI primitives.
- Browser end-to-end tests are not yet present.
- Current smoke tests exercise cryptographic primitives but do not directly import every production adapter.
- Clipboard handling has no optional timed clearing.
- Third-party cryptographic dependencies have not undergone an independent audit by this project.
- Accessibility should be checked with keyboard-only navigation and a screen reader.

## Recommended next priorities

1. Add Playwright recovery tests for all three schemes.
2. Add official or independently verified SLIP-39 vectors.
3. Split the main React component without changing behavior.
4. Add size limits for arbitrary secrets and recovery input.
5. Add optional clipboard clearing and explicit clipboard warnings.
6. Run Lighthouse and accessibility checks against the deployed build.
7. Pin and review cryptographic dependency versions before 1.0.0.

## Release assessment

Version 0.4.0 is appropriate for development, demonstrations, and controlled testing with disposable data. It should not yet be presented as independently audited wallet-security software. Recovery should always be tested before shares are distributed or the original secret is removed.
