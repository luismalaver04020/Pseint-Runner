export const PASSWORD_MIN_LENGTH = 15;

export function validarCorreoRegistro(correo) {
  const email = (correo || '').trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function requisitosContrasena(password = '') {
  const longitud = [...password].length >= PASSWORD_MIN_LENGTH;
  return [
    { id: 'longitud', texto: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`, cumple: longitud },
    { id: 'mayuscula', texto: 'Una letra mayúscula', cumple: /\p{Lu}/u.test(password) },
    { id: 'minuscula', texto: 'Una letra minúscula', cumple: /\p{Ll}/u.test(password) },
    { id: 'numero', texto: 'Un número', cumple: /\p{N}/u.test(password) },
    { id: 'simbolo', texto: 'Un símbolo (por ejemplo: !, @ o #)', cumple: /[^\p{L}\p{N}\s]/u.test(password) },
  ];
}

export function validarContrasenaRegistro(password = '') {
  return requisitosContrasena(password).every((requisito) => requisito.cumple);
}

export function mensajeContrasenaInvalida(password = '') {
  const faltantes = requisitosContrasena(password).filter((requisito) => !requisito.cumple);
  if (!faltantes.length) return '';
  return `La contraseña debe incluir: ${faltantes.map((requisito) => requisito.texto.toLowerCase()).join(', ')}.`;
}
