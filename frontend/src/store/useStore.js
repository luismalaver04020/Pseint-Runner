// ─── STORE GLOBAL (Context ligero, sin dependencias externas) ───
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ZONAS_ORDEN } from '../game/zonas';
import { AVATAR_REF } from '../game/spritePersonaje';
import { esDificultadValida } from '../services/validacionesPartida';
import { restaurarSesion, cerrarSesion, cerrarSesionLocal, saveAvatar as guardarAvatarRemoto, guardarProgresoRemoto } from '../services/authService';

const StoreCtx = createContext(null);

function progresoKey(usuario) { return `psr_progreso_${usuario}`; }
const TIEMPO_INACTIVIDAD_SESION_MS = 10 * 60 * 1000;
function actividadKey(usuario) { return `psr_ultima_actividad_${usuario}`; }

function leerUltimaActividad(usuario) {
  try {
    const valor = Number(localStorage.getItem(actividadKey(usuario)));
    return Number.isFinite(valor) && valor > 0 ? valor : Date.now();
  } catch {
    return Date.now();
  }
}

// Zonas válidas guardadas en el servidor (si no hay ninguna, empieza en la primera).
function zonasDe(arr) {
  const ok = Array.isArray(arr) ? arr.filter((z) => ZONAS_ORDEN.includes(z)) : [];
  return ok.length ? ok : [ZONAS_ORDEN[0]];
}

// Solo la demo guarda su progreso en el navegador; los usuarios reales lo guardan en Supabase.
function cargarProgreso(usuario) {
  if (!usuario || usuario !== 'demo') return [ZONAS_ORDEN[0]];
  try {
    const arr = JSON.parse(localStorage.getItem(progresoKey(usuario)) || 'null');
    if (Array.isArray(arr) && arr.length) return arr;
  } catch {}
  return [ZONAS_ORDEN[0]]; // la primera zona siempre empieza desbloqueada
}

