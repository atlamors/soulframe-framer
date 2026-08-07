import { redirect } from "next/navigation";

export default async function SoulframeHome({
  searchParams,
}: {
  searchParams: Promise<{ build?: string | string[] }>;
}) {
  const { build } = await searchParams;
  const buildValue = Array.isArray(build) ? build[0] : build;
  if (typeof buildValue === "string" && buildValue.length > 0) {
    redirect(
      `/soulframe/framer?${new URLSearchParams({ build: buildValue })}`,
    );
  }
  redirect("/soulframe/framer");
}
