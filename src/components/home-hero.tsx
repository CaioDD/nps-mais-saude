'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type HomeHeroProps = {
  whatsappUrl: string;
};

const slides = [
  {
    eyebrow: 'Cuidado que acompanha',
    title: 'Saúde para cada fase',
    emphasis: 'Da sua família',
    description: 'Exames de rotina, ultrassonografia e atendimento próximo para você cuidar de quem mais importa.',
    cta: 'Conhecer os exames',
    detail: 'Uma clínica completa, com linguagem simples e acolhimento do primeiro contato até o resultado.',
    imageDesktop: '/images/hero-family-desktop.webp',
    imageMobile: '/images/hero-family-mobile.webp',
    imageAlt: 'Família reunida em um momento de carinho',
    imagePosition: 'center center',
    tone: 'family',
  },
  {
    eyebrow: 'Orçamento rápido',
    title: 'Envie sua requisição',
    emphasis: 'Receba seu orçamento',
    description: 'Mande uma foto do pedido médico pelo WhatsApp. Nossa equipe confere os exames e orienta você com clareza.',
    cta: 'Solicitar agora',
    detail: 'Atendimento direto com a equipe para confirmar exames, preparo, valores e a unidade mais conveniente.',
    imageDesktop: '/images/hero-request-desktop.webp',
    imageMobile: '/images/hero-request-mobile.webp',
    imageAlt: 'Mulher enviando uma foto de sua requisição médica pelo celular',
    imagePosition: '62% center',
    tone: 'quote',
  },
  {
    eyebrow: 'Conveniência e acolhimento',
    title: 'A Mais Saúde',
    emphasis: 'Vai até você',
    description: 'Pergunte sobre a disponibilidade da coleta domiciliar e faça seus exames com mais conforto.',
    cta: 'Agendar coleta',
    detail: 'A equipe combina o melhor horário e explica tudo o que você precisa saber antes da coleta.',
    imageDesktop: '/images/hero-home-collection-desktop.webp',
    imageMobile: '/images/hero-home-collection-mobile.webp',
    imageAlt: 'Profissional da Mais Saúde preparando uma paciente para coleta domiciliar',
    imagePosition: '60% center',
    tone: 'home',
  },
] as const;

const SLIDE_DURATION = 9000;

function AnimatedWords({ text, start = 0 }: { text: string; start?: number }) {
  let letterOffset = start;

  return text.split(' ').map((word, wordIndex) => {
    const wordStart = letterOffset;
    letterOffset += Array.from(word).length;

    return (
      <span className="brand-hero-word" key={`${word}-${wordIndex}`}>
        {Array.from(word).map((letter, letterIndex) => (
          <span
            className="brand-hero-letter-mask"
            aria-hidden="true"
            key={`${letter}-${letterIndex}`}
          >
            <span
              className="brand-hero-letter"
              style={{ '--letter-delay': `${1.15 + (wordStart + letterIndex) * 0.035}s` } as React.CSSProperties}
            >
              {letter}
            </span>
          </span>
        ))}
        <span className="sr-only">{word} </span>
      </span>
    );
  });
}

export default function HomeHero({ whatsappUrl }: HomeHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const touchStart = useRef<number | null>(null);

  const showSlide = useCallback((nextIndex: number, nextDirection: 'next' | 'previous') => {
    if (activeSlide === nextIndex) return;
    setPreviousSlide(activeSlide);
    setDirection(nextDirection);
    setActiveSlide(nextIndex);
  }, [activeSlide]);

  const goNext = useCallback(() => {
    showSlide((activeSlide + 1) % slides.length, 'next');
  }, [activeSlide, showSlide]);

  const goPrevious = useCallback(() => {
    showSlide((activeSlide - 1 + slides.length) % slides.length, 'previous');
  }, [activeSlide, showSlide]);

  useEffect(() => {
    const timer = window.setInterval(goNext, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, [goNext]);

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStart.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStart.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (Math.abs(distance) < 48) return;
    if (distance < 0) goNext();
    else goPrevious();
  };

  return (
    <section
      className="brand-hero"
      id="topo"
      data-direction={direction}
      aria-roledescription="carrossel"
      aria-label="Destaques da Clínica e Laboratório Mais Saúde"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="brand-hero-stage">
        {slides.map((slide, index) => {
          const isActive = index === activeSlide;
          const isLeaving = index === previousSlide;
          const state = isActive
            ? 'active'
            : isLeaving
              ? `leaving-${direction}`
              : `standby-${direction}`;
          const ctaHref = slide.tone === 'family' ? '#o-que-fazemos' : whatsappUrl;
          const external = slide.tone !== 'family';

          return (
            <article
              className={`brand-hero-slide brand-hero-slide-${slide.tone}`}
              data-state={state}
              aria-hidden={!isActive}
              key={slide.title}
            >
              <div className="brand-hero-photo" style={{ '--hero-position': slide.imagePosition } as React.CSSProperties}>
                <picture>
                  <source media="(max-width: 720px)" srcSet={slide.imageMobile} />
                  <Image
                    src={slide.imageDesktop}
                    alt={isActive ? slide.imageAlt : ''}
                    fill
                    sizes="100vw"
                    loading="eager"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    className="brand-hero-image"
                  />
                </picture>
              </div>
              <div className="brand-hero-shade" />

              <div className="brand-hero-layout wrap">
                <div className="brand-hero-copy">
                  <p className="brand-hero-eyebrow">
                    <span className="brand-hero-eyebrow-dot" aria-hidden="true" />
                    <span className="brand-hero-eyebrow-text">{slide.eyebrow}</span>
                  </p>
                  <h1>
                    <span className="brand-hero-line">
                      <AnimatedWords text={slide.title} />
                    </span>
                    <strong className="brand-hero-line">
                      <AnimatedWords text={slide.emphasis} start={slide.title.replace(/\s/g, '').length} />
                    </strong>
                  </h1>
                  <p className="brand-hero-description">{slide.description}</p>
                  <a
                    className="brand-hero-cta"
                    href={ctaHref}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {slide.cta}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>

                <aside className="brand-hero-info" aria-label={`Destaque ${index + 1} de ${slides.length}`}>
                  <div className="brand-hero-info-top">
                    <span className="brand-hero-number">{String(index + 1).padStart(2, '0')}</span>
                    <div className="brand-hero-arrows">
                      <button type="button" onClick={goPrevious} aria-label="Destaque anterior" tabIndex={isActive ? 0 : -1}>←</button>
                      <button type="button" onClick={goNext} aria-label="Próximo destaque" tabIndex={isActive ? 0 : -1}>→</button>
                    </div>
                  </div>
                  <p>{slide.detail}</p>
                  <div className="brand-hero-progress" aria-hidden="true"><span /></div>
                </aside>
              </div>
            </article>
          );
        })}


        <div className="brand-hero-dots" role="group" aria-label="Escolher destaque">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === activeSlide ? 'active' : ''}
              onClick={() => showSlide(index, index > activeSlide ? 'next' : 'previous')}
              aria-label={`Mostrar: ${slide.emphasis}`}
              aria-current={index === activeSlide ? 'true' : undefined}
              key={slide.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
