import { NodeFileSystem, NodePath, NodeRuntime } from "@effect/platform-node";
import { Effect, FileSystem, flow, Path, Schedule, Schema } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "effect/unstable/http";

type ItemKind = "equipment" | "weapon";
type Parameters = Record<string, string>;

interface SourcePage {
  title: string;
  revision: { revid: number; timestamp: string };
  content: string;
}

const NullableString = Schema.NullOr(Schema.String);
const NullableScalar = Schema.NullOr(Schema.Union([Schema.String, Schema.Number, Schema.Boolean]));

const AcquisitionSchema = Schema.Struct({
  description: NullableString,
  location: NullableString,
  x: Schema.NullOr(Schema.Union([Schema.Number, Schema.String])),
  y: Schema.NullOr(Schema.Union([Schema.Number, Schema.String])),
});

interface Acquisition extends Schema.Schema.Type<typeof AcquisitionSchema> {}

const ImportedItemSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  kind: Schema.Literals(["equipment", "weapon"]),
  type: NullableString,
  rarity: NullableString,
  legacy: NullableString,
  availableInActs: Schema.Array(Schema.Number),
  game: Schema.Record(Schema.String, NullableString),
  description: Schema.Struct({ text: NullableString, wikitext: NullableString }),
  effects: Schema.Struct({
    passives: Schema.Array(Schema.String),
    mainHandPassives: Schema.Array(Schema.String),
    offHandPassives: Schema.Array(Schema.String),
    weaponActions: Schema.Array(Schema.String),
    specialWeaponActions: Schema.Array(Schema.String),
    special: Schema.NullOr(Schema.Struct({ text: Schema.String, wikitext: Schema.String })),
  }),
  attributes: Schema.Record(Schema.String, NullableScalar),
  acquisition: Schema.Array(AcquisitionSchema),
  image: Schema.NullOr(Schema.Struct({ name: Schema.String, url: NullableString })),
  source: Schema.Struct({ page: Schema.String, revisionId: Schema.Number, revisedAt: Schema.String }),
});

interface ImportedItem extends Schema.Schema.Type<typeof ImportedItemSchema> {}

const CatalogueSchema = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  source: Schema.Struct({
    name: Schema.String,
    url: Schema.String,
    copyright: Schema.String,
    itemCounts: Schema.Struct({ equipment: Schema.Number, weapons: Schema.Number }),
    upstreamPageCounts: Schema.Record(Schema.String, Schema.Number),
  }),
  items: Schema.Array(ImportedItemSchema),
});

const CatalogueJsonSchema = Schema.fromJsonString(CatalogueSchema, { space: 2 });

const API_URL = "https://bg3.wiki/w/api.php";
const OUTPUT_PATH = new URL("../src/data/generated/equipment.json", import.meta.url);
const USER_AGENT =
  "WayfarersLedgerEquipmentSync/1.0 (https://github.com/carneloot/bg3-equipment-guide)";
const PAGE_BATCH_SIZE = 50;
const ACT_NAMES = ["One", "Two", "Three"] as const;
const ABILITY_NAMES: Record<string, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const RevisionSchema = Schema.Struct({
  revid: Schema.Number,
  timestamp: Schema.String,
  slots: Schema.Struct({ main: Schema.Struct({ content: Schema.String }) }),
});

const ApiPageSchema = Schema.Struct({
  title: Schema.String,
  revisions: Schema.optionalKey(Schema.Array(RevisionSchema)),
  imageinfo: Schema.optionalKey(Schema.Array(Schema.Struct({ url: Schema.String }))),
});

