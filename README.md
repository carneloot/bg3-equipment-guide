# The Wayfarer's Ledger

An Astro-based collection of Baldur's Gate 3 build guides and equipment checklists.

## Add a build

Add one `*.build.ts` module to `src/builds/`. The registry discovers it automatically, publishes its `id` at `/builds/{id}/`, and adds it to the home page.

Copy `ninja-assassin.build.ts` as the starting template and wrap the definition with `defineBuild()`. Its Valibot schema checks every required field and infers the TypeScript type, including autocompletion for shared equipment IDs. The build also validates IDs, dates, ability scores, duplicate equipment, all 12 character levels, and loadout coverage when imported.

Equipment details and images are shared. Add an item once to `src/data/equipment.ts`, then reference its explicit ID from any build:

```ts
import { defineBuild } from "./define-build";

export default defineBuild({
  id: "storm-sorcerer",
  title: "Storm Sorcerer",
  // See ninja-assassin.build.ts for the remaining fields.
  loadout: [{ slot: "Main hand", item: "the-spellsparkler" }],
  equipment: ["the-spellsparkler", "protecty-sparkswall"],
});
```

Set `draft: true` to keep an unfinished build out of the index and production routes.

## Development

```sh
pnpm install
pnpm dev
```

Run `pnpm build` to type-check and build the static site.

## Equipment data

The site reads its equipment catalogue from `src/data/generated/equipment.json`. The catalogue imports
non-legacy equipment and weapons with acquisition data from [BG3 Wiki](https://bg3.wiki/), including
effects, attributes, acquisition details, act availability where it can be determined, and image URLs.

Refresh the catalogue locally:

```sh
pnpm sync:equipment
```

The **Refresh equipment catalogue** GitHub Actions workflow runs the same command, builds the site, and
commits the generated JSON to the selected branch when the data changes. Run the workflow manually from
the repository's **Actions** page.

BG3 Wiki content has reuse requirements. Keep the source links and review the
[BG3 Wiki copyright policy](https://bg3.wiki/wiki/bg3wiki:Copyrights) before redistributing the data.

## Deployment

Pushes to `main` deploy [bg3.carneloot.com](https://bg3.carneloot.com) through Alchemy in GitHub Actions after a successful build. The `production` environment needs the `OP_SERVICE_ACCOUNT_TOKEN` secret for a 1Password service account with access to:

- Vault: `Secrets`
- Item: `bg3-equipment-guide-github`
- Fields: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

The workflow verifies the production URL and restores the previous Worker deployment if the health check fails.

Location details and item images were checked against the linked [BG3 Wiki](https://bg3.wiki/) pages on September 14, 2026.

## Reference

[Original Amp project thread](https://ampcode.com/threads/T-01a09df8-b30e-7258-a1d0-8f9435121ecc)
