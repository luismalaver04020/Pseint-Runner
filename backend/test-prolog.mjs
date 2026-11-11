import SWIPL from "swipl-wasm";

async function main() {
    console.log("Iniciando motor Prolog...");

    const swipl = await SWIPL({
        arguments: ["-q"]
    });

    console.log("Motor Prolog iniciado correctamente.");

    const resultado = swipl.prolog
        .query("member(X, [a, b, c]).")
        .once();

    console.log("Resultado de la consulta:", resultado.X);
}

main().catch(error => {
    console.error("Error al ejecutar Prolog:", error);
});