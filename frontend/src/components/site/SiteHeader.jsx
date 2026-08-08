import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { LINKS } from "@/data/site";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#work" },
  { label: "Visit", href: "#visit" },
];

export const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = mobileNavRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => mobileNavRef.current?.querySelector("a")?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };

    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      data-testid="site-header"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? "border-b border-white/10 bg-[#050505]/82 shadow-[0_12px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
          : "border-b border-transparent bg-gradient-to-b from-black/35 to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 sm:px-7 md:px-10 md:py-5 lg:px-12">
        <a
          href="#top"
          onClick={closeMenu}
          data-testid="brand-logo"
          className="flex items-center leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          aria-label="QuincyFadez Home"
        >
          <span className="font-['Anton'] text-[26px] uppercase tracking-[-0.035em] text-white md:text-[34px]">
            Quincy<span className="text-[var(--qf-gold)]">Fadez</span>
          </span>
          <span className="ml-2 text-[var(--qf-gold)]" aria-hidden="true">◆</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary Navigation">
          {NAV.map((n, index) => (
            <a
              key={n.href}
              href={n.href}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={`group relative font-mono text-[10px] uppercase tracking-[0.24em] transition-colors focus-visible:outline-none ${
                index === 0 ? "text-[var(--qf-gold)]" : "text-zinc-300 hover:text-white focus-visible:text-white"
              }`}
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--qf-gold)] transition-all duration-300 group-hover:w-full group-focus-visible:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={LINKS.booking}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Book QuincyFadez Appointment (Opens In A New Tab)"
            data-testid="header-book-btn"
            className="qf-gold-button hidden rounded-full px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:inline-flex"
          >
            Book Now
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((v) => !v)}
            className="qf-glass inline-flex h-11 w-11 items-center justify-center rounded-full text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/70 lg:hidden"
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        ref={mobileNavRef}
        aria-hidden={!menuOpen}
        className={`overflow-hidden transition-[max-height,opacity] duration-500 lg:hidden motion-reduce:transition-none ${
          menuOpen ? "max-h-[32rem] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-white/10 bg-[#070707]/96 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-2xl" aria-label="Mobile Navigation">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
              className="flex min-h-14 items-center justify-between border-b border-white/10 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-[var(--qf-gold-soft)]"
            >
              {n.label}
              <span className="qf-gold" aria-hidden="true">↗</span>
            </a>
          ))}
          <a
            href={LINKS.booking}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Book QuincyFadez Appointment (Opens In A New Tab)"
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
            className="qf-gold-button mt-5 flex w-full items-center justify-center rounded-full py-4 font-mono text-[10px] uppercase tracking-[0.2em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Book Your Appointment
          </a>
        </nav>
      </div>
    </header>
  );
};