const ApiResponseSchema = Schema.Struct({
  continue: Schema.optionalKey(
    Schema.Struct({
      eicontinue: Schema.optionalKey(Schema.String),
      cmcontinue: Schema.optionalKey(Schema.String),
    }),
  ),
  query: Schema.optionalKey(
    Schema.Struct({
      embeddedin: Schema.optionalKey(Schema.Array(Schema.Struct({ title: Schema.String }))),
      categorymembers: Schema.optionalKey(Schema.Array(Schema.Struct({ title: Schema.String }))),
      pages: Schema.optionalKey(Schema.Array(ApiPageSchema)),
      redirects: Schema.optionalKey(
        Schema.Array(Schema.Struct({ from: Schema.String, to: Schema.String })),
      ),
    }),
  ),
  parse: Schema.optionalKey(Schema.Struct({ text: Schema.String })),
  error: Schema.optionalKey(Schema.Struct({ code: Schema.String, info: Schema.String })),
});

type ApiResponse = typeof ApiResponseSchema.Type;

class WikiRequestError extends Schema.TaggedError<WikiRequestError>()("WikiRequestError", {
  operation: Schema.String,
  cause: Schema.Defect(),
}) {}

class WikiResponseError extends Schema.TaggedError<WikiResponseError>()("WikiResponseError", {
  code: Schema.String,
  message: Schema.String,
}) {}

class CatalogueError extends Schema.TaggedError<CatalogueError>()("CatalogueError", {
  message: Schema.String,
}) {}

const sources: { kind: ItemKind; template: string; minimum: number }[] = [
  { kind: "equipment", template: "Template:Equipment_page", minimum: 800 },
  { kind: "weapon", template: "Template:Weapon_page", minimum: 400 },
];

const makeApiRequest = Effect.gen(function* () {
  const client = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(flow(HttpClientRequest.acceptJson, HttpClientRequest.setHeader("user-agent", USER_AGENT))),
    HttpClient.filterStatusOk,
    HttpClient.retryTransient({ schedule: Schedule.exponential(500), times: 3 }),
  );

  return Effect.fn("apiRequest")(
    function* (parameters: Parameters): Effect.fn.Return<ApiResponse, WikiRequestError | WikiResponseError> {
      const request = HttpClientRequest.post(API_URL).pipe(
        HttpClientRequest.bodyUrlParams({
          action: "query",
          format: "json",
          formatversion: "2",
          maxlag: "5",
          ...parameters,
        }),
      );
      const result = yield* client.execute(request).pipe(
        Effect.flatMap(HttpClientResponse.schemaBodyJson(ApiResponseSchema)),
        Effect.mapError((cause) => new WikiRequestError({ operation: "apiRequest", cause })),
      );

      if (result.error) {
        return yield* new WikiResponseError({ code: result.error.code, message: result.error.info });
      }
      return result;
    },
    Effect.retry({
      while: (error) => error._tag === "WikiResponseError" && error.code === "maxlag",
      schedule: Schedule.exponential(2_000),
      times: 3,
    }),
  );
});

type ApiRequest = Effect.Success<typeof makeApiRequest>;

const listTemplatePages = Effect.fn("listTemplatePages")(function* (apiRequest: ApiRequest, template: string) {
  const titles: string[] = [];
  let continuation: string | undefined;

  do {
    const result = yield* apiRequest({
      list: "embeddedin",
      eititle: template,
      einamespace: "0",
      eilimit: "max",
      ...(continuation ? { eicontinue: continuation } : {}),
    });

    if (!result.query?.embeddedin) {
      return yield* new CatalogueError({ message: `No embedded pages returned for ${template}` });
    }
    titles.push(...result.query.embeddedin.map((page) => page.title));
    continuation = result.continue?.eicontinue;
  } while (continuation);

  return [...new Set(titles)].sort((left, right) => left.localeCompare(right, "en"));
});

