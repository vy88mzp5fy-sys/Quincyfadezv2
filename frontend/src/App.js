import { useEffect } from "react";
import Lenis from "lenis";
import "@/App.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroSection } from "@/components/site/HeroSection";
import { EditorialMarquee } from "@/components/site/EditorialMarquee";
import { TrustStrip } from "@/components/site/TrustStrip";
import { AboutManifesto } from "@/components/site/AboutManifesto";
import { WorkGallery } from "@/components/site/WorkGallery";
import { ServicesMenu } from "@/components/site/ServicesMenu";
import { HoursAndLocation } from "@/components/site/HoursAndLocation";
import { BookingCTA } from "@/components/site/BookingCTA";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

function App() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const el = id === "#top" ? document.body : document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: id === "#top" ? -1000 : -72 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="App relative min-h-screen bg-[#050505] text-white antialiased">
      <div className="grain" aria-hidden="true" />
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustStrip />
        <EditorialMarquee />
        <WorkGallery />
        <ServicesMenu />
        <AboutManifesto />
        <HoursAndLocation />
        <BookingCTA />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

export default App;
