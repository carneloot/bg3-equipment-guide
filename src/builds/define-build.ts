import * as v from "valibot";
import { acts, type EquipmentId } from "../data/equipment";

const abilityNames = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
const knownEquipmentIds = new Set<string>(acts.flatMap((act) => act.items.map((item) => item.id)));

const textSchema = v.pipe(v.string(), v.nonEmpty("Required"));
const abilitySchema = v.picklist(abilityNames);
const abilityScoreSchema = v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(30));
const equipmentIdSchema = v.custom<EquipmentId>(
  (value) => typeof value === "string" && knownEquipmentIds.has(value),
  "Unknown equipment ID",
);

export const buildSchema = v.pipe(
  v.strictObject({
    id: v.pipe(v.string(), v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase kebab-case ID")),
    title: textSchema,
    description: textSchema,
    heroDescription: textSchema,
    class: textSchema,
    levelSplit: textSchema,
    intro: textSchema,
    levelNote: textSchema,
    tags: v.pipe(v.array(textSchema), v.minLength(1)),
    source: v.optional(v.pipe(v.string(), v.url())),
    sourceLabel: v.optional(textSchema),
    updated: v.pipe(v.string(), v.isoDate()),
    draft: v.optional(v.boolean()),
    creation: v.pipe(
      v.array(v.strictObject({ label: textSchema, value: textSchema })),
      v.minLength(1),
    ),
    abilities: v.strictObject({
      STR: abilityScoreSchema,
      DEX: abilityScoreSchema,
      CON: abilityScoreSchema,
      INT: abilityScoreSchema,
      WIS: abilityScoreSchema,
      CHA: abilityScoreSchema,
    }),
    primaryAbility: abilitySchema,
    creationNotes: v.array(v.strictObject({ label: textSchema, text: textSchema })),
    combat: v.pipe(v.array(textSchema), v.minLength(1)),
    levels: v.pipe(
      v.array(
        v.strictObject({
          classLevel: textSchema,
          choice: v.optional(textSchema),
          emphasis: v.optional(textSchema),
          secondary: v.optional(v.boolean()),
        }),
      ),
      v.length(12, "Define all 12 character levels"),
    ),
    loadout: v.array(
      v.strictObject({
        slot: textSchema,
        item: equipmentIdSchema,
        displayName: v.optional(textSchema),
      }),
    ),
    equipment: v.pipe(v.array(equipmentIdSchema), v.minLength(1)),
  }),
  v.check(
    (build) => new Set(build.equipment).size === build.equipment.length,
    "Equipment IDs must not be repeated",
  ),
  v.check(
    (build) => build.loadout.every(({ item }) => build.equipment.includes(item)),
    "Every loadout item must appear in the equipment route",
  ),
);

export type Ability = (typeof abilityNames)[number];
export type BuildDefinition = v.InferOutput<typeof buildSchema>;

export const defineBuild = <const T extends BuildDefinition>(build: T): T => {
  v.parse(buildSchema, build);
  return build;
};
