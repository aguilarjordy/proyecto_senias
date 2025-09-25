
const API_URL = import.meta.env.VITE_API_URL;


// Función auxiliar para manejar todas las peticiones
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API error:", err.message);
    return { error: err.message };
  }
}

// Guardar landmarks
export function saveLandmark(label, landmarks) {
  return apiRequest("/save_landmark", {
    method: "POST",
    body: JSON.stringify({ label, landmarks }),
  });
}

// Obtener progreso
export function getProgress() {
  return apiRequest("/progress");
}

// Entrenar modelo
export function trainModel() {
  return apiRequest("/train", { method: "POST" });
}

// Predecir
export function predict(landmarks) {
  return apiRequest("/predict", {
    method: "POST",
    body: JSON.stringify({ landmarks }),
  });
}

// Resetear todo
export function resetAll() {
  return apiRequest("/reset", { method: "POST" });
}
