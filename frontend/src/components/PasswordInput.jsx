import { useState } from 'react';
import '../styles/ui.css';

const OjoAbierto = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const OjoTachado = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10.5 7 10.5 7a17.7 17.7 0 0 1-3.2 4M6.1 6.1A17.5 17.5 0 0 0 1.5 12S5.5 19 12 19a10.7 10.7 0 0 0 4.2-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M2 2l20 20" />
  </svg>
);

// Campo de contraseña con botón de ojo. Cada instancia controla su propia visibilidad
// y el valor nunca se toca al alternar; el botón es type="button" (no envía el formulario).
export default function PasswordInput({ value, onChange, placeholder, autoComplete, onKeyDown, ...resto }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        {...resto}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        className="pw-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <OjoTachado /> : <OjoAbierto />}
      </button>
    </div>
  );
}
