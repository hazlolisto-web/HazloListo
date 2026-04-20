import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function FormulariosView() {
  const [formularios, setFormularios] = useState([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null)

  useEffect(() => { fetchFormularios() }, [])

  async function fetchFormularios() {
    setLoading(true)
    const { data } = await supabase
      .from('formularios')
      .select('*')
      .order('created_at', { ascending: false })
    setFormularios(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este formulario?')) return
    await supabase.from('formularios').delete().eq('id', id)
    setSelected(null)
    fetchFormularios()
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div className="db-header">
        <div>
          <h1 className="db-title">Formularios</h1>
          <p className="db-subtitle">Solicitudes recibidas de clientes</p>
        </div>
        <a className="db-btn-add" href="/formulario" target="_blank" rel="noreferrer">
          ↗ Ver formulario público
        </a>
      </div>

      {loading ? (
        <div className="db-loading">Cargando formularios...</div>
      ) : formularios.length === 0 ? (
        <div className="db-empty">
          <p>Aún no hay formularios enviados.</p>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 8 }}>
            Comparte el link <strong>hazlo-listo.vercel.app/formulario</strong> con tus clientes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>
          {/* LISTA */}
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Negocio</th>
                  <th>Plan</th>
                  <th>Contacto</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formularios.map(f => (
                  <tr
                    key={f.id}
                    style={{ cursor: 'pointer', background: selected?.id === f.id ? '#F0F9FF' : '' }}
                    onClick={() => setSelected(f)}
                  >
                    <td>
                      <div className="db-cliente-name">{f.nombre_negocio}</div>
                      <div className="db-cliente-nota">{f.rubro}</div>
                    </td>
                    <td><span className="db-plan-tag">{f.plan}</span></td>
                    <td>
                      <div className="db-cliente-name">{f.nombre_contacto}</div>
                      {f.whatsapp && (
                        <a className="db-wa-link" href={`https://wa.me/${f.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                          💬 {f.whatsapp}
                        </a>
                      )}
                    </td>
                    <td className="db-fecha">{fmtDate(f.created_at)}</td>
                    <td>
                      <button className="db-btn-icon danger" onClick={e => { e.stopPropagation(); handleDelete(f.id) }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DETALLE */}
          {selected && (
            <div className="db-table-wrap" style={{ padding: 24, height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D0F14' }}>{selected.nombre_negocio}</h3>
                <button className="db-modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              {[
                { label: 'Rubro',          val: selected.rubro },
                { label: 'Ciudad',         val: selected.ciudad },
                { label: 'Descripción',    val: selected.descripcion },
                { label: 'Contacto',       val: selected.nombre_contacto },
                { label: 'WhatsApp',       val: selected.whatsapp },
                { label: 'Email',          val: selected.email },
                { label: 'Plan',           val: selected.plan },
                { label: 'Tiene logo',     val: selected.tiene_logo ? 'Sí' : 'No' },
                { label: 'Colores',        val: selected.colores },
                { label: 'Estilo',         val: selected.estilo },
                { label: 'Web referencia', val: selected.web_referencia },
                { label: 'Secciones',      val: selected.secciones ? JSON.parse(selected.secciones).join(', ') : null },
                { label: 'Texto propio',   val: selected.texto_propio ? 'Sí' : 'No, usar IA' },
                { label: 'Instagram',      val: selected.instagram },
                { label: 'Facebook',       val: selected.facebook },
                { label: 'TikTok',         val: selected.tiktok },
                { label: 'Google Maps',    val: selected.google_maps },
                { label: 'Notas',          val: selected.notas },
              ].filter(r => r.val).map(row => (
                <div key={row.label} style={{ marginBottom: 10, borderBottom: '1px solid #F1F4F8', paddingBottom: 10 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    {row.label}
                  </span>
                  <p style={{ fontSize: '0.9rem', color: '#374151', marginTop: 2, lineHeight: 1.5 }}>{row.val}</p>
                </div>
              ))}

              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                {selected.whatsapp && (
                  <a
                    href={`https://wa.me/${selected.whatsapp.replace(/\D/g,'')}?text=Hola ${selected.nombre_contacto}, recibí tu formulario de ${selected.nombre_negocio} 🙌`}
                    target="_blank"
                    rel="noreferrer"
                    className="db-btn-add"
                    style={{ fontSize: '0.85rem', padding: '9px 16px' }}
                  >
                    💬 Responder por WA
                  </a>
                )}
                <button
                  className="db-btn-icon danger"
                  onClick={() => handleDelete(selected.id)}
                  style={{ padding: '9px 14px', fontSize: '0.85rem' }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
