BEGIN;

-- Ranking general o por sección. El servidor determina y valida el alcance
-- según la matrícula y el rol autenticado; nunca confía solo en el filtro UI.
CREATE OR REPLACE FUNCTION algoritmos.api_ranking_secciones(
    p_dificultad text DEFAULT 'facil',
    p_alcance text DEFAULT 'general',
    p_seccion_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_is_admin boolean := false;
    v_is_teacher boolean := false;
    v_user_section uuid;
    v_selected_section uuid := p_seccion_id;
    v_section jsonb;
    v_sections jsonb := '[]'::jsonb;
    v_rows jsonb := '[]'::jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Inicia sesión para consultar el ranking';
    END IF;

    SELECT
        COALESCE(bool_or(lower(r.code) IN ('admin', 'administrador')), false),
        COALESCE(bool_or(lower(r.code) IN ('docente', 'teacher')), false)
    INTO v_is_admin, v_is_teacher
    FROM user_roles ur
    JOIN roles r USING (role_id)
    WHERE ur.user_id = v_user_id;

    IF NOT v_is_admin AND NOT v_is_teacher AND NOT EXISTS (
        SELECT 1 FROM user_roles ur JOIN roles r USING (role_id)
        WHERE ur.user_id = v_user_id AND lower(r.code) IN ('jugador', 'player')
    ) THEN
        RAISE EXCEPTION 'Tu cuenta no tiene permiso para consultar el ranking';
    END IF;

    SELECT e.section_id INTO v_user_section
    FROM enrollments e
    WHERE e.user_id = v_user_id AND e.active AND e.section_id IS NOT NULL
    ORDER BY e.enrolled_at DESC
    LIMIT 1;

    IF p_alcance NOT IN ('general', 'seccion') THEN
        RAISE EXCEPTION 'El filtro de ranking no es válido';
    END IF;

    IF p_alcance = 'seccion' THEN
        IF NOT v_is_admin AND NOT v_is_teacher THEN
            IF v_user_section IS NULL THEN
                RAISE EXCEPTION 'Tu cuenta todavía no pertenece a una sección';
            END IF;
            IF v_selected_section IS NOT NULL AND v_selected_section <> v_user_section THEN
                RAISE EXCEPTION 'Solo puedes consultar el ranking de tu sección';
            END IF;
            v_selected_section := v_user_section;
        ELSIF v_selected_section IS NULL THEN
            RAISE EXCEPTION 'Selecciona una sección para consultar su ranking';
        END IF;

        IF v_is_teacher AND NOT v_is_admin AND NOT EXISTS (
            SELECT 1 FROM section_teachers st
            WHERE st.teacher_id = v_user_id AND st.section_id = v_selected_section
        ) THEN
            RAISE EXCEPTION 'No tienes acceso al ranking de esa sección';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM sections s WHERE s.section_id = v_selected_section AND s.active) THEN
            RAISE EXCEPTION 'La sección seleccionada no existe o está inactiva';
        END IF;
    END IF;

    SELECT jsonb_build_object('id', s.section_id, 'codigo', s.section_code)
    INTO v_section
    FROM sections s WHERE s.section_id = v_user_section;

    IF v_is_admin THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object('id', s.section_id, 'codigo', s.section_code) ORDER BY s.section_code), '[]'::jsonb)
        INTO v_sections FROM sections s WHERE s.active;
    ELSIF v_is_teacher THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object('id', s.section_id, 'codigo', s.section_code) ORDER BY s.section_code), '[]'::jsonb)
        INTO v_sections
        FROM section_teachers st JOIN sections s USING (section_id)
        WHERE st.teacher_id = v_user_id AND s.active;
    ELSIF v_user_section IS NOT NULL THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object('id', s.section_id, 'codigo', s.section_code)), '[]'::jsonb)
        INTO v_sections FROM sections s WHERE s.section_id = v_user_section AND s.active;
    END IF;

    WITH inscripcion AS (
        SELECT DISTINCT ON (e.user_id) e.user_id, e.section_id
        FROM enrollments e
        WHERE e.active AND e.section_id IS NOT NULL
        ORDER BY e.user_id, e.enrolled_at DESC
    ), mejores AS (
        SELECT DISTINCT ON (pr.user_id)
            u.username,
            pr.score AS puntaje,
            pr.zone AS zona,
            pr.played_at AS fecha,
            s.section_code AS seccion
        FROM player_results pr
        JOIN users u USING (user_id)
        LEFT JOIN inscripcion i ON i.user_id = pr.user_id
        LEFT JOIN sections s USING (section_id)
        WHERE lower(trim(pr.difficulty)) = lower(trim(COALESCE(p_dificultad, 'facil')))
          AND u.account_status = 'activo'
          AND (p_alcance = 'general' OR i.section_id = v_selected_section)
          AND EXISTS (
              SELECT 1 FROM user_roles ur JOIN roles r USING (role_id)
              WHERE ur.user_id = u.user_id AND lower(r.code) IN ('jugador', 'player')
          )
        ORDER BY pr.user_id, pr.score DESC, pr.played_at DESC
    )
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'usuario', username,
        'puntaje', puntaje,
        'zona', zona,
        'fecha', fecha,
        'seccion', seccion
    ) ORDER BY puntaje DESC, lower(username)), '[]'::jsonb)
    INTO v_rows FROM mejores;

    RETURN jsonb_build_object(
        'alcance', p_alcance,
        'seccionUsuario', v_section,
        'secciones', v_sections,
        'seccionSeleccionada', CASE WHEN p_alcance = 'seccion' THEN v_selected_section ELSE NULL END,
        'jugadores', v_rows
    );
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.api_ranking_secciones(text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION algoritmos.api_ranking_secciones(text, text, uuid) TO authenticated;

COMMIT;
