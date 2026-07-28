import { describe, expect, it } from "vitest";
import generatedDropLocationMaps from "./drop-location-maps.generated.json";
import { dropLocationMapBySourceUrl } from "./drop-location-maps";

describe("Avakot drop-location maps", () => {
  it("records map coverage across the drop-source pages", () => {
    expect(generatedDropLocationMaps.coverage).toMatchObject({
      sourcePages: 70,
      pagesWithMapLocations: 23,
      pagesWithoutMapLocations: 47,
      totalMapLocations: 37,
      mapLocationsWithImages: 14,
      mapLocationsWithCoordinates: 35,
    });
  });

  it("maps Fore-Feller Hewyl to Soulmap and its preview image", () => {
    expect(
      dropLocationMapBySourceUrl.get(
        "https://wiki.avakot.org/Fore-Feller_Hewyl",
      )?.locations,
    ).toEqual([
      expect.objectContaining({
        mapUrl: "https://soulmap.avakot.org/?loc=hewyl",
        imageFile: "HewylLoc.png",
        imageUrl: expect.stringMatching(/^https:\/\/static\.wikitide\.net\//),
        coordinateName: "Fore-Feller Hewyl",
        markerName: "Dungeon Agari",
        markerIconUrl: expect.stringMatching(/^\/maps\/markers\//),
        x: 4191,
        y: 1885,
        xPercent: 58.4682,
        yPercent: 73.7026,
      }),
    ]);
  });

  it("keeps multiple distinct map locations for a source", () => {
    expect(
      dropLocationMapBySourceUrl.get(
        "https://wiki.avakot.org/Thrice-bound_Impidh",
      )?.locations,
    ).toHaveLength(3);
  });
});
