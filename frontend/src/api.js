
const API_URL = import.meta.env.VITE_API_URL;

// Funciones existentes...
export async function saveLandmark(label, landmarks) {
  const res = await fetch(`${API_URL}/save_landmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, landmarks }),
  });
  return res.json();
}

export async function getProgress() {
  const res = await fetch(`${API_URL}/progress`);
  return res.json();
}

export async function trainModel() {
  const res = await fetch(`${API_URL}/train`, { method: "POST" });
  return res.json();
}

export async function predict(landmarks) {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks }),
  });
  return res.json();
}

export async function resetAll() {
  const res = await fetch(`${API_URL}/reset`, { method: "POST" });
  return res.json();
}

// 🔹 NUEVAS FUNCIONES PARA VISUALIZAR DATOS
export async function getBackendStatus() {
  const res = await fetch(`${API_URL}/`);
  return res.json();
}

export async function getLandmarksData() {
  const res = await fetch(`${API_URL}/api/landmarks`);
  return res.json();
}

export async function getLandmarksSummary() {
  const res = await fetch(`${API_URL}/api/landmarks/summary`);
  return res.json();
}

export async function getLandmarksByLabel(label) {
  const res = await fetch(`${API_URL}/api/landmarks/label/${label}`);
  return res.json();
}

export async function getHealthStatus() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}