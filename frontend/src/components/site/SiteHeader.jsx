import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { LINKS } from "@/data/site";

const NAV = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Visit", href: "#visit" },
];

export const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      data-testid="site-header"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? "border-b border-white/10 bg-black/75 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <a
          href="#top"
          onClick={closeMenu}
          data-testid="brand-logo"
          className="brand-logo-link flex items-center leading-none"
          aria-label="QuincyFadez Home"
        >
          <span className="brand-metal font-['Anton'] text-2xl uppercase tracking-tight md:text-[42px]">
            QuincyFadez
          </span>
          <span className="brand-dot ml-2 h-1.5 w-1.5 rounded-full bg-white/90 md:ml-2.5 md:h-2 md:w-2" />
        </a>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary Navigation">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className="group relative font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:text-white"
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={LINKS.booking}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="header-book-btn"
            className="hidden rounded-full border border-white/20 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black sm:inline-flex"
          >
            Book Now
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 md:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-white/10 px-5 pb-6 pt-4" aria-label="Mobile Navigation">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-white/10 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300"
            >
              {n.label}
              <span>↗</span>
            </a>
          ))}
          <a
            href={LINKS.booking}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-white py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-black"
          >
            Book Your Appointment
          </a>
        </nav>
      </div>
    </header>
  );
};
