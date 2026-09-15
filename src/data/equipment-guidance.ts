import type { EquipmentGuidance } from "./equipment";

export const equipmentGuidance = {
  "ring-of-protection": {
    directions:
      "Earn Mol's trust, accept Steal the Sacred Idol, then give her the Idol of Silvanus. The ring is the quest reward.",
    warning:
      "Ask Mol for the job before ending the Rite of Thorns. The safest route is to stop the rite first, after accepting the quest, and steal the idol afterward.",
  },
  "smuggler-s-ring": {
    directions:
      "Follow the lower riverside path below the broken bridge. Search the skeleton hidden in the bushes.",
  },
  "disintegrating-night-walkers": {
    directions: "Loot them from True Soul Nere after dealing with him at the cave-in.",
    warning: "Do not leave Grymforge without looting Nere.",
  },
  "the-graceful-cloth": {
    directions:
      "Buy it from Lady Esther, northeast of the Trielta Crags waypoint in the Mountain Pass.",
  },
  "knife-of-the-undermountain-king": {
    directions: "Buy it from quartermaster A'jak'nir Jeera inside the crèche.",
    warning: "Shop before your choices in the crèche turn its inhabitants hostile.",
  },
  "cloak-of-protection": {
    directions: "Buy it from Quartermaster Talli near the waypoint.",
    warning: "Shop while Last Light Inn is safe and Talli is available.",
  },
  "sword-of-life-stealing": {
    directions: "Buy it from Dammon at the forge.",
    warning: "Dammon must have survived Act I and reached Last Light Inn.",
    requirements: [
      {
        id: "keep-dammon-alive",
        act: 1,
        action:
          "Keep Dammon alive through the Emerald Grove conflict so he can reach Last Light Inn in Act II.",
        source: "https://bg3.wiki/wiki/Dammon",
      },
    ],
  },
  "ring-of-free-action": {
    directions: "Buy it from Araj Oblodra on the main floor before the assault on Moonrise.",
    warning:
      "Fallback: if Araj survives and you miss it here, she can sell it at Crimson Draughts in the Lower City during Act III.",
  },
  "killer-s-sweetheart": {
    directions:
      "Complete the Self-Same Trial. Pick up the ring where the player character's shadow copy fell, near the brazier.",
    warning:
      "It lies loose on the ground and is easy to miss. A shadow defeated with Control Undead does not drop it.",
  },
  "boots-of-uninhibited-kushigo": {
    directions:
      "Loot them from Prelate Lir'i'c during the Astral Plane sequence that begins the transition into Act III.",
    warning: "Loot Lir'i'c before taking the portal out. You cannot return to this encounter.",
  },
  "bonespike-boots": {
    directions:
      "From the South Span Checkpoint, follow the western trail to its far end. The boots are in a wooden chest in a secluded passageway at X: -1340, Y: -857.",
  },
  "stalker-gloves": {
    directions: "Buy them from Exxvikyap in the general store.",
  },
  "sentient-amulet-very-rare": {
    directions:
      "Bring the rare Sentient Amulet from Grymforge to Shirra Clarwen's sarcophagus. Refuse to inherit the monk's curse, then defeat the monk and raised corpses to receive the upgraded amulet.",
    warning:
      "Act I setup required: take the rare amulet from the locked Adamantine Chest by the Lava Elemental in Grymforge. Accepting the curse removes the amulet's magic instead of upgrading it.",
    requirements: [
      {
        id: "retrieve-the-rare-sentient-amulet",
        act: 1,
        action:
          "Take the rare Sentient Amulet from the locked Adamantine Chest by the Lava Elemental in Grymforge. You need it to finish the quest in Act III.",
        source: "https://bg3.wiki/wiki/Sentient_Amulet_(Rare)",
      },
    ],
  },
  "khalid-s-gift": {
    directions:
      "Enter Jaheira's basement, open the locked bookcase with a DC 18 Sleight of Hand check, and take the amulet from the display case beyond it.",
    warning: "The amulet is present even if Jaheira was not recruited or has died.",
  },
  "shade-slayer-cloak": {
    directions:
      "Buy it from Sticky Dondo at Fetcher's Brats, in the northeast corner of the Guildhall's main room near the bar.",
  },
  "mask-of-soul-perception": {
    directions:
      "Go upstairs to Helsik's room. The mask is inside a locked Gilded Chest that requires a DC 20 Sleight of Hand check.",
  },
  "vest-of-soul-rejuvenation": {
    directions:
      "Buy it from Rolan if he runs the shop, or from Lorroakan's Projection if Rolan is dead. If Rolan lives and Lorroakan is dead, use the trade button during dialogue with Rolan in Ramazith's Tower.",
  },
  "the-dead-shot": {
    directions: "Buy it from Fytz the Firecracker, near the Lower City Central Wall waypoint.",
  },
  "helldusk-gloves": {
    directions: "Fight and kill Haarlep in Raphael's boudoir, then loot the gloves.",
    warning: "Finishing Haarlep's game peacefully locks you out of these gloves.",
  },
  "helldusk-helmet": {
    directions: "Take it from Raphael's Vault directly across the corridor from the boudoir entrance.",
  },
  "gloves-of-soul-catching": {
    directions:
      "Free Hope with the Orphic Hammer, keep her alive through the fight with Raphael, then speak to her after the battle. She gives you the gloves.",
    warning: "Hope must survive the final fight.",
  },
  "bonespike-gloves": {
    directions:
      "During the Farslayer's trial on the road to the Temple of Bhaal, kill Strangler Luke on the ruined rooftop beside the stone bridge and loot him immediately.",
    warning: "His corpse disappears when Farslayer Ghislev dies. Loot Luke before finishing the trial.",
  },
  "crimson-mischief": {
    directions: "Defeat Orin during Get Orin's Netherstone and loot the shortsword from her.",
  },
  bloodthirst: {
    directions: "Defeat Orin during Get Orin's Netherstone and loot the dagger from her.",
  },
} as const satisfies Record<string, EquipmentGuidance>;
