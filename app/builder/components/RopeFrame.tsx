import Image from "next/image";

export type RopeFrameAppearance =
  | "active"
  | "context"
  | "inactive"
  | "interactive";

export type RopeFrameSize = "default" | "lg" | "xl";

export type RopeFrameProps = {
  appearance?: RopeFrameAppearance;
  size?: RopeFrameSize;
};

type RopeFrameLayerAppearance = Exclude<
  RopeFrameAppearance,
  "interactive"
>;

const ROPE_FRAME_CORNER_ASSETS = {
  active: "/ornaments/rope-active-corner.svg",
  context: "/ornaments/themes/nightframe/rope-context-corner.svg",
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
  context: {
    top:
      "absolute top-0 right-ornament-edge left-ornament-edge h-ornament-edge bg-rope-context-horizontal bg-repeat-x",
    bottom:
      "absolute right-ornament-edge bottom-0 left-ornament-edge h-ornament-edge -scale-y-100 bg-rope-context-horizontal bg-repeat-x",
    left:
      "absolute top-ornament-edge bottom-ornament-edge left-0 w-ornament-edge bg-rope-context-vertical bg-repeat-y",
    right:
      "absolute top-ornament-edge right-0 bottom-ornament-edge w-ornament-edge -scale-x-100 bg-rope-context-vertical bg-repeat-y",
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

type RopeFrameEdgeOrientation = "horizontal" | "vertical";

const ROPE_FRAME_EDGE_SIZE_CLASS_NAMES = {
  default: {
    horizontal: "",
    vertical: "",
  },
  lg: {
    horizontal: "[background-size:auto_8px] [background-position:center]",
    vertical: "[background-size:8px_auto] [background-position:center]",
  },
  xl: {
    horizontal: "[background-size:auto_10px] [background-position:center]",
    vertical: "[background-size:10px_auto] [background-position:center]",
  },
} as const satisfies Record<
  RopeFrameSize,
  Record<RopeFrameEdgeOrientation, string>
>;

const ROPE_FRAME_CORNER_SIZE_CLASS_NAMES = {
  default: {
    wrapper: "",
    image: "",
  },
  lg: {
    wrapper: "overflow-hidden",
    image: "origin-center scale-[1.3333333333]",
  },
  xl: {
    wrapper: "overflow-hidden",
    image: "origin-center scale-[1.6666666667]",
  },
} as const satisfies Record<
  RopeFrameSize,
  Record<"wrapper" | "image", string>
>;

function appendRopeFrameSizeClassName(
  className: string,
  sizeClassName: string,
) {
  return sizeClassName ? `${className} ${sizeClassName}` : className;
}

function RopeFrameCorner({
  appearance,
  position,
  size,
}: {
  appearance: RopeFrameLayerAppearance;
  position: keyof typeof ROPE_FRAME_CORNER_CLASS_NAMES;
  size: RopeFrameSize;
}) {
  const cornerSizeClassNames = ROPE_FRAME_CORNER_SIZE_CLASS_NAMES[size];

  return (
    <span
      className={appendRopeFrameSizeClassName(
        ROPE_FRAME_CORNER_CLASS_NAMES[position],
        cornerSizeClassNames.wrapper,
      )}
    >
      <Image
        className={appendRopeFrameSizeClassName(
          "block object-fill",
          cornerSizeClassNames.image,
        )}
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
  size,
}: {
  appearance: RopeFrameLayerAppearance;
  className: string;
  size: RopeFrameSize;
}) {
  const pieceClassNames = ROPE_FRAME_PIECE_CLASS_NAMES[appearance];
  const edgeSizeClassNames = ROPE_FRAME_EDGE_SIZE_CLASS_NAMES[size];

  return (
    <span className={className}>
      <span
        className={appendRopeFrameSizeClassName(
          pieceClassNames.top,
          edgeSizeClassNames.horizontal,
        )}
      />
      <span
        className={appendRopeFrameSizeClassName(
          pieceClassNames.right,
          edgeSizeClassNames.vertical,
        )}
      />
      <span
        className={appendRopeFrameSizeClassName(
          pieceClassNames.bottom,
          edgeSizeClassNames.horizontal,
        )}
      />
      <span
        className={appendRopeFrameSizeClassName(
          pieceClassNames.left,
          edgeSizeClassNames.vertical,
        )}
      />
      <RopeFrameCorner appearance={appearance} position="topLeft" size={size} />
      <RopeFrameCorner appearance={appearance} position="topRight" size={size} />
      <RopeFrameCorner
        appearance={appearance}
        position="bottomLeft"
        size={size}
      />
      <RopeFrameCorner
        appearance={appearance}
        position="bottomRight"
        size={size}
      />
    </span>
  );
}

export function RopeFrame({
  appearance = "inactive",
  size = "default",
}: RopeFrameProps) {
  if (appearance !== "interactive") {
    return (
      <span
        className="pointer-events-none absolute -inset-0.75 z-20"
        aria-hidden="true"
      >
        <RopeFrameLayer
          appearance={appearance}
          className="absolute inset-0"
          size={size}
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
        size={size}
      />
      <RopeFrameLayer
        appearance="active"
        className="absolute inset-0 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
        size={size}
      />
    </span>
  );
}
