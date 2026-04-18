import { useState, useEffect } from 'react'
import './index.css'

const WA = 'https://wa.me/56984025276'

const TICKER_ITEMS = [
  'ENTREGA EN 24H', 'DISEÑO PROFESIONAL', 'DESDE $99.000 CLP',
  'GARANTÍA TOTAL', 'SIN REUNIONES', 'PYMES CHILENAS',
  'ONLINE MAÑANA', 'WEB PROFESIONAL',
  'ENTREGA EN 24H', 'DISEÑO PROFESIONAL', 'DESDE $99.000 CLP',
  'GARANTÍA TOTAL', 'SIN REUNIONES', 'PYMES CHILENAS',
  'ONLINE MAÑANA', 'WEB PROFESIONAL',
]

const PLANS = [
  {
    name: 'Express',
    price: '$99.000',
    featured: false,
    features: [
      '1 página landing completa',
      'Diseño responsive mobile-first',
      'Formulario de contacto',
      'Botón WhatsApp flotante',
      '1 revisión post-entrega',
      'Entrega en 24 horas',
    ],
  },
  {
    name: 'Pro',
    price: '$149.000',
    featured: true,
    features: [
      'Hasta 4 secciones',
      'Diseño premium con animaciones',
      'SEO básico incluido',
      'Google Analytics + Maps',
      'Dominio .com gratis 1 año',
      '2 revisiones post-entrega',
      'Entrega en 24 horas',
    ],
  },
  {
    name: 'Business',
    price: '$199.000',
    featured: false,
    features: [
      'Multi-página hasta 6 secciones',
      'Blog o catálogo de productos',
      'Copywriting con IA incluido',
      'Google Analytics + Maps',
      '3 revisiones post-entrega',
      'Entrega en 24-48 horas',
    ],
  },
]

const NICHES = [
  { emoji: '🍕', name: 'Restaurantes' },
  { emoji: '🦷', name: 'Dentistas' },
  { emoji: '⚖️', name: 'Abogados' },
  { emoji: '💪', name: 'Coaches' },
  { emoji: '✂️', name: 'Peluquerías' },
  { emoji: '🏗️', name: 'Constructoras' },
]

const FAQS = [
  {
    q: '¿Realmente en 24 horas?',
    a: 'Sí. Desde que recibes el pago y completas el formulario, el reloj empieza. Mañana a la misma hora tienes tu web online.',
  },
  {
    q: '¿Y si no me gusta el resultado?',
    a: 'Tienes 2 revisiones gratis dentro de las 48h post-entrega. Si aun así no quedas conforme, te devolvemos el 100%. Sin letra chica.',
  },
  {
    q: '¿Necesito saber de tecnología?',
    a: 'Cero. Solo llenas un formulario de 10 minutos con la info de tu negocio y nosotros hacemos todo el trabajo.',
  },
  {
    q: '¿Aceptas transferencia bancaria?',
    a: 'Sí. Aceptamos transferencia, tarjeta de crédito/débito hasta 3 cuotas, y también 50% al iniciar + 50% al entregar.',
  },
  {
    q: '¿El plan Pro incluye dominio?',
    a: 'Sí. El plan Pro incluye dominio .com gratis por 1 año (valor $12.000 CLP). En Express puedes usar tu dominio existente.',
  },
]

export default function App() {
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const els = document.querySelectorAll('.fade-in')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <span className="logo">Hazlo Listo</span>
        <a className="btn btn-primary" href={WA} target="_blank" rel="noreferrer">
          Quiero mi web →
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">24H</div>
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <em>✦</em> Páginas web para pymes chilenas
          </div>
          <h1 className="hero-title">
            Tu web lista<br />en <span>24 horas.</span>
          </h1>
          <p className="hero-sub">
            Sin reuniones eternas. Sin agencias lentas.<br />
            Pagas, llenas un formulario y mañana estás online.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary lg" href={WA} target="_blank" rel="noreferrer">
              Quiero mi web ahora →
            </a>
            <span className="hero-badge">🔒 Garantía de devolución si no te gusta</span>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrapper" aria-hidden="true">
        <div className="marquee-track">
          {TICKER_ITEMS.map((t, i) => (
            <span key={i} className="marquee-item">{t}&nbsp;&nbsp;✦&nbsp;&nbsp;</span>
          ))}
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section className="section fade-in">
        <div className="container">
          <p className="section-label">El proceso</p>
          <h2 className="section-title">Simple. Rápido. Listo.</h2>
          <div className="steps">
            {[
              { n: '01', t: 'Nos escribes por WhatsApp', d: 'Sin formularios previos. Sin reuniones. Solo un mensaje directo.' },
              { n: '02', t: 'Llenas el formulario', d: '10 minutos. Solo la info básica de tu negocio. Nosotros hacemos el resto.' },
              { n: '03', t: 'Mañana estás online', d: 'Tu web profesional, con dominio y SSL, lista en menos de 24 horas.' },
            ].map(s => (
              <div key={s.n} className="step">
                <span className="step-num">{s.n}</span>
                <h3 className="step-name">{s.t}</h3>
                <p className="step-desc">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIÉN ES */}
      <section className="section section-alt fade-in">
        <div className="container">
          <p className="section-label">Para quién es</p>
          <h2 className="section-title">Cualquier negocio.<br />En 24 horas.</h2>
          <div className="niches">
            {NICHES.map(n => (
              <div key={n.name} className="niche">
                <span className="niche-emoji">{n.emoji}</span>
                <span className="niche-name">{n.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="section fade-in">
        <div className="container">
          <p className="section-label">Planes y precios</p>
          <h2 className="section-title">Sin sorpresas.<br />Todo en CLP.</h2>
          <div className="plans">
            {PLANS.map(p => (
              <div key={p.name} className={`plan${p.featured ? ' featured' : ''}`}>
                {p.featured && <span className="plan-badge">Más popular</span>}
                <p className="plan-name">{p.name}</p>
                <p className="plan-price">{p.price}</p>
                <span className="plan-currency">CLP · pago único</span>
                <ul className="plan-features">
                  {p.features.map(f => (
                    <li key={f}><span className="chk">✓</span>{f}</li>
                  ))}
                </ul>
                <a
                  href={WA}
                  target="_blank"
                  rel="noreferrer"
                  className={`plan-btn${p.featured ? ' feat' : ''}`}
                >
                  Empezar ahora →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt fade-in">
        <div className="container-sm">
          <p className="section-label">Preguntas frecuentes</p>
          <h2 className="section-title">Todo claro,<br />sin letra chica.</h2>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-btn"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{f.q}</span>
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-answer">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final fade-in">
        <h2 className="cta-title">¿Listo para estar<br />online mañana?</h2>
        <p className="cta-sub">Escríbenos hoy. Tu web estará lista en 24 horas.</p>
        <a className="btn btn-cta" href={WA} target="_blank" rel="noreferrer">
          Escribir por WhatsApp →
        </a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span className="logo">Hazlo Listo</span>
        <span className="footer-copy">© 2025 · Hazlo listo. En 24 horas.</span>
        <a className="footer-ig" href="https://instagram.com/hazlolisto" target="_blank" rel="noreferrer">
          @hazlolisto
        </a>
      </footer>
    </>
  )
}
