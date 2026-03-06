# Repo Optimization Guide

This repository contains source code and many media/reference assets. To keep development fast and cloning practical, use this policy.

## Current policy

- Keep code, configs, and small static assets in Git.
- Keep build outputs out of Git (`dist/`, docs build output).
- Keep secrets out of Git (`.env`).
- Review large files before committing.

## Audit command

Run:

```bash
npm run repo:audit
```

This reports:

- Top largest tracked files
- Total tracked size
- `attached_assets` footprint
- Which `attached_assets` files are directly imported by client code

## CI guard

CI runs:

```bash
npm run repo:audit:ci
```

Default thresholds:

- Max single tracked file: `20 MB`
- Max total `attached_assets`: `300 MB`

You can override in CI/local:

- `MAX_FILE_MB`
- `MAX_ATTACHED_ASSETS_MB`

## Recommended long-term structure

- Keep only production-used media in `attached_assets`.
- Move archival/reference files to external storage (Object Storage, Drive, release assets).
- Keep DB dumps outside main repo or store compressed snapshots in a dedicated backup repo.

## Safe cleanup checklist

1. Run `npm run repo:audit`.
2. Review candidate non-imported assets.
3. Move candidates to archive storage first.
4. Test critical pages locally (`/wytlife`, `/qr-generator`, module builder, engine pages).
5. Then remove from repo in controlled batches.
