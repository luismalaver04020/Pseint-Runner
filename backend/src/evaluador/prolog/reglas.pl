% ============================================================================
%  JUEZ PSeInt EN PROLOG
%  Decide si el pseudocódigo de un alumno es correcto.
%
%  Node analiza y ejecuta el código (parser.js + interprete.js) y entrega a este
%  módulo HECHOS (estructura del programa, salidas de cada caso de prueba).
%  Aquí se aplican las REGLAS y se emite el veredicto. Este módulo no ejecuta
%  el código del alumno: solo razona sobre los datos que recibe.
%
%  Punto de entrada:   juzgar(+Entrada, -Salida)     (ambos son diccionarios)
%
%  Entrada = _{
%      programa:       [ [Linea, Tipo, Texto], ... ],        % del parser (Tipo en MAYÚSCULAS)
%      reglas:         _{ requiere, prohibe, minimos, requiere_texto, prohibe_texto,
%                         ignorar_mayusculas, tolerancia, modo },
%      casos:          [ _{id, visible, estado, mensaje, esperado, obtenido}, ... ],
%      error_sintaxis: 'mensaje'                              % opcional
%  }
%  Salida = _{ veredicto, motivos, casos, casos_ok, casos_total }
% ============================================================================

:- module(juez_pseint, [juzgar/2]).
:- use_module(library(lists)).
:- use_module(library(apply)).

% ----------------------------------------------------------------------------
%  Utilidades
% ----------------------------------------------------------------------------

% opcional(+Dict, +Clave, +Defecto, -Valor)
opcional(Dict, Clave, Defecto, Valor) :-
    (   is_dict(Dict), get_dict(Clave, Dict, V0) -> Valor = V0 ; Valor = Defecto ).

a_atomo(Texto, Atomo) :- atom(Texto), !, Atomo = Texto.
a_atomo(Texto, Atomo) :- string(Texto), !, atom_string(Atomo, Texto).
a_atomo(Texto, Atomo) :- term_to_atom(Texto, Atomo).

minusculas(A, M) :- a_atomo(A, Atomo), downcase_atom(Atomo, M).

% Texto "limpio": sin espacios en los bordes y con espacios internos colapsados.
limpiar(A, Limpio) :-
    a_atomo(A, Atomo),
    atom_string(Atomo, S),
    split_string(S, " \t", " \t", Partes0),
    exclude(==(""), Partes0, Partes),
    atomic_list_concat(Partes, ' ', Limpio).

% ----------------------------------------------------------------------------
%  Comparación de líneas de salida
%  Dos líneas son equivalentes si, ya limpias (y sin distinguir mayúsculas si la
%  regla lo pide), son iguales, o si ambas son números con diferencia <= tolerancia.
% ----------------------------------------------------------------------------

equivalentes(Reglas, A, B) :-
    limpiar(A, LA), limpiar(B, LB),
    opcional(Reglas, ignorar_mayusculas, si, IM),
    (   IM == si -> minusculas(LA, NA), minusculas(LB, NB) ; NA = LA, NB = LB ),
    (   NA == NB -> true
    ;   numero_estricto(NA, X), numero_estricto(NB, Y),
        opcional(Reglas, tolerancia, 0.000001, Tol),
        abs(X - Y) =< Tol
    ).

% Solo acepta números decimales simples: -?dígitos(.dígitos)?
numero_estricto(Atomo, Numero) :-
    a_atomo(Atomo, Atom),
    atom_codes(Atom, Codigos),
    phrase(numero_decimal, Codigos),
    number_codes(Numero, Codigos).

numero_decimal --> signo, digitos1, fraccion.
signo --> "-", !.
signo --> "+", !.
signo --> [].
digitos1 --> digito, digitos0.
digitos0 --> digito, !, digitos0.
digitos0 --> [].
digito --> [C], { code_type(C, digit) }.
fraccion --> ".", !, digitos1.
fraccion --> [].

% ----------------------------------------------------------------------------
%  Modos de comparación entre lo esperado y lo obtenido
%    exacto       : mismas líneas, en el mismo orden y sin líneas de más.
%    subsecuencia : las esperadas aparecen en orden (puede haber líneas extra).
%    contiene     : las esperadas aparecen en cualquier orden.
%    numeros      : solo importan los NÚMEROS: los esperados deben aparecer, en orden,
%                   entre los números que escribió el programa. Ignora el texto que los
%                   rodea ("La suma es: 7" cuenta igual que "7"). Útil cuando el
%                   enunciado no fija el formato de la salida.
% ----------------------------------------------------------------------------

