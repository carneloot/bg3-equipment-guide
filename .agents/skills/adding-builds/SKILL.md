---
name: adding-builds
description: Adds or updates Baldur's Gate 3 builds in this repository. Use when creating a build, changing its equipment route, or adding equipment to a build.
---

# Adding builds

Keep build choices separate from shared equipment facts. A build selects item IDs; the equipment guidance file explains how every build obtains those items.

## Workflow

1. Read `src/builds/define-build.ts`, `src/builds/build-registry.ts`, and one existing `*.build.ts` file before editing. Follow their schema and registration pattern.
2. Add or update the build in `src/builds/`. Define all 12 levels, the final loadout, and the ordered equipment ID list. Update the build's `updated` date when its content changes.
3. Confirm every equipment ID exists in `src/data/generated/equipment.json`. Never hand-edit that generated file. If the upstream item is missing, run the equipment sync rather than inventing an ID.
4. For every item added to the build, inspect `src/data/equipment-guidance.ts`:
   - Reuse existing guidance when it already covers the item.
   - Add item-level guidance when the item has no entry. Include concise acquisition directions and any missable warning that changes whether the item can be obtained.
   - Add a `requirements` entry for every action required in an earlier act. Give it a unique kebab-case ID, the act in which the player must act, plain action text, and a BG3 Wiki source URL.
   - Keep universal item guidance here, never inside a build file. This prevents conflicting instructions when several builds use the same item.
5. Add a new build to `src/builds/build-registry.ts`. Do not add a second route or page implementation; the dynamic build page owns rendering.
6. Run `pnpm build`. If importer code or generated data changed, also run `pnpm test:equipment-sync`.
7. Do not start a development or preview server, create a portal, or perform browser or visual validation. Adding the build files and completing the checks above is sufficient.

## Guidance decisions

- Prefer the generated acquisition text when it is already specific and safe. Add curated directions only when they make the route clearer.
- Add a warning only for a missable timing, survival, outcome, or ordering condition. Do not use warnings for general tips.
- Treat BG3 Wiki quest links as evidence, not proof of a prerequisite. Quest outcomes, alternatives, and NPC survival conditions often live in prose; verify the page before encoding the edge.
- Requirements must precede the item's acquisition act. Same-act instructions belong in `directions` or `warning` instead.
