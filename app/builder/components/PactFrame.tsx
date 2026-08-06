import {
  RopeFrame,
  type RopeFrameAppearance,
} from "./RopeFrame";

export type PactFrameAppearance = "active" | "interactive" | "neutral";

const ROPE_FRAME_APPEARANCE_BY_PACT_FRAME_APPEARANCE = {
  active: "active",
  interactive: "interactive",
  neutral: "inactive",
} as const satisfies Record<PactFrameAppearance, RopeFrameAppearance>;

export function PactFrame({
  appearance = "neutral",
}: {
  appearance?: PactFrameAppearance;
}) {
  return (
    <RopeFrame
      appearance={ROPE_FRAME_APPEARANCE_BY_PACT_FRAME_APPEARANCE[appearance]}
      size="xl"
    />
  );
}
