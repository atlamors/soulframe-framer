import Image from "next/image";

export type RopeFrameAppearance = "active" | "inactive" | "interactive";

type RopeFrameLayerAppearance = Exclude<
  RopeFrameAppearance,
  "interactive"
>;

const ROPE_FRAME_CORNER_ASSETS = {
  active: "/ornaments/rope-active-corner.svg",
  inactive: "/ornaments/rope-inactive-corner.svg",
} as const satisfies Record<RopeFrameLayerAppearance, string>;

const ROPE_FRAME_PIECE_CLASS_NAMES = {
  active: {
    top:
      "absolute top-0 right-ornament-edge left-ornament-edge h-ornament-edge bg-rope-active-horizontal bg-repeat-x",
    bottom:
      "absolute right-ornament-edge bottom-0 left-ornament-edge h-ornament-edge -scale-y-100 bg-rope-active-horizontal bg-repeat-x",
    left:
      "absolute top-ornament-edge bottom-ornament-edge left-0 w-ornament-edge bg-rope-active-vertical bg-repeat-y",
    right:
      "absolute top-ornament-edge right-0 bottom-ornament-edge w-ornament-edge -scale-x-100 bg-rope-active-vertical bg-repeat-y",
  },
  inactive: {
    top:
      "absolute top-0 right-ornament-edge left-ornament-edge h-ornament-edge bg-rope-inactive-horizontal bg-repeat-x",
    bottom:
      "absolute right-ornament-edge bottom-0 left-ornament-edge h-ornament-edge -scale-y-100 bg-rope-inactive-horizontal bg-repeat-x",
    left:
      "absolute top-ornament-edge bottom-ornament-edge left-0 w-ornament-edge bg-rope-inactive-vertical bg-repeat-y",
    right:
      "absolute top-ornament-edge right-0 bottom-ornament-edge w-ornament-edge -scale-x-100 bg-rope-inactive-vertical bg-repeat-y",
  },
} as const satisfies Record<
  RopeFrameLayerAppearance,
  Record<"top" | "bottom" | "left" | "right", string>
>;

const ROPE_FRAME_CORNER_CLASS_NAMES = {
  topLeft: "absolute top-0 left-0 size-ornament-edge",
  topRight:
    "absolute top-0 right-0 size-ornament-edge -scale-x-100",
  bottomLeft:
    "absolute bottom-0 left-0 size-ornament-edge -scale-y-100",
  bottomRight:
    "absolute right-0 bottom-0 size-ornament-edge -scale-x-100 -scale-y-100",
} as const;

function RopeFrameCorner({
  appearance,
  position,
}: {
  appearance: RopeFrameLayerAppearance;
  position: keyof typeof ROPE_FRAME_CORNER_CLASS_NAMES;
}) {
  return (
    <span className={ROPE_FRAME_CORNER_CLASS_NAMES[position]}>
      <Image
        className="block object-fill"
        src={ROPE_FRAME_CORNER_ASSETS[appearance]}
        alt=""
        fill
        sizes="6px"
        unoptimized
      />
    </span>
  );
}

function RopeFrameLayer({
  appearance,
  className,
}: {
  appearance: RopeFrameLayerAppearance;
  className: string;
}) {
  const pieceClassNames = ROPE_FRAME_PIECE_CLASS_NAMES[appearance];

  return (
    <span className={className}>
      <span className={pieceClassNames.top} />
      <span className={pieceClassNames.right} />
      <span className={pieceClassNames.bottom} />
      <span className={pieceClassNames.left} />
      <RopeFrameCorner appearance={appearance} position="topLeft" />
      <RopeFrameCorner appearance={appearance} position="topRight" />
      <RopeFrameCorner appearance={appearance} position="bottomLeft" />
      <RopeFrameCorner appearance={appearance} position="bottomRight" />
    </span>
  );
}

export function RopeFrame({
  appearance = "inactive",
}: {
  appearance?: RopeFrameAppearance;
}) {
  if (appearance !== "interactive") {
    return (
      <span
        className="pointer-events-none absolute -inset-0.75 z-20"
        aria-hidden="true"
      >
        <RopeFrameLayer
          appearance={appearance}
          className="absolute inset-0"
        />
      </span>
    );
  }

  return (
    <span
      className="pointer-events-none absolute -inset-0.75 z-20"
      aria-hidden="true"
    >
      <RopeFrameLayer
        appearance="inactive"
        className="absolute inset-0 opacity-75 transition-opacity duration-150 ease-out group-hover:opacity-0 group-focus-visible:opacity-0 group-focus-within:opacity-0 motion-reduce:transition-none"
      />
      <RopeFrameLayer
        appearance="active"
        className="absolute inset-0 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      />
    </span>
  );
}
