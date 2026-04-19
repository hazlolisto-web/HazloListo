import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { supabase } from '../lib/supabase'

const CATEGORIAS_INGRESO = ['Express', 'Pro', 'Business', 'Bono', 'Otro']
const CATEGORIAS_GASTO   = ['Herramientas', 'Publicidad', 'Dominios/Hosting', 'Diseño', 'Transporte', 'Otro']
const PIE_COLORS = ['#0EA5E9', '#7C3AED', '#F97316', '#22C55E', '#EAB308', '#EF4444']

const MESES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function getLast6Months() {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ year: d.getFullYear(), month: d.getMonth(), label: MESES_ES[d.getMonth()] })
  }
  return result
}

const emptyForm = { tipo: 'Ingreso', descripcion: '', categoria: 'Pro', monto: '', fecha: new Date().toISOString().slice(0,10) }

const fmt = (n) => `$${Number(n).toLocaleString('es-CL')}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #DDE1EA', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem' }}>
      <p style={{ fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  )
}

export default function FinanzasView() {
  const [finanzas, setFinanzas] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [editId, setEditId]     = useState(null)
  const [saving, setSaving]     = useState(false)
  const [filtro, setFiltro]     = useState('Todos')
  const [mesFiltro, setMesFiltro] = useState('todos')

  useEffect(() => { fetchFinanzas() }, [])

  async function fetchFinanzas() {
    setLoading(true)
    const { data } = await supabase
      .from('finanzas')
      .select('*')
      .order('fecha', { ascending: false })
    setFinanzas(data || [])
    setLoading(false)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditId(null)
    setModal(true)
  }

  function openEdit(t) {
    setForm({
      tipo:        t.tipo,
      descripcion: t.descripcion,
      categoria:   t.categoria || '',
      monto:       t.monto,
      fecha:       t.fecha,
    })
    setEditId(t.id)
    setModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, monto: Number(form.monto) }
    if (editId) {
      await supabase.from('finanzas').update(payload).eq('id', editId)
    } else {
      await supabase.from('finanzas').insert([payload])
    }
    setSaving(false)
    setModal(false)
    fetchFinanzas()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta transacción?')) return
    await supabase.from('finanzas').delete().eq('id', id)
    fetchFinanzas()
  }

  // ── STATS DEL MES ACTUAL ──
  const now      = new Date()
  const mesActual = now.getMonth()
  const añoActual = now.getFullYear()

  const delMes = finanzas.filter(f => {
    const d = new Date(f.fecha + 'T12:00:00')
    return d.getMonth() === mesActual && d.getFullYear() === añoActual
  })
  const ingresosMes  = delMes.filter(f => f.tipo === 'Ingreso').reduce((s, f) => s + f.monto, 0)
  const gastosMes    = delMes.filter(f => f.tipo === 'Gasto').reduce((s, f) => s + f.monto, 0)
  const balanceMes   = ingresosMes - gastosMes
  const totalIngresos = finanzas.filter(f => f.tipo === 'Ingreso').reduce((s, f) => s + f.monto, 0)
  const totalGastos   = finanzas.filter(f => f.tipo === 'Gasto').reduce((s, f) => s + f.monto, 0)
  const balanceTotal  = totalIngresos - totalGastos

  // ── DATOS GRÁFICO DE BARRAS ──
  const last6 = getLast6Months()
  const barData = last6.map(({ year, month, label }) => {
    const filtrados = finanzas.filter(f => {
      const d = new Date(f.fecha + 'T12:00:00')
      return d.getMonth() === month && d.getFullYear() === year
    })
    return {
      mes:      label,
      Ingresos: filtrados.filter(f => f.tipo === 'Ingreso').reduce((s, f) => s + f.monto, 0),
      Gastos:   filtrados.filter(f => f.tipo === 'Gasto').reduce((s, f) => s + f.monto, 0),
    }
  })

  // ── DATOS GRÁFICO TORTA (gastos por categoría) ──
  const gastosPorCat = CATEGORIAS_GASTO.map(cat => ({
    name:  cat,
    value: finanzas.filter(f => f.tipo === 'Gasto' && f.categoria === cat).reduce((s, f) => s + f.monto, 0),
  })).filter(d => d.value > 0)

  // ── TABLA FILTRADA ──
  const transacciones = finanzas.filter(f => {
    const tipoOk = filtro === 'Todos' || f.tipo === filtro
    if (mesFiltro === 'todos') return tipoOk
    const [y, m] = mesFiltro.split('-').map(Number)
    const d = new Date(f.fecha + 'T12:00:00')
    return tipoOk && d.getFullYear() === y && d.getMonth() === m
  })

  const mesesDisponibles = [...new Set(finanzas.map(f => {
    const d = new Date(f.fecha + 'T12:00:00')
    return `${d.getFullYear()}-${d.getMonth()}`
  }))].map(key => {
    const [y, m] = key.split('-').map(Number)
    return { key, label: `${MESES_ES[m]} ${y}` }
  })

  const categorias = form.tipo === 'Ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO

  return (
    <>
      <div className="db-header">
        <div>
          <h1 className="db-title">Finanzas</h1>
          <p className="db-subtitle">{MESES_ES[mesActual]} {añoActual} — resumen del mes</p>
        </div>
        <button className="db-btn-add" onClick={openAdd}>+ Nueva transacción</button>
      </div>

      {/* STATS */}
      <div className="db-stats">
        <div className="db-stat">
          <span className="db-stat-val" style={{ color: '#22C55E' }}>{fmt(ingresosMes)}</span>
          <span className="db-stat-label">Ingresos del mes</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-val" style={{ color: '#EF4444' }}>{fmt(gastosMes)}</span>
          <span className="db-stat-label">Gastos del mes</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-val" style={{ color: balanceMes >= 0 ? '#7C3AED' : '#EF4444' }}>{fmt(balanceMes)}</span>
          <span className="db-stat-label">Balance del mes</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-val" style={{ color: balanceTotal >= 0 ? '#0EA5E9' : '#EF4444' }}>{fmt(balanceTotal)}</span>
          <span className="db-stat-label">Balance total</span>
        </div>
      </div>

      {/* GRÁFICOS */}
      {finanzas.length > 0 && (
        <div className="fn-charts">
          {/* BAR CHART */}
          <div className="fn-chart-card">
            <h3 className="fn-chart-title">Ingresos vs Gastos — últimos 6 meses</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="Ingresos" fill="#22C55E" radius={[4,4,0,0]} />
                <Bar dataKey="Gastos"   fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          {gastosPorCat.length > 0 && (
            <div className="fn-chart-card">
              <h3 className="fn-chart-title">Gastos por categoría</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gastosPorCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {gastosPorCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* FILTROS */}
      <div className="fn-filters">
        <div className="fn-filter-group">
          {['Todos','Ingreso','Gasto'].map(t => (
            <button key={t} className={`fn-filter-btn${filtro === t ? ' active' : ''}`} onClick={() => setFiltro(t)}>
              {t === 'Ingreso' ? '📈 Ingresos' : t === 'Gasto' ? '📉 Gastos' : '📋 Todos'}
            </button>
          ))}
        </div>
        <select className="fn-mes-select" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}>
          <option value="todos">Todos los meses</option>
          {mesesDisponibles.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="db-loading">Cargando transacciones...</div>
      ) : transacciones.length === 0 ? (
        <div className="db-empty">
          <p>No hay transacciones aún.</p>
          <button className="db-btn-add" onClick={openAdd}>+ Agregar primera transacción</button>
        </div>
      ) : (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map(t => (
                <tr key={t.id}>
                  <td className="db-fecha">
                    {new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-CL')}
                  </td>
                  <td><span className="db-cliente-name">{t.descripcion}</span></td>
                  <td>{t.categoria ? <span className="db-plan-tag">{t.categoria}</span> : '—'}</td>
                  <td>
                    <span className="fn-tipo-badge" data-tipo={t.tipo}>
                      {t.tipo === 'Ingreso' ? '📈' : '📉'} {t.tipo}
                    </span>
                  </td>
                  <td className="db-precio" style={{ color: t.tipo === 'Ingreso' ? '#22C55E' : '#EF4444' }}>
                    {t.tipo === 'Ingreso' ? '+' : '-'}{fmt(t.monto)}
                  </td>
                  <td>
                    <div className="db-actions">
                      <button className="db-btn-icon" onClick={() => openEdit(t)}>✏️</button>
                      <button className="db-btn-icon danger" onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="db-overlay" onClick={() => setModal(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>{editId ? 'Editar transacción' : 'Nueva transacción'}</h2>
              <button className="db-modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="db-modal-form">
              <div className="db-field">
                <label>Tipo</label>
                <div className="fn-tipo-toggle">
                  {['Ingreso','Gasto'].map(t => (
                    <button
                      key={t} type="button"
                      className={`fn-tipo-btn${form.tipo === t ? ' active' : ''}`}
                      data-tipo={t}
                      onClick={() => setForm({ ...form, tipo: t, categoria: t === 'Ingreso' ? 'Pro' : 'Herramientas' })}
                    >
                      {t === 'Ingreso' ? '📈 Ingreso' : '📉 Gasto'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="db-field">
                <label>Descripción *</label>
                <input required value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder={form.tipo === 'Ingreso' ? 'Ej: Web restaurante La Cazuela' : 'Ej: Figma mensual'} />
              </div>
              <div className="db-field-row">
                <div className="db-field">
                  <label>Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                    {categorias.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="db-field">
                  <label>Monto (CLP) *</label>
                  <input required type="number" min="0" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} placeholder="100000" />
                </div>
              </div>
              <div className="db-field">
                <label>Fecha *</label>
                <input required type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="db-btn-save" disabled={saving}>
                  {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
