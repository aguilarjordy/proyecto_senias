from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json, numpy as np
from ml.trainer import train_model, load_model
from ml.predictor import predict_landmark

app = Flask(__name__)
CORS(app)

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

model = load_model()

# Guardar muestra
@app.route("/save_landmark", methods=["POST"])
def save_landmark():
    data = request.json
    label = data.get("label")
    landmarks = data.get("landmarks")

    if not label or not landmarks:
        return jsonify({"error": "Etiqueta o landmarks faltantes"}), 400

    file_path = os.path.join(DATA_DIR, f"{label}.json")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            samples = json.load(f)
    else:
        samples = []

    if len(samples) >= 100:
        return jsonify({"message": f"❌ Ya tienes 100 muestras para '{label}'"}), 400

    samples.append(landmarks)

    with open(file_path, "w") as f:
        json.dump(samples, f)

    return jsonify({"message": f"✅ Muestra guardada para '{label}'", "total": len(samples)})

# Progreso
@app.route("/progress", methods=["GET"])
def progress():
    result = {}
    for file in os.listdir(DATA_DIR):
        if file.endswith(".json"):
            label = file.replace(".json", "")
            with open(os.path.join(DATA_DIR, file), "r") as f:
                samples = json.load(f)
            result[label] = len(samples)
    return jsonify(result)

# Entrenar modelo
@app.route("/train", methods=["POST"])
def train():
    global model
    try:
        result = train_model()
        model = load_model()
        return jsonify({"message": "✅ Modelo entrenado", **result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Predecir
@app.route("/predict", methods=["POST"])
def predict():
    global model
    data = request.json
    landmarks = data.get("landmarks")

    if not landmarks:
        return jsonify({"error": "Faltan landmarks"}), 400

    try:
        result = predict_landmark(model, landmarks)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
