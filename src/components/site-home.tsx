import Image from 'next/image';
import Link from 'next/link';
import BrandCross from './brand-cross';
import HomeHero from './home-hero';
import SiteHeader from './site-header';
import WhatsAppIcon from './whatsapp-icon';
import { FILIAIS_LIST } from '@/lib/filiais';

const stats = [
  ['6', 'na baixada'],
  ['+ cuidado', 'atendimento próximo'],
  ['Rotina', 'exames clínicos'],
  ['2025', 'reconhecimento regional'],
  ['Em casa', 'coleta a domicílio'],
];

const services = [
  ['Análises clínicas', 'Sangue, urina e fezes. Glicose, colesterol, tireoide, hemograma e toda a rotina que seu médico pediu.'],
  ['Exame toxicológico', 'Para tirar ou renovar a CNH e para motoristas profissionais, com orientação clara sobre prazo e preparo.'],
  ['Ultrassonografia', 'Ultrassom de várias áreas, com equipamento de qualidade e atendimento cuidadoso.'],
  ['Sexagem fetal', 'Descubra se é menino ou menina ainda nas primeiras semanas, com um exame de sangue simples.'],
  ['Check-ups e combos', 'Pacotes que reúnem exames de rotina por idade, com preço pensado para caber no orçamento.'],
];

const steps = [
  ['Fale com a gente', 'Mande uma mensagem, tire sua dúvida e escolha o melhor dia e horário.'],
  ['Faça o exame', 'Vá até a unidade mais perto ou pergunte pela coleta em casa.'],
  ['Receba o resultado', 'No prazo combinado e explicado de um jeito claro, sem você sair com dúvida.'],
];

const pinheiro = FILIAIS_LIST.find((filial) => filial.slug === 'pinheiro');
const pinheiroWhatsAppUrl = pinheiro && 'whatsappUrl' in pinheiro ? pinheiro.whatsappUrl : '#contato';
const instagramUrl = 'https://www.instagram.com/labmaissaude_/#';

