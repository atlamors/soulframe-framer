import { redirect } from "next/navigation";

type QueryValue = string | string[] | undefined;

function firstValue(value: QueryValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function PublisherNewCompatibilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, QueryValue>>;
}) {
  const query = await searchParams;
  const profile = firstValue(query.profile);
  const target = profile === "soulframe.guide" ? "guides" : "builds";
  const forwarded = new URLSearchParams();

  for (const key of [
    "frame",
    "title",
    "slug",
    "summary",
    "classifications",
    "error",
  ]) {
    const value = firstValue(query[key]);
    if (value) forwarded.set(key, value);
  }

  redirect(
    `/soulframe/publisher/${target}/new${forwarded.size ? `?${forwarded}` : ""}`,
  );
}
