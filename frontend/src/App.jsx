import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store/useStore';
import Landing       from './screens/Landing';
import Login         from './screens/Login';
import EditorAvatar  from './screens/EditorAvatar';
import Mapa          from './screens/Mapa';
import JuegoV2       from './components/JuegoV2';
import Ranking       from './screens/Ranking';
import PanelDocente  from './screens/PanelDocente';
import PanelAdmin    from './screens/PanelAdmin';
import EsperaDocente from './screens/EsperaDocente';
import { getAvatar, getPerfil, refrescarPerfil } from './services/authService';
import { setSinRegistro } from './services/sesionService';
import { esDificultadValida } from './services/validacionesPartida';
import ConfirmModal from './components/ConfirmModal';
import './index.css';

function Inner() {
  const { usuario, cargando, saveAvatar, logout, desbloquearTodas, setZona, zona, dificultad } = useStore();
  const [pantalla, setPantalla] = useState('login');
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);   // modal «¿Cerrar sesión?»
  const [version, setVersion] = useState(0);   // sube al refrescar el perfil desde el servidor
  // La landing se ve al abrir el juego sin sesión; un link de invitación (?unirse=CODIGO) va directo al registro.
  const [verLanding, setVerLanding] = useState(() => !new URLSearchParams(window.location.search).get('unirse'));

  const esDemo = usuario === 'demo';
  const perfil = usuario && !esDemo ? getPerfil(usuario) : null;
  const esAdmin  = perfil?.rol === 'admin';
  const esDocente = perfil?.rol === 'docente' && perfil.aprobacion === 'aprobada';
  const esStaff  = esAdmin || esDocente;
  const cuentaEliminada = !!usuario && !esDemo && !perfil;
  const vistaLlegada = import.meta.env.DEV && new URLSearchParams(window.location.search).get('pruebaMeta') === '700';
  const previewUI = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('previewUI') : null;

  // Demo y modo prueba (docente/admin): la partida no cuenta en ranking ni estadísticas.
  useEffect(() => { setSinRegistro(esDemo || esStaff); }, [esDemo, esStaff]);

  // Decide a qué pantalla va cada rol al iniciar sesión (o al actualizar el estado).
  const entrar = () => {
    if (!usuario) { setPantalla('login'); return; }
    if (cuentaEliminada || perfil?.cuenta === 'suspendido') { logout(); setPantalla('login'); return; }
    if (esStaff) { setPantalla('panel'); return; }
    if (perfil?.rol === 'docente') { setPantalla('espera'); return; }
    const av = getAvatar(usuario);
    if (av) { saveAvatar(av); setPantalla('mapa'); }
    else    { setPantalla('avatar'); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(entrar, [usuario, cuentaEliminada, version]);

  // Único punto que cierra la sesión (usa el logout del store → authService.cerrarSesion).
  const salir = () => { setConfirmandoSalida(false); logout(); setPantalla('login'); };
  // Todos los botones «Cerrar sesión / Salir» piden confirmación antes de llamar a salir().
  const pedirSalir = () => setConfirmandoSalida(true);

  // Si por cualquier motivo se llega al juego sin dificultad válida, se vuelve al mapa.
  const juegoSinDificultad = pantalla === 'juego' && !esDificultadValida(dificultad);
  useEffect(() => { if (juegoSinDificultad) setPantalla('mapa'); }, [juegoSinDificultad]);

  // Docente/admin prueban el juego con todas las zonas abiertas.
  const probar = () => {
    desbloquearTodas();
    const av = getAvatar(usuario);
    if (av) saveAvatar(av);
    setPantalla(av ? 'mapa' : 'avatar');
  };

  const vista = () => {
    if (!cargando && vistaLlegada) {
      const salirVistaLlegada = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('pruebaMeta');
        window.location.replace(url.toString());
      };
      return <JuegoV2 onMapa={salirVistaLlegada} onRanking={salirVistaLlegada} puntajeInicial={700} vistaLlegada />;
    }

    if (cargando)                return <div className="login-bg" style={{ display: 'grid', placeItems: 'center', color: '#fff' }}>Cargando…</div>;
    if (previewUI === 'ranking') return <Ranking onVolver={() => { window.location.href = '/'; }} demo />;
    if (previewUI === 'admin') return <PanelAdmin usuario="admin.ejemplo" onProbar={() => {}} onSalir={() => { window.location.href = '/'; }} demo initialTab={new URLSearchParams(window.location.search).get('tab')} />;
    if (previewUI === 'docente') return <PanelDocente usuario="prof.lucia" onProbar={() => {}} onSalir={() => { window.location.href = '/'; }} demo />;
    if (!usuario)                return verLanding ? <Landing onJugar={() => setVerLanding(false)} /> : <Login />;
    if (pantalla === 'panel')    return esAdmin
      ? <PanelAdmin   usuario={usuario} onProbar={probar} onSalir={pedirSalir} />
      : <PanelDocente usuario={usuario} onProbar={probar} onSalir={pedirSalir} />;
    if (pantalla === 'espera')   return <EsperaDocente perfil={perfil} onActualizar={async () => { await refrescarPerfil(); setVersion((v) => v + 1); }} onSalir={pedirSalir} />;
    if (pantalla === 'avatar')   return <EditorAvatar onDone={() => setPantalla('mapa')} />;
    if (pantalla === 'juego' && !juegoSinDificultad) return <JuegoV2
      key={zona || 'rocosa'}
      onMapa={() => setPantalla('mapa')}
      onRanking={() => setPantalla('ranking')}
      onSiguienteNivel={(zonaId) => { setZona(zonaId); setPantalla('juego'); }}
    />;
    if (pantalla === 'mapa' || juegoSinDificultad) return <Mapa onIniciar={() => setPantalla('juego')} onRanking={() => setPantalla('ranking')} onAvatar={() => setPantalla('avatar')} onLogout={pedirSalir} onPanel={esStaff ? () => setPantalla('panel') : undefined} />;
    if (pantalla === 'ranking')  return <Ranking onVolver={() => setPantalla('mapa')} />;
    return null;
  };

  return (
    <>
      {vista()}
      <ConfirmModal
        abierto={confirmandoSalida}
        titulo="¿Estás seguro de que deseas cerrar sesión?"
        textoCancelar="Cancelar"
        textoConfirmar="Cerrar sesión"
        peligro
        onCancelar={() => setConfirmandoSalida(false)}
        onConfirmar={salir}
      />
    </>
  );
}

export default function App() {
  return <StoreProvider><Inner /></StoreProvider>;
}
