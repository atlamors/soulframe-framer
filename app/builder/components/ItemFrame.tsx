import {
  RopeFrame,
  type RopeFrameAppearance,
} from "./RopeFrame";

export type ItemFrameAppearance = "active" | "interactive" | "neutral";

const ROPE_FRAME_APPEARANCE_BY_ITEM_FRAME_APPEARANCE = {
  active: "active",
  interactive: "interactive",
  neutral: "inactive",
} as const satisfies Record<ItemFrameAppearance, RopeFrameAppearance>;

export function ItemFrame({
  appearance = "neutral",
}: {
  appearance?: ItemFrameAppearance;
}) {
  return (
    <RopeFrame
      appearance={ROPE_FRAME_APPEARANCE_BY_ITEM_FRAME_APPEARANCE[appearance]}
      size="lg"
    />
  );
}
