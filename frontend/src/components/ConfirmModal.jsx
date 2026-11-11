import { useEffect, useRef } from 'react';
import '../styles/ui.css';

// Ventana de confirmación propia (reemplaza a window.confirm).
// Esc o clic fuera = cancelar. El foco inicia en "Cancelar" para evitar confirmaciones accidentales.
export default function ConfirmModal({
  abierto, titulo, mensaje, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar',
  peligro = false, ocupado = false, onConfirmar, onCancelar,
}) {
  const cancelarRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    cancelarRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onCancelar?.(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [abierto, onCancelar]);

  if (!abierto) return null;
  return (
    <div className="ui-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancelar?.(); }}>
      <section className="ui-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ui-dialog-title" aria-describedby="ui-dialog-msg">
        <h2 id="ui-dialog-title">{titulo}</h2>
        {mensaje && <p id="ui-dialog-msg">{mensaje}</p>}
        <div className="ui-dialog-acts">
          <button type="button" ref={cancelarRef} className="ui-btn ui-btn-ghost" onClick={onCancelar} disabled={ocupado}>{textoCancelar}</button>
          <button type="button" className={`ui-btn ${peligro ? 'ui-btn-danger' : 'ui-btn-primary'}`} onClick={onConfirmar} disabled={ocupado}>{textoConfirmar}</button>
        </div>
      </section>
    </div>
  );
}
