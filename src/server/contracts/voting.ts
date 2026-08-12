import type {
  PublicationId,
  PublicationOwnerId,
} from "../../domain/publications/types";

export interface PublicationVoteRequest {
  accountId: PublicationOwnerId;
  publicationId: PublicationId;
}

export interface PublicationVoteCountRequest {
  publicationId: PublicationId;
}

export interface PublicationVoteState {
  publicationId: PublicationId;
  active: boolean;
  count: number;
}

export interface VotingService {
  toggle(request: PublicationVoteRequest): Promise<PublicationVoteState>;
  getState(request: PublicationVoteRequest): Promise<PublicationVoteState>;
  getCount(request: PublicationVoteCountRequest): Promise<number>;
}