coincide(exacto, R, Esperado, Obtenido) :-
    same_length(Esperado, Obtenido),
    maplist(equivalentes(R), Esperado, Obtenido).
coincide(subsecuencia, R, Esperado, Obtenido) :-
    subsecuencia(R, Esperado, Obtenido).
coincide(contiene, R, Esperado, Obtenido) :-
    forall(member(E, Esperado), ( member(O, Obtenido), equivalentes(R, E, O) )).
coincide(numeros, R, Esperado, Obtenido) :-
    numeros_de_lineas(Esperado, NE),
    numeros_de_lineas(Obtenido, NO),
    NE \= [],
    subsecuencia_numerica(R, NE, NO).

% Modo semantico: conserva cantidad/orden de líneas; si ambas líneas contienen
% números compara sus valores, aunque cambie el texto alrededor. Si no, compara
% el texto completo sin distinguir mayúsculas.
coincide(semantico, R, Esperado, Obtenido) :-
    same_length(Esperado, Obtenido),
    maplist(equivalentes_semanticas(R), Esperado, Obtenido).

equivalentes_semanticas(R, A, B) :-
    numeros_de_linea(A, NA), numeros_de_linea(B, NB),
    NA \= [], NB \= [], !,
    same_length(NA, NB),
    opcional(R, tolerancia, 0.000001, Tol),
    maplist(casi_igual(Tol), NA, NB).
equivalentes_semanticas(R, A, B) :- equivalentes(R, A, B).
casi_igual(Tol, A, B) :- abs(A - B) =< Tol.

numeros_de_lineas(Lineas, Numeros) :-
    findall(N, ( member(L, Lineas), numeros_de_linea(L, Ns), member(N, Ns) ), Numeros).

numeros_de_linea(Atomo, Numeros) :-
    a_atomo(Atomo, Atom),
    atom_codes(Atom, Codigos),
    phrase(numeros_en(Numeros), Codigos).

numeros_en([N|Ns]) --> token_numero(Cs), !, { number_codes(N, Cs) }, numeros_en(Ns).
numeros_en(Ns)     --> [_], !, numeros_en(Ns).
numeros_en([])     --> [].

token_numero(Cs) -->
    (   [45] -> { Signo = [45] } ; { Signo = [] } ),          % 45 = '-'
    digitos_cs(Ent),
    (   [46], digitos_cs(Frac) -> { Dec = [46|Frac] } ; { Dec = [] } ),   % 46 = '.'
    { append([Signo, Ent, Dec], Cs) }.

digitos_cs([C|Cs]) --> [C], { code_type(C, digit) }, digitos_resto(Cs).
digitos_resto([C|Cs]) --> [C], { code_type(C, digit) }, !, digitos_resto(Cs).
digitos_resto([]) --> [].

subsecuencia_numerica(_, [], _).
subsecuencia_numerica(R, [E|Es], [O|Os]) :-
    opcional(R, tolerancia, 0.000001, Tol),
    (   abs(E - O) =< Tol -> subsecuencia_numerica(R, Es, Os) ; subsecuencia_numerica(R, [E|Es], Os) ).

subsecuencia(_, [], _).
subsecuencia(R, [E|Es], [O|Os]) :-
    (   equivalentes(R, E, O) -> subsecuencia(R, Es, Os) ; subsecuencia(R, [E|Es], Os) ).

% ----------------------------------------------------------------------------
%  Un caso de prueba
% ----------------------------------------------------------------------------

juzgar_caso(Reglas, Caso, Resultado) :-
    opcional(Caso, id, 0, Id),
    opcional(Caso, visible, si, Visible),
    opcional(Caso, estado, ok, Estado),
    opcional(Caso, mensaje, '', Mensaje),
    opcional(Caso, esperado, [], Esperado),
    opcional(Caso, obtenido, [], Obtenido),
    opcional(Reglas, modo, exacto, Modo),
    (   Estado == error
    ->  Paso = no, Causa = error_ejecucion
    ;   coincide(Modo, Reglas, Esperado, Obtenido)
    ->  Paso = si, Causa = ninguna
    ;   Paso = no, Causa = salida_distinta
    ),
    Resultado = _{ id: Id, visible: Visible, paso: Paso, causa: Causa, detalle: Mensaje }.

% ----------------------------------------------------------------------------
%  Reglas de estructura (qué construcciones debe / no debe usar el programa)
% ----------------------------------------------------------------------------

tipos_del_programa(Programa, Tipos) :-
    findall(T, ( member([_, T, _], Programa), T \== 'COMENTARIO' ), Tipos).

