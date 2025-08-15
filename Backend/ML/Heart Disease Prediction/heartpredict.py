import sys
import os
import numpy as np
import warnings
from tensorflow.keras.models import load_model
import joblib
import traceback

def feature_create(*args):
    """
    Given 13 numerical inputs, stack them into a 2D array of shape (1, 13).
    """
    features = np.array([args], dtype=float)
    return features

def validate_input(values):
    """
    values is a list of 13 floats:
      index 0: age
      index 1: sex        → must be 0 or 1
      index 2: cp
      index 3: trestbps
      index 4: chol
      index 5: fbs        → must be 0 or 1
      index 6: restecg
      index 7: thalach
      index 8: exang      → must be 0 or 1
      index 9: oldpeak
      index 10: slope
      index 11: ca
      index 12: thal
    """
    if not (0 <= values[1] <= 1):
        raise ValueError("Invalid value for sex: must be 0 or 1")
    if not (0 <= values[5] <= 1):
        raise ValueError("Invalid value for fbs: must be 0 or 1")
    if not (0 <= values[8] <= 1):
        raise ValueError("Invalid value for exang: must be 0 or 1")

def main():
    # Expect exactly 13 features after the script name (i.e. sys.argv has length 14)
    if len(sys.argv) != 14:
        print("Error: Expected 13 feature arguments", file=sys.stderr)
        sys.exit(1)

    # Silence TensorFlow warnings
    warnings.filterwarnings("ignore", category=UserWarning)
    warnings.filterwarnings("ignore", category=FutureWarning)
    warnings.filterwarnings("ignore", category=DeprecationWarning)

    # Determine the folder where this script lives:
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Build full paths to the two files that must reside alongside this script:
    model_path  = os.path.join(script_dir, 'heart_disease_model.h5')
    scaler_path = os.path.join(script_dir, 'scaler.pkl')

    # 1) Parse and validate command-line inputs
    try:
        # Convert each of the 13 strings into a float
        values = [float(x) for x in sys.argv[1:]]
        validate_input(values)
    except Exception as e:
        print(f"Input validation error: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

    # 2) Load scaler.pkl and heart_disease_model.h5
    try:
        scaler = joblib.load(scaler_path)
    except Exception as e:
        print(f"Error loading scaler.pkl: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

    try:
        model = load_model(model_path)
    except Exception as e:
        print(f"Error loading heart_disease_model.h5: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

    # 3) Transform the features and run prediction
    try:
        features = feature_create(*values)       # shape (1, 13)
        features_scaled = scaler.transform(features)
    except Exception as e:
        print(f"Error processing features: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

    try:
        prob = model.predict(features_scaled)[0][0]
        prediction = int(prob > 0.5)
        print(f"Prediction: {prediction}, Probability: {prob:.2f}")
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