export default function SiteHome() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <a href={pinheiroWhatsAppUrl} className="wa-float" target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
        <span className="ico">
          <WhatsAppIcon />
        </span>
        <span className="label">Agendar no WhatsApp</span>
      </a>

      <HomeHero whatsappUrl={pinheiroWhatsAppUrl} />

      <section className="stats" aria-label="Indicadores">
        <div className="wrap">
          {stats.map(([num, label]) => (
            <div className="stat" key={label}>
              <div className="num">{num}</div>
              <div className="lbl">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec about" id="quem-somos">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-visual">
              <BrandCross className="about-watermark" />
              <div className="care-seal" aria-label="O jeito Mais Saúde de cuidar">
                <span>O jeito Mais Saúde de cuidar</span>
                <BrandCross className="care-seal-mark" />
                <div className="care-signature">
                  <strong>Escuta</strong>
                  <i aria-hidden="true" />
                  <strong>Clareza</strong>
                  <i aria-hidden="true" />
                  <strong>Proximidade</strong>
                </div>
              </div>
            </div>
            <div className="about-body">
              <div className="sec-eyebrow">
                <BrandCross />
                Quem somos
              </div>
              <p className="lead-line">A clínica que trata você como gente, não como número.</p>
              <p>
                Quem trabalha duro, cuida da casa e levanta cedo merece um exame preciso, um resultado que entende e um atendimento sem pressa.
              </p>
              <p>
                A gente é daqui, conhece cada cidade onde está e quer continuar sendo a clínica que você indica para sua família.
              </p>
              <Link href="/nps" className="link">
                Avalie sua experiência
                <BrandCross />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec exams" id="o-que-fazemos">
        <div className="wrap">
          <div className="sec-eyebrow">
            <BrandCross />
            O que fazemos
          </div>
          <h2 className="sec-title">
            O que sua família precisa, <em>num lugar só</em>
          </h2>
          <p className="sec-intro">
            Do exame de sangue de rotina ao toxicológico da CNH. A gente cuida de tudo com a mesma atenção e explica cada passo.
          </p>
          <div className="exam-grid">
            {services.map(([title, text]) => (
              <article className="exam-card" key={title}>
                <div className="exam-ico">
                  <BrandCross />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <a className="go" href="#onde-estamos">
                  Agendar pelo WhatsApp <BrandCross />
                </a>
              </article>
            ))}
            <a href="#onde-estamos" className="exam-card exam-card-dark">
              <div className="exam-ico">
                <BrandCross />
              </div>
              <h3>Ficou com alguma dúvida?</h3>
              <p>Fale com a unidade mais próxima. A equipe confirma se fazemos seu exame e orienta sobre preparo, prazo e agendamento.</p>
              <span className="go">Ver unidades <BrandCross /></span>
            </a>
          </div>
        </div>
      </section>

      <section className="sec how">
        <div className="wrap">
          <div className="sec-eyebrow">
            <BrandCross />
            Simples do começo ao fim
          </div>
          <h2 className="sec-title">
            Marcar seu exame leva <em>menos de um minuto</em>
          </h2>
          <div className="steps">
            {steps.map(([title, text], index) => (
              <div className="step" key={title}>
                <div className="n">{index + 1}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec where" id="onde-estamos">
        <div className="wrap">
          <div className="sec-eyebrow">
            <BrandCross />
            Onde estamos
          </div>
          <h2 className="sec-title">
            Seis cidades, <em>o mesmo cuidado</em>
          </h2>
          <p className="sec-intro">
            Escolha a unidade mais perto de você para falar no WhatsApp, abrir o mapa ou avaliar seu atendimento.
          </p>
          <div className="unit-grid">
            {FILIAIS_LIST.map((filial, index) => (
              <article className={`unit ${index === 0 ? 'flag' : ''}`} key={filial.slug}>
                <div className="unit-top">
                  <div className="unit-city">{filial.nome}</div>
                  <span className={`unit-tag ${index === 0 ? '' : 'lab'}`}>{filial.tipo}</span>
                </div>
                <div className="unit-row">
                  <span className="ic">•</span>
                  <span>{'endereco' in filial ? filial.endereco : 'Endereço em atualização'}</span>
                </div>
                <div className="unit-row">
                  <span className="ic">•</span>
                  <span>{'whatsapp' in filial ? filial.whatsapp : 'WhatsApp em atualização'}</span>
                </div>
                <div className="unit-actions">
                  {'whatsappUrl' in filial ? (
                    <a href={filial.whatsappUrl} className="unit-btn wa-btn" target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  ) : (
                    <span className="unit-btn disabled">WhatsApp</span>
                  )}
                  {'mapaUrl' in filial ? (
                    <a href={filial.mapaUrl} className="unit-btn" target="_blank" rel="noopener noreferrer">
                      Ver Mapa
                    </a>
                  ) : (
                    <span className="unit-btn disabled">Ver Mapa</span>
                  )}
                  <Link href={`/nps/${filial.slug}`} className="unit-btn">
                    Avaliar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="instagram-section" id="instagram" aria-labelledby="instagram-title">
        <div className="wrap">
          <div className="instagram-card">
            <span className="instagram-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="instagram-copy">
              <span>Acompanhe a Mais Saúde</span>
              <h2 id="instagram-title">Cuidado e informação também no Instagram</h2>
              <p>Novidades, orientações sobre exames e o dia a dia das nossas unidades, sempre perto de você.</p>
            </div>
            <a className="instagram-link" href={instagramUrl} target="_blank" rel="noopener noreferrer">
              Seguir @labmaissaude_
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="sec final" id="contato">
        <div className="wrap">
          <BrandCross />
          <h2>
            Bora cuidar disso <em>com calma e atenção?</em>
          </h2>
          <p>
            Escolha a unidade mais próxima e fale com a equipe para tirar dúvidas, confirmar preparo e combinar seu atendimento.
          </p>
          <a href="#onde-estamos" className="btn btn-primary">
            Encontrar unidade
          </a>
          <div className="sign">Cuide-se sempre.</div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="brand footer-brand">
                <Image
                  src="/brand/mais-saude-logo-mark.svg"
                  width={112}
                  height={126}
                  alt=""
                  className="footer-brand-logo"
                  unoptimized
                />
                <span>Mais Saúde</span>
              </div>
              <p className="foot-desc">Clínica e Laboratório. Perto de você, cuidando de verdade, no interior do Maranhão.</p>
            </div>
            <div>
              <h4>Navegue</h4>
              <ul>
                <li><a href="#quem-somos">Quem somos</a></li>
                <li><a href="#o-que-fazemos">O que fazemos</a></li>
                <li><a href="#onde-estamos">Onde estamos</a></li>
                <li><Link href="/nps">NPS</Link></li>
              </ul>
            </div>
            <div>
              <h4>Fale com a gente</h4>
              <ul>
                <li><a href={pinheiroWhatsAppUrl} target="_blank" rel="noopener noreferrer">WhatsApp da sede: 98 98498-6804</a></li>
                <li><a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram: @labmaissaude_</a></li>
                <li><span>E-mail em atualização</span></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Clínica e Laboratório Mais Saúde. Todos os direitos reservados.</span>
            <span>Responsável técnico em atualização</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
