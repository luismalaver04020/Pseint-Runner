-- ==========================================
-- 003_seed_data.sql
-- DATOS INICIALES DEL SISTEMA
-- ==========================================

-- ==========================================
-- 1. ROLES
-- ==========================================

INSERT INTO algoritmos.roles (role_id, code, name)
VALUES
    (1, 'jugador', 'Jugador'),
    (2, 'docente', 'Docente'),
    (3, 'administrador', 'Administrador');

-- ==========================================
-- 2. CARRERAS
-- ==========================================

INSERT INTO algoritmos.careers (career_id, code, name, active)
VALUES
    (1, 'IND', 'Ingeniería Industrial', TRUE),
    (2, 'SIS', 'Ingeniería de Sistemas', TRUE),
    (3, 'CIV', 'Ingeniería Civil', TRUE),
    (4, 'SOF', 'Ingeniería de Software', TRUE);

-- ==========================================
-- 3. CURSOS
-- ==========================================

INSERT INTO algoritmos.courses
    (course_id, code, name, syllabus_version, active)
VALUES
    (1, '100000I07N', 'Principios de algoritmos',
     '2026-Ciclo 2 Agosto', TRUE);

-- ==========================================
-- 4. DIFICULTADES
-- ==========================================

INSERT INTO algoritmos.difficulties
    (difficulty_id, code, name, sort_order, initial_lives, life_damage)
VALUES
    (1, 'facil', 'Fácil', 1, 6, 1),
    (2, 'intermedio', 'Intermedio', 2, 4, 1),
    (3, 'dificil', 'Difícil', 3, 2, 2);

-- ==========================================
-- 5. ZONAS DEL JUEGO
-- ==========================================

INSERT INTO algoritmos.game_zones
    (zone_id, code, name, zone_order, zone_kind, description)
VALUES
    (1, 'rocosa', 'Sierra Andina', 1, 'unidad',
     'Zona inspirada en la región andina.'),
    (2, 'selva', 'Amazonía', 2, 'unidad',
     'Zona inspirada en la selva amazónica.'),
    (3, 'costera', 'Costa del Pacífico', 3, 'unidad',
     'Zona inspirada en la costa peruana.'),
    (4, 'ciudad', 'Lima Urbana', 4, 'libre',
     'Zona urbana de exploración.');

-- ==========================================
-- 6. MOTIVOS DE SALIDA
-- ==========================================

INSERT INTO algoritmos.exit_reasons (reason_id, code, label)
VALUES
    (1, 'falta_tiempo', 'Falta de tiempo'),
    (2, 'dificultad', 'Dificultad del juego'),
    (3, 'problema_tecnico', 'Problema técnico'),
    (4, 'pausa', 'Pausa voluntaria'),
    (5, 'otro', 'Otro motivo');

-- ==========================================
-- 7. REGLAS DE DESBLOQUEO
-- ==========================================

INSERT INTO algoritmos.unit_unlock_rules
    (unit_id, minimum_score, diagnostic_minimum, allow_diagnostic)
VALUES
    (1, 0, 70, TRUE),
    (2, 70, 70, TRUE),
    (3, 70, 70, TRUE);

-- ==========================================
-- 8. ZONAS Y UNIDADES
-- ==========================================

INSERT INTO algoritmos.zone_units (zone_id, unit_id, is_primary)
VALUES
    (1, 1, TRUE),
    (2, 2, TRUE),
    (3, 3, TRUE),
    (4, 1, FALSE),
    (4, 2, FALSE),
    (4, 3, FALSE);

-- ==========================================
-- 9. REINICIAR SECUENCIAS
-- ==========================================

SELECT setval(
    pg_get_serial_sequence('algoritmos.roles', 'role_id'),
    (SELECT MAX(role_id) FROM algoritmos.roles)
);

SELECT setval(
    pg_get_serial_sequence('algoritmos.careers', 'career_id'),
    (SELECT MAX(career_id) FROM algoritmos.careers)
);

SELECT setval(
    pg_get_serial_sequence('algoritmos.courses', 'course_id'),
    (SELECT MAX(course_id) FROM algoritmos.courses)
);

SELECT setval(
    pg_get_serial_sequence('algoritmos.difficulties', 'difficulty_id'),
    (SELECT MAX(difficulty_id) FROM algoritmos.difficulties)
);

SELECT setval(
    pg_get_serial_sequence('algoritmos.game_zones', 'zone_id'),
    (SELECT MAX(zone_id) FROM algoritmos.game_zones)
);

SELECT setval(
    pg_get_serial_sequence('algoritmos.exit_reasons', 'reason_id'),
    (SELECT MAX(reason_id) FROM algoritmos.exit_reasons)
);