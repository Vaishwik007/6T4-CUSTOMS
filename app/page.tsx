import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { StatsCounters } from "@/components/home/StatsCounters";
import { FeaturedBuilds } from "@/components/home/FeaturedBuilds";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <StatsCounters />
      <FeaturedBuilds />
    </>
  );
}
