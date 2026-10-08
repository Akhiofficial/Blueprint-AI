import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/ui/Button';
import blueprintLogo from '../../../assets/BlueprintAI_Logo.png';

const navLinks = [
  { label: 'Product',    href: '#product' },
  { label: 'Workflow',   href: '#workflow' },
  { label: 'Features',   href: '#features' },
  { label: 'Technology', href: '#technology' },
];

const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (href) => {
    setActiveLink(href);
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ══ Navbar ══
          Strategy: fixed, centered pill container
      */}
      <div
        className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none"
      >
        <motion.div
          id="main-nav"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[880px] pointer-events-auto"
        >
          {/* Pill container */}
          <div
            className={`
              flex items-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl
              border border-white/[0.08] backdrop-blur-xl transition-all duration-300
              ${scrolled
                ? 'bg-[#080B0F]/95 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]'
                : 'bg-[#080B0F]/75 shadow-[0_4px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)]'}
            `}
          >
            {/* ── Logo (left) ── */}
            <Link
              to="/"
              id="nav-logo"
              className="flex items-center flex-shrink-0 mr-auto focus:outline-none"
              aria-label="BlueprintAI Home"
            >
              <img
                src={blueprintLogo}
                alt="BlueprintAI"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>

            {/* ── Center Nav Links ── */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  id={`nav-${link.label.toLowerCase()}`}
                  onClick={() => handleNavClick(link.href)}
                  className={`
                    relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                    ${activeLink === link.href ? 'text-white' : 'text-slate-400 hover:text-white'}
                  `}
                >
                  {activeLink === link.href && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] block"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              ))}
            </div>

            {/* ── Right: Sign In + Get Started ── */}
            <div className="hidden md:flex items-center gap-2.5 ml-auto flex-shrink-0">
              <Link
                to="/login"
                id="nav-signin"
                className="text-xs font-medium text-slate-400 hover:text-white px-2 py-1 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Button
                to="/register"
                id="nav-get-started"
                variant="primary"
                size="sm"
              >
                Get Started
              </Button>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              id="mobile-menu-toggle"
              className="flex md:hidden ml-auto flex-col gap-1.5 p-2 rounded-lg text-slate-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <span className="block w-5 h-0.5 bg-slate-300 rounded-full" />
              <span className="block w-3.5 h-0.5 bg-slate-300 rounded-full ml-auto" />
              <span className="block w-5 h-0.5 bg-slate-300 rounded-full" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              id="mobile-nav-drawer"
              className="fixed inset-y-0 right-0 z-50 w-72 flex flex-col bg-[#0D1117] border-l border-white/[0.08] shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <img
                  src={blueprintLogo}
                  alt="BlueprintAI"
                  className="h-6 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none"
                  aria-label="Close navigation menu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <nav className="flex-1 p-5 flex flex-col gap-1.5">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    {link.label}
                  </motion.button>
                ))}
              </nav>

              <div className="p-5 border-t border-white/[0.06] flex flex-col gap-2.5">
                <Button
                  to="/login"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Button>
                <Button
                  to="/register"
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
