'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

const links = [
  { id: 'quem-somos', href: '/#quem-somos', label: 'Quem somos' },
  { id: 'o-que-fazemos', href: '/#o-que-fazemos', label: 'Guia de exames' },
  { id: 'resultados', href: '/#onde-estamos', label: 'Resultado de exames' },
  { id: 'coleta', href: '/#onde-estamos', label: 'Coleta domiciliar' },
  { id: 'unidades', href: '/#onde-estamos', label: 'Unidades de atendimento' },
  { id: 'avaliar', href: '/nps', label: 'Avaliar atendimento', cta: true },
];

type Panel = 'menu' | 'search' | null;

export default function SiteHeader() {
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [shrink, setShrink] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (panel === 'search') searchInputRef.current?.focus();
  }, [panel]);

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalizedQuery) return links;
    return links.filter((link) => link.label.toLocaleLowerCase('pt-BR').includes(normalizedQuery));
  }, [query]);

  const close = () => setPanel(null);
  const togglePanel = (nextPanel: Exclude<Panel, null>) => {
    setPanel((current) => (current === nextPanel ? null : nextPanel));
  };

  return (
    <div className="header-zone">
      <header className={`header ${shrink ? 'shrink' : ''}`}>
        <Link href="/#topo" className="brand brand-official" onClick={close} aria-label="Mais Saúde — início">
          <Image
            src="/brand/mais-saude-logo-mark.svg"
            width={112}
            height={126}
            alt=""
            className="brand-logo-image"
            loading="eager"
            unoptimized
          />
          <span className="sr-only">Clínica e Laboratório Mais Saúde</span>
        </Link>

        <div className="header-tools">
          <button
            className={`header-tool burger ${panel === 'menu' ? 'active' : ''}`}
            type="button"
            aria-label={panel === 'menu' ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={panel === 'menu'}
            aria-controls="site-menu"
            onClick={() => togglePanel('menu')}
          >
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="5" y1="9" x2="27" y2="9" />
              <line x1="9" y1="16" x2="27" y2="16" />
              <line x1="13" y1="23" x2="27" y2="23" />
            </svg>
          </button>
          <button
            className={`header-tool search-button ${panel === 'search' ? 'active' : ''}`}
            type="button"
            aria-label={panel === 'search' ? 'Fechar busca' : 'Abrir busca'}
            aria-expanded={panel === 'search'}
            aria-controls="site-search"
            onClick={() => togglePanel('search')}
          >
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <circle cx="14" cy="14" r="8.5" />
              <line x1="20.5" y1="20.5" x2="28" y2="28" />
            </svg>
          </button>
        </div>
      </header>

      <nav id="site-menu" className={`drawer menu-drawer ${panel === 'menu' ? 'open' : ''}`} aria-label="Navegação principal">
        <div className="drawer-title">Menu</div>
        <div className="drawer-grid">
          {links.map((link) => (
            <Link key={link.id} href={link.href} className={link.cta ? 'd-cta' : ''} onClick={close}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <div id="site-search" className={`drawer search-drawer ${panel === 'search' ? 'open' : ''}`} role="search">
        <label htmlFor="site-search-input">O que você procura?</label>
        <div className="search-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" />
          </svg>
          <input
            ref={searchInputRef}
            id="site-search-input"
            type="search"
            value={query}
            placeholder="Exames, unidades ou atendimento"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="search-results" aria-live="polite">
          {filteredLinks.length ? (
            filteredLinks.map((link) => (
              <Link key={link.id} href={link.href} onClick={close}>{link.label}</Link>
            ))
          ) : (
            <span>Nenhum atalho encontrado.</span>
          )}
        </div>
      </div>
    </div>
  );
}
