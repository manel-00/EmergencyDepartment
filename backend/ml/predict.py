import sys
import joblib

# Vérifier que le message est bien passé en argument
if len(sys.argv) != 2:
    print("Erreur : Veuillez fournir un message.")
    sys.exit(1)

# Récupérer le message depuis les arguments de la ligne de commande
message = sys.argv[1]

# Charger le modèle (qui est un pipeline dans ce cas)
model = joblib.load("ml/classification_urgence_model.joblib")

# Faire la prédiction
prediction = model.predict([message])

# Afficher le résultat en UTF-8
print( prediction[0])
