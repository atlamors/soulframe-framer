import type {
  ArtNodeDefinition,
  ArtSourceRevision,
  CombatArtDefinition,
  PactArtTreeDefinition,
  VirtueId,
} from "../domain/types";

export const PACT_ART_SOURCE_REVISION = {
  page: "Pact Arts",
  revisionId: 46500,
  timestamp: "2026-06-28T17:50:33Z",
  pageUrl: "https://wiki.avakot.org/Pact_Arts?oldid=46500",
} as const satisfies ArtSourceRevision;

export const PACT_ART_COST_MODEL = {
  status: "product-modeled",
  marginalCosts: [1, 2, 3, 4],
  note:
    "Universal Pact Art marginal costs are an explicit Framer product model; the locked Avakot revision verifies escalating costs only for Virtue Bonus nodes.",
} as const;

export const COMBAT_ART_SOURCE_REVISION = {
  page: "Combat Arts",
  revisionId: 48121,
  timestamp: "2026-07-23T21:54:28Z",
  pageUrl: "https://wiki.avakot.org/Combat_Arts?oldid=48121",
} as const satisfies ArtSourceRevision;

function pactNode(
  id: string,
  name: string,
  description: string,
  kind: ArtNodeDefinition["kind"],
  maxRank = 1,
  rankValues?: Array<number | string>,
  abilityId?: string,
): ArtNodeDefinition {
  return {
    id,
    name,
    description,
    scope: "pact",
    kind,
    maxRank,
    rankCosts: PACT_ART_COST_MODEL.marginalCosts.slice(0, maxRank),
    rankValues,
    mechanicStatus: "descriptive",
    abilityId,
  };
}

function virtueNode(
  virtue: VirtueId,
  name: string,
  description: string,
): ArtNodeDefinition {
  return {
    id: `pact-art-${virtue}`,
    name,
    description,
    scope: "pact",
    kind: "virtue",
    maxRank: 3,
    rankCosts: PACT_ART_COST_MODEL.marginalCosts.slice(0, 3),
    rankValues: [1, 3, 6],
    mechanicStatus: "modeled",
    virtue,
  };
}

const SHARED_PACT_NODES: ArtNodeDefinition[] = [
  virtueNode("courage", "Mora's Pride", "A pact under the red sun. Gain Courage."),
  virtueNode("spirit", "Iridis' Favour", "A pact under the green moon. Gain Spirit."),
  virtueNode("grace", "Saphene's Gift", "A pact under the blue sun. Gain Grace."),
  pactNode(
    "pact-art-forestall",
    "Forestall",
    "Cheat death once more. Gain a chance to survive where otherwise you would die.",
    "general",
    2,
  ),
  pactNode(
    "pact-art-physic",
    "Physic",
    "Survival graces the well-prepared. Increase the amount of Life Elixirs you can carry.",
    "general",
    2,
    ["+1 Life Elixir capacity"],
  ),
  pactNode(
    "pact-art-rooted",
    "Rooted",
    "Grounded by pact, your defence against Stagger is heightened.",
    "general",
    4,
  ),
  pactNode(
    "pact-art-stalwart",
    "Stalwart",
    "Stand tall. Gain a chance to resist being knocked down.",
    "general",
    2,
  ),
  pactNode(
    "pact-art-wingspan",
    "Wingspan",
    "When you fall, your Sparrow Soul has more time to return to your body.",
    "general",
    2,
    ["+7 seconds", "+14 seconds"],
  ),
];

