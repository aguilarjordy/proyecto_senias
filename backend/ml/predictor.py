def predict_landmark(model, landmarks):
    """
    landmarks: lista con 126 floats (2 manos * 21 puntos * 3 coords).
    Si solo hay 1 mano, se rellena con 0s.
    """
    if not model:
        return {"error": "Modelo no cargado"}

    if len(landmarks) != 126:
        return {"error": f"Se esperaban 126 valores, recibidos {len(landmarks)}"}

    prediction = model.predict([landmarks])[0]
    proba = model.predict_proba([landmarks])[0]

    confidence = max(proba)

    return {
        "prediction": prediction,
        "confidence": float(confidence)
    }
