import QuarterListScreen from "@/components/screens/QuarterListScreen";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ q: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <QuarterListScreen scope="ORG" params={params} searchParams={searchParams} />;
}
