def predict_landmark(model, landmarks):
    """
    landmarks: lista con 126 floats (2 manos * 21 puntos * 3 coords).
    Si solo hay 1 mano, se rellena con 0s.
    """
    if not model:
        return {"error": "Modelo no cargado"}

def predict_landmark(model, landmarks):
    """
    landmarks: lista con 126 floats (2 manos * 21 puntos * 3 coords).
    Si solo hay 1 mano, se rellena con 0s.
    
    CORRECCIÓN CLAVE: Se fuerza la conversión de tipos NumPy a tipos Python (str, float) 
    para evitar el error 'int64 is not JSON serializable'.
    """
    if not model:
        return {"error": "Modelo no cargado"}

    if len(landmarks) != 126:
        return {"error": f"Se esperaban 126 valores, recibidos {len(landmarks)}"}

    # La predicción devuelve un array, tomamos el primer (y único) elemento
    prediction_result = model.predict([landmarks])[0]
    proba = model.predict_proba([landmarks])[0]

    confidence = max(proba)

    return {
        # 🎯 CONVERSIÓN: La etiqueta predicha (ej. 'A', '5') se convierte a string de Python.
        "prediction": str(prediction_result),  
        
        # 🎯 CONVERSIÓN: La confianza (numpy.float64) se convierte a float de Python.
        "confidence": float(confidence)        
    }

    prediction = model.predict([landmarks])[0]
    proba = model.predict_proba([landmarks])[0]

    confidence = max(proba)

    return {
        "prediction": prediction,
        "confidence": float(confidence)
    }