export function StoreProvider({ children }) {
  const [usuario, setUsuario]     = useState(null);
  const [cargando, setCargando]   = useState(true);   // restaurando la sesión de Supabase
  const [avatar,  setAvatarState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('psr_avatar') || 'null') || defaultAvatar(); }
    catch { return defaultAvatar(); }
  });
  // null = el jugador todavía no eligió dificultad (no hay valor por defecto).
  const [dificultad, setDificultadState] = useState(null);
  const [zona,       setZona]       = useState(null);
  const [unlocked,   setUnlocked]   = useState([ZONAS_ORDEN[0]]);

  // zonas = zonas desbloqueadas guardadas en el servidor (solo usuarios reales)
  const login = useCallback((nombre, avt, zonas) => {
    setUsuario(nombre);
    if (nombre && nombre !== 'demo') {
      try { localStorage.setItem(actividadKey(nombre), String(Date.now())); } catch {}
    }
    if (avt) { setAvatarState(avt); localStorage.setItem('psr_avatar', JSON.stringify(avt)); }
    setUnlocked(nombre === 'demo' ? cargarProgreso(nombre) : zonasDe(zonas));
  }, []);

  // Solo acepta una de las tres dificultades válidas; cualquier otro valor limpia la selección.
  const setDificultad = useCallback((d) => setDificultadState(esDificultadValida(d) ? d : null), []);

  const logout = useCallback(({ localOnly = false, inactivity = false } = {}) => {
    if (usuario && usuario !== 'demo') {
      try { localStorage.removeItem(actividadKey(usuario)); } catch {}
    }
    if (inactivity) {
      try { sessionStorage.setItem('psr_cierre_por_inactividad', '1'); } catch {}
    }
    setUsuario(null);
    setDificultadState(null);   // la siguiente persona que entre debe elegir de nuevo
    if (localOnly) cerrarSesionLocal();
    else cerrarSesion();
  }, [usuario]);

  // Al abrir la página: si ya había una sesión de Supabase, entra directo.
  useEffect(() => {
    let vivo = true;
    restaurarSesion().then(async (p) => {
      if (!vivo) return;
      if (p && p.cuenta !== 'suspendido') {
        const ultimaActividad = leerUltimaActividad(p.usuario);
        if (Date.now() - ultimaActividad >= TIEMPO_INACTIVIDAD_SESION_MS) {
          try { localStorage.removeItem(actividadKey(p.usuario)); } catch {}
          try { sessionStorage.setItem('psr_cierre_por_inactividad', '1'); } catch {}
          await cerrarSesionLocal();
        } else {
          login(p.usuario, p.avatar, p.zonas);
        }
      }
      if (!vivo) return;
      setCargando(false);
    });
    return () => { vivo = false; };
  }, [login]);

  // Cierra las cuentas reales tras 10 minutos sin actividad. El timestamp
  // compartido sincroniza el vencimiento entre pestañas del mismo navegador.
  useEffect(() => {
    if (!usuario || usuario === 'demo') return undefined;

    const key = actividadKey(usuario);
    let timeoutId = null;
    let ultimaActividadLocal = 0;

    const limpiarTimeout = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const revisarVencimiento = () => {
      const restante = TIEMPO_INACTIVIDAD_SESION_MS - (Date.now() - leerUltimaActividad(usuario));
      limpiarTimeout();
      if (restante <= 0) {
        logout({ localOnly: true, inactivity: true });
        return;
      }
      timeoutId = setTimeout(revisarVencimiento, restante);
    };

    const registrarActividad = () => {
      const ahora = Date.now();
      if (ahora - ultimaActividadLocal < 1000) return;
      ultimaActividadLocal = ahora;
      try { localStorage.setItem(key, String(ahora)); } catch {}
      revisarVencimiento();
    };

    const alCambiarAlmacenamiento = (event) => {
      if (event.key !== key) return;
      if (event.newValue === null) {
        logout({ localOnly: true });
        return;
      }
      revisarVencimiento();
    };

    const alVolverAPestana = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - leerUltimaActividad(usuario) >= TIEMPO_INACTIVIDAD_SESION_MS) {
        logout({ localOnly: true, inactivity: true });
        return;
      }
      registrarActividad();
    };

    const eventos = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel', 'scroll'];
    eventos.forEach((evento) => window.addEventListener(evento, registrarActividad, { passive: true }));
    window.addEventListener('storage', alCambiarAlmacenamiento);
    document.addEventListener('visibilitychange', alVolverAPestana);
    revisarVencimiento();

    return () => {
      limpiarTimeout();
      eventos.forEach((evento) => window.removeEventListener(evento, registrarActividad));
      window.removeEventListener('storage', alCambiarAlmacenamiento);
      document.removeEventListener('visibilitychange', alVolverAPestana);
    };
  }, [usuario, logout]);

  const saveAvatar = useCallback((avt) => {
    const av = { ...avt };
    setAvatarState(av);
    localStorage.setItem('psr_avatar', JSON.stringify(av));
    if (usuario) guardarAvatarRemoto(usuario, av);   // se guarda en Supabase (la demo no)
  }, [usuario]);

  // Desbloquea la siguiente zona en el orden del mapa (se llama al ganar una zona).
  const unlockZona = useCallback((zonaId) => {
    const idx = ZONAS_ORDEN.indexOf(zonaId);
    if (idx === -1 || idx + 1 >= ZONAS_ORDEN.length) return;
    const siguiente = ZONAS_ORDEN[idx + 1];
    setUnlocked((prev) => {
      if (prev.includes(siguiente)) return prev;
      const next = [...prev, siguiente];
      if (usuario === 'demo') localStorage.setItem(progresoKey(usuario), JSON.stringify(next));
      else if (usuario) guardarProgresoRemoto(next);
      return next;
    });
  }, [usuario]);

  // Modo prueba (docente/admin): todas las zonas abiertas, sin guardar progreso.
  const desbloquearTodas = useCallback(() => setUnlocked([...ZONAS_ORDEN]), []);

  const estaDesbloqueada = useCallback((zonaId) => unlocked.includes(zonaId), [unlocked]);

  return React.createElement(StoreCtx.Provider, { value: { usuario, cargando, avatar, dificultad, zona, unlocked, login, logout, saveAvatar, setDificultad, setZona, unlockZona, desbloquearTodas, estaDesbloqueada } }, children);
}

export function useStore() { return useContext(StoreCtx); }

export function defaultAvatar() {
  return { ...AVATAR_REF };
}
