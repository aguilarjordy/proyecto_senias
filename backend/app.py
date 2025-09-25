import os
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
from datetime import datetime

# --- Config ---
DATA_DIR = "storage"
DATA_FILE = os.path.join(DATA_DIR, "data.csv")
MODEL_FILE = os.path.join(DATA_DIR, "model.joblib")
ALLOWED_KEYS = None  # opcional: lista de keys esperadas en landmarks

os.makedirs(DATA_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app)

# Utilidades
def load_dataset():
    if not os.path.exists(DATA_FILE):
        return pd.DataFrame()  # vacío
    return pd.read_csv(DATA_FILE)

def save_dataset(df):
    df.to_csv(DATA_FILE, index=False)

def get_counts():
    df = load_dataset()
    if df.empty:
        return {}
    return df['label'].value_counts().to_dict()

def flatten_landmarks(landmarks):
    """
    landmarks: dict o lista con coordenadas/valores (ej: {x0:.., y0:.., z0:.., ...} o [[x,y,z],...])
    Retorna una lista plana de números.
    """
    # Intentar manejar formatos comunes
    if isinstance(landmarks, dict):
        # Orden estable: clave ordenada por nombre
        keys = sorted(landmarks.keys())
        vals = []
        for k in keys:
            v = landmarks[k]
            if isinstance(v, (list, tuple)):
                vals.extend([float(x) for x in v])
            else:
                vals.append(float(v))
        return vals
    if isinstance(landmarks, list):
        flat = []
        for item in landmarks:
            if isinstance(item, (list, tuple)):
                flat.extend([float(x) for x in item])
            elif isinstance(item, dict):
                # aplanar dict interno por orden de claves
                for kk in sorted(item.keys()):
                    flat.append(float(item[kk]))
            else:
                flat.append(float(item))
        return flat
    # fallback
    return [float(landmarks)]

# --- Endpoints ---

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat() + "Z"})

@app.route("/save_landmark", methods=["POST"])
def save_landmark():
    """
    Request JSON expected:
    {
      "label": "A",
      "landmarks": {...}  // cualquier estructura JSON con coords
    }
    Response:
    {
      "status": "ok",
      "message": "...",
      "total": 12
    }
    """
    payload = request.get_json(force=True)
    label = payload.get("label")
    landmarks = payload.get("landmarks")
    if not label or landmarks is None:
        return jsonify({"status": "error", "message": "Falta 'label' o 'landmarks' en el cuerpo"}), 400

    try:
        flat = flatten_landmarks(landmarks)
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error al procesar landmarks: {e}"}), 400

    # cargar dataset actual
    df = load_dataset()
    # crear columna si dataset vacío => dinamically sized features
    if df.empty:
        # crear nombres de columnas f0,f1...
        cols = [f"f{i}" for i in range(len(flat))]
        cols.append("label")
        df = pd.DataFrame(columns=cols)

    # comprobar que el largo coincide
    expected_features = [c for c in df.columns if c != "label"]
    if len(flat) != len(expected_features):
        # si dataset vacío o mismatch, permitir adaptación si vacío; si no, devolver error
        if len(expected_features) == 0:
            # rellenar DF con tamaño de flat
            cols = [f"f{i}" for i in range(len(flat))] + ["label"]
            df = pd.DataFrame(columns=cols)
            expected_features = [c for c in df.columns if c != "label"]
        else:
            return jsonify({
                "status": "error",
                "message": f"Dimensiones diferentes: se esperaban {len(expected_features)} features, llegaron {len(flat)}"
            }), 400

    # crear fila
    row = {f"f{i}": flat[i] for i in range(len(flat))}
    row["label"] = str(label)
    df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)

    save_dataset(df)
    counts = get_counts()
    total_for_label = counts.get(str(label), 0)
    return jsonify({"status": "ok", "message": "Muestra guardada", "total": int(total_for_label)})

@app.route("/progress", methods=["GET"])
def progress():
    counts = get_counts()
    return jsonify(counts)

@app.route("/train", methods=["POST"])
def train():
    """
    Entrena un RF con los datos actuales y guarda el modelo.
    Request: puede incluir parámetros opcionales (ej: test_size)
    """
    df = load_dataset()
    if df.empty or "label" not in df.columns:
        return jsonify({"status": "error", "message": "No hay datos suficientes para entrenar"}), 400

    # preparar X,y
    X = df[[c for c in df.columns if c != "label"]].astype(float).values
    y = df["label"].astype(str).values

    # params soportados opcionalmente
    body = request.get_json(silent=True) or {}
    test_size = float(body.get("test_size", 0.2))
    random_state = int(body.get("random_state", 42))

    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)
    except Exception:
        # fallback sin stratify si clases pequeñas
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)

    # Entrenamiento: RandomForest (rápido, robusto)
    clf = RandomForestClassifier(n_estimators=150, random_state=random_state)
    clf.fit(X_train, y_train)

    # evaluar
    y_pred = clf.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))

    # guardar modelo
    joblib.dump(clf, MODEL_FILE)

    return jsonify({
        "status": "ok",
        "message": "Entrenamiento completado",
        "accuracy": acc,
        "samples": int(len(df))
    })

@app.route("/predict", methods=["POST"])
def predict_route():
    """
    Request:
      { "landmarks": ... }
    Response:
      { "status":"ok", "prediction":"A", "confidence":0.87 }
    """
    payload = request.get_json(force=True)
    landmarks = payload.get("landmarks")
    if landmarks is None:
        return jsonify({"status": "error", "message": "Faltan landmarks"}), 400
    if not os.path.exists(MODEL_FILE):
        return jsonify({"status": "error", "message": "No hay modelo entrenado"}), 400

    try:
        flat = flatten_landmarks(landmarks)
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error al procesar landmarks: {e}"}), 400

    clf = joblib.load(MODEL_FILE)
    # verificar shape: si features mismatches, devolver error
    n_features_model = clf.n_features_in_
    if len(flat) != n_features_model:
        return jsonify({
            "status": "error",
            "message": f"Dimensiones incorrectas para el modelo (se esperan {n_features_model} features, llegaron {len(flat)})"
        }), 400

    X = np.array(flat).reshape(1, -1)
    preds = clf.predict_proba(X) if hasattr(clf, "predict_proba") else None
    pred = clf.predict(X)[0]
    confidence = None
    if preds is not None:
        # tomar probabilidad de la clase predicha
        classes = clf.classes_
        idx = list(classes).index(pred)
        confidence = float(preds[0][idx])
    else:
        confidence = 1.0

    return jsonify({
        "status": "ok",
        "prediction": str(pred),
        "confidence": float(confidence)
    })

@app.route("/reset", methods=["POST"])
def reset():
    # eliminar archivos
    try:
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)
        if os.path.exists(MODEL_FILE):
            os.remove(MODEL_FILE)
        return jsonify({"status": "ok", "message": "Datos y modelo reseteados"})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error al resetear: {e}"}), 500

# Endpoint opcional para descargar dataset / modelo (útil en desarrollo)
@app.route("/download/data", methods=["GET"])
def download_data():
    if not os.path.exists(DATA_FILE):
        return jsonify({"status":"error","message":"No hay dataset"}), 404
    return send_file(DATA_FILE, as_attachment=True)

@app.route("/download/model", methods=["GET"])
def download_model():
    if not os.path.exists(MODEL_FILE):
        return jsonify({"status":"error","message":"No hay modelo"}), 404
    return send_file(MODEL_FILE, as_attachment=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
