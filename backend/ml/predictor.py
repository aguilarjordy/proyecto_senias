import numpy as np
import joblib
import os

MODEL_PATH = "model.pkl"

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

def predict_landmark(model, landmarks):
    if model is None:
        raise ValueError("El modelo no está entrenado")

    X = np.array(landmarks).flatten().reshape(1, -1)
    prediction = model.predict(X)[0]
    proba = model.predict_proba(X).max()

    return {"prediction": prediction, "confidence": float(proba)}
