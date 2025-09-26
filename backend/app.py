# app.py - Adaptado para soportar dinámicamente 1 o 2 manos (63 o 126 landmarks)
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
from ml.trainer import train_model, load_model
from ml.predictor import predict_landmark
from ml.data_manager import DataManager  # Clase para gestionar CSV y dataset

# Inicialización Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:5173",
        "https://senias-main-front.onrender.com",
        "https://senias-jordy-front.onrender.com",
        "https://senias-edu-front.onrender.com",
        "https://senias-rodrigo-front.onrender.com",
        "https://senias-sebas-frontend.onrender.com",
        "https://senias-jesus-front.onrender.com"
    ],
    "supports_credentials": True
}})

# Paths principales
DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "landmarks.csv")
MODEL_PATH = "model.pkl"

# Inicializar DataManager y modelo
data_manager = DataManager(DATA_FILE)
model = load_model(MODEL_PATH)


# ==========================
#   ENDPOINTS
# ==========================

@app.route("/save_landmark", methods=["POST"])
def save_landmark():
    """
    Recibe landmarks de 1 o 2 manos.
    - 1 mano = 21 puntos * 3 coords = 63 valores.
    - 2 manos = 126 valores.
    Siempre se normaliza a 126 valores (si falta, se rellena con 0s).
    """
    try:
        data = request.json
        label = data.get("label")
        landmarks = data.get("landmarks")

        if not label or not landmarks:
            return jsonify({"error": "Etiqueta o landmarks faltantes"}), 400

        all_landmarks_flat = []
        for hand in landmarks[:2]:  # máximo 2 manos
            for lm in hand:
                # 🔹 Aseguramos que existan las keys x,y,z
                if not all(k in lm for k in ("x", "y", "z")):
                    return jsonify({
                        "error": f"Landmark inválido: {lm}"
                    }), 400
                all_landmarks_flat.extend([lm["x"], lm["y"], lm["z"]])

        # 🔹 Rellenar si hay menos de 2 manos
        while len(all_landmarks_flat) < 126:
            all_landmarks_flat.append(0.0)

        # 🔹 Guardar
        result = data_manager.save_landmark(label, all_landmarks_flat)
        if "error" in result:
            return jsonify(result), 500
        return jsonify(result)

    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "trace": traceback.format_exc()
        }), 500



@app.route("/progress", methods=["GET"])
def progress():
    """Devuelve el progreso (conteo de muestras por etiqueta)."""
    result = data_manager.get_progress()
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)


@app.route("/train", methods=["POST"])
def train():
    """Entrena un nuevo modelo con los datos actuales."""
    global model
    try:
        result = train_model(DATA_FILE, MODEL_PATH)
        model = load_model(MODEL_PATH)
        return jsonify({"message": "✅ Modelo entrenado", **result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict", methods=["POST"])
def predict():
    """
    Recibe landmarks de 1 o 2 manos y predice la clase.
    """
    global model
    data = request.json
    landmarks = data.get("landmarks")

    if not landmarks:
        return jsonify({"error": "Faltan landmarks"}), 400

    if model is None:
        return jsonify({"error": "Modelo no entrenado aún"}), 400

    all_landmarks_flat = []
    for hand in landmarks[:2]:
        for lm in hand:
            all_landmarks_flat.extend([lm["x"], lm["y"], lm["z"]])

    while len(all_landmarks_flat) < 126:
        all_landmarks_flat.append(0.0)

    try:
        result = predict_landmark(model, all_landmarks_flat)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/reset", methods=["POST"])
def reset():
    """
    Reinicia los datos y el modelo.
    """
    global model
    try:
        result = data_manager.reset_data()
        if "error" in result:
            return jsonify(result), 500

        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)

        model = None
        return jsonify({"message": "🔄 Datos y modelo reseteados"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "Mensaje": "🚀 Backend de Señas iniciado correctamente",
        "Estado": "Activo",
        "timestamp": pd.Timestamp.now().isoformat(),
        "endpoints": {
            "guardar_landmarks": "/save_landmark",
            "progreso": "/progress",
            "entrenamiento": "/train",
            "prediccion": "/predict",
            "resetear": "/reset",
            "health": "/health",
            "landmarks_data": "/api/landmarks"
        }
    })


@app.route("/health", methods=["GET"])
def health_check():
    """Revisa estado del backend, dataset y modelo."""
    progress_data = data_manager.get_progress()
    return jsonify({
        "status": "healthy",
        "database_file_exists": os.path.exists(DATA_FILE),
        "model_loaded": model is not None,
        "statistics": {
            "total_samples": sum(progress_data.values()) if isinstance(progress_data, dict) else 0,
            "labels_count": len(progress_data) if isinstance(progress_data, dict) else 0,
            "samples_per_label": progress_data if isinstance(progress_data, dict) else {}
        },
        "timestamp": pd.Timestamp.now().isoformat()
    })


# ==========================
#   EXTRA: LANDMARKS DATA
# ==========================

@app.route("/api/landmarks", methods=["GET"])
def get_landmarks():
    result = data_manager.get_landmarks_data()
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)


@app.route("/api/landmarks/summary", methods=["GET"])
def get_landmarks_summary():
    result = data_manager.get_landmarks_summary()
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)


@app.route("/api/landmarks/label/<label_name>", methods=["GET"])
def get_landmarks_by_label(label_name):
    result = data_manager.get_landmarks_by_label(label_name)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)


# ==========================
#   MAIN
# ==========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
