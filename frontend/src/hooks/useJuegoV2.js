
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  crearEstadoV2,
  actualizarJuegoV2,
  renderJuegoV2,
  perderVidaV2,
  renderHeartsV2,
} from '../game/bucleJuegoV2';

import { saltar, moverCarril } from '../game/jugador';
import { jugadorScreenPos as jugadorSP } from '../game/dibujoV2';
import {
  configurePSXCanvas,
  PSX_WIDTH,
  PSX_HEIGHT,
} from '../game/psxPostProcess';
import { timeLabel } from '../game/diaNoche';

import { proximoDelay } from '../game/preguntasLogicaV2';

import {
  iniciarPartida,
  iniciarPartidaDemo,
  obtenerSiguientePreguntaMixta,
  obtenerSiguientePreguntaDemo,
} from '../services/partidaService';
import { esDificultadValida } from '../services/validacionesPartida';

import { registrarRespuesta } from '../services/statsService';
import { evaluarCodigoPregunta } from '../services/evaluacionService';
import { ZONAS, DIFICULTAD_CONFIG } from '../game/zonas';

// Posición en pantalla del jugador
function jPos(s) {
  try {
    return jugadorSP(
      s.jugador,
      s.W,
      s.GND,
      s.centerX,
      s.distancia
    );
  } catch {
    return { x: s.centerX, y: s.GND };
  }
}

export function useJuegoV2({
  onVolver,
  zonaId,
  dificultad,
  avatar,
  puntajeInicial = 0,
  vistaLlegada = false,
  modoDemo = false,
} = {}) {

  // ── Referencias ──

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const ctxRef = useRef(null);
  const stateRef = useRef(null);
  const revivalIniciadaRef = useRef(false);
  const preguntaRescateRef = useRef(null);  

  const rafRef = useRef(null);
  const qTimeoutRef = useRef(null);
  const qTimerRef = useRef(null);
  const doneRef = useRef(false);
  const bannerTORef = useRef(null);

  const sessionRef = useRef(null);
  const inicioRef = useRef(0);
  const solicitudRef = useRef(false);

  const dispararRef = useRef(() => {});
  const tryRevivalRef = useRef(() => {});

  // ── Estados ──

  const [hud, setHud] = useState({
    hearts: '❤️❤️❤️',
    score: '0000',
    bar: 0,
    tiempo: '☀️ Día',
    zona: '',
    power: false,
    powerTimer: 0,
  });

  const [alerta, setAlerta] = useState(false);
  const [zonaBanner, setZonaBanner] = useState(null);
  const [pregunta, setPregunta] = useState(null);
  const [qTimerPct, setQTimerPct] = useState(100);
  const [feedback, setFeedback] = useState(null);
  const [evaluandoCodigo, setEvaluandoCodigo] = useState(false);
  const [errorEvaluacion, setErrorEvaluacion] = useState('');
  const evaluacionCodigoRef = useRef(false);
  const evaluacionCodigoIdRef = useRef(0);
  const [finJuego, setFinJuego] = useState(null);
  const [revival, setRevival] = useState(null);
  const [revivalUsed, setRevivalUsed] = useState(false);
  const [pausado, setPausado] = useState(false);

  // ── Limpieza ──

  const limpiar = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (qTimeoutRef.current) {
      clearTimeout(qTimeoutRef.current);
    }

    if (qTimerRef.current) {
      clearInterval(qTimerRef.current);
    }

    if (bannerTORef.current) {
      clearTimeout(bannerTORef.current);
    }

    rafRef.current = null;
    qTimeoutRef.current = null;
    qTimerRef.current = null;
    bannerTORef.current = null;
  }, []);

  const cerrarQ = useCallback(() => {
    setPregunta(null);
    setFeedback(null);

    if (stateRef.current) {
      stateRef.current.questionOpen = false;
    }
  }, []);

  // ── HUD ──

  const actuHUD = useCallback(() => {
    const s = stateRef.current;

    if (!s) return;

    const dc =
      DIFICULTAD_CONFIG[dificultad] ||
      DIFICULTAD_CONFIG.facil;

    const remaining = s.powerupActivo
      ? Math.max(
          0,
          Math.ceil((s.powerupExpira - Date.now()) / 1000)
        )
      : 0;

    setHud({
      hearts: renderHeartsV2(s.lives, dc.lives),
      score: String(Math.floor(s.score)).padStart(4, '0'),
      bar: Math.min(100, (s.score / 1000) * 100),
      tiempo: timeLabel(s.dayTime),
      zona: ZONAS[zonaId]?.nombre || '',
      power: s.powerupActivo,
      powerType: s.powerupTipo,
      powerTimer: remaining,
    });
  }, [dificultad, zonaId]);

  // ── Fin de juego ──

  const terminar = useCallback((tipo) => {
    const s = stateRef.current;

    if (!s || s.ended) return;

    s.ended = true;
    s.speed = 0;

    limpiar();
    cerrarQ();

    const dc =
      DIFICULTAD_CONFIG[dificultad] ||
      DIFICULTAD_CONFIG.facil;

    if (tipo === 'over') {
      setFinJuego({
        tipo: 'over',
        score: Math.floor(s.score),
        corazonesP: dc.lives - s.lives,
      });
    } else {
      setFinJuego({
        tipo: 'win',
        score: Math.floor(s.score),
        hearts: renderHeartsV2(s.lives, dc.lives),
      });
    }
  }, [limpiar, cerrarQ, dificultad]);

  // ── Programar siguiente pregunta ──


