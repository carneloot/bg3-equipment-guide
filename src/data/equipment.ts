import catalogue from "./generated/equipment.json";
import { equipmentGuidance } from "./equipment-guidance";

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
  warning?: string;
  image?: string;
  source: string;
}

export type ActId = 1 | 2 | 3;

export interface EquipmentRouteRequirement {
  id: string;
  act: ActId;
  action: string;
  source: string;
}

export interface EquipmentGuidance {
  directions?: string;
  warning?: string;
  requirements?: readonly EquipmentRouteRequirement[];
}

export interface EquipmentRequirement extends EquipmentRouteRequirement {
  itemId: string;
  itemName: string;
  itemType: string;
  itemRarity: string;
  itemImage?: string;
  obtainInAct: ActId;
}

export interface Act {
  id: ActId;
  title: string;
  description: string;
  items: readonly EquipmentItem[];
  requirements: readonly EquipmentRequirement[];
}

const actDetails: readonly Omit<Act, "items" | "requirements">[] = [
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
  requirements: [],
}));

export type EquipmentId = string;

const knownIds = new Set(equipment.map((item) => item.id));
const unknownGuidanceIds = Object.keys(equipmentGuidance).filter((id) => !knownIds.has(id));
const requirementIds = Object.values(equipmentGuidance).flatMap(({ requirements = [] }) =>
  requirements.map(({ id }) => id),
);
const invalidRequirements = Object.entries(equipmentGuidance).flatMap(([id, { requirements = [] }]) => {
  const item = equipment.find((candidate) => candidate.id === id);
  return requirements.filter(({ act }) => item !== undefined && act >= item.act).map(({ id }) => id);
});

if (unknownGuidanceIds.length > 0) {
  throw new Error(`Guidance references unknown equipment IDs: ${unknownGuidanceIds.join(", ")}`);
}
if (new Set(requirementIds).size !== requirementIds.length) {
  throw new Error("Equipment requirement IDs must not be repeated");
}
if (invalidRequirements.length > 0) {
  throw new Error(`Equipment requirements must precede acquisition: ${invalidRequirements.join(", ")}`);
}

export const getActsForEquipment = (equipmentIds: readonly EquipmentId[]): Act[] => {
  const selectedIds = new Set(equipmentIds);
  const knownIds = new Set(equipment.map((item) => item.id));
  const unknownIds = equipmentIds.filter((id) => !knownIds.has(id));

  if (unknownIds.length > 0) {
    throw new Error(`Unknown equipment IDs: ${unknownIds.join(", ")}`);
  }

  const requirements = equipmentIds.flatMap((id): EquipmentRequirement[] => {
    const item = equipment.find((candidate) => candidate.id === id);
    if (!item) return [];

    return (equipmentGuidance[id]?.requirements ?? []).map((requirement) => ({
      ...requirement,
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      itemRarity: item.rarity,
      itemImage: item.image,
      obtainInAct: item.act,
    }));
  });

  return acts
    .map((act) => ({
      ...act,
      items: act.items
        .filter((item) => selectedIds.has(item.id))
        .map((item) => {
          const guide = equipmentGuidance[item.id];
          return {
            ...item,
            directions: guide?.directions ?? item.directions,
            warning: guide?.warning,
          };
        }),
      requirements: requirements.filter((requirement) => requirement.act === act.id),
    }))
    .filter((act) => act.items.length > 0 || act.requirements.length > 0);
};
