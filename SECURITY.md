# Security policy

Seed Split Tool processes wallet recovery material and other sensitive secrets. Security reports are welcome and should not be published as a public issue before a fix is available.

## Supported version

The current `main` branch and the latest published release are supported.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting for this repository when available. Include:

- affected version or commit;
- reproduction steps;
- expected and actual behavior;
- security impact;
- a minimal proof of concept that does not contain real seed phrases or private keys.

Do not include live wallet credentials, real recovery phrases, passwords, or private keys in a report.

## Security model

The application is designed to run entirely in the browser. It does not intentionally transmit entered secrets to a server. A static offline copy on a trusted computer is safer than processing valuable recovery material in an everyday online browser session.

The following are outside the application's control:

- compromised operating systems or browsers;
- malicious browser extensions;
- clipboard history and clipboard-monitoring software;
- screen capture and keylogging software;
- untrusted printers;
- insecure storage of generated shares and passphrases.

## Before protecting significant funds

1. Download and inspect a known release.
2. Run it on a trusted, preferably offline computer.
3. Test recovery using disposable test data.
4. For SLIP-39, verify recovery with an independent compatible implementation.
5. Keep passphrases separate from the generated shares.
6. Never store the complete set of shares in one location.

## Cryptographic review status

The project includes automated round-trip checks, validation of share containers, dependency checks, and production-build checks. These measures catch regressions but are not a formal third-party cryptographic audit.
