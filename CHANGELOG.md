# Changelog

All notable project changes are documented in this file.

## 0.4.0 - 2026-07-22

### Added

- Dedicated Generation, Split seed, and Recover tabs.
- Local BIP-39 mnemonic generator with official wordlists.
- Entropy fingerprint and Wallet fingerprint indicators.
- Optional BIP-39 Passphrase field with contextual help.
- SLIP-39 split and recovery workflow.
- Password-protected Banana Split workflow.
- Algorithm information panels with threshold and total-share summaries.
- Smooth scrolling to generated shares, recovery form, and recovered secret.
- Application version in the footer.
- Official SLIP-39 compatibility-vector tests.

### Changed

- Reworked the interface around three user workflows instead of one long form.
- Improved terminology and contextual explanations.
- Moved technical BIP-39 explanations into tooltips.
- Improved responsive layout and recovery verification flow.
- Updated the SLIP-39 adapter so production TypeScript builds match the runtime byte API.
- Rewritten project documentation to match the implemented features.

### Removed

- Removed the large technical BIP-39 warning from the top of the application.
- Removed outdated documentation that described SLIP-39 and Banana Split as disabled.
- Removed unused starter-template AppHeader, Button, and formatBytes code.

## 0.3.0 - 2026-07-21

- Added BIP-39 helper functions and language conversion.
- Added SLIP-39 and Banana Split implementations.
- Added cryptographic smoke tests and GitHub Actions validation.
- Added the initial security audit document.

## 0.2.0 - 2026-07-21

- Added an algorithm registry and scheme selector.
- Prepared the interface for multiple secret-sharing formats.

## 0.1.0 - 2026-07-21

- Replaced the browser-tool demo with Seed Split Tool.
- Added local Shamir K-of-N splitting over GF(256).
- Added the versioned SST1 share envelope with set ID and SHA-256 checksum.
- Added recovery, duplicate handling, mixed-set validation, backup verification, printing, and text downloads.
- Added a responsive privacy-first interface.
