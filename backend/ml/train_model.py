import pandas as pd
import re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import make_pipeline
import joblib

# Lire le fichier CSV contenant les messages et les labels avec un encodage UTF-8
df = pd.read_csv('C:\\Users\\user\\Desktop\\EmergencyDepartment\\backend\\ml\\dataset_urgences_synthetique.csv', encoding='utf-8')  # Retirer 'sep' pour voir si le séparateur est correctement détecté

# Nettoyer les noms des colonnes (espaces et caractères invisibles)
df.columns = df.columns.str.strip()  # Enlève les espaces au début et à la fin des noms de colonnes

# Vérifier les noms des colonnes et afficher les premières lignes pour vérifier le contenu
print("Noms des colonnes :")
print(df.columns)

print("\nPremières lignes du fichier avant nettoyage :")
print(df.head())

# Vérifier si la colonne 'message' existe
if 'message' in df.columns and 'categorie' in df.columns:
    
    # Fonction de prétraitement pour nettoyer les messages
    def preprocess(text):
        # Supprimer les caractères spéciaux
        text = re.sub(r'[^\w\s]', '', text)
        # Supprimer les accents si nécessaire
        text = re.sub(r'[éèêë]', 'e', text)  # Exemple pour les accents français
        # Mettre en minuscule
        text = text.lower()  
        return text

    # Appliquer le prétraitement à chaque message
    corpus = [preprocess(msg) for msg in df['message'].tolist()]

    # Vérifier les résultats après prétraitement
    print("\nPremières lignes après prétraitement :")
    print(corpus[:5])  # Afficher les 5 premières lignes traitées

    # Utiliser 'categorie' pour les labels
    labels = df['categorie'].tolist()  # Utiliser 'categorie' au lieu de 'label'

    # Créer un modèle avec CountVectorizer et LinearSVC
    model = make_pipeline(CountVectorizer(), LinearSVC())

    # Entraîner le modèle
    model.fit(corpus, labels)

    # Sauvegarder le modèle et le vectoriseur
    joblib.dump(model, 'ml/classification_urgence_model.joblib')  # Sauvegarde du modèle complet (avec vectoriseur)
    print("Modèle sauvegardé avec succès.")

    # Optionnel : sauvegarder le vectoriseur séparément
    vectorizer = model.named_steps['countvectorizer']  # Récupérer le vectoriseur du pipeline
    joblib.dump(vectorizer, 'ml/vectorizer.joblib')  # Sauvegarder le vectoriseur séparément
    print("Vectoriseur sauvegardé avec succès.")
else:
    print("La colonne 'message' ou 'categorie' n'existe pas dans le fichier CSV.")
