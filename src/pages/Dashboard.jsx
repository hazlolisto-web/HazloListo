import { useState } from 'react'
import ProyectosView from '../components/ProyectosView'
import FinanzasView  from '../components/FinanzasView'
import '../dashboard.css'

const PASSWORD = 'hazlo2026'

export default function Dashboard() {
  const [authed, setAuthed]       = useState(() => sessionStorage.getItem('hl_auth') === '1')
  const [pass, setPass]           = useState('')
  const [passError, setPassError] = useState(false)
  const [view, setView]           = useState('proyectos')

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
          <span
            className={`db-nav-item${view === 'proyectos' ? ' active' : ''}`}
            onClick={() => setView('proyectos')}
          >
            📋 Proyectos
          </span>
          <span
            className={`db-nav-item${view === 'finanzas' ? ' active' : ''}`}
            onClick={() => setView('finanzas')}
          >
            💰 Finanzas
          </span>
        </nav>
        <a href="/" className="db-sidebar-back">← Ver landing</a>
      </aside>

      {/* CONTENIDO */}
      <main className="db-main">
        {view === 'proyectos' && <ProyectosView />}
        {view === 'finanzas'  && <FinanzasView />}
      </main>
    </div>
  )
}
