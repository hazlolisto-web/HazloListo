import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ESTADOS = ['Nuevo lead', 'En conversación', 'Formulario enviado', 'Pagado', 'Perdido']
const PLANES  = ['Express', 'Pro', 'Business', 'Gratis']
const FUENTES = ['Meta Ads', 'Instagram', 'Referido', 'TikTok', 'Orgánico']

const ESTADO_COLOR = {
  'Nuevo lead':         { bg: '#EFF6FF', color: '#3B82F6', dot: '#3B82F6' },
  'En conversación':    { bg: '#FFF7ED', color: '#F97316', dot: '#F97316' },
  'Formulario enviado': { bg: '#FEFCE8', color: '#EAB308', dot: '#EAB308' },
  'Pagado':             { bg: '#F5F3FF', color: '#7C3AED', dot: '#7C3AED' },
  'Perdido':            { bg: '#FEF2F2', color: '#EF4444', dot: '#EF4444' },
}

const PLAN_PRECIO = { Express: 79000, Pro: 100000, Business: 150000, Gratis: 0 }

const emptyForm = {
  cliente: '', whatsapp: '', negocio: '', plan: 'Pro',
  precio: 100000, estado: 'Nuevo lead', fuente: '',
  dominio: '', fecha_inicio: '', fecha_entrega: '',
  fecha_ultimo_contacto: '', mantenimiento: false,
  testimonio: false, notas: '',
}