const scheduleQ = useCallback((retrasoInicial = false) => {
  if (qTimeoutRef.current) {
    clearTimeout(qTimeoutRef.current);
  }

  const s = stateRef.current;

  if (!s || s.ended || s.finishing) return;

  const tiempo = retrasoInicial
    ? 5000
    : proximoDelay(dificultad);

  qTimeoutRef.current = setTimeout(() => {
    if (
      !stateRef.current ||
      stateRef.current.ended ||
      stateRef.current.questionOpen ||
      stateRef.current.finishing
    ) {
      return;
    }

    dispararRef.current();

  }, tiempo);

}, [dificultad]);

  // ── Abrir pregunta ──

  const abrirQ = useCallback((q) => {
    const s = stateRef.current;

    if (!s || s.ended || s.finishing || s.questionOpen) return;

    const ops = (q.ops || q.options || []).map((o) => ({
      ...o,
      t: o.t ?? o.texto,
      texto: o.texto ?? o.t,
    }));

    s.questionOpen = true;
    doneRef.current = false;

    setPregunta({
      ...q,
      t: q.t || q.prompt || q.enunciado,
      ex: q.ex ?? q.explanation ?? '',
      ops,
      opciones: q.tipo === 'codigo' ? null : [...ops].sort(() => Math.random() - 0.5),
    });

    setFeedback(null);
    setEvaluandoCodigo(false);
    setErrorEvaluacion('');
    evaluacionCodigoRef.current = false;
    evaluacionCodigoIdRef.current++;
    setQTimerPct(100);

    const ms = (q.time || 20) * 1000;
    let elapsed = 0;

    if (qTimerRef.current) {
      clearInterval(qTimerRef.current);
    }

    qTimerRef.current = setInterval(() => {
      elapsed += 100;

      setQTimerPct(
        Math.max(0, 100 - (elapsed / ms) * 100)
      );

      if (elapsed >= ms && !doneRef.current) {
        doneRef.current = true;

        clearInterval(qTimerRef.current);
        qTimerRef.current = null;

        const marcado = {};

        ops.forEach((o) => {
          marcado[o.l] = o.ok ? 'ok' : 'no';
        });

        setFeedback({
          status: 'no',
          texto:
            '⏱ ¡TIEMPO! ' +
            (q.ex ?? q.explanation ?? ''),
          marcado,
        });

        registrarRespuesta(
          q.t || q.prompt || q.enunciado,
          false
        );

        perderVidaV2(stateRef.current);
        actuHUD();

        if (stateRef.current.lives <= 0) {
          tryRevivalRef.current();

          return;
        }

        setTimeout(() => {
          cerrarQ();
          scheduleQ();
        }, 1800);
      }
    }, 100);

  }, [actuHUD, cerrarQ, scheduleQ]);

 
  // ── Solicitar pregunta a Supabase ──

  const disparar = useCallback(async () => {
    const s = stateRef.current;
    const sessionId = sessionRef.current;
    const intento = inicioRef.current;

    if (
      !s ||
      !sessionId ||
      s.ended ||
      s.questionOpen ||
      s.finishing ||
      solicitudRef.current
    ) {
      return;
    }

    solicitudRef.current = true;
    setAlerta(true);

    try {
      const q = modoDemo
        ? obtenerSiguientePreguntaDemo(sessionId)
        : await obtenerSiguientePreguntaMixta(sessionId);

      if (
        intento !== inicioRef.current ||
        !stateRef.current ||
        stateRef.current.ended
      ) {
        return;
      }

      setAlerta(false);
      abrirQ(q);

    } catch (error) {
      console.error(
        'Error obteniendo pregunta de Supabase:',
        error
      );

      setAlerta(false);

      if (intento === inicioRef.current) {
        terminar('over');
      }

    } finally {
      solicitudRef.current = false;
    }

  }, [abrirQ, terminar, modoDemo]);

  useEffect(() => {
    dispararRef.current = disparar;
  }, [disparar]);


  // ── Resolver respuesta ──

  const resolverRespuesta = useCallback((
    ok,
    fb,
    msOk,
    msNo
  ) => {
    if (doneRef.current) return;

    doneRef.current = true;

    if (qTimerRef.current) {
      clearInterval(qTimerRef.current);
      qTimerRef.current = null;
    }

    setQTimerPct(0);

    const s = stateRef.current;

    if (!s) return;

    registrarRespuesta(pregunta.t, ok);
    setFeedback(fb);

    if (ok) {
      if (s.powerupTipo !== 'lento') {
        s.speed = Math.max(
          s.speed - 1.5,
          DIFICULTAD_CONFIG[dificultad]?.speed || 4
        );
      }

      setTimeout(() => {
        cerrarQ();
        scheduleQ();
      }, msOk);

    } else {
      perderVidaV2(s);
      actuHUD();

     if (s.lives <= 0) {
  tryRevivalRef.current();
  return;
}

      setTimeout(() => {
        cerrarQ();
        scheduleQ();
      }, msNo);
    }

  }, [
    pregunta,
    cerrarQ,
    scheduleQ,
    actuHUD,
    dificultad,
  ]);

  // ── Responder opción múltiple ──

  const responder = useCallback((opcion) => {
    if (doneRef.current || !pregunta) return;

    const marcado = {};

    pregunta.opciones.forEach((o) => {
      marcado[o.l] = o.ok ? 'ok' : 'no';
    });

    const fb = opcion.ok
      ? {
          status: 'ok',
          texto: '✓ ¡CORRECTO! ' + pregunta.ex,
          marcado,
        }
      : {
          status: 'no',
          texto: '✗ INCORRECTO — ' + pregunta.ex,
          marcado,
        };

    resolverRespuesta(
      !!opcion.ok,
      fb,
      1400,
      1800
    );

  }, [pregunta, resolverRespuesta]);

  // ── Responder código PSeInt (se conserva) ──

  const responderCodigo = useCallback(async (texto) => {
    if (doneRef.current || !pregunta || evaluacionCodigoRef.current) return;
    const preguntaId = pregunta.question_id ?? pregunta.id;
    const sessionId = sessionRef.current;
    if (!preguntaId || !sessionId) {
      setErrorEvaluacion('No se pudo identificar la pregunta o la partida. Vuelve a intentarlo.');
      return;
    }

    evaluacionCodigoRef.current = true;
    const solicitudId = ++evaluacionCodigoIdRef.current;
    setEvaluandoCodigo(true);
    setErrorEvaluacion('');
    try {
      const resultado = await evaluarCodigoPregunta(preguntaId, sessionId, texto);
      if (doneRef.current || solicitudId !== evaluacionCodigoIdRef.current) return; // La pregunta pudo expirar o cambiar.
      resolverRespuesta(
        !!resultado.correcto,
        { status: resultado.correcto ? 'ok' : 'no', texto: resultado.mensaje || (resultado.correcto ? '¡Correcto!' : 'El algoritmo no cumple el ejercicio.') },
        3200,
        6000,
      );
    } catch (error) {
      if (!doneRef.current && solicitudId === evaluacionCodigoIdRef.current) setErrorEvaluacion(error?.message || 'No se pudo evaluar el código. Inténtalo nuevamente.');
    } finally {
      if (solicitudId === evaluacionCodigoIdRef.current) {
        evaluacionCodigoRef.current = false;
        setEvaluandoCodigo(false);
      }
    }
  }, [pregunta, resolverRespuesta]);

  // ── Revival desde Supabase ──

  const tryRevival = useCallback(async () => {
    if (revivalUsed) {
      terminar('over');
      return;
    }
if (revivalIniciadaRef.current) return;
revivalIniciadaRef.current = true;
    cerrarQ();

if (qTimeoutRef.current) {
  clearTimeout(qTimeoutRef.current);
  qTimeoutRef.current = null;
}

if (qTimerRef.current) {
  clearInterval(qTimerRef.current);
  qTimerRef.current = null;
}

    const sessionId = sessionRef.current;

    if (!sessionId) {
      terminar('over');
      return;
    }

    const intento = inicioRef.current;
console.time('Carga pregunta rescate');
    try {
      const q = await (
  preguntaRescateRef.current ||
  (modoDemo
    ? obtenerSiguientePreguntaDemo(sessionId)
    : obtenerSiguientePreguntaMixta(sessionId))
);
console.timeEnd('Carga pregunta rescate');

preguntaRescateRef.current = null;

if (!q) {
  throw new Error('No se pudo cargar la pregunta de rescate');
}

      if (
        intento !== inicioRef.current ||
        !stateRef.current ||
        stateRef.current.ended
      ) {
        return;
      }

      const ops = (q.ops || q.options || []).map((o) => ({
        ...o,
        t: o.t ?? o.texto,
        texto: o.texto ?? o.t,
      }));

      setRevival({
        tipo: q.tipo === 'codigo' ? 'codigo' : 'opcion',
        question_id: q.question_id ?? q.id,
        texto: q.t || q.prompt || q.enunciado,
        ex: q.ex || q.explanation || '',
        opciones: [...ops].sort(() => Math.random() - 0.5),
      });

    } catch (error) {
      console.error(
        'No se pudo obtener pregunta de rescate:',
        error
      );

      if (intento === inicioRef.current) {
        terminar('over');
      }
    }

 }, [revivalUsed, cerrarQ, terminar, modoDemo]);

  useEffect(() => {
    tryRevivalRef.current = tryRevival;
  }, [tryRevival]);

  // ── Reanudar después del revival ──