const PASSIVE_NODES_BY_BASE_PACT = {
  "pact-bromius": [
    pactNode(
      "pact-ability-barkbare",
      "Barkbare",
      "Chance to steal Physical and Magick defence from foes on strike and grant it to yourself.",
      "passive",
      4,
      ["10% chance", "20% chance", "30% chance", "40% chance"],
      "pact-ability-barkbare",
    ),
    pactNode(
      "pact-ability-canopys-blessing",
      "Canopy's Blessing",
      "A portion of damage mitigated by armour is reflected to the attacker.",
      "passive",
      4,
      ["8% of mitigated damage per rank"],
      "pact-ability-canopys-blessing",
    ),
  ],
  "pact-duelo": [
    pactNode(
      "pact-ability-chamariz",
      "Chamariz",
      "A Perfect Dodge empowers subsequent dodges to spawn a short-lived decoy.",
      "passive",
      4,
      [1, 2, 3, 4],
      "pact-ability-chamariz",
    ),
    pactNode(
      "pact-ability-olho-por-olho",
      "Olho por Olho",
      "Attacks shortly after a dodge gain a chance to inflict Bleed.",
      "passive",
      4,
      ["6%", "12%", "18%", "24%"],
      "pact-ability-olho-por-olho",
    ),
  ],
  "pact-garren-rood": [
    pactNode(
      "pact-ability-healheart",
      "Healheart",
      "Specific healing methods renew a hidden portion of the equipped Rune's charge.",
      "passive",
      4,
      ["50%", "70%", "95%", "110%"],
      "pact-ability-healheart",
    ),
    pactNode(
      "pact-ability-righteous",
      "Righteous",
      "Reduces Behest's base cooldown.",
      "passive",
      4,
      ["-7.5 seconds", "-15 seconds", "-22.5 seconds", "-30 seconds"],
      "pact-ability-righteous",
    ),
  ],
  "pact-moras-hand": [
    pactNode(
      "pact-ability-hungry-flame",
      "Hungry Flame",
      "Taking Flame damage temporarily increases weapon damage; the result is conditional on Virtue total.",
      "passive",
      4,
      undefined,
      "pact-ability-hungry-flame",
    ),
    pactNode(
      "pact-ability-smolder",
      "Smolder",
      "A targeted enemy takes escalating damage until it is ignited.",
      "passive",
      4,
      ["2.3 initial tick", "3.3 initial tick", "4.5 initial tick", "5.5 initial tick"],
      "pact-ability-smolder",
    ),
  ],
  "pact-ode-tempest": [
    pactNode(
      "pact-ability-lightning-strike",
      "Lightning Strike",
      "A Ground Finisher triggers an additional Voltaic hit on the target and nearby foes.",
      "passive",
      4,
      [45, 50, 55, 65],
      "pact-ability-lightning-strike",
    ),
    pactNode(
      "pact-ability-gravitate",
      "Gravitate",
      "Kick toward a distant foe to grapple forward and empower the next eligible strike with Voltaic damage.",
      "passive",
      4,
      [5, 11, 22],
      "pact-ability-gravitate",
    ),
  ],
  "pact-orengall": [
    pactNode(
      "pact-ability-soulbound",
      "Soulbound",
      "Weapon damage increases per nearby ally, up to four allies.",
      "passive",
      4,
      ["2 per ally", "3 per ally", "4 per ally", "5 per ally"],
      "pact-ability-soulbound",
    ),
    pactNode(
      "pact-ability-feral",
      "Feral",
      "Orengall may appear to take down a non-boss enemy; chance scales with points spent.",
      "passive",
      4,
      undefined,
      "pact-ability-feral",
    ),
  ],
  "pact-oscelda": [
    pactNode(
      "pact-ability-tendril",
      "Tendril",
      "Foes that strike, are blocked, or are parried may be ensnared for a short duration.",
      "passive",
      4,
      ["6% chance per rank"],
      "pact-ability-tendril",
    ),
    pactNode(
      "pact-ability-vernal-pool",
      "Vernal Pool",
      "Arcanic cooldowns recover more quickly while standing in water.",
      "passive",
      4,
      ["1.5 seconds/second", "3 seconds/second", "4 seconds/second", "5 seconds/second"],
      "pact-ability-vernal-pool",
    ),
  ],
  "pact-sirin": [
    pactNode(
      "pact-ability-shrouded",
      "Shrouded",
      "Spectral Sight reveals threats, fauna, and allies through walls; range scales with points spent.",
      "passive",
      4,
      undefined,
      "pact-ability-shrouded",
    ),
    pactNode(
      "pact-ability-pickpocket",
      "Pickpocket",
      "Stay near an unalerted eligible foe to steal its loot; additional points increase speed.",
      "passive",
      4,
      undefined,
      "pact-ability-pickpocket",
    ),
  ],
  "pact-tethren": [
    pactNode(
      "pact-ability-conquerer",
      "Conquerer",
      "Restore Life after eligible kills.",
      "passive",
      4,
      [25, 30, 40, 60],
      "pact-ability-conquerer",
    ),
    pactNode(
      "pact-ability-last-stand",
      "Last Stand",
      "Low Life increases attack speed.",
      "passive",
      4,
      ["+28%", "+36%", "+44%", "+52%"],
      "pact-ability-last-stand",
    ),
  ],
} as const satisfies Record<string, readonly ArtNodeDefinition[]>;

const PACT_BASE_BY_ID: Record<string, keyof typeof PASSIVE_NODES_BY_BASE_PACT> = {
  "pact-bromius": "pact-bromius",
  "pact-duelo": "pact-duelo",
  "pact-garren-rood": "pact-garren-rood",
  "pact-moras-hand": "pact-moras-hand",
  "pact-ode-tempest": "pact-ode-tempest",
  "pact-orengall": "pact-orengall",
  "pact-oscelda": "pact-oscelda",
  "pact-sirin": "pact-sirin",
  "pact-tethren": "pact-tethren",
  "pact-wyld-oscelda": "pact-oscelda",
  "pact-wyld-sirin": "pact-sirin",
  "pact-wyld-tethren": "pact-tethren",
};

