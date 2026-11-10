// ─── STORE GLOBAL (Context ligero, sin dependencias externas) ───
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ZONAS_ORDEN } from '../game/zonas';
import { AVATAR_REF } from '../game/spritePersonaje';
import { esDificultadValida } from '../services/validacionesPartida';
import { restaurarSesion, cerrarSesion, saveAvatar as guardarAvatarRemoto, guardarProgresoRemoto } from '../services/authService';

const StoreCtx = createContext(null);

function progresoKey(usuario) { return `psr_progreso_${usuario}`; }

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
    if (avt) { setAvatarState(avt); localStorage.setItem('psr_avatar', JSON.stringify(avt)); }
    setUnlocked(nombre === 'demo' ? cargarProgreso(nombre) : zonasDe(zonas));
  }, []);

  // Solo acepta una de las tres dificultades válidas; cualquier otro valor limpia la selección.
  const setDificultad = useCallback((d) => setDificultadState(esDificultadValida(d) ? d : null), []);

  const logout = useCallback(() => {
    setUsuario(null);
    setDificultadState(null);   // la siguiente persona que entre debe elegir de nuevo
    cerrarSesion();
  }, []);

  // Al abrir la página: si ya había una sesión de Supabase, entra directo.
  useEffect(() => {
    let vivo = true;
    restaurarSesion().then((p) => {
      if (!vivo) return;
      if (p && p.cuenta !== 'suspendido') login(p.usuario, p.avatar, p.zonas);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, [login]);

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
