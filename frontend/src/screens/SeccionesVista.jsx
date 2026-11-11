import { useCallback, useEffect, useState } from 'react';
import { CARRERAS } from '../services/carreras';
import * as P from '../services/panelService';
import ConfirmModal from '../components/ConfirmModal';

const fmt = (t) => (t ? new Date(t).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const linkDe = (codigo) => `${window.location.origin}${window.location.pathname}?unirse=${codigo}`;

// Vista compartida: el docente ve sus secciones; el administrador ve todas.
export default function SeccionesVista({ usuario, demo = false }) {
  const [secs, setSecs] = useState([]);
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState('alumnos');
  const [nuevo, setNuevo] = useState({ codigo: '', periodo: '', carrera: CARRERAS[0] });
  const [alumnos, setAlumnos] = useState([]);
  const [temas, setTemas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [msg, setMsg] = useState('');
  const [aRemover, setARemover] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    if (demo) {
      const muestra = [{ id:'demo-1', codigo:'2041', periodo:'2026-2', carrera:'Ingeniería de Software', alumnos:24, docente:'prof.lucia', links:[{ codigo:'ABC-2041', activo:true }] }];
      setSecs(muestra);
      setSel('demo-1');
      return;
    }
    try {
      const s = await P.listarSecciones(usuario);
      setSecs(s);
      setSel((prev) => (prev && s.some((x) => x.id === prev) ? prev : s[0]?.id || null));
    } catch (e) { setMsg(e.message); }
  }, [usuario, demo]);
  useEffect(() => { cargar(); }, [cargar]);

  const cargarSeccion = useCallback(async () => {
    if (!sel) { setAlumnos([]); setTemas([]); return; }
    if (demo) {
      setAlumnos([{ usuario:'valeria.c', correo:'valeria.c@ejemplo.edu.pe', carrera:'Ing. de Software', zona:'Sierra Andina', unidadesAprobadas:3, unidadesTotal:3, mejorPuntaje:942, partidas:8, ultimaDificultad:'Intermedio', ultimaVez:new Date().toISOString(), temaDebil:'Ciclos' }, { usuario:'mateo.r', correo:'mateo.r@ejemplo.edu.pe', carrera:'Ciencias de la Computación', zona:'Amazonía', unidadesAprobadas:2, unidadesTotal:3, mejorPuntaje:816, partidas:5, ultimaDificultad:'Fácil', ultimaVez:new Date(Date.now() - 86400000).toISOString(), temaDebil:'Condicionales' }]);
      setTemas([{ tema:'Ciclos', tasaError:34, ok:28, mal:14 }, { tema:'Condicionales', tasaError:22, ok:35, mal:10 }]);
      return;
    }
    try {
      setAlumnos(await P.listarAlumnos(usuario, sel));
      setTemas(await P.erroresPorTema(usuario, sel));
    } catch (e) { setMsg(e.message); }
  }, [usuario, sel, demo]);
  useEffect(() => { cargarSeccion(); }, [cargarSeccion]);

  const seccion = secs.find((s) => s.id === sel);
  const link = seccion?.links.find((l) => l.activo) || seccion?.links[seccion.links.length - 1];

  const run = async (fn) => {
    setMsg('');
    if (demo) { setMsg('Vista de ejemplo: las acciones están desactivadas.'); return; }
    try { await fn(); } catch (e) { setMsg(e.message); }
  };

  const crear = () => run(async () => {
    const s = await P.crearSeccion(usuario, nuevo);
    setNuevo({ ...nuevo, codigo: '', periodo: '' });
    await cargar(); setSel(s.id);
  });
  const copiar = () => run(async () => {
    await navigator.clipboard.writeText(linkDe(link.codigo));
    setMsg('Link copiado');
  });
  const confirmarRemover = async () => {
    const a = aRemover; if (!a) return;
    setOcupado(true);
    await run(async () => {
      await P.removerAlumno(usuario, a.usuario);
      await cargar(); await cargarSeccion();
    });
    setOcupado(false); setARemover(null);
  };
  const verDetalle = (a) => run(async () => setDetalle(await P.detalleAlumno(usuario, a.usuario)));

  // Resumen de la sección: se calcula con los alumnos que devuelve Supabase.
  const totalPartidas = alumnos.reduce((n, a) => n + (a.partidas || 0), 0);
  const mejor = alumnos.reduce((m, a) => Math.max(m, a.mejorPuntaje || 0), 0);
  const completaron = alumnos.filter((a) => a.unidadesTotal > 0 && a.unidadesAprobadas === a.unidadesTotal).length;

  return (
    <div className="pn-workspace">
      <header className="pn-section-heading">
        <div>
          <span className="pn-eyebrow">SEGUIMIENTO ACADÉMICO</span>
          <h2>Secciones y estudiantes</h2>
          <p>Administra invitaciones y revisa el progreso del grupo.</p>
        </div>
      </header>

      <div className="pn-cols">
        <aside className="pn-side">
          <h3>Mis secciones ({secs.length})</h3>
          {secs.length === 0 && <p className="pn-vacio">Aún no hay secciones.</p>}
          <div className="pn-side-list">
            {secs.map((s) => (
              <button key={s.id} className={`pn-sec${s.id === sel ? ' on' : ''}`} onClick={() => setSel(s.id)} aria-pressed={s.id === sel}>
                <b>Sección {s.codigo}</b>
                <span>{s.periodo || 'sin periodo'} · {s.alumnos} alumno(s)</span>
                <span title={s.docente}>{s.docente}</span>
              </button>
            ))}
          </div>
          <h3>Nueva sección</h3>
          <input className="pn-in" placeholder="Número de sección (ej. 1234)" aria-label="Número de sección" value={nuevo.codigo} onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value })} />
          <input className="pn-in" placeholder="Periodo (ej. 2026-2)" aria-label="Periodo" value={nuevo.periodo} onChange={(e) => setNuevo({ ...nuevo, periodo: e.target.value })} />
          <select className="pn-in" aria-label="Carrera" value={nuevo.carrera} onChange={(e) => setNuevo({ ...nuevo, carrera: e.target.value })}>
            {CARRERAS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="pn-btn" onClick={crear}>+ Crear sección</button>
        </aside>

        <section className="pn-main">
          {msg && <div className="pn-msg" role="status" style={{ marginTop: 0, marginBottom: 14 }}>{msg}</div>}
          {!seccion ? <p className="pn-vacio pn-panel">Crea una sección para obtener tu link de invitación.</p> : (
            <>
              <div className="pn-stats" aria-label="Resumen de la sección">
                <div className="pn-stat"><span>Estudiantes</span><b>{alumnos.length}</b><small>Sección {seccion.codigo}</small></div>
                <div className="pn-stat acc-green"><span>Partidas jugadas</span><b>{totalPartidas}</b><small>Suma del grupo</small></div>
                <div className="pn-stat acc-gold"><span>Mejor puntaje</span><b>{mejor}</b><small>Máximo del grupo</small></div>
                <div className="pn-stat acc-coral"><span>Unidades completas</span><b>{completaron}</b><small>de {alumnos.length} estudiante(s)</small></div>
              </div>

              <div className="pn-card" style={{ marginTop: 14 }}>
                <div className="pn-link-row">
                  <div className="pn-link-info">
                    <small>LINK DE INVITACIÓN · Sección {seccion.codigo} · {seccion.carrera}</small>
                    <code className={`pn-link${link?.activo ? '' : ' off'}`} title={link ? linkDe(link.codigo) : ''}>{link ? linkDe(link.codigo) : '—'}</code>
                  </div>
                  <div className="pn-acts">
                    <button className="pn-btn small" disabled={!link} onClick={copiar}>Copiar</button>
                    <button className="pn-btn small ghost" disabled={!link} onClick={() => run(async () => { await P.alternarLink(usuario, sel, link.codigo); await cargar(); })}>{link?.activo ? 'Desactivar' : 'Activar'}</button>
                    <button className="pn-btn small ghost" onClick={() => run(async () => { await P.crearLink(usuario, sel); await cargar(); })}>Link nuevo</button>
                  </div>
                </div>
              </div>

              <div className="pn-tabs" role="tablist">
                <button role="tab" aria-selected={tab === 'alumnos'} className={tab === 'alumnos' ? 'on' : ''} onClick={() => setTab('alumnos')}>Alumnos <span className="pn-tab-count">{alumnos.length}</span></button>
                <button role="tab" aria-selected={tab === 'temas'} className={tab === 'temas' ? 'on' : ''} onClick={() => setTab('temas')}>Errores por tema</button>
              </div>

              {tab === 'alumnos' && (
                <div className="pn-table-wrap">
                  <table className="pn-table" style={{ '--min': '880px' }}>
                    <colgroup>
                      <col style={{ width: '19%' }} /><col style={{ width: '11%' }} /><col style={{ width: '12%' }} /><col style={{ width: '7%' }} />
                      <col style={{ width: '10%' }} /><col style={{ width: '14%' }} /><col style={{ width: '11%' }} /><col style={{ width: '16%' }} />
                    </colgroup>
                    <thead><tr>
                      <th>Alumno</th><th title="Zona actual">Zona</th><th>Progreso</th><th className="c-num" title="Mejor puntaje">Mejor</th>
                      <th className="c-num">Partidas</th><th title="Última partida">Última</th><th>Tema débil</th><th className="c-acts">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {alumnos.length === 0 && <tr className="pn-empty-row"><td colSpan="8" className="pn-vacio">Nadie se ha unido todavía. Comparte el link.</td></tr>}
                      {alumnos.map((a) => {
                        const pct = a.unidadesTotal ? Math.round((a.unidadesAprobadas / a.unidadesTotal) * 100) : 0;
                        return (
                          <tr key={a.usuario}>
                            <td><div className="pn-cell-main"><b title={a.usuario}>{a.usuario}</b><small title={[a.correo, a.carrera].filter(Boolean).join(' · ')}>{a.correo || a.carrera}</small></div></td>
                            <td><span className="pn-ellipsis" title={a.zona}>{a.zona}</span></td>
                            <td>
                              <div className="pn-prog" title={`${a.unidadesAprobadas} de ${a.unidadesTotal} unidades aprobadas`}>
                                <div className="pn-prog-bar"><div style={{ width: `${pct}%` }} /></div>
                                <b>{a.unidadesAprobadas}/{a.unidadesTotal}</b>
                              </div>
                            </td>
                            <td className="c-num">{a.mejorPuntaje}</td>
                            <td className="c-num">{a.partidas}</td>
                            <td><div className="pn-cell-main"><b style={{ fontSize: 13 }}>{a.ultimaDificultad}</b><small>{fmt(a.ultimaVez)}</small></div></td>
                            <td><span className="pn-ellipsis" title={a.temaDebil}>{a.temaDebil}</span></td>
                            <td className="c-acts">
                              <div className="pn-slots" style={{ '--n': 2 }}>
                                <button className="pn-btn small" onClick={() => verDetalle(a)}>Detalle</button>
                                <button className="pn-btn small danger" onClick={() => setARemover(a)}>Remover</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'temas' && (
                <div>
                  {temas.length === 0 && <p className="pn-vacio pn-panel">Todavía no hay respuestas registradas.</p>}
                  {temas.map((t) => (
                    <div key={t.tema} className="pn-barra">
                      <div className="pn-barra-top"><span title={t.tema}>{t.tema}</span><b>{t.tasaError}% error · {t.ok + t.mal} resp.</b></div>
                      <div className="pn-barra-bg"><div style={{ width: `${t.tasaError}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {detalle && (
        <div className="pn-modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetalle(null); }}>
          <div className="pn-modal-box" role="dialog" aria-modal="true" aria-label={`Detalle de ${detalle.usuario}`}>
            <div className="pn-row" style={{ flexWrap: 'nowrap' }}><h3>{detalle.usuario}</h3><button className="pn-btn small ghost" onClick={() => setDetalle(null)}>Cerrar</button></div>
            <h4>Partidas</h4>
            {detalle.partidas.length === 0 ? <p className="pn-vacio">Sin partidas.</p> : (
              <div className="pn-table-wrap"><table className="pn-table"><thead><tr><th>Fecha</th><th title="Zona actual">Zona</th><th>Dificultad</th><th className="c-num">Puntaje</th><th>Resultado</th></tr></thead>
                <tbody>{detalle.partidas.map((p, i) => (
                  <tr key={i}><td>{fmt(p.fecha)}</td><td><span className="pn-ellipsis">{p.zona}</span></td><td>{p.dificultad}</td><td className="c-num">{p.puntaje}</td><td>{p.resultado}</td></tr>
                ))}</tbody></table></div>
            )}
            <h4>Aciertos y errores por tema</h4>
            {detalle.temas.length === 0 ? <p className="pn-vacio">Sin respuestas.</p> : (
              <div className="pn-table-wrap"><table className="pn-table" style={{ '--min': '420px' }}><thead><tr><th>Tema</th><th className="c-num">Aciertos</th><th className="c-num">Errores</th></tr></thead>
                <tbody>{detalle.temas.map((t) => <tr key={t.tema}><td><span className="pn-ellipsis" title={t.tema}>{t.tema}</span></td><td className="c-num">{t.ok}</td><td className="c-num">{t.mal}</td></tr>)}</tbody></table></div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        abierto={!!aRemover}
        titulo={`¿Remover a ${aRemover?.usuario}?`}
        mensaje="Se borrará todo su juego (progreso, estadísticas y ranking)."
        textoConfirmar="Remover" peligro ocupado={ocupado}
        onCancelar={() => setARemover(null)} onConfirmar={confirmarRemover}
      />
    </div>
  );
}