export default function ProyectosView() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(null)

  useEffect(() => { fetchProyectos() }, [])

  async function fetchProyectos() {
    setLoading(true)
    const { data } = await supabase
      .from('proyectos')
      .select('*')
      .order('created_at', { ascending: false })
    setProyectos(data || [])
    setLoading(false)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditId(null)
    setModal('add')
  }

  function openEdit(p) {
    setForm({
      cliente:               p.cliente || '',
      whatsapp:              p.whatsapp || '',
      negocio:               p.negocio || '',
      plan:                  p.plan || 'Pro',
      precio:                p.precio || 0,
      estado:                p.estado || 'Nuevo lead',
      fuente:                p.fuente || '',
      dominio:               p.dominio || '',
      fecha_inicio:          p.fecha_inicio || '',
      fecha_entrega:         p.fecha_entrega || '',
      fecha_ultimo_contacto: p.fecha_ultimo_contacto || '',
      mantenimiento:         p.mantenimiento || false,
      testimonio:            p.testimonio || false,
      notas:                 p.notas || '',
    })
    setEditId(p.id)
    setModal('edit')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      precio:        Number(form.precio),
      fecha_inicio:          form.fecha_inicio || null,
      fecha_entrega:         form.fecha_entrega || null,
      fecha_ultimo_contacto: form.fecha_ultimo_contacto || null,
      fuente:        form.fuente || null,
    }
    if (modal === 'add') {
      await supabase.from('proyectos').insert([payload])
    } else {
      await supabase.from('proyectos').update(payload).eq('id', editId)
    }
    setSaving(false)
    setModal(null)
    fetchProyectos()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este proyecto?')) return
    setDeleting(id)
    await supabase.from('proyectos').delete().eq('id', id)
    setDeleting(null)
    fetchProyectos()
  }

  async function cambiarEstado(id, estadoActual) {
    const idx  = ESTADOS.indexOf(estadoActual)
    const next = ESTADOS[(idx + 1) % ESTADOS.length]
    await supabase.from('proyectos').update({ estado: next }).eq('id', id)
    setProyectos(prev => prev.map(p => p.id === id ? { ...p, estado: next } : p))
  }

  const total      = proyectos.length
  const enProg     = proyectos.filter(p => p.estado === 'En conversación' || p.estado === 'Formulario enviado').length
  const pagados    = proyectos.filter(p => p.estado === 'Pagado').length
  const ingresos   = proyectos.filter(p => p.estado === 'Pagado').reduce((s, p) => s + (p.precio || 0), 0)

  const fmt = (n) => `$${n.toLocaleString('es-CL')}`
  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-CL') : '—'

  return (
    <>
      <div className="db-header">
        <div>
          <h1 className="db-title">Proyectos</h1>
          <p className="db-subtitle">Gestiona todos tus clientes desde aquí</p>
        </div>
        <button className="db-btn-add" onClick={openAdd}>+ Nuevo proyecto</button>
      </div>

      {/* STATS */}
      <div className="db-stats">
        <div className="db-stat">
          <span className="db-stat-val">{total}</span>
          <span className="db-stat-label">Total clientes</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-val" style={{ color: '#F97316' }}>{enProg}</span>
          <span className="db-stat-label">En progreso</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-val" style={{ color: '#7C3AED' }}>{pagados}</span>
          <span className="db-stat-label">Pagados</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-val" style={{ color: '#22C55E' }}>{fmt(ingresos)}</span>
          <span className="db-stat-label">Ingresos cobrados (CLP)</span>
        </div>
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="db-loading">Cargando proyectos...</div>
      ) : proyectos.length === 0 ? (
        <div className="db-empty">
          <p>No hay proyectos aún.</p>
          <button className="db-btn-add" onClick={openAdd}>+ Agregar primer cliente</button>
        </div>
      ) : (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fuente</th>
                <th>Plan</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Últ. contacto</th>
                <th>Entrega</th>
                <th>WA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map(p => {
                const ec = ESTADO_COLOR[p.estado] || ESTADO_COLOR['Nuevo lead']
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="db-cliente-name">{p.cliente}</div>
                      {p.negocio && <div className="db-cliente-nota">{p.negocio}</div>}
                    </td>
                    <td>
                      {p.fuente
                        ? <span className="db-fuente-tag">{p.fuente}</span>
                        : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td><span className="db-plan-tag">{p.plan}</span></td>
                    <td className="db-precio">{fmt(p.precio || 0)}</td>
                    <td>
                      <button
                        className="db-estado-badge"
                        style={{ background: ec.bg, color: ec.color }}
                        onClick={() => cambiarEstado(p.id, p.estado)}
                        title="Click para avanzar estado"
                      >
                        <span className="db-estado-dot" style={{ background: ec.dot }} />
                        {p.estado}
                      </button>
                    </td>
                    <td className="db-fecha">{fmtDate(p.fecha_ultimo_contacto)}</td>
                    <td className="db-fecha">{fmtDate(p.fecha_entrega)}</td>
                    <td>
                      {p.whatsapp
                        ? <a className="db-wa-link" href={`https://wa.me/${p.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">💬</a>
                        : '—'}
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-icon" onClick={() => openEdit(p)} title="Editar">✏️</button>
                        <button className="db-btn-icon danger" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                          {deleting === p.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="db-overlay" onClick={() => setModal(null)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>{modal === 'add' ? 'Nuevo proyecto' : 'Editar proyecto'}</h2>
              <button className="db-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="db-modal-form">
              <div className="db-field-row">
                <div className="db-field">
                  <label>Nombre del cliente *</label>
                  <input required value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Ej: Juan Pérez" />
                </div>
                <div className="db-field">
                  <label>Negocio / Rubro</label>
                  <input value={form.negocio} onChange={e => setForm({ ...form, negocio: e.target.value })} placeholder="Ej: Restaurante" />
                </div>
              </div>
              <div className="db-field-row">
                <div className="db-field">
                  <label>WhatsApp</label>
                  <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="+56912345678" />
                </div>
                <div className="db-field">
                  <label>Fuente</label>
                  <select value={form.fuente} onChange={e => setForm({ ...form, fuente: e.target.value })}>
                    <option value="">— Sin especificar —</option>
                    {FUENTES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="db-field-row">
                <div className="db-field">
                  <label>Plan</label>
                  <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value, precio: PLAN_PRECIO[e.target.value] ?? form.precio })}>
                    {PLANES.map(pl => <option key={pl}>{pl}</option>)}
                  </select>
                </div>
                <div className="db-field">
                  <label>Precio (CLP)</label>
                  <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
                </div>
              </div>
              <div className="db-field-row">
                <div className="db-field">
                  <label>Estado</label>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    {ESTADOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="db-field">
                  <label>Dominio</label>
                  <input value={form.dominio} onChange={e => setForm({ ...form, dominio: e.target.value })} placeholder="minegocio.com" />
                </div>
              </div>
              <div className="db-field-row">
                <div className="db-field">
                  <label>Fecha inicio</label>
                  <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} />
                </div>
                <div className="db-field">
                  <label>Fecha entrega</label>
                  <input type="date" value={form.fecha_entrega} onChange={e => setForm({ ...form, fecha_entrega: e.target.value })} />
                </div>
              </div>
              <div className="db-field">
                <label>Último contacto</label>
                <input type="date" value={form.fecha_ultimo_contacto} onChange={e => setForm({ ...form, fecha_ultimo_contacto: e.target.value })} />
              </div>
              <div className="db-field-row" style={{ alignItems: 'center', gap: 24 }}>
                <label className="db-checkbox-label">
                  <input type="checkbox" checked={form.mantenimiento} onChange={e => setForm({ ...form, mantenimiento: e.target.checked })} />
                  Tiene mantenimiento
                </label>
                <label className="db-checkbox-label">
                  <input type="checkbox" checked={form.testimonio} onChange={e => setForm({ ...form, testimonio: e.target.checked })} />
                  Dejó testimonio
                </label>
              </div>
              <div className="db-field">
                <label>Notas internas</label>
                <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Detalles del proyecto..." rows={3} />
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="db-btn-save" disabled={saving}>
                  {saving ? 'Guardando...' : modal === 'add' ? 'Crear proyecto' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
