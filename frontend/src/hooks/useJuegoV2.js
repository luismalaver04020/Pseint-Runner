
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
  obtenerSiguientePreguntaRescate,
  obtenerSiguientePreguntaDemo,
} from '../services/partidaService';
import { esDificultadValida } from '../services/validacionesPartida';

import { registrarRespuesta } from '../services/statsService';
import { descartarCheckpointJuego, guardarCheckpointJuego, registrarEventoJuego, registrarIntentoJuego } from '../services/tablasJuegoService';
import { evaluarCodigoPregunta } from '../services/evaluacionService';
import { ZONAS, DIFICULTAD_CONFIG } from '../game/zonas';

function opcionesDePregunta(pregunta) {
  const opciones = pregunta.ops || pregunta.options || pregunta.opciones || [];
  return opciones.map((opcion, indice) => ({
    ...opcion,
    l: opcion.l ?? opcion.option_key ?? opcion.key ?? String.fromCharCode(65 + indice),
    ok: opcion.ok ?? opcion.is_correct ?? opcion.correct ?? false,
    t: opcion.t ?? opcion.texto ?? opcion.option_text ?? '',
    texto: opcion.texto ?? opcion.t ?? opcion.option_text ?? '',
  }));
}

function esPreguntaDeCodigo(pregunta, opciones = opcionesDePregunta(pregunta)) {
  const tipo = String(pregunta.tipo ?? pregunta.question_type ?? pregunta.type ?? '')
    .trim()
    .toLowerCase();
  return ['codigo', 'code', 'pseudocode', 'pseudocodigo'].includes(tipo) || opciones.length === 0;
}

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

function canvasSizeForElement(element) {
  const rect = element?.getBoundingClientRect();
  if (!rect?.width || !rect?.height) return { width: PSX_WIDTH, height: PSX_HEIGHT };

  // Keep the original pixel density while adapting the game world to the
  // screen ratio, including tall portrait phones.
  const pixelScale = Math.min(rect.width / PSX_WIDTH, rect.height / PSX_HEIGHT);
  return {
    width: Math.max(1, Math.round(rect.width / pixelScale)),
    height: Math.max(1, Math.round(rect.height / pixelScale)),
  };
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
  const revivalUsedRef = useRef(false);
  const impactoPendienteRef = useRef(false);
  const preguntaRescateRef = useRef(null);  

  const rafRef = useRef(null);
  const qTimeoutRef = useRef(null);
  const qTimeoutDueRef = useRef(0);
  const qTimeoutRemainingRef = useRef(null);
  const preguntaPendienteRef = useRef(null);
  const qTimerRef = useRef(null);
  const doneRef = useRef(false);
  const bannerTORef = useRef(null);

  const sessionRef = useRef(null);
  const checkpointSavingRef = useRef(false);
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
  const [pausado, setPausado] = useState(false);

  // Guarda cada 10 s y también al ocultar/cerrar la pestaña. El guardado
  // periódico es lo que protege el avance si el cierre ocurre sin conexión.
  useEffect(() => {
    if (modoDemo || typeof window === 'undefined') return undefined;
    const guardar = (keepalive = false) => {
      const s = stateRef.current;
      const sessionId = sessionRef.current;
      if (!s || !sessionId || s.ended || s.finishing || s.lives <= 0 || checkpointSavingRef.current) return;
      checkpointSavingRef.current = true;
      guardarCheckpointJuego({
        sessionId,
        score: s.score,
        lives: s.lives,
        lane: s.jugador.lane,
        speed: s.speed,
        distancia: s.distancia,
        dayTime: s.dayTime,
        keepalive,
      }).catch((error) => {
        if (window.navigator.onLine) console.warn('No se pudo guardar el checkpoint; se reintentará', error);
      }).finally(() => { checkpointSavingRef.current = false; });
    };
    const alCambiarVisibilidad = () => { if (document.visibilityState === 'hidden') guardar(); };
    const alVolverInternet = () => guardar();
    const timer = window.setInterval(guardar, 10000);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    const alCerrarPagina = () => guardar(true);
    window.addEventListener('pagehide', alCerrarPagina);
    window.addEventListener('online', alVolverInternet);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('pagehide', alCerrarPagina);
      window.removeEventListener('online', alVolverInternet);
    };
  }, [modoDemo]);

  // ── Limpieza ──

  const limpiar = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (qTimeoutRef.current) {
      clearTimeout(qTimeoutRef.current);
    }
    qTimeoutDueRef.current = 0;
    qTimeoutRemainingRef.current = null;
    preguntaPendienteRef.current = null;

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
      hearts: renderHeartsV2(s.lives, s.maxLives ?? dc.lives),
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
    registrarEventoJuego(tipo === 'win' ? 'partida_completada' : 'partida_perdida', {
      session_id: sessionRef.current,
      puntaje: Math.floor(s.score),
    }).catch((error) => console.warn('No se pudo guardar el evento de cierre', error));
    if (sessionRef.current && !modoDemo) {
      descartarCheckpointJuego(sessionRef.current)
        .catch((error) => console.warn('No se pudo cerrar el checkpoint de la partida', error));
    }

    const dc =
      DIFICULTAD_CONFIG[dificultad] ||
      DIFICULTAD_CONFIG.facil;

    if (tipo === 'over') {
      setFinJuego({
        tipo: 'over',
        score: Math.floor(s.score),
        corazonesP: (s.maxLives ?? dc.lives) - s.lives,
        sessionId: sessionRef.current,
      });
    } else {
      setFinJuego({
        tipo: 'win',
        score: Math.floor(s.score),
        hearts: renderHeartsV2(s.lives, s.maxLives ?? dc.lives),
        sessionId: sessionRef.current,
      });
    }
  }, [limpiar, cerrarQ, dificultad, modoDemo]);

  // ── Programar siguiente pregunta ──


