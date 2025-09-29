const API_URL = import.meta.env.VITE_API_URL;

/**
 * Petición centralizada con timeout y manejo uniforme de errores.
 */
async function request(path, options = {}) {
  const url = API_URL + (path.startsWith("/") ? path : "/" + path);
  const timeoutMs = options.timeout ?? 15000;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      let body;
      try {
        body = contentType.includes("application/json") ? await res.json() : await res.text();
      } catch (e) {
        body = res.statusText || "Error desconocido";
      }
      const message = (body && (body.error || body.message)) || String(body) || res.statusText;
      return { error: message };
    }

    if (contentType.includes("application/json")) return await res.json();
    else return { data: await res.text() };
  } catch (err) {
    clearTimeout(id);
    if (err.name === "AbortError") return { error: "Timeout: la petición tardó demasiado" };
    return { error: err.message || "Error de red" };
  }
}

/* --- Funciones exportadas --- */
export async function saveLandmark(label, landmarks) {
  return request("/save_landmark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, landmarks }),
    timeout: 10000
  });
}

export async function getProgress() {
  return request("/progress", { method: "GET", timeout: 8000 });
}

export async function trainModel() {
  return request("/train", { method: "POST", timeout: 120000 });
}

// Función predict actualizada
export async function predict(handsArray) {
  const payload = { landmarks: handsArray.slice(0, 2) }; // máximo 2 manos
  return request("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    timeout: 10000
  });
}

export async function resetAll() {
  return request("/reset", { method: "POST", timeout: 15000 });
}

export async function getBackendStatus() {
  return request("/", { method: "GET", timeout: 8000 });
}

export async function getLandmarksData() {
  return request("/api/landmarks", { method: "GET", timeout: 10000 });
}

export async function getLandmarksSummary() {
  return request("/api/landmarks/summary", { method: "GET", timeout: 8000 });
}

export async function getLandmarksByLabel(label) {
  return request(`/api/landmarks/label/${encodeURIComponent(label)}`, { method: "GET", timeout: 8000 });
}