function chunks<T>(values: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

const fetchPageSources = Effect.fn("fetchPageSources")(function* (apiRequest: ApiRequest, titles: string[]) {
  const pages: SourcePage[] = [];

  for (const batch of chunks(titles, PAGE_BATCH_SIZE)) {
    const result = yield* apiRequest({
      prop: "revisions",
      rvprop: "ids|timestamp|content",
      rvslots: "main",
      titles: batch.join("|"),
    });

    if (!result.query?.pages) {
      return yield* new CatalogueError({ message: "No pages returned for a source batch" });
    }
    for (const page of result.query.pages) {
      const revision = page.revisions?.[0];
      const content = revision?.slots?.main?.content;
      if (!revision || !content) {
        return yield* new CatalogueError({ message: `No source returned for ${page.title}` });
      }
      pages.push({ title: page.title, revision: { revid: revision.revid, timestamp: revision.timestamp }, content });
    }
  }

  return pages;
});

function findTemplate(source: string, names: string[]): string | null {
  const lowerSource = source.toLowerCase();
  const start = names
    .map((name) => lowerSource.indexOf(`{{${name.toLowerCase()}`))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (start === undefined) return null;

  let depth = 0;
  for (let index = start; index < source.length - 1; index += 1) {
    const pair = source.slice(index, index + 2);
    if (pair === "{{") {
      depth += 1;
      index += 1;
    } else if (pair === "}}") {
      depth -= 1;
      index += 1;
      if (depth === 0) return source.slice(start + 2, index - 1);
    }
  }

  throw new Error("Unclosed item template");
}

function splitTopLevel(value: string, separator = "|"): string[] {
  const parts: string[] = [];
  let braces = 0;
  let brackets = 0;
  let start = 0;

  for (let index = 0; index < value.length; index += 1) {
    const pair = value.slice(index, index + 2);
    if (pair === "{{") {
      braces += 1;
      index += 1;
    } else if (pair === "}}") {
      braces -= 1;
      index += 1;
    } else if (pair === "[[") {
      brackets += 1;
      index += 1;
    } else if (pair === "]]" ) {
      brackets -= 1;
      index += 1;
    } else if (value[index] === separator && braces === 0 && brackets === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }

  parts.push(value.slice(start));
  return parts;
}

function parseTemplateParameters(source: string, kind: ItemKind): Parameters {
  const template = findTemplate(
    source,
    kind === "weapon" ? ["WeaponPage", "Weapon page"] : ["EquipmentPage", "Equipment page"],
  );
  if (!template) throw new Error(`Item template not found`);

  const [, ...segments] = splitTopLevel(template);
  const parameters: Parameters = {};

  for (const segment of segments) {
    const equals = splitTopLevel(segment, "=");
    if (equals.length < 2) continue;
    const key = equals.shift().trim().toLowerCase().replace(/[_\s]+/g, " ");
    parameters[key] = equals.join("=").trim();
  }

  return parameters;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function wikitextToText(wikitext = ""): string {
  let text = wikitext
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref\b[^>]*>[\s\S]*?<\/ref\s*>/gi, "")
    .replace(/<ref\b[^>]*\/\s*>/gi, "");

  let previous;
  do {
    previous = text;
    text = text.replace(/\{\{([^{}]*)\}\}/g, (_, contents) => {
      const [name, ...parameters] = splitTopLevel(contents);
      const positional = parameters
        .filter((parameter) => !parameter.includes("="))
        .map((parameter) => parameter.trim())
        .filter(Boolean);
      if (name.trim().toLowerCase() === "saving throw" && positional[0]) {
        return `${ABILITY_NAMES[positional[0].toLowerCase()] ?? positional[0]} Saving Throw`;
      }
      return positional.length > 0 ? positional.join(" ") : name.trim();
    });
  } while (text !== previous && text.includes("{{"));

  text = text
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]#]+)(?:#[^\]]*)?\]\]/g, "$1")
    .replace(/\[(?:https?:\/\/\S+)\s+([^\]]+)\]/g, "$1")
    .replace(/\[(?:https?:\/\/[^\]]+)\]/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/'{2,}/g, "")
    .replace(/^\s*[*#:;]+\s?/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return decodeEntities(text);
}

export function itemTitlesFromActPage(html: string): string[] {
  const titles: string[] = [];

  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const firstCell = row[1].match(/<td\b[^>]*>([\s\S]*?)<\/td>/i)?.[1];
    const title = firstCell?.match(/<a\b[^>]*\btitle="([^"]+)"/i)?.[1];
    if (title) titles.push(decodeEntities(title));
  }

  return [...new Set(titles)];
}

