import AutoJoinPoller from "@/components/AutoJoinPoller";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AutoJoinPoller />
      {children}
    </>
  );
}