import React from "react";
import CTA from "@/components/cta";
import HeroSection from "@/components/hero";
import { About } from "@/components/about";
import { TrustBadges } from "@/components/trustBadges";
import { Features } from "@/components/features";
import HowItWorksCard from "@/components/howItWorks";
import { Testimonials } from "@/components/testimonials";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <TrustBadges />
      <About />
      <Features />
      <HowItWorksCard />
      <Testimonials />
      <CTA/>
    </div>
  );
};

export default LandingPage;