import '../styles/paneles.css';

export default function EsperaDocente({ perfil, onActualizar, onSalir }) {
  const rechazada = perfil?.aprobacion === 'rechazada';
  return (
    <div className="pn-root pn-center">
      <div className="pn-card pn-espera">
        <h2>{rechazada ? '❌ SOLICITUD RECHAZADA' : '⏳ SOLICITUD PENDIENTE'}</h2>
        <p>{rechazada
          ? 'El administrador no aprobó tu solicitud como docente. Contáctalo para más información.'
          : 'Tu cuenta de docente debe ser aprobada por el administrador. Cuando lo haga, podrás crear secciones y compartir tu link.'}</p>
        <div className="pn-acts">
          <button className="pn-btn" onClick={onActualizar}>↻ ACTUALIZAR</button>
          <button className="pn-btn ghost" onClick={onSalir}>SALIR</button>
        </div>
      </div>
    </div>
  );
}
