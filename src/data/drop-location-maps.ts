import generatedDropLocationMaps from "./drop-location-maps.generated.json";

export interface DropLocationMap {
  mapUrl: string;
  imageFile: string;
  coordinateId: string;
  coordinateName: string;
  markerName: string;
  categoryName: string;
  markerIconUrl: string;
  x: number | null;
  y: number | null;
  xPercent: number | null;
  yPercent: number | null;
  imageUrl: string;
  width: number;
  height: number;
}

export interface DropLocationMapRecord {
  sourcePageUrl: string;
  sourcePageTitle: string;
  locations: DropLocationMap[];
}

export const dropLocationMaps =
  generatedDropLocationMaps.items as DropLocationMapRecord[];

export const dropLocationMapAsset =
  generatedDropLocationMaps.source.mapAssetUrl;

export const dropLocationMapCuratedIcons =
  generatedDropLocationMaps.source.markerAssets;

export const dropLocationMapBySourceUrl = new Map(
  dropLocationMaps.map((record) => [record.sourcePageUrl, record]),
);
