import pandas as pd
from flask import Flask, request, jsonify
import joblib
import os
from sklearn.preprocessing import LabelEncoder
from flask_cors import CORS  # Import CORS

# Load the trained model
model_path = os.path.join(os.getcwd(), 'backend', 'ml_service', 'mortality.pkl')
model = joblib.load(model_path)

# Load the label encoders (you can save them if needed)
label_encoders = {}

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all domains (or restrict it to a specific domain, see below)
CORS(app)

# Binary mapping (from your original code)
binary_map = {'Yes': 1, 'No': 0, 'Low': 0, 'Normal': 1, 'High': 2}

# Helper function to process input data for prediction
def prepare_patient_data(patient_data):
    patient_df = pd.DataFrame([patient_data])

    # Apply binary mapping to binary columns
    for col in patient_df.columns:
        if col in binary_map:
            patient_df[col] = patient_df[col].map(binary_map)

    # Apply label encoding for categorical features
    for col, le in label_encoders.items():
        if col in patient_df.columns:
            patient_df[col] = le.transform([patient_df[col].values[0]])

    # Ensure data types are numeric
    patient_df = patient_df.apply(pd.to_numeric, errors='coerce')
    patient_df = patient_df.fillna(patient_df.mean())  # Fill missing values with column mean

    return patient_df

# Define the prediction endpoint
@app.route('/predict', methods=['POST'])
def predict_mortality():
    patient_data = request.json  # Get the patient data from the POST request
    
    # Prepare the data and make prediction
    patient_df = prepare_patient_data(patient_data)
    prob = model.predict_proba(patient_df)[0][1]  # Probability of mortality (Positive class)
    
    return jsonify({'mortality_chance': f"{prob * 100:.1f}%"})

if __name__ == '__main__':
    app.run(debug=True)
