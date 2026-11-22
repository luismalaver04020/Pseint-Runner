import { useEffect, useRef, useState } from 'react';
import { defaultAvatar, useStore } from '../store/useStore';
import { completarDatosPersonales, guardarUsername, getPerfil } from '../services/authService';
import { obtenerAvatarGuardado } from '../services/tablasJuegoService';
import { GENEROS_REGISTRO, validarFechaNacimiento, validarNombrePersona } from '../services/validacionesRegistro';
import { drawPersonaje } from '../game/spritePersonaje';
import '../styles/perfil.css';

export default function Perfil({ onVolver, obligatorio = false, onCompletado }) {
  const { usuario, avatar: avatarStore, updateUsername } = useStore();
  const perfil = getPerfil(usuario) || {};
  const faltanPersonales = !perfil.nombres || !perfil.apellidos || !perfil.fechaNacimiento || !perfil.genero;
  const [username, setUsername] = useState(perfil.username || perfil.usuario || usuario || '');
  const [nombres, setNombres] = useState(perfil.nombres || '');
  const [apellidos, setApellidos] = useState(perfil.apellidos || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(String(perfil.fechaNacimiento || '').slice(0, 10));
  const [genero, setGenero] = useState(perfil.genero || '');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [avatarPerfil, setAvatarPerfil] = useState(avatarStore || defaultAvatar());
  const avatarCanvasRef = useRef(null);

  useEffect(() => {
    let vigente = true;
    obtenerAvatarGuardado()
      .then((guardado) => {
        if (vigente && guardado && typeof guardado === 'object') setAvatarPerfil(guardado);
      })
      .catch((e) => console.warn('No se pudo cargar el avatar guardado en Supabase', e));
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPersonaje(ctx, 60, 112, avatarPerfil, { vista: 'frente', P: 3 });
  }, [avatarPerfil]);

  const guardar = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    if (faltanPersonales && (!validarNombrePersona(nombres) || !validarNombrePersona(apellidos))) { setError('Escribe nombres y apellidos válidos (de 2 a 80 caracteres).'); return; }
    if (faltanPersonales && !validarFechaNacimiento(fechaNacimiento)) { setError('Ingresa una fecha de nacimiento válida.'); return; }
    if (faltanPersonales && !genero) { setError('Selecciona una opción de género.'); return; }
    setGuardando(true);
    try {
      if (faltanPersonales) await completarDatosPersonales({ nombres, apellidos, fechaNacimiento, genero });
      if (username.trim() !== (perfil.username || perfil.usuario || usuario)) { const actualizado = await guardarUsername(username); updateUsername(actualizado.username || username.trim()); }
      setMsg('Perfil guardado.');
      if (faltanPersonales) onCompletado?.();
    } catch (e2) { setError(e2.message || 'No se pudo guardar el perfil.'); }
    finally { setGuardando(false); }
  };

  return <main className="perfil-bg"><form className="perfil-card" onSubmit={guardar}>
    <span className="perfil-kicker">PSEINT RUNNER · TU CUENTA</span>
    <h1>{faltanPersonales ? 'Completa tu perfil' : 'Mi perfil'}</h1>
    <p className="perfil-intro">{faltanPersonales ? 'Tu cuenta es anterior al registro de datos personales. Completa los campos pendientes una sola vez.' : 'Consulta tus datos personales y actualiza el nombre que aparece en el juego.'}</p>

    <section className="perfil-avatar" aria-label="Avatar seleccionado para el juego">
      <canvas ref={avatarCanvasRef} width={120} height={128} aria-label="Vista previa de tu avatar" />
      <div><strong>Tu avatar en el juego</strong><span>Este es el personaje que elegiste y guardaste en tu cuenta.</span></div>
    </section>

    <label>Nombre de usuario <input value={username} maxLength={32} minLength={2} onChange={(e) => setUsername(e.target.value)} required /></label>
    <small className="perfil-hint">Este nombre es único y aparece en el juego y el ranking.</small>

    {faltanPersonales && <div className="perfil-notice">Los datos personales que ya estén registrados aparecerán bloqueados. Solo completarás los que faltan.</div>}
    <div className="perfil-grid">
      <label>Nombres <input value={nombres} maxLength={80} readOnly={!!perfil.nombres} onChange={(e) => setNombres(e.target.value)} required /></label>
      <label>Apellidos <input value={apellidos} maxLength={80} readOnly={!!perfil.apellidos} onChange={(e) => setApellidos(e.target.value)} required /></label>
      <label>Fecha de nacimiento <input type="date" value={fechaNacimiento} readOnly={!!perfil.fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required /></label>
      <label>Género <select value={genero} disabled={!!perfil.genero} onChange={(e) => setGenero(e.target.value)} required>
        <option value="">Selecciona una opción</option>{GENEROS_REGISTRO.map((g) => <option key={g.valor} value={g.valor}>{g.etiqueta}</option>)}
      </select></label>
    </div>
    {!faltanPersonales && <p className="perfil-readonly">Tus nombres, apellidos, fecha de nacimiento y género se muestran solo para consulta.</p>}
    {error && <p className="perfil-error" role="alert">{error}</p>}{msg && <p className="perfil-success" role="status">{msg}</p>}
    <div className="perfil-actions">{!obligatorio && <button type="button" className="perfil-back" onClick={onVolver}>Volver</button>}<button className="perfil-save" disabled={guardando}>{guardando ? 'Guardando…' : faltanPersonales ? 'Guardar datos y continuar' : 'Guardar cambios'}</button></div>
  </form></main>;
}
