import { useEffect, useState } from 'react';
import { register, login, verificarCodigoRegistro, reenviarCodigoRegistro, enviarCorreoRecuperacion, guardarNuevaContrasena, esFlujoRecuperacion } from '../services/authService';
import { PASSWORD_MIN_LENGTH, GENEROS_REGISTRO, requisitosContrasena, validarCorreoRegistro, validarFechaNacimiento, validarNombrePersona, mensajeContrasenaInvalida } from '../services/validacionesRegistro';
import { CARRERAS } from '../services/carreras';
import { useStore } from '../store/useStore';
import PasswordInput from '../components/PasswordInput';
import { supabase, supabaseListo } from '../services/supabase';
import mapaImg from '../assets/mapa-peru.png';
import '../styles/login.css';

// Si el docente comparte un link tipo  ...?unirse=ABC123  el código llega aquí.
const codigoDeLink = () => new URLSearchParams(window.location.search).get('unirse') || '';

export default function Login() {
  const { login: storeLogin } = useStore();
  const codigoInicial = codigoDeLink();
  const [tab, setTab]     = useState(codigoInicial ? 'reg' : 'login');
  const [user, setUser]   = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');
  const [pass, setPass]   = useState('');
  const [pass2, setPass2] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol]     = useState('jugador');
  const [carrera, setCarrera] = useState('');
  const [codigo, setCodigo]   = useState(codigoInicial);
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);
  const [modoRecuperacion, setModoRecuperacion] = useState(esFlujoRecuperacion);
  const [solicitarRecuperacion, setSolicitarRecuperacion] = useState(false);
  const [codigoOtp, setCodigoOtp] = useState('');
  const [avisoCodigo, setAvisoCodigo] = useState('');
  const [err, setErr]     = useState('');
  const [cargando, setCargando] = useState(false);
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  const fechaMaxima = hoy.toISOString().slice(0, 10);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('psr_cierre_por_inactividad') === '1') {
        sessionStorage.removeItem('psr_cierre_por_inactividad');
        setErr('Tu sesión se cerró tras 10 minutos sin actividad. Inicia sesión nuevamente.');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!supabaseListo || !supabase) return undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setModoRecuperacion(true);
        setSolicitarRecuperacion(false);
        setTab('login');
        setErr('');
        setAvisoCodigo('');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const doLogin = async () => {
    setErr('');
    if (!correo.trim() || !pass) { setErr('Completa tu correo y contraseña'); return; }
    setCargando(true);
    const r = await login(correo, pass);
    setCargando(false);
    if (!r.ok) { setErr(r.error); return; }
    storeLogin(r.usuario, r.avatar, r.zonas);
  };

  const doRegister = async () => {
    setErr('');
    if (!user.trim() || !correo.trim() || !carrera || !pass || !pass2) { setErr('Completa todos los campos obligatorios'); return; }
    if (!validarNombrePersona(nombres) || !validarNombrePersona(apellidos)) {
      setErr('Escribe nombres y apellidos válidos (de 2 a 80 caracteres, sin números).');
      return;
    }
    if (!validarFechaNacimiento(fechaNacimiento)) {
      setErr('Ingresa una fecha de nacimiento válida que no sea posterior a hoy.');
      return;
    }
    if (!GENEROS_REGISTRO.some(opcion => opcion.valor === genero)) { setErr('Elige una opción de género.'); return; }
    if (!validarCorreoRegistro(correo)) { setErr('Escribe un correo válido'); return; }
    const errorContrasena = mensajeContrasenaInvalida(pass);
    if (errorContrasena) { setErr(errorContrasena); return; }
    if (pass !== pass2) { setErr('Las contraseñas no coinciden'); return; }
    setCargando(true);
    const r = await register(user.trim(), pass, {
      rol, correo: correo.trim(), carrera, codigo,
      nombres, apellidos, fechaNacimiento, genero,
    });
    setCargando(false);
    if (!r.ok) { setErr(r.error); return; }
    if (r.confirmar) {
      setCorreo(r.correo || correo.trim());
      setCodigoOtp('');
      setAvisoCodigo(`Enviamos un código de verificación a ${r.correo || correo.trim()}. Ingrésalo para activar tu cuenta y jugar.`);
      setErr('');
      setEsperandoCodigo(true);
      return;
    }
    storeLogin(r.usuario, null, null);
  };

  const doVerifyCodigo = async () => {
    setErr('');
    setAvisoCodigo('');
    const token = codigoOtp.trim();
    if (!/^\d{6}$/.test(token)) { setErr('Ingresa el código numérico de 6 dígitos'); return; }
    setCargando(true);
    const r = await verificarCodigoRegistro(correo, token);
    setCargando(false);
    if (!r.ok) { setErr(r.error); return; }
    setEsperandoCodigo(false);
    storeLogin(r.usuario, r.avatar, r.zonas);
  };

  const doReenviarCodigo = async () => {
    setErr('');
    setAvisoCodigo('');
    setCargando(true);
    const r = await reenviarCodigoRegistro(correo);
    setCargando(false);
    if (!r.ok) { setErr(r.error); return; }
    setAvisoCodigo(`Enviamos otro código a ${correo}. Revisa también la carpeta de spam.`);
  };

  const doEnviarRecuperacion = async () => {
    setErr('');
    setAvisoCodigo('');
    if (!correo.trim()) { setErr('Escribe el correo asociado a tu cuenta'); return; }
    setCargando(true);
    const r = await enviarCorreoRecuperacion(correo);
    setCargando(false);
    if (!r.ok) { setErr(r.error); return; }
    setAvisoCodigo('Si el correo está asociado a una cuenta, recibirás un enlace. Ábrelo para elegir tu contraseña nueva. Revisa también spam.');
  };

  const doGuardarContrasena = async () => {
    setErr('');
    setAvisoCodigo('');
    const errorContrasena = mensajeContrasenaInvalida(pass);
    if (errorContrasena) { setErr(errorContrasena); return; }
    if (pass !== pass2) { setErr('Las contraseñas no coinciden'); return; }
    setCargando(true);
    const r = await guardarNuevaContrasena(pass);
    setCargando(false);
    if (!r.ok) { setErr(r.error); return; }
    setModoRecuperacion(false);
    setPass('');
    setPass2('');
    setAvisoCodigo('Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.');
  };

  const volverAlRegistro = () => {
    setEsperandoCodigo(false);
    setCodigoOtp('');
    setAvisoCodigo('');
    setErr('');
    setTab('reg');
  };

  // Demo: se juega tal cual, sin cuenta; no guarda ranking ni estadísticas.
  const doDemo = () => {
    localStorage.removeItem('psr_progreso_demo');
    storeLogin('demo', null, null);
  };

  const cambiarTab = (t) => { setTab(t); setErr(''); setAvisoCodigo(''); setSolicitarRecuperacion(false); };

  return (
    <div className="login-bg">
      <img className="login-photo" src={mapaImg} alt="" />
      <div className="login-photo-veil" />
      <div className="login-card">
        <div className="login-badge">🏃</div>
        <h1 className="login-title">PSeInt RUNNER</h1>
        <p className="login-sub">CONQUISTA LAS 4 ZONAS DEL PERÚ</p>
        {!esperandoCodigo && !modoRecuperacion && <div className="tab-row">
          <button className={`tab-btn${tab==='login'?' active':''}`} onClick={()=>cambiarTab('login')}>INICIAR SESIÓN</button>
          <button className={`tab-btn${tab==='reg'?' active':''}`}   onClick={()=>cambiarTab('reg')}>REGISTRARSE</button>
        </div>}
        {modoRecuperacion ? (
          <section className="password-recovery" aria-labelledby="recovery-title">
            <h2 id="recovery-title">{solicitarRecuperacion ? 'RECUPERA TU CUENTA' : 'NUEVA CONTRASEÑA'}</h2>
            {solicitarRecuperacion ? (
              <>
                <p>Te enviaremos un enlace seguro al correo registrado para que puedas crear otra contraseña.</p>
                <div className="field"><input type="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="Correo asociado a tu cuenta" autoComplete="email" maxLength={254} onKeyDown={e=>e.key==='Enter'&&doEnviarRecuperacion()} /></div>
                <button className="btn-main btn-cyan" disabled={cargando} onClick={doEnviarRecuperacion}>{cargando ? 'ENVIANDO…' : 'ENVIAR ENLACE DE RECUPERACIÓN'}</button>
              </>
            ) : (
              <>
                <p>Elige una contraseña nueva para volver a entrar a tu cuenta.</p>
                <div className="field password-field"><PasswordInput value={pass} onChange={e=>setPass(e.target.value)} placeholder="Nueva contraseña" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} maxLength={128} aria-describedby="recovery-password-rules" />
                  <div id="recovery-password-rules" className="password-rules" aria-live="polite">{requisitosContrasena(pass).map(r => <span key={r.id} className={r.cumple ? 'cumple' : ''}><b>{r.cumple ? '✓' : '○'}</b>{r.texto}</span>)}</div>
                </div>
                <div className="field"><PasswordInput value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Confirmar contraseña" autoComplete="new-password" maxLength={128} onKeyDown={e=>e.key==='Enter'&&doGuardarContrasena()} /></div>
                <button className="btn-main btn-cyan" disabled={cargando} onClick={doGuardarContrasena}>{cargando ? 'GUARDANDO…' : '✔ GUARDAR CONTRASEÑA'}</button>
              </>
            )}
            <button className="otp-back" disabled={cargando} onClick={() => { setModoRecuperacion(false); setSolicitarRecuperacion(false); setPass(''); setPass2(''); setErr(''); setAvisoCodigo(''); window.history.replaceState({}, document.title, window.location.pathname); }}>Volver al inicio de sesión</button>
          </section>
        ) : esperandoCodigo ? (
          <section className="signup-otp" aria-labelledby="otp-title">
            <h2 id="otp-title">VERIFICA TU CORREO</h2>
            <p>Escribe el código numérico de 6 dígitos que enviamos a <b>{correo}</b>. Necesitas verificarlo para activar tu cuenta y jugar.</p>
            <div className="field">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="Código de verificación de seis dígitos"
                placeholder="000000"
                value={codigoOtp}
                maxLength={6}
                onChange={e => setCodigoOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && doVerifyCodigo()}
              />
            </div>
            <button className="btn-main btn-cyan" disabled={cargando} onClick={doVerifyCodigo}>
              {cargando ? 'VERIFICANDO…' : '✔ VERIFICAR Y CONTINUAR'}
            </button>
            <button className="btn-main btn-demo otp-resend" disabled={cargando} onClick={doReenviarCodigo}>
              {cargando ? 'ENVIANDO…' : 'REENVIAR CÓDIGO'}
            </button>
            <button className="otp-back" disabled={cargando} onClick={volverAlRegistro}>Volver al registro</button>
          </section>
        ) : tab === 'login' ? (
          <>
            <div className="field"><input type="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="Correo institucional" onKeyDown={e=>e.key==='Enter'&&doLogin()} /></div>
            <div className="field"><PasswordInput value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contraseña" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&doLogin()} /></div>
            <button className="btn-main btn-cyan" disabled={cargando} onClick={doLogin}>{cargando ? 'ENTRANDO…' : '▶ ENTRAR'}</button>
            <button className="login-forgot" type="button" onClick={() => { setModoRecuperacion(true); setSolicitarRecuperacion(true); setErr(''); setAvisoCodigo(''); }}>¿Olvidaste tu contraseña?</button>
          </>
        ) : (
          <>
            <div className="rol-row">
              <button className={`tab-btn${rol==='jugador'?' active':''}`} onClick={()=>setRol('jugador')}>SOY ALUMNO</button>
              <button className={`tab-btn${rol==='docente'?' active':''}`} onClick={()=>setRol('docente')}>SOY DOCENTE</button>
            </div>
            <div className="field"><input value={nombres} onChange={e=>setNombres(e.target.value)} placeholder="Nombres" autoComplete="given-name" maxLength={80} /></div>
            <div className="field"><input value={apellidos} onChange={e=>setApellidos(e.target.value)} placeholder="Apellidos" autoComplete="family-name" maxLength={80} /></div>
            <div className="field"><input type="date" value={fechaNacimiento} onChange={e=>setFechaNacimiento(e.target.value)} max={fechaMaxima} aria-label="Fecha de nacimiento" autoComplete="bday" /></div>
            <div className="field">
              <select value={genero} onChange={e=>setGenero(e.target.value)} aria-label="Género">
                <option value="">Elige tu género</option>
                {GENEROS_REGISTRO.map(opcion => <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>)}
              </select>
            </div>
            <div className="field"><input value={user} onChange={e=>setUser(e.target.value)} placeholder="Nombre de usuario (el que verán en el ranking)" autoComplete="username" maxLength={32} /></div>
            <div className="field"><input type="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="Correo institucional" autoComplete="email" maxLength={254} /></div>
            <div className="field">
              <select value={carrera} onChange={e=>setCarrera(e.target.value)}>
                <option value="">Elige tu carrera</option>
                {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {rol === 'jugador' && (
              <div className="field"><input value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} placeholder="Código de sección (opcional)" /></div>
            )}
            <p className="personal-data-note">Tus datos personales se guardarán en tu perfil.</p>
            <div className="field password-field">
              <PasswordInput value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contraseña" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} maxLength={128} aria-describedby="password-rules" />
              <div id="password-rules" className="password-rules" aria-live="polite">
                {requisitosContrasena(pass).map(r => <span key={r.id} className={r.cumple ? 'cumple' : ''}><b>{r.cumple ? '✓' : '○'}</b>{r.texto}</span>)}
              </div>
            </div>
            <div className="field"><PasswordInput value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Confirmar contraseña" autoComplete="new-password" maxLength={128} onKeyDown={e=>e.key==='Enter'&&doRegister()} /></div>
            {rol === 'docente' && <p className="login-nota">Un administrador debe aprobar tu cuenta de docente.</p>}
            <button className="btn-main btn-cyan" disabled={cargando} onClick={doRegister}>{cargando ? 'CREANDO…' : '✔ CREAR CUENTA'}</button>
          </>
        )}
        {avisoCodigo && <p className="login-info" role="status">{avisoCodigo}</p>}
        {err && <p className="login-err" role="alert">{err}</p>}
        {!esperandoCodigo && !modoRecuperacion && <button className="btn-main btn-demo" onClick={doDemo}>👀 VER DEMO (SIN CUENTA)</button>}
        {!esperandoCodigo && !modoRecuperacion && <p className="login-foot">¿No tienes cuenta? <button type="button" onClick={()=>cambiarTab(tab==='login'?'reg':'login')}>{tab==='login'?'Regístrate':'Inicia sesión'}</button></p>}
      </div>
    </div>
  );
}
