import { useStore } from '../store/useStore';
import { useEffect, useRef, useState } from 'react';
import { esDificultadValida, MSG_FALTA_DIFICULTAD, MSG_ELIGE_DIFICULTAD } from '../services/validacionesPartida';
import { ZONAS, ZONAS_ORDEN } from '../game/zonas';
import mapaImg from '../assets/mapa-peru.png';
import '../styles/mapa.css';

const DIF_OPTS = [
  { id:'facil',      label:'🟢 FÁCIL',      sub:'Selección múltiple', cls:'d-easy' },
  { id:'intermedio', label:'🟡 INTERMEDIO',  sub:'Selección + código', cls:'d-med'  },
  { id:'dificil',    label:'🔴 DIFÍCIL',     sub:'Solo código PSeInt', cls:'d-hard' },
];

// Posición de cada pin en % de la imagen (el marco tiene la misma proporción que la imagen).
// Los pines son compactos y están sobre zonas del mapa donde no tapan textos importantes.
const PIN_POS = {
  rocosa:  { x: 60, y: 8  },  // cordillera, arriba
  selva:   { x: 87, y: 89 },  // bosque, abajo a la derecha
  costera: { x: 7,  y: 44 },  // mar / costa, a la izquierda
  ciudad:  { x: 51, y: 50 },  // parque central
};

