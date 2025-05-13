import pandas as pd
from flask import Flask, request, jsonify
import joblib
import os
from sklearn.preprocessing import LabelEncoder
from flask_cors import CORS  # Import CORS

#forecasting imports
import matplotlib.pyplot as plt
from io import BytesIO
import base64


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

#forecasting
@app.route('/resourceforecast', methods=['POST'])
def forecast():
    data = request.json

    # Parse input
    current_stock = int(data['current_stock'])
    usage_per_hour = int(data['usage_per_hour'])
    incoming_supply = int(data['incoming_supply'])
    supply_arrival_time = int(data['supply_arrival_time'])
    forecast_duration = int(data['forecast_duration'])
    low_threshold = 10  # Critical stock level

    stock_levels = []
    times = []
    stock = current_stock

    for hour in range(forecast_duration + 1):
        if hour == supply_arrival_time:
            stock += incoming_supply
        stock -= usage_per_hour
        stock = max(stock, 0)
        stock_levels.append(stock)
        times.append(hour)
        if stock == 0:
            break

    run_out_hour = next((i for i, s in enumerate(stock_levels) if s == 0), None)

    # Plot graph
    colors = ['red' if s <= low_threshold else 'blue' for s in stock_levels]
    plt.figure(figsize=(8, 4))
    plt.bar(times, stock_levels, color=colors)
    plt.axhline(y=low_threshold, color='orange', linestyle='--', label='Critical Threshold')
    plt.title("Resource Stock Forecast")
    plt.xlabel("Hour")
    plt.ylabel("Stock Level")
    plt.legend()
    plt.tight_layout()

    # Convert graph to base64
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()

    return jsonify({
        'stock_levels': stock_levels,
        'run_out_hour': run_out_hour,
        'graph_base64': img_base64
    })



if __name__ == '__main__':
    app.run(debug=True)


