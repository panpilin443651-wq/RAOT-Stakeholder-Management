import QuarterFormScreen from "@/components/screens/QuarterFormScreen";

export default function Page({ params }: { params: Promise<{ q: string; planId: string }> }) {
  return <QuarterFormScreen scope="UNIT" params={params} />;
}
