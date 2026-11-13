// ─── AUTH SERVICE (Supabase Auth + perfil en la base de datos) ───
// Login con CORREO institucional. El nombre de usuario es el nombre visible en el juego.
// getPerfil/getAvatar siguen siendo síncronos: leen la caché que se llena al iniciar sesión.
import { supabase, supabaseListo, rpc, MSG_CONEXION } from './supabase';
import { validarCorreoRegistro, mensajeContrasenaInvalida } from './validacionesRegistro';

const RESERVADOS = ['demo', 'admin'];
// Opcional: dominio institucional permitido, ej. "utp.edu.pe". Vacío = cualquier correo.
const DOMINIO = (import.meta.env.VITE_DOMINIO_CORREO || '').trim().toLowerCase().replace(/^@/, '');

let perfilActual = null;

const dominioOk = (c) => !DOMINIO || c.endsWith('@' + DOMINIO) || c.endsWith('.' + DOMINIO);

const traducir = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya está registrado';
  if (m.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos';
  if (m.includes('otp') || m.includes('token has expired') || m.includes('invalid token')) return 'El código es incorrecto o venció. Revisa el correo e inténtalo nuevamente';
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed') || m.includes('load failed')) return MSG_CONEXION;
  if (m.includes('email not confirmed')) return 'Confirma tu correo antes de entrar';
  if (m.includes('weak_password') || m.includes('password should be')) return 'La contraseña no cumple la política de seguridad de la cuenta';
  return msg || 'No se pudo completar la acción. Inténtalo nuevamente';
};

export async function cargarPerfil() {
  perfilActual = await rpc('api_iniciar');       // crea el perfil la primera vez
  return perfilActual;
}

// Restaura la sesión al abrir/recargar la página. Devuelve el perfil o null.
export async function restaurarSesion() {
  if (!supabaseListo) return null;
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return await cargarPerfil();
  } catch {
    perfilActual = null;
    return null;
  }
}

// extra = { rol: 'jugador'|'docente', correo, carrera, codigo }
export async function register(nombre, password, extra = {}) {
  const { rol = 'jugador', correo = '', carrera = '', codigo = '' } = extra;
  const email = correo.trim().toLowerCase();
  if (!supabaseListo) { console.error('Falta configurar Supabase'); return { ok: false, error: MSG_CONEXION }; }
  if (!nombre || nombre.length < 2) return { ok: false, error: 'Mínimo 2 caracteres' };
  if (RESERVADOS.includes(nombre.toLowerCase())) return { ok: false, error: 'Ese nombre está reservado' };
  if (!validarCorreoRegistro(email)) return { ok: false, error: 'Escribe un correo válido' };
  if (!dominioOk(email)) return { ok: false, error: `Usa tu correo institucional (@${DOMINIO})` };
  const errorContrasena = mensajeContrasenaInvalida(password);
  if (errorContrasena) return { ok: false, error: errorContrasena };
  if (!carrera) return { ok: false, error: 'Elige tu carrera' };

  try {
    if (!(await rpc('api_usuario_disponible', { p_username: nombre }))) return { ok: false, error: 'Usuario ya existe' };
    if (rol === 'jugador' && codigo.trim() && !(await rpc('api_validar_codigo', { p_code: codigo }))) {
      return { ok: false, error: 'El código de sección no existe o está desactivado' };
    }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: nombre, rol: rol === 'docente' ? 'docente' : 'jugador', carrera, codigo: codigo.trim().toUpperCase() } },
    });
    if (error) return { ok: false, error: traducir(error.message) };
    if (!data.session) return { ok: true, confirmar: true, correo: email };
    // Un signup que devuelve sesión indica que Supabase tiene la confirmación desactivada.
    // No permitimos continuar en ese estado: hay que exigir verificación por correo.
    await cerrarSesionLocal();
    return { ok: false, error: 'La confirmación por correo está desactivada en Supabase. Actívala para que el registro envíe un código antes de jugar.' };
  } catch (e) {
    return { ok: false, error: traducir(e.message) };
  }
}

export async function verificarCodigoRegistro(correo, codigo) {
  if (!supabaseListo) return { ok: false, error: MSG_CONEXION };
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: correo.trim().toLowerCase(),
      token: codigo.trim(),
      type: 'email',
    });
    if (error) return { ok: false, error: traducir(error.message) };

    const p = await cargarPerfil();
    if (p.cuenta === 'suspendido') {
      await cerrarSesion();
      return { ok: false, error: 'Tu cuenta está suspendida' };
    }
    return { ok: true, usuario: p.usuario, avatar: p.avatar || null, zonas: p.zonas };
  } catch (e) {
    return { ok: false, error: traducir(e.message) };
  }
}

export async function reenviarCodigoRegistro(correo) {
  if (!supabaseListo) return { ok: false, error: MSG_CONEXION };
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: correo.trim().toLowerCase(),
    });
    if (error) return { ok: false, error: traducir(error.message) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: traducir(e.message) };
  }
}

export async function login(correo, password) {
  if (!supabaseListo) { console.error('Falta configurar Supabase'); return { ok: false, error: MSG_CONEXION }; }
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: correo.trim().toLowerCase(), password });
    if (error) return { ok: false, error: traducir(error.message) };
    const p = await cargarPerfil();
    if (p.cuenta === 'suspendido') { await cerrarSesion(); return { ok: false, error: 'Tu cuenta está suspendida' }; }
    return { ok: true, usuario: p.usuario, avatar: p.avatar || null, zonas: p.zonas };
  } catch (e) {
    return { ok: false, error: traducir(e.message) };
  }
}

export async function cerrarSesion() {
  perfilActual = null;
  try { if (supabase) await supabase.auth.signOut(); } catch { /* sin conexión */ }
}

// Expira únicamente la sesión local del navegador; no desconecta otros dispositivos.
export async function cerrarSesionLocal() {
  perfilActual = null;
  try { if (supabase) await supabase.auth.signOut({ scope: 'local' }); } catch { /* sin conexión */ }
}

// null si no hay perfil cargado (por ejemplo, el docente removió la cuenta)
export function getPerfil() { return perfilActual; }

// Vuelve a pedir el perfil al servidor (p. ej. el docente esperando su aprobación).
export async function refrescarPerfil() {
  try { perfilActual = await rpc('api_mi_perfil'); } catch { perfilActual = null; }
  return perfilActual;
}

export function saveAvatar(nombre, avatar) {
  if (!perfilActual || nombre === 'demo') return;
  perfilActual = { ...perfilActual, avatar };
  rpc('api_guardar_avatar', { p_avatar: avatar }).catch(() => {});
}

export function getAvatar() { return perfilActual?.avatar || null; }

export function guardarProgresoRemoto(zonas) {
  if (!perfilActual) return;
  perfilActual = { ...perfilActual, zonas };
  rpc('api_guardar_progreso', { p_zonas: zonas }).catch(() => {});
}
