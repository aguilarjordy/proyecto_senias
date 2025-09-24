from flask import Flask, request, jsonify
from flask_cors import CORS
import os, csv
from ml.trainer import train_model, load_model
from ml.predictor import predict_landmark

app = Flask(__name__)
# Permitir múltiples URLs de frontends
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",       # frontend local
    "https://senias-main-front.onrender.com"  # frontend de main en Render 
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

# Progreso
@app.route("/progress", methods=["GET"])
def progress():
    result = {}
    with open(DATA_FILE, mode="r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lbl = row["label"]
            result[lbl] = result.get(lbl, 0) + 1
    return jsonify(result)

# Entrenar
@app.route("/train", methods=["POST"])
def train():
    global model
    try:
        result = train_model(DATA_FILE, MODEL_PATH)
        model = load_model(MODEL_PATH)
        return jsonify({"message": "✅ Modelo entrenado", **result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Predecir
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

# Resetear todo
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
