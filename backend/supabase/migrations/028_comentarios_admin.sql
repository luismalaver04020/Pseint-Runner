BEGIN;

-- Lista hasta 500 comentarios recientes de partidas, solo para administradores.
CREATE OR REPLACE FUNCTION algoritmos.api_admin_listar_comentarios(p_limit integer DEFAULT 100)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v UUID := auth.uid();
    salida jsonb;
BEGIN
    IF v IS NULL OR NOT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r USING (role_id)
        WHERE ur.user_id = v AND lower(r.code) IN ('admin', 'administrador')
    ) THEN
        RAISE EXCEPTION 'Acceso exclusivo para administradores';
    END IF;

    SELECT COALESCE(jsonb_agg(fila ORDER BY enviado_en DESC), '[]'::jsonb)
    INTO salida
    FROM (
        SELECT jsonb_build_object(
            'id', f.feedback_id,
            'usuario', u.username,
            'motivo', COALESCE(r.label, 'Sin motivo'),
            'comentario', f.comment,
            'enviadoEn', f.submitted_at,
            'zona', z.name,
            'dificultad', d.name,
            'puntaje', gs.score,
            'estadoPartida', gs.status
        ) AS fila,
        f.submitted_at AS enviado_en
        FROM session_feedback f
        JOIN game_sessions gs USING (session_id)
        JOIN users u USING (user_id)
        LEFT JOIN exit_reasons r USING (reason_id)
        LEFT JOIN game_zones z USING (zone_id)
        LEFT JOIN difficulties d USING (difficulty_id)
        ORDER BY f.submitted_at DESC
        LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500))
    ) recientes;

    RETURN salida;
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.api_admin_listar_comentarios(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION algoritmos.api_admin_listar_comentarios(integer) TO authenticated;

COMMIT;
