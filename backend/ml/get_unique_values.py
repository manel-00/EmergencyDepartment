import pandas as pd

df = pd.read_csv("ml/Disease_symptom_and_patient_profile_dataset.csv")

columns_to_check = [col for col in df.columns if col != 'Age']

choices = {}

for col in columns_to_check:
    unique_values = df[col].dropna().unique().tolist()
    unique_values = [str(val) for val in unique_values]
    choices[col] = sorted(unique_values)

import json
print(json.dumps(choices, indent=4))