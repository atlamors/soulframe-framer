export const MOBILE_WORKSPACE_MEDIA_QUERY = "(max-width: 960px)";

export const MOBILE_STATS_MORPH_OPTIONS = {
  duration: 320,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  fill: "both",
} as const satisfies KeyframeAnimationOptions;

export const MOBILE_STATS_DETAIL_OPTIONS = {
  duration: 320,
  easing: "ease-out",
  fill: "both",
} as const satisfies KeyframeAnimationOptions;
