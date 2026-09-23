import PlanListScreen from "@/components/screens/PlanListScreen";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <PlanListScreen scope="UNIT" searchParams={searchParams} />;
}
