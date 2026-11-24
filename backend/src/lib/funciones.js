// ─── FUNCIONES api_* QUE EL BACKEND PUEDE LLAMAR ───
// Son las mismas funciones que ya usa el proyecto main (existen en tu base de datos de Supabase).
// Cualquier otra función, aunque exista en la BD, responde 404: el backend no la expone.
//
//   'publica' → se puede llamar sin sesión (si hay sesión, se usa la del usuario).
//   'sesion'  → exige un token de sesión válido.
export const FUNCIONES = {
  // Públicas
  api_ranking: 'publica',
  api_ranking_secciones: 'sesion',
  api_usuario_disponible: 'publica',
  api_validar_codigo: 'publica',

  // Perfil y partidas del alumno
  api_iniciar: 'sesion',
  api_mi_perfil: 'sesion',
  api_perfil_personal: 'sesion',
  api_actualizar_username: 'sesion',
  api_completar_datos_personales: 'sesion',
  api_guardar_avatar: 'sesion',
  api_guardar_avatar_y_estado: 'sesion',
  api_obtener_avatar: 'sesion',
  api_registrar_intento_juego: 'sesion',
  api_registrar_evento_juego: 'sesion',
  api_guardar_checkpoint_juego: 'sesion',
  api_recuperar_checkpoint: 'sesion',
  api_checkpoint_disponible: 'sesion',
  api_descartar_checkpoint: 'sesion',
  api_listar_materiales_tema: 'sesion',
  api_estado_prerrequisitos_tema: 'sesion',
  api_apoyo_tema: 'sesion',
  api_listar_niveles_juego: 'sesion',
  api_asignar_nivel_partida: 'sesion',
  api_siguiente_pregunta_nivel: 'sesion',
  api_listar_preguntas_nivel: 'sesion',
  api_motivos_salida_juego: 'sesion',
  api_enviar_feedback_partida: 'sesion',
  api_guardar_progreso: 'sesion',
  api_registrar_partida: 'sesion',
  api_registrar_respuestas: 'sesion',


  // Sistema de preguntas desde Supabase
  api_iniciar_partida: 'sesion',
  api_config_dificultad: 'sesion',
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
  api_admin_detalle_usuario: 'sesion',
  api_admin_listar_comentarios: 'sesion',
  api_reporte_usuarios: 'sesion',
  api_cambiar_cuenta: 'sesion',
  api_asignar_docente: 'sesion',
};

export const esFuncionPermitida = (nombre) => Object.hasOwn(FUNCIONES, nombre);
