import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../formulario.css'

const WA = 'https://wa.me/56984025276'

const RUBROS = [
  'Restaurante / Café', 'Dentista / Clínica', 'Abogado / Notaría',
  'Coach / Consultor', 'Peluquería / Barbería', 'Constructora / Inmobiliaria',
  'Tienda / Retail', 'Gimnasio / Fitness', 'Fotógrafo / Creativo',
  'Otro',
]

const ESTILOS = [
  { id: 'moderno',     label: 'Moderno',     desc: 'Limpio, minimalista, colores neutros' },
  { id: 'colorido',   label: 'Colorido',    desc: 'Vibrante, llamativo, con personalidad' },
  { id: 'elegante',   label: 'Elegante',    desc: 'Sofisticado, tipografía premium' },
  { id: 'amigable',   label: 'Amigable',    desc: 'Cercano, cálido, para todo público' },
]

const SECCIONES_OPT = [
  'Inicio / Hero', 'Sobre nosotros', 'Servicios', 'Galería de fotos',
  'Precios / Planes', 'Testimonios', 'Ubicación / Mapa', 'Contacto / Formulario',
]

const PASOS = ['Tu negocio', 'Contacto', 'Diseño', 'Contenido']

const emptyData = {
  nombre_negocio: '', rubro: '', descripcion: '', ciudad: '',
  nombre_contacto: '', whatsapp: '', email: '', plan: 'Pro',
  tiene_logo: false, colores: '', estilo: '', web_referencia: '',
  secciones: [], texto_propio: true,
  instagram: '', facebook: '', tiktok: '', google_maps: '', notas: '',
}