const fetchActAssignments = Effect.fn("fetchActAssignments")(function* (apiRequest: ApiRequest) {
  const assignments = new Map<string, number[]>();

  for (const [index, name] of ACT_NAMES.entries()) {
    const act = index + 1;
    const result = yield* apiRequest({
      action: "parse",
      page: `List of magic items in Act ${name}`,
      prop: "text",
    });

    if (!result.parse) {
      return yield* new CatalogueError({ message: `No parsed Act ${name} list returned` });
    }
    for (const title of itemTitlesFromActPage(result.parse.text)) {
      assignments.set(title, [...(assignments.get(title) ?? []), act]);
    }
  }

  return assignments;
});

const fetchActLocations = Effect.fn("fetchActLocations")(function* (apiRequest: ApiRequest) {
  const locations = new Map<string, number[]>();

  for (const [index, name] of ACT_NAMES.entries()) {
    const act = index + 1;
    let continuation: string | undefined;

    do {
      const result = yield* apiRequest({
        list: "categorymembers",
        cmtitle: `Category:Act ${name} Locations`,
        cmnamespace: "0",
        cmlimit: "max",
        ...(continuation ? { cmcontinue: continuation } : {}),
      });
      if (!result.query?.categorymembers) {
        return yield* new CatalogueError({ message: `No Act ${name} locations returned` });
      }

      for (const { title } of result.query.categorymembers) {
        const normalized = title.toLocaleLowerCase("en");
        locations.set(normalized, [...(locations.get(normalized) ?? []), act]);
      }
      continuation = result.continue?.cmcontinue;
    } while (continuation);
  }

  return locations;
});

function actsFromAcquisition(item: ImportedItem, locations: Map<string, number[]>): number[] {
  const haystacks = item.acquisition.flatMap(({ description, location }) =>
    [location, description].filter((entry): entry is string => entry !== null).map((entry) => entry.toLocaleLowerCase("en")),
  );
  const acts = new Set<number>();

  for (const [location, locationActs] of [...locations].sort(([left], [right]) => right.length - left.length)) {
    if (haystacks.some((value) => value === location || value.includes(location))) {
      for (const act of locationActs) acts.add(act);
    }
  }

  return [...acts].sort();
}

function value(parameters: Parameters, key: string): string | null {
  return parameters[key] || null;
}

function numberValue(parameters: Parameters, key: string): number | string | null {
  const raw = value(parameters, key);
  if (raw === null || !/^-?\d+(?:\.\d+)?$/.test(raw)) return raw;
  return Number(raw);
}

function booleanValue(parameters: Parameters, key: string): boolean | null {
  const raw = value(parameters, key)?.toLowerCase();
  if (raw === "yes") return true;
  if (raw === "no") return false;
  return null;
}

function textValue(parameters: Parameters, key: string): string | null {
  const raw = value(parameters, key);
  return raw === null ? null : wikitextToText(raw);
}

function commaSeparated(parameters: Parameters, key: string): string[] {
  const raw = textValue(parameters, key);
  return raw ? raw.split(",").map((entry) => entry.trim()).filter(Boolean) : [];
}

function acquisitionEntries(parameters: Parameters): Acquisition[] {
  const entries: Acquisition[] = [];

  for (let index = 1; index <= 10; index += 1) {
    const suffix = index === 1 ? "" : String(index);
    const description = textValue(parameters, `where to find${suffix}`);
    const location =
      textValue(parameters, `where to find${suffix} location`) ??
      textValue(parameters, `where to find location${suffix}`);
    const x =
      numberValue(parameters, `where to find${suffix} x`) ??
      numberValue(parameters, `where to find x${suffix}`);
    const y =
      numberValue(parameters, `where to find${suffix} y`) ??
      numberValue(parameters, `where to find y${suffix}`);

    if (description || location || x !== null || y !== null) {
      entries.push({ description, location, x, y });
    }
  }

  return entries;
}

