# app.py - VERSIÓN MEJORADA (sin cambiar mucho)
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, csv
import pandas as pd
from ml.trainer import train_model, load_model
from ml.predictor import predict_landmark
from ml.data_manager import DataManager  # 🔹 NUEVO

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [

    "http://localhost:5173",       # frontend local
    "https://senias-main-front.onrender.com",   # frontend de main en Render
    "https://senias-jordy-front.onrender.com",  # frontend de jordy
    "https://senias-edu-front.onrender.com",    # frontend de edu
    "https://senias-rodrigo-front.onrender.com",# frontend de rodrigo 
    "https://senias-sebas-frontend.onrender.com",#frontend de sebas 
    "https://senias-jesus-front.onrender.com"  # frontend de jesús

]}})

DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "landmarks.csv")
MODEL_PATH = "model.pkl"

# 🔹 NUEVO: Usar DataManager en lugar de código manual
data_manager = DataManager(DATA_FILE)
model = load_model()


# Guardar muestra

# 🔹 Ruta principal para verificar que el backend está corriendo
# === RUTAS PRINCIPALES (se mantienen igual) ===

@app.route("/save_landmark", methods=["POST"])
def save_landmark():
    data = request.json
    label = data.get("label")
    landmarks = data.get("landmarks")

    if not label or not landmarks:
        return jsonify({"error": "Etiqueta o landmarks faltantes"}), 400

    # Aplanar landmarks
    landmarks_flat = []
    for lm in landmarks:
        landmarks_flat.extend([lm["x"], lm["y"], lm["z"]])

    # 🔹 NUEVO: Usar DataManager
    result = data_manager.save_landmark(label, landmarks_flat)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)

@app.route("/progress", methods=["GET"])
def progress():
    # 🔹 NUEVO: Usar DataManager
    result = data_manager.get_progress()
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)

@app.route("/train", methods=["POST"])
def train():
    global model
    try:
        result = train_model(DATA_FILE, MODEL_PATH)
        model = load_model(MODEL_PATH)
        return jsonify({"message": "✅ Modelo entrenado", **result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST"])
def predict():
    global model
    data = request.json
    landmarks = data.get("landmarks")

    if not landmarks:
        return jsonify({"error": "Faltan landmarks"}), 400

    if model is None:
        return jsonify({"error": "Modelo no entrenado aún"}), 400

    landmarks_flat = []
    for lm in landmarks:
        landmarks_flat.extend([lm["x"], lm["y"], lm["z"]])

    try:
        result = predict_landmark(model, landmarks_flat)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reset", methods=["POST"])
def reset():
    global model
    try:
        # 🔹 NUEVO: Usar DataManager
        result = data_manager.reset_data()
        if "error" in result:
            return jsonify(result), 500

        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)

        model = None
        return jsonify({"message": "🔄 Datos y modelo reseteados"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === RUTAS NUEVAS PARA ADMINISTRACIÓN ===


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "Mensaje": "🚀 Backend de Señas iniciado correctamente",
        "Estado": "Activo",
        "timestamp": pd.Timestamp.now().isoformat(),
        "endpoints": {
            "landmarks_data": "/api/landmarks",
            "progreso": "/progress",
            "entrenamiento": "/train",
            "prediccion": "/predict",
            "health": "/health"
        }
    })

@app.route("/health", methods=["GET"])
def health_check():
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))