cuenta(Tipos, Tipo, N) :- include(==(Tipo), Tipos, L), length(L, N).
es_aprobado(R) :- get_dict(paso, R, si).

% Texto ejecutable (sin comentarios), en minúsculas, para buscar palabras.
textos_del_programa(Programa, Textos) :-
    findall(M, ( member([_, T, X], Programa), T \== 'COMENTARIO', minusculas(X, M) ), Textos).

% La palabra aparece completa (no dentro de otro identificador).
contiene_palabra(Textos, Palabra) :-
    minusculas(Palabra, P),
    member(Texto, Textos),
    atom_length(P, LP),
    sub_atom(Texto, Antes, LP, Despues, P),
    limite_ok(Texto, P, Antes, Despues).

limite_ok(Texto, P, Antes, Despues) :-
    (   primera_es_alfanumerica(P)
    ->  \+ ( Antes > 0, A1 is Antes - 1, sub_atom(Texto, A1, 1, _, C), es_alfanum(C) )
    ;   true ),
    (   ultima_es_alfanumerica(P)
    ->  atom_length(Texto, Largo),
        Pos is Largo - Despues,
        \+ ( Despues > 0, sub_atom(Texto, Pos, 1, _, C2), es_alfanum(C2) )
    ;   true ).

primera_es_alfanumerica(P) :- sub_atom(P, 0, 1, _, C), es_alfanum(C).
ultima_es_alfanumerica(P) :- sub_atom(P, _, 1, 0, C), es_alfanum(C).
es_alfanum(C) :- ( C == '_' -> true ; char_type(C, alnum) ).

revisar_estructura(Programa, Reglas, Motivos) :-
    tipos_del_programa(Programa, Tipos),
    textos_del_programa(Programa, Textos),
    opcional(Reglas, requiere,       [], Requiere),
    opcional(Reglas, prohibe,        [], Prohibe),
    opcional(Reglas, minimos,      _{}, Minimos),
    opcional(Reglas, requiere_texto, [], RTexto),
    opcional(Reglas, prohibe_texto,  [], PTexto),
    findall(_{codigo: falta_estructura, tipo: T},
            ( member(T, Requiere), \+ memberchk(T, Tipos) ), M1),
    findall(_{codigo: estructura_prohibida, tipo: T},
            ( member(T, Prohibe), memberchk(T, Tipos) ), M2),
    dict_pairs(Minimos, _, Pares),
    findall(_{codigo: pocas_estructuras, tipo: T, minimo: Min, encontrado: N},
            ( member(T-Min, Pares), cuenta(Tipos, T, N), N < Min ), M3),
    findall(_{codigo: falta_palabra, palabra: W},
            ( member(W, RTexto), \+ contiene_palabra(Textos, W) ), M4),
    findall(_{codigo: palabra_prohibida, palabra: W},
            ( member(W, PTexto), contiene_palabra(Textos, W) ), M5),
    append([M1, M2, M3, M4, M5], Motivos).

% ----------------------------------------------------------------------------
%  Punto de entrada
% ----------------------------------------------------------------------------

% 1) El código ni siquiera pasó el análisis sintáctico.
juzgar(Entrada, Salida) :-
    get_dict(error_sintaxis, Entrada, Mensaje),
    !,
    opcional(Entrada, casos, [], Casos),
    length(Casos, Total),
    Salida = _{ veredicto: incorrecto,
                motivos: [ _{codigo: error_sintaxis, detalle: Mensaje} ],
                casos: [], casos_ok: 0, casos_total: Total }.

% 2) Análisis correcto: se aplican las reglas de estructura y los casos.
juzgar(Entrada, Salida) :-
    get_dict(programa, Entrada, Programa),
    opcional(Entrada, reglas, _{}, Reglas),
    opcional(Entrada, casos, [], Casos),
    revisar_estructura(Programa, Reglas, MotivosEstructura),
    maplist(juzgar_caso(Reglas), Casos, Resultados),
    include(es_aprobado, Resultados, Aprobados),
    length(Aprobados, CasosOk),
    length(Resultados, CasosTotal),
    findall(_{codigo: Causa, caso: Id, detalle: D},
            ( member(R, Resultados), get_dict(paso, R, no),
              get_dict(causa, R, Causa), get_dict(id, R, Id), get_dict(detalle, R, D) ),
            MotivosCasos),
    append(MotivosEstructura, MotivosCasos, Motivos),
    (   Motivos == [] -> Veredicto = correcto ; Veredicto = incorrecto ),
    Salida = _{ veredicto: Veredicto, motivos: Motivos, casos: Resultados,
                casos_ok: CasosOk, casos_total: CasosTotal }.
