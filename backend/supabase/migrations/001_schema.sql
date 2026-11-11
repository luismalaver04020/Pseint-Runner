-- ============================================
-- MIGRACIÓN 001: CREAR ESQUEMA
-- Proyecto: PSeInt Runner
-- ============================================

CREATE SCHEMA IF NOT EXISTS algoritmos;

-- Permitir que los usuarios de Supabase
-- puedan utilizar el esquema.
GRANT USAGE ON SCHEMA algoritmos TO anon;
GRANT USAGE ON SCHEMA algoritmos TO authenticated;

-- Fin de la migración