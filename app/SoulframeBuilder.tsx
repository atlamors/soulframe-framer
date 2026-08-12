"use client";

import { BuilderShell } from "./builder/BuilderShell";

export function SoulframeBuilder({
  artifactOwnerId,
}: {
  artifactOwnerId: string | null;
}) {
  return <BuilderShell artifactOwnerId={artifactOwnerId} />;
}
