import { ProgressRail } from "@/components/configurator/ProgressRail";

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-16">
      <ProgressRail />
      {children}
    </div>
  );
}
