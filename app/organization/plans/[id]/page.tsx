import PlanFormScreen from "@/components/screens/PlanFormScreen";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <PlanFormScreen scope="ORG" params={params} searchParams={searchParams} />;
}
