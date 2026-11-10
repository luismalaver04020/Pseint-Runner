import { useEffect, useState } from 'react';
import { getRanking } from '../services/rankingService';
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
  { usuario:'valeria.cruz', zonaIdx:1, puntaje:982 },
  { usuario:'mateo.rojas', zonaIdx:3, puntaje:956 },
  { usuario:'lucia.paredes', zonaIdx:2, puntaje:931 },
  { usuario:'diego.quispe', zonaIdx:4, puntaje:904 },
  { usuario:'camila.t', zonaIdx:1, puntaje:887 },
  { usuario:'andresv', zonaIdx:2, puntaje:861 },
];

export default function Ranking({ onVolver, demo = false }) {
  const [tab, setTab] = useState('facil');
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (demo) { setData(MUESTRA_RANKING); setCargando(false); return () => {}; }
    let vivo = true;
    setCargando(true);
    getRanking(tab).then((d) => { if (vivo) { setData(d); setCargando(false); } });
    return () => { vivo = false; };
  }, [tab, demo]);

  const podium = data.slice(0, 3);
  const ordenPodio = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <main className="ranking-bg">
      <div className="ranking-wrap">
        <header className="ranking-header">
          <div>
            <span className="rank-eyebrow">PSEINT RUNNER · CLASIFICACIÓN</span>
            <h1>Tabla de campeones</h1>
            <p>Los mejores puntajes de cada dificultad.</p>
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
          <div className="rank-board-head"><div><span className="rank-eyebrow">CLASIFICACIÓN GENERAL</span><h2>Mejores partidas</h2></div><span className="rank-total">{data.length} jugadores</span></div>
          <div className="rank-table-scroll">
            <table className="rank-table">
              <thead><tr><th>Puesto</th><th>Usuario</th><th>Última zona</th><th>Puntaje</th></tr></thead>
              <tbody>
                {data.length === 0
                  ? <tr><td colSpan={4} className="rank-empty">{cargando ? 'Cargando clasificación…' : 'Aún no hay partidas en esta dificultad. ¡Sé el primero!'}</td></tr>
                  : data.map((r, i) => (
                    <tr key={`${r.usuario}-${i}`} className={i < 3 ? `rank-row top-${i + 1}` : ''}>
                      <td><span className={`rank-pos${i < 3 ? ' medal' : ''}`}>{i < 3 ? MEDALS[i] : String(i + 1).padStart(2, '0')}</span></td>
                      <td><span className="rank-player"><span className="rank-avatar">{initials(r.usuario)}</span><b>{r.usuario}</b></span></td>
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
