import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
          Strategy: fixed, centered with margin: 0 auto approach.
          The pill itself is the nav — full width inside a centered container.
      */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 1rem',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          id="main-nav"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: '880px',
            pointerEvents: 'auto',
          }}
        >
          {/* Pill container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: scrolled ? 'rgba(8,11,15,0.95)' : 'rgba(8,11,15,0.72)',
              boxShadow: scrolled
                ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)'
                : '0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
            {/* ── Logo (left) ── */}
            <Link
              to="/"
              id="nav-logo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                flexShrink: 0,
                marginRight: 'auto',
              }}
            >
              <div style={{
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2"/>
                  <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.8"/>
                  <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.6"/>
                  <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5"/>
                </svg>
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}>
                BlueprintAI
              </span>
            </Link>

            {/* ── Center Nav Links ── */}
            <div className="hidden md:flex" style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  id={`nav-${link.label.toLowerCase()}`}
                  onClick={() => handleNavClick(link.href)}
                  style={{
                    position: 'relative',
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 450,
                    color: activeLink === link.href ? '#fff' : 'rgba(160,170,185,1)',
                    background: 'none',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (activeLink !== link.href) e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { if (activeLink !== link.href) e.currentTarget.style.color = 'rgba(160,170,185,1)'; }}
                >
                  {activeLink === link.href && (
                    <motion.span
                      layoutId="nav-pill"
                      style={{
                        position: 'absolute', inset: 0,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        display: 'block',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{link.label}</span>
                </button>
              ))}
            </div>

            {/* ── Right: Sign In + Get Started ── */}
            <div className="hidden md:flex" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginLeft: 'auto',
              flexShrink: 0,
            }}>
              <Link
                to="/login"
                id="nav-signin"
                style={{
                  fontSize: 13,
                  color: 'rgba(160,170,185,1)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  padding: '0 4px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,170,185,1)'}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-get-started"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '5px 14px',
                  borderRadius: 8,
                  background: '#3B82F6',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 0 16px rgba(59,130,246,0.3)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#3B82F6';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.3)';
                }}
              >
                Get Started
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              id="mobile-menu-toggle"
              className="flex md:hidden"
              style={{
                marginLeft: 'auto',
                flexDirection: 'column',
                gap: 5,
                padding: 8,
                borderRadius: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <span style={{ display: 'block', width: 20, height: 1, background: 'rgba(255,255,255,0.6)' }} />
              <span style={{ display: 'block', width: 14, height: 1, background: 'rgba(255,255,255,0.6)' }} />
              <span style={{ display: 'block', width: 20, height: 1, background: 'rgba(255,255,255,0.6)' }} />
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
              style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              id="mobile-nav-drawer"
              style={{
                position: 'fixed', insetY: 0, right: 0, top: 0, bottom: 0,
                zIndex: 70, width: 280,
                display: 'flex', flexDirection: 'column',
                background: '#0D1117',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
              }}
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>BlueprintAI</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 8, borderRadius: 8 }}
                  aria-label="Close menu"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <nav style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleNavClick(link.href)}
                    style={{
                      textAlign: 'left', padding: '10px 16px',
                      fontSize: 14, color: 'rgba(255,255,255,0.5)',
                      background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </nav>
              <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  style={{ display: 'block', textAlign: 'center', padding: '10px', fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  style={{ display: 'block', textAlign: 'center', padding: '10px', fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', background: '#3B82F6', borderRadius: 8 }}>
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
