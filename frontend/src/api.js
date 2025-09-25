// src/api.js
const BASE = "http://localhost:5000";

export async function saveLandmark(label, landmarks) {
  const res = await fetch(`${BASE}/save_landmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, landmarks }),
  });
  return res.json();
}

export async function getProgress() {
  const res = await fetch(`${BASE}/progress`);
  return res.json();
}

export async function trainModel() {
  const res = await fetch(`${BASE}/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  return res.json();
}

export async function predict(landmarks) {
  const res = await fetch(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks }),
  });
  return res.json();
}

export async function resetAll() {
  const res = await fetch(`${BASE}/reset`, { method: "POST" });
  return res.json();
}
