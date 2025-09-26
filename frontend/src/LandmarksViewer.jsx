import React, { useState, useEffect } from "react";
import { getLandmarksData, getLandmarksSummary, getBackendStatus } from "./api";
import "./LandmarksViewers.css"; // Crearemos este CSS

const LandmarksViewer = () => {
  const [landmarks, setLandmarks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, summaryData, landmarksData] = await Promise.all([
        getBackendStatus(),
        getLandmarksSummary(),
        getLandmarksData()
      ]);
      
      setBackendStatus(statusData);
      setSummary(summaryData);
      setLandmarks(landmarksData.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="landmarks-viewer">
        <div className="loading">Cargando datos del backend...</div>
      </div>
    );
  }

  return (
    <div className="landmarks-viewer">
      <div className="viewer-header">
        <h2>📊 Visualizador de Landmarks</h2>
        <p>Datos almacenados en el backend de Render</p>
        <button onClick={loadData} className="refresh-btn">
          🔄 Actualizar
        </button>
      </div>

      {/* Estado del backend */}
      <div className="status-card">
        <h3>🚀 Estado del Backend</h3>
        <p><strong>Mensaje:</strong> {backendStatus?.message}</p>
        <p><strong>Estado:</strong> {backendStatus?.status}</p>
        <p><strong>URL:</strong> {window.location.origin}</p>
      </div>

      {/* Navegación por pestañas */}
      <div className="tabs">
        <button 
          className={activeTab === "summary" ? "active" : ""}
          onClick={() => setActiveTab("summary")}
        >
          📈 Resumen
        </button>
        <button 
          className={activeTab === "data" ? "active" : ""}
          onClick={() => setActiveTab("data")}
        >
          🗃️ Datos Completos
        </button>
        <button 
          className={activeTab === "raw" ? "active" : ""}
          onClick={() => setActiveTab("raw")}
        >
          🔍 JSON Raw
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div className="tab-content">
        {activeTab === "summary" && (
          <div className="summary-tab">
            <h3>📊 Estadísticas de Datos</h3>
            {summary?.success ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total de Muestras</h4>
                  <span className="stat-number">{summary.summary?.total_samples || 0}</span>
                </div>
                <div className="stat-card">
                  <h4>Etiquetas Únicas</h4>
                  <span className="stat-number">{summary.summary?.unique_labels || 0}</span>
                </div>
                <div className="stat-card">
                  <h4>Estado</h4>
                  <span className="stat-status">
                    {summary.summary?.total_samples > 10 ? "✅ Entrenable" : "⏳ Necesita más datos"}
                  </span>
                </div>
              </div>
            ) : (
              <p>Error cargando estadísticas</p>
            )}

            <h4>Muestras por Etiqueta</h4>
            <div className="labels-list">
              {Object.entries(summary?.summary?.labels || {}).map(([label, count]) => (
                <div key={label} className="label-item">
                  <span className="label-name">{label}</span>
                  <span className="label-count">{count} muestras</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(count / (summary.summary?.total_samples || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="data-tab">
            <h3>🗃️ Datos de Landmarks ({landmarks.length} muestras)</h3>
            <div className="data-grid">
              {landmarks.map((landmark, index) => (
                <div key={index} className="landmark-card">
                  <div className="card-header">
                    <strong>Muestra {index + 1}</strong>
                    <span className="label-badge">{landmark.label}</span>
                  </div>
                  <div className="card-content">
                    <p><strong>Primeros valores:</strong> {Object.values(landmark).slice(0, 3).map(v => v?.toFixed?.(3) || v).join(", ")}...</p>
                    <p><strong>Total de características:</strong> {Object.keys(landmark).length - 1}</p>
                  </div>
                </div>
              ))}
            </div>
            {landmarks.length === 0 && (
              <p className="no-data">No hay datos de landmarks aún. Usa la captura automática para agregar muestras.</p>
            )}
          </div>
        )}

        {activeTab === "raw" && (
          <div className="raw-tab">
            <h3>🔍 Datos en JSON</h3>
            <pre className="json-view">
              {JSON.stringify(landmarks, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandmarksViewer;