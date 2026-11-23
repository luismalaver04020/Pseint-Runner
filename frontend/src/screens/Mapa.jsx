import { useStore } from '../store/useStore';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { esDificultadValida, MSG_FALTA_DIFICULTAD, MSG_ELIGE_DIFICULTAD } from '../services/validacionesPartida';
import { ZONAS, ZONAS_ORDEN } from '../game/zonas';
import { obtenerCheckpointDisponible } from '../services/tablasJuegoService';
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

export default function Mapa({ onIniciar, onRanking, onAvatar, onPerfil, onLogout, onPanel }) {
  const { usuario, dificultad, setDificultad, setZona, estaDesbloqueada } = useStore();
  const [guiaAbierta, setGuiaAbierta] = useState(() => sessionStorage.getItem('pseint-runner-guia-v1') !== 'vista');
  const [tutorialPaso, setTutorialPaso] = useState(0);
  // La dificultad vive en el store (null hasta que el jugador elige); no hay valor por defecto.
  const difElegida = esDificultadValida(dificultad);
  const primeraZonaDisponible = ZONAS_ORDEN.find((id) => estaDesbloqueada(id));
  const [aviso, setAviso] = useState('');
  const [sacudir, setSacudir] = useState(false);
  const [checkpoint, setCheckpoint] = useState(null);
  const [errorCheckpoint, setErrorCheckpoint] = useState(false);
  const panelDifRef = useRef(null);
  const pinTutorialRef = useRef(null);
  const tourHintRef = useRef(null);
  const [tourPosition, setTourPosition] = useState(null);
  const [tourArrow, setTourArrow] = useState('');
  useEffect(() => { if (!sacudir) return undefined; const t = setTimeout(() => setSacudir(false), 600); return () => clearTimeout(t); }, [sacudir]);
  useEffect(() => {
    let vigente = true;
    obtenerCheckpointDisponible()
      .then((guardado) => { if (vigente) setCheckpoint(guardado || null); })
      .catch((error) => {
        console.warn('No se pudo revisar si hay una partida guardada', error);
        if (vigente) setErrorCheckpoint(true);
      });
    return () => { vigente = false; };
  }, []);

  const omitirGuia = () => {
    sessionStorage.setItem('pseint-runner-guia-v1', 'vista');
    setGuiaAbierta(false);
    setTutorialPaso(0);
  };

  const iniciarGuiaPasoAPaso = () => {
    sessionStorage.setItem('pseint-runner-guia-v1', 'vista');
    setGuiaAbierta(false);
    setTutorialPaso(1);
  };

  const elegirDificultad = (id) => {
    setDificultad(id);
    setAviso('');
    if (tutorialPaso === 1) setTutorialPaso(2);
  };

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

  const continuarCheckpoint = () => {
    if (!checkpoint || !ZONAS[checkpoint.zone_code] || !esDificultadValida(checkpoint.difficulty_code)) return;
    setZona(checkpoint.zone_code);
    setDificultad(checkpoint.difficulty_code);
    onIniciar();
  };

  const zonasAbiertas = ZONAS_ORDEN.filter((id) => estaDesbloqueada(id)).length;

  const burbujaTutorial = tutorialPaso > 0 && createPortal(
    <div
      ref={tourHintRef}
      className={`mapa-tour-hint ${tutorialPaso === 1 ? 'paso-dificultad' : 'paso-zona'} flecha-${tourArrow}`}
      style={tourPosition ? { left: `${tourPosition.left}px`, top: `${tourPosition.top}px` } : { visibility: 'hidden' }}
      role="status"
      aria-live="polite"
    >
      <strong>{tutorialPaso === 1 ? 'PASO 1 DE 2 · ELIGE LA DIFICULTAD' : 'PASO 2 DE 2 · ELIGE UNA ZONA'}</strong>
      <span>{tutorialPaso === 1
        ? 'Toca Fácil, Intermedio o Difícil. La selección define qué retos aparecerán.'
        : <>Toca <b>{ZONAS[primeraZonaDisponible]?.nombre}</b>, la zona resaltada, para empezar. También puedes elegir otra zona desbloqueada.</>}</span>
      <button type="button" onClick={omitirGuia}>OMITIR TUTORIAL</button>
    </div>,
    document.body,
  );

  useEffect(() => {
    if (!tutorialPaso) { setTourPosition(null); setTourArrow(''); return undefined; }
    const ubicarBurbuja = () => {
      const objetivo = tutorialPaso === 1 ? panelDifRef.current : pinTutorialRef.current;
      const burbuja = tourHintRef.current;
      if (!objetivo || !burbuja) return;
      const r = objetivo.getBoundingClientRect();
      const w = burbuja.offsetWidth;
      const h = burbuja.offsetHeight;
      const margen = 12;
      const espacio = 14;
      let left;
      let top;
      let flecha;
      if (r.left - w - espacio >= margen) {
        left = r.left - w - espacio;
        top = r.top + r.height / 2 - h / 2;
        flecha = 'derecha';
      } else if (window.innerWidth - r.right - espacio >= w + margen) {
        left = r.right + espacio;
        top = r.top + r.height / 2 - h / 2;
        flecha = 'izquierda';
      } else if (window.innerHeight - r.bottom - espacio >= h + margen) {
        left = r.left + r.width / 2 - w / 2;
        top = r.bottom + espacio;
        flecha = 'arriba';
      } else {
        left = r.left + r.width / 2 - w / 2;
        top = r.top - h - espacio;
        flecha = 'abajo';
      }
      left = Math.max(margen, Math.min(left, window.innerWidth - w - margen));
      top = Math.max(margen, Math.min(top, window.innerHeight - h - margen));
      setTourPosition({ left, top });
      setTourArrow(flecha);
    };
    const frame = requestAnimationFrame(ubicarBurbuja);
    window.addEventListener('resize', ubicarBurbuja);
    window.addEventListener('scroll', ubicarBurbuja, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', ubicarBurbuja);
      window.removeEventListener('scroll', ubicarBurbuja, true);
    };
  }, [tutorialPaso, primeraZonaDisponible]);

  const hayBloqueadas = ZONAS_ORDEN.some((id) => !estaDesbloqueada(id));

  return (
    <div className="mapa-bg">
      <div className="mapa-top-bar">
        <span className="mapa-title">🗺️ ELIGE TU ZONA</span>
        <span className="mapa-user">👤 {usuario}</span>
      </div>

      <div className="mapa-stage">
        <div className={`mapa-frame${tutorialPaso === 2 ? ' tutorial-target' : ''}`}>
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
                ref={id === primeraZonaDisponible ? pinTutorialRef : null}
                className={`mapa-pin${unlocked ? '' : ' bloqueado'}${difElegida && unlocked ? ' paso-activo' : ''}${tutorialPaso === 2 && id === primeraZonaDisponible ? ' tutorial-inicio' : ''}`}
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
        {checkpoint && (
          <section className="mapa-checkpoint" aria-label="Partida guardada disponible">
            <strong>Partida guardada</strong>
            <span>{checkpoint.zone_name || ZONAS[checkpoint.zone_code]?.nombre} · {checkpoint.difficulty_name || checkpoint.difficulty_code}</span>
            <span>Puntaje {checkpoint.score} / 1000</span>
            <button type="button" className="map-btn mapa-btn-continuar" onClick={continuarCheckpoint}>
              ▶ CONTINUAR PARTIDA
            </button>
          </section>
        )}
        {errorCheckpoint && <p className="mapa-checkpoint-error" role="status">No se pudo consultar la partida guardada. Revisa tu conexión e inténtalo de nuevo.</p>}
        <div ref={panelDifRef} className={`mapa-diff-panel${sacudir ? ' sacudir' : ''}${aviso ? ' con-aviso' : ''}${tutorialPaso === 1 ? ' tutorial-target' : ''}`}>
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
          {onPerfil && <button className="map-btn" onClick={onPerfil}>👤 PERFIL</button>}
          <button className="map-btn" onClick={onAvatar}>🧑 AVATAR</button>
          <button className="map-btn map-btn-out" onClick={onLogout}>⬅ SALIR</button>
        </div>
      </div>

      <div className="mapa-info-bar">
        {hayBloqueadas
          ? <span>🔒 Completa cada zona en orden para desbloquear la siguiente.</span>
          : <span> ¡Todas las zonas desbloqueadas!</span>}
      </div>

      {burbujaTutorial}

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
              <button className="guia-skip" onClick={omitirGuia}>Omitir tutorial</button>
              <button className="guia-start" onClick={iniciarGuiaPasoAPaso}>SEGUIR CON EL TUTORIAL</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
