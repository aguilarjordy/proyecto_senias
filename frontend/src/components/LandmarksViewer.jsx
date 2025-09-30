// src/LandmarksViewer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getLandmarksSummary, getBackendStatus } from "../api";
import "./LandmarksViewers.css";

const LandmarksViewer = () => {
  const [summary, setSummary] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, summaryData] = await Promise.all([
        getBackendStatus(),
        getLandmarksSummary()
      ]);

      if (statusData?.error) {
        setBackendStatus({ error: statusData.error });
      } else {
        // manejo flexible: tu backend usa "Mensaje"/"Estado" o "message"/"status"
        setBackendStatus({
          message: statusData?.message ?? statusData?.Mensaje ?? null,
          status: statusData?.status ?? statusData?.Estado ?? null,
          timestamp: statusData?.timestamp ?? null
        });
      }

      if (summaryData?.error) {
        setSummary(null);
        setError(summaryData.error);
      } else {
        setSummary(summaryData);
      }
    } catch (e) {
      console.error("Error loading data:", e);
      setError("Error de conexión al backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <div className="landmarks-viewer"><div className="loading">Cargando datos del backend...</div></div>;
  }

  if (error) {
    return <div className="landmarks-viewer"><div className="error">Error: {error}</div><button onClick={loadData}>Reintentar</button></div>;
  }

  const total = summary?.summary?.total_samples ?? 0;
  const labels = summary?.summary?.labels ?? {};

  return (
    <div className="landmarks-viewer">
      <div className="viewer-header">
        <h2>📊 Resumen Rápido de Landmarks</h2>
        <p>Datos almacenados en el backend</p>
        <button onClick={loadData} className="refresh-btn">🔄 Actualizar</button>
      </div>

      <div className="status-card">
        <h3>🚀 Estado del Backend</h3>
        <p><strong>Mensaje:</strong> {backendStatus?.message ?? "—"}</p>
        <p><strong>Estado:</strong> {backendStatus?.status ?? "—"}</p>
        <p><strong>Timestamp:</strong> {backendStatus?.timestamp ? new Date(backendStatus.timestamp).toLocaleString() : "—"}</p>
      </div>

      <div className="tabs">
        <button className={activeTab === "summary" ? "active" : ""} onClick={() => setActiveTab("summary")}>📈 Resumen</button>
        <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>📊 Estadísticas</button>
      </div>

      <div className="tab-content">
        {activeTab === "summary" && (
          <div className="summary-tab">
            <h3>📈 Resumen General</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total de Muestras</h4>
                <span className="stat-number">{total}</span>
              </div>
              <div className="stat-card">
                <h4>Etiquetas Únicas</h4>
                <span className="stat-number">{Object.keys(labels).length}</span>
              </div>
              <div className="stat-card">
                <h4>Estado</h4>
                <span className="stat-status">
                  {total > 10 ? '✅ Entrenable' : '⏳ Necesita más datos'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="stats-tab">
            <h3>📊 Distribución por Etiqueta</h3>
            {Object.keys(labels).length > 0 ? (
              <div className="labels-list">
                {Object.entries(labels).map(([lbl, count]) => (
                  <div key={lbl} className="label-item">
                    <span className="label-name">{lbl}</span>
                    <span className="label-count">{count} muestras</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(count / (total || 1)) * 100}%` }}></div>
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

      <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
        💡 <strong>Optimizado:</strong> Carga sólo el resumen para no pedir todos los datos.
      </div>
    </div>
  );
};

export default LandmarksViewer;
