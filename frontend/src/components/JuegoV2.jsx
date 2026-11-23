import { useStore } from '../store/useStore';
import { useJuegoV2 } from '../hooks/useJuegoV2';
import { registrarPartida } from '../services/statsService';
import { cargarApoyoTema, enviarFeedbackPartida, listarMotivosSalida } from '../services/tablasJuegoService';
import { ZONAS, ZONAS_ORDEN, DIFICULTAD_CONFIG } from '../game/zonas';
import { useEffect, useState } from 'react';
import '../styles/juegov2.css';

// ── Revival Modal ──
function RevivalModal({ reto, onEnviar, onRendirse }) {
  const [code, setCode] = useState('');
  const [fb,   setFb]   = useState(null);
  const [error, setError] = useState('');
  const [evaluando, setEvaluando] = useState(false);
  const esOpcion = reto.tipo === 'opcion';

  const submit = async () => {
    if (evaluando || fb) return;
    setEvaluando(true);
    setError('');
    try {
      const r = await onEnviar(code);
      if (r === 'ok' || r?.ok) {
        setFb({ ok:true, msg:'¡Correcto! Reviviste con ½❤️.' });
      }
      else {
        setFb({ ok:false, msg:r?.mensaje || 'El código no cumple con lo pedido. Perdiste la última oportunidad.' });
        setTimeout(onRendirse, 2500);
      }
    } catch (e) {
      setError(e?.message || 'No se pudo evaluar el código. Inténtalo nuevamente.');
    } finally {
      setEvaluando(false);
    }
  };
  const elegir = async (o) => {
    if (fb || evaluando) return;
    const r = await onEnviar(o);
    if (r === 'ok' || r?.ok) setFb({ ok:true, msg:'✓ ¡Correcto! Reviviste con ½❤️', marcado:{ [o.l]:'ok' } });
    else {
      const marcado = {}; reto.opciones.forEach(x => { marcado[x.l] = x.ok ? 'ok' : (x === o ? 'no' : ''); });
      setFb({ ok:false, msg:'✗ Incorrecto. ' + reto.ex, marcado });
      setTimeout(onRendirse, 2500);
    }
  };

  return (
    <div className="overlay">
      <div className="revival-box">
        <div className="revival-title">💀 ¡ÚLTIMA OPORTUNIDAD!</div>
        <div className="revival-sub">Responde correctamente para revivir<br/>(Solo una vez por partida)</div>
        <div className="revival-reto">{reto.texto}</div>
        {esOpcion ? (
          <>
            <div className="q-opts">
              {reto.opciones.map((o,i) => (
                <button key={i} className={`qo ${fb?.marcado?.[o.l]||''}`} disabled={!!fb || evaluando} onClick={()=>elegir(o)}><strong>{o.l}.</strong> {o.texto || o.t || o.option_text || ''}</button>
              ))}
            </div>
            {fb && <div className={`q-fb ${fb.ok?'ok':'no'}`} style={{ whiteSpace:'pre-wrap' }}>{fb.msg}</div>}
            {!fb && <div className="revival-btns" style={{marginTop:14}}><button className="btn btn-r" onClick={onRendirse}>✖ RENDIRSE</button></div>}
          </>
        ) : (
          <>
            <textarea className="revival-ta" value={code} onChange={e=>setCode(e.target.value)}
              placeholder="Escribe tu pseudocódigo PSeInt aquí..." rows={5} disabled={evaluando || !!fb} />
            {error && <div className="q-fb error" role="alert">{error}</div>}
            {fb && <div className={`q-fb ${fb.ok?'ok':'no'}`} style={{ whiteSpace:'pre-wrap' }}>{fb.msg}</div>}
            <div className="revival-btns">
              <button className="btn btn-y" onClick={submit} disabled={evaluando || !!fb}>{evaluando ? '⏳ EVALUANDO...' : '✔ ENVIAR'}</button>
              <button className="btn btn-r" onClick={onRendirse} disabled={evaluando || fb?.ok}>✖ RENDIRSE</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Pregunta Modal ──
function PreguntaModal({
  pregunta,
  qTimerPct,
  feedback,
  evaluandoCodigo = false,
  errorEvaluacion = '',
  onResponder,
  onResponderCodigo
}) {
  const [codigo, setCodigo] = useState('');
  const [materiales, setMateriales] = useState([]);
  const [prerrequisitos, setPrerrequisitos] = useState([]);
  useEffect(() => {
    const topicId = pregunta.topic_id ?? pregunta.topicId;
    if (!topicId) { setMateriales([]); setPrerrequisitos([]); return; }
    let vigente = true;
    cargarApoyoTema(topicId)
      .then((apoyo) => {
        if (!vigente) return;
        setMateriales(Array.isArray(apoyo?.materiales) ? apoyo.materiales : []);
        setPrerrequisitos(Array.isArray(apoyo?.prerrequisitos?.pendientes) ? apoyo.prerrequisitos.pendientes : []);
      })
      .catch((error) => console.warn('No se pudo cargar el apoyo del tema', error));
    return () => { vigente = false; };
  }, [pregunta.topic_id, pregunta.topicId]);

  const esCodigo = pregunta.tipo === 'codigo';

  // Compatible con preguntas de Supabase y preguntas anteriores
  const textoPregunta =
    pregunta.t || pregunta.q || pregunta.prompt || pregunta.enunciado || '';

  const opciones = pregunta.opciones || [];

  const renderDetalleCodigo = () => {
    if (feedback?.status !== 'no') return null;
    const fallidosVisibles = (feedback.casos || []).filter((caso) => caso.visible && !caso.paso);
    if (!fallidosVisibles.length) {
      return <p className="q-fb-hint">Revisa también las estructuras que pide el enunciado. Las pruebas ocultas no se muestran.</p>;
    }
    const mostrarLista = (valor) => {
      if (!Array.isArray(valor)) return String(valor ?? 'sin salida');
      return valor.length ? valor.join(' | ') : 'sin salida';
    };
    return (
      <div className="q-code-cases" aria-label="Detalle de pruebas visibles">
        <h3>Revisa estas pruebas</h3>
        {fallidosVisibles.map((caso) => (
          <section className="q-code-case" key={caso.id}>
            <b>Prueba {caso.id}</b>
            <div><span>Entrada:</span> <code>{mostrarLista(caso.entradas)}</code></div>
            {caso.error
              ? <div><span>Error:</span> <code>{caso.error}</code></div>
              : <>
                  <div><span>Se esperaba:</span> <code>{mostrarLista(caso.esperado)}</code></div>
                  <div><span>Tu programa mostró:</span> <code>{mostrarLista(caso.obtenido)}</code></div>
                </>}
          </section>
        ))}
        <p className="q-fb-hint">Solo se muestran las pruebas públicas; las pruebas ocultas siguen protegidas.</p>
      </div>
    );
  };

  return (
    <div className="overlay">
      <div className={`q-box${esCodigo ? ' q-box-code' : ''}`}>

        <div className="q-badge">
          {esCodigo ? '💻 RETO DE CÓDIGO' : '⚡ PREGUNTA SORPRESA'}
        </div>

        <div className="q-timer-wrap">
          <div
            className="q-timer"
            style={{ width: `${qTimerPct}%` }}
          />
        </div>

        {pregunta.code && (
          <div
            className="q-code"
            dangerouslySetInnerHTML={{ __html: pregunta.code }}
          />
        )}

        {(materiales.length > 0 || prerrequisitos.length > 0) && (
          <details className="q-topic-support">
            <summary>Material de apoyo del tema</summary>
            {prerrequisitos.length > 0 && (
              <p>Para dominar este tema, repasa primero: {prerrequisitos.map((item) => item.tema).join(', ')}.</p>
            )}
            {materiales.map((item) => (
              <article key={item.id}>
                <strong>{item.titulo}</strong>
                <p>{item.contenido}</p>
              </article>
            ))}
          </details>
        )}

        {esCodigo ? (
          !feedback ? (
            <>
              <div className="q-text q-prompt">
                {pregunta.enunciado || textoPregunta}
              </div>

              <textarea
                className="q-code-ta"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Escribe tu pseudocódigo PSeInt aquí..."
                rows={7}
                autoFocus
              />

              {errorEvaluacion && <div className="q-fb error" role="alert">{errorEvaluacion}</div>}
              <button
                className="btn btn-y q-code-submit"
                onClick={() => onResponderCodigo(codigo)}
                disabled={evaluandoCodigo}
              >
                {evaluandoCodigo ? '⏳ EVALUANDO...' : '✔ ENVIAR CÓDIGO'}
              </button>
            </>
          ) : (
            <>
              <div
                className={`q-fb ${feedback.status}`}
                style={{ whiteSpace: 'pre-wrap' }}
                role="status"
                aria-live="polite"
              >
                {feedback.texto}
              </div>
              {renderDetalleCodigo()}
            </>
          )
        ) : (
          <>
            <div className="q-text q-prompt">
              {textoPregunta}
            </div>

            {!feedback ? (
              <div className="q-opts">
                {opciones.map((o, i) => (
                  <button
                    key={i}
                    className="qo"
                    onClick={() => onResponder(o)}
                  >
                    {o.texto || o.t || o.l}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="q-opts">
                  {opciones.map((o, i) => (
                    <button
                      key={i}
                      className={`qo ${feedback.marcado[o.l] || ''}`}
                      disabled
                    >
                      {o.texto || o.t || o.l}
                    </button>
                  ))}
                </div>

                <div className={`q-fb ${feedback.status}`}>
                  {feedback.texto}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ── Fin Juego ──
function FeedbackPartida({ sessionId }) {
  const [motivos, setMotivos] = useState([]);
  const [motivo, setMotivo] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  useEffect(() => {
    if (!sessionId || String(sessionId).startsWith('demo-')) return;
    listarMotivosSalida()
      .then((items) => setMotivos(Array.isArray(items) ? items : []))
      .catch((error) => console.warn('No se pudieron cargar los motivos de salida', error));
  }, [sessionId]);
  if (!sessionId || String(sessionId).startsWith('demo-')) return null;
  const enviar = async () => {
    if (!motivo || enviando || enviado) return;
    setEnviando(true);
    try {
      await enviarFeedbackPartida(sessionId, motivo, comentario);
      setEnviado(true);
    } catch (error) {
      console.warn('No se pudo guardar el comentario de la partida', error);
    } finally {
      setEnviando(false);
    }
  };
  return (
    <details className="fin-feedback">
      <summary>{enviado ? 'Gracias por tus comentarios' : '¿Cómo estuvo esta partida? (opcional)'}</summary>
      {!enviado && <>
        <select value={motivo} onChange={(event) => setMotivo(event.target.value)} aria-label="Motivo de comentarios">
          <option value="">Elige un motivo</option>
          {motivos.map((item) => <option key={item.codigo} value={item.codigo}>{item.motivo}</option>)}
        </select>
        <textarea value={comentario} onChange={(event) => setComentario(event.target.value)} maxLength={1000}
          placeholder="Comentario opcional" aria-label="Comentario sobre la partida" />
        <button type="button" className="btn btn-b" onClick={enviar} disabled={!motivo || enviando}>
          {enviando ? 'ENVIANDO…' : 'ENVIAR COMENTARIO'}
        </button>
      </>}
    </details>
  );
}

function FinJuego({ fin, dificultad, zonaId, onReintentar, onMapa, onRanking, onSiguienteNivel, vistaLlegada }) {
  const { unlockZona } = useStore();
  const win = fin.tipo === 'win';
  const zonaIdx = ZONAS_ORDEN.indexOf(zonaId) + 1;
  const esUltima = zonaId === ZONAS_ORDEN[ZONAS_ORDEN.length - 1];
  const siguienteZona = esUltima ? null : ZONAS[ZONAS_ORDEN[zonaIdx]];
  const irSiguiente = win && !esUltima && !vistaLlegada && !!onSiguienteNivel;

  useEffect(() => {
    if (vistaLlegada) return;
    registrarPartida({ zona: zonaId, dificultad, puntaje: fin.score, resultado: win ? 'ganó' : 'perdió' });
    if (win) unlockZona(zonaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`overlay${win ? ' victory-overlay' : ''}`}>
      <div className={`fin-box${win ? ' victory-modal' : ''}`}>
        <div className="fin-stars">{win ? (esUltima ? '🏆 ✨ 🏆' : '🏁 ✨ 🏁') : '💀'}</div>
        <div className={`fin-title ${win?'win':'lose'}`}>{win ? '¡FELICIDADES!' : 'GAME OVER'}</div>
        {win && <div className="fin-message">{esUltima
          ? 'Superaste todos los niveles. ¡Completaste la aventura!'
          : `Pasaste a la siguiente zona: ${siguienteZona?.nombre || 'siguiente nivel'}.`}</div>}
        <div className="fin-stats">
          Zona: <b>{ZONAS[zonaId]?.nombre}</b><br/>
          Dificultad: <b>{DIFICULTAD_CONFIG[dificultad]?.label}</b><br/>
          Puntaje: <b>{fin.score}</b> / 1000
          {win && <><br/>Corazones: <b>{fin.hearts}</b></>}
          {win && !esUltima && <><br/><span style={{color:'#9de5b2'}}>🔓 Zona desbloqueada</span></>}
        </div>
        <FeedbackPartida sessionId={fin.sessionId} />
        <div className="fin-btns">
          {win ? (
            <button className="btn btn-g" onClick={irSiguiente ? () => onSiguienteNivel(siguienteZona.id) : onMapa}>
              {irSiguiente ? 'SIGUIENTE NIVEL' : 'CONTINUAR'}
            </button>
          ) : <button className="btn btn-g" onClick={onReintentar}>↺ REINTENTAR</button>}
          {!win && <button className="btn btn-b" onClick={onMapa}>🗺️ MAPA</button>}
          <button className="btn btn-b" onClick={onRanking}>🏆 RANKING</button>
        </div>
      </div>
    </div>
  );
}

// ── Pausa ──
function PausaModal({ onReanudar, onMapa, onSalir, musicaActiva, onAlternarMusica }) {
  return (
    <div className="overlay">
      <div className="pausa-box">
        <div className="pausa-title">⏸ PAUSA</div>
        <div className="pausa-btns">
          <button className="btn btn-g" onClick={onReanudar}>▶ CONTINUAR</button>
          <button className="btn btn-b" onClick={onAlternarMusica}>{musicaActiva ? '♫ APAGAR MÚSICA' : '♫ ENCENDER MÚSICA'}</button>
          <button className="btn btn-b" onClick={onMapa}>🗺️ MAPA</button>
          <button className="btn btn-r" onClick={onSalir}>✖ SALIR</button>
        </div>
        <div className="pausa-hint">[ ESC = continuar ]</div>
      </div>
    </div>
  );
}

export default function JuegoV2({ onMapa, onRanking, onSiguienteNivel, puntajeInicial = 0, vistaLlegada = false, musicaActiva = true, onAlternarMusica = () => {} }) {
  const { avatar, dificultad, zona, usuario } = useStore();
  const modoDemo = usuario === 'demo';
  const {
    canvasRef, wrapRef, hud, alerta, zonaBanner,
    pregunta, qTimerPct, feedback, responder, responderCodigo, evaluandoCodigo, errorEvaluacion,
    finJuego, revival, enviarRevival, cancelarRevival,
    reintentar, volver, pausado, togglePausa, reanudar,
    saltarJugador, moverCarrilJugador, agacharJugador,
  } = useJuegoV2({ onVolver: onMapa, zonaId: zona || 'rocosa', dificultad, avatar, puntajeInicial, vistaLlegada, modoDemo });

  return (
    <div className="game-screen">
      <div className="game-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="game-canvas" />

        {/* HUD */}
        <div className="hud">
          <span className="hud-hearts">{hud.hearts}</span>
          <div className="hud-bar-wrap"><div className="hud-bar" style={{width:`${hud.bar}%`}} /></div>
          <span className="hud-score">{hud.score}</span>
          {hud.power && <span className={`hud-power ${hud.powerType === 'lento' ? 'slow' : ''}`}>{hud.powerType === 'lento' ? '❄ ITEM · LENTO' : '⚡ x2'} {hud.powerTimer}s</span>}
          {vistaLlegada && <span className="hud-preview-label">VISTA DE LLEGADA</span>}
          <span className="hud-zone">{DIFICULTAD_CONFIG[dificultad]?.label?.split(' ')[0]} {hud.zona}</span>
          <button className="hud-music-btn" onClick={onAlternarMusica} aria-label={musicaActiva ? 'Apagar música' : 'Encender música'} aria-pressed={musicaActiva} title={musicaActiva ? 'Apagar música' : 'Encender música'}>{musicaActiva ? '♫' : '♪̸'}</button>
          <button className="hud-pause-btn" onClick={togglePausa} aria-label="Pausa">⏸</button>
        </div>

        {/* Banners */}
        {zonaBanner && <div className="zona-banner">{zonaBanner}</div>}
        {alerta && <div className="q-alert">⚡ ¡PREGUNTA!</div>}
        {hud.power && <div className={`power-banner ${hud.powerType === 'lento' ? 'slow' : ''}`}>{hud.powerType === 'lento' ? '❄ ITEM RECOGIDO · VELOCIDAD REDUCIDA' : '⚡ PUNTAJE DOBLE'}</div>}

        {/* Pregunta */}
        {pregunta && (
          <PreguntaModal pregunta={pregunta} qTimerPct={qTimerPct} feedback={feedback} evaluandoCodigo={evaluandoCodigo} errorEvaluacion={errorEvaluacion} onResponder={responder} onResponderCodigo={responderCodigo} />
        )}

        {/* Revival */}
        {revival && (
          <RevivalModal reto={revival} onEnviar={enviarRevival} onRendirse={cancelarRevival} />
        )}

        {/* Pausa */}
        {pausado && !finJuego && (
          <PausaModal onReanudar={reanudar} onMapa={onMapa} onSalir={volver} musicaActiva={musicaActiva} onAlternarMusica={onAlternarMusica} />
        )}

        {/* Fin de juego */}
        {finJuego && (
          <FinJuego fin={finJuego} dificultad={dificultad} zonaId={zona||'rocosa'} vistaLlegada={vistaLlegada}
            onReintentar={reintentar} onMapa={onMapa} onRanking={onRanking} onSiguienteNivel={onSiguienteNivel} />
        )}

        <div className="ctrl-hint">[ ←/→ CARRIL ] [ ↑/ESPACIO SALTAR ] [ ↓ AGACHARSE ] [ ESC PAUSA ]</div>
        <div className="touch-controls" aria-label="Controles táctiles">
          <button type="button" className="touch-btn touch-lane" aria-label="Cambiar al carril izquierdo" onPointerDown={(e) => { e.preventDefault(); moverCarrilJugador(-1); }}>◀<span>CARRIL</span></button>
          <button type="button" className="touch-btn touch-lane" aria-label="Cambiar al carril derecho" onPointerDown={(e) => { e.preventDefault(); moverCarrilJugador(1); }}>▶<span>CARRIL</span></button>
          <button type="button" className="touch-btn touch-action" aria-label="Saltar" onPointerDown={(e) => { e.preventDefault(); saltarJugador(); }}>↑<span>SALTAR</span></button>
          <button type="button" className="touch-btn touch-action" aria-label="Agacharse" onPointerDown={(e) => { e.preventDefault(); agacharJugador(true); }} onPointerUp={() => agacharJugador(false)} onPointerCancel={() => agacharJugador(false)} onLostPointerCapture={() => agacharJugador(false)}>↓<span>AGACHARSE</span></button>
        </div>
      </div>
    </div>
  );
}
