import { useStore } from '../store/useStore';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

  const avanzarTour = () => {
    if (tutorialPaso >= pasosTour.length) setTutorialPaso(0);
    else setTutorialPaso((paso) => paso + 1);
  };

  const elegirDificultad = (id) => {
    setDificultad(id);
    setAviso('');
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
  const pasosTour = [
    { targetId: 'guia-dificultad', titulo: 'Elige la dificultad', texto: 'Aquí decides el tipo de reto: Fácil usa preguntas de opción múltiple, Intermedio mezcla preguntas y código, y Difícil se centra en ejercicios de PSeInt.' },
    { targetId: 'guia-zona-principal', titulo: 'Escoge una zona del mapa', texto: `Este pin señala ${ZONAS[primeraZonaDisponible]?.nombre}, tu primera zona disponible. Las zonas se desbloquean al completar las anteriores. Pulsa Siguiente para continuar el recorrido.` },
    { targetId: 'guia-progreso', titulo: 'Consulta tu progreso', texto: 'Aquí ves tu nombre de jugador y cuántas zonas has desbloqueado. Si tienes una partida guardada, aparecerá debajo para que puedas retomarla.' },
    ...(checkpoint ? [{ targetId: 'guia-partida', titulo: 'Retoma tu partida', texto: 'Esta tarjeta conserva tu avance: zona, dificultad y puntaje. Pulsa «Continuar partida» cuando quieras volver a esa carrera.' }] : []),
    { targetId: 'guia-ranking', titulo: 'Revisa el ranking', texto: 'Aquí comparas los puntajes de los jugadores y puedes consultar la clasificación por dificultad.' },
    ...(onPerfil ? [{ targetId: 'guia-perfil', titulo: 'Abre tu perfil', texto: 'En tu perfil puedes cambiar el nombre que aparece en el juego y el ranking, y consultar tus datos personales registrados.' }] : []),
    { targetId: 'guia-avatar', titulo: 'Personaliza tu avatar', texto: 'En esta opción cambias la apariencia de tu personaje, que se muestra durante la carrera.' },
    { targetId: 'guia-como-jugar', titulo: 'Vuelve a esta guía', texto: 'Puedes abrir este recorrido otra vez cuando lo necesites. Durante la carrera, usa ←/→ o A/D para cambiar de carril, ↑ o Espacio para saltar, ↓ para agacharte y Esc para pausar.' },
    { targetId: 'guia-salir', titulo: 'Cierra tu sesión', texto: 'Este botón cierra tu cuenta en este dispositivo. Cuando termines el recorrido, elige una dificultad y luego una zona desbloqueada para jugar.' },
  ];
  const pasoActual = pasosTour[tutorialPaso - 1];
  const esObjetivoTour = (id) => tutorialPaso > 0 && pasoActual?.targetId === id;

  const burbujaTutorial = tutorialPaso > 0 && createPortal(
    <div
      ref={tourHintRef}
      className={`mapa-tour-hint punta-${tourArrow}`}
      style={tourPosition ? { left: `${tourPosition.left}px`, top: `${tourPosition.top}px` } : undefined}
      role="status"
      aria-live="polite"
    >
      <div className="mapa-tour-heading">
        <span className="mapa-tour-label">GUÍA DEL JUGADOR</span>
        <span className="mapa-tour-count">{String(tutorialPaso).padStart(2, '0')} / {String(pasosTour.length).padStart(2, '0')}</span>
      </div>
      <div className="mapa-tour-progress" aria-hidden="true"><span style={{ width: `${(tutorialPaso / pasosTour.length) * 100}%` }} /></div>
      <h3>{pasoActual?.titulo}</h3>
      <p>{pasoActual?.texto}</p>
      <div className="mapa-tour-actions">
        <button type="button" className="mapa-tour-skip" onClick={omitirGuia}>Omitir recorrido</button>
        <button type="button" className="mapa-tour-next" onClick={avanzarTour}>{tutorialPaso === pasosTour.length ? 'Terminar y jugar' : 'Continuar →'}</button>
      </div>
    </div>,
    document.body,
  );

  const hayBloqueadas = ZONAS_ORDEN.some((id) => !estaDesbloqueada(id));

  useLayoutEffect(() => {
    if (!pasoActual) { setTourPosition(null); setTourArrow(''); return undefined; }
    const ubicar = () => {
      const objetivo = document.getElementById(pasoActual.targetId);
      const burbuja = tourHintRef.current;
      if (!objetivo || !burbuja) return;
      const rect = objetivo.getBoundingClientRect();
      const ancho = burbuja.offsetWidth || Math.min(320, window.innerWidth - 24);
      const alto = burbuja.offsetHeight || 170;
      const margen = 12;
      const espacio = 16;
      let left;
      let top;
      let flecha;
      if (window.innerWidth - rect.right >= ancho + espacio + margen) {
        left = rect.right + espacio;
        top = rect.top + rect.height / 2 - alto / 2;
        flecha = 'izquierda';
      } else if (rect.left >= ancho + espacio + margen) {
        left = rect.left - ancho - espacio;
        top = rect.top + rect.height / 2 - alto / 2;
        flecha = 'derecha';
      } else if (window.innerHeight - rect.bottom >= alto + espacio + margen) {
        left = rect.left + rect.width / 2 - ancho / 2;
        top = rect.bottom + espacio;
        flecha = 'arriba';
      } else {
        left = rect.left + rect.width / 2 - ancho / 2;
        top = rect.top - alto - espacio;
        flecha = 'abajo';
      }
      setTourPosition({ left: Math.max(margen, Math.min(left, window.innerWidth - ancho - margen)), top: Math.max(margen, Math.min(top, window.innerHeight - alto - margen)) });
      setTourArrow(flecha);
    };
    document.getElementById(pasoActual.targetId)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    ubicar();
    window.addEventListener('resize', ubicar);
    window.addEventListener('scroll', ubicar, true);
    return () => {
      window.removeEventListener('resize', ubicar);
      window.removeEventListener('scroll', ubicar, true);
    };
  }, [tutorialPaso, pasoActual?.targetId]);

  return (
    <div className="mapa-bg" onClickCapture={(event) => {
      if (tutorialPaso > 0 && !event.target.closest?.('.mapa-tour-hint')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }}>
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
                id={id === primeraZonaDisponible ? 'guia-zona-principal' : undefined}
                className={`mapa-pin${unlocked ? '' : ' bloqueado'}${difElegida && unlocked ? ' paso-activo' : ''}${esObjetivoTour('guia-zona-principal') && id === primeraZonaDisponible ? ' tutorial-target tutorial-inicio' : ''}`}
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
        <div id="guia-progreso" className={`mapa-perfil${esObjetivoTour('guia-progreso') ? ' tutorial-target' : ''}`} aria-label="Tu progreso">
          <div className="mapa-perfil-top"><span className="mapa-perfil-avatar" aria-hidden="true">👤</span><b title={usuario}>{usuario}</b></div>
          <div className="mapa-perfil-prog"><span>Zonas desbloqueadas</span><b>{zonasAbiertas}/{ZONAS_ORDEN.length}</b></div>
          <div className="mapa-perfil-barra" role="progressbar" aria-valuemin={0} aria-valuemax={ZONAS_ORDEN.length} aria-valuenow={zonasAbiertas}><div style={{ width: `${(zonasAbiertas / ZONAS_ORDEN.length) * 100}%` }} /></div>
        </div>
        {checkpoint && (
          <section id="guia-partida" className={`mapa-checkpoint${esObjetivoTour('guia-partida') ? ' tutorial-target' : ''}`} aria-label="Partida guardada disponible">
            <strong>Partida guardada</strong>
            <span>{checkpoint.zone_name || ZONAS[checkpoint.zone_code]?.nombre} · {checkpoint.difficulty_name || checkpoint.difficulty_code}</span>
            <span>Puntaje {checkpoint.score} / 1000</span>
            <button type="button" className="map-btn mapa-btn-continuar" onClick={continuarCheckpoint}>
              ▶ CONTINUAR PARTIDA
            </button>
          </section>
        )}
        {errorCheckpoint && <p className="mapa-checkpoint-error" role="status">No se pudo consultar la partida guardada. Revisa tu conexión e inténtalo de nuevo.</p>}
        <div id="guia-dificultad" ref={panelDifRef} className={`mapa-diff-panel${sacudir ? ' sacudir' : ''}${aviso ? ' con-aviso' : ''}${esObjetivoTour('guia-dificultad') ? ' tutorial-target' : ''}`}>
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
          <button id="guia-como-jugar" className={`map-btn${esObjetivoTour('guia-como-jugar') ? ' tutorial-target' : ''}`} onClick={()=>setGuiaAbierta(true)}>CÓMO JUGAR</button>
          {onPanel && <button className="map-btn" onClick={onPanel}>🧑‍🏫 PANEL</button>}
          <button id="guia-ranking" className={`map-btn${esObjetivoTour('guia-ranking') ? ' tutorial-target' : ''}`} onClick={onRanking}>🏆 RANKING</button>
          {onPerfil && <button id="guia-perfil" className={`map-btn${esObjetivoTour('guia-perfil') ? ' tutorial-target' : ''}`} onClick={onPerfil}>👤 PERFIL</button>}
          <button id="guia-avatar" className={`map-btn${esObjetivoTour('guia-avatar') ? ' tutorial-target' : ''}`} onClick={onAvatar}>🧑 AVATAR</button>
          <button id="guia-salir" className={`map-btn map-btn-out${esObjetivoTour('guia-salir') ? ' tutorial-target' : ''}`} onClick={onLogout}>⬅ SALIR</button>
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
            <h2 id="guia-title">Conoce el mapa</h2>
            <p className="guia-intro">Te mostraré con burbujas dónde elegir dificultad y zona, cómo revisar tu progreso y dónde encontrar Ranking, Perfil y Avatar.</p>
            <div className="guia-tour-preview">
              <span>1 · Preparar la partida</span>
              <span>2 · Explorar el mapa</span>
              <span>3 · Conocer tus opciones de jugador</span>
            </div>
            <p className="guia-tour-note">Pulsa <b>Siguiente</b> en cada burbuja. El recorrido no iniciará una partida y puedes omitirlo cuando quieras.</p>
            <div className="guia-actions">
              <button className="guia-skip" onClick={omitirGuia}>Omitir recorrido</button>
              <button className="guia-start" onClick={iniciarGuiaPasoAPaso}>EMPEZAR RECORRIDO</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
