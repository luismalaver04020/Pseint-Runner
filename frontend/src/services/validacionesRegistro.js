export const PASSWORD_MIN_LENGTH = 15;

export function validarCorreoRegistro(correo) {
  const email = (correo || '').trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function normalizarNombrePersona(nombre = '') {
  return nombre.trim().replace(/\s+/g, ' ');
}

export function validarNombrePersona(nombre = '') {
  const valor = normalizarNombrePersona(nombre);
  return [...valor].length >= 2
    && [...valor].length <= 80
    && /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(valor);
}

export function validarFechaNacimiento(fecha = '') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const nacimiento = new Date(Date.UTC(anio, mes - 1, dia));
  if (nacimiento.getUTCFullYear() !== anio || nacimiento.getUTCMonth() !== mes - 1 || nacimiento.getUTCDate() !== dia) {
    return false;
  }
  const hoy = new Date();
  const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return nacimiento <= new Date(Date.UTC(hoyLocal.getFullYear(), hoyLocal.getMonth(), hoyLocal.getDate()));
}

export const GENEROS_REGISTRO = [
  { valor: 'mujer', etiqueta: 'Mujer' },
  { valor: 'hombre', etiqueta: 'Hombre' },
  { valor: 'no_binario', etiqueta: 'No binario' },
  { valor: 'otro', etiqueta: 'Otro' },
  { valor: 'prefiero_no_decir', etiqueta: 'Prefiero no decirlo' },
];

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

export function mensajeContrasenaInvalida(password = '') {
  const faltantes = requisitosContrasena(password).filter((requisito) => !requisito.cumple);
  if (!faltantes.length) return '';
  return `La contraseña debe incluir: ${faltantes.map((requisito) => requisito.texto.toLowerCase()).join(', ')}.`;
}
