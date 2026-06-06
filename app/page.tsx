import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { StatsCounters } from "@/components/home/StatsCounters";
import { FeaturedBuilds } from "@/components/home/FeaturedBuilds";
import { BackgroundFX } from "@/components/fx/BackgroundFX";

export default function HomePage() {
  return (
    <>
      <BackgroundFX variant="ignition" />
      <Hero />
      <WhatWeDo />
      <StatsCounters />
      <FeaturedBuilds />
    </>
  );
}
