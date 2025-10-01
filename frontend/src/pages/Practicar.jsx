import React, { useState, useEffect } from "react";
import { predict } from "../api";
import HandCapture from "../components/HandCapture";

export default function Practicar() {
  const [lastLandmarks, setLastLandmarks] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [operationSequence, setOperationSequence] = useState([]);
  const [operationResult, setOperationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🚀 ESTADO PARA ALMACENAR LA VOZ ALTERNATIVA SELECCIONADA
  const [spanishVoice, setSpanishVoice] = useState(null);

  const isOperator = (token) => ['+', '-', '*', '/'].includes(token);
  const isNumber = (token) => !isNaN(Number(token)) && Number.isInteger(Number(token)) && Number(token) >= 0 && Number(token) <= 9;

  /**
   * Carga las voces disponibles en el navegador y selecciona una voz alternativa en español.
   */
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        
        // 1. Filtrar solo voces en español
        const esVoices = availableVoices.filter(v => v.lang.startsWith('es'));
        
        if (esVoices.length > 0) {
          // 2. Intentar buscar una voz con nombre específico o que no sea la predeterminada
          const alternateVoice = esVoices.find(v => 
              v.name.includes('Spain') || 
              v.name.includes('Mexican') ||
              v.name.includes('Jorge') || 
              v.name.includes('Elena') ||
              v.default === false 
          ) || esVoices[0]; // Si no encuentra ninguna especial, usa la primera disponible.
          
          setSpanishVoice(alternateVoice);
        }
      };

      // Listener para asegurar que las voces se carguen cuando estén listas
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices(); // Intenta cargar inmediatamente
    }
  }, []);

  /**
   * Función para reproducir texto utilizando la voz alternativa seleccionada.
   */
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 🚀 ASIGNA LA VOZ AL OBJETO UTTERANCE
      if (spanishVoice) {
          utterance.voice = spanishVoice;
          utterance.lang = spanishVoice.lang;
      } else {
          // Fallback si no hay voz específica
          utterance.lang = 'es-ES'; 
      }
      
      utterance.rate = 1.0; 
      
      // Detiene cualquier voz anterior y reproduce la nueva
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("La síntesis de voz no es compatible con este navegador.");
    }
  };


  const handlePredict = async () => {
    if (isLoading) return; 

    if (lastLandmarks.length === 0) {
      const msg = "Por favor, asegúrate de que tu mano sea visible y detectable.";
      setMessage(`⚠️ ${msg}`);
      speak(msg);
      return;
    }
    
    setIsLoading(true);
    const initialMsg = "Pidiendo predicción al modelo...";
    setMessage(`🧠 ${initialMsg}`);
    speak(initialMsg);
    setPrediction(null);
    setOperationResult(null); 
    
    try {
      const data = await predict(lastLandmarks);
      if (data && !data.error) {
        setPrediction(data);
        const msg = `Predicción lista. Signo detectado: ${data.prediction}`;
        setMessage(`✅ ¡Predicción lista! Signo detectado: ${data.prediction}`);
        speak(msg);
      } else {
        const errorMsg = `Error de predicción: ${data?.error || "Revisa la conexión con el servidor o si el modelo está cargado."}`;
        setMessage(`❌ ${errorMsg}`);
        speak(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Fallo de red: No se pudo contactar el servicio de predicción.";
      setMessage(`❌ ${errorMsg}`);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const addToOperation = () => {
    if (!prediction) {
        const msg = "Necesitas predecir un valor o signo antes de agregarlo.";
        setMessage(`⚠️ ${msg}`);
        speak(msg);
        return;
    }

    const token = prediction.prediction;
    const seqLen = operationSequence.length;
    let newMsg = "";

    if (seqLen === 0) {
        if (isNumber(token)) {
            setOperationSequence([token]);
            newMsg = `Primer número, ${token}, agregado. Ahora, muestra un operador.`;
            setMessage(`Primer número (${token}) agregado. Ahora, muestra un operador (+, -, *, /).`);
        } else {
            newMsg = "Error, el primer elemento debe ser un número.";
            setMessage("❌ El primer elemento debe ser un número (0-9).");
            speak(newMsg); 
            return;
        }
    } else if (seqLen === 1) {
        if (isOperator(token)) {
            setOperationSequence((prev) => [...prev, token]);
            newMsg = `Operador, ${token}, agregado. Ahora, muestra el segundo número.`;
            setMessage(`Operador (${token}) agregado. Ahora, muestra el segundo número (0-9).`);
        } else {
            newMsg = "Error, el segundo elemento debe ser un operador.";
            setMessage("❌ El segundo elemento debe ser un operador (+, -, *, /).");
            speak(newMsg); 
            return;
        }
    } else if (seqLen === 2) {
        if (isNumber(token)) {
            setOperationSequence((prev) => [...prev, token]);
            newMsg = `Toda la secuencia está lista. Presiona el botón Calcular.`;
            setMessage(`Toda la secuencia está lista. Presiona '🧮 Calcular'.`);
        } else {
            newMsg = "Error, el tercer elemento debe ser un número.";
            setMessage("❌ El tercer elemento debe ser un número (0-9).");
            speak(newMsg); 
            return;
        }
    } else if (seqLen >= 3) {
        newMsg = "La operación ya está completa. Presiona Calcular o Reiniciar.";
        setMessage("⚠️ La operación ya está completa. Presiona Calcular o Reiniciar.");
        speak(newMsg); 
        return;
    }

    if (newMsg) speak(newMsg);
    setPrediction(null);
  };

  const calculateOperation = () => {
    if (operationSequence.length !== 3) {
        const msg = "Se requiere una secuencia completa (Número, Operador, Número) para calcular.";
        setMessage(`⚠️ ${msg}`);
        setOperationResult(null);
        speak(msg);
        return;
    }
    
    const [num1Str, op, num2Str] = operationSequence;
    const num1 = Number(num1Str);
    const num2 = Number(num2Str);
    
    if (!isNumber(num1Str) || !isOperator(op) || !isNumber(num2Str)) {
        const msg = "Error, la secuencia no es válida (espera: Número Operador Número).";
        setMessage(`❌ ${msg}`);
        setOperationResult("Error de secuencia");
        speak(msg);
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
    const resultMsg = `${num1Str} ${op} ${num2Str} es igual a ${result}`;
    setMessage(`✅ Cálculo finalizado: ${resultMsg}`);
    speak(`Cálculo finalizado. ${resultMsg}`);
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
                
                {/* CORRECCIÓN DE ALTURA APLICADA AQUÍ: height: '480px' */}
                <div 
                  className="mb-4 border rounded shadow-sm overflow-hidden"
                  style={{ 
                    maxWidth: '100%', 
                    height: '480px' 
                  }} 
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
                      const msg = "Sistema de calculadora reiniciado.";
                      setMessage(msg);
                      speak(msg);
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