const reanudarTrasRevival = useCallback(() => {
    setRevivalUsed(true);

    setTimeout(() => {
      setRevival(null);

      // Permitir que el sistema detecte la siguiente pérdida de vidas.
      revivalIniciadaRef.current = false;

      const revLives = {
        facil: 3,
        intermedio: 2,
        dificil: 1,
      };

      if (!stateRef.current) return;

      stateRef.current.lives =
        revLives[dificultad] || 3;

      stateRef.current.questionOpen = false;
      stateRef.current.ended = false;

      actuHUD();
      scheduleQ();

     

    }, 3200);

 }, [dificultad, actuHUD, scheduleQ]);

  // ── Enviar respuesta de revival ──

  const enviarRevival = useCallback(async (resp) => {
    const reto = revival;

    if (!reto) return;

    if (reto.tipo === 'opcion') {
      if (resp && resp.ok) {
        reanudarTrasRevival();
        return 'ok';
      }

      return 'no';
    }

    const preguntaId = reto.question_id;
    const sessionId = sessionRef.current;
    if (!preguntaId || !sessionId) {
      throw new Error('No se pudo identificar la pregunta o la partida.');
    }

    const resultado = await evaluarCodigoPregunta(preguntaId, sessionId, resp);
    if (resultado.correcto) {
      reanudarTrasRevival();
      return { ok: true, mensaje: resultado.mensaje };
    }

    return {
      ok: false,
      mensaje: resultado.mensaje || '✗ El algoritmo aún no cumple. Corrígelo e inténtalo de nuevo.',
    };

  }, [revival, reanudarTrasRevival]);

  const cancelarRevival = useCallback(() => {
    setRevival(null);
    terminar('over');
  }, [terminar]);

  // ── Banner de zona ──

  const mostrarBanner = useCallback(() => {
    const zCfg = ZONAS[zonaId];

    if (!zCfg) return;

    setZonaBanner(zCfg.nombre);

    if (bannerTORef.current) {
      clearTimeout(bannerTORef.current);
    }

    bannerTORef.current = setTimeout(() => {
      setZonaBanner(null);
    }, 3500);

  }, [zonaId]);

  // ── Power-up ──

  const onPowerup = useCallback(() => {
    actuHUD();
  }, [actuHUD]);

 // ── Loop del juego ──

