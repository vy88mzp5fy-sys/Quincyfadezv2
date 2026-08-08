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
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

const HEADER_OFFSET = 72;

function App() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis = null;
    let raf = null;

    const getTarget = (id) =>
      id === "#top" ? document.documentElement : document.querySelector(id);

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;

      const id = a.getAttribute("href");
      const el = getTarget(id);
      if (!el) return;

      e.preventDefault();

      if (media.matches || !lenis) {
        if (id === "#top") {
          window.scrollTo({ top: 0, behavior: media.matches ? "auto" : "smooth" });
          return;
        }

        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: media.matches ? "auto" : "smooth" });
        return;
      }

      lenis.scrollTo(el, {
        offset: id === "#top" ? 0 : -HEADER_OFFSET,
      });
    };

    document.addEventListener("click", onClick);

    if (!media.matches) {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const loop = (time) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
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
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

export default App;
