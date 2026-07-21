# Version

Current release: **v0.5.0**

Release date: **2026-07-22**

## Release summary

Version 0.5.0 is an architecture-focused release. It preserves the existing generation, splitting, verification, and recovery behavior while separating the application into maintainable workflow modules.

The release includes:

- dedicated generation, split, and recovery presentation components;
- separate scheme selector and share-results components;
- a shared domain model for workflow and scheme types;
- extracted browser helpers;
- official SLIP-39 compatibility-vector tests from the previous release cycle;
- TypeScript build-cache exclusion from Git.

## Stability

This is a pre-1.0 release intended for development, testing, and carefully controlled use.

The architecture is now easier to test and extend, but browser end-to-end tests, dependency pinning, accessibility review, and the final security review are still required before version 1.0.
