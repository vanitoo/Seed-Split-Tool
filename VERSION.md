# Version

Current release: **v0.5.1**

Release date: **2026-07-22**

## Release summary

Version 0.5.1 is a corrective release for the architecture refactor introduced in 0.5.0.

The release includes:

- destructured props in workflow and share-result components;
- compatibility with the React refs ESLint rule used by Next.js 16;
- restored clean lint validation after the component split;
- unchanged cryptographic behavior and user workflows;
- continued exclusion of local TypeScript build caches from Git.

## Stability

This is a pre-1.0 release intended for development, testing, and carefully controlled use.

The architecture is easier to test and extend, but browser end-to-end tests, dependency pinning, accessibility review, and the final security review are still required before version 1.0.
