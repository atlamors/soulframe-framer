import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const API_URL = "https://wiki.avakot.org/w/api.php";
const SOURCE_TITLE = "Mastery";
const SOURCE_PAGE = "https://wiki.avakot.org/Mastery";
const OUTPUT_PATH = resolve("src/data/progression.generated.json");
const USER_AGENT =
  "Soulframe-Framer/0.1 (https://github.com/atlamors/soulframe-framer)";

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Avakot API returned ${response.status} for ${url}`);
  }

  return response.json();
};

const getMasteryPage = async () => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: "parse",
    format: "json",
    formatversion: "2",
    page: SOURCE_TITLE,
    prop: "wikitext",
  });
  const response = await fetchJson(url);

  if (!response.parse?.wikitext) {
    throw new Error("Could not read Avakot's Mastery page.");
  }

  return response.parse.wikitext;
};

const getSourceRevision = async () => {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "revisions",
    rvprop: "ids|timestamp",
    titles: SOURCE_TITLE,
  });
  const response = await fetchJson(url);
  const revision = response.query?.pages?.[0]?.revisions?.[0];

  if (!revision) {
    throw new Error("Could not resolve the Avakot Mastery page revision.");
  }

  return {
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
  };
};

const [wikitext, sourceRevision] = await Promise.all([
  getMasteryPage(),
  getSourceRevision(),
]);
const masteryMatch = wikitext.match(
  /Maximum Mastery''' as of \[\[([^\]]+)\]\] is ~?'''([\d.]+)''' for \[\[([^\]]+)\]\]/,
);

if (!masteryMatch) {
  throw new Error("Could not parse the current maximum Mastery from Avakot.");
}

const maximumMastery = Number(masteryMatch[2]);
const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    name: "The Soulframe Wiki Mastery page",
    publisher: "Avakot",
    pageUrl: SOURCE_PAGE,
    apiUrl: API_URL,
    contentLicense: "CC BY-SA 4.0 unless otherwise noted",
    attributionUrl: "https://wiki.avakot.org/Project:Copyrights",
    ...sourceRevision,
  },
  progression: {
    maximumMastery,
    maximumEnvoyRank: Math.floor(maximumMastery),
    asOf: masteryMatch[1],
    scope: masteryMatch[3],
  },
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Mapped maximum Envoy Rank ${output.progression.maximumEnvoyRank} from ${maximumMastery} Mastery (${output.progression.asOf}, ${output.progression.scope}).`,
);
