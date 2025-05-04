import numpy as np
import pandas as pd
import sys
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# Chargement du dataset
df = pd.read_csv("ml/Disease_symptom_and_patient_profile_dataset.csv")

# Encodage des variables catégorielles
cols = df.columns
encoders = []
for i in cols:
    if i != 'Age':
        le = LabelEncoder()
        df[i] = df[i].astype(str)  # Convertir en chaîne de caractères pour éviter les erreurs
        df[i] = df[i].replace('Unknown', np.nan)  # Remplacer 'Unknown' par NaN (facultatif)
        le.fit(df[i].dropna())  # Entraîner l'encodeur sans 'Unknown' (qui sera géré séparément)
        df[i] = le.transform(df[i])  # Appliquer la transformation
        encoders.append(le)
    else:
        encoders.append(None)

# Préparation des données
x = df.iloc[:, :-1].values
y = df.iloc[:, -1].values
x_train, x_test, y_train, y_test = train_test_split(x, y, random_state=42, test_size=0.2)

# Entraînement du modèle
rfc = RandomForestClassifier(max_depth=60)
rfc.fit(x_train, y_train)

# Récupération des arguments de la ligne de commande
input_args = sys.argv[1:]

if not input_args:
    print("Aucun input reçu")
    sys.exit()

# Vérification du nombre d'arguments
expected_input_len = len(df.columns) - 1
print(f"Colonnes attendues : {df.columns[:-1]}")  # Affiche les colonnes attendues
print(f"Nombre d'arguments attendus: {expected_input_len}")
print(f"Nombre d'arguments reçus: {len(input_args)}")

if len(input_args) != expected_input_len:
    print(f"Erreur : {expected_input_len} valeurs attendues, {len(input_args)} reçues.")
    sys.exit()

# Création d’un dictionnaire d’entrée
input_dict = {}

for i, col in enumerate(df.columns[:-1]):
    if col == 'Age':
        try:
            input_dict[col] = [int(input_args[i])]
        except ValueError:
            print(f"Erreur : La valeur d'âge '{input_args[i]}' n'est pas un entier valide.")
            sys.exit()
    else:
        encoder = encoders[i]
        try:
            # Vérifier si la valeur est déjà dans les classes connues de l'encodeur
            if input_args[i] in encoder.classes_:
                input_dict[col] = [encoder.transform([input_args[i]])[0]]
            else:
                # Si la valeur n'est pas trouvée, utiliser 'Unknown' et le transformer
                print(f"Valeur inconnue pour {col}: {input_args[i]}. Utilisation de 'Unknown'.")
                # Remplacer par une valeur connue ou gérer comme 'Unknown'
                input_dict[col] = [encoder.transform(['Unknown'])[0]]  # Gérer les valeurs inconnues
        except ValueError:
            print(f"Erreur de transformation pour la valeur '{input_args[i]}' de la colonne '{col}'.")
            sys.exit()

# Affichage des classes uniques dans l'encodeur
for i, encoder in enumerate(encoders):
    if encoder:
        print(f"Classes disponibles pour la colonne '{df.columns[i]}': {encoder.classes_}")

print(f"Dictionnaire d'entrée : {input_dict}")

# Prédiction
input_df = pd.DataFrame(input_dict)
prediction = rfc.predict(input_df)[0]

# Décodage de la prédiction finale
target_encoder = encoders[-1]
prediction_label = target_encoder.inverse_transform([prediction])[0]

print(f"Prédiction : {prediction_label}")
