import { useEffect, useState } from 'react';
import { getRanking } from '../services/rankingService';
import { getPerfil } from '../services/authService';
import '../styles/ranking.css';

const TABS = [
  { id:'facil', label:'Fácil', color:'easy' },
  { id:'intermedio', label:'Intermedio', color:'medium' },
  { id:'dificil', label:'Difícil', color:'hard' },
];
const ZONA_NAMES = ['','Sierra Andina','Amazonía','Costa del Pacífico','Lima Urbana'];
const MEDALS = ['🥇','🥈','🥉'];
const initials = (name = '?') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

const MUESTRA_RANKING = [
  { usuario:'valeria.cruz', zonaIdx:1, puntaje:982, seccion:'2041' },
  { usuario:'mateo.rojas', zonaIdx:3, puntaje:956, seccion:'2041' },
  { usuario:'lucia.paredes', zonaIdx:2, puntaje:931, seccion:'2042' },
  { usuario:'diego.quispe', zonaIdx:4, puntaje:904, seccion:'2042' },
  { usuario:'camila.t', zonaIdx:1, puntaje:887, seccion:'2041' },
  { usuario:'andresv', zonaIdx:2, puntaje:861, seccion:'2043' },
];

export default function Ranking({ onVolver, demo = false }) {
  const [tab, setTab] = useState('facil');
  const [alcance, setAlcance] = useState('general');
  const [seccionId, setSeccionId] = useState('');
  const [data, setData] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [seccionUsuario, setSeccionUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const perfil = demo ? null : getPerfil();
  const esStaff = ['admin', 'administrador', 'docente'].includes(String(perfil?.rol || '').toLowerCase());

  useEffect(() => {
    if (demo) {
      const muestra = alcance === 'seccion' ? MUESTRA_RANKING.filter((r) => r.seccion === (seccionId || '2041')) : MUESTRA_RANKING;
      setData(muestra);
      setSecciones([{ id:'2041', codigo:'2041' }, { id:'2042', codigo:'2042' }, { id:'2043', codigo:'2043' }]);
      setSeccionUsuario({ id:'2041', codigo:'2041' });
      setCargando(false);
      return () => {};
    }
    if (alcance === 'seccion' && esStaff && !seccionId) {
      setData([]); setCargando(false); setError(secciones.length ? 'Selecciona una sección para consultar su clasificación.' : 'Tu cuenta no tiene secciones asignadas para consultar.');
      return () => {};
    }
    let vivo = true;
    setCargando(true); setError('');
    getRanking(tab, alcance, seccionId).then((resultado) => {
      if (vivo) {
        setData(resultado.jugadores);
        setSecciones(resultado.secciones);
        setSeccionUsuario(resultado.seccionUsuario);
        setCargando(false);
      }
    }).catch((e) => {
      if (vivo) { setData([]); setCargando(false); setError(e.message || 'No se pudo cargar el ranking.'); }
    });
    return () => { vivo = false; };
  }, [tab, alcance, seccionId, demo, esStaff]);

  const podium = data.slice(0, 3);
  const ordenPodio = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <main className="ranking-bg">
      <div className="ranking-wrap">
        <header className="ranking-header">
          <div>
            <span className="rank-eyebrow">PSEINT RUNNER · CLASIFICACIÓN</span>
            <h1>Tabla de campeones</h1>
            <p>{alcance === 'general' ? 'Compara los mejores puntajes de todos los jugadores.' : `Clasificación de ${esStaff ? (secciones.find((s) => String(s.id) === String(seccionId))?.codigo || 'la sección') : (seccionUsuario?.codigo || 'tu sección')}.`}</p>
          </div>
          <button className="rank-back" onClick={onVolver}><span aria-hidden="true">←</span> Volver al mapa</button>
        </header>

        <nav className="rank-tabs" aria-label="Filtrar por dificultad">
          {TABS.map((t) => (
            <button key={t.id} className={`rank-tab ${t.color}${tab === t.id ? ' sel' : ''}`} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              <span className="rank-tab-dot" />{t.label}
            </button>
          ))}
        </nav>

        <div className="rank-scope" role="group" aria-label="Alcance del ranking">
          <button type="button" className={`rank-scope-button${alcance === 'general' ? ' selected' : ''}`} aria-pressed={alcance === 'general'} onClick={() => setAlcance('general')}>🌐 Ranking general</button>
          <button type="button" className={`rank-scope-button${alcance === 'seccion' ? ' selected' : ''}`} aria-pressed={alcance === 'seccion'} onClick={async () => {
            setError('');
            if (esStaff && !secciones.length) {
              try {
                const contexto = await getRanking(tab, 'general');
                setSecciones(contexto.secciones);
                if (contexto.secciones[0]) setSeccionId(String(contexto.secciones[0].id));
              } catch (e) { setError(e.message || 'No se pudieron cargar las secciones.'); return; }
            } else if (esStaff && !seccionId && secciones[0]) setSeccionId(String(secciones[0].id));
            setAlcance('seccion');
          }}>👥 {esStaff ? 'Por sección' : 'Mi sección'}</button>
          {alcance === 'seccion' && esStaff && <label className="rank-section-select">Sección
            <select value={seccionId} onChange={(e) => setSeccionId(e.target.value)}>
              <option value="">Selecciona…</option>
              {secciones.map((s) => <option key={s.id} value={s.id}>{s.codigo}</option>)}
            </select>
          </label>}
          {alcance === 'seccion' && !esStaff && seccionUsuario && <span className="rank-my-section">Tu sección: <b>{seccionUsuario.codigo}</b></span>}
        </div>

        {podium.length > 0 && <section className="rank-podium" aria-label="Primeros puestos">
          {ordenPodio.map((r) => {
            const place = podium.indexOf(r);
            return <article key={`${r.usuario}-${place}`} className={`podium-card place-${place + 1}`}>
              <span className="podium-medal">{MEDALS[place]}</span>
              <div className="podium-avatar">{initials(r.usuario)}</div>
              <strong className="podium-name">{r.usuario}</strong>
              <span className="podium-zone">{ZONA_NAMES[r.zonaIdx] || 'Aventura completa'}</span>
              <b className="podium-score">{r.puntaje}<small> pts</small></b>
            </article>;
          })}
        </section>}

        <section className="rank-board">
          <div className="rank-board-head"><div><span className="rank-eyebrow">{alcance === 'general' ? 'CLASIFICACIÓN GENERAL' : 'CLASIFICACIÓN POR SECCIÓN'}</span><h2>{alcance === 'general' ? 'Mejores partidas' : (esStaff ? `Sección ${secciones.find((s) => String(s.id) === String(seccionId))?.codigo || ''}` : `Sección ${seccionUsuario?.codigo || ''}`)}</h2></div><span className="rank-total">{data.length} jugadores</span></div>
          <div className="rank-table-scroll">
            <table className="rank-table">
              <thead><tr><th>Puesto</th><th>Usuario</th>{alcance === 'general' && <th>Sección</th>}<th>Última zona</th><th>Puntaje</th></tr></thead>
              <tbody>
                {data.length === 0
                  ? <tr><td colSpan={alcance === 'general' ? 5 : 4} className="rank-empty">{cargando ? 'Cargando clasificación…' : error || (alcance === 'seccion' && !esStaff && !seccionUsuario ? 'Tu cuenta aún no está vinculada a una sección.' : 'Aún no hay partidas en esta dificultad.')}</td></tr>
                  : data.map((r, i) => (
                    <tr key={`${r.usuario}-${i}`} className={i < 3 ? `rank-row top-${i + 1}` : ''}>
                      <td><span className={`rank-pos${i < 3 ? ' medal' : ''}`}>{i < 3 ? MEDALS[i] : String(i + 1).padStart(2, '0')}</span></td>
                      <td><span className="rank-player"><span className="rank-avatar">{initials(r.usuario)}</span><b>{r.usuario}</b></span></td>
                      {alcance === 'general' && <td><span className="rank-zone">{r.seccion || 'Sin sección'}</span></td>}
                      <td><span className="rank-zone">{ZONA_NAMES[r.zonaIdx] || '—'}</span></td>
                      <td><strong className="rank-points">{r.puntaje}<small> pts</small></strong></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <footer className="rank-footer">Cada respuesta correcta te acerca a la cima.</footer>
      </div>
    </main>
  );
}
