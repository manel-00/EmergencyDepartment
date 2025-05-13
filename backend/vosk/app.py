import pandas as pd
from flask import Flask, request, jsonify
import joblib
import os
from sklearn.preprocessing import LabelEncoder
from flask_cors import CORS
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from vosk import Model as VoskModel, KaldiRecognizer
import wave
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3001", "http://localhost:3002"])

# Load ML model
model_path = os.path.join(os.getcwd(), 'backend', 'vosk', 'mortality.pkl')
model = joblib.load('mortality.pkl')


# Label encoders (empty, update if needed)
label_encoders = {}

# Binary mapping
binary_map = {'Yes': 1, 'No': 0, 'Low': 0, 'Normal': 1, 'High': 2}

# ========== Routes ==========

@app.route('/predict', methods=['POST'])
def predict_mortality():
    try:
        patient_data = request.json
        print("Received data:", patient_data)

        patient_df = pd.DataFrame([patient_data])

        # Apply binary mapping
        for col in patient_df.columns:
            if col in binary_map:
                patient_df[col] = patient_df[col].map(binary_map)

        # Label encoding
        for col, le in label_encoders.items():
            if col in patient_df.columns:
                patient_df[col] = le.transform([patient_df[col].values[0]])

        patient_df = patient_df.apply(pd.to_numeric, errors='coerce')
        patient_df = patient_df.fillna(patient_df.mean())

        print("Prepared DataFrame:", patient_df)

        prob = model.predict_proba(patient_df)[0][1]
        return jsonify({'mortality_chance': f"{prob * 100:.1f}%"})
    
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({'error': 'An error occurred while making the prediction'}), 500


@app.route('/resourceforecast', methods=['POST'])
def forecast():
    data = request.json
    current_stock = int(data['current_stock'])
    usage_per_hour = int(data['usage_per_hour'])
    incoming_supply = int(data['incoming_supply'])
    supply_arrival_time = int(data['supply_arrival_time'])
    forecast_duration = int(data['forecast_duration'])
    low_threshold = 10

    stock_levels, times = [], []
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
    colors = ['red' if s <= low_threshold else 'blue' for s in stock_levels]

    plt.figure(figsize=(8, 4))
    plt.bar(times, stock_levels, color=colors)
    plt.axhline(y=low_threshold, color='orange', linestyle='--', label='Critical Threshold')
    plt.title("Resource Stock Forecast")
    plt.xlabel("Hour")
    plt.ylabel("Stock Level")
    plt.legend()
    plt.tight_layout()

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


@app.route('/transcribe', methods=['GET'])
def transcribe_audio():
    model_path = "model/vosk-model-small-en-us-0.15"
    audio_path = "your_audio3.wav"

    if not os.path.exists(model_path):
        return jsonify({'error': 'Vosk model not found'}), 500
    if not os.path.exists(audio_path):
        return jsonify({'error': 'Audio file not found'}), 400

    model = VoskModel(model_path)
    wf = wave.open(audio_path, "rb")

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        return jsonify({'error': 'Audio must be mono, 16-bit, 16kHz WAV format.'}), 400

    rec = KaldiRecognizer(model, wf.getframerate())
    result = ""

    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            result += res.get("text", "") + " "

    final_result = json.loads(rec.FinalResult())
    result += final_result.get("text", "")

    if result.strip():
        return jsonify({'transcript': result.strip()})
    else:
        return jsonify({'error': 'No speech detected or failed to recognize speech.'}), 204


if __name__ == '__main__':
    app.run(debug=True)
