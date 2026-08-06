import {
  RopeFrame,
  type RopeFrameAppearance,
  type RopeFrameSize,
} from "./RopeFrame";

export type DoubleRopeFrameProps = {
  appearance?: RopeFrameAppearance;
  className?: string;
  size?: RopeFrameSize;
};

const DOUBLE_ROPE_FRAME_ROOT_CLASS_NAME =
  "pointer-events-none absolute inset-0 z-0 drop-shadow-[0_1px_0.8px_rgba(17,16,15,0.7)] before:absolute before:top-1/2 before:-left-3.25 before:z-30 before:h-5 before:w-6.25 before:-translate-y-1/2 before:bg-[url('/login-frame/leaf-left.svg')] before:bg-contain before:bg-center before:bg-no-repeat before:content-[''] after:absolute after:top-1/2 after:-right-3.25 after:z-30 after:h-5 after:w-6.25 after:-translate-y-1/2 after:bg-[url('/login-frame/leaf-right.svg')] after:bg-contain after:bg-center after:bg-no-repeat after:content-['']";

export function DoubleRopeFrame({
  appearance = "inactive",
  className,
  size = "lg",
}: DoubleRopeFrameProps) {
  return (
    <span
      className={
        className
          ? `${DOUBLE_ROPE_FRAME_ROOT_CLASS_NAME} ${className}`
          : DOUBLE_ROPE_FRAME_ROOT_CLASS_NAME
      }
      aria-hidden="true"
    >
      <RopeFrame appearance={appearance} size={size} />
      <span className="absolute inset-[3px] z-10 border-2 border-[#17120f]" />
      <span className="absolute inset-1 z-10 border-4 border-[#5c4c35]" />
      <span className="absolute inset-[5px] z-10 border-2 border-[#927d59]" />
      <span className="absolute inset-[7.75px] z-10 border-[1.5px] border-[#17120f]" />
    </span>
  );
}
