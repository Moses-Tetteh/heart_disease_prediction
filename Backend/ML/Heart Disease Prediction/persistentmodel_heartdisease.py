import pickle
import numpy as np
import os
import sys
import traceback
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

def main():
    try:
        # Determine the directory where this script lives
        script_dir = os.path.dirname(os.path.abspath(__file__))

        # 1) Check for exactly 13 feature arguments
        if len(sys.argv) != 14:
            print("Error: Input must contain exactly 13 features.", file=sys.stderr)
            sys.exit(1)

        # 2) Parse inputs as floats
        try:
            user_input = [float(x) for x in sys.argv[1:]]
        except ValueError as e:
            print(f"Error: All input features must be numeric. {e}", file=sys.stderr)
            sys.exit(1)

        # 3) Validate that sex (index 1), fbs (index 5), exang (index 8) are 0 or 1
        for idx, name in ((1, "sex"), (5, "fbs"), (8, "exang")):
            if user_input[idx] not in (0.0, 1.0):
                print(f"Error: {name} must be 0 or 1.", file=sys.stderr)
                sys.exit(1)

        features = np.array([user_input], dtype=float)

        # 4) Optionally load and apply scaler
        scaler_path = os.path.join(script_dir, "scaler.pkl")
        if os.path.exists(scaler_path):
            try:
                with open(scaler_path, "rb") as f:
                    scaler = pickle.load(f)
                features = scaler.transform(features)
            except Exception as e:
                print(f"Error loading or applying scaler: {e}", file=sys.stderr)
                traceback.print_exc(file=sys.stderr)
                sys.exit(1)

        # 5) Load the pickled model
        model_path = os.path.join(script_dir, "heart_disease.pkl")
        if not os.path.exists(model_path):
            print(f"Error: Model file not found at {model_path}", file=sys.stderr)
            sys.exit(1)

        try:
            with open(model_path, "rb") as file:
                model = pickle.load(file)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            sys.exit(1)

        # 6) Run prediction
        try:
            prediction = model.predict(features)
            label = prediction[0]
            if label == 0:
                print("The person is NOT suffering from Heart Disease")
            else:
                print("The person IS suffering from Heart Disease")
        except Exception as e:
            print(f"Prediction failed: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            sys.exit(1)

    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
