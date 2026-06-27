'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BrandCross from './brand-cross';

const links = [
  { id: 'quem-somos', href: '/#quem-somos', label: 'Quem somos' },
  { id: 'o-que-fazemos', href: '/#o-que-fazemos', label: 'O que fazemos' },
  { id: 'agendar', href: '/#onde-estamos', label: 'Agendar', cta: true },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="header-zone">
      <header className={`header ${shrink ? 'shrink' : ''}`}>
        <Link href="/#topo" className="brand" onClick={close}>
          <BrandCross className="logo" />
          Mais Saúde
        </Link>
        <nav className="nav-links" aria-label="Navegação principal">
          {links.map((link) => (
            <Link key={link.id} href={link.href} className={link.cta ? 'nav-cta' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="burger"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </header>
      <div className={`drawer ${open ? 'open' : ''}`}>
        {links.map((link) => (
          <Link key={link.id} href={link.href} className={link.cta ? 'd-cta' : ''} onClick={close}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