const loop = useCallback(function juegoFrame() {
  const s = stateRef.current;
  const ctx = ctxRef.current;

  if (!s || !ctx) return;

  if (!s.paused && !s.ended && !s.questionOpen && s.lives > 0) {
    const { hit, finished } = actualizarJuegoV2(s);

    if (hit && !vistaLlegada) {
      perderVidaV2(s);
    }

    actuHUD();

    if (s.lives <= 0 && !s.ended) {
      if (!revivalIniciadaRef.current) {
        tryRevivalRef.current();
      }
    }

    if (finished === 'win' && s.lives > 0) {
      terminar('win');
      return;
    }
  } else if (s.lives <= 0 && !s.ended) {
    if (!revivalIniciadaRef.current) {
      tryRevivalRef.current();
    }
  }

  renderJuegoV2(ctx, s);

  rafRef.current = requestAnimationFrame(juegoFrame);

}, [actuHUD, terminar, vistaLlegada]);

  // ── Iniciar partida ──

 const iniciar = useCallback(async () => {
  const intento = ++inicioRef.current;

  // Sin dificultad válida no se abre partida ni se crea sesión (App devuelve al mapa).
  if (!vistaLlegada && !esDificultadValida(dificultad)) return;

  solicitudRef.current = false;
  sessionRef.current = null;

  revivalIniciadaRef.current = false;
  preguntaRescateRef.current = null;
  doneRef.current = false;
    limpiar();

    setFinJuego(null);
    setRevival(null);
    setRevivalUsed(false);
    setPausado(false);

    cerrarQ();
    setAlerta(false);
    setZonaBanner(null);

    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = PSX_WIDTH;
    canvas.height = PSX_HEIGHT;

    ctxRef.current = canvas.getContext('2d');

    configurePSXCanvas(ctxRef.current);

    const zonaCfg =
      ZONAS[zonaId] || ZONAS.rocosa;

    const difCfg =
      DIFICULTAD_CONFIG[dificultad] ||
      DIFICULTAD_CONFIG.facil;

    stateRef.current = crearEstadoV2(
      PSX_WIDTH,
      PSX_HEIGHT,
      zonaCfg,
      difCfg,
      avatar
    );

    stateRef.current.score = puntajeInicial;
    stateRef.current.vistaLlegada = vistaLlegada;
    stateRef.current.onPowerup = onPowerup;

    actuHUD();
    mostrarBanner();
// Iniciar el movimiento del juego inmediatamente
rafRef.current = requestAnimationFrame(loop);

    // Vista de llegada (solo desarrollo): no abre partida ni pide preguntas.
    if (vistaLlegada) return;

    try {
      const sessionId = modoDemo
        ? iniciarPartidaDemo(zonaId)
        : await iniciarPartida(zonaId, dificultad);

      if (intento !== inicioRef.current) return;

 sessionRef.current = sessionId;

// Precargar pregunta de rescate en segundo plano
preguntaRescateRef.current = (modoDemo
  ? obtenerSiguientePreguntaDemo(sessionId)
  : obtenerSiguientePreguntaMixta(sessionId))
  .catch((error) => {
    console.error('Error precargando pregunta de rescate:', error);
    return null;
  });

dispararRef.current();
    } catch (error) {
      console.error(
        'Error iniciando partida:',
        error
      );

      if (intento === inicioRef.current) {
        terminar('over');
      }
    }

  }, [
    limpiar,
    cerrarQ,
    zonaId,
    dificultad,
    avatar,
    puntajeInicial,
    vistaLlegada,
    actuHUD,
    mostrarBanner,
    loop,
    onPowerup,
    terminar,
    modoDemo,
  ]);

  // ── Volver al mapa ──

  const volver = useCallback(() => {
    inicioRef.current++;

    sessionRef.current = null;
    solicitudRef.current = false;

    limpiar();
    cerrarQ();

    if (onVolver) {
      onVolver();
    }

  }, [limpiar, cerrarQ, onVolver]);

  // ── Pausa ──

  const togglePausa = useCallback(() => {
    const s = stateRef.current;

    if (
      !s ||
      s.ended ||
      s.questionOpen ||
      s.finishing
    ) {
      return;
    }

    s.paused = !s.paused;
    setPausado(s.paused);

  }, []);

  const reanudar = useCallback(() => {
    const s = stateRef.current;

    if (!s) return;

    s.paused = false;
    setPausado(false);

  }, []);

  // ── Teclado ──

  useEffect(() => {
    const kd = (e) => {
      const tag = e.target && e.target.tagName;

      if (tag === 'TEXTAREA' || tag === 'INPUT') {
        if (e.code === 'Escape') {
          e.target.blur();
        }

        return;
      }

      const s = stateRef.current;

      if (!s || s.questionOpen) return;

      if (e.code === 'Escape') {
        togglePausa();
        return;
      }

      if (s.paused) return;

      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();

        if (!s.ended && !s.finishing) {
          const p = jPos(s);

          saltar(
            s.jugador,
            s.H,
            s.parts,
            p.x,
            p.y - 40
          );
        }
      }

      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();

        if (!s.finishing) {
          s.jugador.duck = true;
        }
      }

      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();

        if (!s.ended && !s.finishing) {
          moverCarril(s.jugador, -1);
        }
      }

      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();

        if (!s.ended && !s.finishing) {
          moverCarril(s.jugador, 1);
        }
      }
    };

    const ku = (e) => {
      const s = stateRef.current;

      if (!s) return;

      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        s.jugador.duck = false;
      }
    };

    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };

  }, [volver, togglePausa]);

  // ── Touch ──

  useEffect(() => {
    const wrap = wrapRef.current;

    if (!wrap) return;

    let tx0 = 0;
    let ty0 = 0;

    const ts = (e) => {
      if (e.target.closest?.('.touch-controls')) return;
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
    };

    const te = (e) => {
      if (e.target.closest?.('.touch-controls')) return;
      const s = stateRef.current;

      if (
        !s ||
        s.questionOpen ||
        s.finishing
      ) {
        return;
      }

      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;

      if (
        Math.abs(dx) > 40 &&
        Math.abs(dx) > Math.abs(dy)
      ) {
        if (!s.ended) {
          moverCarril(s.jugador, dx > 0 ? 1 : -1);
        }

      } else if (dy > 35) {
        s.jugador.duck = true;

        setTimeout(() => {
          if (stateRef.current) {
            stateRef.current.jugador.duck = false;
          }
        }, 400);

      } else if (!s.ended) {
        const p = jPos(s);

        saltar(
          s.jugador,
          s.H,
          s.parts,
          p.x,
          p.y - 40
        );
      }
    };

    wrap.addEventListener('touchstart', ts, {
      passive: true,
    });

    wrap.addEventListener('touchend', te, {
      passive: true,
    });

    return () => {
      wrap.removeEventListener('touchstart', ts);
      wrap.removeEventListener('touchend', te);
    };

  }, []);

  // ── Controles táctiles / botones en pantalla ──
  const saltarJugador = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.paused || s.ended || s.questionOpen || s.finishing) return;
    const p = jPos(s);
    saltar(s.jugador, s.H, s.parts, p.x, p.y - 40);
  }, []);

  const moverCarrilJugador = useCallback((direccion) => {
    const s = stateRef.current;
    if (!s || s.paused || s.ended || s.questionOpen || s.finishing) return;
    moverCarril(s.jugador, direccion < 0 ? -1 : 1);
  }, []);

  const agacharJugador = useCallback((activo) => {
    const s = stateRef.current;
    if (!s || s.paused || s.ended || s.questionOpen || s.finishing) return;
    s.jugador.duck = activo;
  }, []);

  // ── Inicio y limpieza del componente ──

  useEffect(() => {
    iniciar();

    return () => {
      inicioRef.current++;
      evaluacionCodigoIdRef.current++;

      sessionRef.current = null;
      solicitudRef.current = false;

      limpiar();
    };

  }, []);

  // ── Valores que utiliza JuegoV2.jsx ──

  return {
    canvasRef,
    wrapRef,
    hud,
    alerta,
    zonaBanner,
    pregunta,
    qTimerPct,
    feedback,
    evaluandoCodigo,
    errorEvaluacion,
    responder,
    responderCodigo,
    finJuego,
    revival,
    enviarRevival,
    cancelarRevival,
    reintentar: iniciar,
    volver,
    pausado,
    togglePausa,
    reanudar,
    saltarJugador,
    moverCarrilJugador,
    agacharJugador,
  };
}
