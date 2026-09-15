import assert from "node:assert/strict";
import test from "node:test";

import { itemTitlesFromActPage, parseItemPage, wikitextToText } from "./sync-equipment.ts";

test("converts nested wiki markup to readable text", () => {
  assert.equal(
    wikitextToText(
      "* Sets {{Ability|Constitution}} to 23.\n* {{Advantage}} on [[Saving Throw]]s against [https://example.com spells].",
    ),
    "Sets Constitution to 23.\nAdvantage on Saving Throws against spells.",
  );
});

test("expands abbreviated saving throw templates", () => {
  assert.equal(wikitextToText("{{Saving Throw|str}}s +1"), "Strength Saving Throws +1");
});

test("parses nested templates without splitting their parameters", () => {
  const item = parseItemPage(
    {
      title: "Test Blade",
      revision: { revid: 42, timestamp: "2026-09-15T00:00:00Z" },
      content: `{{WeaponPage
| rarity = very rare
| type = Longswords
| damage = 1d8 + 2
| passives = First Passive, Second Passive
| special = {{SpellAction|Giant Form}}
| where to find = Looted from {{CharLink|Ansur}}
| where to find location = The Dragon's Sanctum
| where to find x = 633
| where to find y = -989
| image = Test Blade Icon.png
}}`,
    },
    "weapon",
  );

  assert.equal(item.name, "Test Blade");
  assert.equal(item.attributes.damage, "1d8 + 2");
  assert.deepEqual(item.effects.passives, ["First Passive", "Second Passive"]);
  assert.equal(item.effects.special.text, "Giant Form");
  assert.deepEqual(item.acquisition, [
    {
      description: "Looted from Ansur",
      location: "The Dragon's Sanctum",
      x: 633,
      y: -989,
    },
  ]);
});

test("keeps equals signs in parameter values", () => {
  const item = parseItemPage(
    {
      title: "Linked Amulet",
      revision: { revid: 7, timestamp: "2026-09-15T00:00:00Z" },
      content: `{{EquipmentPage
| type = Amulets
| description = See [https://example.com/items?id=12 this item].
}}`,
    },
    "equipment",
  );

  assert.equal(item.description.text, "See this item.");
});

test("extracts only the item link from each act table row", () => {
  const html = `<table><tr><th>Item</th></tr><tr>
    <td><a href="/wiki/Killer%27s_Sweetheart" title="Killer&#039;s Sweetheart"><img></a></td>
    <td><a href="/wiki/Critical_hit" title="Critical hit">Critical Hit</a></td>
  </tr><tr>
    <td><a href="/wiki/The_Dead_Shot" title="The Dead Shot"><img></a></td>
    <td>Effect</td>
  </tr></table>`;

  assert.deepEqual(itemTitlesFromActPage(html), ["Killer's Sweetheart", "The Dead Shot"]);
});
