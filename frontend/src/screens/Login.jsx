import { useEffect, useState } from 'react';
import { register, login } from '../services/authService';
import { PASSWORD_MIN_LENGTH, requisitosContrasena, validarCorreoRegistro, mensajeContrasenaInvalida } from '../services/validacionesRegistro';
import { CARRERAS } from '../services/carreras';
import { useStore } from '../store/useStore';
import PasswordInput from '../components/PasswordInput';
import mapaImg from '../assets/mapa-peru.png';
import '../styles/login.css';

// Si el docente comparte un link tipo  ...?unirse=ABC123  el código llega aquí.
const codigoDeLink = () => new URLSearchParams(window.location.search).get('unirse') || '';

export default function Login() {
  const { login: storeLogin } = useStore();
  const codigoInicial = codigoDeLink();
  const [tab, setTab]     = useState(codigoInicial ? 'reg' : 'login');
  const [user, setUser]   = useState('');
  const [pass, setPass]   = useState('');
  const [pass2, setPass2] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol]     = useState('jugador');
  const [carrera, setCarrera] = useState('');
  const [codigo, setCodigo]   = useState(codigoInicial);
  const [err, setErr]     = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('psr_cierre_por_inactividad') === '1') {
        sessionStorage.removeItem('psr_cierre_por_inactividad');
        setErr('Tu sesión se cerró tras 10 minutos sin actividad. Inicia sesión nuevamente.');
      }
    } catch {}
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
    if (!validarCorreoRegistro(correo)) { setErr('Escribe un correo válido'); return; }
    const errorContrasena = mensajeContrasenaInvalida(pass);
    if (errorContrasena) { setErr(errorContrasena); return; }
    if (pass !== pass2) { setErr('Las contraseñas no coinciden'); return; }
    setCargando(true);
    const r = await register(user.trim(), pass, { rol, correo: correo.trim(), carrera, codigo });
    setCargando(false);
    if (!r.ok) { setErr(r.error); return; }
    if (r.confirmar) { setTab('login'); setErr('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.'); return; }
    storeLogin(r.usuario, null, null);
  };

  // Demo: se juega tal cual, sin cuenta; no guarda ranking ni estadísticas.
  const doDemo = () => {
    localStorage.removeItem('psr_progreso_demo');
    storeLogin('demo', null, null);
  };

  const cambiarTab = (t) => { setTab(t); setErr(''); };

  return (
    <div className="login-bg">
      <img className="login-photo" src={mapaImg} alt="" />
      <div className="login-photo-veil" />
      <div className="login-card">
        <div className="login-badge">🏃</div>
        <h1 className="login-title">PSeInt RUNNER</h1>
        <p className="login-sub">CONQUISTA LAS 4 ZONAS DEL PERÚ</p>
        <div className="tab-row">
          <button className={`tab-btn${tab==='login'?' active':''}`} onClick={()=>cambiarTab('login')}>INICIAR SESIÓN</button>
          <button className={`tab-btn${tab==='reg'?' active':''}`}   onClick={()=>cambiarTab('reg')}>REGISTRARSE</button>
        </div>
        {tab === 'login' ? (
          <>
            <div className="field"><input type="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="Correo institucional" onKeyDown={e=>e.key==='Enter'&&doLogin()} /></div>
            <div className="field"><PasswordInput value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contraseña" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&doLogin()} /></div>
            <button className="btn-main btn-cyan" disabled={cargando} onClick={doLogin}>{cargando ? 'ENTRANDO…' : '▶ ENTRAR'}</button>
          </>
        ) : (
          <>
            <div className="rol-row">
              <button className={`tab-btn${rol==='jugador'?' active':''}`} onClick={()=>setRol('jugador')}>SOY ALUMNO</button>
              <button className={`tab-btn${rol==='docente'?' active':''}`} onClick={()=>setRol('docente')}>SOY DOCENTE</button>
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
        {err && <p className="login-err" role="alert">{err}</p>}
        <button className="btn-main btn-demo" onClick={doDemo}>👀 VER DEMO (SIN CUENTA)</button>
        <p className="login-foot">¿No tienes cuenta? <a onClick={()=>cambiarTab(tab==='login'?'reg':'login')}>{tab==='login'?'Regístrate':'Inicia sesión'}</a></p>
      </div>
    </div>
  );
}
