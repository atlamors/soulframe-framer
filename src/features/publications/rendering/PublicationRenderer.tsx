import type { ReactNode } from "react";
import type { PublicationLayoutKey } from "../../../domain/publications/profiles";
import type { PublicPublication } from "../../../server/contracts/publications";
import { BuildPublication } from "./BuildPublication";
import { GuidePublication } from "./GuidePublication";

type PublicationRendererProps = {
  publication: PublicPublication;
  canonicalUrl: string;
  voteControl: ReactNode;
};

const PUBLICATION_LAYOUT_RENDERERS = {
  "soulframe.build.v1": BuildPublication,
  "soulframe.guide.v1": GuidePublication,
} as const satisfies Record<
  PublicationLayoutKey,
  (props: PublicationRendererProps) => ReactNode
>;

export function PublicationRenderer(props: PublicationRendererProps) {
  const Renderer = PUBLICATION_LAYOUT_RENDERERS[props.publication.profile.layoutKey];
  return <Renderer {...props} />;
}
