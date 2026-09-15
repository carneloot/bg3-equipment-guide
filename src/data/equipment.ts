export interface EquipmentItem {
  name: string;
  type: string;
  rarity: "uncommon" | "rare" | "very rare" | "legendary";
  location: string;
  directions: string;
  warning?: string;
  image: string;
  source: string;
}

export interface Act {
  id: 1 | 2 | 3;
  title: string;
  description: string;
  items: EquipmentItem[];
}

export const getEquipmentId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const acts: Act[] = [
  {
    id: 1,
    title: "The road to Moonrise",
    description: "Wilderness, Underdark, and the Mountain Pass",
    items: [
      {
        name: "Ring of Protection",
        type: "Ring",
        rarity: "rare",
        location: "Emerald Grove · Tiefling Hideout",
        directions:
          "Earn Mol's trust, accept Steal the Sacred Idol, then give her the Idol of Silvanus. The ring is the quest reward.",
        warning:
          "Ask Mol for the job before ending the Rite of Thorns. The safest route is to stop the rite first, after accepting the quest, and steal the idol afterward.",
        image: "assets/items/ring-of-protection.png",
        source: "https://bg3.wiki/wiki/Ring_of_Protection",
      },
      {
        name: "Smuggler's Ring",
        type: "Ring",
        rarity: "uncommon",
        location: "The Risen Road · X: 58, Y: 516",
        directions:
          "Follow the lower riverside path below the broken bridge. Search the skeleton hidden in the bushes.",
        image: "assets/items/smuggler-s-ring.png",
        source: "https://bg3.wiki/wiki/Smuggler%27s_Ring",
      },
      {
        name: "Disintegrating Night Walkers",
        type: "Boots",
        rarity: "very rare",
        location: "Grymforge · X: -854, Y: 780",
        directions: "Loot them from True Soul Nere after dealing with him at the cave-in.",
        warning: "Do not leave Grymforge without looting Nere.",
        image: "assets/items/disintegrating-night-walkers.png",
        source: "https://bg3.wiki/wiki/Disintegrating_Night_Walkers",
      },
      {
        name: "The Graceful Cloth",
        type: "Clothing",
        rarity: "rare",
        location: "Rosymorn Monastery Trail · X: -43, Y: -129",
        directions:
          "Buy it from Lady Esther, northeast of the Trielta Crags waypoint in the Mountain Pass.",
        image: "assets/items/the-graceful-cloth.png",
        source: "https://bg3.wiki/wiki/The_Graceful_Cloth",
      },
      {
        name: "Knife of the Undermountain King",
        type: "Shortsword",
        rarity: "very rare",
        location: "Crèche Y'llek · X: 1380, Y: -798",
        directions: "Buy it from quartermaster A'jak'nir Jeera inside the crèche.",
        warning: "Shop before your choices in the crèche turn its inhabitants hostile.",
        image: "assets/items/knife-of-the-undermountain-king.png",
        source: "https://bg3.wiki/wiki/Knife_of_the_Undermountain_King",
      },
    ],
  },
  {
    id: 2,
    title: "Across the shadowlands",
    description: "Last Light Inn, Moonrise Towers, and the Gauntlet of Shar",
    items: [
      {
        name: "Cloak of Protection",
        type: "Cloak",
        rarity: "uncommon",
        location: "Last Light Inn · X: -31, Y: 130",
        directions: "Buy it from Quartermaster Talli near the waypoint.",
        warning: "Shop while Last Light Inn is safe and Talli is available.",
        image: "assets/items/cloak-of-protection.png",
        source: "https://bg3.wiki/wiki/Cloak_of_Protection",
      },
      {
        name: "Sword of Life Stealing",
        type: "Shortsword",
        rarity: "very rare",
        location: "Last Light Inn · X: -33, Y: 164",
        directions: "Buy it from Dammon at the forge.",
        warning: "Dammon must have survived Act 1 and reached Last Light Inn.",
        image: "assets/items/sword-of-life-stealing.png",
        source: "https://bg3.wiki/wiki/Sword_of_Life_Stealing",
      },
      {
        name: "Ring of Free Action",
        type: "Ring",
        rarity: "rare",
        location: "Moonrise Towers · X: -128, Y: -193",
        directions: "Buy it from Araj Oblodra on the main floor before the assault on Moonrise.",
        warning:
          "Fallback: if Araj survives and you miss it here, she can sell it at Crimson Draughts in the Lower City during Act 3.",
        image: "assets/items/ring-of-free-action.png",
        source: "https://bg3.wiki/wiki/Ring_of_Free_Action",
      },
      {
        name: "Killer's Sweetheart",
        type: "Ring",
        rarity: "very rare",
        location: "Gauntlet of Shar · X: -833, Y: -729",
        directions:
          "Complete the Self-Same Trial. Pick up the ring where the player character's shadow copy fell, near the brazier.",
        warning:
          "It lies loose on the ground and is easy to miss. A shadow defeated with Control Undead does not drop it.",
        image: "assets/items/killer-s-sweetheart.png",
        source: "https://bg3.wiki/wiki/Killer%27s_Sweetheart",
      },
    ],
  },
  {
    id: 3,
    title: "The city of Baldur's Gate",
    description: "Rivington, the Lower City, and the places beneath",
    items: [
      {
        name: "Boots of Uninhibited Kushigo",
        type: "Boots",
        rarity: "rare",
        location: "Astral Plane · X: -163, Y: -1158",
        directions:
          "Loot them from Prelate Lir'i'c during the Astral Plane sequence that begins the transition into Act 3.",
        warning: "Loot Lir'i'c before taking the portal out. You cannot return to this encounter.",
        image: "assets/items/boots-of-uninhibited-kushigo.png",
        source: "https://bg3.wiki/wiki/Boots_of_Uninhibited_Kushigo",
      },
      {
        name: "Bonespike Boots",
        type: "Boots",
        rarity: "very rare",
        location: "Rivington · Western Beach",
        directions:
          "From the South Span Checkpoint, follow the western trail to its far end. The boots are in a wooden chest in a secluded passageway at X: -1340, Y: -857.",
        image: "assets/items/bonespike-boots.png",
        source: "https://bg3.wiki/wiki/Bonespike_Boots",
      },
      {
        name: "Stalker Gloves",
        type: "Gloves",
        rarity: "rare",
        location: "Rivington General · X: 7, Y: -35",
        directions: "Buy them from Exxvikyap in the general store.",
        image: "assets/items/stalker-gloves.png",
        source: "https://bg3.wiki/wiki/Stalker_Gloves",
      },
      {
        name: "Sentient Amulet (Very Rare)",
        type: "Amulet",
        rarity: "very rare",
        location: "Open Hand Temple Cellar · X: -7, Y: -1004",
        directions:
          "Bring the rare Sentient Amulet from Grymforge to Shirra Clarwen's sarcophagus. Refuse to inherit the monk's curse, then defeat the monk and raised corpses to receive the upgraded amulet.",
        warning:
          "Act 1 setup required: take the rare amulet from the locked Adamantine Chest by the Lava Elemental in Grymforge. Accepting the curse removes the amulet's magic instead of upgrading it.",
        image: "assets/items/sentient-amulet-very-rare.png",
        source: "https://bg3.wiki/wiki/Sentient_Amulet_(Very_Rare)",
      },
      {
        name: "Khalid's Gift",
        type: "Amulet",
        rarity: "very rare",
        location: "Elerrathin's Home · X: -1572, Y: 976",
        directions:
          "Enter Jaheira's basement, open the locked bookcase with a DC 18 Sleight of Hand check, and take the amulet from the display case beyond it.",
        warning: "The amulet is present even if Jaheira was not recruited or has died.",
        image: "assets/items/khalid-s-gift.png",
        source: "https://bg3.wiki/wiki/Khalid%27s_Gift",
      },
      {
        name: "Shade-Slayer Cloak",
        type: "Cloak",
        rarity: "very rare",
        location: "Guildhall · X: -17, Y: 755",
        directions:
          "Buy it from Sticky Dondo at Fetcher's Brats, in the northeast corner of the Guildhall's main room near the bar.",
        image: "assets/items/shade-slayer-cloak.png",
        source: "https://bg3.wiki/wiki/Shade-Slayer_Cloak",
      },
      {
        name: "Mask of Soul Perception",
        type: "Helmet",
        rarity: "very rare",
        location: "Devil's Fee · X: -33, Y: 20",
        directions:
          "Go upstairs to Helsik's room. The mask is inside a locked Gilded Chest that requires a DC 20 Sleight of Hand check.",
        image: "assets/items/mask-of-soul-perception.png",
        source: "https://bg3.wiki/wiki/Mask_of_Soul_Perception",
      },
      {
        name: "Vest of Soul Rejuvenation",
        type: "Clothing",
        rarity: "very rare",
        location: "Sorcerous Sundries",
        directions:
          "Buy it from Rolan if he runs the shop, or from Lorroakan's Projection if Rolan is dead. If Rolan lives and Lorroakan is dead, use the trade button during dialogue with Rolan in Ramazith's Tower.",
        image: "assets/items/vest-of-soul-rejuvenation.png",
        source: "https://bg3.wiki/wiki/Vest_of_Soul_Rejuvenation",
      },
      {
        name: "The Dead Shot",
        type: "Longbow",
        rarity: "very rare",
        location: "Stormshore Armoury · X: -36, Y: -83",
        directions:
          "Buy it from Fytz the Firecracker, near the Lower City Central Wall waypoint.",
        image: "assets/items/the-dead-shot.png",
        source: "https://bg3.wiki/wiki/The_Dead_Shot",
      },
      {
        name: "Helldusk Gloves",
        type: "Gloves",
        rarity: "very rare",
        location: "House of Hope · Boudoir · X: -6478, Y: 2993",
        directions: "Fight and kill Haarlep in Raphael's boudoir, then loot the gloves.",
        warning: "Finishing Haarlep's game peacefully locks you out of these gloves.",
        image: "assets/items/helldusk-gloves.png",
        source: "https://bg3.wiki/wiki/Helldusk_Gloves",
      },
      {
        name: "Helldusk Helmet",
        type: "Helmet",
        rarity: "very rare",
        location: "House of Hope · Raphael's Vault · X: -6482, Y: 2939",
        directions:
          "Take it from Raphael's Vault directly across the corridor from the boudoir entrance.",
        image: "assets/items/helldusk-helmet.png",
        source: "https://bg3.wiki/wiki/Helldusk_Helmet",
      },
      {
        name: "Gloves of Soul Catching",
        type: "Gloves",
        rarity: "legendary",
        location: "House of Hope",
        directions:
          "Free Hope with the Orphic Hammer, keep her alive through the fight with Raphael, then speak to her after the battle. She gives you the gloves.",
        warning: "Hope must survive the final fight.",
        image: "assets/items/gloves-of-soul-catching.png",
        source: "https://bg3.wiki/wiki/Gloves_of_Soul_Catching",
      },
      {
        name: "Bonespike Gloves",
        type: "Gloves",
        rarity: "very rare",
        location: "Undercity Ruins · X: -136, Y: 980",
        directions:
          "During the Farslayer's trial on the road to the Temple of Bhaal, kill Strangler Luke on the ruined rooftop beside the stone bridge and loot him immediately.",
        warning: "His corpse disappears when Farslayer Ghislev dies. Loot Luke before finishing the trial.",
        image: "assets/items/bonespike-gloves.png",
        source: "https://bg3.wiki/wiki/Bonespike_Gloves",
      },
      {
        name: "Crimson Mischief",
        type: "Shortsword",
        rarity: "legendary",
        location: "Temple of Bhaal · X: 61, Y: 1004",
        directions: "Defeat Orin during Get Orin's Netherstone and loot the shortsword from her.",
        image: "assets/items/crimson-mischief.png",
        source: "https://bg3.wiki/wiki/Crimson_Mischief",
      },
      {
        name: "Bloodthirst",
        type: "Dagger",
        rarity: "legendary",
        location: "Temple of Bhaal · X: 61, Y: 1004",
        directions: "Defeat Orin during Get Orin's Netherstone and loot the dagger from her.",
        image: "assets/items/bloodthirst.png",
        source: "https://bg3.wiki/wiki/Bloodthirst",
      },
    ],
  },
];

export const totalItems = acts.reduce((total, act) => total + act.items.length, 0);
