import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import BottomBanner from "../sections/BottomBanner";
import { FaqSection } from "../sections/FaqSection";
import FeaturesSection from "../sections/FeaturesSection";
import HeroSection from "../sections/HeroSection";
import Pricing from "../sections/Pricing";
import Testimonials from "../sections/Testimonials";
import TrustedCompanies from "../sections/TrustedCompanies";

export default function HeroLanding() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TrustedCompanies />
      <FeaturesSection />
      <Testimonials />
      <Pricing />
      <FaqSection />
      <BottomBanner />
      <Footer />
    </>
  );
}