export default function Formulario() {
  const [paso, setPaso]     = useState(0)
  const [data, setData]     = useState(emptyData)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  function toggleSeccion(s) {
    setData(d => ({
      ...d,
      secciones: d.secciones.includes(s)
        ? d.secciones.filter(x => x !== s)
        : [...d.secciones, s],
    }))
  }

  function validarPaso() {
    if (paso === 0 && (!data.nombre_negocio.trim() || !data.rubro || !data.ciudad.trim())) {
      setError('Completa los campos obligatorios (*)'); return false
    }
    if (paso === 1 && (!data.nombre_contacto.trim() || !data.whatsapp.trim())) {
      setError('Completa los campos obligatorios (*)'); return false
    }
    setError(''); return true
  }

  function siguiente() {
    if (!validarPaso()) return
    setPaso(p => p + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function anterior() {
    setPaso(p => p - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    const payload = {
      ...data,
      secciones: JSON.stringify(data.secciones),
      whatsapp: data.whatsapp.replace(/\s/g, ''),
    }
    const { error: err } = await supabase.from('formularios').insert([payload])
    if (err) {
      setError('Hubo un problema al enviar. Escríbenos por WhatsApp.')
      setEnviando(false)
    } else {
      setEnviado(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ── ENVIADO ──
  if (enviado) {
    return (
      <div className="fo-wrap">
        <div className="fo-success">
          <div className="fo-success-icon">✅</div>
          <h2>¡Formulario enviado!</h2>
          <p>Recibimos toda la información de <strong>{data.nombre_negocio}</strong>. Comenzamos a trabajar de inmediato.</p>
          <p className="fo-success-sub">Nos contactaremos por WhatsApp para confirmar los detalles y enviarte el avance.</p>
          <a className="fo-btn-wa" href={WA} target="_blank" rel="noreferrer">
            💬 Escribirnos por WhatsApp
          </a>
          <a className="fo-back-link" href="/">← Volver al inicio</a>
        </div>
      </div>
    )
  }

  const progreso = ((paso) / PASOS.length) * 100

  return (
    <div className="fo-wrap">
      {/* HEADER */}
      <div className="fo-header">
        <a href="/" className="fo-logo">Hazlo Listo</a>
        <p className="fo-header-sub">Formulario de onboarding · ~10 minutos</p>
      </div>

      <div className="fo-card">
        {/* PROGRESO */}
        <div className="fo-progress-wrap">
          <div className="fo-steps-labels">
            {PASOS.map((p, i) => (
              <span key={p} className={`fo-step-label${i === paso ? ' active' : i < paso ? ' done' : ''}`}>
                {i < paso ? '✓' : i + 1}. {p}
              </span>
            ))}
          </div>
          <div className="fo-progress-bar">
            <div className="fo-progress-fill" style={{ width: `${progreso + 25}%` }} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── PASO 1: TU NEGOCIO ── */}
          {paso === 0 && (
            <div className="fo-paso">
              <h2 className="fo-paso-title">Cuéntanos sobre tu negocio</h2>
              <p className="fo-paso-sub">Esta información es la base de tu web.</p>

              <div className="fo-field">
                <label>Nombre del negocio *</label>
                <input
                  value={data.nombre_negocio}
                  onChange={e => set('nombre_negocio', e.target.value)}
                  placeholder="Ej: Restaurante La Cazuela"
                  autoFocus
                />
              </div>

              <div className="fo-field">
                <label>Rubro *</label>
                <select value={data.rubro} onChange={e => set('rubro', e.target.value)}>
                  <option value="">— Selecciona tu rubro —</option>
                  {RUBROS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="fo-field">
                <label>¿Qué hace tu negocio? Descríbelo en 2-3 líneas</label>
                <textarea
                  value={data.descripcion}
                  onChange={e => set('descripcion', e.target.value)}
                  placeholder="Ej: Somos un restaurante familiar especializado en comida italiana, ubicados en Providencia. Atendemos almuerzo y cena de martes a domingo."
                  rows={4}
                />
              </div>

              <div className="fo-field">
                <label>Ciudad / Comuna *</label>
                <input
                  value={data.ciudad}
                  onChange={e => set('ciudad', e.target.value)}
                  placeholder="Ej: Providencia, Santiago"
                />
              </div>
            </div>
          )}

          {/* ── PASO 2: CONTACTO ── */}
          {paso === 1 && (
            <div className="fo-paso">
              <h2 className="fo-paso-title">Información de contacto</h2>
              <p className="fo-paso-sub">¿Con quién coordinamos el proyecto?</p>

              <div className="fo-field">
                <label>Tu nombre *</label>
                <input
                  value={data.nombre_contacto}
                  onChange={e => set('nombre_contacto', e.target.value)}
                  placeholder="Ej: María González"
                  autoFocus
                />
              </div>

              <div className="fo-field">
                <label>WhatsApp *</label>
                <input
                  value={data.whatsapp}
                  onChange={e => set('whatsapp', e.target.value)}
                  placeholder="+56912345678"
                  type="tel"
                />
              </div>

              <div className="fo-field">
                <label>Email <span className="fo-optional">(opcional)</span></label>
                <input
                  value={data.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="tu@email.com"
                  type="email"
                />
              </div>

              <div className="fo-field">
                <label>Plan contratado</label>
                <div className="fo-plan-cards">
                  {[
                    { id: 'Express',  precio: '$79.000',  desc: '1 página' },
                    { id: 'Pro',      precio: '$100.000', desc: 'Hasta 4 secciones' },
                    { id: 'Business', precio: '$150.000', desc: 'Multi-página' },
                    { id: 'Gratis',   precio: 'Gratis',   desc: 'Portafolio' },
                  ].map(p => (
                    <div
                      key={p.id}
                      className={`fo-plan-card${data.plan === p.id ? ' active' : ''}`}
                      onClick={() => set('plan', p.id)}
                    >
                      <span className="fo-plan-name">{p.id}</span>
                      <span className="fo-plan-precio">{p.precio}</span>
                      <span className="fo-plan-desc">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 3: DISEÑO ── */}
          {paso === 2 && (
            <div className="fo-paso">
              <h2 className="fo-paso-title">Diseño y estilo</h2>
              <p className="fo-paso-sub">Nos ayuda a capturar la identidad visual de tu negocio.</p>

              <div className="fo-field">
                <label>¿Tienes logo?</label>
                <div className="fo-radio-group">
                  <label className="fo-radio">
                    <input type="radio" checked={data.tiene_logo} onChange={() => set('tiene_logo', true)} />
                    Sí, tengo logo
                  </label>
                  <label className="fo-radio">
                    <input type="radio" checked={!data.tiene_logo} onChange={() => set('tiene_logo', false)} />
                    No tengo logo
                  </label>
                </div>
                {data.tiene_logo && (
                  <p className="fo-hint">📎 Envíanos el logo por WhatsApp después de completar este formulario.</p>
                )}
              </div>

              <div className="fo-field">
                <label>Colores de tu marca <span className="fo-optional">(opcional)</span></label>
                <input
                  value={data.colores}
                  onChange={e => set('colores', e.target.value)}
                  placeholder="Ej: Rojo y blanco, azul marino, verde esmeralda..."
                />
              </div>

              <div className="fo-field">
                <label>Estilo que te gusta</label>
                <div className="fo-estilo-grid">
                  {ESTILOS.map(e => (
                    <div
                      key={e.id}
                      className={`fo-estilo-card${data.estilo === e.id ? ' active' : ''}`}
                      onClick={() => set('estilo', e.id)}
                    >
                      <span className="fo-estilo-name">{e.label}</span>
                      <span className="fo-estilo-desc">{e.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fo-field">
                <label>¿Hay alguna web que te guste como referencia? <span className="fo-optional">(opcional)</span></label>
                <input
                  value={data.web_referencia}
                  onChange={e => set('web_referencia', e.target.value)}
                  placeholder="https://www.ejemplo.com"
                  type="url"
                />
              </div>
            </div>
          )}

          {/* ── PASO 4: CONTENIDO ── */}
          {paso === 3 && (
            <div className="fo-paso">
              <h2 className="fo-paso-title">Contenido y redes</h2>
              <p className="fo-paso-sub">¿Qué secciones quieres en tu web?</p>

              <div className="fo-field">
                <label>Secciones de tu web <span className="fo-optional">(selecciona las que quieres)</span></label>
                <div className="fo-secciones-grid">
                  {SECCIONES_OPT.map(s => (
                    <label key={s} className={`fo-seccion-card${data.secciones.includes(s) ? ' active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={data.secciones.includes(s)}
                        onChange={() => toggleSeccion(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fo-field">
                <label>¿Tienes el texto para la web?</label>
                <div className="fo-radio-group">
                  <label className="fo-radio">
                    <input type="radio" checked={data.texto_propio} onChange={() => set('texto_propio', true)} />
                    Sí, voy a enviarte los textos
                  </label>
                  <label className="fo-radio">
                    <input type="radio" checked={!data.texto_propio} onChange={() => set('texto_propio', false)} />
                    No, que lo genere la IA por mí
                  </label>
                </div>
              </div>

              <div className="fo-field">
                <label>Redes sociales <span className="fo-optional">(las que tengas)</span></label>
                <div className="fo-redes">
                  <div className="fo-red-input">
                    <span>📸</span>
                    <input value={data.instagram} onChange={e => set('instagram', e.target.value)} placeholder="Instagram: @tunegocio" />
                  </div>
                  <div className="fo-red-input">
                    <span>📘</span>
                    <input value={data.facebook} onChange={e => set('facebook', e.target.value)} placeholder="Facebook: facebook.com/tunegocio" />
                  </div>
                  <div className="fo-red-input">
                    <span>🎵</span>
                    <input value={data.tiktok} onChange={e => set('tiktok', e.target.value)} placeholder="TikTok: @tunegocio" />
                  </div>
                  <div className="fo-red-input">
                    <span>📍</span>
                    <input value={data.google_maps} onChange={e => set('google_maps', e.target.value)} placeholder="Link de Google Maps" />
                  </div>
                </div>
              </div>

              <div className="fo-field">
                <label>¿Algo más que debamos saber? <span className="fo-optional">(opcional)</span></label>
                <textarea
                  value={data.notas}
                  onChange={e => set('notas', e.target.value)}
                  placeholder="Ej: Quiero que se vea similar a tal web, tengo fotos que te envío por WhatsApp, necesito que incluya sistema de reservas..."
                  rows={4}
                />
              </div>

              <p className="fo-hint">📎 Si tienes fotos, logo o material adicional, envíalos por WhatsApp después de enviar este formulario.</p>
            </div>
          )}

          {/* ERROR */}
          {error && <p className="fo-error">{error}</p>}

          {/* NAVEGACIÓN */}
          <div className="fo-nav">
            {paso > 0 && (
              <button type="button" className="fo-btn-back" onClick={anterior}>
                ← Anterior
              </button>
            )}
            {paso < PASOS.length - 1 ? (
              <button type="button" className="fo-btn-next" onClick={siguiente}>
                Siguiente →
              </button>
            ) : (
              <button type="submit" className="fo-btn-submit" disabled={enviando}>
                {enviando ? 'Enviando...' : '🚀 Enviar formulario'}
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="fo-footer-note">🔒 Tu información es privada y solo la usamos para crear tu web.</p>
    </div>
  )
}
