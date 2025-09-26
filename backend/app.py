from flask import Flask, request, jsonify
from flask_cors import CORS
import os, csv
import pandas as pd
from ml.trainer import train_model, load_model
from ml.predictor import predict_landmark

app = Flask(__name__)
# Permitir múltiples URLs de frontends
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",       # frontend local
    "https://senias-main-front.onrender.com",   # frontend de main en Render
    "https://senias-jordy-front.onrender.com",  # frontend de jordy
    "https://senias-edu-front.onrender.com",    # frontend de edu
    "https://senias-rodrigo-front.onrender.com",# frontend de rodrigo 
    "https://senias-sebas-frontend.onrender.com",#frontend de sebas 
    "https://senias-jesus-front.onrender.com",  # frontend de jesús

]}})

DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "landmarks.csv")
MODEL_PATH = "model.pkl"

os.makedirs(DATA_DIR, exist_ok=True)

# 🔹 Crear archivo CSV si no existe
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, mode="w", newline="") as f:
        writer = csv.writer(f)
        # 21 puntos x 3 coordenadas = 63 features
        header = [f"f{i}" for i in range(63)] + ["label"]
        writer.writerow(header)

# Cargar modelo si existe
model = load_model()


# Guardar muestra

# 🔹 Ruta principal para verificar que el backend está corriendo
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🚀 Backend de Señas running successfully",
        "status": "active",
        "timestamp": pd.Timestamp.now().isoformat(),
        "endpoints": {
            "landmarks_data": "/api/landmarks",
            "progress": "/progress",
            "train": "/train",
            "predict": "/predict",
            "health": "/health"
        }
    })

# 🔹 Health check para Render
@app.route("/health", methods=["GET"])
def health_check():
    # Contar muestras totales
    total_samples = 0
    label_counts = {}
    try:
        with open(DATA_FILE, mode="r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                label = row["label"]
                label_counts[label] = label_counts.get(label, 0) + 1
                total_samples += 1
    except:
        pass
    
    return jsonify({
        "status": "healthy",
        "database_file_exists": os.path.exists(DATA_FILE),
        "model_loaded": model is not None,
        "statistics": {
            "total_samples": total_samples,
            "labels_count": len(label_counts),
            "samples_per_label": label_counts
        },
        "timestamp": pd.Timestamp.now().isoformat()
    })

# 🔹 API para obtener todos los landmarks en JSON
@app.route("/api/landmarks", methods=["GET"])
def get_landmarks():
    try:
        landmarks_data = []
        with open(DATA_FILE, mode="r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                landmarks_data.append(row)
        
        # Estadísticas adicionales
        label_counts = {}
        for row in landmarks_data:
            label = row["label"]
            label_counts[label] = label_counts.get(label, 0) + 1
        
        return jsonify({
            "success": True,
            "count": len(landmarks_data),
            "statistics": {
                "total_samples": len(landmarks_data),
                "labels_count": len(label_counts),
                "samples_per_label": label_counts
            },
            "data": landmarks_data
        })
    except Exception as e:
        return jsonify({"error": f"Error reading landmarks: {str(e)}"}), 500

# 🔹 API para obtener resumen estadístico
@app.route("/api/landmarks/summary", methods=["GET"])
def get_landmarks_summary():
    try:
        label_counts = {}
        total_samples = 0
        
        with open(DATA_FILE, mode="r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                label = row["label"]
                label_counts[label] = label_counts.get(label, 0) + 1
                total_samples += 1
        
        return jsonify({
            "success": True,
            "summary": {
                "total_samples": total_samples,
                "unique_labels": len(label_counts),
                "labels": label_counts
            }
        })
    except Exception as e:
        return jsonify({"error": f"Error reading summary: {str(e)}"}), 500

# 🔹 API para obtener muestras de una etiqueta específica
@app.route("/api/landmarks/label/<label_name>", methods=["GET"])
def get_landmarks_by_label(label_name):
    try:
        landmarks_data = []
        with open(DATA_FILE, mode="r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["label"] == label_name:
                    landmarks_data.append(row)
        
        return jsonify({
            "success": True,
            "label": label_name,
            "count": len(landmarks_data),
            "data": landmarks_data
        })
    except Exception as e:
        return jsonify({"error": f"Error reading landmarks for label {label_name}: {str(e)}"}), 500

# 🔹 API para descargar datos en formato estructurado
@app.route("/api/landmarks/export", methods=["GET"])
def export_landmarks():
    try:
        landmarks_data = []
        with open(DATA_FILE, mode="r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                landmarks_data.append(row)
        
        return jsonify({
            "success": True,
            "format": "json",
            "count": len(landmarks_data),
            "data": landmarks_data
        })
    except Exception as e:
        return jsonify({"error": f"Error exporting landmarks: {str(e)}"}), 500

# Tus rutas existentes (guardar, progress, train, predict, reset) se mantienen igual...
# [Mantén todo el código existente de estas rutas]

# Guardar muestra (existente)
@app.route("/save_landmark", methods=["POST"])
def save_landmark():
    data = request.json
    label = data.get("label")
    landmarks = data.get("landmarks")

    if not label or not landmarks:
        return jsonify({"error": "Etiqueta o landmarks faltantes"}), 400

    # Contar muestras existentes de esta etiqueta
    count = 0
    with open(DATA_FILE, mode="r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["label"] == label:
                count += 1

    if count >= 100:
        return jsonify({"message": f"❌ Ya tienes 100 muestras para '{label}'"}), 400

    # 🔹 Aplanar landmarks antes de guardar
    landmarks_flat = []
    for lm in landmarks:
        landmarks_flat.extend([lm["x"], lm["y"], lm["z"]])

    # Guardar nueva muestra
    with open(DATA_FILE, mode="a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(landmarks_flat + [label])

    return jsonify({"message": f"✅ Muestra guardada para '{label}'", "total": count + 1})

# Progreso (existente)
@app.route("/progress", methods=["GET"])
def progress():
    result = {}
    with open(DATA_FILE, mode="r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lbl = row["label"]
            result[lbl] = result.get(lbl, 0) + 1
    return jsonify(result)

# Entrenar (existente)
@app.route("/train", methods=["POST"])
def train():
    global model
    try:
        result = train_model(DATA_FILE, MODEL_PATH)
        model = load_model(MODEL_PATH)
        return jsonify({"message": "✅ Modelo entrenado", **result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Predecir (existente)
@app.route("/predict", methods=["POST"])
def predict():
    global model
    data = request.json
    landmarks = data.get("landmarks")

    if not landmarks:
        return jsonify({"error": "Faltan landmarks"}), 400

    if model is None:
        return jsonify({"error": "Modelo no entrenado aún"}), 400

    # 🔹 Aplanar landmarks para la predicción
    landmarks_flat = []
    for lm in landmarks:
        landmarks_flat.extend([lm["x"], lm["y"], lm["z"]])

    try:
        result = predict_landmark(model, landmarks_flat)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Resetear todo (existente)
@app.route("/reset", methods=["POST"])
def reset():
    global model
    try:
        # borrar dataset
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)
        with open(DATA_FILE, mode="w", newline="") as f:
            writer = csv.writer(f)
            header = [f"f{i}" for i in range(63)] + ["label"]
            writer.writerow(header)

        # borrar modelo
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)

        model = None
        return jsonify({"message": "🔄 Datos y modelo reseteados"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))