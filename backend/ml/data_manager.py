import os
import csv
import pandas as pd

class DataManager:
    def __init__(self, data_file):
        self.data_file = data_file
        self.data_dir = os.path.dirname(data_file)
        os.makedirs(self.data_dir, exist_ok=True)
        self._ensure_csv_valid()

    def _ensure_csv_valid(self):
        """Verificar que el CSV tenga 126 columnas, si no regenerar"""
        header = [f"f{i}" for i in range(126)] + ["label"]

        if not os.path.exists(self.data_file):
            # Crear nuevo si no existe
            with open(self.data_file, mode="w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(header)
            return

        # Verificar columnas
        try:
            df = pd.read_csv(self.data_file, nrows=0)  # solo cabecera
            if df.shape[1] != len(header):
                # Reemplazar con estructura correcta
                with open(self.data_file, mode="w", newline="") as f:
                    writer = csv.writer(f)
                    writer.writerow(header)
        except Exception:
            # Si está corrupto, regenerar
            with open(self.data_file, mode="w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(header)

    def get_landmarks_data(self):
        try:
            landmarks_data = []
            with open(self.data_file, mode="r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    landmarks_data.append(row)
            
            label_counts = {}
            for row in landmarks_data:
                label = row["label"]
                label_counts[label] = label_counts.get(label, 0) + 1
            
            return {
                "success": True,
                "count": len(landmarks_data),
                "statistics": {
                    "total_samples": len(landmarks_data),
                    "labels_count": len(label_counts),
                    "samples_per_label": label_counts
                },
                "data": landmarks_data
            }
        except Exception as e:
            return {"error": f"Error reading landmarks: {str(e)}"}

    def get_landmarks_summary(self):
        try:
            label_counts = {}
            total_samples = 0
            
            with open(self.data_file, mode="r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    label = row["label"]
                    label_counts[label] = label_counts.get(label, 0) + 1
                    total_samples += 1
            
            return {
                "success": True,
                "summary": {
                    "total_samples": total_samples,
                    "unique_labels": len(label_counts),
                    "labels": label_counts
                }
            }
        except Exception as e:
            return {"error": f"Error reading summary: {str(e)}"}

    def get_landmarks_by_label(self, label_name):
        try:
            landmarks_data = []
            with open(self.data_file, mode="r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row["label"] == label_name:
                        landmarks_data.append(row)
            
            return {
                "success": True,
                "label": label_name,
                "count": len(landmarks_data),
                "data": landmarks_data
            }
        except Exception as e:
            return {"error": f"Error reading landmarks for label {label_name}: {str(e)}"}

    def get_progress(self):
        try:
            result = {}
            with open(self.data_file, mode="r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    lbl = row["label"]
                    result[lbl] = result.get(lbl, 0) + 1
            return result
        except Exception as e:
            return {"error": str(e)}

    def save_landmark(self, label, landmarks_flat):
        """
        Guardar landmark (126 valores fijos).
        """
        try:
            if len(landmarks_flat) != 126:
                return {"error": f"Se esperaban 126 valores, recibidos {len(landmarks_flat)}"}

            count = 0
            with open(self.data_file, mode="r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row["label"] == label:
                        count += 1

            if count >= 100:
                return {"message": f"❌ Ya tienes 100 muestras para '{label}'"}

            with open(self.data_file, mode="a", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(landmarks_flat + [label])

            return {"message": f"✅ Muestra guardada para '{label}'", "total": count + 1}
        except Exception as e:
            return {"error": f"Error saving landmark: {str(e)}"}

    def reset_data(self):
        try:
            if os.path.exists(self.data_file):
                os.remove(self.data_file)
            self._ensure_csv_valid()
            return {"message": "✅ Datos reseteados"}
        except Exception as e:
            return {"error": f"Error resetting data: {str(e)}"}
