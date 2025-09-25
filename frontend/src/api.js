const API_URL = "https://senias-edu-back.onrender.com";

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
