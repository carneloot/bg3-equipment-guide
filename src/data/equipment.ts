import catalogue from "./generated/equipment.json";

type ImportedEquipmentItem = (typeof catalogue.items)[number];

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  location: string;
  directions: string;
  effects: string;
  attributes: string;
  image?: string;
  source: string;
}

export interface Act {
  id: 1 | 2 | 3;
  title: string;
  description: string;
  items: readonly EquipmentItem[];
}

const actDetails: readonly Omit<Act, "items">[] = [
  {
    id: 1,
    title: "The road to Moonrise",
    description: "Prologue, Wilderness, Underdark, and the Mountain Pass",
  },
  {
    id: 2,
    title: "Across the shadowlands",
    description: "Last Light Inn, Moonrise Towers, and the Gauntlet of Shar",
  },
  {
    id: 3,
    title: "The city of Baldur's Gate",
    description: "Rivington, the Lower City, and the places beneath",
  },
];

const singularTypes: Record<string, string> = {
  Amulets: "Amulet",
  Battleaxes: "Battleaxe",
  Clubs: "Club",
  Daggers: "Dagger",
  Flails: "Flail",
  Glaives: "Glaive",
  Greataxes: "Greataxe",
  Greatclubs: "Greatclub",
  Greatswords: "Greatsword",
  Halberds: "Halberd",
  Handaxes: "Handaxe",
  Javelins: "Javelin",
  Longbows: "Longbow",
  Longswords: "Longsword",
  Maces: "Mace",
  Mauls: "Maul",
  Morningstars: "Morningstar",
  Pikes: "Pike",
  Quarterstaves: "Quarterstaff",
  Rapiers: "Rapier",
  Rings: "Ring",
  Scimitars: "Scimitar",
  Shortbows: "Shortbow",
  Shortswords: "Shortsword",
  Sickles: "Sickle",
  Spears: "Spear",
  Tridents: "Trident",
  Warhammers: "Warhammer",
};

const compact = (values: readonly (string | null | undefined)[]) => [
  ...new Set(values.filter((value): value is string => Boolean(value))),
];

const formatLocation = (item: ImportedEquipmentItem) => {
  const acquisition = item.acquisition[0];
  if (!acquisition) return "See BG3 Wiki";

  const coordinates =
    acquisition.x !== null && acquisition.y !== null ? `X: ${acquisition.x}, Y: ${acquisition.y}` : null;
  return compact([acquisition.location, coordinates]).join(" · ") || "See BG3 Wiki";
};

const formatAttributes = (item: ImportedEquipmentItem) => {
  const { armourClass, armourClassBonus, enchantment, damage, damageType } = item.attributes;
  return compact([
    armourClass !== null ? `AC ${armourClass}` : null,
    armourClassBonus !== null ? `AC ${armourClassBonus}` : null,
    enchantment ? `Enchantment ${enchantment}` : null,
    damage ? `${damage}${damageType ? ` ${damageType}` : ""}` : null,
  ]).join(" · ");
};

const formatEffects = (item: ImportedEquipmentItem) =>
  compact([
    ...item.effects.passives,
    ...item.effects.mainHandPassives.map((effect) => `${effect} (main hand)`),
    ...item.effects.offHandPassives.map((effect) => `${effect} (off-hand)`),
    item.effects.special?.text,
    item.description.text,
  ]).join("\n");

const equipment = catalogue.items.flatMap((item): Array<EquipmentItem & { act: Act["id"] }> => {
  const act = item.availableInActs.find((candidate): candidate is Act["id"] =>
    candidate === 1 || candidate === 2 || candidate === 3
  );
  if (act === undefined) return [];

  return [{
    id: item.id,
    act,
    name: item.name,
    type: singularTypes[item.type ?? ""] ?? item.type ?? "Equipment",
    rarity: item.rarity ?? "unknown",
    location: formatLocation(item),
    directions: compact(item.acquisition.map((acquisition) => acquisition.description)).join("\n"),
    effects: formatEffects(item),
    attributes: formatAttributes(item),
    image: item.image?.url ?? undefined,
    source: item.source.page,
  }];
});

export const acts: readonly Act[] = actDetails.map((act) => ({
  ...act,
  items: equipment.filter((item) => item.act === act.id),
}));

export type EquipmentId = string;

export const getActsForEquipment = (equipmentIds: readonly EquipmentId[]): Act[] => {
  const selectedIds = new Set(equipmentIds);
  const knownIds = new Set(equipment.map((item) => item.id));
  const unknownIds = equipmentIds.filter((id) => !knownIds.has(id));

  if (unknownIds.length > 0) {
    throw new Error(`Unknown equipment IDs: ${unknownIds.join(", ")}`);
  }

  return acts
    .map((act) => ({ ...act, items: act.items.filter((item) => selectedIds.has(item.id)) }))
    .filter((act) => act.items.length > 0);
};