export default function Mapa({ onIniciar, onRanking, onAvatar, onLogout, onPanel }) {
  const { usuario, dificultad, setDificultad, setZona, estaDesbloqueada } = useStore();
  const [guiaAbierta, setGuiaAbierta] = useState(() => sessionStorage.getItem('pseint-runner-guia-v1') !== 'vista');
  // La dificultad vive en el store (null hasta que el jugador elige); no hay valor por defecto.
  const difElegida = esDificultadValida(dificultad);
  const [aviso, setAviso] = useState('');
  const [sacudir, setSacudir] = useState(false);
  const panelDifRef = useRef(null);
  useEffect(() => { if (!sacudir) return undefined; const t = setTimeout(() => setSacudir(false), 600); return () => clearTimeout(t); }, [sacudir]);

  const cerrarGuia = () => {
    sessionStorage.setItem('pseint-runner-guia-v1', 'vista');
    setGuiaAbierta(false);
  };

  const elegirDificultad = (id) => { setDificultad(id); setAviso(''); };

  const elegir = (id) => {
    if (!estaDesbloqueada(id)) return;
    // Validación obligatoria: sin dificultad no se inicia partida ni se cambia de pantalla.
    if (!esDificultadValida(dificultad)) {
      setAviso(MSG_FALTA_DIFICULTAD);
      setSacudir(true);
      panelDifRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    setZona(id);
    onIniciar();
  };

  const zonasAbiertas = ZONAS_ORDEN.filter((id) => estaDesbloqueada(id)).length;

  const hayBloqueadas = ZONAS_ORDEN.some((id) => !estaDesbloqueada(id));

  return (
    <div className="mapa-bg">
      <div className="mapa-top-bar">
        <span className="mapa-title">🗺️ ELIGE TU ZONA</span>
        <span className="mapa-user">👤 {usuario}</span>
      </div>

      <div className="mapa-stage">
        <div className="mapa-frame">
          <img className="mapa-photo" src={mapaImg} alt="Mapa del Perú por zonas" draggable="false" />

          <svg className="mapa-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {ZONAS_ORDEN.slice(1).map((id, i) => {
              const a = PIN_POS[ZONAS_ORDEN[i]], b = PIN_POS[id];
              return <line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`ruta-linea${estaDesbloqueada(id) ? ' activa' : ''}`} />;
            })}
          </svg>

          {ZONAS_ORDEN.map((id) => {
            const z = ZONAS[id];
            const unlocked = estaDesbloqueada(id);
            const pos = PIN_POS[id];
            return (
              <button
                key={id}
                className={`mapa-pin${unlocked ? '' : ' bloqueado'}${difElegida && unlocked ? ' paso-activo' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => elegir(id)}
                disabled={!unlocked}
                title={unlocked ? z.nombre : 'Completa la zona anterior para desbloquear'}
              >
                <span className="mapa-pin-icono">{unlocked ? z.nombre.split(' ')[0] : '🔒'}</span>
                <span className="mapa-pin-label">{unlocked ? z.nombre.split(' ').slice(1).join(' ') : '???'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mapa-side">
        <div className="mapa-perfil" aria-label="Tu progreso">
          <div className="mapa-perfil-top"><span className="mapa-perfil-avatar" aria-hidden="true">👤</span><b title={usuario}>{usuario}</b></div>
          <div className="mapa-perfil-prog"><span>Zonas desbloqueadas</span><b>{zonasAbiertas}/{ZONAS_ORDEN.length}</b></div>
          <div className="mapa-perfil-barra" role="progressbar" aria-valuemin={0} aria-valuemax={ZONAS_ORDEN.length} aria-valuenow={zonasAbiertas}><div style={{ width: `${(zonasAbiertas / ZONAS_ORDEN.length) * 100}%` }} /></div>
        </div>
        <div ref={panelDifRef} className={`mapa-diff-panel${sacudir ? ' sacudir' : ''}${aviso ? ' con-aviso' : ''}`}>
          <h3><span className={`mapa-flow-arrow${difElegida ? ' completado' : ''}`}>{difElegida ? '✓' : '↓'}</span> 1 · ELIGE DIFICULTAD</h3>
          <div role="group" aria-label="Dificultad">
            {DIF_OPTS.map(d => (
              <button key={d.id} type="button" aria-pressed={dificultad===d.id} className={`diff-btn ${d.cls}${dificultad===d.id?' selected':''}${difElegida && dificultad!==d.id?' unfocused':''}`} onClick={()=>elegirDificultad(d.id)}>
                {d.label}<br/><span className="diff-sub">{d.sub}</span>
              </button>
            ))}
          </div>
          {aviso && <p className="mapa-aviso" role="alert">⚠ {aviso}</p>}
          <div className={`mapa-step-note${difElegida ? ' activo' : ''}`}>
            <span className="mapa-flow-arrow mapa-flow-arrow-zona">{difElegida ? '←' : '2'}</span>
            {difElegida ? 'Ahora elige una zona en el mapa.' : `${MSG_ELIGE_DIFICULTAD}.`}
          </div>
        </div>
        <div className="mapa-extra-btns">
          <button className="map-btn" onClick={()=>setGuiaAbierta(true)}>CÓMO JUGAR</button>
          {onPanel && <button className="map-btn" onClick={onPanel}>🧑‍🏫 PANEL</button>}
          <button className="map-btn" onClick={onRanking}>🏆 RANKING</button>
          <button className="map-btn" onClick={onAvatar}>🧑 AVATAR</button>
          <button className="map-btn map-btn-out" onClick={onLogout}>⬅ SALIR</button>
        </div>
      </div>

      <div className="mapa-info-bar">
        {hayBloqueadas
          ? <span>🔒 Completa cada zona en orden para desbloquear la siguiente.</span>
          : <span> ¡Todas las zonas desbloqueadas!</span>}
      </div>

      {guiaAbierta && (
        <div className="guia-overlay" role="presentation">
          <section className="guia-dialog" role="dialog" aria-modal="true" aria-labelledby="guia-title">
            <div className="guia-eyebrow">PSEINT RUNNER</div>
            <h2 id="guia-title">Cómo jugar</h2>
            <p className="guia-intro">Antes de iniciar, elige una dificultad y después selecciona una zona del mapa.</p>
            <div className="guia-dificultades">
              <div><b>Fácil</b><span>Preguntas de opción múltiple</span></div>
              <div><b>Intermedio</b><span>Preguntas y ejercicios de código</span></div>
              <div><b>Difícil</b><span>Ejercicios de código en PSeInt</span></div>
            </div>
            <h3>Controles</h3>
            <ul className="guia-controles">
              <li><kbd>←</kbd> <kbd>→</kbd> o <kbd>A</kbd> <kbd>D</kbd><span>Cambiar de carril</span></li>
              <li><kbd>↑</kbd> o <kbd>Espacio</kbd><span>Saltar</span></li>
              <li><kbd>↓</kbd><span>Agacharse</span></li>
              <li><kbd>Esc</kbd><span>Pausar</span></li>
            </ul>
            <div className="guia-actions">
              <button className="guia-skip" onClick={cerrarGuia}>Ya sé jugar · Saltar guía</button>
              <button className="guia-start" onClick={cerrarGuia}>ENTENDIDO, ELEGIR ZONA</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