const scheduleQ = useCallback((primera = false, retrasoRestante = null) => {
  if (qTimeoutRef.current) {
    clearTimeout(qTimeoutRef.current);
    qTimeoutRef.current = null;
    qTimeoutDueRef.current = 0;
  }

  const s = stateRef.current;

  if (!s || s.ended || s.finishing) return;

  const tiempo = retrasoRestante ?? proximoDelay(dificultad, primera);
  qTimeoutRemainingRef.current = tiempo;

  // No consume el intervalo mientras el jugador tiene el juego pausado.
  if (s.paused) return;

  qTimeoutDueRef.current = Date.now() + tiempo;

  qTimeoutRef.current = setTimeout(() => {
    qTimeoutRef.current = null;
    qTimeoutDueRef.current = 0;
    const actual = stateRef.current;
    if (!actual || actual.ended || actual.questionOpen || actual.finishing) {
      qTimeoutRemainingRef.current = null;
      return;
    }
    if (actual.paused) {
      // Protege el caso límite en que el timeout vence justo al pausar.
      qTimeoutRemainingRef.current = 1000;
      return;
    }

    qTimeoutRemainingRef.current = null;

    dispararRef.current();

  }, tiempo);

}, [dificultad]);

  // ── Abrir pregunta ──

  const abrirQ = useCallback((q) => {
    const s = stateRef.current;

    if (!s || s.ended || s.finishing || s.questionOpen) return;

    const ops = opcionesDePregunta(q);
    const tipo = esPreguntaDeCodigo(q, ops) ? 'codigo' : 'opcion';

    s.questionOpen = true;
    doneRef.current = false;

    setPregunta({
      ...q,
      tipo,
      t: q.t || q.prompt || q.enunciado,
      ex: q.ex ?? q.explanation ?? '',
      ops,
      opciones: tipo === 'codigo' ? null : [...ops].sort(() => Math.random() - 0.5),
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
        if (!esPreguntaDeCodigo(q, opcionesDePregunta(q))) {
          registrarIntentoJuego({
            sessionId: sessionRef.current,
            questionId: q.question_id ?? q.id,
            correcto: false,
          }).catch((error) => console.warn('No se pudo guardar el intento', error));
        }

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
      s.paused ||
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
      if (stateRef.current.paused) {
        preguntaPendienteRef.current = q;
        return;
      }
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
    msNo,
    respuesta = {},
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
    if (!respuesta.texto) {
      registrarIntentoJuego({
        sessionId: sessionRef.current,
        questionId: pregunta.question_id ?? pregunta.id,
        correcto: ok,
        opcionId: respuesta.opcionId ?? null,
        opcionKey: respuesta.opcionKey ?? null,
      }).catch((error) => console.warn('No se pudo guardar el intento', error));
    }
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
      1800,
      { opcionId: opcion.option_id ?? opcion.id ?? null, opcionKey: opcion.l ?? opcion.key ?? null },
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
        {
          status: resultado.correcto ? 'ok' : 'no',
          texto: resultado.mensaje || (resultado.correcto ? '¡Correcto!' : 'El algoritmo no cumple el ejercicio.'),
          casos: Array.isArray(resultado.casos) ? resultado.casos : [],
        },
        3200,
        9000,
        { texto },
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
    if (revivalUsedRef.current) {
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
    : obtenerSiguientePreguntaRescate(sessionId))
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

      const ops = opcionesDePregunta(q);
      const tipo = esPreguntaDeCodigo(q, ops) ? 'codigo' : 'opcion';

      setRevival({
        tipo,
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

 }, [cerrarQ, terminar, modoDemo]);

  useEffect(() => {
    tryRevivalRef.current = tryRevival;
  }, [tryRevival]);

  // ── Reanudar después del revival ──

const reanudarTrasRevival = useCallback(() => {
    revivalUsedRef.current = true;

    setTimeout(() => {
      setRevival(null);

      // Permitir que el sistema detecte la siguiente pérdida de vidas.
      revivalIniciadaRef.current = false;

      if (!stateRef.current) return;

      stateRef.current.lives = stateRef.current.maxLives || 3;

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
  const sesionLista = vistaLlegada || Boolean(sessionRef.current);

  if (!s || !ctx) return;

  if (!s.paused && !s.ended && !s.questionOpen && s.lives > 0) {
    const { hit, finished } = actualizarJuegoV2(s);

    // Conservar el primer choque ocurrido mientras se crea la sesión.
    if (impactoPendienteRef.current && sesionLista) {
      impactoPendienteRef.current = false;
      if (!vistaLlegada) perderVidaV2(s);
    } else if (hit && !vistaLlegada) {
      if (sesionLista) perderVidaV2(s);
      else impactoPendienteRef.current = true;
    }

    actuHUD();

    if (s.lives <= 0 && !s.ended && sesionLista) {
      if (!revivalIniciadaRef.current) {
        tryRevivalRef.current();
      }
    }

    if (finished === 'win' && s.lives > 0) {
      terminar('win');
      return;
    }
  } else if (s.lives <= 0 && !s.ended && sesionLista) {
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
  impactoPendienteRef.current = false;

  revivalIniciadaRef.current = false;
  revivalUsedRef.current = false;
  preguntaRescateRef.current = null;
  preguntaPendienteRef.current = null;
  qTimeoutRemainingRef.current = null;
  qTimeoutDueRef.current = 0;
  doneRef.current = false;
    limpiar();

    setFinJuego(null);
    setRevival(null);
    setPausado(false);

    cerrarQ();
    setAlerta(false);
    setZonaBanner(null);

    const canvas = canvasRef.current;

    if (!canvas) return;

    const canvasSize = canvasSizeForElement(wrapRef.current);
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    ctxRef.current = canvas.getContext('2d');

    configurePSXCanvas(ctxRef.current);

    const zonaCfg =
      ZONAS[zonaId] || ZONAS.rocosa;

    const difCfg =
      DIFICULTAD_CONFIG[dificultad] ||
      DIFICULTAD_CONFIG.facil;

    stateRef.current = crearEstadoV2(
      canvasSize.width,
      canvasSize.height,
      zonaCfg,
      difCfg,
      avatar
    );

    stateRef.current.score = puntajeInicial;
    stateRef.current.vistaLlegada = vistaLlegada;
    stateRef.current.onPowerup = onPowerup;

    actuHUD();
    mostrarBanner();
    rafRef.current = requestAnimationFrame(loop);
    // La vista de prueba no necesita crear una sesión.
    if (vistaLlegada) return;

    try {
      const partida = modoDemo
        ? { sessionId: iniciarPartidaDemo(zonaId), checkpoint: null, recuperada: false }
        : await iniciarPartida(zonaId, dificultad);
      const sessionId = typeof partida === 'string' ? partida : partida.sessionId;
      const checkpoint = typeof partida === 'object' ? partida.checkpoint : null;

      if (intento !== inicioRef.current) return;

 sessionRef.current = sessionId;
      if (stateRef.current && partida?.dificultadConfig) {
        stateRef.current.maxLives = partida.dificultadConfig.lives;
        stateRef.current.lives = partida.dificultadConfig.lives;
        stateRef.current.dmg = partida.dificultadConfig.dmg;
        actuHUD();
      }
      if (checkpoint && stateRef.current) {
        const s = stateRef.current;
        const payload = checkpoint.payload || {};
        s.score = Math.max(0, Number(checkpoint.score) || 0);
        s.lives = Math.max(0, Number(checkpoint.lives_remaining) || 0);
        s.speed = Math.max(0, Number(payload.velocidad) || s.speed);
        s.distancia = Math.max(0, Number(payload.distancia) || 0);
        s.dayTime = Number.isFinite(Number(payload.dayTime)) ? Number(payload.dayTime) : s.dayTime;
        const lane = Math.max(-1, Math.min(1, Number(payload.carril) || 0));
        s.jugador.lane = lane;
        s.jugador.laneVisual = lane;
        actuHUD();
        setZonaBanner('Partida recuperada desde tu último guardado');
      }
      if (!modoDemo) {
        registrarEventoJuego(checkpoint ? 'partida_reanudada' : 'partida_iniciada', {
          session_id: sessionId,
          zona: zonaId,
          dificultad,
          recuperada: Boolean(checkpoint),
        }).catch((error) => console.warn('No se pudo guardar el inicio de partida', error));
      }

// Precargar pregunta de rescate en segundo plano
preguntaRescateRef.current = Promise.resolve(modoDemo
  ? obtenerSiguientePreguntaDemo(sessionId)
  : obtenerSiguientePreguntaRescate(sessionId))
  .catch((error) => {
    console.error('Error precargando pregunta de rescate:', error);
    return null;
  });

scheduleQ(true);
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
    scheduleQ,
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

  const reanudar = useCallback(() => {
    const s = stateRef.current;

    if (!s) return;

    s.paused = false;
    setPausado(false);
    if (!modoDemo) registrarEventoJuego('partida_reanudada', { session_id: sessionRef.current })
      .catch((error) => console.warn('No se pudo guardar la reanudación', error));

    if (s.ended || s.questionOpen || s.finishing) return;

    if (preguntaPendienteRef.current) {
      const q = preguntaPendienteRef.current;
      preguntaPendienteRef.current = null;
      abrirQ(q);
      return;
    }

    if (qTimeoutRemainingRef.current !== null) {
      const restante = qTimeoutRemainingRef.current;
      qTimeoutRemainingRef.current = null;
      scheduleQ(false, restante);
    }

  }, [abrirQ, scheduleQ, modoDemo]);

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

    if (!s.paused) {
      if (qTimeoutRef.current) {
        qTimeoutRemainingRef.current = Math.max(
          0,
          qTimeoutDueRef.current - Date.now()
        );
        clearTimeout(qTimeoutRef.current);
        qTimeoutRef.current = null;
        qTimeoutDueRef.current = 0;
      }
      s.paused = true;
      setAlerta(false);
      setPausado(true);
      if (!modoDemo && sessionRef.current) {
        registrarEventoJuego('partida_pausada', { session_id: sessionRef.current })
          .catch((error) => console.warn('No se pudo guardar la pausa', error));
        if (s.lives > 0 && !s.finishing && !checkpointSavingRef.current) {
          checkpointSavingRef.current = true;
          guardarCheckpointJuego({
            sessionId: sessionRef.current,
            score: s.score,
            lives: s.lives,
            lane: s.jugador.lane,
            speed: s.speed,
            distancia: s.distancia,
            dayTime: s.dayTime,
          }).catch((error) => console.warn('No se pudo guardar el checkpoint', error))
            .finally(() => { checkpointSavingRef.current = false; });
        }
      }
      return;
    }

    reanudar();

  }, [reanudar, modoDemo]);

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

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const actualizarTamano = () => {
      const state = stateRef.current;
      if (!wrap || !canvas || !state) return;

      const nextSize = canvasSizeForElement(wrap);
      if (canvas.width === nextSize.width && canvas.height === nextSize.height) return;

      const previousHeight = state.H;
      canvas.width = nextSize.width;
      canvas.height = nextSize.height;
      ctxRef.current = canvas.getContext('2d');
      configurePSXCanvas(ctxRef.current);

      state.W = nextSize.width;
      state.H = nextSize.height;
      state.GND = nextSize.height * 0.86;
      state.horizonY = nextSize.height * 0.4;
      state.centerX = nextSize.width / 2;
      const heightRatio = nextSize.height / previousHeight;
      state.jugador.jumpOffset *= heightRatio;
      state.jugador.pvy *= heightRatio;
      state.parts = [];
    };

    const resizeObserver = wrap && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(actualizarTamano)
      : null;
    resizeObserver?.observe(wrap);
    if (!resizeObserver) window.addEventListener('resize', actualizarTamano);

    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', actualizarTamano);
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
