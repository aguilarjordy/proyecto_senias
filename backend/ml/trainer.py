import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

def train_model(data_file="data/landmarks.csv", model_path="model.pkl"):
    df = pd.read_csv(data_file)

    if df.empty or len(df) < 5:
        raise ValueError("No hay suficientes datos para entrenar")

    X = df.drop("label", axis=1).values
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    acc = clf.score(X_test, y_test)

    joblib.dump(clf, model_path)

    return {"accuracy": acc, "samples": len(df)}

def load_model(model_path="model.pkl"):
    try:
        return joblib.load(model_path)
    except:
        return None
