SELECT
    p.proname AS funcion,
    pg_get_function_identity_arguments(p.oid) AS argumentos,
    pg_get_function_result(p.oid) AS retorno,
    p.provolatile AS volatilidad,
    p.prosecdef AS security_definer,
    p.proconfig AS configuracion,
    pg_get_functiondef(p.oid) AS codigo_sql
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'algoritmos'
ORDER BY p.proname, argumentos;