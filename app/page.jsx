import React from "react";
import CTA from "@/components/cta";
import HeroSection from "@/components/hero";
import { About } from "@/components/about";
import { TrustBadges } from "@/components/trustBadges";
import { Features } from "@/components/features";
import HowItWorksCard from "@/components/howItWorks";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";

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
      <Footer />
    </div>
  );
};

export default LandingPage;