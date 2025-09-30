import { useState } from "react";
import { predict } from "../api";
import HandCapture from "../components/HandCapture";

export default function Practicar() {
  const [lastLandmarks, setLastLandmarks] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [operationSequence, setOperationSequence] = useState([]);
  const [operationResult, setOperationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isOperator = (token) => ['+', '-', '*', '/'].includes(token);
  const isNumber = (token) => !isNaN(Number(token)) && Number.isInteger(Number(token)) && Number(token) >= 0 && Number(token) <= 9;

  const handlePredict = async () => {
    if (isLoading) return; 

    if (lastLandmarks.length === 0) {
      setMessage("⚠️ Por favor, asegúrate de que tu mano sea visible y detectable.");
      return;
    }
    
    setIsLoading(true);
    setMessage("🧠 Pidiendo predicción al modelo...");
    setPrediction(null);
    setOperationResult(null); 
    
    try {
      const data = await predict(lastLandmarks);
      if (data && !data.error) {
        setPrediction(data);
        setMessage(`✅ ¡Predicción lista! Signo detectado: ${data.prediction}`);
      } else {
        setMessage(`❌ Error de predicción: ${data?.error || "Revisa la conexión con el servidor o si el modelo está cargado."}`);
      }
    } catch (err) {
      setMessage("❌ Fallo de red: No se pudo contactar el servicio de predicción.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToOperation = () => {
    if (!prediction) {
        setMessage("⚠️ Necesitas predecir un valor o signo antes de agregarlo.");
        return;
    }

    const token = prediction.prediction;
    const seqLen = operationSequence.length;

    if (seqLen === 0) {
        if (isNumber(token)) {
            setOperationSequence([token]);
            setMessage(`Primer número (${token}) agregado. Ahora, muestra un operador (+, -, *, /).`);
        } else {
            setMessage("❌ El primer elemento debe ser un número (0-9).");
            return;
        }
    } else if (seqLen === 1) {
        if (isOperator(token)) {
            setOperationSequence((prev) => [...prev, token]);
            setMessage(`Operador (${token}) agregado. Ahora, muestra el segundo número (0-9).`);
        } else {
            setMessage("❌ El segundo elemento debe ser un operador (+, -, *, /).");
            return;
        }
    } else if (seqLen === 2) {
        if (isNumber(token)) {
            setOperationSequence((prev) => [...prev, token]);
            setMessage(`Toda la secuencia está lista. Presiona '🧮 Calcular'.`);
        } else {
            setMessage("❌ El tercer elemento debe ser un número (0-9).");
            return;
        }
    } else if (seqLen >= 3) {
        setMessage("⚠️ La operación ya está completa. Presiona Calcular o Reiniciar.");
        return;
    }

    setPrediction(null);
  };

  const calculateOperation = () => {
    if (operationSequence.length !== 3) {
        setMessage("⚠️ Se requiere una secuencia completa (Número, Operador, Número) para calcular.");
        setOperationResult(null);
        return;
    }
    
    const [num1Str, op, num2Str] = operationSequence;
    const num1 = Number(num1Str);
    const num2 = Number(num2Str);
    
    if (!isNumber(num1Str) || !isOperator(op) || !isNumber(num2Str)) {
        setMessage("❌ Error: La secuencia no es válida (espera: Número Operador Número).");
        setOperationResult("Error de secuencia");
        return;
    }
    
    let result;
    switch (op) {
      case "+":
        result = num1 + num2;
        break;
      case "-":
        result = num1 - num2;
        break;
      case "*":
        result = num1 * num2;
        break;
      case "/":
        result = num2 !== 0 ? (num1 / num2).toFixed(2) : "Error /0";
        break;
      default:
        result = "Operador inválido";
    }
    
    setOperationResult(result);
    setMessage(`✅ Cálculo finalizado: ${num1Str} ${op} ${num2Str} = ${result}`);
  };

  const getTokenClass = (token) => {
    if (isOperator(token)) return "bg-danger";
    if (isNumber(token)) return "bg-primary";
    return "bg-secondary";
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg p-4">
            <h1 className="text-center display-6 fw-bold mb-4">ZONA DE PRACTICAS / CALCULADORA </h1>

            <div className="row g-4">
              
              {/* === COLUMNA IZQUIERDA: CAPTURA DE MANO === */}
              <div className="col-md-6">
                <h3 className="fs-5 text-primary mb-3">Web cam </h3>
                
                {/* CORRECCIÓN APLICADA AQUÍ */}
                <div 
                  className="mb-4 border rounded shadow-sm overflow-hidden"
                  style={{ maxWidth: '100%', height: 'auto' }} 
                >
                  <HandCapture onResults={setLastLandmarks} />
                </div>
                
                {/* Panel de Predicción en Vivo */}
                {prediction && (
                    <div className="p-3 bg-light rounded border border-info">
                        <h4 className="fs-6 text-info mb-1">Última Predicción</h4>
                        <p className="mb-0 fw-bold fs-4">
                            {prediction.prediction}
                        </p>
                        <small className="text-muted">Confianza: {(prediction.confidence * 100).toFixed(1)}%</small>
                    </div>
                )}
              </div>

              {/* === COLUMNA DERECHA: CONTROL Y RESULTADOS === */}
              <div className="col-md-6">
                
                {/* --- 1. Botones de Control --- */}
                <h3 className="fs-5 text-success mb-3">Controles</h3>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <button 
                    className="btn btn-primary d-flex align-items-center" 
                    onClick={handlePredict}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Analizando...
                        </>
                    ) : (
                        "🤖 Predecir Seña"
                    )}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={addToOperation}
                    disabled={!lastLandmarks || operationSequence.length === 3 || isLoading}
                  >
                    ➕ Agregar a Operación
                  </button>
                  <button
                    className="btn btn-warning text-dark"
                    onClick={calculateOperation}
                    disabled={operationSequence.length < 3 || isLoading}
                  >
                    🧮 Calcular
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => {
                      setOperationSequence([]);
                      setOperationResult(null);
                      setPrediction(null);
                      setMessage("Sistema de calculadora reiniciado.");
                    }}
                  >
                    🔄 Reiniciar
                  </button>
                </div>
                
                {/* --- 2. Mensajes --- */}
                {message && (
                    <div
                        className={`alert ${
                            message.startsWith("✅") ? "alert-success" : 
                            message.startsWith("❌") ? "alert-danger" : 
                            "alert-info"
                        } fade show`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                {/* --- 3. Secuencia de la Operación (Diseño tipo chips) --- */}
                <div className="mt-4 p-3 border rounded bg-light">
                  <h4 className="fs-5 mb-3 text-secondary">Secuencia de la Operación (Número Op Número)</h4>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {operationSequence.length === 0 ? (
                      <span className="text-muted fst-italic">Muestra el primer número...</span>
                    ) : (
                      operationSequence.map((token, index) => (
                        <span 
                          key={index} 
                          className={`badge ${getTokenClass(token)} text-white fs-5 p-2`}
                        >
                          {token}
                        </span>
                      ))
                    )}
                    {/* Indicador de slots disponibles */}
                    {Array(3 - operationSequence.length).fill(0).map((_, index) => (
                         <span key={`slot-${index}`} className="badge bg-secondary-subtle text-dark border fs-5 p-2 opacity-50">?</span>
                    ))}
                  </div>
                </div>

                {/* --- 4. Resultado Final --- */}
                {operationResult !== null && (
                  <div className="mt-4 p-4 border rounded bg-success text-white shadow">
                    <h4 className="fs-4 mb-2">RESULTADO FINAL</h4>
                    <p className="display-4 fw-bold mb-0">
                      {operationResult}
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}