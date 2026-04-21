"use client";

import { useBuildStore } from "@/store/useBuildStore";
import { BrandCarousel } from "@/components/configurator/BrandCarousel";
import { ModelCarousel } from "@/components/configurator/ModelCarousel";
import { YearSelect } from "@/components/configurator/YearSelect";
import { PartsPanel } from "@/components/configurator/PartsPanel";
import { BikePreview } from "@/components/configurator/BikePreview";

export default function ConfiguratorPage() {
  const { step } = useBuildStore();

  // Steps 1-3 full width; Step 4 shows BikePreview alongside parts panel.
  const showPreview = step === 4;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
      {!showPreview ? (
        <div className="min-h-[70vh]">
          {step === 1 && <BrandCarousel />}
          {step === 2 && <ModelCarousel />}
          {step === 3 && <YearSelect />}
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <BikePreview />
          </div>
          <div className="md:col-span-3">
            <PartsPanel />
          </div>
        </div>
      )}
    </section>
  );
}
