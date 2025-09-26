import React, { useState, useEffect, useCallback } from "react";
import { getLandmarksSummary, getBackendStatus } from "./api";
import "./LandmarksViewers.css"; // 🔹 Usamos tu CSS existente

const LandmarksViewer = () => {
  const [summary, setSummary] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  // 🔹 OPTIMIZADO: useCallback para evitar re-renders innecesarios
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // 🔹 CARGAR SOLO LO NECESARIO (más rápido)
      const [statusData, summaryData] = await Promise.all([
        getBackendStatus(),
        getLandmarksSummary() // 🔹 Solo resumen, no todos los datos
      ]);
      
      setBackendStatus(statusData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <h2>📊 Resumen Rápido de Landmarks</h2>
        <p>Datos almacenados en el backend</p>
        <button onClick={loadData} className="refresh-btn">
          🔄 Actualizar
        </button>
      </div>

      {/* Estado del backend */}
      <div className="status-card">
        <h3>🚀 Estado del Backend</h3>
        <p><strong>Mensaje:</strong> {backendStatus?.message}</p>
        <p><strong>Estado:</strong> {backendStatus?.status}</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Navegación por pestañas (simplificada) */}
      <div className="tabs">
        <button 
          className={activeTab === "summary" ? "active" : ""}
          onClick={() => setActiveTab("summary")}
        >
          📈 Resumen
        </button>
        <button 
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          📊 Estadísticas
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div className="tab-content">
        {activeTab === "summary" && (
          <div className="summary-tab">
            <h3>📈 Resumen General</h3>
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
                    {summary.summary?.total_samples > 10 ? '✅ Entrenable' : '⏳ Necesita más datos'}
                  </span>
                </div>
              </div>
            ) : (
              <p>Error cargando estadísticas</p>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="stats-tab">
            <h3>📊 Distribución por Etiqueta</h3>
            {summary?.success ? (
              <div className="labels-list">
                {Object.entries(summary.summary?.labels || {}).map(([label, count]) => (
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
            ) : (
              <p className="no-data">No hay datos disponibles</p>
            )}
          </div>
        )}
      </div>

      {/* Información de rendimiento */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        background: '#f8fafc', 
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: '#666',
        textAlign: 'center'
      }}>
        💡 <strong>Optimizado para velocidad:</strong> Carga solo datos esenciales
      </div>
    </div>
  );
};

export default LandmarksViewer;