import HeroSection from "@/components/HeroSection";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import TemplateGallery from "@/components/TemplateGallery";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <HeroSection />
        <SubscriptionPlans />
        <TemplateGallery />
      </main>
      <Footer />
    </div>
  );
};

export default Index;