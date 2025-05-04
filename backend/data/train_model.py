import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import json
import os

# Sample dataset
data = {
    'Disease': ['Influenza', 'Common Cold', 'Eczema', 'Asthma'],
    'Fever': ['Yes', 'No', 'No', 'Yes'],
    'Cough': ['No', 'Yes', 'Yes', 'Yes'],
    'Fatigue': ['Yes', 'Yes', 'Yes', 'No'],
    'Difficulty Breathing': ['Yes', 'No', 'No', 'Yes'],
    'Age': [19, 25, 25, 25],
    'Gender': ['Female', 'Female', 'Female', 'Male'],
    'Blood Pressure': ['Low', 'Normal', 'Normal', 'Normal'],
    'Cholesterol Level': ['Normal', 'Normal', 'Normal', 'Normal'],
    'Outcome Variable': ['Positive', 'Negative', 'Negative', 'Positive']
}

df = pd.DataFrame(data)

# Convert categorical columns to numerical
df['Fever'] = df['Fever'].map({'Yes': 1, 'No': 0})
df['Cough'] = df['Cough'].map({'Yes': 1, 'No': 0})
df['Fatigue'] = df['Fatigue'].map({'Yes': 1, 'No': 0})
df['Difficulty Breathing'] = df['Difficulty Breathing'].map({'Yes': 1, 'No': 0})
df['Blood Pressure'] = df['Blood Pressure'].map({'Low': 0, 'Normal': 1})
df['Cholesterol Level'] = df['Cholesterol Level'].map({'Normal': 1, 'High': 0})

# Encode categorical columns (Disease and Gender)
disease_encoder = LabelEncoder()
gender_encoder = LabelEncoder()
df['Disease'] = disease_encoder.fit_transform(df['Disease'])
df['Gender'] = gender_encoder.fit_transform(df['Gender'])

# Encode Outcome Variable
y = df['Outcome Variable'].map({'Negative': 0, 'Positive': 1})

# Features (exclude the target column 'Outcome Variable')
X = df.drop('Outcome Variable', axis=1)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
model.fit(X_train, y_train)

# Save model
model.save_model('model.json')

# Save encoders
disease_mapping = dict(zip(disease_encoder.classes_, disease_encoder.transform(disease_encoder.classes_)))
gender_mapping = dict(zip(gender_encoder.classes_, gender_encoder.transform(gender_encoder.classes_)))

with open('disease_encoder.json', 'w') as f:
    json.dump(disease_mapping, f)

with open('gender_encoder.json', 'w') as f:
    json.dump(gender_mapping, f)

print("Model and encoders have been saved successfully!") 