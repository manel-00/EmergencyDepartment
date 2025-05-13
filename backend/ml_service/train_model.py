import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib
import json
import os

# Load dataset
csv_path = 'backend/ml_service/Disease_symptom_and_patient_profile_dataset.csv'
df = pd.read_csv(csv_path)

# Ensure all expected columns are present
required_columns = [
    'Disease', 'Fever', 'Cough', 'Fatigue', 'Difficulty Breathing',
    'Age', 'Gender', 'Blood Pressure', 'Cholesterol Level', 'Outcome Variable'
]
missing = [col for col in required_columns if col not in df.columns]
if missing:
    raise ValueError(f"Missing columns in CSV: {missing}")

# Map Yes/No to 1/0
binary_cols = ['Fever', 'Cough', 'Fatigue', 'Difficulty Breathing']
for col in binary_cols:
    df[col] = df[col].map({'Yes': 1, 'No': 0})

# Map Blood Pressure and Cholesterol Level
df['Blood Pressure'] = df['Blood Pressure'].map({'Low': 0, 'Normal': 1, 'High': 2})
df['Cholesterol Level'] = df['Cholesterol Level'].map({'Normal': 1, 'High': 0})

# Label encoding for categorical features
disease_encoder = LabelEncoder()
gender_encoder = LabelEncoder()

df['Disease'] = disease_encoder.fit_transform(df['Disease'])
df['Gender'] = gender_encoder.fit_transform(df['Gender'])

# Encode target
y = df['Outcome Variable'].map({'Negative': 0, 'Positive': 1})

# Features
X = df.drop('Outcome Variable', axis=1)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'model_rf.pkl')

# Save encoders
with open('disease_encoder.json', 'w') as f:
    json.dump(dict(zip(disease_encoder.classes_, disease_encoder.transform(disease_encoder.classes_))), f)

with open('gender_encoder.json', 'w') as f:
    json.dump(dict(zip(gender_encoder.classes_, gender_encoder.transform(gender_encoder.classes_))), f)

print("Model and encoders trained on CSV and saved successfully.")
