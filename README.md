# The Wayfarer's Ledger

An Astro-based Baldur's Gate 3 Ninja Assassin build guide and equipment checklist, organized by act.

The quick build guide condenses ItalianSpartacus's [Ultimate Ninja Assassin (Shadow Monk)](https://www.youtube.com/watch?v=6QOYYllhg_w) video into the choices needed while playing.

## Development

```sh
pnpm install
pnpm dev
```

Run `pnpm build` to type-check and build the static site.

## Deployment

Pushes to `main` deploy [bg3.carneloot.com](https://bg3.carneloot.com) through Alchemy in GitHub Actions after a successful build. The `production` environment needs the `OP_SERVICE_ACCOUNT_TOKEN` secret for a 1Password service account with access to:

- Vault: `Secrets`
- Item: `bg3-equipment-guide-github`
- Fields: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

The workflow verifies the production URL and restores the previous Worker deployment if the health check fails.

Location details and item images were checked against the linked [BG3 Wiki](https://bg3.wiki/) pages on September 14, 2026.

## Reference

[Original Amp project thread](https://ampcode.com/threads/T-01a09df8-b30e-7258-a1d0-8f9435121ecc)
