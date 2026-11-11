-- Los casos de la pregunta de matriz deben incluir M, N y todos los valores
-- que el programa lee de la matriz. Se corrigen las variantes U3-HC del reto.
UPDATE algoritmos.questions
SET evaluation_config = '{
  "casos": [
    {
      "entradas": ["2", "3", "7", "2", "3", "7", "4", "5"],
      "salida": ["1"],
      "visible": true
    },
    {
      "entradas": ["3", "3", "5", "1", "2", "3", "5", "4", "6", "7", "5"],
      "salida": ["3"],
      "visible": true
    },
    {
      "entradas": ["4", "2", "1", "2", "3", "9", "9", "6", "7", "9"],
      "salida": ["3"],
      "visible": false
    }
  ],
  "estructura": {
    "requiere": ["DECLARACION", "LECTURA", "ESCRITURA", "PARA", "CONDICIONAL"]
  },
  "comparacion": {
    "modo": "numeros",
    "tolerancia": 0.000001,
    "ignorar_mayusculas": true
  }
}'::jsonb
WHERE label IN ('U3-HC-119', 'U3-HC-199', 'U3-HC-219', 'U3-HC-299');
