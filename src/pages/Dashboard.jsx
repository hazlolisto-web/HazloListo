import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../dashboard.css'

const PASSWORD = 'hazlo2026'

const ESTADOS = ['Nuevo', 'En progreso', 'Entregado', 'Pagado']
const PLANES  = ['Express', 'Pro', 'Business', 'Gratis']

const ESTADO_COLOR = {
  'Nuevo':       { bg: '#EFF6FF', color: '#3B82F6', dot: '#3B82F6' },
  'En progreso': { bg: '#FFF7ED', color: '#F97316', dot: '#F97316' },
  'Entregado':   { bg: '#F0FDF4', color: '#22C55E', dot: '#22C55E' },
  'Pagado':      { bg: '#F5F3FF', color: '#7C3AED', dot: '#7C3AED' },
}

const PLAN_PRECIO = { Express: 79000, Pro: 100000, Business: 150000, Gratis: 0 }

const emptyForm = {
  cliente: '', whatsapp: '', plan: 'Pro',
  precio: 100000, estado: 'Nuevo',
  fecha_entrega: '', notas: '',
}

export default function Dashboard() {
  const [authed, setAuthed]       = useState(() => sessionStorage.getItem('hl_auth') === '1')
  const [pass, setPass]           = useState('')
  const [passError, setPassError] = useState(false)
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)   // null | 'add' | 'edit'
  const [form, setForm]           = useState(emptyForm)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(null)

  useEffect(() => {
    if (authed) fetchProyectos()
  }, [authed])

  async function fetchProyectos() {
    setLoading(true)
    const { data } = await supabase
      .from('proyectos')
      .select('*')
      .order('created_at', { ascending: false })
    setProyectos(data || [])
    setLoading(false)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (pass === PASSWORD) {
      sessionStorage.setItem('hl_auth', '1')
      setAuthed(true)
    } else {
      setPassError(true)
      setTimeout(() => setPassError(false), 1200)
    }
  }

  function openAdd() {
    setForm(emptyForm)
    setEditId(null)
    setModal('add')
  }

  function openEdit(p) {
    setForm({
      cliente: p.cliente || '',
      whatsapp: p.whatsapp || '',
      plan: p.plan || 'Pro',
      precio: p.precio || 0,
      estado: p.estado || 'Nuevo',
      fecha_entrega: p.fecha_entrega || '',
      notas: p.notas || '',
    })
    setEditId(p.id)
    setModal('edit')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, precio: Number(form.precio) }
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
    setDeleting(id)
    await supabase.from('proyectos').delete().eq('id', id)
    setDeleting(null)
    fetchProyectos()
  }

  async function cambiarEstado(id, estadoActual) {
    const idx = ESTADOS.indexOf(estadoActual)
    const next = ESTADOS[(idx + 1) % ESTADOS.length]
    await supabase.from('proyectos').update({ estado: next }).eq('id', id)
    setProyectos(prev => prev.map(p => p.id === id ? { ...p, estado: next } : p))
  }

  // ── STATS ──
  const total     = proyectos.length
  const enProg    = proyectos.filter(p => p.estado === 'En progreso').length
  const entregados = proyectos.filter(p => p.estado === 'Entregado' || p.estado === 'Pagado').length
  const ingresos  = proyectos
    .filter(p => p.estado === 'Pagado')
    .reduce((s, p) => s + (p.precio || 0), 0)

  // ── LOGIN ──
  if (!authed) {
    return (
      <div className="db-login">
        <div className="db-login-card">
          <div className="db-login-logo">Hazlo Listo</div>
          <p className="db-login-sub">Panel de administración</p>
          <form onSubmit={handleLogin}>
            <input
              className={`db-login-input${passError ? ' error' : ''}`}
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={e => setPass(e.target.value)}
              autoFocus
            />
            {passError && <p className="db-login-error">Contraseña incorrecta</p>}
            <button className="db-login-btn" type="submit">Entrar →</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="db-root">
      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo">Hazlo Listo</div>
        <nav className="db-nav">
          <span className="db-nav-item active">📋 Proyectos</span>
        </nav>
        <a href="/" className="db-sidebar-back">← Ver landing</a>
      </aside>

      {/* MAIN */}
      <main className="db-main">
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
            <span className="db-stat-val" style={{ color: '#22C55E' }}>{entregados}</span>
            <span className="db-stat-label">Entregados</span>
          </div>
          <div className="db-stat">
            <span className="db-stat-val" style={{ color: '#7C3AED' }}>
              ${ingresos.toLocaleString('es-CL')}
            </span>
            <span className="db-stat-label">Ingresos pagados (CLP)</span>
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
                  <th>Plan</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Entrega</th>
                  <th>WhatsApp</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map(p => {
                  const ec = ESTADO_COLOR[p.estado] || ESTADO_COLOR['Nuevo']
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="db-cliente-name">{p.cliente}</div>
                        {p.notas && <div className="db-cliente-nota">{p.notas}</div>}
                      </td>
                      <td><span className="db-plan-tag">{p.plan}</span></td>
                      <td className="db-precio">
                        ${(p.precio || 0).toLocaleString('es-CL')}
                      </td>
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
                      <td className="db-fecha">
                        {p.fecha_entrega
                          ? new Date(p.fecha_entrega + 'T12:00:00').toLocaleDateString('es-CL')
                          : '—'}
                      </td>
                      <td>
                        {p.whatsapp ? (
                          <a
                            className="db-wa-link"
                            href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            💬 Escribir
                          </a>
                        ) : '—'}
                      </td>
                      <td>
                        <div className="db-actions">
                          <button className="db-btn-icon" onClick={() => openEdit(p)} title="Editar">✏️</button>
                          <button
                            className="db-btn-icon danger"
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            title="Eliminar"
                          >
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
      </main>

      {/* MODAL */}
      {modal && (
        <div className="db-overlay" onClick={() => setModal(null)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>{modal === 'add' ? 'Nuevo proyecto' : 'Editar proyecto'}</h2>
              <button className="db-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="db-modal-form">
              <div className="db-field">
                <label>Nombre del cliente *</label>
                <input
                  required
                  value={form.cliente}
                  onChange={e => setForm({ ...form, cliente: e.target.value })}
                  placeholder="Ej: Restaurante La Cazuela"
                />
              </div>
              <div className="db-field-row">
                <div className="db-field">
                  <label>WhatsApp</label>
                  <input
                    value={form.whatsapp}
                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="+56912345678"
                  />
                </div>
                <div className="db-field">
                  <label>Plan</label>
                  <select
                    value={form.plan}
                    onChange={e => setForm({
                      ...form,
                      plan: e.target.value,
                      precio: PLAN_PRECIO[e.target.value] ?? form.precio
                    })}
                  >
                    {PLANES.map(pl => <option key={pl}>{pl}</option>)}
                  </select>
                </div>
              </div>
              <div className="db-field-row">
                <div className="db-field">
                  <label>Precio (CLP)</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={e => setForm({ ...form, precio: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                <div className="db-field">
                  <label>Estado</label>
                  <select
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                  >
                    {ESTADOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="db-field">
                <label>Fecha de entrega</label>
                <input
                  type="date"
                  value={form.fecha_entrega}
                  onChange={e => setForm({ ...form, fecha_entrega: e.target.value })}
                />
              </div>
              <div className="db-field">
                <label>Notas internas</label>
                <textarea
                  value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                  placeholder="Detalles del proyecto, pedidos especiales..."
                  rows={3}
                />
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="db-btn-save" disabled={saving}>
                  {saving ? 'Guardando...' : modal === 'add' ? 'Crear proyecto' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
