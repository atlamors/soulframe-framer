import type {
  IsoDateTime,
  PublicationId,
  PublicationProfileId,
} from "../../domain/publications/types";

export type DiscoveryOrder = "trending" | "top" | "new";

export interface DiscoveryRequest {
  order: DiscoveryOrder;
  gameId: string;
  profileId: PublicationProfileId;
  limit: number;
  cursor?: string;
}

export interface DiscoveryPublication {
  publicationId: PublicationId;
  profileId: PublicationProfileId;
  gameId: string;
  slug: string;
  creatorHandle: string;
  title: string;
  summary: string | null;
  coverAssetId: string | null;
  classifications: readonly string[];
  firstPublishedAt: IsoDateTime;
  latestPublishedAt: IsoDateTime;
  voteCount: number;
}

export interface DiscoveryPage {
  items: readonly DiscoveryPublication[];
  nextCursor: string | null;
}

export interface DiscoveryService {
  list(request: DiscoveryRequest): Promise<DiscoveryPage>;
}
