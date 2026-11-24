-- Cada sesión recibe un orden distinto del banco del nivel.
-- Las preguntas ya asignadas o respondidas se siguen excluyendo en esta misma sesión.
BEGIN;

CREATE OR REPLACE FUNCTION algoritmos.api_siguiente_pregunta_nivel(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE v_user_id uuid := auth.uid(); v_question_id bigint; v_result jsonb;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
    PERFORM 1 FROM game_sessions
    WHERE session_id = p_session_id AND user_id = v_user_id AND status = 'en_curso'
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'La partida no pertenece a tu cuenta o ya terminó'; END IF;

    SELECT q.question_id INTO v_question_id
    FROM game_sessions gs
    JOIN level_questions lq ON lq.level_id = gs.level_id
    JOIN questions q ON q.question_id = lq.question_id
    WHERE gs.session_id = p_session_id AND gs.user_id = v_user_id AND gs.status = 'en_curso'
      AND q.published
      AND q.difficulty_id = gs.difficulty_id
      AND NOT EXISTS (SELECT 1 FROM question_assignments qa
                      WHERE qa.session_id = gs.session_id AND qa.question_id = q.question_id)
      AND NOT EXISTS (SELECT 1 FROM answer_attempts aa
                      WHERE aa.session_id = gs.session_id AND aa.question_id = q.question_id)
    ORDER BY md5(p_session_id::text || ':' || q.question_id::text), q.question_id
    LIMIT 1;
    IF v_question_id IS NULL THEN RETURN NULL; END IF;

    SELECT jsonb_build_object(
        'id', q.question_id, 'question_id', q.question_id,
        'topic_id', q.topic_id, 'tipo', q.question_type, 't', q.prompt,
        'ex', q.explanation, 'time', q.time_limit_seconds, 'code', q.code_snippet,
        'ops', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', o.option_id, 'option_id', o.option_id, 'l', o.option_key,
            'texto', o.option_text, 't', o.option_text, 'ok', o.is_correct
        ) ORDER BY o.sort_order), '[]'::jsonb) FROM question_options o WHERE o.question_id = q.question_id)
    ) INTO v_result
    FROM questions q WHERE q.question_id = v_question_id;

    INSERT INTO question_assignments (session_id, user_id, question_id)
    VALUES (p_session_id, v_user_id, v_question_id);
    RETURN v_result;
END;
$function$;

COMMIT;
