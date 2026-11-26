import { useCallback, useEffect, useRef, useState } from 'react';
import SeccionesVista from './SeccionesVista';
import ConfirmModal from '../components/ConfirmModal';
import * as P from '../services/panelService';
import { AVATAR_REF, drawPersonaje } from '../game/spritePersonaje';
import '../styles/paneles.css';

const etiquetaRol = (u) => {
  if (u.rol === 'jugador') return 'Alumno';
  if (u.rol === 'docente') return u.aprobacion && u.aprobacion !== 'aprobada' ? `Docente (${u.aprobacion})` : 'Docente';
  if (u.rol === 'admin') return 'Administrador';
  return u.rol || '—';
};

const COLORES_GRAFICO = ['#38d6ff', '#ff7a45', '#9b8cff', '#3ddc84', '#ffc83d', '#ff5d73', '#76a9ff'];

function AvatarPerfilAdmin({ avatar, nombre }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const config = avatar && typeof avatar === 'object' && !Array.isArray(avatar) ? avatar : AVATAR_REF;
    drawPersonaje(ctx, canvas.width / 2, canvas.height - 12, config, { vista: 'frente', P: 3 });
  }, [avatar]);
  return <div className="pn-profile-avatar"><canvas ref={canvasRef} width={120} height={144} aria-label={`Avatar de ${nombre || 'usuario'}`} /><span>AVATAR</span></div>;
}

function fechaPerfil(value, incluirHora = false) {
  if (!value) return 'No registrada';
  const soloFecha = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const fecha = soloFecha
    ? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
    : new Date(value);
  if (Number.isNaN(fecha.getTime())) return 'No disponible';
  return new Intl.DateTimeFormat('es-PE', incluirHora
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'long' }).format(fecha);
}