export const pactArtTrees: PactArtTreeDefinition[] = Object.entries(
  PACT_BASE_BY_ID,
).map(([pactId, basePactId]) => ({
  pactId,
  nodes: [
    ...SHARED_PACT_NODES,
    ...PASSIVE_NODES_BY_BASE_PACT[basePactId],
  ],
}));

export const pactArtTreeByPactId = new Map(
  pactArtTrees.map((tree) => [tree.pactId, tree]),
);

function combatNode(
  artName: string,
  name: string,
  description: string,
  maxRank = 1,
  rankValues?: Array<number | string>,
): ArtNodeDefinition {
  const slug = name
    .toLowerCase()
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    id: `combat-art-${artName.toLowerCase().replaceAll(" ", "-")}-${slug}`,
    name,
    description,
    scope: "combat",
    kind: "combat",
    maxRank,
    rankCosts: Array.from({ length: maxRank }, () => 1),
    rankValues,
    mechanicStatus: "descriptive",
  };
}

const COMBAT_ART_NODE_LISTS: Record<
  string,
  Array<[string, string, number?, Array<number | string>?]>
> = {
  Bow: [
    ["Barbed Point", "Arrows stay buried for longer."],
    ["Brittle Arrow", "Birchwood arrows deal more Stagger when Splintered."],
    ["Camphor Arrow", "Camphor arrows increase Stagger on enemies."],
    ["Fletching", "Increase the maximum range of Arrow Hail."],
    ["My Leg!", "Leg shots gain a chance to down enemies on impact."],
    ["Ready Mark", "Charged Shots charge more quickly."],
    ["Rife Nocked", "Increase the number of arrows in Arrow Hail.", 3, [25, 30, 35]],
    ["Riposte", "Attack directly after a Parry to perform a damaging Riposte."],
    ["Salted Blade", "Increase Smite chance when attacking downed foes."],
    ["Splinter", "Fire a Charged Shot to blast buried arrows into Splinters."],
    ["Vaunt", "Increase Smite chance on Ripostes."],
    ["Wolfseye", "Perfect Aim increases Smite chance on Charged Shots."],
  ],
  Flyblade: [
    ["Headlong", "Heavy attacks charge more quickly."],
    ["Helm Gong", "Increase Stagger on fully charged Heavy Attacks."],
    ["Riposte", "Attack directly after a Parry to perform a damaging Riposte."],
    ["Ruthless", "Killing an enemy increases the duration of Orbiting Flyblades."],
    ["Smitten", "Increase Smite chance.", 3, ["+1%", "+2%", "+3%"]],
    ["Spectre Strike", "Attack directly after a Perfect Dodge to perform a damaging Spectre Strike."],
    ["Split Focus", "Swapping weapons increases the duration of Orbiting Flyblades."],
    ["Twist of Luck", "Increase Smite chance on Orbiting Flyblades."],
    ["Vaunt", "Increase Smite chance on Ripostes."],
    ["Vigilant", "Perfect Dodge increases the duration of Orbiting Flyblades."],
    ["Wind's Favour", "Increase projectile speed."],
    ["Wrist Brace", "Increase Flyblade lock-on range."],
  ],
  Heavy: [
    ["Asunder", "Sprint attacks deal increased Stagger."],
    ["Final Blow", "Increase Smite chance on finishers."],
    ["Headlong", "Heavy attacks charge more quickly."],
    ["Helm Gong", "Increase Stagger on fully charged Heavy Attacks."],
    ["Perfect Throw", "Release a thrown weapon at the right moment for maximum damage."],
    ["Pointed Greeting", "Increase Smite chance on Perfect Throws."],
    ["Riposte", "Attack directly after a Parry to perform a damaging Riposte."],
    ["Smitten", "Increase Smite chance.", 3, ["+1%", "+2%", "+3%"]],
    ["Spectre Strike", "Attack directly after a Perfect Dodge to perform a damaging Spectre Strike."],
    ["Thrown off", "Increase Stagger on thrown attacks."],
    ["Unyielding", "Parry heavy enemy strikes."],
    ["Vaunt", "Increase Smite chance on Ripostes."],
  ],
  "Long Blade": [
    ["Final Blow", "Increase Smite chance on finishers."],
    ["Headlong", "Heavy attacks charge more quickly."],
    ["Helm Gong", "Increase Stagger on fully charged Heavy Attacks."],
    ["Momentum", "Deal more damage on consecutive attacks."],
    ["Perfect Throw", "Release a thrown weapon at the right moment for maximum damage."],
    ["Pointed Greeting", "Increase Smite chance on Perfect Throws."],
    ["Riposte", "Attack directly after a Parry to perform a damaging Riposte."],
    ["Smitten", "Increase Smite chance.", 3, ["+1%", "+2%", "+3%"]],
    ["Spectre Strike", "Attack directly after a Perfect Dodge to perform a damaging Spectre Strike."],
    ["Unyielding", "Parry heavy enemy strikes."],
    ["Vaunt", "Increase Smite chance on Ripostes."],
  ],
  Magick: [
    ["Cultivate", "Increase damage on the final attack of a combo."],
    ["Grounded", "Increase casting speed while standing still."],
    ["Headlong", "Heavy attacks charge more quickly."],
    ["Helm Gong", "Increase Stagger on fully charged Heavy Attacks."],
    ["Jolted", "Increase Stagger on Spectre Strikes."],
    ["Mirrorspell", "Deflect eligible projectiles with a timed Guard."],
    ["Misdirection", "Increase Smite chance on Spectre Strikes."],
    ["Scry", "Increase cast lock-on range."],
    ["Smitten", "Increase Smite chance.", 3, ["+1%", "+2%", "+3%"]],
    ["Spectre Strike", "Attack directly after a Perfect Dodge to perform a damaging Spectre Strike."],
    ["Unhindered", "Heavy Cast strikes through the first enemy it hits."],
    ["Warding Ways", "Heighten defence against Stagger while Guarding."],
  ],
  Polearm: [
    ["Final Blow", "Increase Smite chance on finishers."],
    ["Headlong", "Heavy attacks charge more quickly."],
    ["Helm Gong", "Increase Stagger on fully charged Heavy Attacks."],
    ["Perfect Throw", "Release a thrown weapon at the right moment for maximum damage."],
    ["Riposte", "Attack directly after a Parry to perform a damaging Riposte."],
    ["Salted Blade", "Increase Smite chance when attacking downed foes."],
    ["Smitten", "Increase Smite chance.", 3, ["+1%", "+2%", "+3%"]],
    ["Spectre Strike", "Attack directly after a Perfect Dodge to perform a damaging Spectre Strike."],
    ["Taut Muscle", "Throw polearms with more speed."],
    ["Thrown off", "Increase Stagger on thrown attacks."],
    ["Unyielding", "Parry heavy enemy strikes."],
    ["Vaunt", "Increase Smite chance on Ripostes."],
  ],
  Shield: [
    ["Headlong", "Heavy attacks charge more quickly."],
    ["Helm Gong", "Increase Stagger on fully charged Heavy Attacks."],
    ["Oiled Scabbard", "Increase the Perfect Throw window."],
    ["Perfect Throw", "Release a thrown weapon at the right moment for maximum damage."],
    ["Pointed Greeting", "Increase Smite chance on Perfect Throws."],
    ["Riposte", "Attack directly after a Parry to perform a damaging Riposte."],
    ["Salted Blade", "Increase Smite chance when attacking downed foes."],
    ["Smitten", "Increase Smite chance.", 3, ["+1%", "+2%", "+3%"]],
    ["Spectre Strike", "Attack directly after a Perfect Dodge to perform a damaging Spectre Strike."],
    ["Thrown off", "Increase Stagger on thrown attacks."],
    ["Unyielding", "Parry heavy enemy strikes."],
  ],
  "Short Blade": [
    ["Affright", "Increase Stagger on Spectre Strikes."],
    ["Misdirection", "Increase Smite chance on Spectre Strikes."],
    ["Momentum", "Deal more damage on consecutive attacks."],
    ["Oiled Scabbard", "Increase the Perfect Throw window."],
    ["Perfect Throw", "Release a thrown weapon at the right moment for maximum damage."],
    ["Pointed Greeting", "Increase Smite chance on Perfect Throws."],
    ["Riposte", "Attack directly after a Parry to perform a damaging Riposte."],
    ["Smitten", "Increase Smite chance.", 3, ["+1%", "+2%", "+3%"]],
    ["Spectre Strike", "Attack directly after a Perfect Dodge to perform a damaging Spectre Strike."],
    ["Swift Parry", "Increase the Parry window."],
    ["Vaunt", "Increase Smite chance on Ripostes."],
  ],
};

export const combatArtCatalogue: CombatArtDefinition[] = Object.entries(
  COMBAT_ART_NODE_LISTS,
).map(([name, nodes]) => ({
  name,
  nodes: nodes.map(([nodeName, description, maxRank, rankValues]) =>
    combatNode(name, nodeName, description, maxRank, rankValues),
  ),
}));

export const combatArtByName = new Map(
  combatArtCatalogue.map((art) => [art.name, art]),
);