function wikiPageUrl(title: string): string {
  return `https://bg3.wiki/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

function itemId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function parseItemPage(page: SourcePage, kind: ItemKind): ImportedItem {
  const parameters = parseTemplateParameters(page.content, kind);
  const imageName = textValue(parameters, "image");
  const specialWikitext = value(parameters, "special");

  return {
    id: itemId(page.title),
    name: textValue(parameters, "name") ?? page.title,
    kind,
    type: textValue(parameters, "type"),
    rarity: textValue(parameters, "rarity")?.toLowerCase() ?? null,
    legacy: textValue(parameters, "legacy"),
    availableInActs: [],
    game: {
      uid: textValue(parameters, "uid"),
      uuid: textValue(parameters, "uuid"),
      stats: textValue(parameters, "stats"),
    },
    description: {
      text: textValue(parameters, "description"),
      wikitext: value(parameters, "description"),
    },
    effects: {
      passives: commaSeparated(parameters, "passives"),
      mainHandPassives: commaSeparated(parameters, "passives main hand"),
      offHandPassives: commaSeparated(parameters, "passives off hand"),
      weaponActions: commaSeparated(parameters, "weapon actions"),
      specialWeaponActions: commaSeparated(parameters, "special weapon actions"),
      special: specialWikitext
        ? { text: wikitextToText(specialWikitext), wikitext: specialWikitext }
        : null,
    },
    attributes: {
      proficiency: textValue(parameters, "proficiency"),
      armourClass: numberValue(parameters, "armour class"),
      armourClassBonus: numberValue(parameters, "armour class bonus"),
      stealthDisadvantage: booleanValue(parameters, "stealth disadvantage"),
      category: textValue(parameters, "category"),
      handedness: textValue(parameters, "handedness"),
      meleeOrRanged: textValue(parameters, "melee or ranged"),
      enchantment: textValue(parameters, "enchantment"),
      damage: textValue(parameters, "damage"),
      damageType: textValue(parameters, "damage type"),
      versatileDamage: textValue(parameters, "versatile damage"),
      extraDamage: textValue(parameters, "extra damage"),
      extraDamageType: textValue(parameters, "extra damage type"),
      finesse: booleanValue(parameters, "finesse"),
      heavy: booleanValue(parameters, "heavy"),
      light: booleanValue(parameters, "light"),
      reach: booleanValue(parameters, "reach"),
      thrown: booleanValue(parameters, "thrown"),
      weightKg: numberValue(parameters, "weight kg"),
      price: numberValue(parameters, "price"),
    },
    acquisition: acquisitionEntries(parameters),
    image: imageName ? { name: imageName, url: null } : null,
    source: {
      page: wikiPageUrl(page.title),
      revisionId: page.revision.revid,
      revisedAt: page.revision.timestamp,
    },
  };
}

function normalizedFileName(name: string): string {
  return name.replace(/^File:/i, "").replaceAll("_", " ").trim().toLowerCase();
}

const fetchImageUrls = Effect.fn("fetchImageUrls")(function* (apiRequest: ApiRequest, imageNames: string[]) {
  const urls = new Map<string, string>();

  for (const batch of chunks([...new Set(imageNames)].sort(), PAGE_BATCH_SIZE)) {
    const result = yield* apiRequest({
      prop: "imageinfo",
      iiprop: "url",
      redirects: "1",
      titles: batch.map((name) => `File:${name}`).join("|"),
    });

    if (!result.query?.pages) {
      return yield* new CatalogueError({ message: "No pages returned for an image batch" });
    }
    const redirects = new Map(
      (result.query.redirects ?? []).map((redirect) => [
        normalizedFileName(redirect.from),
        normalizedFileName(redirect.to),
      ]),
    );

    for (const page of result.query.pages) {
      const url = page.imageinfo?.[0]?.url;
      if (url) urls.set(normalizedFileName(page.title), url);
    }

    for (const [from, to] of redirects) {
      if (urls.has(to)) urls.set(from, urls.get(to));
    }
  }

  return urls;
});

export const buildCatalogue = Effect.fn("buildCatalogue")(function* () {
  const apiRequest = yield* makeApiRequest;
  const items: ImportedItem[] = [];
  const upstreamPageCounts: Record<string, number> = {};
  const actAssignments = yield* fetchActAssignments(apiRequest);
  const actLocations = yield* fetchActLocations(apiRequest);

  for (const source of sources) {
    const titles = yield* listTemplatePages(apiRequest, source.template);
    if (titles.length < source.minimum) {
      return yield* new CatalogueError({
        message: `Expected at least ${source.minimum} ${source.kind} pages, but bg3.wiki returned ${titles.length}`,
      });
    }

    yield* Effect.logInfo(`Fetching ${titles.length} ${source.kind} pages`);
    const pages = yield* fetchPageSources(apiRequest, titles);
    for (const page of pages) {
      const item = parseItemPage(page, source.kind);
      const listedActs = actAssignments.get(page.title);
      if (item.legacy !== null || (item.acquisition.length === 0 && listedActs === undefined)) continue;

      items.push({
        ...item,
        availableInActs: listedActs ?? actsFromAcquisition(item, actLocations),
      });
    }
    upstreamPageCounts[source.kind] = pages.length;
  }

  if (items.length < 400) {
    return yield* new CatalogueError({
      message: `Expected at least 400 obtainable magic items, but parsed ${items.length}`,
    });
  }

  const unclassifiedItems = items.filter((item) => item.availableInActs.length === 0);
  if (unclassifiedItems.length > 0) {
    yield* Effect.logWarning(`${unclassifiedItems.length} obtainable items could not be assigned to an act`);
  }

  const imageNames = items.flatMap((item) => (item.image ? [item.image.name] : []));
  yield* Effect.logInfo(`Resolving ${new Set(imageNames).size} item images`);
  const imageUrls = yield* fetchImageUrls(apiRequest, imageNames);
  const itemsWithImages = items.map((item): ImportedItem => ({
    ...item,
    image: item.image
      ? { ...item.image, url: imageUrls.get(normalizedFileName(item.image.name)) ?? null }
      : null,
  }));
  itemsWithImages.sort(
    (left, right) => left.name.localeCompare(right.name, "en") || left.kind.localeCompare(right.kind),
  );

  return CatalogueSchema.make({
    schemaVersion: 1,
    source: {
      name: "BG3 Wiki",
      url: "https://bg3.wiki/",
      copyright: "https://bg3.wiki/wiki/bg3wiki:Copyrights",
      itemCounts: {
        equipment: itemsWithImages.filter((item) => item.kind === "equipment").length,
        weapons: itemsWithImages.filter((item) => item.kind === "weapon").length,
      },
      upstreamPageCounts,
    },
    items: itemsWithImages,
  });
});

const main = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const catalogue = yield* buildCatalogue();
  const outputPath = yield* path.fromFileUrl(OUTPUT_PATH);
  const json = yield* Schema.encodeEffect(CatalogueJsonSchema)(catalogue);

  yield* fileSystem.makeDirectory(path.dirname(outputPath), { recursive: true });
  yield* fileSystem.writeFileString(outputPath, `${json}\n`);
  yield* Effect.logInfo(`Wrote ${catalogue.items.length} items to ${outputPath}`);
});

if (import.meta.main) {
  NodeRuntime.runMain(
    main.pipe(
      Effect.provide(NodeFileSystem.layer),
      Effect.provide(NodePath.layer),
      Effect.provide(FetchHttpClient.layer),
    ),
  );
}
