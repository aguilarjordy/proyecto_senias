import { useState } from "react";
import { trainModel, getProgress } from "../api";

export default function Entrenamiento() {
  const [progress, setProgress] = useState(null); 
  const [trainInfo, setTrainInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const MIN_SAMPLES = 50; 

  const getProgressColor = (count) => {
    if (count >= MIN_SAMPLES) return "bg-success";
    if (count > MIN_SAMPLES / 2) return "bg-warning";
    return "bg-danger";
  };

  const handleProgress = async () => {
    setMessage("Buscando las muestras registradas... Esto puede tardar un momento.");
    setIsLoading(true);
    try {
      const res = await getProgress();
      if (res && !res.error) {
        setProgress(res);
        const totalLabels = Object.keys(res).length;
        setMessage(`✨ ¡Éxito! Se encontraron ${totalLabels} etiquetas listas para entrenar.`);
      } else {
        setMessage(`❌ Fallo al obtener el progreso: ${res?.error || "Error de servidor desconocido."} ¿El backend está activo?`);
      }
    } catch (err) {
      setMessage("❌ Error de conexión. No se pudo contactar el servidor de la API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!progress || Object.keys(progress).length === 0) {
        setMessage("⚠️ ¡Espera! Carga el progreso (Ver Progreso) para confirmar que tienes muestras antes de entrenar.");
        return;
    }
    
    setMessage("🧠 Iniciando el entrenamiento del modelo... ¡Proceso crítico en curso! No cierres esta ventana.");
    setIsLoading(true);
    setTrainInfo(null);
    try {
      const data = await trainModel();
      if (data && !data.error) {
        setMessage(`🚀 ¡Entrenamiento finalizado con éxito! La precisión obtenida es del ${(data.accuracy * 100).toFixed(2)}%.`);
        setTrainInfo(data);
      } else {
        setMessage(`❌ El entrenamiento falló: ${data?.error || "El servidor detuvo el proceso por un error interno."} Revisa tus datos.`);
      }
    } catch (err) {
      setMessage("❌ Error grave de conexión durante el entrenamiento. El proceso pudo haber fallado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10"> 
          
          {/* Título y descripción */}
          <div className="text-center mb-5 p-3 bg-light rounded shadow-sm">
            <h1 className="display-6 fw-bold">⚡ Entrenamiento del Modelo</h1>
            <p className="text-muted mb-0">
              Administra tus muestras y entrena la IA de reconocimiento de señas.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-center gap-3 mb-5">
            {/* BOTÓN VER PROGRESO */}
            <button 
                onClick={handleProgress} 
                className="btn btn-primary btn-lg d-flex align-items-center"
                disabled={isLoading}
            >
                {/* Visualización dinámica de carga */}
                {isLoading && message.includes("Buscando") ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Cargando...
                    </>
                ) : (
                    "📊 Ver Progreso"
                )}
            </button>
            {/* BOTÓN ENTRENAR MODELO */}
            <button 
                onClick={handleTrain} 
                className="btn btn-success btn-lg d-flex align-items-center"
                disabled={isLoading}
            >
                {/* Visualización dinámica de carga */}
                {isLoading && message.includes("Iniciando") ? (
                    <>
                        <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
                        Entrenando...
                    </>
                ) : (
                    "⚡ Entrenar Modelo"
                )}
            </button>
          </div>

          {/* Mensajes de feedback */}
          {message && (
            <div 
                className={`alert text-center mb-5 ${
                    message.includes("✅") || message.includes("✨") || message.includes("🚀") ? 'alert-success' : 
                    message.includes("❌") ? 'alert-danger' : 
                    'alert-info'
                }`} 
                role="alert"
            >
              {message}
            </div>
          )}

          {/* Contenido principal en dos columnas */}
          <div className="row g-4">
            
            {/* === COLUMNA IZQUIERDA: PROGRESO DE MUESTRAS === */}
            <div className="col-md-6">
              <div className="card shadow-lg h-100 border-primary">
                <div className="card-header bg-primary text-white fw-bold">
                  📊 Progreso de Muestras
                </div>
                <div className="card-body">
                  {/* Carga dinámica en el contenido */}
                  {isLoading && message.includes("Buscando") ? (
                      <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Cargando progreso...</span>
                          </div>
                          <p className="text-muted mt-3">Analizando la base de datos de muestras...</p>
                      </div>
                  ) : progress && Object.keys(progress).length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {Object.entries(progress).map(([lbl, count]) => {
                        const percent = Math.min(100, (count / MIN_SAMPLES) * 100);
                        return (
                          <li
                            key={lbl}
                            className="list-group-item d-flex flex-column bg-transparent px-0"
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold">{lbl}</span>
                              <span className={`badge text-bg-${count >= MIN_SAMPLES ? 'success' : 'secondary'}`}>{count} muestras</span>
                            </div>
                            
                            {/* Barra de progreso visual */}
                            <div className="progress" style={{ height: '8px' }}>
                              <div
                                className={`progress-bar ${getProgressColor(count)}`}
                                role="progressbar"
                                style={{ width: `${percent}%` }}
                                aria-valuenow={count}
                                aria-valuemin="0"
                                aria-valuemax={MIN_SAMPLES}
                              ></div>
                            </div>
                            <small className="text-muted mt-1">Meta: {MIN_SAMPLES} muestras ({percent.toFixed(0)}%)</small>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                       <i className="bi bi-bar-chart-fill text-primary fs-1 mb-3"></i> 
                       <p className="text-muted">Presiona <strong>"Ver Progreso"</strong> para cargar los datos de tus muestras.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === COLUMNA DERECHA: RESULTADOS DEL ENTRENAMIENTO === */}
            <div className="col-md-6">
              <div className="card shadow-lg h-100 border-success">
                <div className="card-header bg-success text-white fw-bold">
                  ⚡ Resultados del Entrenamiento
                </div>
                <div className="card-body d-flex flex-column justify-content-between">
                  {/* Carga dinámica en el contenido */}
                  {isLoading && message.includes("Iniciando") ? (
                      <div className="text-center py-5">
                          <div className="spinner-grow text-success" role="status">
                              <span className="visually-hidden">Entrenando el modelo...</span>
                          </div>
                          <p className="text-muted mt-3 fw-bold">¡El proceso de aprendizaje está en marcha!</p>
                      </div>
                  ) : trainInfo ? (
                    <div>
                      <h4 className="card-title text-success mb-3">
                        ¡Entrenamiento completado!
                      </h4>
                      
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                          Precisión del Modelo:
                          <span className={`badge text-bg-${trainInfo.accuracy >= 0.8 ? 'success' : 'warning'} fs-6`}>
                            {(trainInfo.accuracy * 100).toFixed(2)}%
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                          Muestras Utilizadas:
                          <span className="badge text-bg-info text-dark fs-6">
                            {trainInfo.total_samples || 'N/A'}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                          Etiquetas Entrenadas:
                          <span className="badge bg-secondary fs-6">
                            {trainInfo.labels ? trainInfo.labels.length : 'N/A'}
                          </span>
                        </li>
                      </ul>
                      <small className="text-muted mt-3 d-block">
                          <strong>Recomendación:</strong> Mantén la precisión por encima del 80% para un buen rendimiento.
                      </small>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-cpu-fill text-success fs-1 mb-3"></i> 
                      <p className="text-muted">Aún no se ha lanzado el entrenamiento. Presiona <strong>"Entrenar Modelo"</strong> para empezar.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}