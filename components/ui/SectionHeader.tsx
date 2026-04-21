import { cn } from "@/lib/utils/cn";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({ eyebrow, title, subtitle, align = "left", className }: Props) {
  return (
    <header
      className={cn(
        "mb-10 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          <span className="h-px w-8 bg-neon" />
          {eyebrow}
        </p>
      )}
      <h2 className="text-display text-3xl font-bold uppercase leading-tight text-bone md:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-bone/60 md:text-lg">{subtitle}</p>}
    </header>
  );
}
