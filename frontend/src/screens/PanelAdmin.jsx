import { useCallback, useEffect, useState } from 'react';
import SeccionesVista from './SeccionesVista';
import ConfirmModal from '../components/ConfirmModal';
import * as P from '../services/panelService';
import '../styles/paneles.css';

const etiquetaRol = (u) => {
  if (u.rol === 'jugador') return 'Alumno';
  if (u.rol === 'docente') return u.aprobacion && u.aprobacion !== 'aprobada' ? `Docente (${u.aprobacion})` : 'Docente';
  if (u.rol === 'admin') return 'Administrador';
  return u.rol || '—';
};

export default function PanelAdmin({ usuario, onProbar, onSalir, demo = false, initialTab = 'solicitudes' }) {
  const [tab, setTab] = useState(initialTab || 'solicitudes');
  const [sols, setSols] = useState([]);
  const [users, setUsers] = useState([]);       // lista según la búsqueda
  const [todos, setTodos] = useState([]);       // lista completa (sin búsqueda) para las estadísticas
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmar, setConfirmar] = useState(null);   // { titulo, mensaje, textoConfirmar, accion }
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    if (demo) {
      const muestra = [{ usuario:'ana.m', correo:'ana.m@ejemplo.edu.pe', rol:'jugador', cuenta:'activo', seccion:'2041' }, { usuario:'prof.lucia', correo:'lucia@ejemplo.edu.pe', rol:'docente', aprobacion:'aprobada', cuenta:'activo', seccion:'—' }, { usuario:'carlos.p', correo:'carlos.p@ejemplo.edu.pe', rol:'jugador', cuenta:'suspendido', seccion:'—' }];
      setSols([{ usuario:'mariana.r', correo:'mariana.r@ejemplo.edu.pe', carrera:'Ingeniería de Software' }, { usuario:'diego.q', correo:'diego.q@ejemplo.edu.pe', carrera:'Ciencias de la Computación' }]);
      setUsers(muestra); setTodos(muestra);
      return;
    }
    try {
      setSols(await P.solicitudesDocente(usuario));
      const lista = await P.listarUsuarios(usuario, q);
      setUsers(lista);
      if (!q.trim()) setTodos(lista);
    } catch (e) { setMsg(e.message); }
  }, [usuario, q, demo]);
  useEffect(() => { cargar(); }, [cargar]);

  const run = async (fn) => {
    setMsg('');
    if (demo) { setMsg('Vista de ejemplo: las acciones están desactivadas.'); return; }
    try { await fn(); await cargar(); } catch (e) { setMsg(e.message); }
  };

  const pedirRemover = (u) => setConfirmar({
    titulo: `¿Remover a ${u.usuario} de su sección?`,
    mensaje: 'Se borrará todo su juego (progreso, estadísticas y ranking).',
    textoConfirmar: 'Remover',
    accion: () => P.removerAlumno(usuario, u.usuario),
  });
  const ejecutarConfirmado = async () => {
    const c = confirmar; if (!c) return;
    setOcupado(true);
    await run(c.accion);
    setOcupado(false); setConfirmar(null);
  };

  // Estadísticas: todas salen de los datos reales cargados desde Supabase.
  const nAlumnos = todos.filter((u) => u.rol === 'jugador').length;
  const nDocentes = todos.filter((u) => u.rol === 'docente' && u.aprobacion === 'aprobada').length;
  const nSuspendidos = todos.filter((u) => u.cuenta === 'suspendido').length;

  return (
    <div className="pn-root">
      <header className="pn-head">
        <div className="pn-head-inner">
          <div className="pn-head-copy">
            <span className="pn-eyebrow">PSEINT RUNNER · CONTROL DEL SISTEMA</span>
            <h1>Administrador</h1>
           
            <span className="pn-user-tag">🛡️ {usuario}</span>
          </div>
          <div className="pn-acts">
            <button className="pn-btn pn-btn-primary" onClick={onProbar}> Probar el juego</button>
            <button className="pn-btn ghost" onClick={onSalir}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <div className="pn-page">
        <section className="pn-stats" aria-label="Resumen">
          <div className="pn-stat acc-coral"><span>Solicitudes pendientes</span><b>{sols.length}</b><small>Docentes por aprobar</small></div>
          <div className="pn-stat"><span>Alumnos</span><b>{nAlumnos}</b><small>Cuentas de jugador</small></div>
          <div className="pn-stat acc-green"><span>Docentes</span><b>{nDocentes}</b><small>Aprobados</small></div>
          <div className="pn-stat acc-red"><span>Suspendidos</span><b>{nSuspendidos}</b><small>Cuentas sin acceso</small></div>
        </section>

        <div className="pn-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'solicitudes'} className={tab === 'solicitudes' ? 'on' : ''} onClick={() => setTab('solicitudes')}>Solicitudes <span className="pn-tab-count">{sols.length}</span></button>
          <button role="tab" aria-selected={tab === 'usuarios'} className={tab === 'usuarios' ? 'on' : ''} onClick={() => setTab('usuarios')}>Usuarios <span className="pn-tab-count">{todos.length}</span></button>
          <button role="tab" aria-selected={tab === 'secciones'} className={tab === 'secciones' ? 'on' : ''} onClick={() => setTab('secciones')}>Secciones</button>
        </div>
        {msg && <div className="pn-msg" role="status">{msg}</div>}

        {tab === 'solicitudes' && (
          <div className="pn-list" style={{ marginTop: 14 }}>
            {sols.length === 0 && <p className="pn-vacio">No hay solicitudes pendientes.</p>}
            {sols.map((s) => (
              <div key={s.usuario} className="pn-card">
                <div className="pn-cell-main"><b>{s.usuario}</b><small>{s.correo} · {s.carrera}</small></div>
                <div className="pn-acts">
                  <button className="pn-btn small" onClick={() => run(() => P.resolverSolicitud(usuario, s.usuario, true))}>Aprobar</button>
                  <button className="pn-btn small danger" onClick={() => run(() => P.resolverSolicitud(usuario, s.usuario, false))}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'usuarios' && (
          <>
            <div className="pn-toolbar">
              <input className="pn-in" placeholder="Buscar por usuario o correo" aria-label="Buscar usuarios" value={q} onChange={(e) => setQ(e.target.value)} />
              <span className="pn-count">{users.length} {users.length === 1 ? 'usuario' : 'usuarios'}</span>
            </div>
            <div className="pn-table-wrap">
              <table className="pn-table" style={{ '--min': '960px' }}>
                <colgroup><col style={{ width: '28%' }} /><col style={{ width: '14%' }} /><col style={{ width: '12%' }} /><col style={{ width: '10%' }} /><col style={{ width: '36%' }} /></colgroup>
                <thead><tr><th>Usuario</th><th>Rol</th><th>Cuenta</th><th>Sección</th><th className="c-acts">Acciones</th></tr></thead>
                <tbody>
                  {users.length === 0 && <tr className="pn-empty-row"><td colSpan="5" className="pn-vacio">No se encontraron usuarios.</td></tr>}
                  {users.map((u) => {
                    const gestionable = u.rol !== 'admin' && u.usuario !== usuario;
                    const esDocenteAprobado = u.rol === 'docente' && u.aprobacion === 'aprobada';
                    return (
                      <tr key={u.usuario}>
                        <td><div className="pn-cell-main"><b title={u.usuario}>{u.usuario}</b><small title={u.correo}>{u.correo}</small></div></td>
                        <td><span className="pn-ellipsis" title={etiquetaRol(u)}>{etiquetaRol(u)}</span></td>
                        <td><span className={`pn-chip${u.cuenta === 'activo' ? ' ok' : ' bad'}`}>{u.cuenta}</span></td>
                        <td><span className="pn-ellipsis">{u.seccion || '—'}</span></td>
                        <td className="c-acts">
                          {gestionable ? (
                            <div className="pn-slots" style={{ '--n': 3 }}>
                              <button className="pn-btn small ghost" onClick={() => run(() => P.cambiarCuenta(usuario, u.usuario, u.cuenta === 'activo' ? 'suspendido' : 'activo'))}>{u.cuenta === 'activo' ? 'Suspender' : 'Activar'}</button>
                              <button className="pn-btn small ghost" onClick={() => run(() => P.asignarDocente(usuario, u.usuario, !esDocenteAprobado))}>{esDocenteAprobado ? 'Quitar docente' : 'Hacer docente'}</button>
                              {u.rol === 'jugador' && u.seccion
                                ? <button className="pn-btn small danger" onClick={() => pedirRemover(u)}>Remover</button>
                                : <span className="pn-slot-vacio" aria-hidden="true" />}
                            </div>
                          ) : <span className="pn-dash">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'secciones' && <SeccionesVista usuario={usuario} demo={demo} />}
      </div>

      <ConfirmModal
        abierto={!!confirmar} titulo={confirmar?.titulo} mensaje={confirmar?.mensaje}
        textoConfirmar={confirmar?.textoConfirmar} peligro ocupado={ocupado}
        onCancelar={() => setConfirmar(null)} onConfirmar={ejecutarConfirmado}
      />
    </div>
  );
}
