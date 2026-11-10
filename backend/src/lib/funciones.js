// ─── FUNCIONES api_* QUE EL BACKEND PUEDE LLAMAR ───
// Son las mismas funciones que ya usa el proyecto main (existen en tu base de datos de Supabase).
// Cualquier otra función, aunque exista en la BD, responde 404: el backend no la expone.
//
//   'publica' → se puede llamar sin sesión (si hay sesión, se usa la del usuario).
//   'sesion'  → exige un token de sesión válido.
export const FUNCIONES = {
  // Públicas
  api_ranking: 'publica',
  api_usuario_disponible: 'publica',
  api_validar_codigo: 'publica',

  // Perfil y partidas del alumno
  api_iniciar: 'sesion',
  api_mi_perfil: 'sesion',
  api_guardar_avatar: 'sesion',
  api_guardar_progreso: 'sesion',
  api_registrar_partida: 'sesion',
  api_registrar_respuestas: 'sesion',


 // Sistema de preguntas desde Supabase
api_iniciar_partida: 'sesion',
api_siguiente_pregunta: 'sesion',
api_siguiente_pregunta_v2: 'sesion',

  // Docente
  api_listar_secciones: 'sesion',
  api_crear_seccion: 'sesion',
  api_crear_link: 'sesion',
  api_alternar_link: 'sesion',
  api_listar_alumnos: 'sesion',
  api_errores_por_tema: 'sesion',
  api_detalle_alumno: 'sesion',
  api_remover_alumno: 'sesion',

  // Administrador
  api_solicitudes_docente: 'sesion',
  api_resolver_solicitud: 'sesion',
  api_listar_usuarios: 'sesion',
  api_cambiar_cuenta: 'sesion',
  api_asignar_docente: 'sesion',
};

export const esFuncionPermitida = (nombre) => Object.hasOwn(FUNCIONES, nombre);
