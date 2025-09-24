def predict_landmark(model, landmarks):
    """
    landmarks: lista con 63 floats (21 puntos * 3 coordenadas)
    """
    if not model:
        return {"error": "Modelo no cargado"}

    prediction = model.predict([landmarks])[0]
    proba = model.predict_proba([landmarks])[0]

    # probabilidad máxima y su clase
    confidence = max(proba)

    return {
        "prediction": prediction,
        "confidence": float(confidence)
    }
