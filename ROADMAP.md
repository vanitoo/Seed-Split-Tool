# Roadmap

## Completed

### Core secret sharing

- [x] Generic Shamir Secret Sharing
- [x] Versioned SST1 share container
- [x] K-of-N configuration
- [x] Duplicate and mixed-set validation
- [x] Recovery verification

### BIP-39

- [x] Local mnemonic generation
- [x] Official wordlists
- [x] Entropy conversion
- [x] BIP-39 Passphrase support
- [x] Entropy fingerprint
- [x] Wallet fingerprint

### Additional schemes

- [x] SLIP-39 split and recovery
- [x] Banana encrypted split and recovery

### User experience

- [x] Generation tab
- [x] Split tab
- [x] Recovery tab
- [x] Shared workflow state
- [x] Contextual tooltips
- [x] Algorithm information panels
- [x] Smooth scrolling between workflow results
- [x] Responsive interface
- [x] Print and text export

### Delivery and quality

- [x] Static GitHub Pages deployment
- [x] Cryptographic round-trip smoke tests
- [x] TypeScript, ESLint, and production-build checks
- [x] Initial security audit

## Next stage: project revision

- [ ] Review application architecture and component boundaries
- [ ] Remove dead code and normalize naming
- [ ] Consolidate CSS and design tokens
- [ ] Review dependencies and pin cryptographic packages where appropriate
- [ ] Add independent SLIP-39 compatibility vectors
- [ ] Add browser end-to-end tests
- [ ] Review mobile layout and accessibility
- [ ] Run Lighthouse and performance checks
- [ ] Review clipboard handling and sensitive-data lifecycle
- [ ] Verify offline recovery procedure on a clean machine

## Before v1.0.0

- [ ] Complete the revision stage
- [ ] Publish a documented recovery procedure
- [ ] Add a supported-browser matrix
- [ ] Add release and upgrade guidance
- [ ] Complete final security and UX review
