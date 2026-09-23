import ObjectiveScreen from "@/components/screens/ObjectiveScreen";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <ObjectiveScreen scope="UNIT" searchParams={searchParams} />;
}
