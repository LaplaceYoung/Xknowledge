# Security Policy

## Supported Scope

This repository currently includes:
- Browser extension source: `x-knowledge-extension/`
- Marketing site: `marketing/`

## Secret Handling Rules

- Never commit credentials, private keys, tokens, or certificates.
- Never commit packaging/signing outputs such as `dist.pem` and `dist.crx`.
- Keep local/internal operation docs outside tracked paths.

## Reporting A Security Issue

Please open a private security report through GitHub Security Advisories, or contact the maintainer directly if private reporting is unavailable.

## If A Secret Is Exposed

1. Revoke and rotate the secret immediately.
2. Remove the file from current branch and from git history.
3. Force-push rewritten history only after rotation is complete.
4. Verify with repository hygiene checks before release.
