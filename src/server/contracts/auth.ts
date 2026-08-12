import type { IsoDateTime } from "../../domain/publications/types";

export type AuthProvider = "discord" | "twitch";

export interface AccountIdentity {
  id: string;
  email: string | null;
  displayName: string | null;
  createdAt: IsoDateTime;
}

export type PublisherEligibility =
  | { eligible: true }
  | { eligible: false; reason: "creator-profile-required" | "publisher-disabled" };

export interface CreatorProfile {
  accountId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  activatedAt: IsoDateTime;
  publisherEligibility: PublisherEligibility;
}

export interface AuthSession {
  account: AccountIdentity;
  expiresAt: IsoDateTime;
}

export interface BeginOAuthRequest {
  provider: AuthProvider;
  redirectTo: string;
}

export interface ExchangeOAuthCodeRequest {
  code: string;
}

export interface OAuthRedirect {
  redirectUrl: string;
}

export interface ActivateCreatorProfileRequest {
  accountId: string;
  handle: string;
  displayName: string;
}

export interface UpdateCreatorProfileRequest {
  accountId: string;
  displayName?: string;
  bio?: string | null;
}

export interface AuthService {
  getSession(): Promise<AuthSession | null>;
  requireSession(): Promise<AuthSession>;
  beginOAuth(request: BeginOAuthRequest): Promise<OAuthRedirect>;
  exchangeOAuthCode(request: ExchangeOAuthCodeRequest): Promise<void>;
  signOut(): Promise<void>;
  getCreatorProfile(accountId: string): Promise<CreatorProfile | null>;
  activateCreatorProfile(
    request: ActivateCreatorProfileRequest,
  ): Promise<CreatorProfile>;
  updateCreatorProfile(
    request: UpdateCreatorProfileRequest,
  ): Promise<CreatorProfile>;
}