function PerfilUsuarioModal({ detalle, cargando, onCerrar }) {
  useEffect(() => {
    if (!detalle) return undefined;
    const cerrarConEscape = (event) => { if (event.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [detalle, onCerrar]);
  if (!detalle) return null;
  const genero = { mujer: 'Mujer', hombre: 'Hombre', no_binario: 'No binario', otro: 'Otro', prefiero_no_decir: 'Prefiere no decirlo' }[detalle.genero] || detalle.genero || 'No registrado';
  const nombre = [detalle.nombres, detalle.apellidos].filter(Boolean).join(' ') || 'Datos personales pendientes';
  const campos = [
    ['Nombre completo', nombre], ['Nombre de usuario', detalle.usuario || '—'],
    ['Correo electrónico', detalle.correo || '—'], ['Fecha de nacimiento', fechaPerfil(detalle.fechaNacimiento)],
    ['Género', genero], ['Rol', detalle.rol || '—'],
    ['Estado de cuenta', detalle.cuenta || '—'], ['Carrera', detalle.carrera || 'Sin carrera registrada'],
    ['Sección', detalle.seccion || 'Sin sección'], ['Cuenta creada', fechaPerfil(detalle.fechaRegistro, true)],
    ['Último acceso', fechaPerfil(detalle.ultimaConexion, true)],
  ];
  return (
    <div className="pn-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCerrar(); }}>
      <section className="pn-modal-box pn-profile-modal" role="dialog" aria-modal="true" aria-labelledby="pn-profile-title">
        <header className="pn-profile-heading">
          <div><span className="pn-eyebrow">CUENTA DE JUGADOR</span><h3 id="pn-profile-title">Perfil de {detalle.usuario}</h3></div>
          <button type="button" className="pn-btn ghost" onClick={onCerrar} aria-label="Cerrar perfil">✕</button>
        </header>
        {cargando ? <p className="pn-vacio" role="status">Cargando perfil…</p>
          : detalle.error ? <p className="pn-msg" role="alert">{detalle.error}</p>
            : <div className="pn-profile-content">
              <AvatarPerfilAdmin avatar={detalle.avatar} nombre={detalle.usuario} />
              <div className="pn-profile-fields">
                {campos.map(([etiqueta, valor]) => <div className="pn-profile-field" key={etiqueta}><span>{etiqueta}</span><b title={String(valor)}>{valor}</b></div>)}
              </div>
            </div>}
        <p className="pn-profile-privacy">Vista de consulta para administración. Los datos personales no se pueden editar desde esta ventana.</p>
      </section>
    </div>
  );
}

function GraficoGenero({ datos = [], total = 0 }) {
  let acumulado = 0;
  const segmentos = datos.map((d, i) => {
    const inicio = acumulado;
    acumulado += Math.max(0, Number(d.porcentaje) || 0);
    return `${COLORES_GRAFICO[i % COLORES_GRAFICO.length]} ${inicio}% ${acumulado}%`;
  });
  return <div className="pn-gender-chart">
    <div className="pn-donut" style={{ background: segmentos.length ? `conic-gradient(${segmentos.join(',')})` : '#26345f' }} role="img" aria-label="Distribución de usuarios por género">
      <div className="pn-donut-center"><b>{total}</b><span>usuarios</span></div>
    </div>
    <ul className="pn-legend">{datos.map((d, i) => <li key={d.categoria}><i style={{ '--swatch': COLORES_GRAFICO[i % COLORES_GRAFICO.length] }} /><span>{d.categoria}</span><b>{d.cantidad}<small>{d.porcentaje}%</small></b></li>)}</ul>
  </div>;
}

function GraficoRegistros({ datos = [] }) {
  if (!datos.length) return <p className="pn-vacio">Aún no hay registros en este periodo.</p>;
  const ancho = 640, alto = 220, izquierda = 38, derecha = 14, arriba = 16, abajo = 42;
  const maximo = Math.max(1, ...datos.map((d) => Number(d.cantidad) || 0));
  const x = (i) => izquierda + (datos.length < 2 ? (ancho - izquierda - derecha) / 2 : i * (ancho - izquierda - derecha) / (datos.length - 1));
  const y = (n) => alto - abajo - (Number(n) / maximo) * (alto - arriba - abajo);
  const puntos = datos.map((d, i) => `${x(i)},${y(d.cantidad)}`).join(' ');
  const etiquetaMes = (mes) => {
    const [anio, numero] = String(mes).split('-').map(Number);
    const corto = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(new Date(anio, numero - 1, 1)).replace('.', '');
    return `${corto} '${String(anio).slice(-2)}`;
  };
  return <div className="pn-line-wrap"><svg className="pn-line-chart" viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Nuevas cuentas registradas por mes">
    {[0, .5, 1].map((ratio) => { const yy = arriba + ratio * (alto - arriba - abajo); return <g key={ratio}><line x1={izquierda} x2={ancho - derecha} y1={yy} y2={yy} className="pn-chart-grid"/><text x={izquierda - 9} y={yy + 4} textAnchor="end" className="pn-chart-axis">{Math.round(maximo * (1 - ratio))}</text></g>; })}
    <polygon points={`${izquierda},${alto - abajo} ${puntos} ${x(datos.length - 1)},${alto - abajo}`} className="pn-line-area" />
    <polyline points={puntos} className="pn-line-path" />
    {datos.map((d, i) => <g key={d.mes}><circle cx={x(i)} cy={y(d.cantidad)} r="4" className="pn-line-point"><title>{`${etiquetaMes(d.mes)} ${d.mes}: ${d.cantidad} registros`}</title></circle><text x={x(i)} y={alto - 16} textAnchor="middle" className="pn-chart-axis">{etiquetaMes(d.mes)}</text></g>)}
  </svg></div>;
}

function GraficoBarras({ datos = [], total = 0, modo = 'cantidad' }) {
  const maximo = Math.max(1, ...datos.map((d) => Number(d.cantidad) || 0));
  return <div className="pn-report-list">{datos.map((d, i) => {
    const cantidad = Number(d.cantidad) || 0;
    const porcentaje = total ? Math.round(cantidad * 1000 / total) / 10 : 0;
    return <div className="pn-report-row" key={d.categoria} title={`${d.categoria}: ${cantidad} usuarios (${porcentaje}%)`}>
      <div><span>{d.categoria}</span><b>{modo === 'porcentaje' ? `${porcentaje}%` : cantidad}</b></div>
      <div className="pn-report-track"><i style={{ width: `${(cantidad / maximo) * 100}%`, '--bar-color': COLORES_GRAFICO[i % COLORES_GRAFICO.length] }} /></div>
    </div>;
  })}</div>;
}

export default function PanelAdmin({ usuario, onProbar, onSalir, onPerfil, demo = false, initialTab = 'solicitudes' }) {
  const [tab, setTab] = useState(initialTab || 'solicitudes');
  const [sols, setSols] = useState([]);
  const [users, setUsers] = useState([]);       // lista según la búsqueda
  const [todos, setTodos] = useState([]);       // lista completa (sin búsqueda) para las estadísticas
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmar, setConfirmar] = useState(null);   // { titulo, mensaje, textoConfirmar, accion }
  const [ocupado, setOcupado] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [modoReporte, setModoReporte] = useState('cantidad');
  const [mesesReporte, setMesesReporte] = useState(12);
  const [detalleUsuario, setDetalleUsuario] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const detalleRequest = useRef(0);
  const [comentarios, setComentarios] = useState([]);
  const [buscarComentario, setBuscarComentario] = useState('');

  const cargar = useCallback(async () => {
    if (demo) {
      const muestra = [{ usuario:'ana.m', correo:'ana.m@ejemplo.edu.pe', rol:'jugador', cuenta:'activo', seccion:'2041' }, { usuario:'prof.lucia', correo:'lucia@ejemplo.edu.pe', rol:'docente', aprobacion:'aprobada', cuenta:'activo', seccion:'—' }, { usuario:'carlos.p', correo:'carlos.p@ejemplo.edu.pe', rol:'jugador', cuenta:'suspendido', seccion:'—' }];
      setSols([{ usuario:'mariana.r', correo:'mariana.r@ejemplo.edu.pe', carrera:'Ingeniería de Software' }, { usuario:'diego.q', correo:'diego.q@ejemplo.edu.pe', carrera:'Ciencias de la Computación' }]);
      setUsers(muestra); setTodos(muestra);
      setComentarios([
        { id: 1, usuario: 'ana.m', motivo: 'La dificultad aumenta muy rápido', comentario: 'Me gusta el juego, pero después de varias preguntas aparecen muchos obstáculos juntos.', enviadoEn: '2026-11-21T17:35:00Z', zona: 'Sierra Andina', dificultad: 'Intermedio', puntaje: 420 },
        { id: 2, usuario: 'carlos.p', motivo: 'Tuve un problema técnico', comentario: 'En mi celular los botones quedan muy cerca del borde.', enviadoEn: '2026-11-20T10:20:00Z', zona: 'Amazonía', dificultad: 'Fácil', puntaje: 260 },
      ]);
      setReporte({ total: 128, porGenero: [{ categoria:'Mujer', cantidad:66, porcentaje:51.6 },{ categoria:'Hombre', cantidad:55, porcentaje:43 },{ categoria:'Prefiero no decirlo', cantidad:4, porcentaje:3.1 },{ categoria:'Sin dato', cantidad:3, porcentaje:2.3 }], porEdad: [{categoria:'Menor de 18',cantidad:10},{categoria:'18–24',cantidad:93},{categoria:'25–34',cantidad:20},{categoria:'35 o más',cantidad:2},{categoria:'Sin dato',cantidad:3}], porCarrera: [{categoria:'Ingeniería de Software',cantidad:64},{categoria:'Ingeniería de Sistemas',cantidad:38},{categoria:'Sin carrera',cantidad:26}], porRol: [{categoria:'Jugador',cantidad:115},{categoria:'Docente',cantidad:11},{categoria:'Administrador',cantidad:2}], registrosMensuales: [{mes:'2026-06',cantidad:12},{mes:'2026-07',cantidad:20},{mes:'2026-08',cantidad:34},{mes:'2026-09',cantidad:27},{mes:'2026-10',cantidad:35}] });
      return;
    }
    try {
      setSols(await P.solicitudesDocente(usuario));
      if (tab === 'reportes') setReporte(await P.reporteUsuarios());
      if (tab === 'comentarios') setComentarios(await P.comentariosAdmin(usuario, 200));
      const lista = await P.listarUsuarios(usuario, q);
      setUsers(lista);
      if (!q.trim()) setTodos(lista);
    } catch (e) { setMsg(e.message); }
  }, [usuario, q, demo, tab]);
  useEffect(() => { cargar(); }, [cargar]);

  const run = async (fn) => {
    setMsg('');
    if (demo) { setMsg('Vista de ejemplo: las acciones están desactivadas.'); return; }
    try { await fn(); await cargar(); } catch (e) { setMsg(e.message); }
  };

  const abrirPerfilUsuario = async (target) => {
    const solicitud = ++detalleRequest.current;
    setDetalleUsuario({ usuario: target });
    setCargandoDetalle(true);
    try {
      const info = demo
        ? { usuario: target, correo: `${target}@ejemplo.edu.pe`, nombres: target === 'ana.m' ? 'Ana' : 'Carlos', apellidos: 'Mendoza', fechaNacimiento: '2005-08-17', genero: target === 'ana.m' ? 'mujer' : 'hombre', rol: 'Alumno', cuenta: 'activo', fechaRegistro: '2026-06-09T15:30:00Z', ultimaConexion: '2026-11-23T14:15:00Z', carrera: 'Ingeniería de Software', seccion: '2041', avatar: AVATAR_REF }
        : await P.detalleUsuarioAdmin(usuario, target);
      if (solicitud === detalleRequest.current) setDetalleUsuario(info || { usuario: target, error: 'No se encontró el perfil.' });
    } catch (error) {
      if (solicitud === detalleRequest.current) setDetalleUsuario({ usuario: target, error: error?.message || 'No se pudo cargar el perfil.' });
    } finally {
      if (solicitud === detalleRequest.current) setCargandoDetalle(false);
    }
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
  const comentariosFiltrados = comentarios.filter((item) => {
    const texto = [item.usuario, item.motivo, item.comentario, item.zona, item.dificultad].filter(Boolean).join(' ').toLocaleLowerCase('es');
    return texto.includes(buscarComentario.trim().toLocaleLowerCase('es'));
  });
  const registrosPeriodo = (reporte?.registrosMensuales || []).slice(-mesesReporte);
  const totalPeriodo = registrosPeriodo.reduce((suma, item) => suma + (Number(item.cantidad) || 0), 0);
  const promedioPeriodo = registrosPeriodo.length ? (totalPeriodo / registrosPeriodo.length).toFixed(1).replace('.', ',') : '0';
  const periodoLabel = mesesReporte === 1 ? 'Último mes' : `Últimos ${mesesReporte} meses`;

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
            {onPerfil && <button className="pn-btn ghost" onClick={onPerfil}>Mi perfil</button>}
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
          <button role="tab" aria-selected={tab === 'reportes'} className={tab === 'reportes' ? 'on' : ''} onClick={() => setTab('reportes')}>Reportes</button>
          <button role="tab" aria-selected={tab === 'comentarios'} className={tab === 'comentarios' ? 'on' : ''} onClick={() => setTab('comentarios')}>Comentarios <span className="pn-tab-count">{comentarios.length}</span></button>
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
              <table className="pn-table" style={{ '--min': '1160px' }}>
                <colgroup><col style={{ width: '23%' }} /><col style={{ width: '12%' }} /><col style={{ width: '10%' }} /><col style={{ width: '9%' }} /><col style={{ width: '46%' }} /></colgroup>
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
                            <div className="pn-slots" style={{ '--n': 4 }}>
                              <button className="pn-btn small ghost" onClick={() => abrirPerfilUsuario(u.usuario)}>Ver perfil</button>
                              <button className="pn-btn small ghost" onClick={() => run(() => P.cambiarCuenta(usuario, u.usuario, u.cuenta === 'activo' ? 'suspendido' : 'activo'))}>{u.cuenta === 'activo' ? 'Suspender' : 'Activar'}</button>
                              <button className="pn-btn small ghost" onClick={() => run(() => P.asignarDocente(usuario, u.usuario, !esDocenteAprobado))}>{esDocenteAprobado ? 'Quitar docente' : 'Hacer docente'}</button>
                              {u.rol === 'jugador' && u.seccion
                                ? <button className="pn-btn small danger" onClick={() => pedirRemover(u)}>Remover</button>
                                : <span className="pn-slot-vacio" aria-hidden="true" />}
                            </div>
                          ) : <button className="pn-btn small ghost" onClick={() => abrirPerfilUsuario(u.usuario)}>Ver perfil</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'reportes' && reporte && <section className="pn-report" aria-label="Reportes de usuarios">
          <div className="pn-report-top"><div><span className="pn-eyebrow">PANEL DE USUARIOS</span><h2>Registro y comunidad</h2><p>Vista general del crecimiento y composición de las cuentas.</p></div><div className="pn-report-total"><b>{reporte.total ?? 0}</b><span>cuentas registradas</span></div></div>
          <article className="pn-report-card pn-trend-card"><div className="pn-chart-heading"><div><h3>Nuevos registros</h3><p>Altas por mes · {periodoLabel.toLowerCase()}</p></div><div className="pn-chart-tools" role="group" aria-label="Periodo del gráfico">{[1, 3, 6, 12].map((meses) => <button key={meses} aria-pressed={mesesReporte === meses} className={mesesReporte === meses ? 'selected' : ''} onClick={() => setMesesReporte(meses)}>{meses} {meses === 1 ? 'mes' : 'meses'}</button>)}</div></div><GraficoRegistros datos={registrosPeriodo} /><div className="pn-report-period-summary"><div><span>Registros en el período</span><b>{totalPeriodo}</b></div><div><span>Promedio mensual</span><b>{promedioPeriodo}</b></div><small>El mes actual puede estar incompleto.</small></div></article>
          <div className="pn-report-grid">
            <article className="pn-report-card"><div className="pn-chart-heading"><div><h3>Género</h3><p>Distribución de cuentas</p></div></div><GraficoGenero datos={reporte.porGenero || []} total={reporte.total || 0} /></article>
            {[['Edades', reporte.porEdad],['Carreras', reporte.porCarrera],['Tipo de cuenta', reporte.porRol]].map(([titulo, items]) => <article className="pn-report-card" key={titulo}><div className="pn-chart-heading"><div><h3>{titulo}</h3><p>Usuarios registrados</p></div><div className="pn-chart-tools" role="group" aria-label={`Mostrar ${titulo.toLowerCase()} como`}><button className={modoReporte === 'cantidad' ? 'selected' : ''} onClick={() => setModoReporte('cantidad')}>N.º</button><button className={modoReporte === 'porcentaje' ? 'selected' : ''} onClick={() => setModoReporte('porcentaje')}>%</button></div></div>{items?.length ? <GraficoBarras datos={items} total={reporte.total || 0} modo={modoReporte} /> : <p className="pn-vacio">Todavía no hay datos para mostrar.</p>}</article>)}
          </div>
        </section>}

        {tab === 'comentarios' && <section className="pn-feedback" aria-label="Comentarios de los jugadores">
          <div className="pn-section-heading">
            <div><span className="pn-eyebrow">ESCUCHA A LA COMUNIDAD</span><h2>Comentarios de jugadores</h2><p>Revisa sus observaciones junto al contexto de la partida para priorizar mejoras.</p></div>
          </div>
          <div className="pn-toolbar pn-feedback-toolbar">
            <input className="pn-in" placeholder="Buscar por jugador, motivo o comentario" aria-label="Buscar comentarios" value={buscarComentario} onChange={(event) => setBuscarComentario(event.target.value)} />
            <span className="pn-count">Mostrando {comentariosFiltrados.length} de {comentarios.length} recientes</span>
          </div>
          {comentariosFiltrados.length === 0
            ? <p className="pn-vacio">{comentarios.length ? 'No hay comentarios que coincidan con la búsqueda.' : 'Todavía no hay comentarios de partidas.'}</p>
            : <div className="pn-feedback-list">{comentariosFiltrados.map((item) => (
              <article className="pn-feedback-card" key={item.id}>
                <div className="pn-feedback-head"><div><b>{item.usuario || 'Jugador'}</b><time dateTime={item.enviadoEn}>{fechaPerfil(item.enviadoEn, true)}</time></div><span className="pn-chip info">{item.motivo || 'Sin motivo'}</span></div>
                <p className="pn-feedback-comment">{item.comentario?.trim() || 'No dejó un comentario escrito; solo seleccionó el motivo.'}</p>
                <div className="pn-feedback-context"><span>{item.zona || 'Zona no disponible'}</span><span>{item.dificultad || 'Dificultad no disponible'}</span><span>{item.puntaje == null ? 'Puntaje no disponible' : `Puntaje ${item.puntaje}`}</span></div>
              </article>
            ))}</div>}
        </section>}

        {tab === 'secciones' && <SeccionesVista usuario={usuario} demo={demo} />}
      </div>

      <PerfilUsuarioModal detalle={detalleUsuario} cargando={cargandoDetalle} onCerrar={() => { detalleRequest.current += 1; setDetalleUsuario(null); setCargandoDetalle(false); }} />

      <ConfirmModal
        abierto={!!confirmar} titulo={confirmar?.titulo} mensaje={confirmar?.mensaje}
        textoConfirmar={confirmar?.textoConfirmar} peligro ocupado={ocupado}
        onCancelar={() => setConfirmar(null)} onConfirmar={ejecutarConfirmado}
      />
    </div>
  );
}
