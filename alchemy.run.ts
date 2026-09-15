import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Bg3EquipmentGuide",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const site = yield* Cloudflare.Website.Astro("Website", {
      name: "bg3-equipment-guide",
      domain: "bg3.carneloot.com",
      workersDev: false,
      astro: {
        output: "static",
        site: "https://bg3.carneloot.com",
      },
    });

    return { url: site.url };
  }),
);
