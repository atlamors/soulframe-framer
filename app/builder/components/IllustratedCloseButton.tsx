import Image from "next/image";
import {
  forwardRef,
  type MouseEventHandler,
} from "react";

const ILLUSTRATED_CLOSE_BUTTON_CLASS_NAME =
  "group inline-flex size-11 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none focus-visible:outline-none";

const ILLUSTRATED_CLOSE_ICON_FRAME_CLASS_NAME =
  "pointer-events-none relative block size-10";

const ILLUSTRATED_CLOSE_ICON_CLASS_NAMES = {
  neutral:
    "block size-full object-contain opacity-100 transition-opacity duration-150 ease-out group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none",
  active:
    "absolute inset-0 block size-full object-contain opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none",
} as const;

export const IllustratedCloseButton = forwardRef<
  HTMLButtonElement,
  {
    "aria-label": string;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }
>(function IllustratedCloseButton(
  {
    "aria-label": ariaLabel,
    onClick,
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={ILLUSTRATED_CLOSE_BUTTON_CLASS_NAME}
      data-dialog-close
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span
        className={ILLUSTRATED_CLOSE_ICON_FRAME_CLASS_NAME}
        aria-hidden="true"
      >
        <Image
          className={ILLUSTRATED_CLOSE_ICON_CLASS_NAMES.neutral}
          src="/icons/game-ui/close-abandon-neutral.svg"
          alt=""
          width={40}
          height={40}
          unoptimized
        />
        <Image
          className={ILLUSTRATED_CLOSE_ICON_CLASS_NAMES.active}
          src="/icons/game-ui/close-abandon-active.svg"
          alt=""
          width={40}
          height={40}
          unoptimized
        />
      </span>
    </button>
  );
});
