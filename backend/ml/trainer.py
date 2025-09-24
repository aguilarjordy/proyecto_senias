import os
import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

DATA_DIR = "data"
MODEL_PATH = "model.pkl"

def train_model():
    X, y = [], []

    # Cargar datos
    for file in os.listdir(DATA_DIR):
        if file.endswith(".json"):
            label = file.replace(".json", "")
            with open(os.path.join(DATA_DIR, file), "r") as f:
                samples = json.load(f)
            for s in samples:
                X.append(np.array(s).flatten())
                y.append(label)

    if not X:
        raise ValueError("No hay datos para entrenar")

    X = np.array(X)
    y = np.array(y)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    acc = clf.score(X_test, y_test)

    joblib.dump(clf, MODEL_PATH)

    return {"accuracy": acc, "samples": len(y)}

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None
