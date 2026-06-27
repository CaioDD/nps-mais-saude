import Link from 'next/link';
import BrandCross from './brand-cross';
import SiteHeader from './site-header';
import WhatsAppIcon from './whatsapp-icon';
import { FILIAIS_LIST } from '@/lib/filiais';

const stats = [
  ['6', 'unidades no Maranhão'],
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

      <header className="hero" id="topo">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="hero-badge">
                <BrandCross />
                Perto de você
              </span>
              <h1>
                Cuidado de laboratório com <em>atenção de verdade</em>
              </h1>
              <p className="hero-lead">
                Exames, orientação e acolhimento para quem quer resolver a saúde com clareza, rapidez e gente que escuta.
              </p>
              <div className="hero-actions">
                <a href="#onde-estamos" className="btn btn-primary">
                  Falar no WhatsApp
                </a>
                <Link href="/nps" className="btn btn-ghost">
                  Avaliar atendimento
                </Link>
              </div>
              <div className="hero-trust">
                <BrandCross />
                Atendimento em múltiplas cidades do interior do Maranhão.
              </div>
            </div>
            <div className="hero-photo">
              <div className="journey-card">
                <span className="journey-kicker">Agende sem complicação</span>
                <h2>Seu exame começa com uma conversa simples</h2>
                <div className="journey-steps" aria-label="Como agendar seu exame">
                  <div>
                    <strong>1</strong>
                    <span>Fale com a gente</span>
                  </div>
                  <div>
                    <strong>2</strong>
                    <span>Faça o exame</span>
                  </div>
                  <div>
                    <strong>3</strong>
                    <span>Receba o resultado</span>
                  </div>
                </div>
                <a href="#onde-estamos" className="journey-cta">
                  Ver unidades <BrandCross />
                </a>
              </div>
            </div>
          </div>
        </div>
        <svg className="hero-wave" viewBox="0 0 1440 94" preserveAspectRatio="none" aria-hidden="true">
          <path fill="var(--green-deep)" d="M0 40L80 46.7C160 53 320 67 480 58.7C640 50 800 20 960 13.3C1120 7 1280 23 1360 31.7L1440 40V94H0Z" />
        </svg>
      </header>

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
              <div className="brand">
                <BrandCross className="logo" />
                Mais Saúde
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
                <li><span>@labmaissaude_</span></li>
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
