const API_URL = "http://localhost:5000"; // cambia si lo subes

// Guardar landmarks
export async function saveLandmark(label, landmarks) {
  const res = await fetch(`${API_URL}/save_landmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, landmarks }),
  });
  return res.json();
}

// Ver progreso
export async function getProgress() {
  const res = await fetch(`${API_URL}/progress`);
  return res.json();
}

// Entrenar modelo
export async function trainModel() {
  const res = await fetch(`${API_URL}/train`, {
    method: "POST",
  });
  return res.json();
}

// Predecir
export async function predictLandmark(landmarks) {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks }),
  });
  return res.json();
}
