import type { BuildDefinition } from "./define-build";

interface BuildModule {
  default: BuildDefinition;
}

const modules = import.meta.glob<BuildModule>("./*.build.ts", { eager: true });

const allBuilds = Object.values(modules).map((module) => module.default);

const duplicateIds = allBuilds.filter(
  (build, index) => allBuilds.findIndex(({ id }) => id === build.id) !== index,
);

if (duplicateIds.length > 0) {
  throw new Error(`Duplicate build IDs: ${duplicateIds.map(({ id }) => id).join(", ")}`);
}

export const builds = allBuilds.filter((build) => !build.draft).sort((a, b) => b.updated.localeCompare(a.updated));
