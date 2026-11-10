import SeccionesVista from './SeccionesVista';
import '../styles/paneles.css';

export default function PanelDocente({ usuario, onProbar, onSalir, demo = false }) {
  return (
    <div className="pn-root">
      <header className="pn-head pn-head-teacher">
        <div className="pn-head-inner">
          <div className="pn-head-copy">
            <span className="pn-eyebrow">PSEINT RUNNER · ESPACIO DOCENTE</span>
            <h1>Panel docente</h1>
            <p>Consulta el avance de tus estudiantes y acompaña su aprendizaje.</p>
            <span className="pn-user-tag">🧑‍🏫 {usuario}</span>
          </div>
          <div className="pn-acts">
            <button className="pn-btn pn-btn-primary" onClick={onProbar}>🎮 Probar el juego</button>
            <button className="pn-btn ghost" onClick={onSalir}>Cerrar sesión</button>
          </div>
        </div>
      </header>
      <div className="pn-page">
        <SeccionesVista usuario={usuario} demo={demo} />
      </div>
    </div>
  );
}
